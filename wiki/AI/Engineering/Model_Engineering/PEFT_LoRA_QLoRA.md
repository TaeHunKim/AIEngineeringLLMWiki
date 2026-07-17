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
Transformer의 Attention 레이어 (Q, K, V, O 프로젝션)에 주로 적용:
```
Multi-Head Attention:
  Q_proj: W_Q + ΔW_Q (LoRA 적용)
  K_proj: W_K + ΔW_K (LoRA 적용)
  V_proj: W_V + ΔW_V (LoRA 적용)
  O_proj: W_O (동결 또는 LoRA 적용)
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
# LoRA 어댑터 추가
from peft import get_peft_model, LoraConfig
lora_config = LoraConfig(r=64, lora_alpha=16, target_modules=["q_proj","v_proj"])
model = get_peft_model(model, lora_config)
```

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
[[Full_Fine-Tuning]] · [[Quantization]] · [[Pre-training_and_Continual_Learning]]

## 출처
- Hu et al. (2021) "LoRA: Low-Rank Adaptation of Large Language Models" — [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)
- Dettmers et al. (2023) "QLoRA: Efficient Finetuning of Quantized LLMs" — [arXiv:2305.14314](https://arxiv.org/abs/2305.14314)
- Lightning AI "Finetuning LLMs with LoRA and QLoRA: Insights from Hundreds of Experiments" — [lightning.ai](https://lightning.ai/pages/community/lora-insights/)
- "LoRA vs Full Fine-tuning: An Illusion of Equivalence" (2024) — [arXiv:2410.21228](https://arxiv.org/html/2410.21228v2)
