# 22365_14 — Operationalizing Generative AI on Vertex AI using MLOps v7

## Metadata
- **File Name**: 22365_14_Operationalizing Generative AI on Vertex AI_v7 (1).pdf
- **Authors**: Anant Nawalgaria, Gabriela Hernandez Larios, Elia Secchi, Mike Styer, Christos Aniftos, Onofrio Petragallo, Sokratis Kartakis (Google)
- **Publication Date**: February 2025
- **Subject**: Methodology for operationalizing generative AI from an MLOps perspective on the Vertex AI platform — [[en/AI/sources/22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)|Vertex AI]], [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]], [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]], [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]], [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]], [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]]
- **Source (URL)**: https://www.kaggle.com/whitepaper-operationalizing-generative-ai-on-vertex-ai-using-mlops

## Summary
The emergence of Foundation Models and generative AI has brought a new paradigm to ML system development. This document systematically explains how traditional MLOps principles are modified and extended for generative AI (gen AI) and organizes how Google Cloud's Vertex AI supports this entire lifecycle into 8 functional groups. It centers on the 5 stages of the lifecycle (Discover → Develop → Deploy → Monitor → Govern) and introduces the concept of the "prompted model component," a core unit unique to gen AI.

---

## 1. Key Differences between MLOps and LLMOps

| Aspect | Predictive AI (MLOps) | Generative AI (LLMOps) |
|------|----------------------|----------------------|
| Unit of Development | Model alone | **Prompted model component** (Model + Prompt) |
| Sensitivity to Input Changes | Low | **Very High** — Task switching via input changes alone |
| Iterative Experimentation | Independent model updates | Requires **integrated experimentation** of prompt, model, and chain |
| Data | Well-defined single dataset | Heterogeneous mix including prompts, few-shot examples, RAG data, human feedback, etc. |
| Evaluation | Single metric | Requires complex, subjective, and LLM-as-a-judge evaluations |
| Version Control | Model weights | Prompt templates + chain definitions + adapters + entire external datasets |
| Continuous Improvement | Data retraining | **Foundation Model replacement + prompt tuning** |

### Prompted Model Component
The smallest independent unit of gen AI. A Foundation Model alone is not sufficient; it cannot perform the desired task without a prompt such as "Translate from English to French." This combination serves as the basic unit for experimentation and evaluation in gen AI.

---

## 2. 5 Stages of the Gen AI System Lifecycle

### Discover
- Explosive growth in the number of models (open-source + proprietary Foundation Models)
- Selection criteria: Quality (benchmarks/test prompts), Latency & Throughput, development & maintenance time, cost, and compliance
- **Vertex Model Garden**: Exploration hub for 150+ models (including Google proprietary + open-weight models)

### Develop & Experiment
**Prompt Engineering** 2 stages:
1. Writing and refining prompts to guide the desired behavior
2. Evaluating the output to generate instructions for the next iteration

**Chain & Augmentation**:
- Complex tasks that cannot be solved by a single prompted model → Connecting multiple models, APIs, and code logic
- Key patterns: **RAG** (reducing hallucinations + reflecting up-to-date information with external databases), **Agents** (ReAct technique, dynamic tool selection)
- Since chains are difficult to evaluate in isolation, **end-to-end evaluation** is essential

**Dual Nature of Prompts**:
- Prompt as Data: few-shot examples, knowledge base, user queries → Data validation and drift detection
- Prompt as Code: context, prompt templates, guardrails → Version control and approval processes

### Tuning & Training
- **Supervised Fine-tuning**: Supervised learning mapping inputs to outputs
- **RLHF (Reinforcement Learning from Human Feedback)**: Steering the LLM using a reward model based on human preferences
- Cost-reduction techniques: **Quantization** (32-bit float → 8-bit integer), **Pruning** (removing unnecessary weights), **Distillation** (transferring knowledge from a large teacher model to a smaller student model)
- GPU (parallel processing) vs. TPU (specialized in matrix operations) — Google Cloud TPU

### Deploy
**Targets of Version Control**:
- Prompt templates (Git)
- Chain definition code (Git)
- External datasets (BigQuery, AlloyDB)
- Adapter models (Cloud Storage)

