# AI Wiki Log

문서 인제스트 및 업데이트 기록을 시간순으로 추적합니다.

## [2026-05-02] ingest | 22365_19_Agents_v8.pdf
## [2026-05-02] ingest | Agent Quality.pdf
## [2026-05-02] ingest | Introduction to Agents.pdf
## [2026-05-02] ingest | Agents_Companion_v2 (3).pdf
## [2026-05-02] ingest | Agent Tools & Interoperability with Model Context Protocol (MCP).pdf
## [2026-05-02] ingest | Context Engineering_ Sessions & Memory.pdf
## [2026-05-02] ingest | whitepaper_emebddings_vectorstores_v2.pdf
## [2026-05-02] ingest | whitepaper_Foundational Large Language models & text generation_v2.pdf
## [2026-05-02] ingest | 22365_13_Solving Domain-Specific problems using LLMs_v7.pdf
## [2026-05-02] ingest | 22365_14_Operationalizing Generative AI on Vertex AI_v7 (1).pdf
## [2026-05-02] ingest | Prototype to Production.pdf

## [2026-05-02] enrich | sources/ — 7개 보강 (Introduction_to_Agents, 22365_19_Agents_v8, Agent_Quality, Agents_Companion_v2, Agent_Tools_MCP, Context_Engineering_Sessions_Memory, whitepaper_embeddings_vectorstores, whitepaper_Foundational_LLMs)

## [2026-05-02] enrich | sources/ — 3개 보강 (22365_13_Domain-Specific, 22365_14_Vertex_AI_MLOps, Prototype_to_Production)

## [2026-05-02] enrich | concepts/ — 19개 전체 보강 (Agents, Reasoning, Tool_Use, Memory, Model_Context_Protocol, Evaluation, Context_Engineering, Session_Management, Embeddings, Vectorstore, RAG, Foundational_Models, LLM, Text_Generation, Fine-Tuning, Domain-Specific_LLMs, LLMOps, MLOps, Vertex_AI, Production)

## [2026-05-02] update | index.md — 모든 concepts·sources 한 줄 요약 디테일 업데이트

## [2026-06-13] create | Engineering/ — AI Engineering 섹션 신설 (35개 파일)

### Model Engineering (5)
- Pre-training_and_Continual_Learning.md — Chinchilla 스케일링, EWC, Replay, MixOut
- Full_Fine-Tuning.md — SFT, RLHF(PPO), DPO, GPU 메모리 계산
- PEFT_LoRA_QLoRA.md — Hu 2021 LoRA, Dettmers 2023 QLoRA, NF4, 이중 양자화
- Quantization.md — PTQ/GPTQ/AWQ/GGUF, INT8/INT4 메모리 계산
- Model_Distillation.md — Hinton 2015, Teacher-Student, DistilBERT/Phi/DeepSeek-R1

### Prompt Engineering (5)
- System_and_Role_Prompting.md — System Prompt 구성, 역할 유형, Constitutional AI
- Few_shot_Prompting.md — Brown 2020 GPT-3, Zero/One/Few-shot
- Chain_of_Thought.md — Wei 2022 CoT, Yao 2023 ToT, Self-Consistency
- Sampling_Controls.md — Temperature/Top-K/Top-P/Min-P/Beam Search 수식
- Structured_Output.md — JSON Mode, Pydantic, Instructor 라이브러리

### Context Engineering (9)
- RAG/Chunking_Strategies.md — 5가지 청킹 전략, NVIDIA 2024 벤치마크
- RAG/Vector_Storage.md — HNSW/FAISS/ScaNN, 7개 DB 비교
- RAG/Advanced_Retrieval.md — Cross-Encoder 리랭킹, Multi-Query, RRF
- RAG/HyDE.md — Gao 2022, 가상 문서 임베딩
- Knowledge_Graph/LPG_and_RDF.md — Neo4j Cypher vs SPARQL
- Knowledge_Graph/Ontology.md — OWL/Turtle, 도메인 온톨로지
- Knowledge_Graph/Graph_RAG.md — Microsoft 2024, Leiden, Local/Global Search
- Memory_and_Semantic_Cache.md — GPTCache, Redis 시맨틱 캐시
- Context_Compression.md — LLM Lingua, Map-Reduce, Lost in the Middle

