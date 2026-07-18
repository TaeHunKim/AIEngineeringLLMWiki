---
order: 3
---

# Runtime Optimization

## Overview

**Runtime Optimization** is the technology and strategy for **real-time optimization of cost, latency, and throughput** while AI systems run in production. It covers ways to increase operational efficiency without retraining the model.

## Why It's Needed

```
GPT-4 Turbo costs (2024):
  Input: $10 / 1M tokens
  Output: $30 / 1M tokens

1 million requests/month, average 2000 tokens/request:
  Cost = 1M × 2000 / 1000 × ($10 + $30) / 2 = $40,000/month

→ 10% reduction = $4,000/month = $48,000/year
```

## Semantic Cache

### Concept

Traditional caches only store exact string matches. A **Semantic Cache** reuses cached responses for semantically similar queries.

```
Traditional cache:
  "What is Python?" → cache HIT
  "Can you explain Python?" → cache MISS (different string)

Semantic Cache:
  "What is Python?" → cache HIT
  "Can you explain Python?" → cache HIT (semantic similarity 0.94)
```

### Implementation

```python
from langchain.cache import InMemoryCache, SQLiteCache
from langchain.globals import set_llm_cache
import numpy as np
from redis import Redis

class SemanticCache:
    def __init__(self, redis_client: Redis, similarity_threshold: float = 0.85):
        self.redis = redis_client
        self.threshold = similarity_threshold
        self.embedding_model = OpenAIEmbeddings()
    
    def _embed(self, text: str) -> np.ndarray:
        return np.array(self.embedding_model.embed_query(text))
    
    def get(self, query: str) -> Optional[str]:
        query_embedding = self._embed(query)
        
        # Load all cached item embeddings from Redis
        cached_keys = self.redis.keys("cache:*")
        
        best_similarity = 0
        best_response = None
        
        for key in cached_keys:
            cached_data = json.loads(self.redis.get(key))
            cached_embedding = np.array(cached_data["embedding"])
            
            # Compute cosine similarity
            similarity = np.dot(query_embedding, cached_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(cached_embedding)
            )
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_response = cached_data["response"]
        
        if best_similarity >= self.threshold:
            return best_response  # cache HIT
        return None  # cache MISS
    
    def set(self, query: str, response: str, ttl: int = 3600):
        embedding = self._embed(query)
        cache_entry = {
            "query": query,
            "embedding": embedding.tolist(),
            "response": response
        }
        key = f"cache:{hash(query)}"
        self.redis.setex(key, ttl, json.dumps(cache_entry))

# Usage
cache = SemanticCache(Redis())

def cached_llm_call(query: str) -> str:
    # Check cache first
    cached = cache.get(query)
    if cached:
        return cached  # return immediately without LLM call
    
    # Cache MISS: call LLM
    response = llm.invoke(query)
    cache.set(query, response)  # store in cache
    return response
```

### GPTCache

Open-source Semantic Cache library:

```python
from gptcache import cache
from gptcache.adapter import openai
from gptcache.embedding import Onnx
from gptcache.similarity_evaluation import SearchDistanceEvaluation
from gptcache.manager import CacheBase, VectorBase, get_data_manager

# Initialize cache
onnx = Onnx()
data_manager = get_data_manager(CacheBase("sqlite"), VectorBase("faiss", dimension=onnx.dimension))

cache.init(
    embedding_func=onnx.to_embeddings,
    data_manager=data_manager,
    similarity_evaluation=SearchDistanceEvaluation()
)
cache.set_openai_key()

# Transparently cache OpenAI API calls
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "What is Python?"}]
)
# Second similar question: returned from cache (no API call)
```

**GPTCache performance**:
- Cache hit rate: 61.6~68.8% (environments with many similar queries)
- Response speed: under 100ms (vs LLM 1-10 seconds)
- Cost reduction: API cost reduced by hit rate amount

## Model Routing

Selecting the appropriate model based on query complexity:

