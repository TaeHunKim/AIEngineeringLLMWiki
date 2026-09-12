---
order: 1
---

# Inference Internals (추론 엔진 내부 최적화)

## 개요

[[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]]에서 정의한 Prefill/Decode 두 단계를 **같은 GPU(풀) 안에서** 어떻게 효율적으로 처리하는가를 다룬다. 물리적으로 자원을 분리하는 접근은 [[AI/Engineering/Loop_Engineering/Serving_Engineering/Distributed_Serving|Distributed_Serving]]에서 다룬다 — 본 문서는 "하나의 GPU 풀 안에서 낭비를 줄이는" 기법에 집중한다.

## KV Cache — 왜 메모리가 병목인가

Decode 단계는 매 토큰 생성마다 이전에 계산한 Key/Value 벡터(KV Cache) 전체를 다시 읽어야 한다. 시퀀스가 길어질수록, 동시 요청이 많아질수록 KV Cache가 차지하는 메모리가 GPU VRAM을 빠르게 잠식한다 — 이것이 Decode 단계가 "메모리 대역폭 집약적"이라 불리는 이유다.

```
전통적 배칭의 문제:
  배치 내 모든 요청이 같은 길이라고 가정
  → 짧은 응답이 긴 응답을 기다려야 함 (GPU 유휴 시간 발생)
  → KV Cache를 연속된 메모리 블록으로 미리 할당 → 메모리 단편화·낭비
```

## PagedAttention (vLLM, UC Berkeley 2023)

OS의 가상 메모리 페이징 기법을 KV Cache에 적용한 기법.

```
KV Cache를 고정 크기 블록(page) 단위로 비연속 할당
  → 메모리 낭비를 4% 미만으로 감소 (기존 시스템 대비 최대 24배 처리량)
  → 요청마다 필요한 만큼만 블록을 할당·해제 (OS 페이지 테이블과 동일한 원리)
```

## Continuous Batching (연속 배칭)

```
요청이 완료되는 즉시 배치에서 빠지고 새 요청이 즉시 합류
  → 고정 배치 크기로 다른 요청의 완료를 기다릴 필요 없음
  → GPU 활용률 극대화 — 전통적 정적 배칭(static batching) 대비 처리량 대폭 향상
```

## Chunked Prefill

긴 프롬프트의 Prefill이 진행되는 동안 다른 요청의 Decode가 지연되는 헤드 오브 라인 블로킹을 완화하는 기법.

```
문제: 8000 토큰짜리 긴 프롬프트의 Prefill이 GPU를 통째로 점유
      → 그 사이 짧은 Decode 요청들이 대기

Chunked Prefill:
  긴 Prefill을 작은 청크(chunk)로 쪼개 여러 스텝에 걸쳐 처리
  → 각 스텝마다 Prefill 청크 + 대기 중인 Decode 요청들을 함께 배치
  → Decode 요청의 지연시간(TPOT)이 크게 개선됨
```

## RadixAttention (SGLang)

Prefix가 많이 겹치는 워크로드(동일 시스템 프롬프트를 공유하는 다수 요청, Few-shot 예시 재사용, 에이전트의 반복되는 도구 정의)에 특화된 기법.

```
여러 요청이 공유하는 프롬프트 접두사(prefix)의 KV Cache를
Radix Tree(트라이 자료구조) 형태로 캐싱·재사용

예: 시스템 프롬프트 500 토큰을 공유하는 요청 100개
  → 기존: 요청마다 500 토큰 KV Cache 재계산
  → RadixAttention: 공유 접두사는 1회만 계산, 트리에서 재사용
```

Prefix가 많이 겹치는 멀티턴 대화·Few-shot 프롬프팅·에이전트(반복되는 시스템 프롬프트 + 도구 정의)에서 특히 효과적이다. Prompt Caching과 개념적으로 유사하지만, RadixAttention은 서빙 엔진 내부에서 여러 요청 간 KV Cache를 자동으로 공유하는 것이고, [[AI/Engineering/Prompt_Engineering/Prompt_Caching|Prompt_Caching]]은 애플리케이션(프롬프트 설계) 레벨에서 벤더 API의 캐시 기능을 명시적으로 활용하는 것이다.

## FlashAttention

Attention 연산 자체를 GPU 메모리 계층(HBM vs SRAM) 특성에 맞게 재구성해 속도와 메모리 효율을 동시에 높이는 커널 최적화 기법. PagedAttention·RadixAttention이 "어떤 KV Cache를 재사용·배치할 것인가"를 다룬다면, FlashAttention은 "Attention 행렬 연산 자체를 어떻게 더 빠르게 계산할 것인가"를 다루는, 더 낮은 레벨의 최적화다. 대부분의 최신 서빙 엔진(vLLM, SGLang, TensorRT-LLM)이 기본 커널로 채택하고 있다.

## TensorRT-LLM — FP8 / NVFP4

NVIDIA의 서빙 엔진으로, 최신 GPU 아키텍처(Blackwell)의 저정밀도 연산을 적극 활용한다. FP8·NVFP4(4비트 부동소수점) 양자화로 처리량을 늘리면서 정확도 손실을 최소화하는 것이 핵심 — 프로덕션 양자화 기법 상세는 [[AI/Engineering/Model_Engineering/Quantization|Quantization]] 참고.

## AI Engineering에서의 역할

PagedAttention·Continuous Batching·RadixAttention은 오늘날 거의 모든 프로덕션 서빙 엔진에 기본 내장되어 있어, 실무자가 직접 구현할 일은 드물다. 그럼에도 이 내부 구조를 이해해야 하는 이유는 **엔진 선택과 워크로드 특성 매칭** 때문이다 — prefix 공유가 많은 에이전트 워크로드라면 RadixAttention이 강한 SGLang이, 다양한 길이의 요청이 뒤섞인 범용 워크로드라면 PagedAttention이 성숙한 vLLM이 유리하다는 판단은 내부 동작을 알아야 내릴 수 있다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]] · [[AI/Engineering/Loop_Engineering/Serving_Engineering/Speculative_Decoding|Speculative_Decoding]] · [[AI/Engineering/Loop_Engineering/Serving_Engineering/Distributed_Serving|Distributed_Serving]] · [[AI/Engineering/Prompt_Engineering/Prompt_Caching|Prompt_Caching]] · [[AI/Engineering/Model_Engineering/Quantization|Quantization]]

## 출처
- Kwon et al. (2023) "Efficient Memory Management for LLM Serving with PagedAttention" — [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)
- Zheng et al. (2024) "SGLang: Efficient Execution of Structured Language Model Programs" — [arXiv:2312.07104](https://arxiv.org/abs/2312.07104)
- Dao et al. (2022) "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness" — [arXiv:2205.14135](https://arxiv.org/abs/2205.14135)
- Agrawal et al. (2023) "SARATHI: Efficient LLM Inference by Piggybacking Decodes with Chunked Prefills" — [arXiv:2308.16369](https://arxiv.org/abs/2308.16369)
- NVIDIA "TensorRT-LLM" 문서 — [nvidia.github.io/TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/)
