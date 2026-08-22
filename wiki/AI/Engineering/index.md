---
order: 0
---

# AI Engineering Wiki

LLM 기반 AI 시스템을 설계, 구축, 운영하는 전 과정을 아우르는 지식 체계.  
Pre-training에서 배포 후 지속 개선 루프, 그리고 멀티에이전트/멀티루프 조직 설계까지, 실무에서 필요한 8개 Engineering 레이어를 다룬다.

---

## 목차

### 1. [[AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] — 모델 자체를 다루는 기법

- [[AI/Engineering/Model_Engineering/Pre-training_and_Continual_Learning|Pre-training & Continual Learning]] — 초기 학습 + 지속 적응
- Fine-Tuning
    - [[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] — SFT, RLHF(PPO), DPO
    - [[AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT / LoRA / QLoRA]] — 파라미터 효율적 미세조정
- Compression & Optimization
    - [[AI/Engineering/Model_Engineering/Quantization|Quantization]] — INT8/INT4, GPTQ, AWQ, GGUF
    - [[AI/Engineering/Model_Engineering/Model_Distillation|Knowledge Distillation]] — Teacher→Student 지식 증류
- [[AI/Engineering/Model_Engineering/Model_Architectures_and_MoE|Model Architectures & MoE]] — Dense vs MoE, RoPE/YaRN 롱컨텍스트, SLM-for-Agents *(2026)*

---

### 2. [[AI/Engineering/Prompt_Engineering/Prompt_Engineering|Prompt Engineering]] — 입출력 제어 기법

- Input Control
    - [[AI/Engineering/Prompt_Engineering/System_and_Role_Prompting|System & Role Prompting]] — 시스템 프롬프트 & 역할 설정
    - [[AI/Engineering/Prompt_Engineering/Few_shot_Prompting|Few-shot Prompting]] — Zero-shot / One-shot / Few-shot
    - [[AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]] — CoT / Tree of Thought / Self-Consistency
- Output Control
    - [[AI/Engineering/Prompt_Engineering/Sampling_Controls|Sampling Controls]] — Temperature, Top-K, Top-P, Min-P
    - [[AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]] — JSON, YAML, Pydantic, Instructor
- [[AI/Engineering/Prompt_Engineering/Prompt_Caching|Prompt Caching]] — 정적 프리픽스 설계, Cache Breakpoint/TTL, Semantic Cache와의 차이 *(2026)*

---

### 3. [[AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] — 컨텍스트 구성 전략

- Memory & Caching
    - [[AI/Engineering/Context_Engineering/Memory_and_Semantic_Cache|Memory & Semantic Cache]] — 개요 인덱스
    - [[AI/Engineering/Context_Engineering/LLM_Memory|LLM Memory]] — 4유형 분류, Conversation 전략, Letta/Mem0/Zep
    - [[AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]] — GPTCache, Redis, 비용 절감
- Context Optimization
    - [[AI/Engineering/Context_Engineering/Context_Compression|Context Compression]] — LLM Lingua, Map-Reduce, 비용 절감
    - [[AI/Engineering/Context_Engineering/Lost_in_the_Middle|Lost in the Middle]] — 긴 컨텍스트 중간 활용도 저하 및 회피 전략 (Liu et al., 2023)
    - [[AI/Engineering/Context_Engineering/Open_Knowledge_Format|Open Knowledge Format (OKF)]] — AI 에이전트용 지식 패키징 오픈 표준, 마크다운+YAML frontmatter 번들 (Google Cloud, 2026)
- [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic Context Management]] — Context Rot, Write/Select/Compress/Isolate, Compaction, Sub-agent Context Isolation *(2026)*

---

### 3-1. [[AI/Engineering/Context_Engineering/Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies]] — 검색 전략

- RAG (벡터 기반 비정형 문서 검색)
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG 개요]] — Retrieval-Augmented Generation 기초
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]] — Fixed-size, Semantic, Hierarchical
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]] — Vector DB, ANN 검색 (HNSW, FAISS)
    - Advanced Retrieval
        - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]] — Reranking, Multi-Query, RAG Fusion
        - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/HyDE|HyDE]] — Hypothetical Document Embeddings
        - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic RAG]] — Self-RAG, CRAG, Multi-Agent RAG, Query Routing
        - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Hybrid_RAG|Hybrid RAG]] — ① Dense+Sparse(BM25), ② Vector+Graph, ③ Vector+Graph+Key-Value (StructRAG/RAGU)
        - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Multimodal_RAG|Multimodal RAG]] — CLIP/ColPali 공유 임베딩, 텍스트+이미지 통합 검색
