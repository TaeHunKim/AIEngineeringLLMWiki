---
order: 0
---

# AI Wiki Index

This wiki organizes Engineering knowledge for designing, building, and operating LLM-based AI systems.

## Engineering

- [[en/AI/Engineering/index|AI Engineering Wiki]]: Complete AI Engineering architecture — 7 layers: Model/Prompt/Context/Flow/Agent/Harness/Loop

#### Model Engineering
- [[en/AI/Engineering/Model_Engineering/Pre-training_and_Continual_Learning|Pre-training & Continual Learning]]: Pre-training basics, Chinchilla scaling laws, catastrophic forgetting strategies
- [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]]: SFT, RLHF(PPO), DPO — full weight updates
- [[en/AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT / LoRA / QLoRA]]: LoRA math, QLoRA NF4+double quantization, HuggingFace implementation
- [[en/AI/Engineering/Model_Engineering/Quantization|Quantization]]: PTQ/GPTQ/AWQ/GGUF, memory calculation by precision
- [[en/AI/Engineering/Model_Engineering/Model_Distillation|Model Distillation]]: Hinton 2015 origin, Teacher-Student, DistilBERT/Phi/DeepSeek-R1

#### Prompt Engineering
- [[en/AI/Engineering/Prompt_Engineering/System_and_Role_Prompting|System & Role Prompting]]: System Prompt structure, role types, Constitutional AI
- [[en/AI/Engineering/Prompt_Engineering/Few_shot_Prompting|Few-shot Prompting]]: GPT-3 (Brown 2020) Zero/One/Few-shot origins
- [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]]: Wei 2022 CoT, Yao 2023 ToT, Self-Consistency
- [[en/AI/Engineering/Prompt_Engineering/Sampling_Controls|Sampling Controls]]: Temperature/Top-K/Top-P/Min-P/Beam Search
- [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]]: JSON Mode, Pydantic, Instructor library

#### Context Engineering
- [[en/AI/Engineering/Context_Engineering/Memory_and_Semantic_Cache|Memory & Semantic Cache]]: GPTCache, Redis-based semantic cache
- [[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]]: LLM Lingua, Map-Reduce, Lost in the Middle
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]]: 5 chunking strategies, NVIDIA 2024 benchmark
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]]: HNSW/FAISS/ScaNN, 7 DB comparison table
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]]: Cross-Encoder reranking, Multi-Query, RAG Fusion
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/HyDE|HyDE]]: Hypothetical document embeddings, Gao 2022
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/LPG_and_RDF|LPG & RDF]]: Neo4j Cypher vs SPARQL, LPG/RDF comparison
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology|Ontology]]: OWL/Turtle, domain ontology, LLM integration patterns
- [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]]: Microsoft 2024, Leiden clustering, Local/Global Search

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
- [[en/AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Anthropic's Workflow Patterns]]: Prompt Chaining/Routing/Parallelization/Orchestrator-Workers/Evaluator-Optimizer (Anthropic 2024)
- [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]]: Plan-and-Solve, ReWOO, ToT/LATS, Reflexion, Self-Refine/CRITIC
- [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]]: Short/Long-term Memory, MemGPT, Sleep-time Compute, Mem0, Voyager
- [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols|Agent Skills & Protocols]]: Anthropic Skills, Google A2A Protocol 2025
- [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent Frameworks]]: AutoGen v0.4, CrewAI, OpenAI/Claude Agent SDK, Agno/Mastra
- [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]]: Coordination patterns, MASFT/MAST failure taxonomy (Cemri et al. NeurIPS 2025)
- [[en/AI/Engineering/Agent_Engineering/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]]: Claude/OpenAI CUA/Gemini, Pipecat/LiveKit
- [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]]: METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, Kill Switch/HITL
- [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]]: 3-stage evaluation layers, Agent Workbench 7 Surfaces
- [[en/AI/Engineering/Agent_Engineering/AgentOps|AgentOps]]: AgentOps methodology 3 Pillars + Observe→Act→Evolve, tool comparison

#### Harness Engineering
- [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]]: NeMo Guardrails, Guardrails AI, LlamaGuard, PVE indirect injection defense, watermarking
- [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]: MT-Bench (Zheng 2023), RAGAS, 4 bias types
- [[en/AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]]: MMLU/HumanEval/SWE-bench/BFCL/GAIA/AgentBench, pass@k
- [[en/AI/Engineering/Harness_Engineering/Human_Evaluation|Human Evaluation]]: Preference Annotation, IAA (Cohen's Kappa), Chatbot Arena
- [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]]: LangSmith/Langfuse/Arize Phoenix
- [[en/AI/Engineering/Harness_Engineering/Red_Teaming|Red Teaming]]: HarmBench, PAIR, Many-shot/ASCII Jailbreaking, Garak/PyRIT
- [[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]]: Reward Hacking, Sleeper Agents, In-Context Scheming, Alignment Faking, AI Control
- [[en/AI/Engineering/Harness_Engineering/AI_Governance_and_Compliance|AI Governance & Compliance]]: RSP/Preparedness/FSF, METR external evaluation, EU AI Act, model cards

#### Loop Engineering
- [[en/AI/Engineering/Loop_Engineering/Data_Flywheel|Data Flywheel]]: Agent-in-the-Loop, self-reinforcing data collection cycle
- [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]]: DSPy/MIPROv2, iterative fine-tuning, A/B testing
- [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]]: Semantic Cache, Model Routing, vLLM/SGLang/TensorRT-LLM serving internals
- [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]]: AI gateway, deployment strategies, A/B testing, SRE/chaos, FinOps
