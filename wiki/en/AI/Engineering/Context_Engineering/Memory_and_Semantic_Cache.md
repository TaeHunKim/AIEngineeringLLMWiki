---
order: 1
---

# Memory & Semantic Cache

## Overview

In LLM systems, **Memory** is the mechanism for storing, maintaining, and utilizing previous interaction and knowledge, while **Semantic Cache** is an optimization technique that caches responses to similar queries to reduce LLM API call costs and latency.

```
Memory:
  "What did this user say before?" → personalization, continuity
  Persistent across sessions / real-time updates / user-specific customization

Semantic Cache:
  "Is there a similar response for this query?" → cost optimization
  Shared cache / read-only / common to all users
```

---

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Context_Engineering/LLM_Memory\|LLM Memory]] | LLM Memory 4 types, Conversation strategies, Letta/Mem0/Zep implementations, Memory vs RAG |
| [[en/AI/Engineering/Context_Engineering/Semantic_Cache\|Semantic Cache]] | Semantic similarity caching, GPTCache, Redis implementation, cost reduction effects |

---

## Key Comparison

| Item | Memory | Semantic Cache |
|------|--------|---------------|
| **Purpose** | Personalization, session continuity | Reduce API cost and latency |
| **Scope** | Per user/agent | Shared across all users |
| **Read/Write** | Read-Write | Read-Write (primarily read after write) |
| **Updates** | Real-time | Update on expiry |
| **Technology** | Vector DB, KG, KV Store | Vector DB + KV Store |

---

## Role in AI Engineering

- **Memory**: Core infrastructure bridging Context Engineering → Agent Engineering. Makes agents stateful, providing personalized long-term experiences.
- **Semantic Cache**: Plays a cost control role in the Runtime Optimization layer of Loop Engineering.

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]]