```python
class ModelRouter:
    """Select optimal model based on query complexity"""
    
    def __init__(self):
        self.cheap_model = ChatOpenAI(model="gpt-4o-mini")   # $0.15/1M input
        self.expensive_model = ChatOpenAI(model="gpt-4o")    # $2.5/1M input
    
    def route(self, query: str) -> tuple:
        complexity = self.assess_complexity(query)
        
        if complexity < 0.3:
            return self.cheap_model, "cheap"    # simple question
        elif complexity < 0.7:
            return self.cheap_model, "cheap"    # medium complexity also cheap model
        else:
            return self.expensive_model, "expensive"  # only complex analysis uses expensive
    
    def assess_complexity(self, query: str) -> float:
        """Estimate complexity with simple heuristics"""
        signals = {
            "length": min(len(query) / 500, 1.0) * 0.3,
            "math": 0.3 if any(c in query for c in ["calculate", "formula", "proof"]) else 0,
            "analysis": 0.2 if any(c in query for c in ["analyze", "compare", "evaluate"]) else 0,
            "code": 0.2 if "code" in query or "```" in query else 0,
        }
        return sum(signals.values())
```

### RouteLLM *(ICLR 2025)*

A **learned router** framework jointly developed by UC Berkeley, Anyscale, and Canva. Instead of heuristics, routing is performed by a model trained on preference data.

```
RouteLLM performance (MT-Bench):
  - 85% cost reduction
  - 95% GPT-4 Turbo quality maintained
  - Matrix Factorization router: only 14% of queries forwarded to strong model

MMLU:
  - Up to 45% cost reduction
  - GPT-4 performance maintained

Supported router types:
  1. BERT classifier
  2. LLM-based classifier
  3. Matrix Factorization (most efficient)
  4. Causal LLM
```

```python
# RouteLLM usage example
from routellm.controller import Controller

client = Controller(
    routers=["mf"],   # matrix factorization router
    strong_model="gpt-4o",
    weak_model="gpt-4o-mini",
)

# Automatically selects model based on query complexity
response = client.chat.completions.create(
    model="router-mf-0.11856",  # set cost threshold
    messages=[{"role": "user", "content": query}]
)
```

### RouteProfile *(May 2026)*

A general-purpose framework that systematically defines each LLM's "profile" (strengths, weaknesses, cost characteristics) for routing. Goes beyond a single pair (strong/weak) to select the optimal model from a **multi-model pool**.

```
2026 routing trends:
  1. Cascade: weak model first → retry with strong model if uncertain
  2. Consensus: same query to multiple models → aggregate results
  3. Speculative: weak model drafts → strong model validates (similar to Speculative Decoding)
```

## Batch Processing

Bundling multiple requests reduces API overhead:

```python
import asyncio

async def batch_llm_calls(queries: list[str], batch_size: int = 10) -> list[str]:
    """Asynchronous batch processing"""
    results = []
    
    for i in range(0, len(queries), batch_size):
        batch = queries[i:i + batch_size]
        
        # Parallel execution within batch
        tasks = [llm.ainvoke(q) for q in batch]
        batch_results = await asyncio.gather(*tasks)
        results.extend(batch_results)
    
    return results
```

## Streaming

Minimize Time-to-First-Token to improve perceived speed:

```python
# LangChain streaming
for chunk in llm.stream("Write a long analysis report"):
    print(chunk.content, end="", flush=True)
    # → First token delivered to user in 0.5 seconds
    # (total completion 10s vs TTFB 0.5s)
```

## Cost Control Loop

```python
class CostControlLoop:
    def __init__(self, monthly_budget_usd: float):
        self.budget = monthly_budget_usd
        self.spent = 0
        self.router = ModelRouter()
    
    def get_current_model(self, query: str):
        """Adjust model selection based on remaining budget"""
        budget_remaining = 1 - (self.spent / self.budget)
        
        if budget_remaining < 0.1:  # 90% of budget consumed
            return self.router.cheap_model  # force cheap model
        else:
            model, _ = self.router.route(query)
            return model
    
    def record_cost(self, tokens_used: int, model: str):
        pricing = {"gpt-4o": 0.0025, "gpt-4o-mini": 0.00015}
        cost = tokens_used / 1000 * pricing.get(model, 0.001)
        self.spent += cost
        
        if self.spent > self.budget * 0.8:
            alert_team(f"80% of monthly budget consumed: ${self.spent:.2f}/${self.budget}")
