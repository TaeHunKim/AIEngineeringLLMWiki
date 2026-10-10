---
order: 0
---

# Training and Tuning (학습과 튜닝)

## 개요

**Training and Tuning**은 사전학습으로 만들어진 가중치를 어떤 방법으로 만들고 바꾸는가를 다룬다. Pre-training이 모델의 기반 지식을 만들고, 그 위에 Full Fine-Tuning이나 PEFT/LoRA/QLoRA로 특정 태스크·도메인에 맞춰 조정하며, Model Distillation은 그 능력을 더 작은 모델로 옮긴다. Synthetic Data and Curation은 이 모든 단계에 들어가는 학습 데이터를 만들고 정제하는 공급 단계로, 네 기법 전체를 가로지른다.

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[AI/Engineering/Model_Engineering/Training_and_Tuning/Pre-training_and_Continual_Learning\|Pre-training_and_Continual_Learning]] | 대규모 사전 학습, Chinchilla 법칙, 재앙적 망각 |
| [[AI/Engineering/Model_Engineering/Training_and_Tuning/Full_Fine-Tuning\|Full_Fine-Tuning]] | SFT, RLHF(PPO), DPO, GRPO/RLVR — 전체 가중치 업데이트 |
| [[AI/Engineering/Model_Engineering/Training_and_Tuning/PEFT_LoRA_QLoRA\|PEFT_LoRA_QLoRA]] | 파라미터 효율적 파인튜닝, LoRA/QLoRA 수학 |
| [[AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Distillation\|Model_Distillation]] | Teacher-Student, DistilBERT/Phi 계열 |
| [[AI/Engineering/Model_Engineering/Training_and_Tuning/Synthetic_Data_and_Curation\|Synthetic_Data_and_Curation]] | Self-Instruct/Evol-Instruct, judge 필터링, dedup/decontamination, model collapse |

## 관련 개념
[[AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[AI/Engineering/Model_Engineering/Model_Types/Model_Types|Model Types]] · [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Architecture_and_Efficiency|Architecture and Efficiency]] · [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] · [[AI/Engineering/Loop_Engineering/RL_Environments|RL_Environments]]
