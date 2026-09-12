---
order: 2
---

# Speculative Decoding

## Overview

**Speculative Decoding** is a technique where a small Draft model predicts tokens ahead of time and a large Target model verifies them in a single batch. It leverages the GPU's parallel processing power to achieve a **2-3x speedup with no quality loss**. Where [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]] focuses on "how to save memory," this document covers "how to break the sequential nature of the Decode stage itself."

## How It Works

```
Traditional autoregressive generation:
  "The" → "cat" → "sat" → "on"
  (one token at a time, 4 Target-model memory loads)

Speculative Decoding:
  Draft model: "The cat sat on" (predicts 4 tokens at once, much faster and cheaper to generate)
  Target model: verifies all 4 in parallel (a single forward pass)
  → only tokens that pass verification are accepted; the Target generates directly from the first mismatch onward
  → mathematically identical output to the Target model generating alone, with just 1 memory load
```

The key point is that **quality doesn't degrade at all** — since the Target model verifies every token, the final output distribution is identical to the Target model generating alone (a rejected guess is discarded and the Target fills that slot directly). It exploits the fact that the Decode stage is bottlenecked by memory bandwidth (see [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]]), verifying multiple tokens at once with a single memory load to make use of the GPU's otherwise-idle compute capacity.

## Acceptance Rate Determines Performance

```
How often the Draft model's prediction matches the Target model's actual choice = acceptance rate

High acceptance rate: the Draft is mostly right → multiple tokens confirmed at once → speedup maximized
Low acceptance rate: Draft predictions are frequently wrong → verified then discarded → adds Draft-generation cost with little gain

→ The key goal in choosing/designing a Draft model is finding one that is small
  yet predicts well in agreement with the Target
```

## Major Variants

| Technique | Core idea | Notes |
|------|--------------|------|
| **SpecInfer** | Presents multiple speculative paths at once as a tree structure | Increases the acceptance opportunity itself compared to a single linear sequence |
| **Medusa** | No separate small Draft model — attaches several extra prediction heads to the Target model itself | Multiple heads predict tokens at several future positions in parallel simultaneously |
| **EAGLE** | A specialized draft head that reuses the Target model's last hidden state | Preserves context better than simple token reuse, improving acceptance rate |
| **EAGLE-3** | Combines hidden states from multiple layers and improves the tree-based speculation/training approach | Larger gains in acceptance rate and speed vs. earlier generations (EAGLE/EAGLE-2) |
| **n-gram / Prompt Lookup Decoding** | No separate model — directly uses repeating n-gram patterns within the input prompt as the guess | Very cheap and effective for tasks with heavy input-output overlap, like code editing or document summarization |

## Production Status

```
- Built into vLLM, SGLang, and TensorRT-LLM by default — enabled via a config flag, no separate implementation needed
- NVIDIA H200: reported cases of 3.6x throughput improvement
- Typical configuration: Draft model predicts 5-8 tokens → Target model verifies in parallel
- Output quality: mathematically equivalent to the Target model generating alone (not an approximation)
```

## When It's Effective

```
Highly effective:
  - Domains with a high Draft-Target acceptance rate (code autocompletion, text with many repeating patterns)
  - Situations where memory bandwidth is the bottleneck (short batches, long sequences)

Less effective:
  - Tasks like creative generation, where the Draft struggles to predict the Target's choices
  - Situations where the GPU is already compute-bound and saturated (Prefill-heavy workloads) — the gain is limited
```

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]] · [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]] · [[en/AI/Engineering/Model_Engineering/Model_Distillation|Model Distillation]]

## Role in AI Engineering

Speculative Decoding is one of the few lossless optimization techniques that reduces latency **without changing the model.** Unlike quantization or distillation, which force an accuracy-speed trade-off, choosing a good Draft model yields a pure speed gain with no quality loss — which is why it has become the default in production serving since 2025.

## Sources
- Leviathan et al. (2023) "Fast Inference from Transformers via Speculative Decoding" — [arXiv:2211.17192](https://arxiv.org/abs/2211.17192)
- Miao et al. (2023) "SpecInfer: Accelerating Generative LLM Serving with Speculative Inference and Token Tree Verification" — [arXiv:2305.09781](https://arxiv.org/abs/2305.09781)
- Cai et al. (2024) "Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads" — [arXiv:2401.10774](https://arxiv.org/abs/2401.10774)
- Li et al. (2024/2025) "EAGLE" / "EAGLE-3" — [arXiv:2401.15077](https://arxiv.org/abs/2401.15077), [arXiv:2503.01840](https://arxiv.org/abs/2503.01840)
- "Speculative Decoding: 2-3x Faster LLM Inference" (2026) — [blog.premai.io](https://blog.premai.io/speculative-decoding-2-3x-faster-llm-inference-2026/)
