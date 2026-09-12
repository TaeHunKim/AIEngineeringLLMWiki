---
order: 3
---

# Runtime Optimization (런타임 최적화)

## 개요

**Runtime Optimization**은 AI 시스템이 프로덕션에서 실행되는 동안 **애플리케이션이 API를 호출하는 횟수와 크기 자체를 줄여** 비용·레이턴시를 최적화하는 전략이다. 모델을 다시 학습하지 않고도 운영 효율을 높이는 방법들을 다룬다. 셀프호스팅 서빙 엔진 내부에서 GPU 자원을 어떻게 최대로 활용할 것인가(PagedAttention, RadixAttention, Speculative Decoding, 분산 서빙 등)는 별도 챕터 [[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]]에서 다룬다 — 두 챕터는 각각 **API 호출 측**과 **서빙 엔진 내부**라는 서로 다른 레이어를 최적화한다.

## 왜 필요한가

```
GPT-4 Turbo 비용 (2024 기준):
  입력: $10 / 1M tokens
  출력: $30 / 1M tokens

월 100만 요청, 평균 2000 토큰/요청:
  비용 = 100만 × 2000 / 1000 × ($10 + $30) / 2 = $40,000/월

→ 10% 절감 = $4,000/월 = $48,000/년
```

## Semantic Cache (시맨틱 캐시)

전통적 캐시는 정확한 문자열 일치만 저장하지만, **Semantic Cache**는 의미적으로 유사한 질의에 캐시된 응답을 재사용한다.

```
전통 캐시:
  "파이썬이란?" → 캐시 HIT
  "Python이 무엇인가요?" → 캐시 MISS (다른 문자열)

Semantic Cache:
  "파이썬이란?" → 캐시 HIT
  "Python이 무엇인가요?" → 캐시 HIT (의미 유사도 0.94)
```

GPTCache 등을 이용한 구현 상세, 적중률·비용 절감 수치는 [[AI/Engineering/Context_Engineering/Semantic_Cache|Semantic_Cache]]에서 다룬다.

## 모델 라우팅 (Model Routing)

쿼리 복잡도에 따라 저렴한 모델과 고가 모델을 나눠 호출하는 전략. 간단한 휴리스틱 라우터부터 RouteLLM 같은 학습된 라우터(비용 85% 절감, GPT-4 Turbo 품질 95% 유지 보고)까지 다양한 정교화 수준이 있다.

```python
# 개념적 예시 — 상세 구현·RouteLLM·RouteProfile은 아래 문서 참고
class ModelRouter:
    def route(self, query: str) -> str:
        complexity = self.assess_complexity(query)
        return "expensive_model" if complexity > 0.7 else "cheap_model"
```

**정적 규칙 기반 라우팅**의 구현 상세(BERT 분류기, Matrix Factorization, RouteProfile 등)는 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity_Aware_Model_Routing]]에서 다룬다 — 그 문서는 워처 에이전트가 프로덕션 로그로부터 라우팅 정책 자체를 지속적으로 재생성하는 **동적** 버전까지 포함한다.

## 배치 처리 (Batching)

여러 요청을 묶어서 처리하면 API 오버헤드가 감소한다:

```python
import asyncio

async def batch_llm_calls(queries: list[str], batch_size: int = 10) -> list[str]:
    """비동기 배치 처리"""
    results = []
    for i in range(0, len(queries), batch_size):
        batch = queries[i:i + batch_size]
        tasks = [llm.ainvoke(q) for q in batch]
        batch_results = await asyncio.gather(*tasks)
        results.extend(batch_results)
    return results
```

## 스트리밍 (Streaming)

Time-to-First-Token 최소화로 체감 속도를 향상시킨다:

```python
# LangChain 스트리밍
for chunk in llm.stream("긴 분석 리포트 작성해줘"):
    print(chunk.content, end="", flush=True)
    # → 첫 토큰이 0.5초 만에 사용자에게 전달
    # (전체 완료 10초 vs TTFB 0.5초)
```

## 비용 제어 루프 (Cost Control Loop)

```python
class CostControlLoop:
    def __init__(self, monthly_budget_usd: float):
        self.budget = monthly_budget_usd
        self.spent = 0
        self.router = ModelRouter()

    def get_current_model(self, query: str):
        """남은 예산에 따라 모델 선택 조정"""
        budget_remaining = 1 - (self.spent / self.budget)
        if budget_remaining < 0.1:  # 예산 90% 소진
            return self.router.cheap_model  # 강제로 저렴한 모델
        else:
            return self.router.route(query)

    def record_cost(self, tokens_used: int, model: str):
        pricing = {"gpt-4o": 0.0025, "gpt-4o-mini": 0.00015}
        cost = tokens_used / 1000 * pricing.get(model, 0.001)
        self.spent += cost
        if self.spent > self.budget * 0.8:
            alert_team(f"월 예산 80% 소진: ${self.spent:.2f}/${self.budget}")
```

이 워처 패턴을 프로덕션 등급으로 자율화한 버전은 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost_Engineering]]에서 다룬다.

## 최적화 전략 요약 (애플리케이션 레이어)

| 전략 | 비용 절감 | 레이턴시 감소 | 구현 복잡도 |
|------|----------|-------------|-----------|
| Semantic Cache | 40-70% | 90%+ | 중간 |
| RouteLLM (학습된 라우터) | 85% | 20-40% | 중간 |
| Model Routing (휴리스틱) | 30-60% | 20-40% | 낮음 |
| Streaming | 없음 | TTFB 80%+ | 낮음 |
| Batching | 10-20% | 처리량 2-5배 | 낮음 |
| Prompt Compression | 20-40% | 20-30% | 중간 |

서빙 엔진 내부 최적화(PagedAttention, RadixAttention, Speculative Decoding, Disaggregated Serving)의 효과 수치는 [[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]] 각 하위 문서에서 다룬다.

## AI Engineering에서의 역할

Runtime Optimization은 AI 서비스가 **경제적으로 지속 가능하도록 하는 엔지니어링**이다. API 호출 측 최적화(캐싱·라우팅·배칭)와 자체 호스팅 서빙 엔진 내부 최적화([[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]])는 서로 다른 레이어이며, 두 레이어를 함께 고려해야 총소유비용(TCO)을 최소화할 수 있다. 게이트웨이·배포 전략 등 조직 차원의 프로덕션 운영은 [[AI/Engineering/Loop_Engineering/Production_Operations|Production_Operations]] 참고.

## 관련 개념
[[AI/Engineering/Context_Engineering/Semantic_Cache|Semantic_Cache]] · [[AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity_Aware_Model_Routing]] · [[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]] · [[AI/Engineering/Context_Engineering/Context_Compression|Context_Compression]] · [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] · [[AI/Engineering/Loop_Engineering/Production_Operations|Production_Operations]] · [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost_Engineering/Cost_Engineering]]

## 출처
- GPTCache GitHub — [github.com/zilliztech/GPTCache](https://github.com/zilliztech/GPTCache)
- Ong et al. (ICLR 2025) "RouteLLM: Learning to Route LLMs with Preference Data" — [arxiv.org/abs/2406.18665](https://arxiv.org/abs/2406.18665)
- LangChain Caching 문서 — [python.langchain.com](https://python.langchain.com/docs/how_to/llm_caching/)
- Anthropic "Reducing LLM API Costs" — [anthropic.com/docs](https://docs.anthropic.com/en/docs/build-with-claude/caching)
