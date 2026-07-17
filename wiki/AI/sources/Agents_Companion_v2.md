# Agents Companion v2

## 메타데이터
- **파일명**: `Agents_Companion_v2 (3).pdf`
- **저자**: Antonio Gulli, Lavi Nigam, Julia Wiesinger, Vladimir Vuskovic, Irina Sigler, Ivan Nardini, Nicolas Stroppa, Sokratis Kartakis, Narek Saribekyan, Anant Nawalgaria, Alan Bount
- **발행 시점**: 2025년 2월
- **주제**: Agents "102" — AgentOps, Multi-Agent System, Agentic RAG, Contractor 패러다임, Google Agentspace, 자동차 AI 멀티 에이전트 케이스 스터디
- **출처 (URL)**: https://www.kaggle.com/whitepaper-agent-companion

## 요약
Agents 백서의 후속편. Model + Tools + Orchestration이라는 3-구성 복기에서 시작해, 다중 에이전트 패턴, AgentOps, Agentic RAG, "Agent를 Contractor로 다루기"라는 새로운 패러다임, Google Agentspace 제품 라인업, 그리고 자동차 환경의 5가지 패턴이 적용된 풍부한 케이스 스터디로 마무리한다.

## AgentOps 계층
DevOps → MLOps → FMOps → PromptOps → RAGOps → **AgentOps**. AgentOps는 GenAIOps의 하위 분류이며, 여기에 추가되는 요소: tool 관리, agent brain prompt(목표/페르소나/지시), 오케스트레이션, [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]], 작업 분해.

## Agent Success Metrics
- 비즈니스 north-star (revenue, engagement)
- Goal completion rate, KPI, thumbs up/down
- OpenTelemetry trace (Cloud Observability 예시)

## Agent Evaluation — 3 components
1. **Capabilities**
2. **Trajectory & Tool Use**
3. **Final Response**

### 공개 벤치마크
- **BFCL** (Berkeley Function-Calling Leaderboard)
- **τ-bench** (Yao et al., arXiv:2406.12045)
- **PlanBench** (Valmeekam et al.)
- **AgentBench** (Liu et al., arXiv:2308.03688)
- **DABStep** (Adyen Data Analyst leaderboard)

### Trajectory 평가 — Ground-truth 6 metrics
1. **Exact match**
2. **In-order match** (불필요 액션 무벌점)
3. **Any-order match** (순서 무관 + 추가 허용)
4. **Precision** (예측된 호출 중 관련 비율)
5. **Recall** (필수 호출 포착 비율)
6. **Single-tool use**

### Final Response 평가 / HITL
- 사용자 정의 기준 기반 LLM autorater
- HITL: Direct Assessment, Comparative Evaluation, User Studies

| 방식 | 장점 | 단점 |
|---|---|---|
| Human | 미묘함 포착 | 비싸고 확장 어려움 |
| LLM-as-Judge | 확장성 | 중간 단계 놓치기 쉬움 |
| Automated Metrics | 객관적 | 능력 누락, 게임 가능 |

## Multi-Agent Architectures
### 역할 분류
Planner, Retriever, Execution, Evaluator Agent

### 디자인 패턴
| 패턴 | 설명 |
|---|---|
| Sequential | 순차 파이프라인 |
| Hierarchical | Manager + Worker |
| Collaborative | 협력 |
| Competitive | 경쟁 (예: Overcooked-AI) |

### Agent 컴포넌트
- Interaction Wrapper
- **Memory Management**: working/cache/sessions + long-term episodes/skills/reference + reflection
- Cognitive Functionality (CoT, ReAct, planner, intent refinement)
- Tool Integration: 동적 레지스트리, **Tool RAG**
- Flow/Routing: delegation, handoff, agent-as-tool
- Feedback Loops / RL
- Agent Communication & Remote Agent Communication (비동기 durable task)
- Agent & Tool Registry mesh

### Multi-Agent 평가의 고유 질문
- Cooperation/Coordination
- Planning/Task Assignment (메인 플랜에서의 deviation)
- Agent Utilization (tool로 vs 위임 vs handoff)
- Scalability

## Agentic RAG
정적 [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] 대비 개선:
- Context-Aware Query Expansion
- Multi-Step Reasoning
- Adaptive Source Selection
- Validation/Correction by Evaluator agents

