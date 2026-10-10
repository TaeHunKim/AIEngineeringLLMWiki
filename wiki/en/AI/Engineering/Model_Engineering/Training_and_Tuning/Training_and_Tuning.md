---
order: 0
---

# Training and Tuning

## Overview

**Training and Tuning** deals with how to create and modify weights that have been pre-trained. Pre-training builds the model's foundational knowledge, and then Full Fine-Tuning or PEFT/LoRA/QLoRA adjusts it for specific tasks or domains. Model Distillation transfers that capability to a smaller model. Synthetic Data and Curation is the supply stage that creates and refines the training data for all these steps, spanning all four techniques.

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Pre-training_and_Continual_Learning\|Pre-training_and_Continual_Learning]] | Large-scale pre-training, Chinchilla scaling law, catastrophic forgetting |
| [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Full_Fine-Tuning\|Full_Fine-Tuning]] | SFT, RLHF(PPO), DPO, GRPO/RLVR — Full weight update |
| [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/PEFT_LoRA_QLoRA\|PEFT_LoRA_QLoRA]] | Parameter-efficient fine-tuning, LoRA/QLoRA mathematics |
| [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Distillation\|Model_Distillation]] | Teacher-Student, DistilBERT/Phi series |
| [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Synthetic_Data_and_Curation\|Synthetic_Data_and_Curation]] | Self-Instruct/Evol-Instruct, judge filtering, dedup/decontamination, model collapse |

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[en/AI/Engineering/Model_Engineering/Model_Types/Model_Types|Model Types]] · [[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Architecture_and_Efficiency|Architecture and Efficiency]] · [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] · [[en/AI/Engineering/Loop_Engineering/RL_Environments|RL_Environments]]
