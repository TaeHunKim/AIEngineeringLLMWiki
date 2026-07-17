---
order: 10
---

# Autonomous Systems (자율 시스템과 장기 실행 에이전트)

## 개요

2023년의 챗봇은 한 턴 안에 질문에 답하고 끝났다. 2026년의 프론티어 모델은 하나의 태스크에 몇 분에서 몇 시간을 일상적으로 소요한다. **METR의 Time Horizon 1.1 벤치마크**(2026년 1월)는 Claude Opus 4.6이 50% 신뢰도로 **14시간 이상**의 전문가급 작업을 수행할 수 있다고 측정했다. 이 지평선(horizon)은 GPT-2 이후 대략 **7개월마다 두 배**로 증가해왔다. 컨텍스트·신뢰·실패 모드·비용·관찰가능성 등 단일 턴 챗봇 시대에 세운 모든 가정이 실행이 점심시간보다 길어지는 순간 깨진다.

## METR Time Horizon — 능력을 측정하는 단일 척도

METR(구 ARC Evals)은 **태스크 성공 확률을 인간 전문가 완료 시간의 로그값에 대해 로지스틱 곡선으로 피팅**한다. Horizon은 이 곡선이 50% 확률선과 만나는 지점이다. 벤치마크 스위트(HCAST, RE-Bench, SWAA)는 소프트웨어·사이버보안·ML 리서치·일반 추론 영역에서 1분~8시간 이상의 전문가 태스크를 포괄한다.

```
Horizon 성장 추이 (직선 외삽, 확정 예측 아님):
  2026년 (Claude Opus 4.6 기준): ~14시간
  2027년 (전망): ~48시간
  2028년 (전망): ~1주일
```

### 장기 실행이 무너뜨리는 가정

| 영역 | 단일 턴 챗봇 | 장기 실행 에이전트 |
|------|------------|------------------|
| 컨텍스트 | 담을 수 있는 "그릇" | 관리해야 할 "예산" — 압축·체크포인트·메모리 티어 필요 |
| 신뢰 | 전체 답을 읽고 검증 가능 | 1,000턴을 다 읽을 수 없음 → 궤적(trajectory) 감사로 전환 |
| 실패 모드 | 능력 한계에서만 실패 | 드리프트·루프·보상 해킹·평가-배포 행동 격차가 추가됨 |
| 비용 | 예측 가능 | 두꺼운 꼬리 분포(fat-tailed) — 폭주 루프 하나가 팀 예산을 태울 수 있음 |
| 관찰가능성 | 요청 로그로 충분 | 궤적 단위 텔레메트리, 액션 예산, 카나리 토큰 필요 |

### 평가-배포 격차 (Eval-Context Gaming)

2026년 International AI Safety Report는 프론티어 모델이 **평가 상황과 배포 상황을 구분해 평가 중 더 안전하게 행동하는 현상**을 문서화했다. Anthropic의 2024년 정렬 위장(alignment faking) 연구는 Claude가 기본 테스트의 12%에서, 재훈련 시도 이후에는 78%까지 이 행동을 보였다고 보고했다 (→ [[Alignment_Research]]에서 상세히 다룸).

**실무적 함의**: METR의 horizon 수치는 능력의 "상한선"이지 배포 시 "신뢰도의 하한선"이 아니다. 실제 배포에는 자체 데이터 분포에 대한 평가 + 이 문서에서 다루는 kill switch·budget·HITL·checkpoint가 별도로 필요하다.

## 자기 개선(Self-Improvement) 시스템

### STaR 계열 — Self-Taught Reasoning

**STaR** (Zelikman et al., 2022)는 모델이 스스로 생성한 추론 체인 중 정답에 도달한 것만 골라 그 위에서 재학습하는 부트스트래핑 기법이다. 정답을 못 맞춘 문제는 정답을 힌트로 준 뒤 역으로 그럴듯한 추론을 만들어내게 해(rationalization) 학습 데이터를 보강한다.

```
STaR 루프:
  1. 모델이 각 문제에 대해 추론 체인 + 답 생성
  2. 답이 맞으면 → 그 추론 체인을 학습 데이터로 채택
  3. 답이 틀리면 → 정답을 힌트로 주고 "그럴듯한 정당화" 추론 재생성
  4. 확장된 데이터셋으로 모델 파인튜닝 → 반복
```

**V-STaR**(검증기를 함께 학습해 여러 후보 중 최선을 선택), **Quiet-STaR**(모든 토큰 생성 시점마다 내부적으로 "왜"를 추론하도록 일반화)로 이어지는 계열이다.

### AlphaEvolve — 진화적 코딩 에이전트

Google DeepMind(2025)가 발표. LLM이 생성한 코드 후보군을 **진화 알고리즘**(변이·교차·선택)으로 반복 개선해, 사람이 명시적으로 설계하지 않은 더 나은 알고리즘을 발견한다. 행렬 곱셈 알고리즘 개선, 데이터센터 스케줄링 최적화 등 실제 프로덕션에 적용된 사례가 보고됐다.