## Better Search 기법
- **Vertex AI Layout Parser** (semantic chunking, 복잡한 표·이미지 처리)
- 메타데이터 enrichment (synonyms, keywords, authors, tags)
- Fine-tuned embedding model 또는 search adaptor
- 더 빠른 vector DB (**Vertex AI Vector Search**)
- Reranker (수십~수백 vector 결과 재순위)
- Check Grounding API (인용 가능 구문)

## Vertex AI 제품
Vertex AI Search, Search Builder API, **RAG Engine** (LlamaIndex 스타일 Python 인터페이스).

## Manager of Agents
- **Assistants**: Gems/GPTs, deep research agent
- **Automation agents**: 백그라운드 이벤트 리스너
- 지식 노동자가 에이전트 fleet의 매니저로 변모

## Google Agentspace
- No/low-code + full-code 프레임워크
- 통합 멀티모달 검색
- 사전 빌트 커넥터 (Confluence, Drive, Jira, SharePoint, ServiceNow)
- RBAC, VPC SC, IAM
- **NotebookLM Enterprise**: TTS audio 요약, prosody control
- **Agentspace Enterprise Plus**: 비즈니스 기능별 커스텀 에이전트

## From Agents to Contractors
underspecification 문제 해법.

### Contract data model
- Task/Project Description (Required)
- Deliverables & Specifications (Required)
- Scope, Expected Cost (Required), Expected Duration (Required)
- Input Sources, Reporting and Feedback (Required)

### Iteration data model
underspecification, cost negotiation, risk, additional input needed

### Lifecycle
Definition → Negotiation → Execution. Co-Scientist·AlphaCode 식 반복. Subcontract로 복잡한 작업 분해.

## Co-Scientist 케이스
"Generate, debate, evolve" 다중 에이전트 — Data Processing, Hypothesis Generators, Validation, Collaboration agent. 예: 간섬유증 치료 가설 도출.

## 자동차 멀티 에이전트 케이스 스터디
### 전문 에이전트
- **Conversational Navigation Agent** (Google Places/Maps): "뮌헨까지 경로상 식당"
- **Conversational Media Search Agent**: 기분/날씨 기반 플레이리스트
- **Message Composition Agent**: SMS/WhatsApp/email — "스탠드업 20분 늦음"
- **Car Manual Agent** (RAG): "Volkswagen 차선유지 끄기"
- **General Knowledge Agent**: Salzburg 정보

### 5가지 패턴
1. **Hierarchical**: Orchestrator가 의도 라우팅 (스시 → Navigation, 날씨 → Weather agent)
2. **Diamond**: Specialist 응답 → **Rephraser Agent**가 톤 변환 (기술적 타이어 압력 → 대화체)
3. **Peer-to-Peer**: Orchestrator 오라우팅 시 specialist끼리 handoff
4. **Collaborative**: 다수 에이전트가 부분 답 제출 → **Response Mixer Agent**가 confidence score로 병합 (수막 현상 예: Car Manual 71%, General Knowledge 65%, Safety Tips 94%)
5. **Adaptive Loop**: 검색 쿼리 반복 정제 (vegan Italian → vegetarian Italian → Italian + plant-based filter)

### 자동차 환경의 이점
- 전문화, 임계 기능(climate, windows)은 on-device, 비긴급은 클라우드, 연결 끊김 회복력

## Vertex AI Agent Builder
- Agent Engine (managed runtime, sessions, examples, trace, evals)
- Vertex AI Eval Service
- Tools: Vertex AI Search, RAG Engine, Gen AI Toolbox for Databases, Application Integrations(수백 API + ACL), Apigee Hub

## Key Takeaways
- Multi-agent 패턴은 단순한 가지 분기가 아니라 Hierarchical/Diamond/P2P/Collaborative/Adaptive의 5가지 디자인 언어로 정리된다.
- "Agent를 Contractor처럼" 다루는 패러다임은 underspecification을 시스템적으로 해결한다.
- Trajectory 평가는 6가지 ground-truth 매칭 메트릭으로 정량화 가능하다.

## 관련 개념
[[AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]] · [[AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]] · [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[AI/sources/22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)|Vertex AI]]
