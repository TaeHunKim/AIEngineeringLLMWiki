---
order: 5
---

# RL Environments (강화학습 환경)

## 개요

**RL Environments**는 에이전트가 강화학습으로 훈련되거나 평가될 때 상호작용하는 **시뮬레이션된 태스크 공간**을 가리킨다. [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] 문서가 GRPO·RLVR로 "모델을 어떻게 강화학습으로 훈련하는가"를 다룬다면, 이 문서는 그 학습이 성립하기 위한 전제조건 — **검증 가능한 보상 신호를 어디서, 어떻게 얻는가**를 다룬다.

```
RLVR 훈련 루프 (Continuous_Optimization.md가 다루는 부분):
  모델이 응답 생성 → [보상 신호] → GRPO로 정책 업데이트

이 문서가 다루는 부분:
  [보상 신호]가 어디서 오는가?
  → 태스크를 실행할 환경, 정답 여부를 판정할 verifier, 상태를 관리할 인프라
```

## 왜 환경이 별도 공학 분야가 됐는가

RLVR이 수학·코드처럼 "정답이 명확한" 도메인을 넘어 **에이전틱 태스크**(멀티스텝 도구 사용, 장기 실행 워크플로)로 확장되면서, 좋은 훈련 신호를 만드는 작업의 난이도가 급격히 올라갔다. 단순히 "정답 문자열과 일치하는가"를 넘어, 수십 개의 도구·수백 개의 데이터 테이블이 있는 상태 유지형 환경에서 "이 멀티스텝 행동 시퀀스가 실제로 태스크를 완수했는가"를 판정해야 한다. 이 판정 인프라를 만드는 일이 모델 훈련과 구분되는 독립된 공학 영역으로 떨어져 나온 것이 RL Environment Engineering이다.

## Gymnasium API 계보

RL 환경의 인터페이스는 대체로 OpenAI Gym에서 시작해 그 후속인 **Gymnasium**의 API를 계승한다:

```python
env = make_environment(task="customer_support_ticket_routing")

observation = env.reset()  # 초기 상태 반환
while not done:
    action = agent.act(observation)          # 에이전트가 행동 선택
    observation, reward, terminated, truncated, info = env.step(action)
    # reward: 이 행동에 대한 보상
    # terminated: 태스크 성공/실패로 종료됐는가
    # truncated: 최대 스텝 초과로 강제 종료됐는가
```

LLM 에이전트용 환경들은 이 골격 위에, "행동"을 도구 호출로, "관찰"을 도구 실행 결과로 바꿔 얹는다.

## 2025~2026 지형

"에이전트용 Gym"류 프로젝트가 짧은 기간에 폭발적으로 늘었다. 대표적인 것들:

| 환경/프레임워크 | 특징 |
|---|---|
| **SWE-Gym** | 실제 GitHub 이슈 기반 — SWE-bench와 같은 철학("연구자가 지어낸 문제가 아니라 실제 개발자가 제기한 문제") |
| **GEM** | Gymnasium API를 가장 충실히 따름, 24개+ 내장 게임·수학·코드 환경 |
| **RAGEN / VAGEN** | 멀티턴 에이전트·비전-언어 에이전트 특화 |
| **AgentGym** | 범용 에이전트 궤적 수집·훈련 프레임워크 |
| **verifiers** | 데이터셋·도구·rubric·rollout harness·트레이너까지 컴포넌트를 가장 폭넓게 번들 |
| **SkyRL, OpenEnv** | 확장성·분산 실행에 중점 |
| **WebArena, OSWorld, ToolBench** | 각각 웹 브라우징, 컴퓨터 사용, 도구 사용에 특화된 벤치마크 겸 환경 |

상태 유지형(stateful) 환경도 등장했다 — 예를 들어 164개 DB 테이블과 512개 도구를 유지하며, 한 태스크의 행동이 다음 태스크가 보는 상태에 실제로 영향을 미치는 환경이다. 이런 환경은 태스크 간 오염(한 에피소드의 부작용이 다음 에피소드로 새는 문제)을 막는 것 자체가 별도 엔지니어링 과제가 된다.

## Verifier: 무엇이 "정답"인지 판정하기

좋은 RL 환경은 보상 함수만이 아니라, 에이전트의 행동이 옳았는지를 프로그램적·모델적·인간적으로 판정하는 **verifier**를 필요로 한다.

- **프로그램적(Programmatic) verifier**: 규칙 기반 스크립트로 자동 채점 — 코드가 컴파일되는가, 테스트가 통과하는가, DB 상태가 기대값과 일치하는가. 가장 신뢰할 수 있지만 검증 가능한 도메인에서만 쓸 수 있다.
- **모델 기반(Model-based) verifier**: 별도 LLM이 결과를 채점 — [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM_as_a_Judge]]와 같은 메커니즘을 훈련 시점의 보상 신호로 재사용하는 것이다.
- **HITL verifier**: 사람이 직접 채점 — 가장 비싸지만 프로그램적으로 검증 불가능한 주관적 품질(어조, 창의성)에 필요하다.

