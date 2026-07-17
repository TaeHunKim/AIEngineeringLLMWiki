---
order: 0
---

# AI Wiki Index

이 위키는 LLM 기반 AI 시스템을 설계·구축·운영하는 Engineering 지식을 정리한 공간입니다.

## Engineering

- [[Engineering/index]]: AI Engineering 전체 아키텍처 — Model/Prompt/Context/Flow/Agent/Harness/Loop 7계층

#### Model Engineering
- [[Engineering/Model_Engineering/Pre-training_and_Continual_Learning]]: Pre-training 기초, Chinchilla 스케일링 법칙, 재앙적 망각 대응 전략
- [[Engineering/Model_Engineering/Full_Fine-Tuning]]: SFT, RLHF(PPO), DPO — 전체 가중치 업데이트
- [[Engineering/Model_Engineering/PEFT_LoRA_QLoRA]]: LoRA 수학, QLoRA NF4+이중 양자화, HuggingFace 구현
- [[Engineering/Model_Engineering/Quantization]]: PTQ/GPTQ/AWQ/GGUF, 정밀도별 메모리 계산
- [[Engineering/Model_Engineering/Model_Distillation]]: Hinton 2015 기원, Teacher-Student, DistilBERT/Phi/DeepSeek-R1

#### Prompt Engineering
- [[Engineering/Prompt_Engineering/System_and_Role_Prompting]]: System Prompt 구조, 역할 유형, Constitutional AI
- [[Engineering/Prompt_Engineering/Few_shot_Prompting]]: GPT-3 (Brown 2020) Zero/One/Few-shot 기원
- [[Engineering/Prompt_Engineering/Chain_of_Thought]]: Wei 2022 CoT, Yao 2023 ToT, Self-Consistency
- [[Engineering/Prompt_Engineering/Sampling_Controls]]: Temperature/Top-K/Top-P/Min-P/Beam Search
- [[Engineering/Prompt_Engineering/Structured_Output]]: JSON Mode, Pydantic, Instructor 라이브러리

#### Context Engineering
- [[Engineering/Context_Engineering/Memory_and_Semantic_Cache]]: GPTCache, Redis 기반 시맨틱 캐시
- [[Engineering/Context_Engineering/Context_Compression]]: LLM Lingua, Map-Reduce, Lost in the Middle
- [[Engineering/Retrieval_Strategies/RAG/Chunking_Strategies]]: 5가지 청킹 전략, NVIDIA 2024 벤치마크
- [[Engineering/Retrieval_Strategies/RAG/Vector_Storage]]: HNSW/FAISS/ScaNN, 7개 DB 비교표
- [[Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval]]: Cross-Encoder 리랭킹, Multi-Query, RAG Fusion
- [[Engineering/Retrieval_Strategies/RAG/HyDE]]: 가상 문서 임베딩, Gao 2022
- [[Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/LPG_and_RDF]]: Neo4j Cypher vs SPARQL, LPG/RDF 비교
- [[Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology]]: OWL/Turtle, 도메인 온톨로지, LLM 통합 패턴
- [[Engineering/Retrieval_Strategies/GraphRAG/GraphRAG]]: Microsoft 2024, Leiden 클러스터링, Local/Global Search

#### Flow Engineering
- [[Engineering/Flow_Engineering/Linear_Flow/LangChain]]: LCEL 파이프라인, Memory, LangSmith
- [[Engineering/Flow_Engineering/Linear_Flow/LlamaIndex]]: 5단계 파이프라인, AutoMergingRetriever
- [[Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling]]: OpenAI/Anthropic Function Calling
- [[Engineering/Flow_Engineering/Graph_Flow/LangGraph]]: StateGraph, ReAct Agent, Checkpointing
- [[Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows]]: Evaluate-and-Retry, Self-Correction 패턴
- [[Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern]]: Yao 2022, Thought-Action-Observation 루프
- [[Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop]]: Breakpoints, Edit & Continue, Time Travel

#### Agent Engineering
- [[Engineering/Agent_Engineering/Agent_Core_Pillars]]: Lilian Weng 2023 — Planning/Memory/Tools 3기둥
- [[Engineering/Agent_Engineering/Agent_Architectures]]: Single/Orchestrator/Router/Multi-Agent
- [[Engineering/Agent_Engineering/Anthropic_Workflow_Patterns]]: Prompt Chaining/Routing/Parallelization/Orchestrator-Workers/Evaluator-Optimizer (Anthropic 2024)
- [[Engineering/Agent_Engineering/Planning_and_Reflection]]: Plan-and-Solve, ReWOO, ToT/LATS, Reflexion, Self-Refine/CRITIC
- [[Engineering/Agent_Engineering/Agent_Memory]]: Short/Long-term Memory, MemGPT, Sleep-time Compute, Mem0, Voyager
- [[Engineering/Agent_Engineering/Agent_Skills_and_Protocols]]: Anthropic Skills, Google A2A Protocol 2025
- [[Engineering/Agent_Engineering/Agent_Frameworks]]: AutoGen v0.4, CrewAI, OpenAI/Claude Agent SDK, Agno/Mastra
- [[Engineering/Agent_Engineering/Multi_Agent_Coordination]]: 조정 패턴, MASFT/MAST 실패 분류 (Cemri et al. NeurIPS 2025)
- [[Engineering/Agent_Engineering/Computer_Use_and_Voice_Agents]]: Claude/OpenAI CUA/Gemini, Pipecat/LiveKit
- [[Engineering/Agent_Engineering/Autonomous_Systems]]: METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, Kill Switch/HITL
- [[Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench]]: 3단계 평가 레이어, Agent Workbench 7 Surfaces
- [[Engineering/Agent_Engineering/AgentOps]]: AgentOps 방법론 3 Pillars + Observe→Act→Evolve, agentops.ai 플랫폼, LangSmith/Langfuse/Braintrust/Latitude 도구 비교

