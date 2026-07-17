---
order: 2
---

# Vector Storage (벡터 저장소)

## 개요

**Vector Storage**(Vector Database, 벡터 DB)는 고차원 벡터(임베딩)를 저장하고, 주어진 쿼리 벡터와 **의미적으로 유사한** 벡터를 빠르게 검색하는 특수 데이터베이스다. RAG 파이프라인에서 청킹된 문서의 임베딩을 저장하고 검색하는 핵심 인프라다.

## 왜 일반 DB로 부족한가

```
텍스트 유사도 검색:
  "강아지 먹이"와 "개 사료" → 동일 의미이나 키워드 다름
  
SQL WHERE: "개 사료" IN documents → 일치 없음 ❌
Vector DB: cos_sim(embed("강아지 먹이"), embed("개 사료")) ≈ 0.92 → 검색됨 ✅
```

## ANN (Approximate Nearest Neighbor) 검색

정확한 최근접 이웃 검색(Exact NN)은 O(N×d) 연산으로 대규모 데이터에서 너무 느림. 벡터 DB는 ANN 알고리즘으로 **근사 검색**을 빠르게 수행:

### HNSW (Hierarchical Navigable Small World)
- **원리**: 여러 계층의 그래프로 벡터를 구성. 높은 계층에서 넓게 탐색, 낮은 계층에서 세밀하게 탐색.
- **특징**: 빠른 검색 (O(log N)), 높은 정확도, 동적 삽입 가능
- **단점**: 메모리 사용↑
- Pinecone, Weaviate, Qdrant에서 기본 사용

### FAISS (Facebook AI Similarity Search)
- Meta AI가 개발한 오픈소스 ANN 라이브러리
- IVF (Inverted File Index) + PQ (Product Quantization) 조합
- 수십억 벡터 대상 검색에 최적화
- GPU 가속 지원

### ScaNN (Google)
- Google이 개발, Vertex AI Vector Search에서 사용
- Asymmetric Hashing + Anisotropic Quantization
- 대규모 (수십억) 벡터에서 최고 성능

## 주요 벡터 DB 비교

| DB | 호스팅 | 특징 | 적합 케이스 |
|----|-------|------|-----------|
| **Pinecone** | 완전 관리형 SaaS | 쉬운 설정, 필터링 강력 | 빠른 프로토타이핑, 스타트업 |
| **Weaviate** | 자체 호스팅/클라우드 | GraphQL, 멀티모달 | 복잡한 쿼리 |
| **Qdrant** | 자체 호스팅/클라우드 | Rust 기반, 빠른 필터링 | 고성능 자체 호스팅 |
| **Chroma** | 로컬/자체 호스팅 | 개발자 친화, 가벼움 | 개발·테스트 |
| **pgvector** | PostgreSQL 확장 | 기존 Postgres와 통합 | 기존 PG 인프라 보유 |
| **FAISS** | 로컬 라이브러리 | 메모리 내, 빠름 | PoC, 소규모 |
| **Milvus** | 자체 호스팅 | 엔터프라이즈급 확장성 | 대규모 엔터프라이즈 |

## 벡터 DB 핵심 기능

### 유사도 메트릭
```python
# 코사인 유사도: 방향(의미) 유사성
cosine_sim = dot(A, B) / (||A|| × ||B||)

# 유클리드 거리: 절대 거리
euclidean = sqrt(Σ(a_i - b_i)²)

# 내적 (Inner Product): 방향 + 크기 모두 고려
dot_product = Σ(a_i × b_i)
```

임베딩 기반 의미 검색에는 **코사인 유사도** 가장 많이 사용.

### 메타데이터 필터링
```python
# 벡터 검색 + 메타데이터 필터 동시 적용
results = collection.query(
    query_embeddings=[query_vector],
    n_results=5,
    where={
        "source": "legal_docs",
        "year": {"$gte": 2022},
        "language": "ko"
    }
)
```

### Hybrid Search
Dense (벡터) + Sparse (키워드, BM25) 검색을 결합:
```
최종 점수 = α × dense_score + (1-α) × sparse_score
```
- 키워드 정확 매칭 + 의미적 유사도 동시 활용
- RRF (Reciprocal Rank Fusion)으로 결과 합산

## 인덱싱 파이프라인

```python
# 전형적인 인덱싱 파이프라인
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 1. 임베딩 모델 초기화
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# 2. 청크를 벡터 DB에 저장
vectorstore = Chroma.from_documents(
    documents=chunks,  # 청킹된 문서들
    embedding=embeddings,
    collection_name="my_docs",
    persist_directory="./chroma_db"
)

# 3. 검색
retriever = vectorstore.as_retriever(
    search_type="mmr",   # Maximal Marginal Relevance (다양성 보장)
    search_kwargs={"k": 5, "fetch_k": 20}
)
results = retriever.invoke("질문 내용")
```

## MMR (Maximal Marginal Relevance)

상위-K 결과가 유사한 문서로만 채워지는 문제 방지:
```
MMR 점수 = λ × sim(query, doc) - (1-λ) × max_sim(doc, already_selected)
```
관련성과 다양성의 균형을 맞춰 중복 결과 최소화.

## AI Engineering에서의 역할

벡터 DB는 RAG 시스템의 **장기 기억** 역할을 한다. 수백만 개의 문서를 수 밀리초 안에 의미 기반으로 검색하는 것을 가능하게 만든다. 선택은 규모(문서 수), 호스팅 요구사항, 필터링 복잡도, 비용에 따라 결정된다.

## 관련 개념
[[Chunking_Strategies]] · [[Advanced_Retrieval]] · [[Memory_and_Semantic_Cache]]

## 출처
- Vertex AI Vector Search 문서 — [[22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)]]
- Johnson et al. (2019) "Billion-scale similarity search with GPUs (FAISS)" — [arXiv:1702.08734](https://arxiv.org/abs/1702.08734)
- Malkov & Yashunin (2018) "Efficient and robust approximate nearest neighbor search using HNSW" — [arXiv:1603.09320](https://arxiv.org/abs/1603.09320)
