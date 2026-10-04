---
order: 0
---

# AI Wiki Index

This wiki organizes Engineering knowledge for designing, building, and operating LLM-based AI systems.

## Engineering

- [[en/AI/Engineering/index|AI Engineering Wiki]]: Complete AI Engineering architecture — 8 layers: Model/Prompt/Context/Flow/Agent/Harness/Loop/Graph

#### Model Engineering
- [[en/AI/Engineering/Model_Engineering/Pre-training_and_Continual_Learning|Pre-training & Continual Learning]]: Pre-training basics, Chinchilla scaling laws, catastrophic forgetting strategies
- [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]]: SFT, RLHF(PPO), DPO — full weight updates
- [[en/AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT / LoRA / QLoRA]]: LoRA math, QLoRA NF4+double quantization, HuggingFace implementation
- [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]]: PTQ/GPTQ/AWQ/GGUF, memory calculation by precision
- [[en/AI/Engineering/Model_Engineering/Model_Distillation|Model Distillation]]: Hinton 2015 origin, Teacher-Student, DistilBERT/Phi/DeepSeek-R1
- [[en/AI/Engineering/Model_Engineering/Model_Architectures_and_MoE|Model Architectures & MoE]]: Dense vs MoE (Total/Active Params), RoPE/YaRN/LongRoPE long-context, SLM-for-Agents
- [[en/AI/Engineering/Model_Engineering/Synthetic_Data_and_Curation|Synthetic Data & Curation]]: Self-Instruct/Evol-Instruct, judge filtering, dedup/decontamination, model collapse
- [[en/AI/Engineering/Model_Engineering/Multimodal_Models|Multimodal Models]]: VLM architecture (adapter-bridged vs. native), image tokenization, audio/video, MMMU/DocVQA
- [[en/AI/Engineering/Model_Engineering/Tokenization|Tokenization]]: BPE/WordPiece/SentencePiece, vocabulary-size trade-offs, multilingual/Korean token efficiency
- [[en/AI/Engineering/Model_Engineering/Decision_Models|Decision Models]]: Jev-style System One Models, Choice/Score/Noul primitives, logprob wrappers vs trained models, calibration (ECE)

#### Prompt Engineering
- [[en/AI/Engineering/Prompt_Engineering/System_and_Role_Prompting|System & Role Prompting]]: System Prompt structure, role types, Constitutional AI
- [[en/AI/Engineering/Prompt_Engineering/Few_shot_Prompting|Few-shot Prompting]]: GPT-3 (Brown 2020) Zero/One/Few-shot origins
- [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]]: Wei 2022 CoT, Yao 2023 ToT, Self-Consistency
- [[en/AI/Engineering/Prompt_Engineering/Sampling_Controls|Sampling Controls]]: Temperature/Top-K/Top-P/Min-P/Beam Search
- [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]]: JSON Mode, Pydantic, Instructor library
- [[en/AI/Engineering/Prompt_Engineering/Prompt_Caching|Prompt Caching]]: Static prefix design, cache breakpoints/TTL, how it differs from Semantic Cache
- [[en/AI/Engineering/Prompt_Engineering/Automatic_Prompt_Optimization|Automatic Prompt Optimization]]: APE/OPRO/TextGrad, GEPA (ICLR 2026), DSPy optimizer selection guide

