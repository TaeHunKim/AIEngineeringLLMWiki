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
