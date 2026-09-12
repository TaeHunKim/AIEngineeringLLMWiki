---
order: 2
---

# Speculative Decoding (추측 디코딩)

## 개요

**Speculative Decoding**은 작은 Draft 모델이 토큰을 미리 예측하고, 큰 Target 모델이 일괄 검증하는 기법이다. GPU의 병렬 처리 능력을 활용해 **품질 손실 없이 2-3배 속도 향상**을 달성한다. [[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference_Internals]]가 "메모리를 어떻게 아낄 것인가"에 집중한다면, 본 문서는 "Decode 단계 자체의 순차성을 어떻게 깨뜨릴 것인가"를 다룬다.

## 작동 원리

```
기존 Autoregressive 생성:
  "The" → "cat" → "sat" → "on"
  (한 번에 토큰 1개, Target 모델 메모리 로드 4회)

Speculative Decoding:
  Draft 모델: "The cat sat on" (4개 동시 예측, 훨씬 빠르고 저렴하게 생성)
  Target 모델: 4개를 한 번에 병렬 검증 (단일 forward pass)
  → 검증 통과한 토큰만 채택, 첫 불일치 지점부터 Target이 직접 생성
  → 메모리 로드 1회로 Target 모델 단독 생성과 수학적으로 동일한 결과
```

핵심은 **품질이 전혀 저하되지 않는다**는 점이다 — Target 모델이 매 토큰을 검증하므로 최종 출력 분포는 Target 모델 단독 생성과 동일하다(수락되지 않은 추측은 폐기되고 Target이 직접 그 자리를 채운다). Decode 단계가 메모리 대역폭에 의해 병목이 걸린다는 점([[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference_Internals]] 참고)을 이용해, 한 번의 메모리 로드로 여러 토큰을 동시에 검증함으로써 GPU의 유휴 연산 능력을 활용하는 방식이다.

## 수락률(Acceptance Rate)이 성능을 좌우한다

```
Draft 모델의 예측이 Target 모델의 실제 선택과 얼마나 자주 일치하는가 = 수락률

수락률이 높을 때: Draft가 대부분 맞춤 → 한 번에 여러 토큰 확정 → 속도 향상 극대화
수락률이 낮을 때: Draft 예측이 자주 틀림 → 검증만 하고 폐기 → Draft 생성 비용만 추가되고 이득 적음

→ Draft 모델 선택·설계의 핵심 목표는 "작으면서도 Target과 예측이 잘 일치하는" 모델을 찾는 것
```

## 주요 변형

| 기법 | 핵심 아이디어 | 특징 |
|------|--------------|------|
| **SpecInfer** | 트리 구조로 여러 추측 경로를 동시에 제시 | 단일 선형 시퀀스보다 수락 기회 자체가 늘어남 |
| **Medusa** | 별도의 작은 Draft 모델 없이, Target 모델에 여러 개의 추가 예측 head를 부착 | 여러 head가 여러 미래 위치의 토큰을 동시에 병렬 예측 |
| **EAGLE** | Target 모델의 마지막 hidden state를 재사용하는 특화 draft head | 단순 토큰 재사용보다 문맥 정보를 더 잘 보존해 수락률 향상 |
| **EAGLE-3** | 여러 레이어의 hidden state를 결합하고 트리 기반 추측·학습 방식을 개선 | 이전 세대(EAGLE/EAGLE-2) 대비 수락률과 속도 향상 폭이 더 큼 |
| **n-gram / Prompt Lookup Decoding** | 별도 모델 없이, 입력 프롬프트 안에서 n-gram이 반복되는 패턴을 그대로 추측에 사용 | 코드 편집·문서 요약처럼 입력과 출력이 많이 겹치는 태스크에서 매우 저렴하게 효과적 |

## 프로덕션 현황

```
- vLLM, SGLang, TensorRT-LLM에 기본 내장 — 별도 구현 없이 설정 플래그로 활성화
- NVIDIA H200: 3.6배 처리량 향상 사례 보고
- Draft 모델이 5-8 토큰 예측 → Target 모델이 병렬 검증하는 구성이 일반적
- 출력 품질: Target 모델 단독 생성과 수학적으로 동등 (근사가 아님)
```

## 언제 효과적인가

```
효과 높음:
  - Draft-Target 간 수락률이 높은 도메인 (코드 자동완성, 반복 패턴이 많은 텍스트)
  - 메모리 대역폭이 병목인 상황(짧은 배치, 긴 시퀀스)

효과 낮음:
  - 창의적 생성처럼 Draft가 Target의 선택을 예측하기 어려운 태스크
  - 이미 GPU가 연산 집약적으로 포화된 상황(Prefill 위주 워크로드)에서는 이득이 제한적
```

## 관련 개념
[[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]] · [[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference_Internals]] · [[AI/Engineering/Model_Engineering/Model_Distillation|Model_Distillation]]

## AI Engineering에서의 역할

Speculative Decoding은 "모델을 바꾸지 않고 레이턴시만 줄이는" 몇 안 되는 무손실(lossless) 최적화 기법이다. 양자화나 증류처럼 정확도-속도 트레이드오프를 감수해야 하는 기법들과 달리, Draft 모델 선택만 잘하면 품질 저하 없이 순수한 속도 이득을 얻을 수 있어 2025년 이후 프로덕션 서빙의 기본값으로 자리잡았다.

## 출처
- Leviathan et al. (2023) "Fast Inference from Transformers via Speculative Decoding" — [arXiv:2211.17192](https://arxiv.org/abs/2211.17192)
- Miao et al. (2023) "SpecInfer: Accelerating Generative LLM Serving with Speculative Inference and Token Tree Verification" — [arXiv:2305.09781](https://arxiv.org/abs/2305.09781)
- Cai et al. (2024) "Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads" — [arXiv:2401.10774](https://arxiv.org/abs/2401.10774)
- Li et al. (2024/2025) "EAGLE" / "EAGLE-3" — [arXiv:2401.15077](https://arxiv.org/abs/2401.15077), [arXiv:2503.01840](https://arxiv.org/abs/2503.01840)
- "Speculative Decoding: 2-3x Faster LLM Inference" (2026) — [blog.premai.io](https://blog.premai.io/speculative-decoding-2-3x-faster-llm-inference-2026/)
