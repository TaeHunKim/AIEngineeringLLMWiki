# Agents Companion v2

## Metadata
- **File Name**: `Agents_Companion_v2 (3).pdf`
- **Authors**: Antonio Gulli, Lavi Nigam, Julia Wiesinger, Vladimir Vuskovic, Irina Sigler, Ivan Nardini, Nicolas Stroppa, Sokratis Kartakis, Narek Saribekyan, Anant Nawalgaria, Alan Bount
- **Publication Date**: February 2025
- **Topic**: Agents "102" — AgentOps, Multi-Agent System, Agentic RAG, Contractor paradigm, Google Agentspace, Automotive AI multi-agent case study
- **Source (URL)**: https://www.kaggle.com/whitepaper-agent-companion

## Summary
A sequel to the Agents whitepaper. Starting with a review of the three components: Model + Tools + Orchestration, it covers multi-agent patterns, AgentOps, Agentic RAG, a new paradigm of "treating agents as contractors", the Google Agentspace product lineup, and concludes with a rich case study applying five patterns to automotive environments.

## AgentOps Layer
DevOps → MLOps → FMOps → PromptOps → RAGOps → **AgentOps**. AgentOps is a sub-classification of GenAIOps, adding elements such as tool management, agent brain prompt (goal/persona/instruction), orchestration, [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]], and task decomposition.

## Agent Success Metrics
- Business north-star (revenue, engagement)
- Goal completion rate, KPI, thumbs up/down
- OpenTelemetry trace (Cloud Observability example)

## Agent Evaluation — 3 components
1. **Capabilities**
2. **Trajectory & Tool Use**
3. **Final Response**

### Public Benchmarks
- **BFCL** (Berkeley Function-Calling Leaderboard)
- **τ-bench** (Yao et al., arXiv:2406.12045)
- **PlanBench** (Valmeekam et al.)
- **AgentBench** (Liu et al., arXiv:2308.03688)
- **DABStep** (Adyen Data Analyst leaderboard)

### Trajectory Evaluation — 6 Ground-truth Metrics
1. **Exact match**
2. **In-order match** (No penalty for unnecessary actions)
3. **Any-order match** (Order independent + additions allowed)
4. **Precision** (Ratio of relevant calls among predicted calls)
5. **Recall** (Ratio of capturing essential calls)
6. **Single-tool use**

### Final Response Evaluation / HITL
- LLM autorater based on user-defined criteria
- HITL: Direct Assessment, Comparative Evaluation, User Studies

| Method | Pros | Cons |
|---|---|---|
| Human | Captures subtleties | Expensive and hard to scale |
| LLM-as-Judge | Scalability | Easy to miss intermediate steps |
| Automated Metrics | Objective | May miss capabilities, gameable |

## Multi-Agent Architectures
### Role Classification
Planner, Retriever, Execution, Evaluator Agent

### Design Patterns
| Pattern | Description |
|---|---|
| Sequential | Sequential pipeline |
| Hierarchical | Manager + Worker |
| Collaborative | Collaborative |
| Competitive | Competitive (e.g., Overcooked-AI) |

### Agent Components
- Interaction Wrapper
- **Memory Management**: working/cache/sessions + long-term episodes/skills/reference + reflection
- Cognitive Functionality (CoT, ReAct, planner, intent refinement)
- Tool Integration: Dynamic registry, **Tool RAG**
- Flow/Routing: delegation, handoff, agent-as-tool
- Feedback Loops / RL
- Agent Communication & Remote Agent Communication (Asynchronous durable task)
- Agent & Tool Registry mesh

### Unique Questions in Multi-Agent Evaluation
- Cooperation/Coordination
- Planning/Task Assignment (deviation from the main plan)
- Agent Utilization (as a tool vs delegation vs handoff)
- Scalability

## Agentic RAG
Improvements compared to static [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]]:
- Context-Aware Query Expansion
- Multi-Step Reasoning
- Adaptive Source Selection
- Validation/Correction by Evaluator agents

## Better Search Techniques
- **Vertex AI Layout Parser** (semantic chunking, handling complex tables and images)
- Metadata enrichment (synonyms, keywords, authors, tags)
- Fine-tuned embedding model or search adaptor
- Faster vector DB (**Vertex AI Vector Search**)
- Reranker (re-ranking dozens to hundreds of vector results)
- Check Grounding API (attributable claims / citeable phrases)

## Vertex AI Products
Vertex AI Search, Search Builder API, **RAG Engine** (LlamaIndex-style Python interface).

## Manager of Agents
- **Assistants**: Gems/GPTs, deep research agent
- **Automation agents**: Background event listeners
- Knowledge workers transforming into managers of agent fleets

## Google Agentspace
- No/low-code + full-code framework
- Unified multimodal search
- Pre-built connectors (Confluence, Drive, Jira, SharePoint, ServiceNow)
- RBAC, VPC SC, IAM
- **NotebookLM Enterprise**: TTS audio summary, prosody control
- **Agentspace Enterprise Plus**: Custom agents by business function

## From Agents to Contractors
A solution to the underspecification problem.

### Contract data model
- Task/Project Description (Required)
- Deliverables & Specifications (Required)
- Scope, Expected Cost (Required), Expected Duration (Required)
- Input Sources, Reporting and Feedback (Required)

### Iteration data model
underspecification, cost negotiation, risk, additional input needed

### Lifecycle
Definition → Negotiation → Execution. Co-Scientist/AlphaCode-style iteration. Task decomposition via Subcontract.

## Co-Scientist Case
"Generate, debate, evolve" multi-agent — Data Processing, Hypothesis Generators, Validation, Collaboration agent. Example: deriving hypotheses for liver fibrosis treatment.

## Automotive Multi-Agent Case Study
### Specialist Agents
- **Conversational Navigation Agent** (Google Places/Maps): "restaurants along the route to Munich"
- **Conversational Media Search Agent**: mood/weather-based playlists
- **Message Composition Agent**: SMS/WhatsApp/email — "20 minutes late for stand-up"
- **Car Manual Agent** (RAG): "turn off Volkswagen lane keeping"
- **General Knowledge Agent**: Salzburg information

### 5 Patterns
1. **Hierarchical**: Orchestrator routes intent (sushi → Navigation, weather → Weather agent)
2. **Diamond**: Specialist response → **Rephraser Agent** converts tone (technical tire pressure → conversational tone)
3. **Peer-to-Peer**: Handoff between specialists if Orchestrator misroutes
4. **Collaborative**: Multiple agents submit partial answers → **Response Mixer Agent** merges them based on confidence scores (e.g., aquaplaning scenario: Car Manual 71%, General Knowledge 65%, Safety Tips 94%)
5. **Adaptive Loop**: Iteratively refining search queries (vegan Italian → vegetarian Italian → Italian + plant-based filter)

### Advantages in the Automotive Environment
- Specialization, critical functions (climate, windows) on-device, non-urgent tasks in the cloud, resilience to connectivity loss

## Vertex AI Agent Builder
- Agent Engine (managed runtime, sessions, examples, trace, evals)
- Vertex AI Eval Service
- Tools: Vertex AI Search, RAG Engine, Gen AI Toolbox for Databases, Application Integrations (hundreds of APIs + ACL), Apigee Hub

## Key Takeaways
- Multi-agent patterns are categorized not as simple branching, but through 5 design languages: Hierarchical, Diamond, Peer-to-Peer (P2P), Collaborative, and Adaptive.
- The paradigm of "treating agents as contractors" systematically addresses underspecification.
- Trajectory evaluation can be quantified using 6 ground-truth matching metrics.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]] · [[en/AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/sources/22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)|Vertex AI]]
