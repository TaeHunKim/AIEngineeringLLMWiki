---
order: 6
---

# Self-Evolving Harnesses (자기 진화 하네스)

## 개요

**Self-Evolving Harness**는 모델 가중치는 고정한 채, 에이전트를 둘러싼 **실행 스캐폴딩**(system prompt, tool, middleware, memory, skill, 제어 흐름)을 에이전트 자신의 실행 기록을 근거로 반복 수정해 성능을 끌어올리는 루프다. 2026년 들어 같은 base model이라도 harness 설계에 따라 벤치마크 점수가 수 %p씩 갈린다는 사실이 확인되면서, "사람이 손으로 튜닝하던 harness를 루프로 자동 진화시킨다"는 연구가 빠르게 늘었다.

여기서 harness는 [[AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] 허브의 "명명 충돌" 절이 구분한 **agent harness(실행 스캐폴딩)** 의미다. 안전·평가·관찰 계층을 가리키는 이 위키의 Harness Engineering과는 다르다. 다만 평가 계층은 이 루프의 필수 부품이다. 진화된 harness가 실제로 나아졌는지는 held-out 평가와 trace로만 판단할 수 있기 때문이다.

[[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]]의 DSPy·GEPA가 **프롬프트와 few-shot 예시**를 최적화하고, [[AI/Engineering/Loop_Engineering/Data_Flywheel|Data_Flywheel]]이 **가중치를 바꿀 데이터**를 쌓는다면, 이 문서는 **코드·도구·메모리까지 포함한 harness 전체**를 최적화 대상으로 삼는 루프를 다룬다.

## 기본 루프

```
Self-Evolving Harness 루프 (모델 가중치 고정):

  1. Execute    현재 harness로 태스크 배치를 실행, trajectory·trace 수집
  2. Diagnose   실패 trajectory에서 원인 추출 (어떤 도구·단계·컨텍스트가 문제였나)
  3. Propose    harness 수정안 생성 (prompt 문구, 새 tool, middleware, memory 규칙, 코드 패치)
  4. Gate       수정안을 held-out / 회귀 배치로 검증 → 통과한 것만 채택
  5. Promote    새 harness 스냅샷을 배포, 실패 시 이전 스냅샷으로 롤백
  → 1로 돌아감
```

각 단계를 누가 맡는지가 설계의 핵심이다. 대부분의 시스템은 **실행 에이전트와 진화 파이프라인을 분리**한다. 태스크를 푸는 에이전트가 자기 harness를 직접 고치면 평가 기준까지 함께 바꿔버릴 위험이 있기 때문이다.

## 대표 연구 (2026)

| 연구 | 진화 대상 | 핵심 아이디어 | 보고된 결과 |
|------|----------|--------------|------------|
| **AHE** (Agentic Harness Engineering, 2604.25850) | 코딩 에이전트 harness 전체 | 관찰가능성 3축 — component(파일 단위로 편집·되돌리기 가능), experience(trajectory를 계층형 증거 코퍼스로 압축), decision(각 수정에 예측을 붙여 다음 라운드에서 검증) | Terminal-Bench 2 pass@1 69.7% → 77.0%(10회 반복), 사람이 설계한 Codex-CLI harness(71.9%) 상회. 고정된 harness가 SWE-bench-verified로 전이되며 토큰 12% 절감 |
| **HarnessEvolve** (2609.00829) | prompt·skill·tool·실행 로직 | 정답을 주고 실행한 **reference trajectory**와 실패 run을 정렬해 오류 신호 추출 → 군집화로 체계적 실패 패턴 발견. Quality gate(데이터 누출·프롬프트 비대 필터) + Performance gate(현재 배치 개선 & 최근 배치 비퇴행) | 오픈 도메인·엔터프라이즈 시나리오에서 기존 baseline 상회(자사 보고) |
| **RRSI** (2609.24972) | prompt·제어 흐름·tooling·memory·context 관리 | 재귀적 자기개선의 **과적합 억제**. Proposer는 한 번에 묶을 수 있는 수정 수를 시간에 따라 줄이는 예산(annealing), Selector는 벤치마크 특화 수정을 걸러내는 critic과 너무 작거나 비싸거나 쓸모없어진 변경을 지우는 pruner | 8개 벤치마크에서 진화 대상 split +6.0p, OOD 5개 벤치마크 +4.3p, 정규화 없는 진화 대비 policy 토큰 30% 절감 |
| **MOSS** (2605.22794) | 에이전트 **소스 코드** | 텍스트 산출물만 고치는 한계를 넘어 source-level 재작성. 프로덕션 실패 배치를 근거로 외부 coding-agent CLI에 수정 위임 → ephemeral worker에서 실패 배치 replay로 검증 → 사용자 동의 후 컨테이너 교체, health probe 실패 시 롤백 | OpenClaw 4개 태스크 평균 점수 0.25 → 0.61(1 사이클, 사람 개입 없음) |

AHE의 ablation은 이득의 대부분이 system prompt가 아니라 **tool, middleware, long-term memory** 수정에서 나왔다고 보고한다. 프롬프트 최적화만으로는 닿지 않는 영역이 있다는 근거다.

## 진화가 실제로 도움이 되는가 — 비판적 결과

"수정이 일어났다"와 "성능이 좋아졌다"는 다른 문제다. 2026년 중반부터 이를 분리해 측정하는 연구가 나왔다.

- **Harness Updating Is Not Harness Benefit** (2605.30621): 능력을 두 가지로 나눈다. 유용한 수정을 **만드는 능력**(harness-updating)과 수정된 harness로 **이득을 보는 능력**(harness-benefit)이다. 만드는 능력은 모델 등급과 무관하게 평평했다(Qwen3.5-9B의 수정이 Claude Opus 4.6 수준의 이득). 반면 이득을 보는 능력은 비단조적이었다. 약한 모델은 거의 얻지 못하고, 중간 모델이 가장 크게 얻고, 강한 모델은 중간보다 덜 얻었다. 약한 모델의 실패 원인은 관련 artifact를 아예 불러오지 않거나, 불러와도 충실히 따르지 않는 것이었다.
- **SEAGym** (2606.17546): Harbor 호환 벤치마크를 self-evolution 태스크로 바꾸는 평가 환경이다. Terminal-Bench 2.0·HLE에서 ACE·TF-GRPO·AHE를 비교했다. 결론은 **잦은 업데이트가 held-out 성능을 올리지 못할 수 있고**, 중간에 좋았던 스냅샷이 이후 진화로 나빠질 수 있다는 것이다.
- **EvoHarnessBench** (2609.04280): 태스크가 아니라 harness 자체가 단계적으로 바뀌는 17개 스트림(802 태스크, 520 tool, 42 skill, 62 agent)으로 평가한다. 컴포넌트를 추가하는 것만으로 이전에 풀던 태스크 성능이 떨어지는 **harness-induced forgetting**이 관찰됐고, 기존 능력 유지(retention)와 새 능력 적응(adaptation)이 서로 충돌할 수 있다고 보고한다.

실무적 함의는 [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]]의 A/B 테스트와 같다. 진화 루프는 반드시 **동결된 held-out 셋, OOD 셋, 스냅샷별 replay, 비용 지표**를 함께 기록해야 하고, 최신 스냅샷이 아니라 **검증 성적이 가장 좋은 스냅샷**을 배포해야 한다.

