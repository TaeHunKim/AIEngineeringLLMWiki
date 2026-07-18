---
order: 0
nav_order: 40
---

# SQL RAG (SQL-based Retrieval-Augmented Generation)

## Overview

**SQL RAG** is a RAG pattern that uses SQL queries as the retrieval mechanism for structured data. While traditional vector RAG is optimized for unstructured text documents, SQL RAG accurately retrieves numerical, transactional, and aggregated data stored in RDBMS and data warehouses.

```mermaid
flowchart LR
    subgraph trad["Traditional RAG"]
        Q1[Question] --> VS[Vector search] --> CH[Document chunks] --> L1[LLM] --> A1[Answer]
    end
    subgraph sqlrag["SQL RAG"]
        Q2[Question] --> NS[NL2SQL] --> SE[SQL execution] --> RT[Result table] --> L2[LLM] --> A2[Answer]
    end
```

## Why SQL RAG Is Needed

Vector RAG is based on semantic similarity and is **vulnerable to accurate numerical retrieval**:

```
Question: "What is the total Q4 2024 revenue for Seoul region?"

Vector RAG problem:
  → Retrieves "revenue report" text chunks
  → Returns summary text, not exact numbers
  → Numbers cut off at chunk boundaries, cannot aggregate

SQL RAG solution:
  → SELECT SUM(revenue) FROM sales
     WHERE region='Seoul' AND quarter='Q4' AND year=2024
  → Returns exact aggregated value immediately
```

| Property | Vector RAG | SQL RAG |
|----------|-----------|---------|
| **Data type** | Unstructured text | Structured tables |
| **Search method** | Semantic similarity (ANN) | SQL query execution |
| **Aggregation** | Not possible | SUM, AVG, COUNT exact calculation |
| **Freshness** | Indexing point-in-time | Real-time DB query |
| **Accuracy** | Probabilistic | Deterministic |
| **Scale** | Millions of vectors | Billions of rows (with indexing) |
| **Best for** | "Explain ~" | "What's the total/average/ranking of ~?" |

## SQL RAG Pipeline

```mermaid
flowchart TD
    S1["① User question<br/>e.g. Who are the most profitable customers?"] --> S2
    S2["② Routing decision<br/>Structured data determination → NL2SQL path<br/>or Hybrid: vector + SQL simultaneously"] --> S3
    S3["③ NL2SQL conversion<br/>Schema Linking → SQL generation<br/>SELECT SUM(profit) ... LIMIT 10"] --> S4
    S4["④ SQL execution → return result table"] --> S5
    S5["⑤ Result formatting<br/>Convert table to natural language context"] --> S6
    S6["⑥ LLM final response generation<br/>Interpret results + add insights"]
```

## Hybrid RAG: Combining Vector + SQL

Real enterprise systems need to utilize structured and unstructured data simultaneously. Hybrid RAG combines both retrieval paths:

```mermaid
flowchart TD
    Q[User question] --> R{Question analysis & routing}
    R -->|"Unstructured question<br/>What are the refund conditions in the contract?"| VS[Vector search → document chunks]
    R -->|"Structured question<br/>How many refunds last month?"| SR[SQL RAG → table results]
    R -->|"Complex question<br/>Refund policy + statistics simultaneously"| BOTH[Both sides run simultaneously]
    VS & SR & BOTH --> RRF[Reciprocal Rank Fusion<br/>or context combination]
    RRF --> LLM[LLM → integrated response]
```

### Databricks Instructed Retrieval (2026)

Approach proposed by Databricks: **combines SQL's determinism with vector's probabilism**. Hard filters (date ranges, categories, etc.) are processed with SQL, and semantic search is performed with vectors [1]:

```python
# Conceptual implementation
results = db.query("""
    SELECT *, embedding_distance(content_vec, ?) as dist
    FROM documents
    WHERE date >= '2024-01-01'          -- SQL hard filter
      AND department = 'engineering'    -- SQL hard filter
    ORDER BY dist ASC                   -- vector similarity sort
    LIMIT 10
""", query_embedding)
```

## SQL Server 2025 Native RAG Support

Microsoft SQL Server 2025 supports built-in vector search, simplifying SQL RAG implementation [2]:

```sql
-- SQL Server 2025 native vector search
SELECT TOP 5
    document_id,
    content,
    VECTOR_DISTANCE('cosine', embedding, @query_embedding) AS distance
FROM documents
WHERE department = 'sales'
ORDER BY distance ASC;
```

