---
order: 3
---

# Runtime Optimization

## Overview

**Runtime Optimization** is the strategy for optimizing cost and latency by **reducing the number and size of API calls the application itself makes** while an AI system runs in production. It covers ways to increase operational efficiency without retraining the model. How to maximize GPU resource utilization inside a self-hosted serving engine (PagedAttention, RadixAttention, Speculative Decoding, distributed serving, etc.) is covered in the separate [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]] chapter — the two chapters optimize different layers: the **API-calling side** versus **inside the serving engine**.

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

Traditional caches only store exact string matches, but a **Semantic Cache** reuses cached responses for semantically similar queries.

```
Traditional cache:
  "What is Python?" → cache HIT
  "Can you explain Python?" → cache MISS (different string)

Semantic Cache:
  "What is Python?" → cache HIT
  "Can you explain Python?" → cache HIT (semantic similarity 0.94)
```

Implementation detail via GPTCache and hit-rate/cost-reduction figures are covered in [[en/AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]].

## Model Routing

A strategy that splits calls between a cheap model and an expensive model based on query complexity. Sophistication ranges from simple heuristic routers up to learned routers like RouteLLM (reported 85% cost reduction, 95% GPT-4 Turbo quality maintained).

```python
# Conceptual example — see the document below for detailed implementation, RouteLLM, RouteProfile
class ModelRouter:
    def route(self, query: str) -> str:
        complexity = self.assess_complexity(query)
        return "expensive_model" if complexity > 0.7 else "cheap_model"
```

Implementation detail for **static rule-based routing** (BERT classifier, Matrix Factorization, RouteProfile, etc.) is covered in [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity-Aware Model Routing]] — that document also includes the **dynamic** version, where a watcher agent continuously regenerates the routing policy itself from production logs.

## Batch Processing

Bundling multiple requests reduces API overhead:

```python
import asyncio

async def batch_llm_calls(queries: list[str], batch_size: int = 10) -> list[str]:
    """Asynchronous batch processing"""
    results = []
    for i in range(0, len(queries), batch_size):
        batch = queries[i:i + batch_size]
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
            return self.router.route(query)

    def record_cost(self, tokens_used: int, model: str):
        pricing = {"gpt-4o": 0.0025, "gpt-4o-mini": 0.00015}
        cost = tokens_used / 1000 * pricing.get(model, 0.001)
        self.spent += cost
        if self.spent > self.budget * 0.8:
            alert_team(f"80% of monthly budget consumed: ${self.spent:.2f}/${self.budget}")
```

A production-grade autonomous version of this watcher pattern is covered in [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]].

## Optimization Strategy Summary (Application Layer)

| Strategy | Cost reduction | Latency reduction | Implementation complexity |
|----------|---------------|-------------------|--------------------------|
| Semantic Cache | 40-70% | 90%+ | Medium |
| RouteLLM (learned router) | 85% | 20-40% | Medium |
| Model Routing (heuristic) | 30-60% | 20-40% | Low |
| Streaming | None | TTFB 80%+ | Low |
| Batching | 10-20% | 2-5x throughput | Low |
| Prompt Compression | 20-40% | 20-30% | Medium |

Figures for serving-engine-internal optimizations (PagedAttention, RadixAttention, Speculative Decoding, Disaggregated Serving) are covered in each sub-document of [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]].

## Role in AI Engineering

Runtime Optimization is the engineering that **makes AI services economically sustainable**. API-side optimizations (caching, routing, batching) and self-hosting serving engine internal optimizations ([[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]]) are different layers, and both must be considered together to minimize Total Cost of Ownership (TCO). For gateway and deployment strategy organizational-level production operations, see [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]].

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]] · [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity-Aware Model Routing]] · [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]] · [[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]] · [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]]

## Sources
- GPTCache GitHub — [github.com/zilliztech/GPTCache](https://github.com/zilliztech/GPTCache)
- Ong et al. (ICLR 2025) "RouteLLM: Learning to Route LLMs with Preference Data" — [arxiv.org/abs/2406.18665](https://arxiv.org/abs/2406.18665)
- LangChain Caching docs — [python.langchain.com](https://python.langchain.com/docs/how_to/llm_caching/)
- Anthropic "Reducing LLM API Costs" — [anthropic.com/docs](https://docs.anthropic.com/en/docs/build-with-claude/caching)