## 설계 체크리스트

```
진화 대상 범위:    prompt만 → + tool/middleware → + memory 규칙 → + 소스 코드
                   (오른쪽으로 갈수록 이득도 위험도 커진다)
증거:             실패 trajectory, reference trajectory, trace (→ Observability)
게이트:           held-out 비퇴행 + OOD 전이 + 비용 상한 + 데이터 누출 검사
정규화:           한 번에 묶는 수정 수 제한, 벤치마크 특화 규칙 거부, 죽은 규칙 정리
배포:             스냅샷 버전 관리, 사람 승인(소스 수정 시), health probe 기반 롤백
분리:             태스크 실행 에이전트 ≠ 진화 파이프라인 ≠ 평가 기준
```

## 경계 정리

| 주제 | 무엇을 바꾸는가 | 문서 |
|------|----------------|------|
| Automatic Prompt Optimization | 프롬프트 문구·예시 | [[AI/Engineering/Prompt_Engineering/Automatic_Prompt_Optimization\|Automatic_Prompt_Optimization]] |
| DSPy / GEPA / RLVR | 프롬프트 프로그램, 또는 가중치 | [[AI/Engineering/Loop_Engineering/Continuous_Optimization\|Continuous_Optimization]] |
| Data Flywheel | 학습 데이터 → 가중치 | [[AI/Engineering/Loop_Engineering/Data_Flywheel\|Data_Flywheel]] |
| Deterministic Task Scriptification | 반복 태스크를 스크립트로 고정(비용 목적) | [[AI/Engineering/Loop_Engineering/Cost_Engineering/Deterministic_Task_Scriptification\|Deterministic_Task_Scriptification]] |
| Darwin Gödel Machine, AlphaEvolve | 에이전트 코드·알고리즘의 개방형 진화(능력 상한 탐색) | [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous_Systems]] |
| **Self-Evolving Harness** | 가중치 고정, harness 전체를 프로덕션·벤치마크 증거로 진화 | 이 문서 |

