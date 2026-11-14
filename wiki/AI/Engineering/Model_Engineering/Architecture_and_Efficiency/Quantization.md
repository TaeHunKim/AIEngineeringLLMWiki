---
order: 3
---

# Quantization (양자화)

## 개요

**Quantization**은 모델 가중치(및 활성화)를 고정밀도(FP32, FP16)에서 저정밀도(INT8, INT4 등)로 변환하여 **메모리 사용량과 추론 속도를 개선**하는 모델 압축 기법이다.

## 왜 필요한가?

```
Llama 3 70B 파라미터 기준:
  FP32  : 70B × 4bytes = 280 GB  (불가능)
  FP16  : 70B × 2bytes = 140 GB  (A100 2장)
  INT8  : 70B × 1byte  = 70 GB   (A100 1장)
  INT4  : 70B × 0.5byte = 35 GB  (RTX 4090 가능)
```

## 양자화 유형

### Post-Training Quantization (PTQ)
학습 완료 후 양자화. 추가 학습 불필요. 일부 정밀도 손실.

### Quantization-Aware Training (QAT)
학습 중에 양자화 시뮬레이션 포함. 정밀도 높으나 학습 비용 증가.

## 주요 PTQ 기법

### W8A8 (INT8 가중치 + INT8 활성화)
- 처리량(Throughput) 우선 시나리오에 적합
- 속도는 빠르지만 정밀도 손실 있음
- **bitsandbytes LLM.int8()**: 비정상적으로 큰 outlier 활성화를 FP16으로 혼합 처리

### GPTQ (GPU Post-Training Quantization)
- **저자**: Frantar et al. (2022)
- 각 레이어를 독립적으로 양자화. Hessian 정보를 이용한 Second-order 최적화
- MSE(평균제곱오차)를 최소화하도록 남은 가중치를 보정
- 3~4bit 양자화에서 강력한 성능
- GPU 추론 최적화 (NVIDIA GPU에서 3~4.5× 속도 향상)

```python
# GPTQ / AWQ 양자화 (vLLM llm-compressor 또는 GPTQModel)
from compressed_tensors.quantization import QuantizationArgs
from llmcompressor import oneshot
from llmcompressor.modifiers.quantization import GPTQModifier

recipe = GPTQModifier(targets="Linear", scheme="W4A16", ignore=["lm_head"])
oneshot(model="Qwen/Qwen2.5-7B-Instruct", dataset="open_platypus", recipe=recipe, output_dir="./qwen-w4a16-gptq")
```

