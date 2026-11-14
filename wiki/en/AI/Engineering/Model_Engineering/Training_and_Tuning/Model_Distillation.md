---
order: 4
---

# Model Distillation (Knowledge Distillation)

## Overview

**Knowledge Distillation** is a model compression technique that transfers the knowledge of a large, powerful **Teacher model** to a small, efficient **Student model**. It enables significantly reducing deployment costs while maintaining the performance of large models.

## Origin

- **Original**: Hinton et al. (2015) "Distilling the Knowledge in a Neural Network" — applied to image classification models
- **LLM applications**: Rapid development from 2023~2024. Numerous studies distilling GPT-4-level models into small open-source models

## Core Principles

### Soft Labels

Using the Teacher's output distribution so the Student learns not just "why this answer is correct" but also **the relative probability of each candidate answer**:

```
Standard training (Hard Label):
  Input: "What is a cat?" → Answer: "animal" (1), others 0

Distillation (Soft Label, T=4 temperature):
  Input: "What is a cat?" → Teacher output:
    "animal": 0.82, "mammal": 0.15, "living thing": 0.03
  → Student learns this distribution (also learns relationships between classes)
```

**Temperature (T)**: Higher T softens the distribution, strengthening transfer of "dark knowledge."

## LLM Distillation Methods

### White-box Distillation
When access to Teacher's internal representations (layer activations, attention patterns) is possible:
- **MiniLLM**: Optimizes mode capture of Teacher distribution via reverse KL divergence
- **DistilBERT**: Compresses BERT to 6 layers, retains 97% performance, 60% faster

```python
# Layer-wise knowledge distillation
loss = CrossEntropy(student_output, labels)
     + α × KL_div(student_logits / T, teacher_logits / T)
     + β × MSE(student_hidden, teacher_hidden)  # Intermediate layer alignment
```

### Black-box Distillation
Uses only Teacher's outputs (text). Since most commercial APIs (OpenAI, Anthropic, etc.) prohibit using their outputs to train competing models under their Terms of Service, production teams typically use **open-weight Teachers** (e.g., DeepSeek-R1, Qwen, large Llama models) or proprietary internal Teachers:
- **Alpaca / Vicuna (early examples)**: Early research using GPT-3.5/ChatGPT conversation data
- **Open-weight Teacher distillation**: Distilling DeepSeek-R1 (671B) reasoning chains into smaller Qwen/Llama models (1.5B–70B)

### On-Policy Distillation (GKD)
Offline SFT-based distillation trains only on a fixed Teacher-generated dataset, making the Student vulnerable to **exposure bias** once it generates a wrong token at inference time. **On-Policy Distillation (Generalized Knowledge Distillation, GKD)** (Agarwal et al., ICLR 2024) aligns the Student during training using **feedback from the Teacher's logit distribution (e.g., reverse KL) evaluated on Student-generated sequences**. Adopted as standard in Gemma 2/3 and modern small open-weight model training.

### Context / Prompt Distillation
Instead of feeding thousands of tokens of long system prompts, few-shot examples, and guidelines on every request, **distill the Teacher's output distribution given the long context into a Student without the context**, permanently reducing prompt token costs and TTFT.

### Chain-of-Thought Distillation
Transfer Teacher's reasoning process (CoT) to Student:
```
Teacher (GPT-4):
  Q: "Solve x² + 5x + 6 = 0"
  A: "x² + 5x + 6 = (x+2)(x+3) = 0, so x = -2 or x = -3"

Student (small model):
  Learns this entire CoT → math reasoning ability transferred
```

## Distillation Strategy Comparison

| Strategy | Access | Effectiveness | Cost |
|------|---------|------|------|
| **Logit Distillation** | Teacher logits | Medium | Teacher inference cost |
| **Feature Distillation** | Teacher internal representations | High | White-box only |
| **Data Augmentation** | Teacher text output | Low~Medium | API call cost |
| **CoT Distillation** | Teacher reasoning chain | High (reasoning tasks) | API cost + long sequences |

## Real-world Success Cases

- **DistilBERT** (2019): BERT 66M → 40M, 97% NLP performance, 60% faster
- **Alpaca** (2023): GPT-3.5 output → LLaMA-7B training, dramatic instruction-following improvement
- **Phi series** (Microsoft): Small high-quality synthetic data enables 3.8B model to reach 13B-level performance
- **DeepSeek-R1** (2025): CoT from large reasoning model distilled into small model

## Distillation vs. Quantization vs. PEFT

| | Distillation | Quantization | PEFT |
|--|------|-------|------|
| **Purpose** | Create smaller model | Compress existing model | Specialize existing model |
| **Output** | New model | Same-architecture model | Adapter |
| **Performance loss** | Present (5~15%) | Minimal (1~5%) | Almost none |
| **Deployment form** | Independent model | Compressed model | Base + Adapter |

## Role in AI Engineering

Distillation satisfies the need to "reduce API costs while maintaining performance." It's a key technology for serving GPT-4-level capable small models on your own infrastructure, or embedding LLM capabilities in edge devices (mobile, IoT).

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Full_Fine-Tuning|Full Fine-Tuning]] · [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/PEFT_LoRA_QLoRA|PEFT_LoRA_QLoRA]] · [[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Quantization|Quantization]]

## Sources
- Hinton et al. (2015) "Distilling the Knowledge in a Neural Network" — [arXiv:1503.02531](https://arxiv.org/abs/1503.02531)
- Sanh et al. (2019) "DistilBERT" — [arXiv:1910.01108](https://arxiv.org/abs/1910.01108)
- Agarwal et al. (ICLR 2024) "On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes (GKD)" — [arXiv:2306.13649](https://arxiv.org/abs/2306.13649)
- MIT TACL Survey (2024) "A Survey on Model Compression for Large Language Models" — [MIT Press](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00704/125482/A-Survey-on-Model-Compression-for-Large-Language)
