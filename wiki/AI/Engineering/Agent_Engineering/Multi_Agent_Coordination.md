---
order: 8
---

# Multi-Agent Coordination (멀티 에이전트 조정과 실패 모드)

## 개요

[[Agent_Architectures]]가 단일 시스템 안에서의 아키텍처 선택(Single/Orchestrator/Router/Multi-Agent)을 다룬다면, 이 문서는 **여러 에이전트가 어떻게 통신하고 조정하며, 왜 실패하는가**를 더 깊이 다룬다. 2025~2026년 연구는 멀티 에이전트 시스템(MAS)이 특정 태스크에서 성능을 크게 높이지만, 동시에 **실제 태스크에서 41~86.7%의 실패율**을 보인다는 사실도 함께 드러냈다 (Cemri et al., 2025). 조정 패턴을 아는 것만큼, 실패 모드를 아는 것이 프로덕션에서는 더 중요하다.

## 통신 프로토콜의 계보

에이전트 간 통신 표준의 뿌리는 1990년대 멀티에이전트 시스템(MAS) 연구로 거슬러 올라간다.

```
FIPA-ACL (1990년대 후반, Foundation for Intelligent Physical Agents)
  → Speech Act 이론 기반 — 메시지에 "inform", "request", "propose" 같은
    화행(speech act) 태그를 붙여 의도를 명시
  → 오늘날 A2A, MCP의 메시지 타입 설계에 개념적으로 영향

현대 표준: A2A (Agent-to-Agent Protocol, Google 2025)
  → 에이전트 간 상태 유지형(stateful) 통신 표준
  → 자세한 내용 → [[A2A]]
```

## 조정 패턴 (Coordination Patterns)

### Supervisor / Orchestrator-Worker

[[Agent_Architectures]]에서 다룬 Orchestrator & Sub-Agents 패턴의 멀티 에이전트 버전. 상위 Supervisor가 작업을 분배하고 결과를 취합한다. 가장 널리 쓰이는 패턴이며 디버깅이 상대적으로 쉽다(모든 통신이 Supervisor를 거침).

### Hierarchical Architecture와 Decomposition Drift

Supervisor 아래 다시 하위 Supervisor를 두는 다층 구조. 대규모 태스크 분해에 유리하지만 **Decomposition Drift**(분해 편향) 위험이 커진다 — 상위 계층에서 내린 분해가 하위로 갈수록 원래 목표에서 조금씩 어긋나며 누적된다.

```
목표: "경쟁사 3곳 종합 분석"
  L1 Supervisor → "각 경쟁사 담당 L2 Supervisor에게 위임"
    L2 Supervisor(경쟁사 A) → "재무/제품/인력 담당 Worker에게 위임"
      Worker(제품) → 실제로는 "제품 로드맵"이 아닌 "제품 리뷰"를 조사
      → 원래 목표와 미묘하게 어긋난 결과가 상위로 전파
```

### Society of Mind and Multi-Agent Debate

Minsky의 "Society of Mind" 개념을 차용 — 단일 지능이 아니라 여러 단순한 에이전트의 상호작용에서 지능이 창발한다는 관점. [[Agent_Architectures]]의 Debate 패턴(제안→비평→방어→중재)이 대표적 구현이다. 여러 독립 에이전트가 같은 문제에 다른 관점으로 답한 뒤 토론을 거쳐 합의에 도달하면, 단일 에이전트보다 추론 오류가 줄어든다는 연구가 다수 있다.

### Role Specialization — Planner / Critic / Executor / Verifier

각 에이전트에 고정된 역할을 부여해 책임을 분리한다:

```
Planner:  목표를 실행 가능한 단계로 분해
Executor: 각 단계를 실제로 실행 (도구 호출)
Critic:   Executor의 결과를 비평 (Self-Refine/CRITIC과 유사, → [[Planning_and_Reflection]])
Verifier: 최종 결과가 원래 목표를 충족하는지 독립적으로 검증 (Verifier는 Executor와 다른 정보원 사용 권장)
```

