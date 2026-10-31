---
order: 3
---

# Distributed Serving (분산 서빙)

## 개요

[[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference_Internals]]가 하나의 GPU(풀) 안에서 Prefill/Decode의 자원 충돌을 완화하는 기법을 다뤘다면, 본 문서는 **여러 GPU·여러 리전에 걸쳐 물리적으로 자원을 분리·확장**하는 접근을 다룬다.

## Disaggregated Prefill/Decode (분리형 서빙)

[[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]]에서 정의한 것처럼 Prefill은 연산 집약적, Decode는 메모리 대역폭 집약적이다. 두 단계를 같은 GPU에서 처리하면 서로의 자원 요구가 충돌한다.

```
기존 (통합 서빙): 하나의 GPU 풀이 Prefill + Decode 모두 처리
  → 긴 Prefill이 진행 중인 Decode의 지연시간을 증가시킴 (헤드 오브 라인 블로킹)
  → Chunked Prefill로 완화 가능하지만 완전히 제거되지는 않음

Disaggregated Serving (NVIDIA Dynamo, llm-d 등):
  Prefill 전용 GPU 풀 + Decode 전용 GPU 풀로 물리적 분리
  → Prefill 완료 후 KV Cache를 Decode 풀로 전송(KV Cache Transfer)
  → 각 단계를 독립적으로 스케일링·최적화 가능
    (Prefill 풀은 연산에 강한 GPU, Decode 풀은 메모리 대역폭이 넓은 GPU로 각각 특화 가능)
```

## KV Cache Transfer — 분리의 핵심 비용

Prefill 풀에서 계산된 KV Cache를 Decode 풀로 옮기는 과정 자체가 새로운 병목이 될 수 있다.

```
전송 비용을 좌우하는 요인:
  - 프롬프트 길이(KV Cache 크기와 비례)
  - Prefill 풀과 Decode 풀 간 네트워크 대역폭(고속 인터커넥트 여부)
  - 전송 방식(동기 대기 vs 비동기 파이프라이닝)

완화 전략:
  - 고속 인터커넥트(NVLink, InfiniBand)로 Prefill-Decode 풀을 물리적으로 인접 배치
  - KV Cache 압축 후 전송
  - 분산 KV Cache 풀(distributed KV pool) — 여러 Decode 인스턴스가 공유 캐시 계층에서 조회
```

## 실무 적용: KV 커넥터와 분리 판단 기준

**전송량 감각**: Llama-3.1-70B(BF16)의 KV Cache는 토큰당 약 320 KiB다. 10k 토큰 프롬프트면 Prefill에서 Decode로 약 3 GB를 넘겨야 하고, 400 Gb/s 회선에서도 오버헤드 전에 약 65 ms가 걸린다. 이 시간은 전부 TTFT에 더해진다. GPU 간 P2P가 없는 환경(L40S 2장, NVLink 없음)에서는 Qwen2.5-7B의 8k 토큰 KV(약 470 MB)가 Decode에 도착하는 데 약 1.3초가 걸렸다.

**KV 커넥터**: vLLM은 NIXL, LMCache, Mooncake, FlexKV, AMD MoRI-IO 등 10여 개 KV 커넥터와 이를 연결하는 `MultiConnector`를 제공한다. NIXL은 KV Cache 메모리를 직접 등록해 RDMA로 GPU 간 전송한다. 대화·에이전트 루프처럼 컨텍스트가 계속 자라는 워크로드에는 LMCache·Mooncake 같은 **KV offload·공유 KV 캐시**를 함께 쓰고, 후속 턴을 이미 이력을 가진 워커로 보내는 **cache-aware routing**을 붙이는 것이 권장된다. 예제 proxy는 개발용이고, 프로덕션 라우팅은 llm-d나 Dynamo가 맡는다.

```
분리가 이득인 경우:
  - 프로덕션 부하에서 ITL p99가 SLO를 넘는다
  - 긴 프롬프트 + 높은 동시성, 그리고 KV 전송이 충분히 빠르다
분리가 손해인 경우:
  - TTFT가 핵심 제약이다 (전송 시간이 모든 첫 토큰에 더해짐)
  - 트래픽이 낮거나 들쭉날쭉하다 → 통합 서빙 + Chunked Prefill 유지
사전 점검:
  - prefill·decode GPU 간 P2P 가능 여부, decode 측 평균 KV 전송 시간
```

보고된 수치(2026-09 vLLM 블로그 기준, 모두 특정 하드웨어·워크로드 조건)는 다음과 같다.
- L40S 2장, 8k 프롬프트: 통합 서빙은 0.4 req/s에서 p99 ITL이 23 → 169 ms로 뛰었고, P/D 분리는 25~52 ms를 유지했다. 대신 P/D의 median TTFT는 2.2초로 통합(0.7초)보다 나빴다.
- AMD MoRI-IO(Qwen3-235B-A22B-FP8, MI300X 8장, 8 req/s): TTFT 1초·ITL 50 ms를 모두 만족한 요청이 100개 중 73개로, 통합(30개) 대비 goodput 약 2.4배.
- llm-d(gpt-oss-120b, H200 16장): 같은 GPU의 통합 replica 대비 평균 end-to-end 지연 약 59%, P95 약 67% 감소.

