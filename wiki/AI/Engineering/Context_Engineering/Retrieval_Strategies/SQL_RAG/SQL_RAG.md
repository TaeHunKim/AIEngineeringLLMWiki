---
order: 0
nav_order: 40
---

# SQL RAG (SQL-based Retrieval-Augmented Generation)

## 개요

**SQL RAG**는 정형 데이터(Structured Data)를 대상으로 SQL 쿼리를 검색 메커니즘으로 활용하는 RAG 패턴이다. 기존 벡터 RAG가 비정형 텍스트 문서에 최적화된 반면, SQL RAG는 RDBMS·데이터웨어하우스에 저장된 수치, 트랜잭션, 집계 데이터를 정확하게 검색한다.

```mermaid
flowchart LR
    subgraph trad["전통적 RAG"]
        Q1[질문] --> VS[벡터 검색] --> CH[문서 청크] --> L1[LLM] --> A1[답변]
    end
    subgraph sqlrag["SQL RAG"]
        Q2[질문] --> NS[NL2SQL] --> SE[SQL 실행] --> RT[결과 테이블] --> L2[LLM] --> A2[답변]
    end
```

## 왜 SQL RAG가 필요한가

벡터 RAG는 의미적 유사도 기반이라 **정확한 수치 검색에 취약**하다:

```
질문: "2024년 4분기 서울 지역 매출 합계는?"

벡터 RAG의 문제:
  → "매출 보고서" 텍스트 청크를 검색
  → 정확한 수치가 아닌 요약 텍스트 반환
  → 청크 경계에서 숫자 잘림, 합산 불가

SQL RAG의 해결:
  → SELECT SUM(revenue) FROM sales
     WHERE region='서울' AND quarter='Q4' AND year=2024
  → 정확한 집계값 즉시 반환
```

| 특성 | 벡터 RAG | SQL RAG |
|------|---------|---------|
| **데이터 타입** | 비정형 텍스트 | 정형 테이블 |
| **검색 방식** | 의미 유사도 (ANN) | SQL 쿼리 실행 |
| **집계 연산** | 불가 | SUM, AVG, COUNT 등 정확 계산 |
| **최신성** | 인덱싱 시점 | 실시간 DB 조회 |
| **정확도** | 확률적 | 결정론적 |
| **스케일** | 수백만 벡터 | 수십억 행 (인덱스 활용) |
| **적합 질문** | "~에 대해 설명해줘" | "~의 합계/평균/랭킹은?" |

## SQL RAG 파이프라인

```mermaid
flowchart TD
    S1["① 사용자 질문<br/>예: 가장 수익성 높은 고객은?"] --> S2
    S2["② 라우팅 결정<br/>정형 데이터 판단 → NL2SQL 경로<br/>또는 Hybrid: 벡터 + SQL 동시"] --> S3
    S3["③ NL2SQL 변환<br/>Schema Linking → SQL 생성<br/>SELECT SUM(profit) ... LIMIT 10"] --> S4
    S4["④ SQL 실행 → 결과 테이블 반환"] --> S5
    S5["⑤ 결과 포맷팅<br/>테이블을 자연어 컨텍스트로 변환"] --> S6
    S6["⑥ LLM 최종 응답 생성<br/>결과 해석 + 인사이트 추가"]
```

## Hybrid RAG: 벡터 + SQL 결합

실제 엔터프라이즈 시스템은 정형·비정형 데이터를 동시에 활용해야 한다. Hybrid RAG는 두 검색 경로를 결합한다:

```mermaid
flowchart TD
    Q[사용자 질문] --> R{질문 분석 & 라우팅}
    R -->|"비정형 질문<br/>계약서에 환불 조건이 뭐야?"| VS[벡터 검색 → 문서 청크]
    R -->|"정형 질문<br/>지난 달 환불 건수는?"| SR[SQL RAG → 테이블 결과]
    R -->|"복합 질문<br/>환불 정책 + 통계 동시"| BOTH[양쪽 동시 실행]
    VS & SR & BOTH --> RRF[Reciprocal Rank Fusion<br/>또는 컨텍스트 결합]
    RRF --> LLM[LLM → 통합 응답]
```

### Databricks Instructed Retrieval (2026)

Databricks가 제안한 접근: **SQL의 결정론과 벡터의 확률론을 결합**한다. 하드 필터(날짜 범위, 카테고리 등)는 SQL로 처리하고, 의미 검색은 벡터로 수행한다 [1]:

```python
# 개념적 구현
results = db.query("""
    SELECT *, embedding_distance(content_vec, ?) as dist
    FROM documents
    WHERE date >= '2024-01-01'          -- SQL 하드 필터
      AND department = 'engineering'    -- SQL 하드 필터
    ORDER BY dist ASC                   -- 벡터 유사도 정렬
    LIMIT 10
""", query_embedding)
```

## SQL Server 2025의 네이티브 RAG 지원

Microsoft SQL Server 2025는 DB 내장 벡터 검색을 지원해 SQL RAG 구현을 단순화한다 [2]:

```sql
-- SQL Server 2025 네이티브 벡터 검색
SELECT TOP 5
    document_id,
    content,
    VECTOR_DISTANCE('cosine', embedding, @query_embedding) AS distance
FROM documents
WHERE department = 'sales'
ORDER BY distance ASC;
```

- 별도 벡터 DB 불필요 — SQL Server 안에서 벡터 인덱스 관리
- 기존 SQL 워크로드와 통합 가능
- NVIDIA Nemotron RAG 모델과 파트너십