```

## Speculative Decoding *(Production Standard 2025)*

**Speculative Decoding** is a technique where a small Draft model pre-predicts tokens, and a large Target model verifies them in bulk. It leverages GPU parallel processing to achieve **2-3x speed improvement without quality loss**.

```
Traditional Autoregressive generation:
  "The" → "cat" → "sat" → "on"
  (1 token at a time, 4 memory loads)

Speculative Decoding:
  Draft model: "The cat sat on" (predict 4 simultaneously)
  Target model: verify 4 in parallel at once
  → Same result with 1 memory load
```

```
2025 production status:
  - Built into vLLM, SGLang, TensorRT-LLM by default
  - NVIDIA H200: 3.6x throughput improvement achieved
  - Draft model predicts 5-8 tokens → Target model parallel verification
  - Output quality: identical to Target model (mathematically equivalent)

Major variants:
  - SpecInfer: tree-structured draft increases acceptance opportunities
  - EAGLE: specialized draft head improves acceptance rate
  - Medusa: multiple heads predict multiple tokens in parallel
```

## Serving Engine Internals

While Semantic Cache and Routing address "which requests to reduce and how," serving engines address "how to process each request most efficiently on GPU." Core techniques of the three engines that have become the standard stack for production self-hosting:

### vLLM — PagedAttention and Continuous Batching

```
Problem: Traditional batching assumes all requests in a batch are the same length
      → Short responses must wait for long responses (GPU idle time)
      → KV Cache pre-allocated as contiguous memory blocks → fragmentation/waste

PagedAttention (vLLM, UC Berkeley 2023):
  Apply OS virtual memory paging to KV Cache
  → KV Cache allocated in non-contiguous fixed-size blocks (pages)
  → Memory waste reduced to under 4% (up to 24x throughput vs traditional systems)

Continuous Batching:
  Completed requests immediately leave batch and new requests join instantly
  → No waiting for fixed batch size → maximize GPU utilization
```

### SGLang — RadixAttention

Specialized for workloads with many prefix overlaps (multiple requests sharing the same system prompt, few-shot example reuse).

```
RadixAttention:
  Cache and reuse KV Cache of prompt prefixes shared by multiple requests
  using a Radix Tree (trie data structure)

  Example: 100 requests sharing a 500-token system prompt
    → Traditional: recalculate 500-token KV Cache for each request
    → RadixAttention: shared prefix calculated only once, reused from tree
```

Particularly effective for multi-turn conversations with heavy prefix sharing, few-shot prompting, and agents (repeated system prompts + tool definitions).

### TensorRT-LLM — FP8 / NVFP4

NVIDIA's serving engine that aggressively leverages low-precision arithmetic of the latest GPU architectures (Blackwell). The core is using FP8/NVFP4 (4-bit floating point) quantization to increase throughput while minimizing accuracy loss — detailed production quantization techniques → [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]]

### Disaggregated Prefill/Decode (Disaggregated Serving)

LLM inference splits into two stages with different characteristics: **Prefill** (processes input prompt at once, GPU compute-intensive) and **Decode** (generates tokens one by one, memory bandwidth-intensive). Processing both stages on the same GPU causes resource requirements to conflict.

```
Traditional (unified serving): One GPU pool handles both Prefill + Decode
  → Long Prefill increases Decode latency (head-of-line blocking)

Disaggregated Serving (NVIDIA Dynamo, llm-d, etc.):
  Physically separate Prefill-dedicated GPU pool + Decode-dedicated GPU pool
  → Transfer KV Cache to Decode pool after Prefill (KV Cache Transfer)
  → Each stage can be independently scaled and optimized