**핵심 설계 원칙**: Verifier는 Executor의 출력을 "신뢰"하지 않고 독립적으로 재확인해야 한다 — 그렇지 않으면 아래 "Verification Gap" 실패 모드에 그대로 노출된다.

### Parallel Swarm과 Group Chat

**Parallel Swarm**: 여러 에이전트가 동일 목표를 향해 독립적으로 작업하고 결과를 나중에 통합(→ [[Agent_Architectures]]의 병렬 실행). **Group Chat**(AutoGen 스타일): 여러 에이전트가 하나의 공유 대화방에서 순서를 정해가며 발언한다. Speaker Selection(다음 발언자 선정)이 핵심 설계 지점 — 고정 순서, 라운드로빈, LLM 기반 동적 선택 등.

### Handoffs and Routines

OpenAI Agents SDK가 대중화한 패턴(→ [[Agent_Frameworks]]). 무거운 오케스트레이션 레이어 없이, 한 에이전트가 대화의 제어권 자체를 다른 에이전트에 완전히 이전한다. Supervisor가 계속 개입하는 방식보다 가볍고, 상태 비저장(stateless) 오케스트레이션에 가깝다.

## Shared Memory and Blackboard Patterns

**Blackboard 아키텍처**(1980년대 AI 고전 패턴의 부활): 모든 에이전트가 읽고 쓸 수 있는 공유 작업 공간(blackboard)을 두고, 각 에이전트가 자신의 전문성이 필요한 시점에 자율적으로 기여한다.

```python
class Blackboard:
    """모든 에이전트가 공유하는 작업 공간"""
    def __init__(self):
        self.facts = {}       # 검증된 사실
        self.hypotheses = []  # 아직 검증 안 된 가설
        self.provenance = {}  # 각 항목의 출처 추적 (→ Agent_Memory의 Provenance)

    def post(self, key: str, value, source_agent: str, confidence: float):
        self.hypotheses.append({"key": key, "value": value, "source": source_agent, "confidence": confidence})

    def promote_to_fact(self, key: str, verifier_agent: str):
        """Verifier가 검증한 가설만 fact로 승격 — 검증되지 않은 정보의 오염 방지"""
        ...
```

공유 메모리는 협업을 가속하지만, 아래 "Memory Poisoning" 실패 모드의 근원이 되기도 한다.

## 합의와 신뢰

### Consensus and Byzantine Fault Tolerance (BFT)

여러 에이전트의 판단이 갈릴 때 최종 결론을 어떻게 낼 것인가의 문제. 분산 시스템의 BFT 이론을 차용 — 일부 에이전트가 오작동(잘못된 답)하더라도 전체 시스템이 올바른 합의에 도달할 수 있도록 설계한다 (예: 과반수 이상이 동의해야 채택).

### Voting, Self-Consistency, Debate Topology

- **Voting**: N개 에이전트(또는 같은 에이전트의 N회 샘플링)가 각자 답하고 다수결 채택 — Self-Consistency([[Chain_of_Thought]])의 멀티 에이전트 버전
- **Debate Topology**: 토론 참여 에이전트를 어떤 그래프 구조로 연결할 것인가 — 전원 연결(모두가 서로의 주장을 봄), 체인(순차 전달), 트리(계층적 종합) 등 구조에 따라 최종 정확도와 비용이 달라진다

### Negotiation and Bargaining

목표가 부분적으로만 일치하는 에이전트들(예: 구매자 에이전트 vs 판매자 에이전트) 사이의 협상. 게임이론의 협상 모델을 차용하며, [[Agent_Skills_and_Protocols]]의 AP2(Agent Payments Protocol) 같은 프로토콜이 실제 거래 단계의 신뢰 문제를 다룬다.

## 창발적 행동

### Generative Agents and Emergent Simulation

Park et al. (2023, Stanford "Generative Agents")이 제안한, 수십 개의 LLM 에이전트가 시뮬레이션 마을에서 각자의 기억·계획·반응을 가지고 살아가는 실험. 사람이 명시적으로 설계하지 않은 사회적 행동(파티 계획이 퍼지는 것 등)이 에이전트 간 상호작용에서 창발했다.

### Theory of Mind and Emergent Coordination

