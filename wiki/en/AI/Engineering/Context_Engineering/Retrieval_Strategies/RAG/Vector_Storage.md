---
order: 2
---

# Vector Storage

## Overview

**Vector Storage** (Vector Database, Vector DB) is a specialized database that stores high-dimensional vectors (embeddings) and quickly retrieves vectors **semantically similar** to a given query vector. It is the core infrastructure in RAG pipelines for storing and retrieving embeddings of chunked documents.

## Why Regular DBs Are Insufficient

```
Text similarity search:
  "puppy food" and "dog kibble" → same meaning but different keywords
  
SQL WHERE: "dog kibble" IN documents → no match ❌
Vector DB: cos_sim(embed("puppy food"), embed("dog kibble")) ≈ 0.92 → found ✅
```

## ANN (Approximate Nearest Neighbor) Search

Exact nearest neighbor search (Exact NN) is O(N×d) operations — too slow for large-scale data. Vector DBs perform fast **approximate search** with ANN algorithms:

### HNSW (Hierarchical Navigable Small World)
- **Principle**: Organizes vectors into a multi-layer graph. Broad search at high layers, fine search at low layers.
- **Characteristics**: Fast search (O(log N)), high accuracy, dynamic insertion possible
- **Cons**: High memory usage
- Default in Pinecone, Weaviate, Qdrant

### FAISS (Facebook AI Similarity Search)
- Open-source ANN library developed by Meta AI
- IVF (Inverted File Index) + PQ (Product Quantization) combination
- Optimized for searching billions of vectors
- GPU acceleration support

### ScaNN (Google)
- Developed by Google, used in Vertex AI Vector Search
- Asymmetric Hashing + Anisotropic Quantization
- Best performance at large scale (billions) of vectors

## Key Vector DB Comparison

| DB | Hosting | Features | Suitable for |
|----|-------|------|-----------|
| **Pinecone** | Fully managed SaaS | Easy setup, powerful filtering | Rapid prototyping, startups |
| **Weaviate** | Self-hosted/cloud | GraphQL, multimodal | Complex queries |
| **Qdrant** | Self-hosted/cloud | Rust-based, fast filtering | High-performance self-hosting |
| **Chroma** | Local/self-hosted | Developer-friendly, lightweight | Development and testing |
| **pgvector** | PostgreSQL extension | Integrates with existing Postgres | Existing PG infrastructure |
| **FAISS** | Local library | In-memory, fast | PoC, small scale |
| **Milvus** | Self-hosted | Enterprise-scale scalability | Large enterprise |

## Vector DB Core Features

### Similarity Metrics
```python
# Cosine similarity: directional (semantic) similarity
cosine_sim = dot(A, B) / (||A|| × ||B||)

# Euclidean distance: absolute distance
euclidean = sqrt(Σ(a_i - b_i)²)

# Inner Product: considers both direction and magnitude
dot_product = Σ(a_i × b_i)
```

**Cosine similarity** is most commonly used for embedding-based semantic search.

### Metadata Filtering
```python
# Apply vector search + metadata filter simultaneously
results = collection.query(
    query_embeddings=[query_vector],
    n_results=5,
    where={
        "source": "legal_docs",
        "year": {"$gte": 2022},
        "language": "en"
    }
)
```

### Hybrid Search
Combine Dense (vector) + Sparse (keyword, BM25) search:
```
Final score = α × dense_score + (1-α) × sparse_score
```
- Leverage both exact keyword matching + semantic similarity
- Combine results with RRF (Reciprocal Rank Fusion)

## Indexing Pipeline

```python
# Typical indexing pipeline
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 1. Initialize embedding model
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# 2. Store chunks in vector DB
vectorstore = Chroma.from_documents(
    documents=chunks,  # chunked documents
    embedding=embeddings,
    collection_name="my_docs",
    persist_directory="./chroma_db"
)

# 3. Retrieve
retriever = vectorstore.as_retriever(
    search_type="mmr",   # Maximal Marginal Relevance (ensure diversity)
    search_kwargs={"k": 5, "fetch_k": 20}
)
results = retriever.invoke("query content")
```

## MMR (Maximal Marginal Relevance)

Prevents top-K results from being filled with only similar documents:
```
MMR score = λ × sim(query, doc) - (1-λ) × max_sim(doc, already_selected)
```
Balances relevance and diversity to minimize duplicate results.

## Role in AI Engineering

Vector DBs serve as the **long-term memory** of RAG systems. They make it possible to semantically retrieve millions of documents in milliseconds. The choice depends on scale (document count), hosting requirements, filtering complexity, and cost.

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]] · [[en/AI/Engineering/Context_Engineering/Memory_and_Semantic_Cache|Memory & Semantic Cache]]

## Sources
- Johnson et al. (2019) "Billion-scale similarity search with GPUs (FAISS)" — [arXiv:1702.08734](https://arxiv.org/abs/1702.08734)
- Malkov & Yashunin (2018) "Efficient and robust approximate nearest neighbor search using HNSW" — [arXiv:1603.09320](https://arxiv.org/abs/1603.09320)
