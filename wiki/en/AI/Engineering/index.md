---
order: 0
---

# AI Engineering Wiki

A comprehensive knowledge base covering the entire lifecycle of designing, building, and operating LLM-based AI systems.
From pre-training to post-deployment continuous improvement loops — covering 7 Engineering layers needed in practice.

---

## Table of Contents

### 1. [[en/AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] — Techniques for working with the model itself

- [[en/AI/Engineering/Model_Engineering/Pre-training_and_Continual_Learning|Pre-training & Continual Learning]] — Initial training + continuous adaptation
- Fine-Tuning
    - [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] — SFT, RLHF(PPO), DPO
    - [[en/AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT / LoRA / QLoRA]] — Parameter-efficient fine-tuning
- Compression & Optimization
    - [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]] — INT8/INT4, GPTQ, AWQ, GGUF
    - [[en/AI/Engineering/Model_Engineering/Model_Distillation|Knowledge Distillation]] — Teacher→Student knowledge distillation

---

### 2. [[en/AI/Engineering/Prompt_Engineering/Prompt_Engineering|Prompt Engineering]] — Input/output control techniques

- Input Control
    - [[en/AI/Engineering/Prompt_Engineering/System_and_Role_Prompting|System & Role Prompting]] — System prompt & role setup
    - [[en/AI/Engineering/Prompt_Engineering/Few_shot_Prompting|Few-shot Prompting]] — Zero-shot / One-shot / Few-shot
    - [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]] — CoT / Tree of Thought / Self-Consistency
- Output Control
    - [[en/AI/Engineering/Prompt_Engineering/Sampling_Controls|Sampling Controls]] — Temperature, Top-K, Top-P, Min-P
    - [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]] — JSON, YAML, Pydantic, Instructor

---

### 3. [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] — Context composition strategies

- Memory & Caching
    - [[en/AI/Engineering/Context_Engineering/Memory_and_Semantic_Cache|Memory & Semantic Cache]] — Overview index
    - [[en/AI/Engineering/Context_Engineering/LLM_Memory|LLM Memory]] — 4 type classification, Conversation strategies, Letta/Mem0/Zep
    - [[en/AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]] — GPTCache, Redis, cost reduction
- Context Optimization
    - [[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]] — LLM Lingua, Map-Reduce, cost reduction
    - [[en/AI/Engineering/Context_Engineering/Lost_in_the_Middle|Lost in the Middle]] — Long context middle degradation and avoidance strategies (Liu et al., 2023)
    - [[en/AI/Engineering/Context_Engineering/Open_Knowledge_Format|Open Knowledge Format (OKF)]] — Open standard for packaging organizational knowledge for AI agents, markdown+YAML frontmatter bundle (Google Cloud, 2026)

---

### 3-1. [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies]] — Search strategies

- RAG (vector-based unstructured document retrieval)
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG Overview]] — Retrieval-Augmented Generation basics
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]] — Fixed-size, Semantic, Hierarchical
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]] — Vector DB, ANN search (HNSW, FAISS)
    - Advanced Retrieval
        - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]] — Reranking, Multi-Query, RAG Fusion
        - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/HyDE|HyDE]] — Hypothetical Document Embeddings
        - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic RAG]] — Self-RAG, CRAG, Multi-Agent RAG, Query Routing
        - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Hybrid_RAG|Hybrid RAG]] — ① Dense+Sparse(BM25), ② Vector+Graph, ③ Vector+Graph+Key-Value (StructRAG/RAGU)
        - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Multimodal_RAG|Multimodal RAG]] — CLIP/ColPali shared embedding, text+image integrated retrieval
- GraphRAG (structural relationships & global analysis)
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]] — Microsoft 2024, Leiden clustering
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Knowledge_Graph|Knowledge Graph Overview]]
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/LPG_and_RDF|LPG & RDF]] — Neo4j Cypher vs SPARQL
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology|Ontology]] — OWL, domain ontology, reasoning
- NL2SQL (structured DB natural language query)
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL|NL2SQL]] — Text-to-SQL pipeline, Spider·BIRD benchmarks, DIN-SQL·DAIL-SQL
- SQL RAG (structured + unstructured Hybrid)
    - [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/SQL_RAG/SQL_RAG|SQL RAG]] — SQL-based RAG patterns, Hybrid architecture

---

### 4. [[en/AI/Engineering/Flow_Engineering/Flow_Engineering|Flow Engineering]] — Execution flow design

- [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Linear_Flow|Linear Flow Overview]]
    - [[en/AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]] — LCEL pipeline (Harrison Chase, 2022)
    - [[en/AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]] — RAG-specialized indexing-query pipeline (Jerry Liu, 2022)
    - [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] — OpenAI/Anthropic Function Calling