## AI Engineering에서의 역할

Self-Evolving Harness는 Loop Engineering의 "배포가 시작이다" 원칙을 harness 수준으로 확장한다. 가중치를 건드리지 않으므로 학습 인프라가 필요 없고, 수정 단위가 파일·스냅샷이라 되돌리기 쉽다. 그래서 파인튜닝보다 먼저 시도할 수 있는 개선 루프다. 다만 RRSI와 SEAGym이 보여주듯 이 루프는 벤치마크에 쉽게 과적합된다. 진화 능력 자체보다 **게이트와 평가를 얼마나 엄격하게 설계하는지**가 성패를 가른다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] · [[AI/Engineering/Prompt_Engineering/Automatic_Prompt_Optimization|Automatic_Prompt_Optimization]] · [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]] · [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench|Eval_Driven_Development_and_Agent_Workbench]] · [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability_and_Tracing]] · [[AI/Engineering/Harness_Engineering/Harness_Engineering|Harness_Engineering]]

## 출처
- Lin et al. (2026) "Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses" — [arXiv:2604.25850](https://arxiv.org/abs/2604.25850)
- Jiang et al. (2026) "HarnessEvolve: Learning from Reference Trajectories for Reliable Agent Self-Evolution" — [arXiv:2609.00829](https://arxiv.org/abs/2609.00829)
- Xia et al. (2026) "RRSI: Regularized Recursive Self-Improvement of Agent Harnesses" — [arXiv:2609.24972](https://arxiv.org/abs/2609.24972)
- Cai et al. (2026) "MOSS: Self-Evolution through Source-Level Rewriting in Autonomous Agent Systems" — [arXiv:2605.22794](https://arxiv.org/abs/2605.22794)
- Lin et al. (2026) "Harness Updating Is Not Harness Benefit: Disentangling Evolution Capabilities in Self-Evolving LLM Agents" — [arXiv:2605.30621](https://arxiv.org/abs/2605.30621)
- Zheng et al. (2026) "SEAGym: An Evaluation Environment for Self-Evolving LLM Agents" — [arXiv:2606.17546](https://arxiv.org/abs/2606.17546)
- Ke et al. (2026) "EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness?" — [arXiv:2609.04280](https://arxiv.org/abs/2609.04280)