## 실무 구현 패턴

### 패턴 1: LangChain SQL Agent

```python
from langchain.agents import create_sql_agent
from langchain.sql_database import SQLDatabase
from langchain_openai import ChatOpenAI

db = SQLDatabase.from_uri("postgresql://user:pass@localhost/mydb")
llm = ChatOpenAI(model="gpt-4o", temperature=0)

agent = create_sql_agent(
    llm=llm,
    db=db,
    verbose=True,
    agent_type="openai-tools"
)

result = agent.invoke({"input": "가장 많이 팔린 상품 5개를 알려줘"})
```

### 패턴 2: LlamaIndex NL2SQL Query Engine

```python
from llama_index.core import SQLDatabase, VectorStoreIndex
from llama_index.core.query_engine import SQLAutoVectorQueryEngine

# SQL + 벡터 하이브리드 쿼리 엔진
sql_query_engine = NLSQLTableQueryEngine(
    sql_database=sql_database,
    tables=["orders", "products", "customers"]
)

vector_query_engine = index.as_query_engine()

# 라우팅 포함 하이브리드
query_engine = SQLAutoVectorQueryEngine(
    sql_query_tool=sql_query_tool,
    other_query_tool=vector_query_tool
)
```

### 패턴 3: Self-Correction 루프

```python
async def sql_rag_with_correction(question: str, max_retries: int = 3):
    for attempt in range(max_retries):
        sql = await nl2sql(question, schema=get_schema())
        try:
            result = await db.execute(sql)
            return await llm_format_response(question, result)
        except SQLError as e:
            # 오류를 LLM에 피드백하여 수정
            question = f"""
            원래 질문: {question}
            생성된 SQL: {sql}
            오류: {str(e)}
            SQL을 수정해주세요.
            """
    return "쿼리 생성에 실패했습니다."
```

## Vector RAG vs SQL RAG vs Hybrid 비교

```
시나리오별 최적 전략:

비정형 데이터 (PDF, 이메일, 웹페이지 등)
  → 벡터 RAG

정형 데이터 (DB 테이블, 수치, 집계)
  → SQL RAG

실시간 정확한 수치 + 설명 문서 동시 필요
  → Hybrid (벡터 + SQL)

복잡한 엔티티 관계 분석
  → GraphRAG

비즈니스 데이터 분석 + DB 쿼리
  → SQL RAG + NL2SQL
```

## 한계 및 주의사항

```
1. SQL Injection 위험
   - LLM이 악의적 SQL 생성 가능
   - 해결: Read-only 계정 사용, 허용 테이블 화이트리스트

2. 대용량 결과 처리
   - SELECT * 수백만 행 반환 시 컨텍스트 초과
   - 해결: LIMIT 강제, 집계 우선 유도

3. 복잡한 분석 쿼리 오류
   - Window Function, 중첩 서브쿼리에서 생성 오류
   - 해결: Self-correction 루프, Query Decomposition

4. Schema 변경에 취약
   - 테이블/컬럼 이름 변경 시 즉시 오류
   - 해결: Schema Registry 관리, 메타데이터 주석

5. 비결정론적 LLM
   - 동일 질문에 다른 SQL 생성 가능
   - 해결: temperature=0, Consistency Alignment
```

## AI Engineering에서의 역할

SQL RAG는 **엔터프라이즈 데이터 레이어와 LLM을 연결하는 핵심 브릿지**다. BI 대시보드 대화형 분석, ERP 데이터 질의 챗봇, 실시간 재고·매출 조회 에이전트 등에서 필수 패턴으로 자리잡고 있다. [[NL2SQL]]이 변환 품질을 담당하고, SQL RAG는 이를 시스템 아키텍처 수준에서 통합한다. 2026년 현재 Databricks, Microsoft SQL Server 2025 등 주요 플랫폼이 네이티브 SQL RAG 지원을 추가하며 채택이 가속화되고 있다.

## 관련 개념

[[NL2SQL]] · [[RAG/RAG]] · [[RAG/Advanced_Retrieval]] · [[GraphRAG/GraphRAG]]

## References

[1] Databricks Instructed Retrieval: Beyond the Vector — Enterprise RAG Accuracy (2026) — [markets.financialcontent.com](https://markets.financialcontent.com/observerreporter/article/tokenring-2026-1-8-beyond-the-vector-databricks-unveils-instructed-retrieval-to-solve-the-enterprise-rag-accuracy-crisis)

[2] How SQL Server 2025 Enables Retrieval-Augmented Generation Workflows — [c-sharpcorner.com](https://www.c-sharpcorner.com/article/how-sql-server-enables-retrieval-augmented-generation-rag-workflows-embedding/)

[3] Hybrid Retrieval-Augmented Generation (RAG) Systems with Embedding Vector Databases — [researchgate.net](https://www.researchgate.net/publication/390326215_Hybrid_Retrieval-Augmented_Generation_RAG_Systems_with_Embedding_Vector_Databases)

[4] Enterprise RAG Architecture: A Practitioner's Guide — [applied-ai.com](https://www.applied-ai.com/briefings/enterprise-rag-architecture/)

[5] RAG in 2025: The enterprise guide to RAG, Graph RAG and agentic AI — [datanucleus.dev](https://datanucleus.dev/rag-and-agentic-ai/what-is-rag-enterprise-guide-2025)

[6] Enterprise RAG Guide 2026: Modular, GraphRAG & Agentic Patterns — [synvestable.com](https://www.synvestable.com/enterprise-rag.html)