- GraphRAG (구조적 관계·전역 분석)
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]] — Microsoft 2024, Leiden 클러스터링
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Knowledge_Graph|Knowledge Graph 개요]]
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/LPG_and_RDF|LPG & RDF]] — Neo4j Cypher vs SPARQL
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology|Ontology]] — OWL, 도메인 온톨로지, 추론
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Agentic_KG_Construction|Agentic KG Construction]] — 멀티에이전트 KG 자동 구축, Google ADK + Neo4j (DeepLearning.AI, 2026)
- NL2SQL (정형 DB 자연어 질의)
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL|NL2SQL]] — Text-to-SQL 파이프라인, Spider·BIRD 벤치마크, DIN-SQL·DAIL-SQL
- SQL RAG (정형+비정형 Hybrid)
    - [[AI/Engineering/Context_Engineering/Retrieval_Strategies/SQL_RAG/SQL_RAG|SQL RAG]] — SQL 기반 RAG 패턴, Hybrid 아키텍처

---

### 4. [[AI/Engineering/Flow_Engineering/Flow_Engineering|Flow Engineering]] — 실행 흐름 설계

- [[AI/Engineering/Flow_Engineering/Linear_Flow/Linear_Flow|Linear Flow 개요]]
    - [[AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]] — LCEL 파이프라인 (Harrison Chase, 2022)
    - [[AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]] — RAG 특화 인덱싱-질의 파이프라인 (Jerry Liu, 2022)
    - [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] — OpenAI/Anthropic Function Calling