**운영 함정**: 렌더링(템플릿·토큰화)을 CPU 노드로 분리할 때는 render·derender·엔진이 모델·토크나이저·chat template·parser 설정을 모두 공유해야 한다. 어긋나면 content·reasoning·tool_calls 분할이 경고 없이 바뀐다. 이전 턴의 thinking trace를 버리는 chat template은 decode 측 캐시 블록과 불일치를 일으켜 잘못된 출력을 낼 수 있다.

## TP / PP / EP — 모델 자체를 나누는 병렬화

Disaggregation이 "단계(Prefill vs Decode)"를 나눈다면, 아래 세 가지는 "모델 자체"를 여러 GPU에 나누는 병렬화 기법이다. 대형 모델이 GPU 한 대 메모리에 올라가지 않을 때 필수적이다.

```
Tensor Parallelism (TP)
  하나의 레이어 연산(행렬 곱셈)을 여러 GPU에 분할
  → GPU 간 통신이 매 레이어마다 발생 (고속 인터커넥트 필수)
  → 레이턴시에 민감, 단일 노드 내 GPU 간(NVLink)에서 주로 사용

Pipeline Parallelism (PP)
  모델을 레이어 단위로 나눠 GPU마다 다른 레이어 구간을 담당
  → 마이크로배치를 파이프라인처럼 흘려보내 GPU 유휴 시간 최소화
  → 노드 간(상대적으로 느린 네트워크)에도 적용 가능

Expert Parallelism (EP)
  MoE(Mixture of Experts) 모델의 각 Expert를 서로 다른 GPU에 분산
  → 토큰마다 라우팅되는 Expert가 다르므로 GPU 간 통신 패턴이 동적
  → Dense 모델의 TP/PP와는 다른 부하 분산 문제(Expert 간 부하 불균형) 발생
    (Model_Architectures_and_MoE의 MoE 라우팅 개념과 연결)
```

## Goodput 스케줄링

[[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]]에서 정의한 Goodput(SLA를 만족하는 처리량) 지표를 분산 환경에서 어떻게 유지할 것인가.

```
단순 처리량 극대화의 함정:
  GPU 풀 전체의 처리량은 높지만, 특정 요청들의 TTFT/TPOT가 SLA를 위반하며 "숨겨진 실패"가 발생

Goodput 기반 스케줄링:
  - 요청별 SLA(지연시간 목표)를 스케줄러에 명시적으로 전달
  - Prefill 풀·Decode 풀 각각에서 SLA 위반 위험이 큰 요청에 우선순위 부여
  - 단순 FIFO/처리량 최적화 대신 "몇 개의 요청이 SLA를 만족하는가"를 목적함수로 최적화
```

## 콜드 스타트와 멀티 리전

서버리스 LLM 배포에서는 모델 가중치(수십 GB)를 새 인스턴스에 로드하는 콜드 스타트가 지연시간의 주요 원인이다.

```
콜드 스타트 완화 기법:
  - 가중치 프리페칭(사용량 예측에 기반해 미리 로드)
  - 스냅샷 기반 빠른 복원(메모리 상태 자체를 스냅샷으로 저장·복원)
  - 최소 인스턴스 유지(warm pool) — 완전히 내려가지 않는 인스턴스 최소 수 유지

멀티 리전 배포:
  KV Cache Locality — 사용자를 이전에 요청했던 리전으로 재라우팅해 캐시 재사용률 유지
  → 리전 간 라우팅이 무작위이면 매 요청마다 KV Cache를 새로 계산해야 해 비용·지연시간 모두 악화
```

## 경계 정리

| 문서 | 다루는 것 |
|------|-----------|
| [[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals\|Inference_Internals]] | **같은 GPU(풀) 안에서** 메모리·배칭을 최적화하는 기법 |
| **본 문서 (Distributed_Serving)** | **여러 GPU·여러 리전에 걸쳐** 물리적으로 자원을 분리·확장하는 기법 |

## AI Engineering에서의 역할

Disaggregated Serving과 TP/PP/EP는 단일 GPU 최적화(Inference_Internals)만으로는 감당할 수 없는 규모 — 초대형 모델, 초고처리량 서비스 — 에서 등장하는 다음 단계의 최적화다. 이 단계에 도달한 조직에게는 인프라 구성 자체가 모델 성능만큼 중요한 아키텍처 결정이 된다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]] · [[AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference_Internals]] · [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Model_Architectures_and_MoE|Model_Architectures_and_MoE]] · [[AI/Engineering/Loop_Engineering/Production_Operations|Production_Operations]]

## 출처
- NVIDIA "Dynamo: Disaggregated Serving" — [developer.nvidia.com](https://developer.nvidia.com/blog/introducing-nvidia-dynamo/)
- llm-d 프로젝트 — [llm-d.ai](https://llm-d.ai)
- vLLM Blog "Taking vLLM Apart: A Practical Guide to Disaggregated Serving" (2026-09-29) — [vllm.ai](https://vllm.ai/blog/2026-09-29-disaggregated-serving-guide)
- llm-d "Disaggregated Serving" 문서 — [llm-d.ai](https://llm-d.ai/docs/architecture/advanced/disaggregation)
- Shoeybi et al. (2019) "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism (Tensor Parallelism)" — [arXiv:1909.08053](https://arxiv.org/abs/1909.08053)
- Huang et al. (2019) "GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism" — [arXiv:1811.06965](https://arxiv.org/abs/1811.06965)
- AI Engineering from Scratch, Phase 17 · Lessons 04-18 (서빙 엔진 내부, Disaggregated Serving, 셀프호스팅) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/17-infrastructure-and-production)
