---
order: 1
---

# LPG & RDF (Knowledge Graph 모델)

## 개요

Knowledge Graph를 구현하는 두 가지 주요 데이터 모델. **LPG(Labeled Property Graph)**는 실용적 그래프 DB(Neo4j 등)에서 사용하고, **RDF(Resource Description Framework)**는 시맨틱 웹과 온톨로지 기반 추론에서 사용한다.

## Knowledge Graph란

엔티티(노드)와 그 관계(엣지)를 그래프로 표현한 지식 저장 구조:
```
[서울] --(수도_of)--> [대한민국]
[이순신] --(태어난_곳)--> [아산]
[대한민국] --(위치)--> [동아시아]
```

## LPG (Labeled Property Graph)

### 특징
- **노드**: 레이블 + 프로퍼티(key-value 딕셔너리)
- **엣지**: 타입 + 프로퍼티(방향 있음)
- 쿼리 언어: Cypher (Neo4j), Gremlin (Apache TinkerPop)

```cypher
// Neo4j Cypher 예시
CREATE (p:Person {name: "이순신", birth_year: 1545})
CREATE (c:City {name: "아산"})
CREATE (p)-[:BORN_IN {year: 1545}]->(c)

// 쿼리
MATCH (p:Person)-[:BORN_IN]->(c:City)
WHERE p.birth_year < 1600
RETURN p.name, c.name
```

### 장점
- 빠른 그래프 탐색 (포인터 기반)
- 유연한 스키마
- 직관적인 데이터 모델링
- 대규모 OLTP 그래프 쿼리에 최적화

### 단점
- 형식적 온톨로지/추론 지원 없음
- 외부 시스템과의 시맨틱 상호운용성 제한

## RDF (Resource Description Framework)

### 특징
- W3C 표준. 모든 데이터를 **Triple(주어-술어-목적어)**로 표현
- URI로 전역 식별자 사용 → 시맨틱 상호운용성
- 쿼리 언어: SPARQL
- 추론 지원: OWL(Web Ontology Language)로 논리적 추론

```turtle
# Turtle 형식 RDF 예시
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:이순신 foaf:birthPlace ex:아산 .
ex:이순신 ex:birthYear "1545"^^xsd:integer .
ex:이순신 rdf:type ex:Admiral .
```

```sparql
# SPARQL 쿼리
SELECT ?person ?city
WHERE {
    ?person foaf:birthPlace ?city .
    ?person ex:birthYear ?year .
    FILTER (?year < 1600)
}
```

### 장점
- 형식적 시맨틱과 논리적 추론 가능 (OWL)
- 글로벌 상호운용성 (URI 기반)
- 분산 데이터 통합에 강함 (연결 데이터)
- 표준화된 온톨로지 재사용 가능

### 단점
- 쿼리 및 데이터 모델링 복잡
- LPG 대비 속도 느림 (OLTP 성능)
- 개발자 학습 곡선 높음

## LPG vs RDF 비교

| 기준 | LPG | RDF |
|------|-----|-----|
| **데이터 모델** | 노드+엣지+프로퍼티 | 주어-술어-목적어 트리플 |
| **식별자** | 내부 ID | 전역 URI |
| **쿼리 언어** | Cypher, Gremlin | SPARQL |
| **추론** | 기본 없음 | OWL 추론 가능 |
| **성능** | 빠름 | 상대적으로 느림 |
| **스키마** | 유연 | 엄격 (온톨로지) |
| **대표 DB** | Neo4j, Amazon Neptune | Stardog, AllegroGraph, Virtuoso |
| **적합** | 소셜 네트워크, 추천, 사기 탐지 | 생물정보학, 엔터프라이즈 지식 관리 |

## LLM 시대에서의 변화

RDF의 핵심 가정("의미는 온톨로지에 존재")이 LLM 등장으로 도전받고 있다:
```
전통적 RDF: 의미 = 명시적 온톨로지 정의
LLM 시대: 의미 = 임베딩 공간에서의 위치

→ 그래프는 LLM의 구조적 컨텍스트 제공자로 역할 변화
→ LPG + Vector가 실용적 AI 시스템에서 주류
```

## AI Engineering에서의 역할

AI 시스템에서 Knowledge Graph는 LLM의 **구조화된 기억** 역할을 한다. RDF는 공식적 추론이 필요한 엔터프라이즈 지식 관리에, LPG는 빠른 그래프 탐색이 필요한 추천·사기탐지·RAG 시스템에 적합하다. Graph RAG는 주로 LPG(Neo4j)를 기반으로 구현된다.

## 관련 개념
[[Ontology]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]] · [[Vector_Storage]]

## 출처
- W3C RDF 1.1 명세 — [w3.org](https://www.w3.org/TR/rdf11-concepts/)
- Kargar (2023) "RDF vs. LPG Knowledge Graphs" — [Medium](https://kargarisaac.medium.com/graphs-to-graph-neural-networks-from-fundamentals-to-applications-part-2c-rdf-vs-43f246764e39)
- Galaxy "RDF vs. LPG: The Right Choice for Knowledge Graphs" — [getgalaxy.io](https://www.getgalaxy.io/articles/rdf-vs-lpg-knowledge-graphs)
- Vasiliev "RDF Is a Knowledge Representation Model. LPG Is a Decision Infrastructure." — [Substack](https://sergeyvasiliev.substack.com/p/rdf-is-a-knowledge-representation)
