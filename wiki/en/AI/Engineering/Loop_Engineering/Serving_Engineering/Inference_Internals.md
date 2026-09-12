---
order: 1
---

# Inference Internals

## Overview

This document covers how to efficiently process the two stages defined in [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]] — Prefill and Decode — **within the same GPU (pool).** The approach of physically separating resources is covered in [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Distributed_Serving|Distributed Serving]] — this document focuses on techniques for "reducing waste within a single GPU pool."

## KV Cache — Why Memory Is the Bottleneck

At every token generated during the Decode stage, the entire Key/Value cache (KV Cache) computed so far must be re-read. As sequences grow longer and concurrent requests increase, the memory occupied by the KV Cache rapidly eats into GPU VRAM — this is why the Decode stage is called "memory-bandwidth-bound."

```
Problem with traditional batching:
  Assumes every request in a batch has the same length
  → a short response must wait for a long one (GPU sits idle)
  → KV Cache is pre-allocated as contiguous memory blocks → memory fragmentation/waste
```

## PagedAttention (vLLM, UC Berkeley 2023)

Applies the OS's virtual-memory paging technique to the KV Cache.

```
Allocates the KV Cache in fixed-size, non-contiguous blocks (pages)
  → reduces memory waste to under 4% (up to 24x higher throughput vs. legacy systems)
  → allocates/frees only as many blocks as each request needs (the same principle as an OS page table)
```

## Continuous Batching

```
A request is removed from the batch the moment it finishes, and a new request joins immediately
  → no need to wait for other requests to finish a fixed batch size
  → maximizes GPU utilization — substantially higher throughput than traditional static batching
```

## Chunked Prefill

A technique to ease the head-of-line blocking where a long prompt's Prefill delays other requests' Decode.

```
Problem: an 8,000-token prompt's Prefill occupies the entire GPU
         → short Decode requests wait in the meantime

Chunked Prefill:
  Splits a long Prefill into small chunks processed over several steps
  → each step batches a Prefill chunk together with pending Decode requests
  → Decode latency (TPOT) improves significantly
```

## RadixAttention (SGLang)

A technique specialized for workloads with heavy prefix overlap (many requests sharing the same system prompt, reused few-shot examples, an agent's repeated tool definitions).

```
Caches and reuses the KV Cache of a prompt prefix shared across
multiple requests as a Radix Tree (trie data structure)

Example: 100 requests sharing a 500-token system prompt
  → Before: each request recomputes the 500-token KV Cache
  → RadixAttention: the shared prefix is computed once, reused from the tree
```

Especially effective for multi-turn conversations, few-shot prompting, and agents (repeated system prompts + tool definitions) with heavy prefix overlap. Conceptually similar to Prompt Caching, but RadixAttention automatically shares KV Cache across multiple requests inside the serving engine, whereas [[en/AI/Engineering/Prompt_Engineering/Prompt_Caching|Prompt Caching]] is an application-level (prompt-design) technique that explicitly leverages a vendor API's caching feature.

## FlashAttention

A kernel-optimization technique that restructures the attention computation itself to match the GPU's memory hierarchy (HBM vs. SRAM), improving both speed and memory efficiency at once. Where PagedAttention/RadixAttention address "which KV Cache to reuse/batch," FlashAttention is a lower-level optimization addressing "how to compute the attention matrix operation itself faster." Most modern serving engines (vLLM, SGLang, TensorRT-LLM) adopt it as their default kernel.

## TensorRT-LLM — FP8 / NVFP4

NVIDIA's serving engine, which aggressively leverages the low-precision compute of the latest GPU architectures (Blackwell). The key idea is boosting throughput via FP8/NVFP4 (4-bit floating point) quantization while minimizing accuracy loss — see [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]] for production quantization technique details.

## Role in AI Engineering

PagedAttention, Continuous Batching, and RadixAttention are built into nearly every production serving engine today, so practitioners rarely implement them directly. Understanding these internals still matters, though, because of **matching engine choice to workload characteristics** — knowing that SGLang (with its strong RadixAttention) suits agent workloads with heavy prefix sharing, while vLLM (with mature PagedAttention) suits general-purpose workloads with mixed request lengths, requires understanding what's happening under the hood.

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]] · [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Speculative_Decoding|Speculative Decoding]] · [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Distributed_Serving|Distributed Serving]] · [[en/AI/Engineering/Prompt_Engineering/Prompt_Caching|Prompt Caching]] · [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]]

## Sources
- Kwon et al. (2023) "Efficient Memory Management for LLM Serving with PagedAttention" — [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)
- Zheng et al. (2024) "SGLang: Efficient Execution of Structured Language Model Programs" — [arXiv:2312.07104](https://arxiv.org/abs/2312.07104)
- Dao et al. (2022) "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness" — [arXiv:2205.14135](https://arxiv.org/abs/2205.14135)
- Agrawal et al. (2023) "SARATHI: Efficient LLM Inference by Piggybacking Decodes with Chunked Prefills" — [arXiv:2308.16369](https://arxiv.org/abs/2308.16369)
- NVIDIA "TensorRT-LLM" docs — [nvidia.github.io/TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/)
