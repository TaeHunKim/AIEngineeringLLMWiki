---
order: 3
---

# Parameter-Efficient Fine-Tuning (PEFT) — LoRA & QLoRA

## 개요

**PEFT (Parameter-Efficient Fine-Tuning)**는 모델 전체 파라미터 대신 **소수의 추가 파라미터만** 학습하여 Full Fine-Tuning에 근접한 성능을 내는 기법군이다. GPU 메모리 제약이 있는 환경에서 대형 모델을 효율적으로 미세조정할 수 있게 한다.

## LoRA (Low-Rank Adaptation)

### 제창
- **저자**: Hu et al., Microsoft (2021)
- **논문**: "LoRA: Low-Rank Adaptation of Large Language Models" ([arXiv:2106.09685](https://arxiv.org/abs/2106.09685))

### 핵심 아이디어

가중치 행렬의 업데이트 ΔW를 **저랭크 행렬 분해**로 근사:

```
W' = W + ΔW = W + B × A

W  : 원래 가중치 (d × d, 동결)
A  : 랜덤 가우시안 초기화 (r × d, 학습)
B  : 영행렬 초기화 (d × r, 학습)
r  : rank (하이퍼파라미터, 보통 4~64)
```

r ≪ d이므로 실제 학습 파라미터 수가 극적으로 감소:
```
파라미터 절감 = 1 - (2 × r) / d
예: d=4096, r=16 → 학습 파라미터 비율 = 0.78%
```

### 추론 시 오버헤드 없음
추론 시 W + B×A를 병합하면 원래 모델과 동일한 구조 유지:
```python
# 추론 전 가중치 병합
merged_weight = original_weight + lora_B @ lora_A
# 이후 일반 행렬 곱과 동일
```

### 적용 위치
초기 LoRA는 Attention의 `q_proj`, `v_proj`에만 적용했으나, 이후 실험에서 **MLP(FFN) 레이어를 포함한 모든 선형 레이어(`all-linear`)에 적용할 때 Full Fine-Tuning과의 성능 격차가 가장 크게 줄어든다**는 것이 확인되었다 [3]:
```
Transformer Block:
  Attention: Q_proj, K_proj, V_proj, O_proj  (LoRA 적용)
  MLP/FFN:   gate_proj, up_proj, down_proj   (LoRA 적용 → target_modules="all-linear")
```

## QLoRA (Quantized LoRA)

### 제창
- **저자**: Dettmers et al. (2023)
- **논문**: "QLoRA: Efficient Finetuning of Quantized LLMs" ([arXiv:2305.14314](https://arxiv.org/abs/2305.14314))

### 핵심 혁신
LoRA에 **4-bit 양자화**를 결합하여 소비자급 GPU에서 70B 모델도 파인튜닝 가능:

```
QLoRA 메모리 사용:
  기존 모델: 70B × 2bytes (FP16) = 140 GB (A100 2장)
  QLoRA:     70B × 0.5bytes (NF4) = 35 GB (단일 A100 가능)
```

### 3가지 혁신 기술

1. **NF4 (4-bit NormalFloat)**: 정규분포를 가정한 양자화로 기존 INT4보다 정밀도↑
2. **Double Quantization**: 양자화 상수도 다시 양자화 → 추가 메모리 절약
3. **Paged Optimizer**: GPU 메모리 피크 시 CPU로 오프로드 → OOM 방지

```python
# QLoRA 사용 예시 (HuggingFace)
import torch
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-32B-Instruct",
    quantization_config=bnb_config,
)
# 모든 선형 레이어에 LoRA 어댑터 추가 (Attention + MLP)
lora_config = LoraConfig(r=32, lora_alpha=64, target_modules="all-linear")
model = get_peft_model(model, lora_config)
```

## LoRA 계보 확장 (DoRA · rsLoRA · GaLore)

| 기법 | 핵심 개선 | 언제 쓰는가 |
|---|---|---|
| **DoRA** (Weight-Decomposed LoRA, ICML 2024) | 가중치를 크기(magnitude)와 방향(direction)으로 분해해 방향만 저랭크 업데이트 | LoRA 대비 Full FT에 더 가까운 수렴 품질이 필요할 때 |
| **rsLoRA** (Rank-Stabilized LoRA) | 스케일링 계수를 $\alpha/r$ 대신 $\alpha/\sqrt{r}$로 변경 | $r \ge 64$ 이상의 고랭크 LoRA 학습이 불안정할 때 |
| **GaLore** (Gradient Low-Rank Projection, ICML 2024) | 가중치가 아니라 **옵티마이저 그래디언트**를 저랭크 공간으로 투영 | 어댑터 없이 Full-parameter 수준의 메모리 절감 학습 시 |

## Multi-LoRA 서빙 (S-LoRA · Punica · vLLM)

LoRA 어댑터는 수십 MB 수준으로 작아, **단일 Base Model 가중치를 GPU 메모리에 한 번만 올리고 요청마다 서로 다른 LoRA 어댑터를 동적으로 적용**할 수 있다.
- **S-LoRA / Punica / vLLM Multi-LoRA**: 서로 다른 테넌트·태스크용 어댑터 요청을 하나의 배치로 묶어 커널 수준에서 병렬 연산(`B @ A @ x`)을 수행한다. 테넌트마다 별도 70B 모델을 띄우지 않고도 수백 개의 파인튜닝 모델을 단일 클러스터에서 서빙할 수 있다.

## 기타 PEFT 기법

| 기법 | 방식 | 특징 |
|------|------|------|
| **Prompt Tuning** | 입력 앞에 학습 가능 soft 토큰 추가 | 모델 가중치 완전 동결 |
| **Prefix Tuning** | 각 Transformer 레이어에 prefix 벡터 추가 | 더 깊은 적응 가능 |
| **Adapter** | Transformer 레이어 사이 소형 MLP 삽입 | 모듈화 용이 |
| **IA³** | K, V, FF 활성화에 학습 가능 벡터 곱 | 파라미터 더 적음 |

## 성능 비교

| | Full FT | LoRA | QLoRA |
|--|---------|------|-------|
| **성능** | 최고 | Full FT의 95~99% | Full FT의 93~97% |
| **GPU 메모리** | 100% | ~30% | ~10% |
| **학습 속도** | 기준 | ~2-3× 빠름 | ~1.5-2× 빠름 |
| **가능한 GPU** | A100 클러스터 | RTX 4090 1장 | RTX 3090 1장도 가능 |

## 실무 선택 가이드

```
GPU 메모리 <24GB   → QLoRA
GPU 메모리 24~80GB → LoRA
GPU 메모리 >80GB    → Full FT (또는 LoRA for 속도)
모델 가중치 건드리기 싫다 → Prompt Tuning
```

## AI Engineering에서의 역할

PEFT는 실무 AI Engineering의 핵심 도구다. 수십억 파라미터 모델을 소규모 팀이 단일 GPU로 커스터마이즈할 수 있게 만들어, LLM 민주화의 핵심 기술이 되었다. LoRA 어댑터는 교환 가능하여 동일 Base Model에 여러 태스크별 어댑터를 운용하는 Multi-LoRA 서빙 패턴도 가능하다.

## 관련 개념
[[AI/Engineering/Model_Engineering/Training_and_Tuning/Full_Fine-Tuning|Full_Fine-Tuning]] · [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Quantization|Quantization]] · [[AI/Engineering/Model_Engineering/Training_and_Tuning/Pre-training_and_Continual_Learning|Pre-training_and_Continual_Learning]] · [[AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Merging|Model_Merging]]

## 출처
- Hu et al. (2021) "LoRA: Low-Rank Adaptation of Large Language Models" — [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)
- Dettmers et al. (2023) "QLoRA: Efficient Finetuning of Quantized LLMs" — [arXiv:2305.14314](https://arxiv.org/abs/2305.14314)
- [3] Lightning AI "Finetuning LLMs with LoRA and QLoRA: Insights from Hundreds of Experiments" — [lightning.ai](https://lightning.ai/pages/community/lora-insights/)
- "LoRA vs Full Fine-tuning: An Illusion of Equivalence" (2024) — [arXiv:2410.21228](https://arxiv.org/html/2410.21228v2)
- Liu et al. (2024) "DoRA: Weight-Decomposed Low-Rank Adaptation" — [arXiv:2402.09353](https://arxiv.org/abs/2402.09353)
- Sheng et al. (2023) "S-LoRA: Serving Thousands of Concurrent LoRA Adapters" — [arXiv:2311.03285](https://arxiv.org/abs/2311.03285)