### Flow Engineering (7)
- Linear_Flow/LangChain.md — LCEL, Memory, LangSmith (Harrison Chase 2022)
- Linear_Flow/LlamaIndex.md — 5단계 파이프라인, AutoMergingRetriever (Jerry Liu 2022)
- Linear_Flow/Tool_Use_and_Function_Calling.md — OpenAI/Anthropic Function Calling
- Graph_Flow/LangGraph.md — StateGraph, ReAct Agent, Checkpointing (LangChain AI 2024)
- Graph_Flow/Cyclic_Flows.md — Evaluate-and-Retry, Self-Correction, Orchestrator-Worker
- Graph_Flow/ReAct_Pattern.md — Yao 2022, Thought-Action-Observation
- Graph_Flow/Human_in_the_Loop.md — Breakpoints, Edit & Continue, Time Travel

### Agent Engineering (5)
- Agent_Core_Pillars.md — Lilian Weng 2023, Planning/Memory/Tools
- Agent_Architectures.md — Single/Orchestrator/Router/Multi-Agent
- Planning_and_Reflection.md — Plan-and-Solve, Reflexion (NeurIPS 2023)
- Agent_Memory.md — Short/Long-term, ConversationSummaryBufferMemory
- Agent_Skills_and_Protocols.md — Anthropic Skills, Google A2A 2025, MCP

### Harness Engineering (6)
- Guardrail_Engineering.md — NeMo Guardrails, Guardrails AI, LlamaGuard
- LLM_as_a_Judge.md — Zheng 2023 MT-Bench, RAGAS, 4가지 편향
- Benchmarking.md — MMLU/HumanEval/SWE-bench/BFCL, pass@k
- Human_Evaluation.md — Preference Annotation, IAA, Chatbot Arena, RLHF 파이프라인
- Observability_and_Tracing.md — LangSmith/Langfuse/Arize Phoenix, OpenTelemetry
- Red_Teaming.md — HarmBench 2024, PAIR, Many-shot Jailbreaking (Anthropic 2024)

### Loop Engineering (3)
- Data_Flywheel.md — Agent-in-the-Loop, 자기 강화 데이터 사이클
- Continuous_Optimization.md — DSPy/MIPROv2 (Khattab 2023), A/B 테스트
- Runtime_Optimization.md — GPTCache 시맨틱 캐시, Model Routing, 비용 제어 루프

## [2026-06-13] update | index.md — Engineering 섹션 추가 (35개 문서 링크)

## [2026-06-15] refactor | Agent_Skills_and_Protocols — MCP·A2A 독립 문서 분리
- Agent_Skills_and_Protocols.md → overview로 재작성 (Agent Skills + 프로토콜 비교표)
- Agent_Skills_and_Protocols/MCP.md 신설 — Host-Client-Server 아키텍처, 4 Primitives, 보안 위협 5가지, 2026 현황 (Linux Foundation 기증, 주간 다운로드 2천만+)
- Agent_Skills_and_Protocols/A2A.md 신설 — Agent Card, 태스크 요청/응답 구조, v1.0 스펙, 150개+ 조직 지지 현황
- Tool_Use_and_Function_Calling.md — 말미에 MCP 섹션 추가 (FC → MCP 진화 맥락 + [[Agent_Skills_and_Protocols/MCP]] 링크)
- Engineering/index.md — Agent Skills & Protocols 아래 MCP·A2A 서브항목 추가

## [2026-07-11] ingest | AI Engineering from Scratch (aiengineeringfromscratch.com, GitHub: rohitg00/ai-engineering-from-scratch)

