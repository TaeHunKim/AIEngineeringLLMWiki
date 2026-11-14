---
title: What's New
order: 1
noGraph: true
---

# What's New

A reverse-chronological summary of newly added and majorly updated pages in this wiki.

---

## 2026-11-15

### New Pages

- **[[en/AI/Engineering/Prompt_Engineering/Test_Time_Compute_Scaling|Test-Time Compute Scaling]]** (`Prompt Engineering`): Covers inference-time compute scaling paradigms — Parallel Sampling (Best-of-$N$, Majority Voting), Sequential Revision (Iterative Self-Refinement, Budget Forcing `s1`), Tree Search (MCTS, Beam Search), Outcome vs Process Reward Models (ORM vs PRM), and Compute-Optimal Scaling allocation.
- **[[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Merging|Model Merging]]** (`Model Engineering / Training & Tuning`): Covers weight-space combination of multiple fine-tuned models without additional GPU training — Linear/Task Arithmetic, SLERP, TIES-Merging, DARE, Frankenmerging (layer stacking), practical `mergekit` configurations, and Evolutionary Model Merging.
- **[[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Constrained_Decoding|Constrained Decoding (Grammar-Guided Generation)]]** (`Loop Engineering / Serving Engineering`): Covers serving-engine mechanisms that enforce regex, JSON Schema, and CFGs during token sampling — FSM token mask precompilation (Outlines), Pushdown Automaton + bitmasks (XGrammar, llguidance), and Jump-Forward Decoding (Compressed FSM) for TTFT/TPOT acceleration.

### Major Content Updates

- **[[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Quantization|Quantization]]**: Added Hopper/Blackwell hardware-native quantization (**FP8 E4M3/E5M2**, **NVFP4 / MXFP4**), **FP8 KV Cache quantization** for long-context serving, and **BitNet b1.58** ternary quantization-aware training (QAT), plus updated `GPTQConfig` code examples.
- **[[en/AI/Engineering/Model_Engineering/Training_and_Tuning/PEFT_LoRA_QLoRA|PEFT — LoRA & QLoRA]]**: Added LoRA lineage extensions (**DoRA**, **rsLoRA**, **GaLore**) and **Multi-LoRA Serving (S-LoRA, Punica, vLLM)** for serving hundreds of adapters concurrently on a single base model.
- **[[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Distillation|Model Distillation]]**: Added commercial API ToS considerations vs open-weight Teachers (DeepSeek-R1, Qwen, Llama), **On-Policy Distillation (GKD)** to mitigate exposure bias, and **Context / Prompt Distillation** to internalize long system prompts into weights.
- **[[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Model_Architectures_and_MoE|Model Architectures & MoE]]**: Added **Hybrid SSM / Linear Attention architectures** (Mamba-2 SSD, Jamba, Nemotron-H, Qwen3-Next) that interleave linear/SSM layers with Full Attention layers to reduce KV Cache bottlenecks in long agent sessions.
- **[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]]**: Added **Late Chunking** (encoding the full document with a long-context embedding model before chunk-level pooling) and a trade-off comparison against Contextual Retrieval.
- **[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]]**: Added **DiskANN / Vamana** SSD-backed graph indexing, **Vector Quantization (SQ8, PQ, Binary Quantization + Rescoring)**, and object-storage-native vector databases.
- **[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL|NL2SQL]]** & **[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/SQL_RAG/SQL_RAG|SQL RAG]]**: Added enterprise **Semantic Layer / Text-to-Metric integration** (dbt Semantic Layer, MetricFlow, Cube, LookML), clarified architectural boundaries between the two pages, and updated official documentation references.
- **[[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability & Tracing]]**: Added vendor-neutral **OpenTelemetry GenAI Semantic Conventions (`gen_ai.*`)** and **OpenInference** standards.
- **[[en/AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]]**: Added an architectural trade-off comparison between **Cascaded pipelines (ASR → LLM → TTS)** and **Native Speech-to-Speech (S2S)** voice agents across latency, prosody, tool calling, and auditability.

### Modernization & Cleanup

- **[[en/AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]]**: Added practical precautions for false positives, cross-tenant cache isolation, TTL invalidation, and time-sensitive query bypass, along with a complete Redis cosine-similarity implementation and OpenAI SDK v1 usage.
- **[[en/AI/Engineering/Context_Engineering/Context_Compression|Context Compression]]**, **[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/HyDE|HyDE]]**, **[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]]**: Replaced legacy LangChain chain/memory snippets (`LLMChainExtractor`, `ConversationSummaryMemory`, `HypotheticalDocumentEmbedder`, `llm.generate()`) with modern `langchain_core` and `langchain_openai` (`trim_messages`, `llm.invoke()`) patterns.
- **Index & Hub Synchronization**: Updated cross-references and index entries across [[en/AI/Engineering/Prompt_Engineering/Prompt_Engineering|Prompt Engineering]], [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training & Tuning]], [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]], [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]], [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Document_Ingestion|Document Ingestion]], [[en/AI/Engineering/Model_Engineering/Model_Types/Large_Language_Models|Large Language Models]], [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]], [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]], [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]], and [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/AgentOps|AgentOps]].