**CI/CD for Gen AI**:
- Challenges: Difficulty in defining comprehensive test cases due to open-ended outputs + reproducibility challenges due to inherent randomness
- Solutions: Applying the same gen AI evaluation techniques to the CI system (LLM-as-a-judge, AutoSxS, etc.)

**Foundation Model Deployment Optimization**:
- Infrastructure Validation: Pre-validating the compatibility between model and serving configurations (using TFX)
- Reducing compute/storage requirements using Quantization, Distillation, and Pruning

### Logging & Monitoring
- **Drift and Skew Detection**: Monitoring prompt alignment and evaluating prompt-output alignment for multimodal outputs
- **LLM-as-a-Judge (AutoRater)**: Scoring subjective criteria aligned with organizational policies
- **Continuous Evaluation**: Capturing production outputs → executing evaluation pipelines → tracking performance
- **OpenTelemetry-based Tracing**: Tracking internal agent steps; specification is evolving to support large payloads
- **Alerting System**: Immediate intervention when drift or performance degradation is detected

### Govern
- Tracking lineage across all chain elements: used data, models, code, evaluation data, and metrics
- In gen AI, lineage extends beyond model artifacts to include **all components of the chain**
- Tools: Dataplex (data governance), Vertex ML Metadata, Vertex Experiments, Vertex Model Registry

---

## 3. Agent MLOps

### 3 Core Elements of an Agent
- **Foundation Model**: Cognitive engine (reasoning + language processing)
- **Instructions**: Goal directives (ranging from simple tasks to complex multi-step goals)
- **Tool**: Executable function descriptions + parameters (the model decides the selection, while actual execution is handled by separate code)

### Comparison of Tool Types (Table 2)
| Property | Code Functions | Private REST APIs | Public REST APIs |
|------|---------------|-------------------|-----------------|
| Latency | Very Low | Moderate | Potentially High |
| Security | Agent Environment | Strong within VPC | Careful consideration required |
| Ownership | Full | Full within VPC | None |
| Internal System Access | Direct | Via Network | Generally Not Possible |

### Tool Registry
- **Tool Registry** = Central catalog for all tools (the agent-specific version of the Model Registry)
- Core features: Reusability, visibility, access control, standardization, version control, and audit trails
- Tool Selection strategies: Generalist (full catalog) / Specialist (predefined subset) / Dynamic (runtime query)

### Agent Observability
- Short-term memory: Developer code updates the conversation history (reflecting context)
- Debugging and audit tracking across multi-agent systems via **OpenTelemetry** trace IDs

---

## 4. 8 Functional Areas of Vertex AI

| Functional Group | Key Services | Role |
|--------|------------|------|
| **Discover** | Vertex Model Garden (150+ models) | Exploring & comparing Foundation Models |
| **Prototype** | Vertex AI Studio, Notebooks | UI-based prompt testing & experimentation |
| **Customize** | Vertex AI Training & Tuning | Supervised FT, RLHF, Distillation, PEFT |
| **Chain & Augment** | Grounding, Extensions, Vector Search, Agent Builder | Building RAG pipelines & agents |
| **Evaluate** | Vertex AI Experiments, TensorBoard, Eval Pipelines | Tracking experiments, AutoSxS, LLM-as-a-judge |
| **Predict** | Vertex AI Endpoints & Monitoring | Model serving & production monitoring |
| **Govern** | Feature Store, Model Registry, Dataplex | Integrating data, model, and code governance |
| **Orchestrate** | Vertex AI Pipelines | Pipeline automation & reproducibility |

---

## Key Takeaways
- The core unit of gen AI is the **"Prompted Model Component"**, not the model alone — prompt version control is as critical as MLOps
- Since chains are difficult to evaluate in isolation by component, **end-to-end evaluation** should be the default
- Recognize the dual nature of **Prompt as Data + Prompt as Code** and apply corresponding governance to each
- The Tool Registry is the Model Registry of the agent ecosystem — centralization becomes essential as scale increases
- Vertex AI supports the entire lifecycle from Discovery to Governance in a single platform across 8 functional groups

## Related Concepts
[[en/AI/sources/22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)|Vertex AI]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]]