강의 시리즈(20 Phase, 435레슨) 중 언어모델·에이전트 엔지니어링에 해당하는 Phase 11·13·14·15·16·17·18을 반영. 수학 기초·ML 기본기·딥러닝 코어·컴퓨터 비전·음성처리·RL·LLM 사전학습(Phase 0-10, 12)은 기존 Model Engineering보다 더 본질적인 내용이라 제외.

### Agent Engineering (6개 신규 + 2개 확장)
- Anthropic_Workflow_Patterns.md 신설 — 5가지 워크플로 패턴, Workflow vs Agent 구분 (Schluntz & Zhang, Anthropic 2024)
- Agent_Frameworks.md 신설 — AutoGen v0.4(액터 모델), CrewAI, OpenAI Agents SDK, Claude Agent SDK, Agno/Mastra
- Multi_Agent_Coordination.md 신설 — 조정 패턴, 통신 프로토콜, MASFT/MAST 실패 분류 (Cemri et al. NeurIPS 2025), Groupthink 계열
- Computer_Use_and_Voice_Agents.md 신설 — Claude/OpenAI CUA/Gemini 컴퓨터 사용, Pipecat/LiveKit 음성 에이전트
- Autonomous_Systems.md 신설 — METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, kill switch/HITL/checkpoint
- Eval_Driven_Development_and_Agent_Workbench.md 신설 — 3단계 평가 레이어, Agent Workbench 7 Surfaces
- Planning_and_Reflection.md 확장 — ReWOO, Tree of Thoughts/LATS, Self-Refine/CRITIC 추가
- Agent_Memory.md 확장 — MemGPT, Sleep-time Compute, Mem0(하이브리드 메모리), Voyager 스킬 라이브러리 추가
- Agent_Skills_and_Protocols/MCP.md 확장 — Transports, Resources/Prompts/Sampling 심화, Roots/Elicitation, Async Tasks, MCP Apps, OAuth 2.1, Gateway/Registry 생태계 추가

### Harness Engineering (2개 신규 + 2개 확장)
- Alignment_Research.md 신설 — Reward Hacking, Sycophancy, Mesa-Optimization, Sleeper Agents, In-Context Scheming, Alignment Faking, AI Control, Scalable Oversight
- AI_Governance_and_Compliance.md 신설 — RSP v3.0/Preparedness Framework/FSF, METR 외부평가, CAIS/CAISI, EU AI Act/한국 AI 기본법, 모델 카드, WMDP
- Guardrail_Engineering.md 확장 — 간접 프롬프트 인젝션 방어(PVE), 워터마킹(SynthID/Stable Signature/C2PA), 차등 프라이버시, 편향/공정성, 모더레이션 추가
- Red_Teaming.md 확장 — ASCII Art/Visual Jailbreaks, Garak/PyRIT 툴링 추가
- Benchmarking.md 확장 — GAIA, AgentBench 상세 추가

### Loop Engineering (1개 신규 + 1개 확장)
- Production_Operations.md 신설 — AI 게이트웨이(LiteLLM/Portkey/Kong), 배포 전략, A/B 테스트(GrowthBook/Statsig), 부하 테스트, SRE/카오스 엔지니어링, FinOps, 관리형 LLM 플랫폼
- Runtime_Optimization.md 확장 — vLLM PagedAttention/연속 배칭, SGLang RadixAttention, TensorRT-LLM FP8/NVFP4, Disaggregated Prefill/Decode, 셀프호스팅 서빙 비교 추가

### 인덱스 업데이트
- AI/index.md — Sources에 AI Engineering from Scratch 항목 추가, Agent/Harness/Loop Engineering 섹션 링크 갱신
- Engineering/index.md — 목차에 신규 9개 문서 반영, order/nav_order 프론트매터 정합성 유지
- Agent_Engineering.md, Harness_Engineering.md, Loop_Engineering.md — 하위 문서 표 갱신