#### Context Engineering
- [[en/AI/Engineering/Context_Engineering/LLM_Memory|LLM Memory]]: 4 LLM Memory types (In-Context/External/In-Weights/In-Cache), Letta/Mem0/Zep implementations
- [[en/AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]]: GPTCache, Redis implementation, category-aware cache, cost savings
- [[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]]: LLM Lingua, Map-Reduce, Lost in the Middle
- [[en/AI/Engineering/Context_Engineering/Lost_in_the_Middle|Lost in the Middle]]: Liu et al. 2023, long-context middle degradation, Query-Aware Contextualization
- [[en/AI/Engineering/Context_Engineering/Open_Knowledge_Format|Open Knowledge Format (OKF)]]: Open standard for packaging organizational knowledge for AI agents (Google Cloud 2026)
- [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic Context Management]]: Context Rot, Write/Select/Compress/Isolate, Compaction, Sub-agent Context Isolation
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG Overview]]: Vector-based RAG basics, standard pipeline, RAGAS evaluation
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Document_Ingestion|Document Ingestion]]: Document parsing/OCR, OCR-based vs. OCR-free (ColPali), tool landscape (Unstructured/LlamaParse/Docling/Marker)
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]]: 5 chunking strategies, NVIDIA 2024 benchmark
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]]: HNSW/FAISS/ScaNN, 7 DB comparison table
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]]: Cross-Encoder reranking, Multi-Query, RAG Fusion
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/HyDE|HyDE]]: Hypothetical document embeddings, Gao 2022
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic RAG]]: Naive/Advanced/Agentic taxonomy, Self-RAG, CRAG, Query Routing
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Hybrid_RAG|Hybrid RAG]]: Dense+Sparse, Vector+Graph, Vector+Graph+KV hybrids
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Multimodal_RAG|Multimodal RAG]]: CLIP/ColPali shared embeddings, text+image integrated retrieval
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/Embedding_Models|Embedding Models]]: Bi/Cross-encoder/Late Interaction (ColBERT), Matryoshka Representation Learning, MTEB/BEIR, reranker models
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Knowledge_Graph|Knowledge Graph]]: Knowledge graph overview, comparison with vector DBs
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/LPG_and_RDF|LPG & RDF]]: Neo4j Cypher vs SPARQL, LPG/RDF comparison
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology|Ontology]]: OWL/Turtle, domain ontology, LLM integration patterns
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Agentic_KG_Construction|Agentic KG Construction]]: 4-stage agent pipeline (User Intent/File-Suggestion/Schema Proposal), Google ADK + Neo4j (DeepLearning.AI 2026)
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]]: Microsoft 2024, Leiden clustering, Local/Global/DRIFT Search, LazyGraphRAG/LightRAG
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL|NL2SQL]]: Text-to-SQL pipeline, Spider·BIRD benchmarks, DIN-SQL·DAIL-SQL
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/SQL_RAG/SQL_RAG|SQL RAG]]: Structured-data RAG, Vector+SQL hybrid architecture

#### Flow Engineering
- [[en/AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]]: LCEL pipeline, Memory, LangSmith
- [[en/AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]]: 5-stage pipeline, AutoMergingRetriever
- [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]]: OpenAI/Anthropic Function Calling
- [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]]: StateGraph, ReAct Agent, Checkpointing
- [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows|Cyclic Flows]]: Evaluate-and-Retry, Self-Correction patterns
- [[en/AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern|ReAct Pattern]]: Yao 2022, Thought-Action-Observation loop
- [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human-in-the-Loop]]: Breakpoints, Edit & Continue, Time Travel

#### Agent Engineering
- [[en/AI/Engineering/Agent_Engineering/Agent_Core_Pillars|Agent Core Pillars]]: Lilian Weng 2023 — Planning/Memory/Tools 3 pillars
- [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]]: Single/Orchestrator/Router/Multi-Agent
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Anthropic_Workflow_Patterns|Anthropic's Workflow Patterns]]: Prompt Chaining/Routing/Parallelization/Orchestrator-Workers/Evaluator-Optimizer (Anthropic 2024)
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Planning_and_Reflection|Planning & Reflection]]: Plan-and-Solve, ReWOO, ToT/LATS, Reflexion, Self-Refine/CRITIC
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Memory|Agent Memory]]: Short/Long-term Memory, MemGPT, Sleep-time Compute, Mem0, Voyager
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols|Agent Skills & Protocols]]: Anthropic Skills, Google A2A Protocol 2025
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/MCP|MCP]]: Host-Client-Server, 4 primitives, Transports/Sampling/OAuth 2.1, Gateway/Registry ecosystem
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/A2A|A2A]]: Agent Card, task request/response structure, v1.0 spec (Google 2025)
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/AG_UI|AG-UI]]: Real-time bidirectional streaming standard for agent↔user UI (CopilotKit 2025)
- [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks|Agent Frameworks]]: AutoGen v0.4 → Microsoft Agent Framework, CrewAI, OpenAI/Claude Agent SDK, Agno/Mastra
- [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi-Agent Coordination]]: Coordination patterns, MASFT/MAST failure taxonomy (Cemri et al. NeurIPS 2025)
- [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]]: Claude/OpenAI CUA/Gemini, Pipecat/LiveKit
- [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous Systems]]: METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, Kill Switch/HITL
- [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]]: 3-stage evaluation layers, Agent Workbench 7 Surfaces
- [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/AgentOps|AgentOps]]: AgentOps methodology 3 Pillars + Observe→Act→Evolve, tool comparison
- [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment|Agent Deployment]]: Agent Runtime/Memory Bank/Gateway/Registry/Identity/Simulation/Optimizer, AWS Bedrock AgentCore·Azure AI Foundry comparison
- [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents|Coding Agents]]: AGENTS.md, spec-driven development, Plan→Edit→Verify loop, worktree parallelism, ACI
- [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Deep_Research_Agents|Deep Research Agents]]: Planner/Researcher/Synthesizer, bounded sub-agents, citation verification, BrowseComp

