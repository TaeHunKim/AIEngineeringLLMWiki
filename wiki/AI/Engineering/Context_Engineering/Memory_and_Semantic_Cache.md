---
order: 1
---

# Memory & Semantic Cache (메모리 & 시맨틱 캐시)

## 개요

LLM 시스템에서 **Memory**는 이전 상호작용과 지식을 저장·유지·활용하는 메커니즘이고, **Semantic Cache**는 유사한 쿼리의 응답을 캐싱하여 LLM API 호출 비용과 레이턴시를 줄이는 최적화 기법이다.

```
Memory:
  "이 사용자가 이전에 무엇을 말했는가?" → 개인화·연속성
  세션 간 지속 / 실시간 업데이트 / 사용자별 맞춤

Semantic Cache:
  "이 쿼리에 유사한 응답이 이미 있는가?" → 비용 최적화
  공유 캐시 / 읽기 전용 / 모든 사용자 공통
```

---

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[LLM_Memory]] | LLM Memory 4유형, Conversation 전략, Letta/Mem0/Zep 구현, Memory vs RAG |
| [[Semantic_Cache]] | 의미 유사도 캐싱, GPTCache, Redis 구현, 비용 절감 효과 |

---

## 핵심 비교

| 항목 | Memory | Semantic Cache |
|------|--------|---------------|
| **목적** | 개인화, 세션 연속성 | API 비용·지연 절감 |
| **범위** | 사용자·에이전트별 | 전체 공유 캐시 |
| **읽기/쓰기** | Read-Write | Read-Write (쓰기 후 주로 읽기) |
| **갱신** | 실시간 | 만료 시 갱신 |
| **기술** | Vector DB, KG, KV Store | Vector DB + KV Store |

---

## AI Engineering에서의 역할

- **Memory**: Context Engineering → Agent Engineering의 핵심 인프라. 에이전트를 스테이트풀하게 만들어 개인화된 장기 경험을 제공한다.
- **Semantic Cache**: Loop Engineering의 Runtime Optimization 계층에서 비용 제어 역할을 한다.

## 관련 개념
[[AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[Agent_Engineering/Agent_Memory]] · [[Loop_Engineering/Runtime_Optimization]]
