# Agent Quality

## 메타데이터
- **파일명**: `Agent Quality.pdf`
- **저자**: Meltem Subasioglu, Turan Bulmus, Wafae Bakkali (Google) — 기여자 Anant Nawalgaria, Julia Wiesinger 외
- **발행 시점**: 2025년 11월 최초 발행 → **2026년 5월 업데이트**
- **주제**: 비결정적(non-deterministic) AI [[AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]]를 평가·관측·지속 개선하기 위한 실무 플레이북 — "Agent Quality Flywheel"
- **출처 (URL)**: https://www.kaggle.com/whitepaper-agent-quality

## 요약
이 문서의 세 가지 핵심 메시지는 (1) "Trajectory is the truth", (2) "Observability is the foundation", (3) "Evaluation is a continuous loop"다. 품질은 마지막 단계의 QA가 아니라 **아키텍처적 기둥**이며, 전통적인 단위 테스트로는 잡히지 않는 "200 OK이지만 그럴듯하게 틀린" 출력을 어떻게 정의·관측·평가할지 단계별로 설명한다.

## 전통적 QA가 실패하는 이유 — 4가지 Failure Modes
- **Algorithmic Bias** — 예: 금융 Agent가 우편번호로 부당 차별
- **Factual Hallucination** — 예: 가짜 역사 날짜 생성
- **Performance/Concept Drift** — 예: 신규 사기 패턴을 놓치는 사기 탐지기
- **Emergent Unintended Behaviors** — 예: 다른 봇과의 "proxy war", 허점 악용

## 패러다임 전환 (5단계)
1. Traditional ML — Precision/Recall/F1/RMSE
2. Passive LLM — 확률적, 모델 vs 모델 벤치마크
3. LLM + RAG (Lewis et al. 2020) — chunking·embeddings·retriever 추가
4. Active AI Agent — 계획·도구 사용·메모리
5. Multi-Agent Systems — cooperative vs competitive, 자원 경쟁, 데드락

## Four Pillars of Agent Quality
1. **Effectiveness** — 목표 달성도
2. **Efficiency** — 토큰, wall-clock latency, trajectory 복잡도/단계 수
3. **Robustness** — 우아한 재시도, 모호성 처리
4. **Safety & Alignment** — Responsible AI, prompt injection 방어, 데이터 누출 방지

## "Outside-In" 평가 위계
- **Black Box (E2E)** 먼저 → **Glass Box (Trajectory)** 다음.
- Black Box 지표: Task Success Rate(코딩 Agent의 PR acceptance, 금융 Agent의 DB transaction rate, 지원 봇의 session completion), CSAT, Overall Quality.

## Glass Box — Trajectory의 6가지 분석 차원
1. **LLM Planning/Thought** — hallucination, off-topic, context pollution, 반복 루프
2. **Tool Selection & Parameterization** — 잘못된 도구, 환각된 도구/파라미터명, malformed JSON
3. **Tool Response Interpretation** — 숫자 오독, 엔티티 누락, 404 무시
4. **RAG Performance** — 무관한 검색, outdated docs, 컨텍스트 무시
5. **Trajectory Efficiency & Robustness**
6. **Multi-Agent Dynamics** — 에이전트 간 통신 루프

## ADK 적용 팁
- `adk web` UI에서 세션을 저장 → `.test.json` Eval Case 생성 (final response + 도구 호출 trajectory를 ground truth로).
- `adk eval` CLI 또는 pytest로 실행.

## Evaluators
### Automated Metrics
- **ROUGE / BLEU** — 문자열 유사도
- **BERTScore / cosine similarity** — embedding 유사도
- **TruthfulQA** — 태스크 특화
- 절댓값보다 CI/CD 추세 지표로 사용 (예: BERTScore가 0.8→0.6으로 떨어지면 회귀 알람).

### LLM-as-a-Judge (Li et al. 2024, arXiv:2411.16594)
- Judge LLM에 rubric 제공 ("helpfulness/correctness/safety 1–5점").
- **Pairwise comparison이 single-scoring보다 우수** (편향 완화). win/loss/tie rate로 집계.
- 샘플 prompt: 고객 지원 pairwise prompt + 주문 #12345 예시 + JSON 출력 `{"winner":"A|B|tie","rationale":...}`.

### Agent-as-a-Judge (Zhuge et al. 2024, arXiv:2410.10934)
- Critic Agent가 전체 실행 trace 평가. 차원: Plan quality, Tool use, Context handling.
- *(2026년 5월 추가)* 배포 전 규모 확장을 위해 **Agent Simulation** 활용 권장: synthetic test interaction 생성 및 persona 기반 평가를 통해 수천 가지 시나리오 stress-test, reasoning drift 조기 감지. Applied Tip: 실행 trace 객체(초기 계획·선택 도구·전달 인자)를 Critic Agent 프롬프트에 직접 공급해 프로세스 실패(효율 나쁜 계획 등)를 최종 답변이 올바르더라도 자동 감지.

### HITL (Human-in-the-Loop)
- 주관성, 맥락 이해, golden set 작성, `execute_payment` / `delete_database_entry` 같은 위험 액션의 런타임 안전 정지.

### Reviewer UI
- 좌측 대화, 우측 reasoning trace의 두 패널 UI.
- 인라인 태깅("bad plan", "tool misuse"), 거버넌스 대시보드, 이벤트 기반 파이프라인.

## Responsible AI / Safety
- Systematic Red Teaming, 자동 필터 + 인간 검토.
- ADK **SafetyPlugin 패턴**:
  - `check_input_safety()` → `before_model_callback`: prompt injection 분류기
  - `check_output_pii()` → `after_model_callback`: PII 스캐너

## Three Pillars of Observability
### Logs
- 구조화된 JSON, INFO vs DEBUG. 프롬프트/응답, 중간 추론, 도구 호출, state 변경 캡처.
- 예: `gemini-2.0-flash`, `roll_die` 함수 호출 `{"sides":6}` → `function_response{"result":2}`.

### Traces (OpenTelemetry)
- Spans (`llm_call`, `tool_execution`)
- Attributes (`prompt_id`, `latency_ms`, `token_count`, `user_id`)
- Context Propagation via `trace_id`
- Cloud Trace + Vertex AI Agent Engine 통합.

### Metrics — 2종류
- **System Metrics**: Latency P50/P99, Error Rate(`error=true` 어트리뷰트), Tokens per Task, API Cost per Run, Task Completion Rate, Tool Usage Frequency
- **Quality Metrics**: Correctness, Trajectory Adherence, Safety, Helpfulness/Relevance — LLM-as-Judge 또는 golden dataset 비교 필요

## 운영 실무
- Operational Dashboard (P99 latency >3s 알람) vs Quality Dashboard ("Helpfulness Score 24h 동안 10% 하락" 알람) 분리.
- 저장 전 PII scrubbing.
- **Dynamic Sampling**: 프로덕션에서 에러는 100%, 성공은 10%만 저장.

## Agent Quality Flywheel (4단계)
1. **Define Quality** (Four Pillars)
2. **Instrument for Visibility** (Logs + Traces)
3. **Evaluate the Process** (LLM-as-Judge + HITL)
4. **Architect Feedback Loop** — 실패 사례를 영구 회귀 테스트로 변환

## 3가지 핵심 원칙
1. Evaluation은 아키텍처적 기둥이다.
2. **Trajectory is the truth.**
3. **Human is the arbiter.**

## 관련 개념
[[AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] · [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]]