## [2026-07-20] ingest | Open Knowledge Format (OKF)

- 출처: Google Cloud Blog (2026-06-12), GoogleCloudPlatform/knowledge-catalog GitHub
- 신규 문서: Context_Engineering/Open_Knowledge_Format.md (order: 6)
- 영어 버전: en/AI/Engineering/Context_Engineering/Open_Knowledge_Format.md
- 위치 선정 이유: OKF는 AI 에이전트에게 제공할 조직 지식의 구조화 표준 → Context Engineering 소속
- 관련 링크: Retrieval_Strategies, RAG, Knowledge_Graph, MCP

## [2026-07-26] ingest | Graph Engineering

- 출처: LangChain "3 Years of Graph Engineering with LangGraph" (2026), TrueFoundry "Graph Engineering for Multi-Agent Systems" (2026), Eigent "Graph Engineering for AI Agents" (2026), Carlos E. Perez/Intuition Machine "Is Graph Engineering Here?" (2026), arXiv:2604.17148 (Graph-of-Agents)
- 신규 챕터: `Engineering/Graph_Engineering/` (order:0, nav_order:90) — Model/Prompt/Context/Flow/Agent/Harness/Loop 7계층 → 8계층으로 확장
  - Graph_Engineering.md — 챕터 개요, 명명 계보(prompt→context→harness→loop→graph), 기존 Graph_Flow/GraphRAG와의 관계 구분
  - Multi_Agent_Topology.md (order:1) — 노드/엣지 유형, LangGraph `Send()` 동적 라우팅, identity/budget/guardrail 거버넌스, Graph-of-Agents 학술 근거
  - Loop_Networks_and_Anchors.md (order:2) — Work Graph vs Improvement Graph, Goodhart's Law/Upward Blindness/Inter-loop Conflict/Measurement Decay, Anchor
- 영어 버전: `en/AI/Engineering/Graph_Engineering/` 동일 구조로 생성
- 위치 선정 이유: 업계에서 Loop Engineering의 다음 단계로 프레이밍되는 상위 개념(멀티에이전트 조직 토폴로지 + 거버넌스, loop-of-loops)이며, 기존 Flow_Engineering/Graph_Flow(구현 메커니즘)나 Context_Engineering/GraphRAG(데이터 그래프)와는 다른 층위라 신규 최상위 챕터로 분리
- 인덱스 업데이트: `Engineering/index.md`, `AI/index.md` (KO+EN 4개 파일)에 8번째 챕터 등록, `SCHEMA.md`의 "7계층" 표기를 "8계층"으로 갱신
- 관련 링크 보강: `Loop_Engineering.md`, `Flow_Engineering/Graph_Flow/Graph_Flow.md`, `Agent_Engineering/Multi_Agent_Coordination.md`, `Harness_Engineering/AI_Governance_and_Compliance.md` (KO+EN)에 신규 챕터로의 역링크 추가
- 참고: "Andrew Ng이 'From Loop Engineering to Graph Engineering' PDF를 작성했다"는 SNS(X) 발 주장은 1차 출처를 확인할 수 없어 인용하지 않음

## [2026-07-26] ingest | Agentic Knowledge Graph Construction

