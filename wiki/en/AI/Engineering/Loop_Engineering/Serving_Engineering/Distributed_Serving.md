---
order: 3
---

# Distributed Serving

## Overview

Where [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]] covered techniques for easing Prefill/Decode resource contention within a single GPU (pool), this document covers the approach of **physically separating and scaling resources across multiple GPUs and multiple regions.**

## Disaggregated Prefill/Decode

As defined in [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]], Prefill is compute-bound and Decode is memory-bandwidth-bound. Processing both stages on the same GPU makes their resource demands collide.

```
Before (unified serving): a single GPU pool handles both Prefill and Decode
  → a long-running Prefill increases the latency of an in-flight Decode (head-of-line blocking)
  → Chunked Prefill can ease this, but not eliminate it entirely

Disaggregated Serving (NVIDIA Dynamo, llm-d, etc.):
  Physically separates a Prefill-only GPU pool from a Decode-only GPU pool
  → after Prefill completes, the KV Cache is transferred to the Decode pool (KV Cache Transfer)
  → each stage can be scaled and optimized independently
    (the Prefill pool can specialize in compute-strong GPUs, the Decode pool in
    GPUs with wide memory bandwidth)
```

## KV Cache Transfer — the Key Cost of Disaggregation

The very process of moving the KV Cache computed in the Prefill pool over to the Decode pool can become a new bottleneck.

```
Factors governing transfer cost:
  - Prompt length (proportional to KV Cache size)
  - Network bandwidth between the Prefill and Decode pools (whether a high-speed interconnect is present)
  - Transfer method (synchronous wait vs. asynchronous pipelining)

Mitigation strategies:
  - Physically co-locate Prefill and Decode pools via a high-speed interconnect (NVLink, InfiniBand)
  - Compress the KV Cache before transfer
  - A distributed KV Cache pool — multiple Decode instances look up a shared cache layer
```

## TP / PP / EP — Parallelizing the Model Itself

If disaggregation splits "stages" (Prefill vs. Decode), the following three techniques split "the model itself" across multiple GPUs. Essential when a large model doesn't fit in a single GPU's memory.

```
Tensor Parallelism (TP)
  Splits a single layer's computation (matrix multiplication) across multiple GPUs
  → requires inter-GPU communication at every layer (a high-speed interconnect is essential)
  → latency-sensitive, mainly used between GPUs within a single node (NVLink)

Pipeline Parallelism (PP)
  Splits the model layer-wise so each GPU handles a different span of layers
  → streams microbatches through like a pipeline to minimize GPU idle time
  → can also work across nodes (over relatively slower networks)

Expert Parallelism (EP)
  Distributes each Expert of a MoE (Mixture of Experts) model across different GPUs
  → since which Expert a token is routed to varies dynamically, inter-GPU
    communication patterns are dynamic
  → creates a different load-balancing problem than Dense-model TP/PP (imbalanced
    load across Experts) (connects to the MoE routing concept in
    Model Architectures & MoE)
```

## Goodput Scheduling

How to maintain the Goodput metric (throughput that meets SLA), as defined in [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]], in a distributed environment.

```
The trap of maximizing raw throughput:
  Overall GPU pool throughput is high, but specific requests violate their TTFT/TPOT SLA — a "hidden failure"

Goodput-based scheduling:
  - Explicitly pass each request's SLA (latency target) to the scheduler
  - Prioritize requests at high risk of SLA violation in both the Prefill pool and the Decode pool
  - Optimize the objective function as "how many requests meet SLA," instead of plain FIFO/throughput optimization
```

## Cold Start and Multi-Region

In serverless LLM deployment, the cold start of loading model weights (tens of GB) onto a new instance is a major source of latency.

```
Cold-start mitigation techniques:
  - Weight prefetching (loading ahead of time based on usage prediction)
  - Snapshot-based fast restore (saving/restoring the memory state itself as a snapshot)
  - Maintaining a warm pool — keeping a minimum number of instances that never fully spin down

Multi-region deployment:
  KV Cache Locality — re-routing a user to the region they previously requested from, to preserve cache reuse
  → if inter-region routing is random, the KV Cache must be recomputed on every
    request, worsening both cost and latency
```

## Boundaries

| Document | Covers |
|------|-----------|
| [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals\|Inference Internals]] | Optimizing memory/batching **within the same GPU (pool)** |
| **This document (Distributed_Serving)** | Physically separating and scaling resources **across multiple GPUs and multiple regions** |

## Role in AI Engineering

Disaggregated Serving and TP/PP/EP are the next tier of optimization that emerges at a scale single-GPU optimization ([[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]]) alone can't handle — extremely large models, extremely high-throughput services. For organizations that reach this tier, the infrastructure configuration itself becomes as important an architectural decision as model performance.

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]] · [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]] · [[en/AI/Engineering/Model_Engineering/Model_Architectures_and_MoE|Model Architectures & MoE]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]]

## Sources
- NVIDIA "Dynamo: Disaggregated Serving" — [developer.nvidia.com](https://developer.nvidia.com/blog/introducing-nvidia-dynamo/)
- The llm-d project — [llm-d.ai](https://llm-d.ai)
- Shoeybi et al. (2019) "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism (Tensor Parallelism)" — [arXiv:1909.08053](https://arxiv.org/abs/1909.08053)
- Huang et al. (2019) "GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism" — [arXiv:1811.06965](https://arxiv.org/abs/1811.06965)
- AI Engineering from Scratch, Phase 17 · Lessons 04-18 (serving engine internals, disaggregated serving, self-hosting) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/17-infrastructure-and-production)
