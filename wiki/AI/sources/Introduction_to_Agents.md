# Introduction to Agents

## 메타데이터
- **파일명**: `Introduction to Agents.pdf`
- **출처 (URL)**: https://www.kaggle.com/whitepaper-introduction-to-agents
- **저자**: Alan Blount, Antonio Gulli, Shubham Saboo, Michael Zimmermann, Vladimir Vuskovic 외
- **발행 시점**: 2025년 11월 최초 발행 → **2026년 5월 업데이트** (Google/Kaggle 시리즈)
- **주제**: 자율(autonomous) AI [[Agents]] 입문 — 아키텍처, 분류 체계(Taxonomy), 운영(Ops), 보안, 상호 운용성, Self-evolution

## 요약
이 문서는 LM(Language Model)을 두뇌로 사용하는 [[Agents]]가 예측형 AI(Predictive AI)에서 자율 시스템으로 진화한 흐름을 정리하고, 프로덕션 수준의 Agent를 만드는 데 필요한 구조·운영·보안·상호 운용성 전반을 다룬다. 개발자의 역할이 "벽돌공(bricklayer)"에서 "감독(director)"으로 이동했음을 강조하며, "Prompt Engineering"의 후속 개념인 [[Context_Engineering]]을 본격적으로 소개한다.

## 핵심 정의
- **Agent = Model + Tools + Orchestration Layer + Runtime Services**, 즉 "도구를 쥔 LM이 루프 안에서 목표를 추구하는 시스템".
- "An agent is a system dedicated to the art of context window curation." — 개발자는 도구(cast)를 캐스팅하고 지시(scene)를 설정하며 컨텍스트를 제공하는 디렉터다.

## Agentic Problem-Solving Process (5단계)
1. **Get the Mission** — 사용자의 의도/목표 수신
2. **Scan the Scene** — 사용 가능한 도구·메모리·세션 상태 탐색
3. **Think It Through** — Plan/Reason ([[Reasoning]])
4. **Take Action** — Tool 호출 ([[Tool_Use]])
5. **Observe and Iterate** — 결과 관찰 후 다시 Plan
   - 예: "Where is my order #12345?" → `find_order("12345")` → `get_shipping_status("ZYX987")` → 최종 답변

## Agent 분류 체계 (Levels 0–4)
- **Level 0 — Core Reasoning System**: 도구 없이 LM 단독, 실시간 인식 불가.
- **Level 1 — Connected Problem-Solver**: Google Search, RAG 등 도구 연결.
- **Level 2 — Strategic Problem-Solver**: 멀티스텝 계획 + Context Engineering. 예: "Mountain View 사무실과 SF 클라이언트 중간 지점 카페 찾기".
- **Level 3 — Collaborative Multi-Agent System**: Project Manager 에이전트가 MarketResearchAgent·MarketingAgent·WebDevAgent에 위임.
- **Level 4 — Self-Evolving System**: `AgentCreator` 도구로 새로운 에이전트/도구를 동적으로 생성 (예: 즉석에서 `SentimentAnalysisAgent` 생성).

## 핵심 구성 요소
- **Model — "두뇌"**: 벤치마크가 아닌 비즈니스 결과로 평가. "Team of specialists" 패턴(Gemini 3.2 Pro 계획 + Gemini 3.2 Flash 라우팅, 또는 Gemma 4 같은 오픈 모델). Gemini Live, Cloud Vision API, Speech-to-Text 언급.
- **Tools — "손"**: 3가지 — Information Retrieval(RAG·Vector DB·Knowledge Graph·NL2SQL), Action Execution(API wrap, sandbox 코드 실행, `ask_for_confirmation()`/`ask_for_date_input()` 같은 HITL 도구), Function Calling(OpenAPI, MCP, Gemini 네이티브 Google Search).
- **Orchestration Layer — "신경계"**: Think–Act–Observe 루프. 결정형 워크플로우 ↔ LM 주도 실행 사이의 스펙트럼. Google **ADK(Agent Development Kit)** 같은 코드 우선 프레임워크 vs no-code 빌더.
- **Deployment — "몸체와 다리"** *(2026년 5월 추가)*: 로컬 빌드에서 벗어나 항상 실행되는 서버로 배포. 세션 히스토리·메모리 영속성·보안·규정 준수 등 서비스가 포함 범위. 새로 출시된 **Gemini Enterprise Agent Platform**을 활용하면 Build·Scale·Govern·Optimize를 단일 플랫폼에서 처리 가능: **Agent Studio**(프롬프트→배포 원활 전환), **Agent Runtime**(sub-second cold start, 멀티데이 워크플로우), **Memory Bank**(세션 간 장기 컨텍스트). Cloud Run/GKE 컨테이너 배포도 지원.
- **Memory ([[Memory]])**: 단기 = (Action, Observation) 쌍을 state/artifacts/sessions/threads로 저장. 장기 = vector DB / search 엔진 기반 RAG로 세션 간 지속.

## Multi-Agent Patterns
- **Coordinator** (관리자가 서브 태스크 라우팅)
- **Sequential** (디지털 조립 라인)
- **Iterative Refinement** (Generator + Critic)
- **Human-in-the-Loop** (의도적 승인 단계)