**Theory of Mind(마음 이론)**: 한 에이전트가 다른 에이전트의 "믿음·의도·지식 상태"를 모델링하는 능력. ToM이 결핍되면 (아래 Groupthink 계열 실패에서 다루듯) 다른 에이전트가 이미 아는 정보를 반복 전달하거나, 다른 에이전트의 의도를 오판해 조정에 실패한다.

## 학습 기반 조정과 경제

**MARL (Multi-Agent Reinforcement Learning)**: MADDPG, QMIX, MAPPO 등은 다수 에이전트가 보상을 놓고 협력·경쟁하도록 학습시키는 RL 알고리즘 계열이다. LLM 에이전트 시대에는 프롬프트/역할 설계로 대체되는 경우가 많지만, 대규모 반복 상호작용이 필요한 시뮬레이션·게임형 태스크에서는 여전히 유효하다.

**Agent Economies**: 다수의 자율 에이전트가 토큰 인센티브·평판(reputation) 시스템으로 상호작용하는 신흥 연구 영역. 에이전트 간 신뢰를 프로토콜 수준에서 담보하려는 시도([[Agent_Skills_and_Protocols]]의 AP2, Agent Identity)와 맞닿아 있다.

---

## 실패 모드: MASFT / MAST와 Groupthink

### MASFT / MAST — 3대 실패 범주

