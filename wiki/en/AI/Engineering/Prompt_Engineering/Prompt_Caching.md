---
order: 6
---

# Prompt Caching

## Overview

**Prompt Caching** caches the repeated leading portion of a prompt (a static prefix) server-side, so that later requests sharing the same prefix can **reuse the model's internal computation state (the KV Cache)**. This page treats it as a **prompt design problem**: how do you structure a prompt so it actually gets cached? For the cost/infrastructure angle on caching strategy, see [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]] and [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Loop_Engineering/Cost_Engineering]].

```
A general cache (e.g., Semantic Cache): "Do we already have an answer to this question?" → return the stored response as-is
Prompt Caching:                          "Have we already processed this prefix before?" → reuse only that computed state; the output is still generated fresh every time
```

## Why Reuse the KV Cache

When a Transformer processes a token, it attends to the Key/Value vectors of every prior token. When requests repeatedly start with the same system prompt, the same few-shot examples, or the same large document, the Key/Value computation for that prefix is identical every time. Prompt Caching stores that prefix's KV state server-side, and when the next request starts with the same prefix, it **skips recomputing that portion and continues from there**.

```
Request 1: [system prompt, 5,000 tokens] + [document, 20,000 tokens] + [question A]
           → processes all 25,000 tokens, writes the KV state to cache

Request 2: [system prompt, 5,000 tokens] + [document, 20,000 tokens] + [question B]  ← same prefix
           → cache hit: reuses the 25,000-token computation, only processes question B
```

Among the four memory types this wiki's [[en/AI/Engineering/Context_Engineering/LLM_Memory|LLM_Memory]] page organizes, **In-Cache Memory** refers to exactly this mechanism. But how to reflect this mechanism in prompt design is practically important enough to warrant its own treatment.

## Prompt Structure Design: Static Prefix First

Prompt Caching's payoff depends entirely on **how long a prefix is, how often it repeats, and how exactly identical it stays**. This flips the usual prompt-design ordering — put the most frequently changing content (the user's question) last, and the most stable content (system prompt, tool definitions, reference documents) first.

```
Cache-friendly structure (recommended):
  [System Prompt]                 ← never changes, goes first
  [Tool definitions / Few-shot examples] ← rarely changes
  [Retrieved documents / background] ← stable within a session
  [Conversation history]          ← grows slightly each turn
  [Current user question]         ← changes every time, goes last

Cache-hostile structure (anti-pattern):
  [current timestamp] + [System Prompt] + [question]
  → the very start of the prefix changes on every request → no cache hit ever happens
```

## Cache Breakpoints, TTL, and Cost Structure

Anthropic and OpenAI implement this differently.

| Aspect | Anthropic (Claude) | OpenAI |
|---|---|---|
| **How the cache is set** | Explicit `cache_control` breakpoints (up to 4 per request) | Automatic — auto-detects the longest matching prefix for prefixes ≥1,024 tokens |
| **TTL** | 5 minutes by default, 1-hour option (at a higher write cost) — TTL refreshes on every cache read | ~5–10 minutes, up to 1 hour during off-peak windows |
| **Write cost** | 1.25× the base input rate (5-minute cache) | No additional cost |
| **Read (hit) cost** | 10% of the base input rate (90% discount) | 50% of the base input rate (up to 90% depending on model) |
| **Developer control** | Explicitly specify what gets cached | Applied automatically, no code changes needed |

**What the write/read cost ratio means**: a cache write costs more than a normal input (1.25× for Anthropic), while a cache hit is much cheaper (10–50%). The gain only materializes in a **write-once, read-many** pattern — a production API called hundreds of times with the same system prompt, or a session that asks many questions against the same document. If a prefix is written once and never reused, caching is a net loss.

## Anti-Patterns That Break the Cache

- **Inserting content into the middle of the prefix**: changing anything before the cached prefix invalidates the cache from that point onward. Always place dynamic information (timestamps, session IDs) at the end of the prefix.
- **Letting the TTL lapse**: if the next request doesn't arrive within the 5-minute TTL, the cache is lost. For low-traffic systems, use the 1-hour TTL option or consider deliberate "warm-up" dummy requests.
- **Subtle non-determinism in prompt templates**: even when the underlying information is the same, minor differences in JSON key order, whitespace, or timestamp format prevent an exact-match-based cache from hitting.
- **Re-ordering tool definitions dynamically per request**: serializing the available tool list in a different order each time breaks the cache even when the tool descriptions are semantically identical, because the prefix byte sequence differs.

## How This Differs From Semantic Cache

Frequently confused with this wiki's [[en/AI/Engineering/Context_Engineering/Semantic_Cache|Semantic_Cache]], but it operates at a completely different layer.

| Aspect | Prompt Caching | Semantic Cache |
|---|---|---|
| **What's reused** | The model's internal computation state (KV Cache) | A previously generated **response itself** |
| **Match criterion** | Exact prefix match | Semantic similarity via embeddings |
| **Output** | **Generated fresh every time**, even on a hit (same prefix + different question → different answer) | On a hit, **the stored response is returned as-is** — nothing new is generated |
| **Where it lives** | Model-provider infrastructure (Anthropic/OpenAI servers) | Application layer (self-built, GPTCache, etc.) |
| **Cost-saving mechanism** | Reduces input-token processing cost | Skips input/output token processing entirely (no LLM call) |

Prompt Caching is "don't recompute the same prefix"; Semantic Cache is "don't call the model at all." The two aren't mutually exclusive and are commonly used together — when a Semantic Cache misses, the fallback is an LLM call that benefits from Prompt Caching.

## Cache Efficiency in Long-Running Agent Loops

In multi-turn agent loops, the entire prior conversation plus tool-call results accumulate into the prefix on every turn, so Prompt Caching's payoff is much larger than in one-shot Q&A. A 2026 study evaluating prompt caching for long-horizon agent serving [1] finds that cache hit rate and savings grow as a conversation lengthens, but also flags a tradeoff: every time Compaction (summarizing the conversation and starting a fresh window, covered in [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic_Context_Management]]) runs, the prefix changes and **invalidates the entire cache**. Setting the Compaction interval too short saves context space but repeatedly forfeits the cache-reuse benefit — the two optimizations can partially cancel each other out, and this needs to be accounted for in design.

## Role in AI Engineering

Prompt Caching is a perspective shift that turns a prompt from "this one request" into **a structure that gets called repeatedly**. Deliberately fixing the unchanging parts — system prompt, tool definitions, reference documents — at the front becomes part of prompt engineering itself. For the detailed cost-optimization loop angle, see the [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]] chapter.

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]] · [[en/AI/Engineering/Context_Engineering/LLM_Memory|LLM Memory]] · [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic Context Management]] · [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]] · [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Loop_Engineering/Cost_Engineering]]

## Sources
1. "An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks" (2026) — [arXiv:2601.06007](https://arxiv.org/abs/2601.06007)
2. Anthropic "Prompt caching" — [platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
3. OpenAI "Prompt Caching in the API" — [openai.com/index/api-prompt-caching](https://openai.com/index/api-prompt-caching/)
