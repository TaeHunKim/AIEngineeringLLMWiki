---
order: 1
---

# Pre-training & Continual Learning

## 개요

**Pre-training**은 대규모 비라벨 코퍼스를 이용해 언어 모델의 기초 능력(문법, 세계 지식, 추론 등)을 학습하는 단계다. 이후 특정 도메인이나 태스크에 모델을 지속적으로 적응시키는 과정이 **Continual Learning**(지속 학습)이다.

## Pre-training

### 목적 및 원리
Foundation Model은 수천억 토큰의 웹 텍스트, 책, 코드 등에 대해 **Next Token Prediction** (Autoregressive LM) 또는 **Masked Language Modeling** (BERT 계열) 목표로 학습된다.

```
입력: "The cat sat on the [MASK]"
목표: 마스킹된 토큰 예측 → "mat"
```

- **Scaling Law** (Hoffman et al., Chinchilla 2022): 모델 파라미터 수와 학습 토큰 수의 최적 비율이 존재함. 파라미터 1개당 약 20 토큰이 최적.
- **Emergent Abilities**: 특정 규모를 넘으면 In-context Learning, CoT 등 능력이 갑자기 출현.

### Pre-training 비용
- GPT-3 (175B): ~$4.6M 추정 (2020)
- 대부분의 조직에서 직접 수행 불가 → Foundation Model을 기반으로 Fine-tuning 활용

## Continual Learning (지속 학습)

### 개념
이미 학습된 모델이 새로운 도메인·태스크를 지속적으로 배우는 방법. LLM에서 중요성이 증가하는 이유:
- 의료, 법률, 금융 등 도메인 특화 적응
- 지식 cutoff 이후 새 정보 반영
- 멀티링구얼 확장

### 핵심 문제: Catastrophic Forgetting

새로운 데이터로 학습할 때 이전에 학습한 능력을 잃어버리는 현상.

```
학습 전: 영어·수학·코딩 모두 잘 수행
새 의료 데이터로 학습 후: 의료 능력↑, 범용 능력↓
```

### 해결 기법

#### 1. Replay-Based (리플레이)
이전 태스크 데이터의 일부를 새 학습 데이터에 혼합:
```python
# 새 도메인 데이터 80% + 이전 도메인 데이터 20% 혼합
train_data = new_domain_data * 0.8 + replay_buffer * 0.2
```
- **Experience Replay**: 실제 이전 데이터 재사용
- **Generative Replay**: LLM이 이전 지식을 생성하여 사용

#### 2. Regularization-Based (정규화)
중요한 파라미터 변화를 제한:
- **EWC (Elastic Weight Consolidation)**: Fisher Information Matrix를 이용해 중요 파라미터에 페널티 부여
  ```
  L_EWC = L_new + λ × Σ F_i × (θ_i - θ*_i)²
  ```
- **MixOut**: 학습 중 일정 확률로 파라미터를 사전학습 가중치로 리셋

#### 3. Architecture-Based (아키텍처)
새 태스크를 위한 파라미터를 분리:
- **Adapter 레이어 추가**: 기존 파라미터 동결 후 소규모 어댑터만 학습
- **LoRA**: 저랭크 분해로 분리된 파라미터 학습 (→ [[PEFT_LoRA_QLoRA]])

#### 4. Learning Rate 전략
- **LR Re-warming + Re-decay + Replay** 조합: 완전 재학습 성능에 근접 가능 (2024 연구 결과)

### Continual Pre-training vs. Fine-tuning

| | Continual Pre-training | Fine-tuning |
|---|---|---|
| **데이터 규모** | 수십억 토큰 이상 | 수천~수백만 토큰 |
| **목적** | 도메인 지식 내재화 | 특정 태스크 수행 능력 |
| **비용** | 높음 | 낮음 |
| **예시** | BloombergGPT (금융), BioMedGPT (의료) | Instruction Tuning |

## AI Engineering에서의 역할

Pre-training은 AI Engineering 피라미드의 가장 아래에 위치한다. 대부분의 팀은 이 단계를 직접 수행하지 않고 OpenAI, Anthropic, Meta 등의 Foundation Model을 활용한다. 그러나 **Continual Pre-training**은 도메인 특화 서비스(금융 AI, 의료 AI 등)에서 핵심 경쟁 우위가 된다.

## 관련 개념
[[Full_Fine-Tuning]] · [[PEFT_LoRA_QLoRA]] · [[Model_Distillation]] · [[Quantization]]

## 출처
- Hoffmann et al. (2022) "Training Compute-Optimal Large Language Models" (Chinchilla) — [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)
- Wang et al. (2024) "Continual Learning of Large Language Models: A Comprehensive Survey" — [GitHub](https://github.com/Wang-ML-Lab/llm-continual-learning-survey)
- "Efficient Continual Pre-training by Mitigating the Stability Gap" (2024) — [arXiv:2406.14833](https://arxiv.org/pdf/2406.14833)