```

### Self-Hosting Serving Options Comparison

| Engine | Strengths | Best case |
|--------|----------|-----------|
| **vLLM** | PagedAttention, broad model support, mature ecosystem | Default choice for general-purpose production serving |
| **SGLang** | RadixAttention, strong on structured output | Agent/multi-turn workloads with heavy prefix sharing |
| **TensorRT-LLM** | NVIDIA GPU optimization, FP8/NVFP4 | Maximum throughput needed on latest NVIDIA hardware |
| **llama.cpp** | Runs on CPU/edge, low resource requirements | Local/edge deployment, small models |
| **Ollama** | llama.cpp-based, very easy install/management | Developer local environment, prototyping |
| **TGI** (HuggingFace) | HuggingFace ecosystem integration | Quickly serving HF Hub models |

### Cold Start and Multi-Region

In serverless LLM deployment, cold start — loading model weights (tens of GB) to a new instance — is a major source of latency. Mitigation techniques: weight prefetching, snapshot-based fast restore, warm pool (maintain minimum instances). In multi-region deployment, KV Cache Locality (route users back to the region where they previously requested, to maintain cache reuse rates) has a significant impact on cost and latency.

## Optimization Strategy Summary

| Strategy | Cost reduction | Latency reduction | Implementation complexity |
|----------|---------------|-------------------|--------------------------|
| Semantic Cache | 40-70% | 90%+ | Medium |
| RouteLLM (learned router) | 85% | 20-40% | Medium |
| Model Routing (heuristic) | 30-60% | 20-40% | Low |
| Speculative Decoding | None | 2-3x speed | Medium (built into serving framework) |
| Streaming | None | TTFB 80%+ | Low |
| Batching | 10-20% | 2-5x throughput | Low |
| Quantization | N/A (self-hosting) | 30-50% | High |
| Prompt Compression | 20-40% | 20-30% | Medium |
| PagedAttention (vLLM) | N/A (self-hosting) | Up to 24x throughput | Medium (built into engine) |
| RadixAttention (SGLang) | N/A (self-hosting) | Significant reduction when prefix reused | Medium (built into engine) |
| Disaggregated Serving | N/A (self-hosting) | Optimized Prefill/Decode separately | High (infrastructure separation needed) |

## Role in AI Engineering

Runtime Optimization is the engineering that **makes AI services economically sustainable**. Since 2025, learned routers like RouteLLM have replaced simple heuristics, and Speculative Decoding has become the production standard — making it possible to deliver the same model quality at much lower cost and latency. API-side optimizations (caching, routing, batching) and self-hosting serving engine internal optimizations (PagedAttention, RadixAttention, Disaggregated Serving) are different layers, and both must be considered together to minimize Total Cost of Ownership (TCO). For gateway and deployment strategy organizational-level production operations → [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]]

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]] · [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]] · [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]] · [[en/AI/Engineering/Loop_Engineering/Data_Flywheel|Data Flywheel]] · [[en/AI/Engineering/Context_Engineering/Memory_and_Semantic_Cache|Memory & Semantic Cache]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]]

## Sources
- GPTCache GitHub — [github.com/zilliztech/GPTCache](https://github.com/zilliztech/GPTCache)
- Ong et al. (ICLR 2025) "RouteLLM: Learning to Route LLMs with Preference Data" — [arxiv.org/abs/2406.18665](https://arxiv.org/abs/2406.18665)
- "Speculative Decoding: 2-3x Faster LLM Inference" (2026) — [blog.premai.io](https://blog.premai.io/speculative-decoding-2-3x-faster-llm-inference-2026/)
- LangChain Caching docs — [python.langchain.com](https://python.langchain.com/docs/how_to/llm_caching/)
- Anthropic "Reducing LLM API Costs" — [anthropic.com/docs](https://docs.anthropic.com/en/docs/build-with-claude/caching)
- Kwon et al. (2023) "Efficient Memory Management for LLM Serving with PagedAttention" — [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)
- Zheng et al. (2024) "SGLang: Efficient Execution of Structured Language Model Programs" — [arXiv:2312.07104](https://arxiv.org/abs/2312.07104)
- NVIDIA "TensorRT-LLM" docs — [nvidia.github.io/TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/)
- NVIDIA "Dynamo: Disaggregated Serving" — [developer.nvidia.com](https://developer.nvidia.com/blog/introducing-nvidia-dynamo/)
