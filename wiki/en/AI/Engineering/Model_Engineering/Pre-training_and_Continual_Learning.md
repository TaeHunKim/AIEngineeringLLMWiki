---
order: 1
---

# Pre-training & Continual Learning

## Overview

**Pre-training** is the stage where a language model learns foundational capabilities (grammar, world knowledge, reasoning, etc.) using a large unlabeled corpus. The process of continuously adapting a model to specific domains or tasks afterward is **Continual Learning**.

## Pre-training

### Purpose and Principles
Foundation Models are trained on hundreds of billions of tokens of web text, books, code, etc., with objectives such as **Next Token Prediction** (Autoregressive LM) or **Masked Language Modeling** (BERT-style).

```
Input: "The cat sat on the [MASK]"
Goal: Predict the masked token → "mat"
```

- **Scaling Law** (Hoffman et al., Chinchilla 2022): An optimal ratio exists between the number of model parameters and training tokens. Approximately 20 tokens per parameter is optimal.
- **Emergent Abilities**: Beyond a certain scale, capabilities like In-context Learning and CoT appear suddenly.

### Pre-training Costs
- GPT-3 (175B): ~$4.6M estimated (2020)
- Most organizations cannot perform this directly → use Foundation Models as a base for fine-tuning

## Continual Learning

### Concept
Methods for an already-trained model to continuously learn new domains and tasks. Growing importance in LLMs because of:
- Domain-specific adaptation for medicine, law, finance, etc.
- Incorporating new information after knowledge cutoff
- Multilingual expansion

### Core Problem: Catastrophic Forgetting

The phenomenon where a model loses previously learned capabilities when trained on new data.

```
Before training: Performs well in English, math, and coding
After training on new medical data: Medical ability↑, general ability↓
```

### Solution Techniques

#### 1. Replay-Based
Mix a portion of previous task data into new training data:
```python
# 80% new domain data + 20% previous domain data
train_data = new_domain_data * 0.8 + replay_buffer * 0.2
```
- **Experience Replay**: Reuse actual previous data
- **Generative Replay**: LLM generates previous knowledge to use

#### 2. Regularization-Based
Constrain changes to important parameters:
- **EWC (Elastic Weight Consolidation)**: Penalize important parameters using Fisher Information Matrix
  ```
  L_EWC = L_new + λ × Σ F_i × (θ_i - θ*_i)²
  ```
- **MixOut**: Randomly reset parameters to pre-trained weights during training

#### 3. Architecture-Based
Separate parameters for new tasks:
- **Add Adapter layers**: Freeze existing parameters, train only small adapters
- **LoRA**: Train separate parameters via low-rank decomposition (→ [[en/AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT_LoRA_QLoRA]])

#### 4. Learning Rate Strategies
- **LR Re-warming + Re-decay + Replay** combination: Can approach full retraining performance (2024 research)

### Continual Pre-training vs. Fine-tuning

| | Continual Pre-training | Fine-tuning |
|---|---|---|
| **Data scale** | Billions of tokens+ | Thousands to millions of tokens |
| **Purpose** | Internalizing domain knowledge | Task execution capability |
| **Cost** | High | Low |
| **Examples** | BloombergGPT (finance), BioMedGPT (medical) | Instruction Tuning |

## Role in AI Engineering

Pre-training sits at the very bottom of the AI Engineering pyramid. Most teams don't perform this stage directly and instead use Foundation Models from OpenAI, Anthropic, Meta, etc. However, **Continual Pre-training** becomes a core competitive advantage in domain-specialized services (financial AI, medical AI, etc.).

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] · [[en/AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT_LoRA_QLoRA]] · [[en/AI/Engineering/Model_Engineering/Model_Distillation|Model Distillation]] · [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]]

## Sources
- Hoffmann et al. (2022) "Training Compute-Optimal Large Language Models" (Chinchilla) — [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)
- Wang et al. (2024) "Continual Learning of Large Language Models: A Comprehensive Survey" — [GitHub](https://github.com/Wang-ML-Lab/llm-continual-learning-survey)
- "Efficient Continual Pre-training by Mitigating the Stability Gap" (2024) — [arXiv:2406.14833](https://arxiv.org/pdf/2406.14833)