#### Harness Engineering
- [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail Engineering]]: NeMo Guardrails, Guardrails AI, LlamaGuard, PVE indirect injection defense, watermarking
- [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge|LLM-as-a-Judge]]: MT-Bench (Zheng 2023), RAGAS, 4 bias types
- [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Agent_as_a_Judge|Agent-as-a-Judge]]: Trajectory evaluation, DevAI benchmark, Critic Agent, Multi-Agent-as-Judge (Zhuge et al. ICML 2025)
- [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Benchmarking|Benchmarking]]: MMLU/HumanEval/SWE-bench/BFCL/GAIA/AgentBench, pass@k
- [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Human_Evaluation|Human Evaluation]]: Preference Annotation, IAA (Cohen's Kappa), Chatbot Arena
- [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability & Tracing]]: LangSmith/Langfuse/Arize Phoenix
- [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Red_Teaming|Red Teaming]]: HarmBench, PAIR, Many-shot/ASCII Jailbreaking, Garak/PyRIT
- [[en/AI/Engineering/Harness_Engineering/Alignment_and_Governance/Alignment_Research|Alignment Research]]: Reward Hacking, Sleeper Agents, Agentic Misalignment, In-Context Scheming, Alignment Faking, AI Control
- [[en/AI/Engineering/Harness_Engineering/Alignment_and_Governance/Mechanistic_Interpretability|Mechanistic Interpretability]]: Sparse Autoencoders, Circuit Tracing, internal circuit analysis
- [[en/AI/Engineering/Harness_Engineering/Alignment_and_Governance/AI_Governance_and_Compliance|AI Governance & Compliance]]: RSP/Preparedness/FSF, NIST AI RMF, ISO 42001, EU AI Act, model cards
- [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense|Prompt Injection Defense]]: Lethal Trifecta, Meta Rule of Two, CaMeL, Dual-LLM pattern, Spotlighting
- [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Hallucination_and_Grounding|Hallucination & Grounding]]: hallucination taxonomy, Semantic Entropy, SelfCheckGPT, claim-level groundedness, production stack

#### Loop Engineering
- [[en/AI/Engineering/Loop_Engineering/Data_Flywheel|Data Flywheel]]: Agent-in-the-Loop, self-reinforcing data collection cycle
- [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]]: DSPy/MIPROv2, iterative fine-tuning, A/B testing
- [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]]: API-calling-side optimization — Semantic Cache, Model Routing, batching, streaming
- [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]]: AI gateway, deployment strategies, A/B testing, SRE/chaos, FinOps
- [[en/AI/Engineering/Loop_Engineering/RL_Environments|RL Environments]]: Verifiable-reward environments for RLVR training, Gymnasium lineage, SWE-Gym/GEM/AgentGym, verifier & reward design
- [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]]: Agentic FinOps, autonomous watcher for model routing/scriptification/context auditing
- [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity-Aware Model Routing]]: FrugalGPT cascade, RouteLLM, UCCI, Budget-Aware Agentic Routing
- [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Deterministic_Task_Scriptification|Deterministic Task Scriptification]]: Agentic Compilation, Tool-Making, LOOP Skill Engine
- [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Context_Usage_Auditing|Context Usage Auditing]]: RAG chunk usage auditing, automatic retrieval-K tuning
- [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]]: Serving-engine-internal optimization, Prefill/Decode two stages, TTFT/TPOT/Goodput, engine-selection decision table
- [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Inference_Internals|Inference Internals]]: KV Cache, PagedAttention, Continuous/Chunked Batching, RadixAttention, FlashAttention
- [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Speculative_Decoding|Speculative Decoding]]: Draft/Target models, acceptance rate, SpecInfer/Medusa/EAGLE-3/n-gram
- [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Distributed_Serving|Distributed Serving]]: Disaggregated Prefill/Decode, KV Cache Transfer, TP/PP/EP, Goodput scheduling, cold start

