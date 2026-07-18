---
order: 0
nav_order: 30
---

# Context Engineering

## Overview

**Context Engineering** is the art of designing **what to put, in what order, and how to put it** into the LLM's context window. Andrej Karpathy (2025) introduced it as the successor concept to Prompt Engineering, providing a broader view that "a prompt is just part of context."

```
Context window = System Prompt + retrieved documents + conversation history
                + tool results + user input + ...

Context Engineering = the art of filling this space most usefully
```

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Context_Engineering/Memory_and_Semantic_Cache\|Memory & Semantic Cache]] | Memory & Semantic Cache overview (index) |
| [[en/AI/Engineering/Context_Engineering/LLM_Memory\|LLM Memory]] | LLM Memory 4 types, Conversation strategies, Letta/Mem0/Zep implementations |
| [[en/AI/Engineering/Context_Engineering/Semantic_Cache\|Semantic Cache]] | Semantic similarity caching, GPTCache, cost reduction effects |
| [[en/AI/Engineering/Context_Engineering/Context_Compression\|Context Compression]] | LLM Lingua, Map-Reduce, cost reduction |
| [[en/AI/Engineering/Context_Engineering/Lost_in_the_Middle\|Lost in the Middle]] | LLM performance degradation for middle-of-context info and avoidance strategies |

> **RAG, GraphRAG, NL2SQL, SQL RAG** documents are in a separate chapter.
> → See [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies chapter]]

## Core Challenges

```
1. What to include?    → Retrieval Strategies (RAG / GraphRAG / SQL RAG) for relevant info
2. How to compress?   → Context Compression to save tokens
3. How to remember?   → Memory & Semantic Cache
4. In what order?     → Avoid the "Lost in the Middle" problem (→ [[en/AI/Engineering/Context_Engineering/Lost_in_the_Middle|Lost in the Middle]])
```

## Role in AI Engineering

Context Engineering is the **layer that determines LLM's immediate performance**. Correct context composition alone can improve performance 2-3x without fine-tuning. RAG architecture design is the core practice of this layer.

## Related Concepts
[[en/AI/Engineering/Prompt_Engineering/Prompt_Engineering|Prompt Engineering]] · [[en/AI/Engineering/Flow_Engineering/Flow_Engineering|Flow Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]]