- No separate vector DB needed — manage vector index within SQL Server
- Can integrate with existing SQL workloads
- Partnership with NVIDIA Nemotron RAG model

## Practical Implementation Patterns

### Pattern 1: LangChain SQL Agent

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

result = agent.invoke({"input": "Tell me the top 5 best-selling products"})
```

### Pattern 2: LlamaIndex NL2SQL Query Engine

```python
from llama_index.core import SQLDatabase, VectorStoreIndex
from llama_index.core.query_engine import SQLAutoVectorQueryEngine

# SQL + vector hybrid query engine
sql_query_engine = NLSQLTableQueryEngine(
    sql_database=sql_database,
    tables=["orders", "products", "customers"]
)

vector_query_engine = index.as_query_engine()

# Hybrid with routing
query_engine = SQLAutoVectorQueryEngine(
    sql_query_tool=sql_query_tool,
    other_query_tool=vector_query_tool
)
```

### Pattern 3: Self-Correction Loop

```python
async def sql_rag_with_correction(question: str, max_retries: int = 3):
    for attempt in range(max_retries):
        sql = await nl2sql(question, schema=get_schema())
        try:
            result = await db.execute(sql)
            return await llm_format_response(question, result)
        except SQLError as e:
            # Feed error back to LLM for correction
            question = f"""
            Original question: {question}
            Generated SQL: {sql}
            Error: {str(e)}
            Please fix the SQL.
            """
    return "Failed to generate query."
```

## Vector RAG vs SQL RAG vs Hybrid Comparison

```
Optimal strategy by scenario:

Unstructured data (PDF, email, web pages, etc.)
  → Vector RAG

Structured data (DB tables, numbers, aggregations)
  → SQL RAG

Simultaneously needs real-time accurate numbers + explanatory documents
  → Hybrid (vector + SQL)

Complex entity relationship analysis
  → GraphRAG

Business data analysis + DB queries
  → SQL RAG + NL2SQL
```

## Limitations and Precautions

```
1. SQL Injection risk
   - LLM may generate malicious SQL
   - Solution: Use read-only accounts, allowed table whitelist

2. Large result handling
   - SELECT * returning millions of rows exceeds context
   - Solution: Force LIMIT, prioritize aggregation

3. Complex analysis query errors
   - Generation errors on Window Functions, nested subqueries
   - Solution: Self-correction loop, Query Decomposition

4. Vulnerable to schema changes
   - Immediate errors when table/column names change
   - Solution: Schema Registry management, metadata annotations

5. Non-deterministic LLM
   - May generate different SQL for the same question
   - Solution: temperature=0, Consistency Alignment
```

## Role in AI Engineering

SQL RAG is the **key bridge connecting enterprise data layers with LLMs**. It is establishing itself as an essential pattern in interactive BI dashboard analysis, ERP data query chatbots, and real-time inventory/revenue query agents. [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL|NL2SQL]] handles the conversion quality while SQL RAG integrates it at the system architecture level. As of 2026, adoption is accelerating with major platforms including Databricks and Microsoft SQL Server 2025 adding native SQL RAG support.

## Related Concepts

[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL|NL2SQL]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]]

## References

[1] Databricks Instructed Retrieval: Beyond the Vector — Enterprise RAG Accuracy (2026) — [markets.financialcontent.com](https://markets.financialcontent.com/observerreporter/article/tokenring-2026-1-8-beyond-the-vector-databricks-unveils-instructed-retrieval-to-solve-the-enterprise-rag-accuracy-crisis)

[2] How SQL Server 2025 Enables Retrieval-Augmented Generation Workflows — [c-sharpcorner.com](https://www.c-sharpcorner.com/article/how-sql-server-enables-retrieval-augmented-generation-rag-workflows-embedding/)

[3] Hybrid Retrieval-Augmented Generation (RAG) Systems with Embedding Vector Databases — [researchgate.net](https://www.researchgate.net/publication/390326215_Hybrid_Retrieval-Augmented_Generation_RAG_Systems_with_Embedding_Vector_Databases)

[4] Enterprise RAG Architecture: A Practitioner's Guide — [applied-ai.com](https://www.applied-ai.com/briefings/enterprise-rag-architecture/)

[5] RAG in 2025: The enterprise guide to RAG, Graph RAG and agentic AI — [datanucleus.dev](https://datanucleus.dev/rag-and-agentic-ai/what-is-rag-enterprise-guide-2025)

[6] Enterprise RAG Guide 2026: Modular, GraphRAG & Agentic Patterns — [synvestable.com](https://www.synvestable.com/enterprise-rag.html)
