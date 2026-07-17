---
order: 5
---

# Structured Output (구조화 출력)

## 개요

**Structured Output**은 LLM의 출력을 JSON, YAML, Pydantic 등 미리 정의된 스키마에 맞게 생성하도록 제어하는 기법이다. LLM의 자유로운 텍스트 생성을 프로그래밍 가능한 구조적 데이터로 변환하여 다운스트림 애플리케이션과의 통합을 가능하게 한다.

## 왜 필요한가

```
❌ 비구조화 출력:
"사용자 이름은 홍길동이고 나이는 30세입니다. 
서울시 강남구에 거주하고 있어요."

✅ 구조화 출력 (JSON):
{
    "name": "홍길동",
    "age": 30,
    "address": {
        "city": "서울시",
        "district": "강남구"
    }
}
```

구조화 출력 없이는 LLM을 실제 애플리케이션에 통합하기 매우 어렵다.

## JSON 출력

### 프롬프트로 유도
```python
system_prompt = """
항상 다음 JSON 형식으로만 응답하세요:
{
    "intent": "string",
    "entities": [{"type": "string", "value": "string"}],
    "confidence": 0.0~1.0
}
"""
```

### JSON Mode (API 지원)
OpenAI, Anthropic 등 주요 API는 JSON 모드 제공:
```python
# OpenAI
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},
    messages=[...]
)

# Anthropic (prefilling 방식)
response = client.messages.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "분석해줘..."},
        {"role": "assistant", "content": "{"}  # JSON 시작 강제
    ]
)
```

## Structured Output with Schema (OpenAI 2024)

OpenAI의 Structured Outputs는 JSON Schema로 정확한 출력 형식 보장:
```python
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    summary: str
    key_points: list[str]
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[...],
    response_format=AnalysisResult,
)
result: AnalysisResult = response.choices[0].message.parsed
```

## Pydantic 통합

**Pydantic**은 Python의 데이터 검증 라이브러리. LLM 출력을 타입 안전하게 파싱:

```python
from pydantic import BaseModel, Field, validator
from typing import Optional

class ProductReview(BaseModel):
    product_name: str = Field(description="제품명")
    rating: int = Field(ge=1, le=5, description="1~5점 평점")
    pros: list[str] = Field(description="장점 목록")
    cons: list[str] = Field(description="단점 목록")
    summary: str = Field(max_length=200)
    
    @validator('rating')
    def rating_must_be_valid(cls, v):
        if v not in range(1, 6):
            raise ValueError('Rating must be 1-5')
        return v

# LangChain의 Pydantic 출력 파서
from langchain.output_parsers import PydanticOutputParser
parser = PydanticOutputParser(pydantic_object=ProductReview)
```

## YAML 출력

설정 파일, 문서 구조에 적합. 인간 가독성이 높음:
```yaml
# LLM이 생성하도록 유도하는 YAML 구조
task:
  title: 프로젝트 계획 수립
  subtasks:
    - id: 1
      description: 요구사항 분석
      duration: 3일
    - id: 2
      description: 아키텍처 설계
      duration: 5일
  priority: high
  deadline: 2024-12-31
```

## Function Calling / Tool Use와의 관계

구조화 출력의 특수 형태. LLM이 어떤 함수를 어떤 인자로 호출할지 결정:
```json
{
    "tool_name": "search_database",
    "parameters": {
        "query": "홍길동",
        "table": "users",
        "limit": 10
    }
}
```
→ [[Tool_Use_and_Function_Calling]] 참조

## Instructor 라이브러리

구조화 출력을 위한 Python 라이브러리. Pydantic과 LLM API를 자연스럽게 연결:
```python
import instructor
from anthropic import Anthropic

client = instructor.from_anthropic(Anthropic())

class UserProfile(BaseModel):
    name: str
    age: int
    interests: list[str]

profile = client.messages.create(
    model="claude-sonnet-4-6",
    response_model=UserProfile,
    messages=[{"role": "user", "content": "홍길동씨를 소개해줘..."}]
)
# profile은 자동으로 UserProfile 인스턴스
```

## 구조화 출력 실패 처리

LLM이 항상 완벽한 JSON을 생성한다고 보장할 수 없음:

```python
import json
from tenacity import retry, stop_after_attempt

@retry(stop=stop_after_attempt(3))
def get_structured_output(prompt: str) -> dict:
    response = llm.generate(prompt + "\n반드시 유효한 JSON으로 응답하세요.")
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # JSON 추출 시도
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise
```

## AI Engineering에서의 역할

구조화 출력은 LLM을 실제 소프트웨어 시스템에 통합하는 핵심 가교다. Information Extraction, NLU 파이프라인, Tool Use, Agent 시스템 모두 구조화 출력에 의존한다. 프로덕션 LLM 애플리케이션에서 구조화 출력 없이는 안정적인 시스템 구축이 거의 불가능하다.

## 관련 개념
[[Tool_Use_and_Function_Calling]] · [[Sampling_Controls]] · [[Guardrail_Engineering]]

## 출처
- OpenAI Structured Outputs 문서 — [platform.openai.com](https://platform.openai.com/docs/guides/structured-outputs)
- Instructor 라이브러리 — [python.useinstructor.com](https://python.useinstructor.com)
- Pydantic 공식 문서 — [docs.pydantic.dev](https://docs.pydantic.dev)
- Anthropic Tool Use 문서 — [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