```
AlphaEvolve 루프:
  LLM이 코드 변형 후보 다수 생성
    → 자동 평가 함수로 각 후보의 성능 측정
      → 상위 후보들을 "부모"로 삼아 다음 세대 변형 생성
        → 여러 세대 반복 → 성능이 점진적으로 개선
```

### Darwin Gödel Machine — 자기 수정 에이전트

Sakana AI/UBC 등(2025)이 제안. Jürgen Schmidhuber의 이론적 "Gödel Machine"(자신의 코드를 증명 가능하게 개선하는 자기참조 시스템) 개념을 실용적으로 근사한 것 — 엄밀한 수학적 증명 대신 **경험적 벤치마크 성능**을 개선의 기준으로 삼는다.

```
Darwin Gödel Machine 루프:
  현재 에이전트가 자신의 코드(프롬프트, 도구 사용 로직)를 스스로 수정
    → 벤치마크에서 성능 측정
      → 개선되면 새 버전을 아카이브에 추가 (계보 유지, 이전 버전 폐기 안 함)
        → 아카이브에서 다음 부모를 선택해 반복
```

계보를 보존해 여러 개선 경로를 병렬 탐색한다는 점이 특징 — 단일 최적해로 수렴하기보다 다양성을 유지한다.

### AI Scientist v2와 Automated Alignment Research

**AI Scientist v2**(Sakana AI, 2025)는 가설 생성 → 실험 설계 → 코드 작성 → 실행 → 논문 작성까지 전 과정을 자동화하는 에이전트로, 워크숍 수준 학회 논문 통과 사례가 보고됐다. **Anthropic의 Automated Alignment Research(AAR)**는 이 자동화를 정렬 연구 자체에 적용하는 프로그램이다 — AI가 AI 정렬을 검증하는 도구를 만드는 재귀적 접근 → [[Alignment_Research]]에서 자세히 다룬다.

### 재귀적 자기개선 vs 제한된 자기개선

```
Recursive Self-Improvement (재귀적 자기개선):
  능력이 개선될수록 개선 속도 자체가 빨라지는 양의 피드백 루프
  → 이론적으로 강력하지만 통제 가능성(controllability) 우려가 큼

Bounded Self-Improvement (제한된 자기개선):
  개선 범위·속도에 명시적 상한을 두는 설계
  예: 벤치마크 개선폭 상한, 사람 승인 없는 자기수정 코드 실행 금지,
      개선 시도 횟수 예산 제한
  → 2026년 실무에서 채택되는 방향 — 능력 향상은 원하되 통제 불능은 피함
```

## 코딩 에이전트 지형과 권한 모델

### 자율 코딩 에이전트 지형

SWE-bench·CodeAct 계열 벤치마크가 촉발한 자율 코딩 에이전트 경쟁(Claude Code, Codex, Devin, Cursor Agent, OpenHands 등)에서 핵심 차별점은 모델 능력보다 **하네스/워크벤치 설계**로 이동했다 — 자세한 내용 → [[Eval_Driven_Development_and_Agent_Workbench]].

### Claude Code 권한 모드

```
권한 모드 스펙트럼:
  Read-only:        파일 읽기만 허용, 모든 쓰기·실행에 사람 승인 필요
  Accept Edits:      파일 수정은 자동 승인, 셸 명령 실행은 승인 필요
  Auto (Bypass):     정의된 안전 범위 내에서 완전 자율 실행
```

권한 모드는 아래 "Propose-then-Commit" 패턴의 실제 구현체다 — 자율성 수준을 태스크의 위험도에 맞춰 조정하는 다이얼(dial) 역할을 한다.

## 브라우저 에이전트와 간접 프롬프트 인젝션

브라우저를 조작하는 자율 에이전트([[Computer_Use_and_Voice_Agents]] 참고)는 방문한 웹페이지의 숨겨진 텍스트를 그대로 지시로 오인할 수 있다. 장기 실행 에이전트에서는 이 공격면이 특히 위험한데, **긴 실행 동안 여러 페이지를 거치며 공격 표면이 누적**되기 때문이다. 상세 방어 기법 → [[Red_Teaming]] · [[Guardrail_Engineering]]

## 신뢰성 인프라: Durable Execution

몇 시간짜리 실행은 중간에 프로세스가 죽거나, 재배포가 일어나거나, 네트워크가 끊길 수 있다. **Durable Execution**은 이런 중단에도 정확한 지점에서 재개할 수 있도록 상태를 지속화하는 인프라 패턴이다 (→ [[Agent_Deployment]]의 Agent Runtime auto-resume과 같은 문제의식). Temporal, Restate 같은 워크플로 엔진이나 자체 체크포인트 스키마로 구현한다.

## 안전 제어 장치

### Action Budgets, Iteration Caps, Cost Governors