- [[AI/Engineering/Flow_Engineering/Graph_Flow/Graph_Flow|Graph Flow 개요]]
    - [[AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] — StateGraph, ReAct Agent (LangChain AI, 2024)
    - [[AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows|Cyclic Flows]] — Evaluate-and-Retry, Self-Correction
    - [[AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern|ReAct Pattern]] — Thought-Action-Observation (Yao, 2022)
    - [[AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human-in-the-Loop]] — Breakpoints, Edit & Continue, Time Travel

---

### 5. [[AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] — 자율 에이전트 설계

- [[AI/Engineering/Agent_Engineering/Agent_Core_Pillars|Agent Core Pillars]] — Planning, Memory, Tools, **Deployment** (Weng, 2023 + 2026년 5월)
- [[AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] — Single / Orchestrator / Router / Multi-Agent / Long-running
- [[AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Anthropic's Workflow Patterns]] — Prompt Chaining / Routing / Parallelization / Orchestrator-Workers / Evaluator-Optimizer (Anthropic, 2024)
- [[AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] — Plan-and-Solve, ReWOO, Tree of Thoughts/LATS, Reflexion, Self-Refine/CRITIC
- [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] — Short-term / Long-term / MemGPT / Sleep-time Compute / Mem0 / Voyager Skill Library
- [[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols|Agent Skills & Protocols]] — Anthropic Skills + 프로토콜 개요
    - [[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP (Model Context Protocol)]] — LLM↔도구 통합 오픈 표준, Transports/Sampling/OAuth 2.1/Gateway (Anthropic, 2024)
    - [[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/A2A|A2A (Agent-to-Agent Protocol)]] — 에이전트 간 통신 오픈 표준 (Google, 2025)
    - [[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/AG_UI|AG-UI (Agent-User Interaction Protocol)]] — 에이전트↔사용자 UI 실시간 양방향 스트리밍 표준 (CopilotKit, 2025)
- [[AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent Frameworks]] — AutoGen v0.4, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Agno/Mastra
- [[AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]] — 조정 패턴, 통신 프로토콜, 실패 모드 (MASFT/MAST, NeurIPS 2025)
- [[AI/Engineering/Agent_Engineering/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]] — Claude/OpenAI CUA/Gemini 컴퓨터 사용, Pipecat/LiveKit 음성 에이전트
- [[AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]] — METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, Kill Switch/HITL *(2026)*
- [[AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]] — 3단계 평가 레이어, Agent Workbench 7가지 표면
- [[AI/Engineering/Agent_Engineering/AgentOps|AgentOps]] — Safe Rollout 4전략, 멀티에이전트 관찰가능성, 비용·레이턴시 최적화
- [[AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] — Agent Runtime, Memory Bank, Gateway, Registry, Identity, **Agent Optimizer** *(2026년 5월)*

---

### 6. [[AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] — 안전·평가·운영 인프라

- Guardrails
    - [[AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] — NeMo, LlamaGuard, 3-Layer 보안, ADK SafetyPlugin, Agent Sandbox
- Evaluation
    - [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] — MT-Bench, RAGAS, 편향 대응
    - [[AI/Engineering/Harness_Engineering/Agent_as_a_Judge|Agent-as-a-Judge]] — Trajectory 평가, Critic Agent, Multi-Agent-as-Judge, Agent Simulation *(Zhuge et al., ICML 2025)*
    - [[AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]] — MMLU, HumanEval, SWE-bench(Verified), BFCL
    - [[AI/Engineering/Harness_Engineering/Human_Evaluation|Human Evaluation]] — Preference Annotation, IAA, Chatbot Arena
- Observability
    - [[AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]] — LangSmith, Langfuse, Arize Phoenix, Agent Observability suite *(2026년 5월)*
- Red Teaming
    - [[AI/Engineering/Harness_Engineering/Red_Teaming|Red Teaming]] — HarmBench, PAIR, Many-shot Jailbreaking, ASCII Jailbreaks, OWASP LLM Top 10, Garak/PyRIT
- Alignment & Governance
    - [[AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]] — Reward Hacking, Sleeper Agents, Agentic Misalignment, In-Context Scheming, Alignment Faking, AI Control
    - [[AI/Engineering/Harness_Engineering/Mechanistic_Interpretability|Mechanistic Interpretability]] — Sparse Autoencoders, Circuit Tracing, 모델 내부 회로 분석 *(2026)*
    - [[AI/Engineering/Harness_Engineering/AI_Governance_and_Compliance|AI Governance & Compliance]] — RSP/Preparedness/FSF, NIST AI RMF, ISO 42001, EU AI Act, 모델 카드 *(2026)*

---

### 7. [[AI/Engineering/Loop_Engineering/Loop_Engineering|Loop Engineering]] — 지속 개선 루프

- [[AI/Engineering/Loop_Engineering/Data_Flywheel|Data Flywheel]] — Agent-in-the-Loop, 자기 강화 데이터 사이클, Self-Evolving Flywheel *(2025)*
- [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]] — DSPy 3.0(SIMBA/GEPA/GRPO), RLVR, Test-Time Compute Scaling *(2025)*
- [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]] — Semantic Cache, RouteLLM (ICLR 2025), Speculative Decoding, vLLM/SGLang/TensorRT-LLM 서빙 내부
- [[AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] — AI 게이트웨이, 배포 전략, A/B 테스트, SRE/카오스 엔지니어링, FinOps *(2026)*
- [[AI/Engineering/Loop_Engineering/RL_Environments|RL Environments]] — RLVR 훈련용 검증 가능 보상 환경, Gymnasium 계보, SWE-Gym/GEM/AgentGym, Verifier 설계 *(2026)*
- [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]] — Agentic FinOps, 모델 라우팅/스크립트화/컨텍스트 감사 자율 워처 (Loop Engineering의 특수화) *(2026)*
    - [[AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity-Aware Model Routing]] — FrugalGPT, RouteLLM, UCCI, Budget-Aware Agentic Routing
    - [[AI/Engineering/Loop_Engineering/Cost_Engineering/Deterministic_Task_Scriptification|Deterministic Task Scriptification]] — Agentic Compilation, Tool-Making, LOOP Skill Engine
    - [[AI/Engineering/Loop_Engineering/Cost_Engineering/Context_Usage_Auditing|Context Usage Auditing]] — RAG 청크 사용량 감사, retrieval-K 자동 조정

---

### 8. [[AI/Engineering/Graph_Engineering/Graph_Engineering|Graph Engineering]] — 멀티에이전트/멀티루프 조직 설계 *(2026년 7월)*

- [[AI/Engineering/Graph_Engineering/Multi_Agent_Topology|Multi-Agent Topology]] — 노드/엣지 유형, 동적 라우팅(LangGraph `Send()`), 거버넌스(identity/budget/guardrail hook), Graph-of-Agents
- [[AI/Engineering/Graph_Engineering/Loop_Networks_and_Anchors|Loop Networks and Anchors]] — Work Graph vs Improvement Graph, 4대 구조적 실패 모드, Anchor

---

## AI Engineering 전체 아키텍처

<img src="ai/engineering/assets/structured-llm-engineering-hierarchy.svg" alt="Structured LLM Engineering Hierarchy — 8-layer pyramid and nested-frame scope diagram">