## Agent Ops — 5대 원칙
1. **Measure What Matters** — Goal completion rate, CSAT, latency, cost per interaction, conversion 등 비즈니스 KPI.
2. **Quality via LM Judge** — Golden dataset 대비 LM-as-Judge 평가.
3. **Metrics-Driven Development** — 자동 평가로 prod vs new 비교, Go/No-Go 판단.
4. **Debug with OpenTelemetry traces** — 프롬프트 → reasoning → tool params → observation 전체 트레이스.
5. **Cherish Human Feedback** — Thumbs-down 사례를 영구 평가 케이스로 흡수.

## 상호 운용성 (Interoperability)
- **Agents ↔ Humans**: 챗봇 → 구조화된 JSON → MCP UI / AG UI / A2UI(동적 UI). Gemini Live API로 카메라·마이크 양방향 스트리밍.
- **Agents ↔ Agents**: **A2A(Agent-to-Agent) 프로토콜** + **Agent Card**(JSON 명함, 능력·보안 자격 게시). 비동기 태스크 지향 구조.
- **Agents ↔ Money**: **AP2(Agent Payments Protocol)** — 암호학적 서명 mandate. **x402** — HTTP 402로 마이크로페이먼트.

## 보안
- 효용(utility)과 권한(power) 사이의 trust trade-off.
- 하이브리드 다층 방어: 결정형 가드레일(예: 100달러 초과 결제 차단) + 추론 기반 방어(adversarial training, 작은 "guard model").
- **Agent Identity**: 사용자(OAuth/SSO), 서비스 계정(IAM)에 이어 Agent라는 제3의 principal — **SPIFFE** 기반. *(2026년 5월 강화)* Gemini Enterprise Agent Platform이 Agent Identity를 네이티브로 강제 — 모든 에이전트에 고유 암호화 ID 발급, 기업 인가 정책과 연동된 완전한 감사 추적.
- ADK 보안: `before_tool_callback`로 파라미터 검사, "Gemini as Judge" 패턴(Flash-Lite 또는 fine-tuned Gemma로 prompt injection 스크리닝), **Model Armor** 매니지드 PII/jailbreak/악성 URL 방어.
- *(2026년 5월 추가)* **Agent Gateway**: Gemini Enterprise Agent Platform 내에서 모든 agentic 트래픽(user-to-agent UI, agent-to-tool MCP, agent-to-agent A2A, 직접 LM 호출)의 중앙 제어 지점. Model Armor 보호를 네이티브 강제.

## 엔터프라이즈 확장
- "Agent sprawl" 문제 → **Agent Gateway**가 user-agent prompt, agent-tool(MCP), agent-agent(A2A), 직접 LM 호출을 중앙화. *(2026년 5월: Agent Gateway가 Gemini Enterprise Agent Platform의 공식 컴포넌트로 명명)*
- 두 가지 기능: Runtime Policy Enforcement + Centralized Governance(중앙 레지스트리, 사내 "agent app store").
- *(2026년 5월 추가)* **Agent Registry**: 모든 내부 에이전트·도구·스킬(재사용 가능한 코드화 워크플로우)을 인덱싱하는 중앙 라이브러리. 사전 보안 리뷰, 버전 관리, 팀별 접근 제어 lifecycle 관리.
- 비용/신뢰성: Provisioned Throughput, Cloud Run 99.9% SLA, scale-to-zero.

## Self-Evolution
- 학습 소스: Runtime Experience(logs, traces, memory, HITL feedback) + External Signals(신규 문서·규제).
- 적응 모드: Enhanced Context Engineering, Tool Optimization/Creation. RLHF는 연구 영역으로 언급.
- **Compliance 4-agent 워크플로우**: Querying → Reporting → Critiquing(컴플라이언스 가이드 보유) → Learning Agent가 HITL 피드백을 일반 규칙으로 일반화.
- **Agent Gym(MLGym)**: 운영 외 시뮬레이션 플랫폼. 합성 데이터 생성·red-teaming·동적 평가·critic agent 군락·MCP/A2A로 새 도구 흡수·도메인 전문가 자문.

## Advanced Agents
- **Co-Scientist**: Supervisor + 전문 에이전트 군집의 "generate, debate, evolve" 과학 방법론.
- **AlphaEvolve**: Gemini 코드 생성 + 자동 evaluator의 진화적 프로세스. Google 데이터센터 효율, 칩 설계, 행렬 곱셈 가속에 기여.

## Key Takeaways
- Agent는 단순한 챗봇이 아니라 도구·메모리·오케스트레이션을 갖춘 시스템이다.
- 개발자의 작업은 "프롬프트 작성"에서 "[[Context_Engineering]]"으로 이동했다.
- 단일 에이전트보다 **multi-agent + HITL** 조합이 프로덕션의 기본형이 된다.
- 보안·아이덴티티·게이트웨이는 옵션이 아닌 필수 인프라다.
- *(2026년 5월 추가)* Deployment는 4번째 핵심 구성요소 — 로컬 에이전트를 항상 실행되는 서비스로 만드는 것이 아키텍처의 완성이다. Gemini Enterprise Agent Platform이 이를 단일 플랫폼으로 제공.

## 관련 개념
[[Agents]] · [[Tool_Use]] · [[Reasoning]] · [[Memory]] · [[Context_Engineering]] · [[Model_Context_Protocol]] · [[Evaluation]]
