---
order: 4
---

# Quantization

## Overview

**Quantization** is a model compression technique that converts model weights (and activations) from high precision (FP32, FP16) to low precision (INT8, INT4, etc.) to **improve memory usage and inference speed**.

## Why Is It Needed?

```
Llama 3 70B parameters:
  FP32  : 70B × 4bytes = 280 GB  (infeasible)
  FP16  : 70B × 2bytes = 140 GB  (2 A100s)
  INT8  : 70B × 1byte  = 70 GB   (1 A100)
  INT4  : 70B × 0.5byte = 35 GB  (RTX 4090 possible)
```

## Quantization Types

### Post-Training Quantization (PTQ)
Quantize after training completes. No additional training required. Some precision loss.

### Quantization-Aware Training (QAT)
Include quantization simulation during training. Higher precision but increased training cost.

## Key PTQ Techniques

### W8A8 (INT8 weights + INT8 activations)
- Suitable for throughput-priority scenarios
- Fast but has precision loss
- **bitsandbytes LLM.int8()**: Mixed processing of abnormally large outlier activations in FP16

### GPTQ (GPU Post-Training Quantization)
- **Authors**: Frantar et al. (2022)
- Quantizes each layer independently. Second-order optimization using Hessian information
- Corrects remaining weights to minimize MSE
- Strong performance at 3~4-bit quantization
- GPU inference optimization (3~4.5× speedup on NVIDIA GPUs)

```python
# GPTQ usage (AutoGPTQ)
from auto_gptq import AutoGPTQForCausalLM
model = AutoGPTQForCausalLM.from_quantized(
    "model-name-gptq",
    device="cuda:0"
)
```

### AWQ (Activation-aware Weight Quantization)
- **Authors**: Lin et al., MIT HAN Lab (2023) — [arXiv:2306.00978](https://arxiv.org/pdf/2306.00978)
- **Core idea**: Not all weights are equal. Analyzes activation statistics to identify important channels (~1%)
- Scales up important channels then applies uniform quantization → preserves critical information

```
Standard W4 quantization:
  All channels uniform 4-bit → important information lost

AWQ:
  Analyze activation statistics → identify 1% important channels
  Scale-up important channels → uniform 4-bit quantization
  → Minimizes precision loss
```

- More robust than GPTQ when calibration and evaluation data distributions differ

### GGUF (GPT-Generated Unified Format)
- Format used by llama.cpp. CPU inference possible
- Provides various quantization levels: Q4_K_M, Q5_K_M, etc.
- Efficient on Apple Silicon (M1/M2/M3), etc.

## Precision-Speed Trade-offs by Quantization Level

| Format | Bits | Memory savings | Quality loss | Recommended use |
|------|------|-----------|---------|---------|
| FP16/BF16 | 16 | Baseline | None | Training, high-quality inference |
| INT8 | 8 | 50% | Negligible | Default deployment |
| INT4 (GPTQ) | 4 | 75% | Low | Resource-constrained deployment |
| INT4 (AWQ) | 4 | 75% | Very low | Resource-constrained + quality |
| INT2~3 | 2~3 | 85%+ | High | Extreme compression (experimental) |

## Practical Selection Guide

```
Server inference (NVIDIA GPU):
  Throughput priority → W8A8 (INT8)
  Memory savings + quality → AWQ INT4
  Precise quantization needed → GPTQ

Local inference (CPU/Apple Silicon):
  → GGUF (llama.cpp)

Memory savings during fine-tuning:
  → QLoRA (NF4 quantization + LoRA)
```

## Role in AI Engineering

Quantization is a core tool in the Compression & Optimization layer that **directly determines deployment costs**. It makes serving 70B models on a single server or running on consumer GPUs possible. Given that a significant portion of LLM service costs come from inference GPU costs, proper quantization strategy is directly tied to business competitiveness.

## Related Concepts
[[en/AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT_LoRA_QLoRA]] · [[en/AI/Engineering/Model_Engineering/Model_Distillation|Model Distillation]] · [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]]

## Sources
- Lin et al. (2023) "AWQ: Activation-aware Weight Quantization" — [arXiv:2306.00978](https://arxiv.org/pdf/2306.00978)
- Frantar et al. (2022) "GPTQ: Accurate Post-Training Quantization" — [arXiv:2210.17323](https://arxiv.org/abs/2210.17323)
- Cast AI "LLM Quantization Methods: GPTQ, AWQ, GGUF" — [cast.ai](https://cast.ai/blog/demystifying-quantizations-llms/)
- Microsoft "A practical guide to INT4 quantization for SLMs" — [Medium](https://medium.com/data-science-at-microsoft/a-practical-guide-to-int4-quantization-for-slms-gptq-vs-awq-olive-and-real-world-results-2f63d6963d1d)