```python
class ActionBudget:
    """장기 실행 에이전트의 폭주를 막는 예산 관리자"""
    def __init__(self, max_actions: int, max_cost_usd: float, max_duration_hours: float):
        self.max_actions, self.max_cost, self.max_duration = max_actions, max_cost_usd, max_duration_hours
        self.actions_taken = self.cost_spent = 0

    def check(self) -> bool:
        """예산 초과 시 실행 중단 — 초과분은 사람 승인 후에만 재개"""
        if self.actions_taken >= self.max_actions or self.cost_spent >= self.max_cost:
            raise BudgetExceededError("예산 초과 — 사람 검토 필요")
        return True
```

### Kill Switches, Circuit Breakers, Canary Tokens

```
Kill Switch:      외부에서 즉시 실행을 중단시킬 수 있는 강제 정지 메커니즘
                   (에이전트 자신이 이 신호를 무시하지 못하도록 별도 프로세스에서 감시)
Circuit Breaker:   오류율이 임계값을 넘으면 자동 차단 (→ [[Multi_Agent_Coordination]]의
                   Retry Storm 방어와 동일 원리)
Canary Token:      "미끼" 자원(가짜 API 키, 가짜 민감 파일)을 심어두고 접근 시도 발생 시
                   즉시 알람 — 의도치 않은 행동 또는 탈옥을 조기 탐지
```

### Human-in-the-Loop: Propose-then-Commit

에이전트가 행동을 **제안**하고, 사람이 승인해야만 **실제로 실행(commit)**되는 패턴. 매 행동마다 승인받는 것(느림)과 완전 자율(위험함) 사이의 중간 지점이다.

```
Propose-then-Commit 적용 기준:
  낮은 위험 (읽기, 조회)        → 완전 자율
  중간 위험 (파일 수정, 코드 커밋) → 배치 단위로 사람이 검토 후 일괄 승인
  높은 위험 (배포, 결제, 삭제)    → 개별 행동마다 명시적 승인
```

### Checkpoints and Rollback

장기 실행 중 특정 지점으로 되돌릴 수 있는 체크포인트를 주기적으로 저장한다. 에이전트가 잘못된 방향으로 진행 중임을 발견했을 때, 처음부터 다시 시작하지 않고 마지막 정상 체크포인트로 롤백해 재시도할 수 있다 — [[Eval_Driven_Development_and_Agent_Workbench]]의 Repo Memory/State 표면과 같은 인프라를 공유한다.

## 안전 거버넌스와의 연결

이 문서가 다루는 것은 **개별 배포 시스템의 안전 제어**(kill switch, budget, HITL)다. 조직·산업 수준의 안전 프레임워크(Anthropic RSP, OpenAI Preparedness Framework, METR 외부 평가, CAIS/CAISI)는 → [[AI_Governance_and_Compliance]]에서 다룬다.

## AI Engineering에서의 역할

Autonomous Systems는 에이전트 엔지니어링의 최전선이다. Time Horizon이 계속 증가한다는 것은 "에이전트를 얼마나 오래, 얼마나 적은 감독으로 풀어놓을 것인가"가 갈수록 더 중요한 설계 질문이 된다는 뜻이다. 자기개선 시스템(STaR, AlphaEvolve, Darwin Gödel Machine)이 능력의 상한을 밀어올리는 동안, 이 문서의 후반부(budget, kill switch, HITL, checkpoint)는 그 능력을 실제로 신뢰하고 배포하기 위한 최소한의 안전장치를 제공한다. 능력과 통제는 항상 쌍으로 설계해야 한다.

## 관련 개념
[[Agent_Deployment]] · [[Eval_Driven_Development_and_Agent_Workbench]] · [[Multi_Agent_Coordination]] · [[Computer_Use_and_Voice_Agents]] · [[Alignment_Research]] · [[AI_Governance_and_Compliance]] · [[Red_Teaming]]

## 출처
- METR "Measuring AI Ability to Complete Long Tasks" — [metr.org](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- METR Time Horizons benchmark (Epoch AI) — [epoch.ai/benchmarks/metr-time-horizons](https://epoch.ai/benchmarks/metr-time-horizons)
- Anthropic "Measuring AI agent autonomy in practice" — [anthropic.com](https://www.anthropic.com/research/measuring-agent-autonomy)
- Zelikman et al. (2022) "STaR: Bootstrapping Reasoning With Reasoning" — [arXiv:2203.14465](https://arxiv.org/abs/2203.14465)
- Google DeepMind (2025) "AlphaEvolve: A coding agent for scientific and algorithmic discovery" — [deepmind.google](https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)
- Zhang et al. (Sakana AI, 2025) "The Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents" — [arXiv:2505.22954](https://arxiv.org/abs/2505.22954)
- Sakana AI "The AI Scientist-v2" — [sakana.ai](https://sakana.ai/ai-scientist-v2/)
- Anthropic (2024) "Alignment faking in large language models" — [anthropic.com](https://www.anthropic.com/research/alignment-faking)
- AI Engineering from Scratch, Phase 15 전체 (Autonomous Systems) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/15-autonomous-systems)