#### Harness Engineering
- [[Engineering/Harness_Engineering/Guardrail_Engineering]]: NeMo Guardrails, Guardrails AI, LlamaGuard, PVE 간접 인젝션 방어, 워터마킹
- [[Engineering/Harness_Engineering/LLM_as_a_Judge]]: MT-Bench (Zheng 2023), RAGAS, 4가지 편향
- [[Engineering/Harness_Engineering/Benchmarking]]: MMLU/HumanEval/SWE-bench/BFCL/GAIA/AgentBench, pass@k
- [[Engineering/Harness_Engineering/Human_Evaluation]]: Preference Annotation, IAA(Cohen's Kappa), Chatbot Arena
- [[Engineering/Harness_Engineering/Observability_and_Tracing]]: LangSmith/Langfuse/Arize Phoenix
- [[Engineering/Harness_Engineering/Red_Teaming]]: HarmBench, PAIR, Many-shot/ASCII Jailbreaking, Garak/PyRIT
- [[Engineering/Harness_Engineering/Alignment_Research]]: Reward Hacking, Sleeper Agents, In-Context Scheming, Alignment Faking, AI Control
- [[Engineering/Harness_Engineering/AI_Governance_and_Compliance]]: RSP/Preparedness/FSF, METR 외부평가, EU AI Act, 모델 카드

#### Loop Engineering
- [[Engineering/Loop_Engineering/Data_Flywheel]]: Agent-in-the-Loop, 자기 강화 데이터 수집 사이클
- [[Engineering/Loop_Engineering/Continuous_Optimization]]: DSPy/MIPROv2, 반복적 파인튜닝, A/B 테스트
- [[Engineering/Loop_Engineering/Runtime_Optimization]]: Semantic Cache, Model Routing, vLLM/SGLang/TensorRT-LLM 서빙 내부
- [[Engineering/Loop_Engineering/Production_Operations]]: AI 게이트웨이, 배포 전략, A/B 테스트, SRE/카오스, FinOps

---

## Sources

### AI Engineering from Scratch (강의 시리즈, 2026)
- [aiengineeringfromscratch.com](https://aiengineeringfromscratch.com/) · [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch): Rohit Ghumare 외, 20 Phase 435레슨 오픈소스 커리큘럼. 이번 위키 업데이트에서는 언어모델·에이전트 엔지니어링에 해당하는 Phase 11(LLM Engineering), 13(Tools & Protocols), 14(Agent Engineering), 15(Autonomous Systems), 16(Multi-Agent & Swarms), 17(Infrastructure & Production), 18(Ethics/Safety/Alignment)을 반영. 수학 기초·ML 기본기·컴퓨터 비전·음성 신호처리 등 모델을 처음부터 만들고 학습시키는 저수준 Phase(0-10, 12)는 기존 위키의 Model Engineering보다 더 본질적인 내용이라 제외.

### Agents (구글/캐글 시리즈)
- [[Introduction_to_Agents]]: Agent 5단계 분류, 5단계 Problem-Solving, A2A/MCP/AP2, Self-Evolution, Co-Scientist
- [[22365_19_Agents_v8]]: Extensions/Functions/Data Stores 비교, ReAct/CoT/ToT, LangChain quickstart, 멀티에이전트
- [[Agent_Quality]]: Outside-In 프레임워크, 4 Pillars, 6 trajectory dimensions, Agent Quality Flywheel, ROUGE/BLEU/BERTScore
- [[Agents_Companion_v2]]: AgentOps 계층, BFCL/τ-bench/PlanBench, 6 trajectory metrics, Contractor 패러다임

### 도구 통합 및 컨텍스트
- [[Agent_Tools_&_Interoperability_with_Model_Context_Protocol_(MCP)]]: Host/Client/Server 아키텍처, JSON-RPC 2.0, primitives, 보안 위협 5가지
- [[Context_Engineering_Sessions_&_Memory]]: 3 Buckets, Session vs Memory 구분, ETL pipeline, Provenance, Memory-as-a-Tool

### 임베딩 및 기반 모델
- [[whitepaper_emebddings_vectorstores_v2]]: Precision@k/nDCG, Word2Vec~ColPali 진화, LSH/HNSW/ScaNN, Vertex Vector Search
- [[whitepaper_Foundational_Large_Language_models_&_text_generation_v2]]: Transformer 수식, GPT~DeepSeek-R1 진화, Chinchilla scaling, PEFT/LoRA, FlashAttention/Speculative Decoding

### 도메인 특화 및 운영
- [[22365_13_Solving_Domain-Specific_problems_using_LLMs_v7]]: SecLM 3-layer+PET 어댑터, Med-PaLM 2 USMLE 86.5%, Ensemble Refinement, 임상 검증 3단계
- [[22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)]]: LLMOps lifecycle, Prompted Model Component, MLOps vs LLMOps, Vertex AI 8개 기능군, Tool Registry
- [[Prototype_to_Production]]: 3-pillar AgentOps, 3-phase CI/CD funnel, A2A vs MCP, Observe-Act-Evolve, 보안 3-layer, Agent Cards
