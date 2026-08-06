---
order: 1
---

# Complexity-Aware Model Routing (복잡도 기반 모델 라우팅)

## 개요

**Complexity-Aware Model Routing**은 요청의 실제 난이도를 판단해 그에 맞는 가장 저렴한 모델로 자동 전환하는 기법이다. [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime_Optimization]]이 이미 다루는 정적 모델 라우팅(사전 정의된 규칙 기반)과 달리, 여기서는 **워처 에이전트가 프로덕션 로그를 상시 분석해 라우팅 정책 자체를 지속적으로 갱신**하는 자동화된 버전을 다룬다 — "이 요청은 실제로 더 가벼운 자원으로 처리 가능한가"를 계속 재판단하는 것이다.

## LLM Cascade: FrugalGPT

- **저자**: Chen, Zaharia, Zou (2023), "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance" — [arXiv:2305.05176](https://arxiv.org/abs/2305.05176)
- **핵심 아이디어**: 가장 작은/저렴한 모델부터 순차적으로 시도하고, 응답의 신뢰도가 충분하면 즉시 반환, 부족하면 다음 단계의 더 크고 비싼 모델로 승격(escalate)한다.

```
Cascade 흐름:
  요청 → [최소 모델] → 신뢰도 점수 계산
                          ├─ 충분함 → 응답 반환 (저비용 종료)
                          └─ 부족함 → [다음 단계 모델] → 반복
                                        ... → [최대 모델] (최후 수단)

FrugalGPT의 신뢰도 판정: 경량 스코어러(예: fine-tuned DistilBERT)가
(질문, 응답) 쌍으로부터 정답 가능성을 예측, 단계별 임계값과 비교
```

- **효과**: 논문 보고 기준 동일 품질을 유지하면서 비용 최대 98% 절감 (벤치마크 평균 50~98%)
- FrugalGPT는 여기에 더해 **prompt adaptation**(더 저렴한 프롬프트 형태로 재구성)과 **LLM approximation**(캐싱·미세조정된 소형 모델로 근사)까지 함께 최적화하는 프레임워크(FrugalML)를 제안한다.

## 학습된 라우터: RouteLLM과 UCCI

FrugalGPT의 캐스케이드가 "순차 시도 후 조건부 승격"이라면, 학습된 라우터는 요청을 보자마자 어떤 모델로 보낼지 한 번에 예측한다.

- **RouteLLM**(UC Berkeley/Anyscale/Canva, ICLR 2025) — [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime_Optimization]]에 이미 소개된 학습 기반 라우터. 선호도 데이터로 학습해 MT-Bench 기준 85%, MMLU 기준 45% 비용 절감을 보고
- **UCCI**(2026), "Calibrated Uncertainty for Cost-Optimal LLM Cascade Routing" — [arXiv:2605.18796](https://arxiv.org/abs/2605.18796) — 모델이 자기 답변에 대해 갖는 불확실성을 보정(calibrate)해, "이 정도 확신이면 다음 모델로 넘겨야 한다"는 임계값을 더 정교하게 추정하는 후속 연구

## 에이전트 워크플로 특화 라우팅

일반 챗봇과 달리 에이전트는 멀티턴·멀티스텝 실행 중 매 단계마다 라우팅 판단이 필요하다.

- **Budget-Aware Agentic Routing via Boundary-Guided Training**(2026) — [arXiv:2602.21227](https://arxiv.org/abs/2602.21227) — 예산 제약 하에서 에이전트가 대형 모델 수준 성능을 훨씬 낮은 비용으로 근사하도록 라우팅을 학습
- **SWE-Router**(2026), "Routing in Multi-turn Agentic Software Engineering Tasks" — [arXiv:2607.00053](https://arxiv.org/pdf/2607.00053) — 멀티턴 에이전틱 소프트웨어 엔지니어링 태스크에서, 매 턴마다 그 턴을 처리하기에 충분한 최소 비용 모델을 호출하도록 라우팅해 비용-성능 프론티어를 개선

## 태스크 분해 후 라우팅

한 요청이 겉보기엔 복잡해 보여도, 실제로는 여러 개의 단순한 하위 작업으로 쪼갤 수 있는 경우가 많다. 이 경우 전체를 하나의 무거운 모델에 맡기는 대신, 워처 에이전트가 다음을 수행할 수 있다:

```
1. 요청을 하위 태스크로 분해 시도 (예: "보고서 작성" → 자료 수집 + 요약 + 형식 변환 + 최종 검토)
2. 각 하위 태스크의 난이도를 개별 추정
3. 단순한 하위 태스크(자료 수집, 형식 변환)는 경량/로컬 모델로
   복잡한 하위 태스크(최종 검토)만 중량 모델로 유지
```

이 판단이 틀리면(실제로는 분해 불가능한 작업을 억지로 쪼개면) 품질이 저하될 수 있으므로, 아래의 검증 기간을 반드시 거쳐야 한다.

## 전환 전 검증 기간

라우팅 정책을 바꾸는 것은 실제 서비스 품질에 영향을 주는 변경이다. 워처 에이전트가 "이 작업은 경량 모델로 충분하다"고 잘못 판단하면 품질 저하가 사용자에게 그대로 노출된다. 따라서 [[AI/Engineering/Loop_Engineering/Production_Operations|Production_Operations]]의 **Shadow/Canary Deployment** 패턴을 그대로 적용한다:

```
1. Shadow 단계: 새 라우팅 정책을 실제 트래픽에 적용하지 않고 병행 실행,
   기존 정책과 결과만 비교(품질 차이 측정, 비용은 실제 청구되지 않음)
2. Canary 단계: 트래픽의 일부(예: 5%)에만 새 정책 적용, 품질 지표 모니터링
3. 품질 저하가 임계값 이내면 점진적으로 트래픽 비중 확대
4. 품질 저하가 임계값을 넘으면 즉시 롤백
```

이 검증 기간의 길이는 태스크의 위험도에 따라 조정한다 — 되돌리기 어려운 결과(예: 외부로 전송되는 이메일 작성)를 만드는 작업일수록 더 긴 관찰 기간이 필요하다.

## AI Engineering에서의 역할

Complexity-Aware Model Routing은 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]]이 다루는 세 메커니즘 중 즉각적인 비용 절감 효과가 가장 크면서도 구현 난이도는 상대적으로 낮은 축에 속한다. 다만 라우팅 판단 오류가 곧바로 사용자 경험 저하로 이어지므로, 정적 라우팅 규칙을 자동으로 갱신하는 워처 에이전트를 도입할 때는 반드시 Shadow/Canary 같은 안전장치와 함께 설계해야 한다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost_Engineering/Cost_Engineering]] · [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime_Optimization]] · [[AI/Engineering/Loop_Engineering/Production_Operations|Production_Operations]] · [[AI/Engineering/Loop_Engineering/Cost_Engineering/Deterministic_Task_Scriptification|Deterministic_Task_Scriptification]]

## 출처
- Chen, Zaharia & Zou (2023) "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance" — [arXiv:2305.05176](https://arxiv.org/abs/2305.05176)
- Ong et al. (ICLR 2025) "RouteLLM: Learning to Route LLMs with Preference Data" — [arXiv:2406.18665](https://arxiv.org/abs/2406.18665)
- "Calibrated Uncertainty for Cost-Optimal LLM Cascade Routing" (2026) — [arXiv:2605.18796](https://arxiv.org/abs/2605.18796)
- "Budget-Aware Agentic Routing via Boundary-Guided Training" (2026) — [arXiv:2602.21227](https://arxiv.org/abs/2602.21227)
- "SWE-Router: Routing in Multi-turn Agentic Software Engineering Tasks" (2026) — [arXiv:2607.00053](https://arxiv.org/pdf/2607.00053)
