---
order: 3
---

# Semantic Cache

## Overview

Semantic Cache is an optimization technique that reduces LLM API call costs and latency through **semantic similarity-based caching**. Unlike traditional caches that only hit on exact matches, it counts as a cache hit when embedding similarity exceeds a threshold.

```
Traditional cache:
  Stored: "How to sort a Python list" → [LLM response]
  New query: "How to sort list in python" → cache miss ❌

Semantic Cache:
  "How to sort a Python list" → embed → [0.2, 0.7, ...]
  "How to sort list in python" → embed → [0.21, 0.68, ...]
  cosine_sim = 0.94 > threshold(0.9) → cache hit ✅
```

---

## How It Works

```mermaid
flowchart TD
    Q[User query] --> E[Generate embedding]
    E --> S[Search for similar query in vector DB]
    S --> T{"cosine_sim ≥ threshold?"}
    T -->|YES| R["Return stored response<br/>No LLM call"]
    T -->|NO| L["Call LLM → Store response<br/>with query embedding"]
```

---

## GPTCache

Open-source semantic cache library (developed by Zilliz) [1]:

```python
from gptcache import cache
from gptcache.adapter import openai
from gptcache.embedding import Onnx
from gptcache.manager import CacheBase, VectorBase, get_data_manager
from gptcache.similarity_evaluation import SearchDistanceEvaluation

# Initialize cache
onnx = Onnx()
data_manager = get_data_manager(
    CacheBase("sqlite"),          # store responses
    VectorBase("faiss", dimension=onnx.dimension),  # store embeddings
)
cache.init(
    embedding_func=onnx.to_embeddings,
    data_manager=data_manager,
    similarity_evaluation=SearchDistanceEvaluation(),
    similarity_threshold=0.8,   # similarity threshold
)

# OpenAI API calls are automatically cached afterward
response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "How to sort a Python list"}]
)
```

---

## Redis-based Semantic Cache Implementation

```python
import redis
from openai import OpenAI
import numpy as np

class SemanticCache:
    def __init__(self, threshold: float = 0.9):
        self.redis = redis.Redis()
        self.client = OpenAI()
        self.threshold = threshold
        self.entries: list[tuple[np.ndarray, str]] = []

    def embed(self, text: str) -> np.ndarray:
        vec = self.client.embeddings.create(
            input=text, model="text-embedding-3-small"
        ).data[0].embedding
        return np.array(vec, dtype=np.float32)

    def get(self, query: str) -> str | None:
        q = self.embed(query)
        q_norm = np.linalg.norm(q)
        best_sim, best_resp = -1.0, None
        for vec, resp in self.entries:
            sim = float(np.dot(q, vec) / (q_norm * np.linalg.norm(vec)))
            if sim > best_sim:
                best_sim, best_resp = sim, resp
        return best_resp if best_sim >= self.threshold else None

    def set(self, query: str, response: str) -> None:
        self.entries.append((self.embed(query), response))
        self.redis.set(f"sc:{hash(query)}", response)
```

---

## Performance Effects

Research results (GPT Semantic Cache, 2024) [2]:

| Metric | Value |
|------|------|
| Cache hit rate | 61.6 ~ 68.8% |
| Hit accuracy | 97%+ |
| Latency reduction | Instant response without API call |
| Cost reduction | 60~70% fewer API calls for same traffic |

---

## Category-Aware Cache

Apply different similarity thresholds per query type. Strict for factual queries, loose for creative:

```python
thresholds = {
    "factual": 0.95,      # fact verification — must be very similar to hit
    "creative": 0.70,     # creative — loose hit
    "code": 0.90,         # code — hit when language and purpose similar
    "conversation": 0.85  # conversation — middle threshold
}
```

---

## Practical Precautions: False Positives and Cache Isolation

Semantic caching improves speed and cost, but misconfigured similarity thresholds or cache keys can return wrong answers.

| Risk | Cause | Mitigation |
| :--- | :--- | :--- |
| **False Positive** | Different intent with similar wording ("How to cancel order" vs "How to track order") | Raise threshold ($\ge 0.92$) + verify key entities/intent |
| **Cross-Tenant Leakage** | Sharing cache across users/permissions | Partition cache keys by `tenant_id` / `role` |
| **Stale Answers** | Underlying docs or DB updated while cached response persists | Set TTL + invalidate cache on document re-indexing |
| **Time-Sensitive Queries** | Queries like "today's weather" or "current stock price" | Bypass cache via classifier or regex before lookup |

---

## Role in AI Engineering

Semantic Cache plays a key role in the **Runtime Optimization** layer of Loop Engineering (→ [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]]). It dramatically reduces API costs in customer support, internal tools, and education platforms with many repeated questions.

## Related Concepts
[[en/AI/Engineering/Context_Engineering/LLM_Memory|LLM Memory]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]] · [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Prompt_Engineering/Prompt_Caching|Prompt Caching]]

## References
1. GPTCache GitHub — [github.com/zilliztech/GPTCache](https://github.com/zilliztech/GPTCache)
2. "GPT Semantic Cache: Reducing LLM Costs and Latency via Semantic Embedding Caching" (2024) — [arXiv:2411.05276](https://arxiv.org/abs/2411.05276)
