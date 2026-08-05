---
order: 3
---

# Context Usage Auditing (컨텍스트 사용량 감사)

## 개요

컨텍스트도 결국 모델 입장에서는 프롬프트이고 토큰 소모다. 그런데 입출력 압축 자체보다 먼저 짚어야 할 질문이 있다: **RAG로 검색해온 컨텍스트가 실제로 응답 생성에 쓰이고 있는가?** 검색은 됐지만 최종 응답에 전혀 반영되지 않은 청크는 순수하게 낭비되는 비용이다. Context Usage Auditing은 워처 에이전트가 프로덕션 로그를 분석해 이 낭비를 지속적으로 탐지·제거하는 실천이다.

이 문서는 [[AI/Engineering/Context_Engineering/Context_Compression|Context_Compression]](LLM Lingua 등 프롬프트 자체를 압축하는 기법)과 겹치지 않도록, **"이미 검색된 컨텍스트 중 무엇이 실제로 쓰였는가"를 감사하는 관점**으로 범위를 좁혀 다룬다.

## 입출력 최적화의 실용성 한계

프롬프트를 간결하게 쓰거나 출력에서 불필요한 토큰을 배제하는 테크닉("케이브맨 스킬"류를 포함해)은 여럿 알려져 있지만, 실무 — 특히 멀티에이전트 환경 — 에서는 이런 미시적 절감보다 **입출력 형식을 엄격하게 맞추는 것**이 훨씬 중요한 경우가 많다. 에이전트 간에 주고받는 메시지 포맷이 깨지면 파싱 실패·연쇄 오류로 이어져, 절감한 토큰 비용보다 훨씬 큰 대가를 치르게 된다. 따라서 이 문서는 "프롬프트를 더 짧게 쓰라"는 방향보다, 아래처럼 **애초에 불필요한 컨텍스트를 검색·주입하지 않는 것**에 초점을 맞춘다.

## RAG 청크 사용량 감사

```
감사 파이프라인:
  1. 각 요청에서 검색된 청크에 고유 ID 부여 (Retrieval 단계)
  2. 최종 응답 생성 후, 응답이 각 청크를 실제로 인용/근거로 삼았는지 판정
     - 판정 방법: 청크 내용과 응답 문장의 근거 매칭(attribution),
       또는 LLM-as-a-Judge로 "이 청크가 답변에 기여했는가" 채점
  3. 청크별 "검색됨 대비 실제 사용됨" 비율을 누적 집계
  4. 사용률이 지속적으로 낮은 청크 소스·카테고리를 식별
```

낮은 사용률이 반복되는 경우 두 가지 원인이 있을 수 있다 — (a) retrieval-K가 과도하게 높게 설정되어 있거나, (b) 재랭킹(reranking) 임계값이 관련성 낮은 청크까지 통과시키고 있는 경우다. 사용량 감사 데이터는 이 둘 중 무엇이 문제인지 구분하는 근거가 된다.

## Retrieval-K·재랭킹 임계값 자동 조정

```python
# 개념적 예시: 사용량 감사 결과로 retrieval 파라미터를 점진 조정
class ContextUsageAuditor:
    def analyze_window(self, logs: list[RequestLog]) -> dict:
        usage_by_source = defaultdict(lambda: {"retrieved": 0, "used": 0})
        for log in logs:
            for chunk in log.retrieved_chunks:
                usage_by_source[chunk.source]["retrieved"] += 1
                if chunk.id in log.attributed_chunk_ids:
                    usage_by_source[chunk.source]["used"] += 1
        return usage_by_source

    def suggest_adjustment(self, usage_stats: dict) -> dict:
        suggestions = {}
        for source, stats in usage_stats.items():
            usage_rate = stats["used"] / max(stats["retrieved"], 1)
            if usage_rate < 0.3:  # 지속적으로 낮은 사용률
                suggestions[source] = "retrieval_k 축소 또는 재랭킹 임계값 상향 검토"
        return suggestions
```

이 조정 역시 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity_Aware_Model_Routing]]과 마찬가지로 즉시 프로덕션에 반영하기보다, 조정 전후의 응답 품질(특히 context recall — 필요한 정보가 실제로 누락되지는 않는지)을 비교하는 기간을 거쳐야 한다. Retrieval-K를 지나치게 줄이면 사용량은 개선되지만 정작 필요한 정보가 누락되는 위험이 있다.

## 확립된 컨텍스트 프루닝 기법과의 관계

사용량 감사가 "어떤 소스/카테고리를 얼마나 검색할지"를 조정하는 상위 루프라면, 요청 하나 안에서 검색된 청크들을 다시 걸러내는 하위 기법들도 이미 확립되어 있다 — 예를 들어 청크 간 중복도(redundancy)와 질의 관련성을 함께 최적화하는 AdaGReS 같은 프레임워크가, 표준 top-k 검색이 남기는 중복·저관련 청크를 걸러낸다. 사용량 감사는 이런 요청 단위 프루닝 기법들이 실제로 잘 작동하고 있는지, 그리고 애초에 검색 설정 자체가 적절한지를 **누적 데이터로 검증하는 상위 레이어**로 이해하면 된다.

## AI Engineering에서의 역할

Context Usage Auditing은 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]]이 다루는 세 메커니즘 중 절감 폭은 상대적으로 작지만, 부작용 리스크도 가장 낮다 — 모델을 바꾸거나(라우팅) LLM 호출을 아예 제거하는 것(스크립트화)과 달리, 컨텍스트 구성만 조정하므로 실패 시 영향 범위가 좁다. 다만 실용성을 위해서는 "토큰을 아끼는 것"보다 "멀티에이전트 파이프라인의 입출력 계약을 깨지 않는 것"을 항상 우선순위에 둬야 한다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost_Engineering/Cost_Engineering]] · [[AI/Engineering/Context_Engineering/Context_Compression|Context_Compression]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|RAG/Advanced_Retrieval]] · [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM_as_a_Judge]]

## 출처
- "AdaGReS: Adaptive Greedy Context Selection via Redundancy-Aware Scoring for Token-Budgeted RAG" (2026) — [arXiv:2512.25052](https://arxiv.org/pdf/2512.25052)
- Milvus Blog, "LLM Context Pruning: Improving RAG and Agentic AI Systems" — [milvus.io](https://milvus.io/blog/llm-context-pruning-a-developers-guide-to-better-rag-and-agentic-ai-results.md)
