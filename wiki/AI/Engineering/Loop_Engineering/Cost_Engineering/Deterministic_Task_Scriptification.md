---
order: 2
---

# Deterministic Task Scriptification (결정론적 작업의 스크립트화)

## 개요

프로덕션에서 반복되는 LLM 호출 중 상당수는 사실 **매번 같은 입력에 같은 규칙을 적용하는 결정론적(deterministic) 작업**이다. 이런 작업까지 매번 LLM 추론으로 처리하는 것은 이미 완전히 표준화된 반복 작업에 매번 값비싼 연산을 투입하는 것과 같다. 워처 에이전트는 실행 트레이스를 관찰해 반복 패턴을 감지하고, 이를 검증된 코드로 컴파일해 도구(tool)로 등록한 뒤 이후 요청은 LLM 호출 없이 그 코드로 즉시 처리한다.

## Agentic Compilation

- "Agentic Compilation: Mitigating the LLM Rerun Crisis for Minimized-Inference-Cost Web Automation" (2026) — [arXiv:2604.09718](https://arxiv.org/html/2604.09718v1)
- **문제의식**: 프로덕션 LLM 에이전트는 매 요청마다 동일한 절차적 단계(SOP)를 위해 코드를 처음부터 다시 생성(rerun)하며 지연시간과 신뢰성을 낭비한다 — 이를 "LLM Rerun Crisis"라 부른다
- **해결**: 반복되는 SOP 단계를 검증되고 버전 관리되는 도구로 사전에 컴파일하는 에이전틱 도구 제작 파이프라인으로, 추론 시점의 "매번 코드 생성" 루프를 대체한다
- **효과**: 워크플로 하나를 원샷 LLM 호출로 결정론적 JSON 워크플로 블루프린트로 컴파일해, 워크플로당 추론 비용을 $0.10 이하로 낮춤

## Tool-Making과 자기 진화

- "Tool-Making and Self-Evolving LLM Agents in Low-Latency Systems" (2026) — [arXiv:2607.08010](https://arxiv.org/html/2607.08010v1)
- **작동 방식**: Tool-maker가 실제 운영 환경에서 실행 트레이스를 수집하며 백엔드 스키마와 값을 관찰 → 후보 도구를 생성 → 라벨링된 케이스로 검증·보수(repair)
- **효과**: 도구 호출로의 전환이 p50 지연시간을 42% 감소시켰다고 보고

## LOOP Skill Engine: 원샷 레코딩 + 결정론적 리플레이

- "Good to Go: The LOOP Skill Engine That Hits 99% Success and Slashes Token Usage by 99% via One-Shot Recording and Deterministic Replay" (2026) — [arXiv:2605.14237](https://arxiv.org/pdf/2605.14237)
- **핵심 아이디어**: 소프트웨어 디버깅의 record-replay 기법을 LLM 에이전트의 도구 호출 시퀀스에 적용 — 에이전트가 처음 한 번 문제를 해결한 실행 과정을 기록하고, 이후 동일 패턴이 감지되면 LLM 호출 없이 기록된 시퀀스를 결정론적으로 재생(replay)
- **효과**: 성공률 99%를 유지하면서 토큰 사용량 99% 절감 보고

## 기존 위키 개념과의 관계

이 세 접근은 완전히 새로운 개념이 아니라, 이 위키가 이미 다루는 두 개념의 자연스러운 연장이다.

- [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent_Memory]]의 **Voyager 스킬 라이브러리**(Wang et al. 2023) — 에이전트가 성공한 행동 시퀀스를 재사용 가능한 코드 스킬로 저장해 라이브러리를 축적하는 패턴과 근본적으로 같은 아이디어다. 차이는 Voyager가 "능력 확장"에 초점을 둔다면, 여기서는 "비용 절감"이 명시적 목표라는 점
- [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]]의 **DSPy 컴파일** 개념 — DSPy가 선언적 LM 호출을 최적화된 프롬프트로 "컴파일"한다면, 여기서는 한 걸음 더 나아가 프롬프트가 아니라 결정론적 코드로까지 컴파일한다. DSPy 컴파일의 결과물은 여전히 LLM 호출이 필요하지만, 스크립트화의 결과물은 LLM 호출 자체를 제거한다

## 실패 처리: 폴백과 재검토

이 접근의 가장 큰 리스크는 **실제로는 결정론적이지 않은 작업을 결정론적이라고 잘못 판단**하는 경우다. 특히 외부 API가 개입된 작업은 초기에는 스크립트가 잘 작동하다가도, API 응답 형식이 변경되거나 서비스가 개편되는 시점부터 조용히 실패하기 시작할 수 있다.

```
실행 흐름:
  요청 → [스크립트 실행 시도]
           ├─ 성공 → 결과 반환 (저비용)
           └─ 실패(예외/스키마 불일치) → [LLM 추론으로 즉시 폴백]
                                            → 결과 반환 (정상 처리, 비용 발생)

폴백 누적 시 대응:
  동일 스크립트가 짧은 기간 내 N회 이상 폴백 발생
    → 해당 스크립트를 "검토 대기" 상태로 전환, 자동 재등록 중단
    → 워처 에이전트가 변경된 API 스펙을 재관찰해 스크립트 재생성 시도
    → 사람 승인 후 재배포 (완전 자동 재배포는 지양)
```

Tool-Making 연구가 강조하듯 tool-maker는 "live environment"에서 백엔드 스키마·값을 계속 관찰해야 하며, 한 번 검증된 스크립트도 영구히 신뢰하지 않고 주기적으로 재검증하는 것이 안전하다.

## 샌드박싱

자동 생성된 스크립트가 권한 범위를 넘어서는 작업(예: 의도치 않은 파일 삭제, 잘못된 API 엔드포인트 호출)을 수행하면 안 되므로, [[AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail_Engineering]]의 **Agent Sandbox** 패턴을 그대로 적용한다 — 스크립트 실행 환경을 핵심 시스템(DB, 프로덕션 서비스)으로부터 격리해, 스크립트가 오작동해도 영향 범위를 제한한다. 특히 워처 에이전트가 자동으로 생성·등록하는 스크립트는 사람이 작성한 도구보다 검증되지 않은 상태로 배포될 위험이 크므로, 샌드박싱은 선택이 아니라 필수다.

## AI Engineering에서의 역할

Deterministic Task Scriptification은 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity_Aware_Model_Routing]]이 "더 저렴한 모델로 대체"하는 것과 달리, 가능한 경우 **LLM 호출 자체를 제거**한다는 점에서 잠재적 절감 폭이 가장 크다. 동시에 "결정론적이라는 판단이 틀렸을 때"의 실패 모드가 가장 위험하므로, 폴백·재검토·샌드박싱이라는 세 안전장치를 모두 갖춰야 실무에 적용할 수 있다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost_Engineering/Cost_Engineering]] · [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent_Memory]] · [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] · [[AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail_Engineering]] · [[AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity_Aware_Model_Routing]]

## 출처
- "Agentic Compilation: Mitigating the LLM Rerun Crisis for Minimized-Inference-Cost Web Automation" (2026) — [arXiv:2604.09718](https://arxiv.org/html/2604.09718v1)
- "Tool-Making and Self-Evolving LLM Agents in Low-Latency Systems" (2026) — [arXiv:2607.08010](https://arxiv.org/html/2607.08010v1)
- "Good to Go: The LOOP Skill Engine That Hits 99% Success and Slashes Token Usage by 99% via One-Shot Recording and Deterministic Replay" (2026) — [arXiv:2605.14237](https://arxiv.org/pdf/2605.14237)
- Wang et al. (2023) "Voyager: An Open-Ended Embodied Agent with Large Language Models" — [arXiv:2305.16291](https://arxiv.org/abs/2305.16291)
