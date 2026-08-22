---
order: 6
---

# Model Architectures & MoE (모델 아키텍처와 MoE)

## 개요

이 문서는 Model Engineering의 나머지 문서들(사전학습·파인튜닝·양자화·증류)이 전제로만 두고 넘어가는 **모델 구조 자체의 설계 선택**을 다룬다: 파라미터를 어떻게 배치할 것인가(Dense vs MoE), 컨텍스트 길이를 어떻게 확장할 것인가(RoPE 계열), 그리고 에이전트에는 얼마나 큰 모델이 필요한가(SLM-for-Agents)라는 세 질문이다.

## Dense vs Mixture-of-Experts (MoE)

### 구조

**Dense 모델**은 모든 파라미터가 모든 토큰 처리에 관여한다. **MoE(Mixture-of-Experts) 모델**은 여러 개의 "전문가(Expert)" 서브네트워크를 두고, 각 토큰마다 라우터(Router)가 그중 일부만 활성화한다.

```
Dense 모델 (예: 70B):
  입력 토큰 → 70B 파라미터 전부 연산 → 출력
  Total Params = Active Params = 70B

MoE 모델 (예: 256개 Expert 중 토큰당 8개 활성화):
  입력 토큰 → Router가 8개 Expert 선택 → 그 8개만 연산 → 출력
  Total Params(예: 230B) ≠ Active Params(예: 10B)
```

핵심 지표는 **Total Params**(모델이 저장하는 전체 파라미터, 메모리 점유량을 결정)와 **Active Params**(토큰 하나 처리에 실제로 쓰이는 파라미터, 연산량·지연시간을 결정)의 분리다. Dense 모델은 이 둘이 같지만, MoE는 Total을 늘려 지식 용량을 키우면서도 Active는 낮게 유지해 추론 비용을 억제한다.

### 왜 에이전트 서빙 비용에 중요한가

에이전트 워크로드는 대개 짧은 응답을 매우 많이 생성한다(도구 호출 하나, 계획 한 단계). 이런 워크로드에서 Active Params가 낮다는 것은 곧 토큰당 추론 비용이 낮다는 뜻이다. MoE가 "같은 품질을 더 싸게" 대신 "같은 비용에 더 큰 지식 용량"이라는 트레이드오프를 제공하는 이유다. 다만 라우팅과 부하 분산(load balancing) — 특정 Expert에 토큰이 쏠리지 않게 하는 것 — 이 MoE 학습·서빙의 고유한 난제로 남는다.

### 2026 오픈 MoE 지형

빠르게 낡는 정보이므로 대표 사례만 짚는다. Total/Active 파라미터 비율의 감을 잡는 용도로 참고할 것.

| 모델 | Total Params | Active Params | 비고 |
|------|--------------|----------------|------|
| DeepSeek-V3 / R1 계열 | 671B | 37B | 라우팅+RLVR 결합 사례 (→ [[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full_Fine-Tuning]]의 GRPO 서술) |
| MiniMax M3 (2026-06) | 229.9B | 9.8B | 256 fine-grained Expert |
| NVIDIA Nemotron 3.5 Lightning | 30B | 3B | 장기 실행 에이전트용 저지연 설계, Speculative Decoding 내장 |
| Cohere North Mini Code | 30B | 3B | 에이전틱 코딩 특화 |

## 롱컨텍스트 아키텍처

### RoPE의 외삽 한계

대부분의 현대 LLM은 위치 정보를 **RoPE(Rotary Position Embedding)**로 인코딩한다. 문제는 훈련 시 본 최대 길이를 넘어서는 위치에 대해 RoPE가 잘 일반화되지 않는다는 것 — 훈련 길이를 크게 벗어난 위치에서 성능이 급격히 저하되는 **외삽(extrapolation) 한계**가 있다.

### Position Interpolation / NTK-aware / YaRN

이 한계를 우회하는 세 기법이 순서대로 발전했다.

- **Position Interpolation**: 새 위치 인덱스를 훈련 범위 안으로 "압축"해 넣는다. 구현이 단순하지만 압축률이 커지면 로컬 해상도(인접 토큰 간 구분력)를 잃는다.
- **NTK-aware Scaling**: RoPE의 각 주파수 성분마다 다른 압축률을 적용해, 고주파(로컬 위치 구분)는 덜 압축하고 저주파(장거리 위치)는 더 압축한다.
- **YaRN (Yet Another RoPE extensioN)**: NTK-by-parts에 어텐션 온도(temperature) 파라미터를 추가로 도입한 방식으로, 2024~2026년 사실상의 표준으로 자리잡았다. Qwen, DeepSeek, LLaMA 계열 등 대부분의 주요 모델이 컨텍스트 확장에 YaRN을 채택한다. 일반적인 2~16배 확장에서는 YaRN이 간단하면서도 다른 기법과 대등하거나 더 나은 성능을 낸다.