- 출처: DeepLearning.AI 강좌 "Agentic Knowledge Graph Construction" (Andreas Kollegger, Neo4j GenAI Innovation Lead, 2026) — [deeplearning.ai/courses/agentic-knowledge-graph-construction](https://www.deeplearning.ai/courses/agentic-knowledge-graph-construction)
- 신규 문서: `Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Agentic_KG_Construction.md` (order:3) — User Intent Agent → File-Suggestion Agent → Schema Proposal Agents(정형 루프/비정형 순차) → Graph Construction 4단계 파이프라인, Google ADK + Neo4j
- 영어 버전: `en/AI/.../Knowledge_Graph/Agentic_KG_Construction.md` 동일 구조로 생성
- 위치 선정 이유: KG를 "무엇인가/어떻게 저장하는가"가 아니라 "에이전트가 어떻게 자동으로 구축하는가"를 다루는 새 각도 → 새 최상위 챕터가 아니라 기존 Knowledge_Graph/ 하위 문서로 편입 (사용자 명시적 요청)
- 갱신: `Knowledge_Graph.md`(KO+EN) 하위 문서 표에 행 추가, `Engineering/index.md`·`AI/index.md`(KO+EN 4개 파일)의 GraphRAG 관련 목록에 항목 추가
- 관련 링크: Knowledge_Graph, Ontology, LPG_and_RDF, Multi_Agent_Coordination, Agent_Frameworks, Graph_Engineering/Multi_Agent_Topology

## [2026-07-26] update | Structured LLM Engineering Hierarchy 다이어그램 8티어 반영

- 배경: Graph Engineering 챕터 추가로 7계층 → 8계층이 됐는데, `Engineering/index.md`(KO+EN)에 임베드된 `structured-llm-engineering-hierarchy.png`(피라미드+동심원 인포그래픽)는 여전히 7계층이었음. 이미지 생성 AI로 두 차례 갱신 시도했으나 티어 누락(Loop Engineering 통째로 빠짐)·라벨 오기 등 세밀한 텍스트 통제가 안 되는 문제가 반복돼, 직접 SVG로 제작하는 방식으로 전환
- 신규 파일: `Engineering/assets/structured-llm-engineering-hierarchy.svg` (KO), `en/AI/Engineering/assets/structured-llm-engineering-hierarchy.svg` (EN, 동일 내용 복제 — 아래 이유로 상대경로를 언어별로 자기완결시키기 위함)
- 8개 티어 반영: ① Model ② Prompt ③ Context ④ Flow ⑤ **Agent**(기존 PNG "Agentic Engineering" 오기 수정) ⑥ Harness ⑦ **Loop**(기존 PNG에서 6번과 라벨이 중복돼 있던 오류 수정) ⑧ **Graph**(신규) Engineering — 아이콘·설명·번호 배지 모두 8단계로 확장
- 오른쪽 다이어그램은 동심원+곡선 텍스트(`<textPath>`) 대신 **중첩 사각형(nested frame)** 방식으로 설계 — 로컬 렌더링 테스트(sharp/librsvg)에서 `<textPath>` 텍스트가 전혀 표시되지 않는 신뢰성 문제가 발견됐고(실제 브라우저 재현 확인이 불가능한 환경), 별도 범례도 사용자 피드백상 한눈에 스캔하기 어려워 각 프레임 자체에 라벨을 바로 붙이는 방식으로 최종 확정. 왼쪽 축 라벨도 사용자 피드백 반영해 화살촉 마커 제거, "Macro-/(Macro-scopic)" 2줄 중복을 "Macro-scopic" 1줄로 단순화, 부제목도 "Structured LLM Engineering Hierarchy: " 중복 프리픽스 제거
- 임베드 방식: `![[...]]` wikilink SVG embed(`<object>` 태그로 변환됨)는 crawl-links의 상대경로 재작성 로직을 타지 않아 페이지 위치에 따라 깨지는 것을 발견(EN 페이지에서 기존 PNG도 사실 계속 깨져 있었음) → 대신 raw `<img src="ai/engineering/assets/...">` / `en/ai/engineering/assets/...` (콘텐츠 루트 기준 전체 경로, crawl-links의 `transformLink` 폴백 로직으로 정확히 상대경로 계산됨을 로컬 빌드로 확인) 사용. `<img>`이므로 사이트 공통 `img{max-width:100%}` CSS도 자동 적용됨
- 기존 PNG(`structured-llm-engineering-hierarchy.png`, KO assets)는 더 이상 어디서도 참조되지 않아 삭제 (사용자 승인)

## [2026-08-02] update | GraphRAG.md 보강

- 배경: `Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG.md`가 2024년 4월 원 논문(Edge et al.) 시점 내용에 머물러 있어, 그 이후 발전 사항과 실무 한계를 웹 검색으로 사실관계 확인 후 보강
- 추가 내용: DRIFT Search(Local+Global 하이브리드 쿼리 모드), LazyGraphRAG(2024-11, 인덱싱 비용 벡터RAG 수준·쿼리 비용 700배 절감, Microsoft Discovery/Azure 통합), LightRAG(HKUDS, arXiv:2410.05779, dual-level retrieval 오픈소스 대안), 실무 고려사항(엔티티 해상도, `graphrag update` 증분 인덱싱, 쿼리 지연시간·초선형 확장성)
- 갱신: KO+EN 동일 구조로 반영, 출처 3건 추가(LazyGraphRAG 블로그, LightRAG 논문, HKUDS/LightRAG 저장소), 단어수 ~650→~1150 (Hybrid_RAG/Agentic_RAG급 분량으로 확장)

## [2026-08-02] update | Agent/Harness Engineering 보강 + Mechanistic Interpretability 신설

- 배경: Agent/Harness/Loop Engineering 세 챕터(총 27개 문서)를 전수 조사한 결과 Loop Engineering은 비교적 최신 상태였으나, Harness Engineering의 `LLM_as_a_Judge`(2023년 원 논문에서 정체)·`Benchmarking`(2023년 이후 벤치마크 없음)·`Alignment_Research`(2024년에서 정체)와 Agent Engineering의 `Agent_Deployment`(Google 단일 벤더 편중)에 뚜렷한 공백 발견. 웹 검색으로 실재·주류화 여부를 검증한 소재만 반영("아직 본격적이지 않은 것"은 배제)
- Harness Engineering 기존 문서 보강:
  - `Guardrail_Engineering.md` — Constitutional Classifiers(Anthropic 2025, arXiv:2501.18837) 서브섹션 추가, 기존 Constitutional AI(학습 단계)와 구분
  - `LLM_as_a_Judge.md` — G-Eval(Liu et al. 2023, arXiv:2303.16634) 정식 인용 추가, Prometheus/Prometheus 2(오픈소스 평가 LLM) 신규 서술
  - `Benchmarking.md` — SWE-bench Verified(OpenAI 2024, 사람 검증 500문제 서브셋) 추가
  - `Red_Teaming.md` — OWASP Top 10 for LLM Applications(2024-11)·MITRE ATLAS 표준 프레임워크 섹션 신설
  - `Alignment_Research.md` — Agentic Misalignment(Anthropic 2025, arXiv:2510.05179, 16개 모델 인사이더 위협 스트레스 테스트) 섹션 추가
  - `AI_Governance_and_Compliance.md` — NIST AI RMF·ISO/IEC 42001 "기업 실무 표준" 섹션 신설, `order: 9 → 10`으로 조정
- Harness Engineering 신규 문서: `Mechanistic_Interpretability.md` (order: 9) — Polysemanticity/Superposition 배경, Sparse Autoencoders(Towards/Scaling Monosemanticity), Circuit Tracing(Anthropic 2025-03, Cross-Layer Transcoder, 2025-05 시각화 도구 오픈소스), "Open Problems in Mechanistic Interpretability"(2025-01)·MIT Technology Review 2026 Breakthrough Technology로 분야 인정 서술. Alignment_Research·Guardrail_Engineering과 상호 링크
- Agent Engineering: `Agent_Deployment.md` — "다른 클라우드의 에이전트 배포 플랫폼" 섹션 추가 (AWS Bedrock AgentCore 2025-10 GA, Azure AI Foundry Agent Service GA, Google Gemini Enterprise 포함 3사 비교표)
- 부수 수정: `Harness_Engineering.md` 챕터 인덱스 표에 기존에 누락되어 있던 `Agent_as_a_Judge` 행을 함께 보충
- 갱신: KO+EN 동일 구조로 반영, `Engineering/index.md`·`AI/index.md`(KO+EN 4개 파일)에 Mechanistic_Interpretability 링크 및 갱신된 항목 설명 반영
- 적용 제외: Loop Engineering 전체(뚜렷한 공백 미발견), `Planning_and_Reflection.md`·`Human_Evaluation.md`의 인용 정체(대체할 확실히 주류화된 소재 못 찾음), RL 기반 에이전트 학습·임베디드 에이전트(기존 log.md에 이미 "Model Engineering보다 본질적"이라는 이유로 명시적 제외된 영역)

## [2026-08-02] update | Graph Engineering 챕터 보강

- 배경: 사용자가 원래 요청한 것은 GraphRAG가 아니라 Graph Engineering(8번째 최상위 챕터)이었음을 뒤늦게 확인. 이 챕터(`Graph_Engineering.md`·`Multi_Agent_Topology.md`·`Loop_Networks_and_Anchors.md`, 2026-07-26 신설)는 지난 Agent/Harness/Loop 전수 감사(위 항목) 때도 스코프에서 빠져 한 번도 공백 점검을 받지 못한 상태였음을 확인 후 별도 조사·보강 진행
- 확인된 공백: 3개 문서의 출처 5개가 전부 2026년 업계 블로그(LangChain/TrueFoundry/Eigent/Carlos E. Perez)뿐이었고, 학술 근거는 `Multi_Agent_Topology.md`의 Graph-of-Agents(2026) 논문 1편이 유일. `Loop_Networks_and_Anchors.md`는 Goodhart's Law를 인용 없이 블로그 프레이밍으로만 서술. `Multi_Agent_Topology.md`의 추상 노드/엣지 모델이 이 위키가 이미 다루는 `Agent_Frameworks.md`(AutoGen/CrewAI/OpenAI Agents SDK/ADK)·`MCP.md`(Gateway/Registry)와 연결되지 않음
- `Graph_Engineering.md`(챕터 인덱스) — "명명 계보" 섹션에 Horling & Lesser (2005) "A Survey of Multi-agent Organizational Paradigms"(Knowledge Engineering Review 19(4)) 추가. "그래프 엔지니어링이 정말 새로운가"라는 기존 LangChain vs Sydney Runkle 논쟁에, "조직 토폴로지를 1급 설계 대상으로 다루는 문제의식 자체는 이 용어보다 20년 앞선 확립된 MAS 연구 분야"라는 학술적 근거를 추가
- `Multi_Agent_Topology.md` — 학술적 근거 섹션에 Horling & Lesser(2005) 추가(hierarchy/holarchy/coalition/federation 등 조직 패러다임과의 대응), 신규 섹션 "프레임워크별 토폴로지 구현"(AutoGen 액터 모델/CrewAI Process/OpenAI Agents SDK Handoff/Google ADK를 이 문서의 노드·엣지 모델에 매핑, `Agent_Frameworks.md`로 링크), Tool 노드 한 줄 설명을 MCP Gateway/Registry 신뢰 경계로 확장
- `Loop_Networks_and_Anchors.md` — "4대 구조적 실패 모드" 표의 Goodhart's Law 항목에 Goodhart(1975)·Strathern(1997) 정식 출처 추가
- 역링크 보강: `Loop_Engineering/Data_Flywheel.md`·`Loop_Engineering/Continuous_Optimization.md`(KO+EN)의 관련 개념에 `Graph_Engineering/Loop_Networks_and_Anchors` 추가 — 기존에 `Multi_Agent_Topology`는 외부 역링크 4건이 있었으나 `Loop_Networks_and_Anchors`는 0건이었던 비대칭 해소
- 적용 제외: GoAgent(arXiv:2603.19677)·OFA-MAS(arXiv:2601.12996) 등 2026년 초 극최신 토폴로지 자동생성 논문(아직 인용 축적 없음), `Graph_Engineering.md`에 6번째 블로그 출처 추가(기존 5개와 논조 중복), 신규 하위 문서 신설(기존 2문서 구조로 충분)

## [2026-08-06] create | Loop_Engineering/Cost_Engineering 신설

- 배경: 사용자와의 대화에서 "8계층 명명 계보(Model→...→Graph)가 인간 조직 발전 과정과 유사하다"는 관점을 논의하다, "그 다음 단계는 비용 절감을 자동으로 판단·수행하는 AI 에이전트가 아닐까"라는 아이디어로 이어짐. 웹 검색으로 개별 기법(모델 캐스케이드/라우팅, 반복 작업 자동 스크립트화, RAG 컨텍스트 프루닝)과 "그걸 자율적으로 감시·판단·실행하는 에이전트" 상위 개념(**Agentic FinOps**, Finout Agents/Frugal ACE/Mavvrik 등 실제 상용 제품 존재) 둘 다 실재함을 확인. 다만 이는 명명 계보의 9번째 새 계층이 아니라 **Loop Engineering의 특수화**(새 통제 대상 도입이 아니라 기존 루프의 목표 지표를 비용으로 바꾼 것)라는 결론에 사용자와 함께 도달, 하위 문서로 추가하기로 합의
- 사용자가 제안한 4가지 분류(경량 모델 전환/스크립트화/입출력 최적화/최적화 에이전트 자체 모니터링) 중, 처음 3개는 뒷받침할 연구가 충분해 각각 독립 문서로 분리하고 4번째(자체 모니터링)는 예상 분량이 300~500단어로 얇아 개요 문서의 한 섹션으로 통합(사용자 확인)
- 신규 챕터: `Loop_Engineering/Cost_Engineering/` (KO+EN, `GraphRAG/Knowledge_Graph/`·`Agent_Skills_and_Protocols/`와 같은 서브폴더 패턴)
  - `Cost_Engineering.md`(order:0) — "새 계층이 아니라 특수화"라는 위치 정의, Agentic FinOps 현황(Finout Agents 2026-06-07 출시, Frugal ACE/Frugalbot, Mavvrik, Google Cloud FinOps AI Explainability Agent — 완전 자율보다는 diff 승인형 human-in-the-loop가 실무 표준이라는 뉘앙스 포함), 워처 자신의 비용 모니터링 섹션, Runtime/Continuous/Production_Operations와의 관계 구분표
  - `Complexity_Aware_Model_Routing.md`(order:1) — FrugalGPT cascade(Chen et al. 2023, arXiv:2305.05176), RouteLLM(기존 인용과 교차 참조), UCCI(arXiv:2605.18796), Budget-Aware Agentic Routing(arXiv:2602.21227), SWE-Router(arXiv:2607.00053), 태스크 분해 후 라우팅, Shadow/Canary 검증 기간
  - `Deterministic_Task_Scriptification.md`(order:2) — Agentic Compilation(arXiv:2604.09718), Tool-Making and Self-Evolving LLM Agents(arXiv:2607.08010), LOOP Skill Engine(arXiv:2605.14237), Voyager/DSPy와의 관계, 스키마 드리프트 시 LLM 폴백, Agent Sandbox 연결
  - `Context_Usage_Auditing.md`(order:3) — 기존 `Context_Compression.md`와 겹치지 않는 "검색됐지만 안 쓰인 RAG 청크 감사" 관점, AdaGReS(arXiv:2512.25052), retrieval-K 자동 조정, 멀티에이전트 입출력 형식 엄수의 실용성 우선순위
- 갱신: `Loop_Engineering.md` 하위 문서 표, `Runtime_Optimization.md`·`Continuous_Optimization.md`·`Production_Operations.md`·`Guardrail_Engineering.md`(KO+EN 8파일)에 역링크, `Engineering/index.md`·`AI/index.md`(KO+EN 4파일)에 하위 문서 3개 포함 링크 반영