#### Graph Engineering
- [[en/AI/Engineering/Graph_Engineering/Multi_Agent_Topology|Multi-Agent Topology]]: Node/edge types, LangGraph `Send()` dynamic routing, identity/budget/guardrail governance, Graph-of-Agents
- [[en/AI/Engineering/Graph_Engineering/Loop_Networks_and_Anchors|Loop Networks and Anchors]]: Work Graph vs Improvement Graph, 4 failure modes including Goodhart's Law, Anchors

---

## Sources

### AI Engineering from Scratch (course series, 2026)
- [aiengineeringfromscratch.com](https://aiengineeringfromscratch.com/) · [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch): An open-source curriculum of 20 phases and 435 lessons by Rohit Ghumare et al. This wiki reflects the phases that correspond to language-model and agent engineering: Phase 11 (LLM Engineering), 13 (Tools & Protocols), 14 (Agent Engineering), 15 (Autonomous Systems), 16 (Multi-Agent & Swarms), 17 (Infrastructure & Production), and 18 (Ethics/Safety/Alignment). The low-level phases on building and training models from scratch (0-10, 12) — math foundations, ML basics, computer vision, speech signal processing — are more fundamental than this wiki's Model Engineering and are excluded.

### Agents (Google/Kaggle series)
- [[en/AI/sources/Introduction_to_Agents|Introduction_to_Agents]]: 5-level Agent taxonomy, 5-step Problem-Solving, A2A/MCP/AP2, Self-Evolution, Co-Scientist
- [[en/AI/sources/22365_19_Agents_v8|22365_19_Agents_v8]]: Extensions/Functions/Data Stores comparison, ReAct/CoT/ToT, LangChain quickstart, multi-agent
- [[en/AI/sources/Agent_Quality|Agent_Quality]]: Outside-In framework, 4 Pillars, 6 trajectory dimensions, Agent Quality Flywheel, ROUGE/BLEU/BERTScore
- [[en/AI/sources/Agents_Companion_v2|Agents_Companion_v2]]: AgentOps layers, BFCL/τ-bench/PlanBench, 6 trajectory metrics, Contractor paradigm

### Tool Integration and Context
- [[en/AI/sources/Agent_Tools_&_Interoperability_with_Model_Context_Protocol_(MCP)|Agent Tools & MCP]]: Host/Client/Server architecture, JSON-RPC 2.0, primitives, 5 security threats
- [[en/AI/sources/Context_Engineering_Sessions_&_Memory|Context Engineering Sessions & Memory]]: 3 Buckets, Session vs Memory distinction, ETL pipeline, Provenance, Memory-as-a-Tool
- [[en/AI/sources/Agentic_RAG|Agentic_RAG]]: Summaries of key papers including the Agentic RAG Survey (2025), Self-RAG (NeurIPS 2023), and CRAG

### Embeddings and Foundation Models
- [[en/AI/sources/whitepaper_emebddings_vectorstores_v2|whitepaper_emebddings_vectorstores_v2]]: Precision@k/nDCG, Word2Vec~ColPali evolution, LSH/HNSW/ScaNN, Vertex Vector Search
- [[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|whitepaper_Foundational_Large_Language_models_&_text_generation_v2]]: Transformer equations, GPT~DeepSeek-R1 evolution, Chinchilla scaling, PEFT/LoRA, FlashAttention/Speculative Decoding

### Domain-Specific and Operations
- [[en/AI/sources/22365_13_Solving_Domain-Specific_problems_using_LLMs_v7|22365_13_Solving_Domain-Specific_problems_using_LLMs_v7]]: SecLM 3-layer + PET adapters, Med-PaLM 2 USMLE 86.5%, Ensemble Refinement, 3-stage clinical validation
- [[en/AI/sources/22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)|22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)]]: LLMOps lifecycle, Prompted Model Component, MLOps vs LLMOps, 8 Vertex AI feature groups, Tool Registry
- [[en/AI/sources/Prototype_to_Production|Prototype_to_Production]]: 3-pillar AgentOps, 3-phase CI/CD funnel, A2A vs MCP, Observe-Act-Evolve, 3-layer security, Agent Cards
