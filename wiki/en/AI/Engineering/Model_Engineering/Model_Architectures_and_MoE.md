---
order: 6
---

# Model Architectures & MoE

## Overview

This page covers a design choice the rest of Model Engineering's documents (pre-training, fine-tuning, quantization, distillation) take as a given: **the architecture of the model itself**. Three questions: how should parameters be laid out (Dense vs. MoE), how should context length be extended (the RoPE family), and how big a model does an agent actually need (SLM-for-Agents)?

## Dense vs. Mixture-of-Experts (MoE)

### Structure

A **Dense model** engages every parameter in processing every token. A **Mixture-of-Experts (MoE) model** maintains several "expert" sub-networks, and a router activates only a subset of them for each token.

```
Dense model (e.g., 70B):
  Input token → all 70B parameters compute → output
  Total Params = Active Params = 70B

MoE model (e.g., 8 of 256 experts activated per token):
  Input token → router selects 8 experts → only those 8 compute → output
  Total Params (e.g., 230B) ≠ Active Params (e.g., 10B)
```

The key distinction is between **Total Params** (everything the model stores, which determines memory footprint) and **Active Params** (what's actually used to process one token, which determines compute cost and latency). In a Dense model these are the same number; MoE lets Total grow — expanding knowledge capacity — while keeping Active low, capping inference cost.

### Why This Matters for Agent Serving Costs

Agentic workloads typically generate a very large number of short responses (one tool call, one planning step). In that setting, low Active Params translates directly into low per-token inference cost. This is the tradeoff MoE offers: not "the same quality more cheaply," but "more knowledge capacity at the same cost." Routing and load balancing — keeping tokens from piling up onto a few experts — remain MoE's characteristic training and serving challenge.

### The 2026 Open MoE Landscape

This information ages fast, so only representative examples are noted — useful for getting a feel for typical Total/Active ratios, not as a comprehensive catalog.

| Model | Total Params | Active Params | Note |
|---|---|---|---|
| DeepSeek-V3 / R1 line | 671B | 37B | Routing + RLVR combined (see the GRPO discussion in [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full_Fine-Tuning]]) |
| MiniMax M3 (2026-06) | 229.9B | 9.8B | 256 fine-grained experts |
| NVIDIA Nemotron 3.5 Lightning | 30B | 3B | Low-latency design for long-running agents, built-in speculative decoding |
| Cohere North Mini Code | 30B | 3B | Specialized for agentic coding |

## Long-Context Architecture

### RoPE's Extrapolation Limit

Most modern LLMs encode position with **RoPE (Rotary Position Embedding)**. The problem: RoPE generalizes poorly to positions beyond the maximum length seen during training — there's a known **extrapolation limit** where performance degrades sharply once you go far beyond the training length.

### Position Interpolation / NTK-aware / YaRN

Three techniques evolved, in sequence, to work around this limit.

- **Position Interpolation**: "compresses" new position indices back into the trained range. Simple to implement, but heavy compression sacrifices local resolution (the model's ability to distinguish adjacent tokens).
- **NTK-aware Scaling**: applies a different compression ratio per RoPE frequency component — compressing high frequencies (local position discrimination) less and low frequencies (long-range position) more.
- **YaRN (Yet Another RoPE extensioN)**: adds an attention-temperature parameter on top of NTK-by-parts scaling, and has become the de facto standard from 2024 through 2026. Most major model families — Qwen, DeepSeek, LLaMA, and others — use YaRN for context extension. At typical 2–16× extension, YaRN is both simpler and comparable to or better than alternatives.

At extreme extensions (32×+), the **LongRoPE** family outperforms YaRN, at the cost of higher implementation complexity.

### Extending Context and Using It Well Are Different Problems

Even after extending context length to 1M tokens via YaRN or similar, a model doesn't handle 1M tokens with the same precision it handles 32K tokens with — no RoPE extension technique fully closes this gap. In other words, "how long a context the model supports" (an architecture question) and "how well it actually uses that long context" (an operational question — Context Rot) are two different things. The latter is covered in [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Context_Engineering/Agentic_Context_Management]].

## SLM-for-Agents

A recurring industry observation: most real agentic tasks (call one tool, route according to a fixed format, edit a short snippet of code) don't require a frontier model's general-purpose reasoning capability — NVIDIA researchers argue that for many of these tasks, a **small language model (SLM) is the architecturally more appropriate choice**: lower latency, easier to run many parallel instances of, easier to fine-tune to a narrow task. As of 2026, many of these SLMs are actually miniaturized versions of the MoE structure discussed above (e.g., ~30B total, ~3B active) — closer to "a model with small Active Params" than to "a small model" in the naive sense.

## Boundary: Serving Optimization Belongs to Runtime_Optimization

This page covers **how a model is architecturally designed**. How that architecture actually gets served fast in production — speculative decoding, vLLM's PagedAttention, SGLang's RadixAttention, disaggregated prefill/decode, and other inference-infrastructure optimizations — is already covered in detail by this wiki's [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]]. The two pages are complementary: this one answers "what gets served," Runtime_Optimization answers "how it gets served."

## Role in AI Engineering

Model architecture is an invisible decision for most application teams — they consume a model via API without touching its internal structure. But when designing self-hosted, on-premise, or extremely cost-sensitive large-scale agentic workloads, this choice becomes a direct cost and latency determinant — the Total/Active parameter ratio directly sets memory requirements and per-token cost, and context-length architecture sets the ceiling on everything [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] as a whole can work with.

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]] · [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]] · [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Context_Engineering/Agentic_Context_Management]] · [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing]]

## Sources
- Turing Post "10 Small Language Models to Know in 2026" — [turingpost.com](https://www.turingpost.com/p/slmslist)
- Belcak et al. (NVIDIA, 2025) "Small Language Models are the Future of Agentic AI" — [arXiv:2506.02153](https://arxiv.org/abs/2506.02153)
- Peng et al. (2023) "YaRN: Efficient Context Window Extension of Large Language Models" — [arXiv:2309.00071](https://arxiv.org/abs/2309.00071)
- Ding et al. (2024) "LongRoPE: Extending LLM Context Window Beyond 2 Million Tokens" — [arXiv:2402.13753](https://arxiv.org/abs/2402.13753)
- Local AI Master "RoPE, YaRN, NTK: Long-Context LLM Techniques Explained" (2026) — [localaimaster.com](https://localaimaster.com/blog/rope-yarn-long-context-guide)
- MiniMax "MiniMax M3" announcement (2026-06-01) — [minimax.io](https://www.minimax.io)
