---
order: 3
---

# Parameter-Efficient Fine-Tuning (PEFT) — LoRA & QLoRA

## Overview

**PEFT (Parameter-Efficient Fine-Tuning)** is a family of techniques that achieves performance close to Full Fine-Tuning by training only **a small number of additional parameters** rather than the entire model. It enables efficient fine-tuning of large models in GPU memory-constrained environments.

## LoRA (Low-Rank Adaptation)

### Origin
- **Authors**: Hu et al., Microsoft (2021)
- **Paper**: "LoRA: Low-Rank Adaptation of Large Language Models" ([arXiv:2106.09685](https://arxiv.org/abs/2106.09685))

### Core Idea

Approximate weight matrix updates ΔW via **low-rank matrix decomposition**:

```
W' = W + ΔW = W + B × A

W  : original weight (d × d, frozen)
A  : random Gaussian initialization (r × d, trainable)
B  : zero initialization (d × r, trainable)
r  : rank (hyperparameter, usually 4~64)
```

Since r ≪ d, the number of trainable parameters is dramatically reduced:
```
Parameter reduction = 1 - (2 × r) / d
Example: d=4096, r=16 → trainable parameter ratio = 0.78%
```

### No Inference Overhead
At inference, merging W + B×A preserves the original model structure:
```python
# Merge weights before inference
merged_weight = original_weight + lora_B @ lora_A
# Identical to regular matrix multiplication afterward
```

### Where to Apply
Primarily applied to Attention layers (Q, K, V, O projections) in Transformers:
```
Multi-Head Attention:
  Q_proj: W_Q + ΔW_Q (LoRA applied)
  K_proj: W_K + ΔW_K (LoRA applied)
  V_proj: W_V + ΔW_V (LoRA applied)
  O_proj: W_O (frozen or LoRA applied)
```

## QLoRA (Quantized LoRA)

### Origin
- **Authors**: Dettmers et al. (2023)
- **Paper**: "QLoRA: Efficient Finetuning of Quantized LLMs" ([arXiv:2305.14314](https://arxiv.org/abs/2305.14314))

### Core Innovation
Combining LoRA with **4-bit quantization** makes fine-tuning 70B models possible on consumer-grade GPUs:

```
QLoRA memory usage:
  Standard model: 70B × 2bytes (FP16) = 140 GB (2 A100s)
  QLoRA:          70B × 0.5bytes (NF4) = 35 GB (single A100 possible)
```

### 3 Innovation Techniques

1. **NF4 (4-bit NormalFloat)**: Quantization assuming normal distribution — higher precision than standard INT4
2. **Double Quantization**: Re-quantize quantization constants → additional memory savings
3. **Paged Optimizer**: Offload to CPU at GPU memory peaks → prevents OOM

```python
# QLoRA usage example (HuggingFace)
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b",
    quantization_config=bnb_config,
)
# Add LoRA adapter
from peft import get_peft_model, LoraConfig
lora_config = LoraConfig(r=64, lora_alpha=16, target_modules=["q_proj","v_proj"])
model = get_peft_model(model, lora_config)
```

## Other PEFT Techniques

| Technique | Approach | Characteristics |
|------|------|------|
| **Prompt Tuning** | Add trainable soft tokens before input | Model weights completely frozen |
| **Prefix Tuning** | Add prefix vectors to each Transformer layer | Deeper adaptation possible |
| **Adapter** | Insert small MLPs between Transformer layers | Modular, easy to manage |
| **IA³** | Multiply trainable vectors on K, V, FF activations | Fewer parameters |

## Performance Comparison

| | Full FT | LoRA | QLoRA |
|--|---------|------|-------|
| **Performance** | Best | 95~99% of Full FT | 93~97% of Full FT |
| **GPU memory** | 100% | ~30% | ~10% |
| **Training speed** | Baseline | ~2-3× faster | ~1.5-2× faster |
| **Feasible GPU** | A100 cluster | Single RTX 4090 | Even RTX 3090 possible |

## Practical Selection Guide

```
GPU memory <24GB   → QLoRA
GPU memory 24~80GB → LoRA
GPU memory >80GB    → Full FT (or LoRA for speed)
Don't want to touch model weights → Prompt Tuning
```

## Role in AI Engineering

PEFT is the core tool of practical AI Engineering. It democratizes LLMs by enabling small teams to customize billion-parameter models on a single GPU. LoRA adapters are interchangeable, enabling Multi-LoRA serving patterns where multiple task-specific adapters run on the same base model.

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] · [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]] · [[en/AI/Engineering/Model_Engineering/Pre-training_and_Continual_Learning|Pre-training & Continual Learning]]

## Sources
- Hu et al. (2021) "LoRA: Low-Rank Adaptation of Large Language Models" — [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)
- Dettmers et al. (2023) "QLoRA: Efficient Finetuning of Quantized LLMs" — [arXiv:2305.14314](https://arxiv.org/abs/2305.14314)
- Lightning AI "Finetuning LLMs with LoRA and QLoRA: Insights from Hundreds of Experiments" — [lightning.ai](https://lightning.ai/pages/community/lora-insights/)
- "LoRA vs Full Fine-tuning: An Illusion of Equivalence" (2024) — [arXiv:2410.21228](https://arxiv.org/html/2410.21228v2)
