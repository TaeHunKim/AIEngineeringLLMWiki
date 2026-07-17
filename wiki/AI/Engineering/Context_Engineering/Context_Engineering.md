---
order: 0
nav_order: 30
---

# Context Engineering (컨텍스트 엔지니어링)

## 개요

**Context Engineering**은 LLM의 컨텍스트 윈도우에 **무엇을, 어떤 순서로, 어떻게 담을 것인가**를 설계하는 기술이다. Andrej Karpathy (2025)가 Prompt Engineering의 후속 개념으로 제시했으며, "프롬프트는 컨텍스트의 일부일 뿐"이라는 더 넓은 시각을 제공한다.

```
컨텍스트 윈도우 = System Prompt + 검색된 문서 + 대화 히스토리
                  + 도구 결과 + 사용자 입력 + ...

Context Engineering = 이 공간을 가장 유용하게 채우는 기술
```

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[Memory_and_Semantic_Cache]] | Memory & Semantic Cache 개요 (인덱스) |
| [[LLM_Memory]] | LLM Memory 4유형, Conversation 전략, Letta/Mem0/Zep 구현 |
| [[Semantic_Cache]] | 의미 유사도 캐싱, GPTCache, 비용 절감 효과 |
| [[Context_Compression]] | LLM Lingua, Map-Reduce, 비용 절감 |
| [[Lost_in_the_Middle]] | LLM의 긴 컨텍스트 중간 활용도 저하 현상 및 회피 전략 |

> **RAG, GraphRAG, NL2SQL, SQL RAG** 문서는 별도 챕터로 분리됐습니다.
> → [[../Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies 챕터]] 참고

## 핵심 과제

```
1. 무엇을 넣을까?     → Retrieval Strategies (RAG / GraphRAG / SQL RAG)로 관련 정보 검색
2. 어떻게 압축할까?  → Context Compression으로 토큰 절약
3. 어떻게 기억할까?  → Memory & Semantic Cache
4. 어떤 순서로?      → "Lost in the Middle" 문제 회피 (→ [[Lost_in_the_Middle]])
```

## AI Engineering에서의 역할

Context Engineering은 **LLM의 즉각적 성능을 결정하는 계층**이다. 파인튜닝 없이도 올바른 컨텍스트 구성만으로 성능을 2-3배 향상시킬 수 있다. RAG 아키텍처 설계가 이 계층의 핵심 실무다.

## 관련 개념
[[Prompt_Engineering/Prompt_Engineering]] · [[Flow_Engineering/Flow_Engineering]] · [[Agent_Engineering/Agent_Memory]]