### AWQ (Activation-aware Weight Quantization)
- **저자**: Lin et al., MIT HAN Lab (2023) — [arXiv:2306.00978](https://arxiv.org/pdf/2306.00978)
- **핵심 아이디어**: 모든 가중치가 동등하지 않다. 활성화 통계를 분석하여 중요 채널(약 1%) 식별
- 중요 채널을 scale-up 후 균일 양자화 적용 → 중요 정보 보존

```
일반 W4 양자화:
  모든 채널 균일 4-bit → 중요 정보 손실

AWQ:
  활성화 통계 분석 → 중요 채널 1% 파악
  중요 채널 scale-up → 균일 4-bit 양자화
  → 정밀도 손실 최소화
```

- 캘리브레이션 데이터와 평가 데이터 분포가 다를 때 GPTQ보다 robust

### GGUF (GPT-Generated Unified Format)
- llama.cpp에서 사용하는 포맷. CPU 추론 가능
- Q4_K_M, Q5_K_M 등 다양한 양자화 레벨 제공
- Apple Silicon (M1/M2/M3) 등에서 효율적

### FP8 / FP4 하드웨어 네이티브 양자화
- **FP8 (E4M3 / E5M2)**: NVIDIA Hopper(H100/H200) 이상 GPU의 Tensor Core가 네이티브 가속. INT8 대비 동적 범위가 넓어 품질 손실이 거의 없으면서(1% 미만) 메모리 50% 절감 및 처리량 1.5~2× 향상을 달성해 현대 프로덕션 서빙의 기본값으로 자리잡았다.
- **FP4 (MXFP4 / NVFP4)**: Blackwell(B200) 아키텍처부터 하드웨어 가속을 지원하는 4-bit 부동소수점 포맷. 블록 단위 스케일링(microscaling)을 결합해 INT4보다 아웃라이어 보존력이 높다.

### KV Cache 양자화
가중치 양자화와 별개로, 긴 컨텍스트·고동시성 서빙에서는 **KV Cache 메모리**가 GPU VRAM의 주 병목이 된다.
- **FP8 KV Cache**: Key/Value 텐서를 FP8(E4M3/E5M2)로 저장하면 KV Cache 메모리 점유량을 절반으로 줄여 동일 GPU에서 처리 가능한 동시 배치 크기(concurrency)와 최대 컨텍스트 길이를 2배 가까이 늘릴 수 있다(vLLM, SGLang, TensorRT-LLM 기본 지원 → [[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference_Internals]]).

### BitNet b1.58 (1.58-bit 3진 양자화 학습)
- **저자**: Ma et al., Microsoft Research (2024) — [arXiv:2402.17764](https://arxiv.org/abs/2402.17764)
- **원리**: 학습 단계부터 가중치를 $\{-1, 0, +1\}$ 3진 값($\log_2 3 \approx 1.58\text{ bits}$)으로 제약(QAT)하여 행렬 곱셈을 부동소수점 곱셈 대신 정수 덧셈·뺄셈만으로 대체, 에너지·메모리 소모를 극적으로 절감한다.

## 양자화 레벨별 정밀도-속도 트레이드오프

| 포맷 | 비트 | 메모리 절감 | 품질 손실 | 추천 용도 |
|------|------|-----------|---------|---------|
| FP16/BF16 | 16 | 기준 | 없음 | 학습, 고품질 추론 |
| **FP8 (E4M3)** | 8 | 50% | 극히 미미 | **H100+ 프로덕션 서빙 기본값** |
| INT8 | 8 | 50% | 미미 | 범용 서버 추론 |
| **NVFP4 / MXFP4** | 4 | 75% | 매우 적음 | Blackwell(B200)+ 고밀도 서빙 |
| INT4 (AWQ) | 4 | 75% | 매우 적음 | 리소스 제한 + 품질 |
| INT4 (GPTQ) | 4 | 75% | 적음 | 리소스 제한 배포 |
| BitNet b1.58 | 1.58 | ~90% | 모델 규모별 상이 | QAT 기반 초저전력·에지 추론 |
| INT2~3 | 2~3 | 85%+ | 큼 | 극단적 압축 (실험적) |

## 실무 선택 가이드

```
서버 추론 (NVIDIA GPU):
  처리량 우선 → W8A8 (INT8)
  메모리 절감 + 품질 → AWQ INT4
  정밀한 양자화 필요 → GPTQ

로컬 추론 (CPU/Apple Silicon):
  → GGUF (llama.cpp)

파인튜닝 중 메모리 절감:
  → QLoRA (NF4 양자화 + LoRA)
```

## AI Engineering에서의 역할

Quantization은 Compression & Optimization 레이어의 핵심 도구로, **배포 비용을 직접 결정**한다. 70B 모델을 단일 서버에서 서빙하거나, 소비자 GPU에서 실행하는 것을 가능하게 만든다. LLM 서비스 비용의 상당 부분이 추론 GPU 비용임을 감안하면, 적절한 양자화 전략은 비즈니스 경쟁력과 직결된다.

## 관련 개념
[[AI/Engineering/Model_Engineering/Training_and_Tuning/PEFT_LoRA_QLoRA|PEFT_LoRA_QLoRA]] · [[AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Distillation|Model_Distillation]] · [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability_and_Tracing]] · [[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Loop_Engineering/Serving_Engineering/Inference_Internals]]

## 출처
- Lin et al. (2023) "AWQ: Activation-aware Weight Quantization" — [arXiv:2306.00978](https://arxiv.org/pdf/2306.00978)
- Frantar et al. (2022) "GPTQ: Accurate Post-Training Quantization" — [arXiv:2210.17323](https://arxiv.org/abs/2210.17323)
- Cast AI "LLM Quantization Methods: GPTQ, AWQ, GGUF" — [cast.ai](https://cast.ai/blog/demystifying-quantizations-llms/)
- Microsoft "A practical guide to INT4 quantization for SLMs" — [Medium](https://medium.com/data-science-at-microsoft/a-practical-guide-to-int4-quantization-for-slms-gptq-vs-awq-olive-and-real-world-results-2f63d6963d1d)