- [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Graph_Flow|Graph Flow Overview]]
    - [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] — StateGraph, ReAct Agent (LangChain AI, 2024)
    - [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows|Cyclic Flows]] — Evaluate-and-Retry, Self-Correction
    - [[en/AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern|ReAct Pattern]] — Thought-Action-Observation (Yao, 2022)
    - [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human-in-the-Loop]] — Breakpoints, Edit & Continue, Time Travel

---

### 5. [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] — Autonomous agent design

- [[en/AI/Engineering/Agent_Engineering/Agent_Core_Pillars|Agent Core Pillars]] — Planning, Memory, Tools, **Deployment** (Weng, 2023 + May 2026)
- [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] — Single / Orchestrator / Router / Multi-Agent / Long-running
- [[en/AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Anthropic's Workflow Patterns]] — Prompt Chaining / Routing / Parallelization / Orchestrator-Workers / Evaluator-Optimizer (Anthropic, 2024)
- [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] — Plan-and-Solve, ReWOO, Tree of Thoughts/LATS, Reflexion, Self-Refine/CRITIC
- [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] — Short-term / Long-term / MemGPT / Sleep-time Compute / Mem0 / Voyager Skill Library
- [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols|Agent Skills & Protocols]] — Anthropic Skills + protocol overview
    - [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP (Model Context Protocol)]] — Open standard for LLM↔tool integration, Transports/Sampling/OAuth 2.1/Gateway (Anthropic, 2024)
    - [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/A2A|A2A (Agent-to-Agent Protocol)]] — Open standard for inter-agent communication (Google, 2025)
    - [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/AG_UI|AG-UI (Agent-User Interaction Protocol)]] — Real-time bidirectional streaming standard for agent↔user UI (CopilotKit, 2025)
- [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent Frameworks]] — AutoGen v0.4, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Agno/Mastra
- [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]] — Coordination patterns, communication protocols, failure modes (MASFT/MAST, NeurIPS 2025)
- [[en/AI/Engineering/Agent_Engineering/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]] — Claude/OpenAI CUA/Gemini computer use, Pipecat/LiveKit voice agents
- [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]] — METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, Kill Switch/HITL *(2026)*
- [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]] — 3-stage evaluation layers, Agent Workbench 7 surfaces
- [[en/AI/Engineering/Agent_Engineering/AgentOps|AgentOps]] — Safe Rollout 4 strategies, multi-agent observability, cost & latency optimization
- [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] — Agent Runtime, Memory Bank, Gateway, Registry, Identity, **Agent Optimizer** *(May 2026)*

---

### 6. [[en/AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] — Safety, evaluation & operational infrastructure

- Guardrails
    - [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] — NeMo, LlamaGuard, 3-Layer security, ADK SafetyPlugin, Agent Sandbox
- Evaluation
    - [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] — MT-Bench, RAGAS, bias mitigation
    - [[en/AI/Engineering/Harness_Engineering/Agent_as_a_Judge|Agent-as-a-Judge]] — Trajectory evaluation, Critic Agent, Multi-Agent-as-Judge (Zhuge et al., ICML 2025)
    - [[en/AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]] — MMLU, HumanEval, SWE-bench, BFCL
    - [[en/AI/Engineering/Harness_Engineering/Human_Evaluation|Human Evaluation]] — Preference Annotation, IAA, Chatbot Arena
- Observability
    - [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]] — LangSmith, Langfuse, Arize Phoenix, Agent Observability suite *(May 2026)*
- Red Teaming
    - [[en/AI/Engineering/Harness_Engineering/Red_Teaming|Red Teaming]] — HarmBench, PAIR, Many-shot Jailbreaking, ASCII Jailbreaks, Garak/PyRIT
- Alignment & Governance
    - [[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]] — Reward Hacking, Sleeper Agents, In-Context Scheming, Alignment Faking, AI Control
    - [[en/AI/Engineering/Harness_Engineering/AI_Governance_and_Compliance|AI Governance & Compliance]] — RSP/Preparedness/FSF, METR external evaluation, EU AI Act, model cards *(2026)*

---

### 7. [[en/AI/Engineering/Loop_Engineering/Loop_Engineering|Loop Engineering]] — Continuous improvement loops

- [[en/AI/Engineering/Loop_Engineering/Data_Flywheel|Data Flywheel]] — Agent-in-the-Loop, self-reinforcing data cycle, Self-Evolving Flywheel *(2025)*
- [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]] — DSPy 3.0(SIMBA/GEPA/GRPO), RLVR, Test-Time Compute Scaling *(2025)*
- [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]] — Semantic Cache, RouteLLM (ICLR 2025), Speculative Decoding, vLLM/SGLang/TensorRT-LLM serving internals
- [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] — AI gateway, deployment strategies, A/B testing, SRE/chaos engineering, FinOps *(2026)*

---

## AI Engineering Overall Architecture

![[assets/structured-llm-engineering-hierarchy.png]]