**보상 설계에서는 "언제 보상을 줄 것인가"가 "무엇으로 보상을 줄 것인가"보다 중요하다는 것이 최근 관찰이다.** 에피소드 종료 시 한 번만 보상을 주는 방식(outcome reward)은 훈련이 느리고, 매 스텝 세밀하게 보상을 주는 방식(dense reward)은 에이전트가 지름길로 보상을 해킹할 위험이 있다. 실무에서는 **결과 검증 + 단계별 채점을 결합한 하이브리드 rubric**으로 수렴하는 추세다.

## 자동 환경 생성

환경을 사람이 일일이 손으로 작성하는 대신, **LLM 코딩 에이전트가 새 환경 코드 자체를 작성**하게 하는 접근이 늘고 있다 — 환경의 다양성을 사람 손으로 확장하는 속도의 한계를 우회하려는 시도다. 이 접근은 아직 검증·안전성 확보가 진행 중인 영역이다.

## 경계: 이미 있는 개념들과 어떻게 다른가

RL Environments는 새 최상위 계층이 아니라, 이 위키가 이미 다루는 몇 가지 개념과 인접해 있지만 초점이 다르다.

| 문서 | 초점 | RL Environments와의 관계 |
|------|------|---------------------------|
| [[AI/Engineering/Harness_Engineering/Benchmarking|Harness_Engineering/Benchmarking]] | SWE-bench 등 **정적** 평가 벤치마크 — 훈련 없이 모델 성능을 측정 | 같은 벤치마크(SWE-bench)가 평가용으로도, RL 훈련용 환경(SWE-Gym)으로도 쓰일 수 있다 — "측정만 하는가, 그 신호로 훈련까지 하는가"가 차이 |
| [[AI/Engineering/Harness_Engineering/Agent_as_a_Judge|Harness_Engineering/Agent_as_a_Judge]] | **Agent Simulation**으로 배포 전 에이전트 행동을 사전 검증 | RL Environment의 모델 기반 verifier와 메커니즘이 겹치지만, Agent-as-a-Judge는 배포 전 품질 게이트, RL Environment는 훈련 루프 내 보상 신호라는 용도 차이 |
| [[AI/Engineering/Loop_Engineering/Data_Flywheel|Loop_Engineering/Data_Flywheel]] | 프로덕션에서 수집된 실제 데이터로 합성 훈련 데이터를 만드는 순환 | RL Environment는 프로덕션 데이터가 아니라 **미리 설계된 시뮬레이션**에서 신호를 얻는다는 점이 다르지만, 두 방식이 결합돼 프로덕션 실패 사례를 RL 환경의 새 태스크로 재주입하는 경우도 있다 |
| [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Loop_Engineering/Continuous_Optimization]] | GRPO/RLVR로 **모델 자체를 훈련** | RL Environment는 그 훈련이 요구하는 "검증 가능한 보상"을 생성하는 상류(upstream) 인프라 |

## AI Engineering에서의 역할

RL Environments는 RLVR 같은 훈련 기법이 실무에서 성립하기 위한 전제 인프라다. 아무리 좋은 RL 알고리즘도 신뢰할 수 있는 보상 신호가 없으면 무용하며, 그 신호를 만드는 일 — 태스크 설계, 도메인 전문성, verifier 구축, 보상 설계, 그리고 이를 대규모로 운영하는 것 — 자체가 상당한 엔지니어링 투자를 요구한다는 인식이 2025~2026년 업계에 자리잡았다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Continuous_Optimization|Loop_Engineering/Continuous_Optimization]] · [[AI/Engineering/Harness_Engineering/Benchmarking|Harness_Engineering/Benchmarking]] · [[AI/Engineering/Harness_Engineering/Agent_as_a_Judge|Harness_Engineering/Agent_as_a_Judge]] · [[AI/Engineering/Loop_Engineering/Data_Flywheel|Loop_Engineering/Data_Flywheel]] · [[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Model_Engineering/Full_Fine-Tuning]]

## 출처
- "A Taxonomy of RL Environments for LLM Agents" (2026) — [leehanchung.github.io](https://leehanchung.github.io/blogs/2026/03/21/rl-environments-for-llm-agents/)
- "The Ultimate Guide to RL Environments: Building and Scaling Them in the LLM Era" (2026) — [adithyask-rl-environments-guide.hf.space](https://adithyask-rl-environments-guide.hf.space/)
- GitHub "awesome-agent-rl-environments" (SWE-Gym, GEM, RAGEN, AgentGym, WebArena, OSWorld, ToolBench 등 정리) — [github.com/v01dmur10c/awesome-agent-rl-environments](https://github.com/v01dmur10c/awesome-agent-rl-environments)
- Jimenez et al. (2023) "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" — [arXiv:2310.06770](https://arxiv.org/abs/2310.06770)
