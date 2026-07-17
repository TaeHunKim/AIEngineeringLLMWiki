---
order: 0
---

# Knowledge Graph (지식 그래프)

## 개요

**Knowledge Graph (KG)**는 엔티티(개체)와 그 관계를 노드-엣지 구조로 표현하는 데이터 모델이다. Google이 2012년 검색에 도입하면서 대중화됐으며, LLM 시대에는 정형화된 구조적 컨텍스트 제공자로 재주목받고 있다.

```
[벡터 DB 한계]
"삼성전자와 관련된 문서 찾기" → 유사도 검색
→ "삼성전자가 어떤 회사와 협력하며, 그 회사의 CEO는 누구인가?"는 답 못 함

[Knowledge Graph 강점]
삼성전자 → [협력사] → TSMC → [CEO] → C.C. Wei
→ 다단계 관계 추론 가능
```

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[LPG_and_RDF]] | 두 가지 KG 표준 — Property Graph(Neo4j) vs RDF(SPARQL) |
| [[Ontology]] | 도메인 지식의 형식적 명세 — OWL, 추론 엔진 |
| [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]] | Microsoft 2024 — KG + RAG 결합으로 전역 검색 실현 |

## 벡터 DB vs Knowledge Graph

| 비교 | 벡터 DB | Knowledge Graph |
|------|--------|----------------|
| 검색 방식 | 의미적 유사도 | 관계 탐색 |
| 강점 | 비정형 텍스트 | 구조화된 관계 |
| 다단계 추론 | 어려움 | 자연스러움 |
| 업데이트 | 인덱스 재구축 | 노드/엣지 추가 |
| 최적 활용 | 문서 검색 | 엔티티 관계 질의 |

## LLM + Knowledge Graph 패턴

```
1. GraphRAG: KG에서 커뮤니티 요약 → 전역적 질의 답변
2. KG-to-Text: 그래프 트리플 → 자연어로 변환하여 컨텍스트 제공
3. Text-to-Cypher: 자연어 질의 → Cypher/SPARQL로 변환
4. Hybrid: 벡터 유사도 + 그래프 탐색 결합
```

## AI Engineering에서의 역할

Knowledge Graph는 **LLM이 구조적 지식을 다루어야 할 때** 핵심 구성요소다. 기업 데이터(제품-카테고리-브랜드 관계), 의료 온톨로지(질병-증상-치료 관계), 법률 체계(법령-조항-판례 관계) 등에서 RAG만으로는 불가능한 정밀한 다단계 추론을 가능하게 한다.

## 관련 개념
[[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]]

## 출처
- Google "Introducing the Knowledge Graph" (2012) — [google.com/intl/es419/insidesearch](https://www.google.com/intl/es419/insidesearch/features/search/knowledge.html)
- Hogan et al. (2021) "Knowledge Graphs" — [arxiv.org/abs/2003.02320](https://arxiv.org/abs/2003.02320)
