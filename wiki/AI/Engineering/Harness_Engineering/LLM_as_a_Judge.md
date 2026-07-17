---
order: 2
---

# LLM-as-a-Judge (LLM/Agent 기반 자동 평가)

## 개요

**LLM-as-a-Judge**는 사람이 직접 평가하는 대신 **강력한 LLM(판사 모델)**을 사용하여 다른 LLM의 출력을 자동으로 평가하는 패러다임이다. 인간 평가의 비용과 속도 문제를 해결하면서도 합리적인 평가 품질을 달성한다.

## 제창

- **저자**: Zheng et al. (2023)
- **논문**: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" — [arXiv:2306.05685](https://arxiv.org/pdf/2306.05685)
- **핵심 기여**: GPT-4를 판사로 사용 시 인간 평가자 간 합의(80%+)에 근접함을 보임

## MT-Bench

Zheng et al.이 도입한 멀티턴 QA 벤치마크:
- 8개 카테고리 × 10개 질문 = 80개 고품질 멀티턴 질문
- 수학, 추론, 코딩, 글쓰기, 롤플레이 등 포함
- GPT-4 판사 모델로 1~10점 평가

## 평가 방식

### 1. Single Output Grading (단일 평가)
한 응답을 절대 척도로 평가:
```python
grading_prompt = """
다음 응답을 1~10점으로 평가하세요. 각 항목을 고려하세요:
- 정확성 (30%)
- 완전성 (25%)
- 명확성 (25%)
- 도움이 되는 정도 (20%)

질문: {question}
응답: {response}

평가 이유:
점수 (1-10):
"""

score = judge_llm.invoke(grading_prompt)
```

### 2. Pairwise Comparison (쌍 비교)
두 응답을 비교하여 더 나은 것 선택:
```python
pairwise_prompt = """
다음 두 응답 중 어느 것이 더 좋은지 평가하세요.

질문: {question}
응답 A: {response_a}
응답 B: {response_b}

어느 응답이 더 낫고 왜 그런지 설명 후 "A 승", "B 승", "동점" 중 하나로 답하세요.

평가:
결론:
"""
```

### 3. Reference-based Grading
정답(골든 레퍼런스)과 비교:
```python
reference_prompt = """
다음 응답이 정답과 얼마나 일치하는지 평가하세요.

질문: {question}
정답(참고): {reference}
평가할 응답: {response}

정확성 (0-10):
완전성 (0-10):
"""
```

## LLM-as-a-Judge 구현 (DeepEval)

```python
from deepeval import evaluate
from deepeval.metrics import GEval, AnswerRelevancyMetric, FaithfulnessMetric
from deepeval.test_case import LLMTestCase

# 관련성 평가
answer_relevancy = AnswerRelevancyMetric(
    threshold=0.7,
    model="gpt-4o",
    include_reason=True
)

# 충실성 평가 (RAG에서 검색 문서와 일치 여부)
faithfulness = FaithfulnessMetric(
    threshold=0.8,
    model="gpt-4o"
)

# 커스텀 G-Eval 메트릭
correctness = GEval(
    name="Correctness",
    criteria="응답이 사실적으로 정확한지 평가",
    evaluation_steps=[
        "응답의 각 주장을 식별하세요",
        "각 주장의 사실 여부를 확인하세요",
        "전체 정확도 점수를 0~10으로 부여하세요"
    ],
    model="gpt-4o"
)

test_case = LLMTestCase(
    input="삼성전자 본사는 어디인가요?",
    actual_output="삼성전자 본사는 수원시에 있습니다.",
    expected_output="삼성전자 본사는 경기도 수원시에 있습니다.",
    retrieval_context=["삼성전자는 경기도 수원시에 본사를 두고 있다."]
)

evaluate([test_case], [answer_relevancy, faithfulness, correctness])
```

## RAG 파이프라인 평가 메트릭 (RAGAS)

RAG 특화 평가 프레임워크:

