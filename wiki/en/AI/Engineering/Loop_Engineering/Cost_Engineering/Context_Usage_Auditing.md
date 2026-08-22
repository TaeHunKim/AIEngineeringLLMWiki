---
order: 3
---

# Context Usage Auditing

## Overview

Context is, from the model's perspective, ultimately still prompt and still token consumption. But there's a question worth asking before input/output compression itself: **is the context retrieved via RAG actually being used to generate the response?** A chunk that was retrieved but never reflected in the final response is pure wasted cost. Context Usage Auditing is the practice of having a watcher agent continuously detect and eliminate this waste by analyzing production logs.

To avoid overlapping with [[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]] (techniques like LLM Lingua that compress the prompt itself), this document narrows its scope to **auditing which already-retrieved context was actually used**.

## The Practical Limits of Input/Output Optimization

Several techniques for writing terser prompts or trimming unnecessary output tokens are well known (including so-called "caveman-speak" skills), but in practice — especially in multi-agent settings — **strictly conforming to input/output formats** often matters far more than these micro-savings. If the message format exchanged between agents breaks, it cascades into parsing failures and chained errors, costing far more than the tokens saved. So instead of "write shorter prompts," this document focuses on **not retrieving and injecting unnecessary context in the first place**, as described below.

## RAG Chunk Usage Auditing

```
Audit pipeline:
  1. Assign a unique ID to each chunk retrieved for a request (retrieval stage)
  2. After generating the final response, determine whether the response
     actually cited/relied on each chunk
     - Judgment method: attribution matching between chunk content and
       response sentences, or LLM-as-a-Judge scoring "did this chunk
       contribute to the answer?"
  3. Accumulate a "retrieved vs. actually used" ratio per chunk
  4. Identify chunk sources/categories with persistently low usage
```

Persistently low usage can have two causes — (a) retrieval-K is set too high, or (b) the reranking threshold is letting low-relevance chunks through. Usage-audit data provides the evidence to tell which of the two is the actual problem.

## Automatically Adjusting Retrieval-K and Reranking Thresholds

```python
# Conceptual example: gradually tuning retrieval parameters from usage-audit results
class ContextUsageAuditor:
    def analyze_window(self, logs: list[RequestLog]) -> dict:
        usage_by_source = defaultdict(lambda: {"retrieved": 0, "used": 0})
        for log in logs:
            for chunk in log.retrieved_chunks:
                usage_by_source[chunk.source]["retrieved"] += 1
                if chunk.id in log.attributed_chunk_ids:
                    usage_by_source[chunk.source]["used"] += 1
        return usage_by_source

    def suggest_adjustment(self, usage_stats: dict) -> dict:
        suggestions = {}
        for source, stats in usage_stats.items():
            usage_rate = stats["used"] / max(stats["retrieved"], 1)
            if usage_rate < 0.3:  # persistently low usage
                suggestions[source] = "consider lowering retrieval_k or raising the reranking threshold"
        return suggestions
```

As with [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity-Aware Model Routing]], this adjustment shouldn't be applied to production immediately — it needs a period comparing response quality before and after (especially context recall — whether needed information starts going missing). Shrinking retrieval-K too aggressively improves usage rate but risks dropping information that was actually needed.

## Relationship to Established Context Pruning Techniques

If usage auditing is the outer loop adjusting "how much to retrieve from which source/category," established inner-loop techniques for re-filtering the chunks retrieved within a single request already exist — for example, frameworks like AdaGReS jointly optimize inter-chunk redundancy and query relevance, filtering out the redundant, low-relevance chunks that standard top-k retrieval leaves behind. Usage auditing is best understood as the **higher-level layer that verifies, from accumulated data, whether these per-request pruning techniques are actually working well and whether the retrieval configuration itself is appropriate in the first place**.

## Role in AI Engineering

Among the three mechanisms covered by [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]], Context Usage Auditing has a relatively smaller savings potential but also the lowest side-effect risk — unlike swapping models (routing) or eliminating LLM calls entirely (scriptification), it only adjusts context composition, so failures have a narrow blast radius. For practicality, though, priority should always go to "not breaking a multi-agent pipeline's input/output contract" over "saving tokens."

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]] · [[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]] · [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic Context Management]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling]]

## Sources
- "AdaGReS: Adaptive Greedy Context Selection via Redundancy-Aware Scoring for Token-Budgeted RAG" (2026) — [arXiv:2512.25052](https://arxiv.org/pdf/2512.25052)
- Milvus Blog, "LLM Context Pruning: Improving RAG and Agentic AI Systems" — [milvus.io](https://milvus.io/blog/llm-context-pruning-a-developers-guide-to-better-rag-and-agentic-ai-results.md)
