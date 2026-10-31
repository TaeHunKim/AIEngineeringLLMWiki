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

## In Practice: KV Connectors and When to Disaggregate

**Sizing the transfer**: The KV Cache for Llama-3.1-70B (BF16) is approximately 320 KiB per token. A 10k-token prompt requires handing about 3 GB from Prefill to Decode, which takes about 65 ms even with a 400 Gb/s link before overhead. This time is added entirely to the TTFT. In an environment without GPU-to-GPU P2P (2 L40S GPUs, no NVLink), the KV cache for Qwen2.5-7B (8k tokens, approx. 470 MB) took about 1.3 seconds to arrive for decoding.

**KV connectors**: vLLM provides more than a dozen KV connectors, including NIXL, LMCache, Mooncake, FlexKV, and AMD MoRI-IO, plus a `MultiConnector` that chains them. NIXL registers the KV Cache memory directly and transmits it between GPUs via RDMA. For workloads where the context continuously grows, such as conversation or agent loops, it is recommended to use **KV offload/shared KV cache** like LMCache and Mooncake, combined with **cache-aware routing** that sends subsequent turns to workers already possessing the history. The example proxy is for development, while production routing is handled by llm-d or Dynamo.

```
Disaggregation pays off when:
  - ITL p99 misses the SLO under production load
  - long prompts + high concurrency, and the KV transfer is fast enough
Disaggregation hurts when:
  - TTFT is the binding constraint (transfer time lands on every first token)
  - traffic is low or bursty → stay collocated + Chunked Prefill
Check first:
  - P2P availability between prefill and decode GPUs, average KV transfer time on the decode side
```

The reported figures (based on the 2026-09 vLLM blog, all under specific hardware/workload conditions) are as follows:
- 2× L40S, 8k prompts: at 0.4 req/s, collocated p99 ITL jumped from 23 to 169 ms, while P/D disaggregation stayed at 25–52 ms. In exchange, P/D median TTFT was worse at 2.2 s versus 0.7 s collocated.
- AMD MoRI-IO (Qwen3-235B-A22B-FP8, 8× MI300X, 8 req/s): 73 out of 100 requests met both TTFT of 1 second and ITL of 50 ms, representing about 2.4 times the goodput versus 30 collocated.
- llm-d (gpt-oss-120b, 16× H200): Average end-to-end latency decreased by about 59%, and P95 decreased by about 67% compared with aggregated replicas on the same GPUs.

**Operational Pitfalls**: When separating rendering (template/tokenization) to a CPU node, the render, derender, and engine must share all settings for the model, tokenizer, chat template, and parser. If they are misaligned, the division of content, reasoning, and tool_calls changes without warning. Chat templates that discard the thinking trace from previous turns can cause inconsistencies with the decode-side cache block, leading to incorrect outputs.

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
[[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]] · [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]] · [[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Model_Architectures_and_MoE|Model Architectures & MoE]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]]

## Sources
- NVIDIA "Dynamo: Disaggregated Serving" — [developer.nvidia.com](https://developer.nvidia.com/blog/introducing-nvidia-dynamo/)
- The llm-d project — [llm-d.ai](https://llm-d.ai)
- vLLM Blog "Taking vLLM Apart: A Practical Guide to Disaggregated Serving" (2026-09-29) — [vllm.ai](https://vllm.ai/blog/2026-09-29-disaggregated-serving-guide)
- llm-d "Disaggregated Serving" docs — [llm-d.ai](https://llm-d.ai/docs/architecture/advanced/disaggregation)
- Shoeybi et al. (2019) "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism (Tensor Parallelism)" — [arXiv:1909.08053](https://arxiv.org/abs/1909.08053)
- Huang et al. (2019) "GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism" — [arXiv:1811.06965](https://arxiv.org/abs/1811.06965)
- AI Engineering from Scratch, Phase 17 · Lessons 04-18 (serving engine internals, disaggregated serving, self-hosting) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/17-infrastructure-and-production)