```python
from ragas import evaluate
from ragas.metrics import (
    answer_relevancy,    # 답변이 질문에 관련되는가?
    faithfulness,        # 답변이 컨텍스트에 근거하는가?
    context_precision,   # 검색된 컨텍스트가 관련 있는가?
    context_recall,      # 필요한 컨텍스트가 검색되었는가?
)

result = evaluate(
    dataset=test_dataset,
    metrics=[answer_relevancy, faithfulness, context_precision, context_recall],
    llm=ChatOpenAI(model="gpt-4o"),
    embeddings=OpenAIEmbeddings()
)
```

## LLM-as-a-Judge의 편향 (Biases)

### 1. Position Bias (위치 편향)
같은 응답도 순서에 따라 다른 평가. 응답 A→B 순서를 B→A로 바꾸면 결과가 달라질 수 있음.
```python
# 해결: 순서 바꿔서 두 번 평가 후 평균
score_ab = judge(response_a, response_b)
score_ba = judge(response_b, response_a)
final_score = average(score_ab, 1 - score_ba)  # 방향 보정
```

### 2. Verbosity Bias (장황함 편향)
긴 응답을 선호하는 경향. 실제 품질과 무관하게 길수록 높은 점수.
```python
# 해결: 길이 정규화 또는 명시적 지시
"길이가 아닌 내용의 품질만 평가하세요. 간결한 답변도 동등하게 취급합니다."
```

### 3. Self-Enhancement Bias (자기 향상 편향)
같은 모델이 생성한 응답을 선호. GPT-4가 GPT-4 응답에 높은 점수.
```python
# 해결: 서로 다른 모델 사용 (Anthropic이 OpenAI 평가 등)
```

### 4. Sycophancy (아첨)
판사 모델에게 특정 선택을 암시하면 그에 맞게 평가.
```python
# ❌ "응답 A가 더 좋아 보이는데, 맞나요?"
# ✅ 중립적 프롬프트 유지
```

## LLM-as-a-Judge 신뢰도 높이기

```python
# Multi-judge: 여러 모델로 평가 후 합산
judges = [gpt4, claude, gemini]
scores = [judge.evaluate(response) for judge in judges]
final_score = statistics.median(scores)  # 중간값 사용

# Chain-of-thought grading: 이유 먼저, 점수 나중
grading_cot_prompt = """
먼저 응답의 장단점을 분석하세요.
그런 다음 1-10점으로 채점하세요.
(이유 없이 점수만 말하지 마세요)
"""
```

## Agent-as-a-Judge

에이전트 시스템 평가에 특화된 LLM-as-a-Judge의 확장 패러다임. LLM-as-a-Judge가 최종 텍스트 출력을 평가하는 데 반해, **실행 궤적(execution trajectory) 전체를 평가 대상**으로 삼는 것이 핵심 차이다.

자세한 내용(원본 논문, Critic Agent 패턴, Multi-Agent-as-Judge, Agent Simulation, 장단점 등) → **[[Agent_as_a_Judge]]**

## AI Engineering에서의 역할

LLM-as-a-Judge는 **Evaluation Engineering의 핵심 도구**다. 수천 개의 응답을 인간 평가자 없이 빠르게 평가하고, CI/CD 파이프라인에 통합하여 모델 변경 시 품질 회귀를 자동 감지할 수 있다. A/B 테스트, 프롬프트 최적화, 모델 선택 등 모든 LLMOps 결정의 기반이 된다. 에이전트 시스템에서는 [[Agent_as_a_Judge]]로 확장하여 실행 궤적 수준의 평가와 배포 전 스트레스 테스트까지 수행한다.

## 관련 개념
[[Benchmarking]] · [[Human_Evaluation]] · [[Observability_and_Tracing]] · [[Guardrail_Engineering]] · [[Evaluation]] · [[Agent_as_a_Judge]]

## 출처
- Zheng et al. (2023) "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" — [arXiv:2306.05685](https://arxiv.org/pdf/2306.05685)
- Evidently AI "LLM-as-a-judge: a complete guide" — [evidentlyai.com](https://www.evidentlyai.com/llm-guide/llm-as-a-judge)
- RAGAS 문서 — [docs.ragas.io](https://docs.ragas.io)
- [[Agent_Quality]] (이 위키의 기존 소스, 2025년 11월 최초 발행 → 2026년 5월 업데이트)
