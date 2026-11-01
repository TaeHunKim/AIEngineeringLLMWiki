---
order: 5
---

# Structured Output (구조화 출력)

## 개요

**Structured Output**은 모델의 출력을 downstream 프로그램이 해석할 수 있는 데이터 계약에 맞추는 방법이다. JSON은 serialization 형식, JSON Schema는 구조·타입 제약, Pydantic은 Python validation 도구다. 이들을 같은 종류의 출력 형식으로 취급하지 않는다.

## 세 가지 보장 구분

| 수준 | 확인하는 것 | 보장하지 않는 것 |
|---|---|---|
| 유효한 JSON | JSON parser가 읽을 수 있음 | 필수 key·타입·정답 여부 |
| Schema 준수 | 지원되는 schema 제약에 부합 | 값의 사실성·업무 규칙·실행 권한 |
| 의미적 검증 | source와 일치, 업무 invariant 만족 | 별도 검증 없이 자동 확보되지 않음 |

Prompt만으로 JSON을 요청하는 것과 API의 constrained generation은 다르다. JSON Mode도 JSON Schema 준수와 동일하지 않다. 모델이 만든 `confidence` 숫자는 calibration을 검증하기 전까지 정답 확률이 아니다.

## Provider별 계약

2026-11-01 공식 문서 확인 기준이다. 모델·endpoint·SDK 버전별 지원 조건을 고정하고, 요청을 보내기 전에 해당 모델의 지원 여부를 확인한다.

| Provider / API | 구조화 응답 | 별도로 처리할 것 |
|---|---|---|
| OpenAI Responses | `text.format`의 JSON Schema 또는 SDK `responses.parse(text_format=...)` | refusal, incomplete, schema subset |
| OpenAI Chat Completions | `response_format` | Responses와 request/response shape가 다름 |
| Anthropic Messages | `output_config.format` | stop reason, refusal, max tokens, 지원 schema 제약 |

Anthropic의 assistant prefilling은 schema 보장이 아니며 JSON structured outputs와 함께 사용할 수 없다. 예전 `output_format` beta 예제를 새 API에 그대로 적용하지 않는다. Strict tool input은 구조화된 최종 답변과 별개 기능이며, tool 호출은 [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]]에서 다룬다.

## OpenAI Responses 예제

Python 3.12, `openai==2.54.0`, `pydantic==2.14.2` 기준의 설명용 API 예제다. `OPENAI_API_KEY`와 Structured Outputs를 지원하는 `OPENAI_MODEL`이 필요하다. SDK 객체와 응답 분기는 mock으로 검증했으며 실제 API 호출은 실행하지 않았다.

```python
import os
from typing import Literal
from openai import OpenAI
from pydantic import BaseModel, ConfigDict

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    summary: str
    sentiment: Literal["positive", "negative", "neutral"]

# transport 오류와 SDK validation 예외는 호출 경계에서 별도 처리
client = OpenAI()
response = client.responses.parse(
    model=os.environ["OPENAI_MODEL"],
    input="Summarize and classify: The product works well.",
    text_format=AnalysisResult,
)

def read_analysis(response):
    if response.status != "completed":
        raise RuntimeError("Response did not complete")
    for item in response.output:
        if item.type == "message":
            for part in item.content:
                if part.type == "refusal":
                    raise ValueError("Model refused the request")
    if response.output_parsed is None:
        raise ValueError("No validated output")
    return response.output_parsed

result = read_analysis(response)
```

Refusal은 기대한 schema 대신 나타날 수 있다. 잘린 출력을 정규식으로 잘라 정상 JSON처럼 취급하지 않는다. Schema가 지원되지 않는 400 오류는 schema를 수정해야 하며 같은 요청을 반복해도 해결되지 않는다.

## 로컬 Validation 예제

다음은 `pydantic==2.14.2`에서 외부 API 없이 실행 가능하다. 입력의 `rating`이 정수 1~5인지 검사하고, 정상 입력은 `5`, 범위를 벗어난 입력은 `rejected`를 출력한다. 이 검사는 rating이 원문 리뷰에 맞는 값인지까지 확인하지 않는다.

```python
from pydantic import BaseModel, ConfigDict, Field, ValidationError

class ProductReview(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    product_name: str
    rating: int = Field(ge=1, le=5)

review = ProductReview.model_validate_json('{"product_name":"Keyboard","rating":5}')
print(review.rating)
try:
    ProductReview.model_validate_json('{"product_name":"Keyboard","rating":8}')
except ValidationError:
    print("rejected")
```

Pydantic의 local validator가 provider의 JSON Schema subset에 그대로 대응하는 것은 아니다. 서버 측 constrained generation 뒤에도 애플리케이션 validation을 수행한다. YAML을 사용할 경우에도 safe parser와 명시적 schema를 사용하고, 생성된 설정을 검증 없이 실행하지 않는다.

## 실패 처리와 Retry

| 실패 | 처리 원칙 |
|---|---|
| Refusal | 별도 상태로 반환; schema 오류로 숨기거나 무조건 재시도하지 않음 |
| Incomplete / token limit | 원인과 budget을 확인; 부분 JSON을 완성본으로 취급하지 않음 |
| Unsupported schema / parameter | schema·SDK·모델 호환성 수정 |
| 429 / 일시적 네트워크 오류 | 제한된 retry·backoff·deadline; 비용도 추적 |
| Local validation 실패 | 오류 종류를 제한해 repair 또는 사용자 확인; 전체 retry 횟수 제한 |
| Schema는 맞지만 사실이 틀림 | source 대조·업무 규칙 검증; 형식 retry만으로 해결하지 않음 |

Streaming 중에는 완성되지 않은 object를 최종 결과로 확정하지 않는다. Instructor 같은 wrapper는 validation·retry를 편하게 만들지만 provider 지원 범위나 사실성 검증 책임을 없애지는 않는다.

## 선택 기준과 경계

추출·분류 결과를 프로그램이 소비한다면 schema를 명시한다. 자연어 설명만 필요한 작업까지 과도하게 schema에 가두지 않는다. 필드가 없거나 근거가 부족할 때의 표현을 설계하고, schema를 채우려고 사실을 만들어내지 않는지 평가한다.

Tool Use는 **실행 요청**이고 Structured Output은 **출력 계약**이다. 인자 schema를 통과했더라도 권한 확인·승인·idempotency는 실행 애플리케이션의 책임이다. 분류 점수의 calibration은 [[AI/Engineering/Model_Engineering/Model_Types/Decision_Models|Decision_Models]]을 참조한다.

## AI Engineering에서의 역할

구조화 출력은 모델 결과와 소프트웨어 사이의 인터페이스를 명확하게 한다. Schema validation, 의미 검증, 실패 상태 처리를 함께 설계해야 신뢰할 수 있는 데이터 흐름이 된다.

## 관련 개념
[[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]] · [[AI/Engineering/Prompt_Engineering/Sampling_Controls|Sampling_Controls]] · [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]] · [[AI/Engineering/Model_Engineering/Model_Types/Decision_Models|Decision_Models]]

## 출처
- OpenAI, [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- Anthropic, [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- Pydantic, [Models](https://docs.pydantic.dev/latest/concepts/models/)
- Instructor, [Documentation](https://python.useinstructor.com)