극단적 확장(32배 이상)에서는 **LongRoPE** 계열이 YaRN보다 우위를 보이지만, 구현 복잡도가 더 높다.

### 늘리는 것과 잘 쓰는 것은 다르다

YaRN 등으로 컨텍스트 길이를 1M 토큰까지 늘려도, 모델이 32K 토큰을 다루던 만큼의 정밀도로 1M 토큰을 다루지는 못한다 — RoPE 확장 기법 어느 것도 이 격차를 완전히 없애지 못한다. 즉 "얼마나 긴 컨텍스트를 지원하는가"(아키텍처 문제)와 "그 긴 컨텍스트를 얼마나 잘 활용하는가"(운영 문제, Context Rot)는 별개다. 후자는 [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Context_Engineering/Agentic_Context_Management]]에서 다룬다.

## SLM-for-Agents

대부분의 실제 에이전트 태스크(도구 하나 호출하기, 정해진 형식으로 라우팅하기, 짧은 코드 조각 수정하기)는 프론티어 모델의 범용 추론 능력을 요구하지 않는다는 것이 업계의 반복된 관찰이다 — NVIDIA 연구진은 이런 태스크 다수에서 **소형 모델(SLM)이 구조적으로 더 적합한 선택**이라고 주장한다: 지연시간이 낮고, 병렬로 여러 인스턴스를 띄우기 쉬우며, 좁은 태스크에 파인튜닝하기도 쉽다. 2026년 기준 이런 SLM의 다수가 앞서 다룬 MoE 구조를 소형화한 형태(예: Total 30B급, Active 3B급)로 나온다는 점도 특징이다 — "작은 모델"이라기보다는 "작은 Active Params를 가진 모델"에 가깝다.

## 경계: 서빙 최적화는 Runtime_Optimization 소관

이 문서는 **모델이 어떤 구조로 설계되는가**를 다룬다. 그 구조를 실제로 어떻게 빠르게 서빙하는가 — Speculative Decoding, vLLM의 PagedAttention, SGLang의 RadixAttention, Disaggregated Prefill/Decode 같은 추론 인프라 최적화 — 는 이 위키에서 이미 [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]]이 상세히 다루고 있다. 두 문서는 상호 보완적이다: 이 문서는 "무엇을 서빙하는가", Runtime_Optimization은 "어떻게 서빙하는가"에 답한다.

## AI Engineering에서의 역할

모델 아키텍처 선택은 대부분의 애플리케이션 팀에게는 보이지 않는 결정이다 — API로 제공되는 모델을 쓸 뿐 그 내부 구조를 바꾸지 않는다. 하지만 자체 호스팅, 온프레미스 배포, 비용에 극도로 민감한 대규모 에이전트 워크로드를 설계할 때는 이 선택이 직접적인 비용·지연시간 결정 요인이 된다 — Total/Active Params 비율이 곧 메모리 요구량과 토큰당 비용을 가르고, 컨텍스트 길이 아키텍처가 [[AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] 전체가 다룰 수 있는 상한선을 정한다.

## 관련 개념
[[AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[AI/Engineering/Model_Engineering/Quantization|Quantization]] · [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]] · [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Context_Engineering/Agentic_Context_Management]] · [[AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing]]

## 출처
- Turing Post "10 Small Language Models to Know in 2026" — [turingpost.com](https://www.turingpost.com/p/slmslist)
- Belcak et al. (NVIDIA, 2025) "Small Language Models are the Future of Agentic AI" — [arXiv:2506.02153](https://arxiv.org/abs/2506.02153)
- Peng et al. (2023) "YaRN: Efficient Context Window Extension of Large Language Models" — [arXiv:2309.00071](https://arxiv.org/abs/2309.00071)
- Ding et al. (2024) "LongRoPE: Extending LLM Context Window Beyond 2 Million Tokens" — [arXiv:2402.13753](https://arxiv.org/abs/2402.13753)
- Local AI Master "RoPE, YaRN, NTK: Long-Context LLM Techniques Explained" (2026) — [localaimaster.com](https://localaimaster.com/blog/rope-yarn-long-context-guide)
- MiniMax "MiniMax M3" 발표 (2026-06-01) — [minimax.io](https://www.minimax.io)