Cemri et al. (2025, arXiv:2503.13657, NeurIPS 2025)이 **1,642개의 실제 실행 트레이스**를 7개 오픈소스 멀티 에이전트 시스템에서 수집해 분석한 결과, **41~86.7%의 실패율**과 14개 실패 모드(Inter-annotator Cohen's Kappa 0.88 — 신뢰도 높은 분류)를 확인했다. 3대 범주:

```
1. Specification Problems (41.77%) — 명세 문제
   역할 모호성 (두 에이전트가 모두 자신을 리뷰어라 판단)
   태스크 불명확 (성공 기준이 암묵적이라 에이전트가 판단 불가)

2. Coordination Failures (36.94%) — 조정 실패
   공유 상태 동기화 없이 동시 갱신
   메시지 유실 (큐 실패, 타임아웃)
   상태 드리프트 (A는 완료로 판단, B는 여전히 실행 중)

3. Verification Gaps (21.30%) — 검증 공백
   한 에이전트가 성공을 주장해도 아무도 확인하지 않음
   연쇄된 에이전트들이 각자 이전 출력을 무비판적으로 신뢰
```

**대응 전략**: 명세 문제 → 명시적 역할 계약 + 사전 태스크 정의 검토, 조정 실패 → 버전 관리된 공유 상태 + 명시적 승인(acknowledgment), 검증 공백 → 독립 Verifier 에이전트(위 Role Specialization 참고) + 명시적 핸드오프 계약.

### Groupthink 계열 실패 (arXiv:2508.05687)

에이전트들이 서로 **동질화**될 때 발생하는 5가지 관련 실패:

| 실패 유형 | 설명 |
|----------|------|
| **Monoculture Collapse** | 같은 베이스 모델 사용 → 오류까지 상관관계를 가짐 (세 에이전트가 같은 환각을 공유) |
| **Conformity Bias** | 가장 확신에 찬(목소리 큰) 에이전트 쪽으로 나머지가 쏠림 — 그 답이 틀렸어도 |
| **Deficient Theory of Mind** | 다른 에이전트의 믿음 상태를 못 읽어 조정 실패 |
| **Mixed-Motive Dynamics** | 부분적으로만 이해관계가 일치하는 에이전트들이 아무도 만족 못하는 절충안으로 수렴 |
| **Cascading Reliability Failures** | 한 컴포넌트의 오류 패턴이 의존 컴포넌트로 전파 |

### Cascading Failure 예시 — Retry Storm

```
결제 서비스가 10% 요청 실패
  → 주문 에이전트가 결제 재시도 (naive exponential backoff)
    → 재시도마다 새로운 재고 확인 호출 발생
      → 재고 서비스 부하 2배
        → 재고 서비스 타임아웃 시작
          → 모든 주문이 재고 확인도 재시도
            → 재고 서비스 부하 10배 → 클러스터 다운
```

**해결책**: 분산 시스템의 고전 패턴인 **Circuit Breaker**를 그대로 차용한다. 하위 서비스 오류율이 임계값을 넘으면 즉시 차단하고 캐시된/기본값 응답으로 전환. 재시도 예산(retry budget)을 요청당 상한으로 명시.

### Memory Poisoning (기억 오염)

위 Blackboard 패턴에서 예고한 문제: 한 에이전트의 환각이 공유 메모리에 "사실"로 기록되면, 하위 에이전트들이 이를 검증 없이 참으로 취급한다. 증상은 급격한 오류가 아니라 **정확도의 서서히 진행되는 감소(gradual decay)**라서 근본 원인 진단이 어렵다. 대응책: append-only 로그 + provenance 추적(→ [[Agent_Memory]]) + 수정 불가능한 Verifier.

### STRATUS — 탐지·진단·검증 3인조

STRATUS(NeurIPS 2025)는 세 전문 에이전트를 배치해 실패 대응 성공률을 1.5배 높인다:
```
Detection Agent:  증상 패턴 감시 (높은 불일치율, 재시도 급증, 정확도 드리프트)
Diagnosis Agent:  증상으로부터 MAST 범주 기준 근본 원인 추론
Validation Agent: 완화 조치 적용 후 증상이 실제로 해소됐는지 확인
```
SRE(Site Reliability Engineering)의 사고 대응 방식을 멀티 에이전트 시스템에 그대로 적용한 것이다.

### 실패 모드 감사(Audit) 루틴

```
분기별 MAST 감사 프로세스:
  1. 실제 실행 트레이스 ~1000개 샘플링
  2. 각 실패를 MAST + Groupthink 범주로 태깅
  3. 범주별 실패율 계산 — 어떤 범주가 지배적인가?
  4. 완화책 우선순위화 — 어떤 수정이 가장 많은 실패를 없애는가?
  5. 2~3개 완화책 구현 → 다음 분기 재감사
```

가장 위험한 실패는 **조용한 실패(silent correctness failure)** — 그럴듯하지만 틀린 결과를 예외 없이 반환하는 경우다. 검증 공백(Verification Gap)이 발생 건수로는 21.30%에 불과해도 건당 비용이 가장 크다.

## AI Engineering에서의 역할

멀티 에이전트 시스템은 단일 에이전트보다 강력하지만, 조정 실패의 새로운 표면을 함께 들여온다. Cemri et al.의 수치(41~86.7% 실패율)가 보여주듯 "에이전트를 여러 개 두면 더 낫다"는 직관은 검증 없이는 위험하다. 실무에서는 조정 패턴을 고를 때 항상 대응하는 실패 모드와 완화책(명시적 역할 계약, 독립 Verifier, Circuit Breaker, 정기 MAST 감사)을 함께 설계해야 한다.

## 관련 개념
[[Agent_Architectures]] · [[Anthropic_Workflow_Patterns]] · [[Agent_Frameworks]] · [[A2A]] · [[Agent_Memory]] · [[Observability_and_Tracing]] · [[Guardrail_Engineering]]

## 출처
- Cemri et al. (2025) "Why Do Multi-Agent LLM Systems Fail? (MAST)" — [arXiv:2503.13657](https://arxiv.org/abs/2503.13657), NeurIPS 2025
- "Groupthink failures in multi-agent LLMs" (2025) — [arXiv:2508.05687](https://arxiv.org/abs/2508.05687)
- Park et al. (2023) "Generative Agents: Interactive Simulacra of Human Behavior" — [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)
- Nygard, M. "Release It! — Stability Patterns" (Circuit Breaker 원류) — [pragprog.com](https://pragprog.com/titles/mnee2/release-it-second-edition/)
- Anthropic "How we built our multi-agent research system" — [anthropic.com](https://www.anthropic.com/engineering/multi-agent-research-system)
- AI Engineering from Scratch, Phase 14 · Lessons 25-28, Phase 16 전체 — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms)
