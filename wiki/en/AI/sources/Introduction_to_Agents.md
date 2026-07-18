# Introduction to Agents

## Metadata
- **File Name**: `Introduction to Agents.pdf`
- **Source (URL)**: https://www.kaggle.com/whitepaper-introduction-to-agents
- **Authors**: Alan Blount, Antonio Gulli, Shubham Saboo, Michael Zimmermann, Vladimir Vuskovic et al.
- **Published**: First published November 2025 → **Updated May 2026** (Google/Kaggle Series)
- **Topic**: Introduction to autonomous AI [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] — architecture, taxonomy, ops, security, interoperability, self-evolution

## Summary
This document traces the evolution of [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] using LMs (Language Models) as the brain, moving from predictive AI to autonomous systems. It covers the overall architecture, operations, security, and interoperability required to build production-grade agents. Highlighting the shift in the developer's role from a "bricklayer" to a "director," it formally introduces [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] as the successor to "Prompt Engineering."

## Core Definitions
- **Agent = Model + Tools + Orchestration Layer + Runtime Services**, i.e., "a system where an LM equipped with tools pursues goals within a loop."
- "An agent is a system dedicated to the art of context window curation." — The developer is a director who casts the tools, sets the scene, and provides context.

## Agentic Problem-Solving Process (5 Steps)
1. **Get the Mission** — Receive user intent/goals
2. **Scan the Scene** — Scan available tools, memory, and session states
3. **Think It Through** — Plan/Reason ([[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]])
4. **Take Action** — Call tools ([[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]])
5. **Observe and Iterate** — Observe the outcome and plan again
   - Example: "Where is my order #12345?" → `find_order("12345")` → `get_shipping_status("ZYX987")` → final answer

## Agent Taxonomy (Levels 0–4)
- **Level 0 — Core Reasoning System**: Standalone LM without tools, no real-time awareness.
- **Level 1 — Connected Problem-Solver**: Connected to tools like Google Search or RAG.
- **Level 2 — Strategic Problem-Solver**: Multi-step planning + Context Engineering. Example: "Find a cafe midway between the Mountain View office and the SF client."
- **Level 3 — Collaborative Multi-Agent System**: A Project Manager agent delegates tasks to `MarketResearchAgent`, `MarketingAgent`, and `WebDevAgent`.
- **Level 4 — Self-Evolving System**: Dynamically creates new agents/tools using an `AgentCreator` tool (e.g., creating a `SentimentAnalysisAgent` on the fly).

## Key Components
- **Model — The "Brain"**: Evaluated on business outcomes, not just benchmarks. "Team of specialists" pattern (e.g., Gemini 3.2 Pro for planning + Gemini 3.2 Flash for routing, or open models like Gemma 4). Gemini Live, Cloud Vision API, and Speech-to-Text are mentioned.
- **Tools — The "Hands"**: 3 types — Information Retrieval (RAG, Vector DB, Knowledge Graph, NL2SQL), Action Execution (API wrapping, sandboxed code execution, HITL tools like `ask_for_confirmation()` or `ask_for_date_input()`), and Function Calling (OpenAPI, MCP, Gemini native Google Search).
- **Orchestration Layer — The "Nervous System"**: Think–Act–Observe loop. Spectrum between deterministic workflows and LM-driven execution. Code-first frameworks like Google's **ADK (Agent Development Kit)** vs. no-code builders.
- **Deployment — The "Body and Legs"** *(Added May 2026)*: Moving away from local builds to deployment on always-on servers. The service scope covers session history, memory persistence, security, and compliance. Using the newly released **Gemini Enterprise Agent Platform**, you can handle Build, Scale, Govern, and Optimize on a single platform: **Agent Studio** (seamless transition from prompt to deployment), **Agent Runtime** (sub-second cold start, multi-day workflows), and **Memory Bank** (long-term context across sessions). Container deployment via Cloud Run/GKE is also supported.
- **Memory ([[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]])**: Short-term = stores (Action, Observation) pairs as states/artifacts/sessions/threads. Long-term = persists across sessions based on vector DB or search engine-based RAG.

## Multi-Agent Patterns
- **Coordinator** (Manager routes subtasks)
- **Sequential** (Digital assembly line)
- **Iterative Refinement** (Generator + Critic)
- **Human-in-the-Loop** (Deliberate approval step)

## Agent Ops — 5 Core Principles
1. **Measure What Matters** — Business KPIs such as goal completion rate, CSAT, latency, cost per interaction, and conversion.
2. **Quality via LM Judge** — Evaluation using LM-as-Judge against a golden dataset.
3. **Metrics-Driven Development** — Compare production vs. new versions via automated evaluation to make Go/No-Go decisions.
4. **Debug with OpenTelemetry traces** — Full trace of prompt → reasoning → tool params → observation.
5. **Cherish Human Feedback** — Absorb thumbs-down cases as permanent evaluation test cases.

## Interoperability
- **Agents ↔ Humans**: Chatbots → structured JSON → MCP UI / AG UI / A2UI (dynamic UI). Gemini Live API for bidirectional camera and microphone streaming.
- **Agents ↔ Agents**: **A2A (Agent-to-Agent) protocol** + **Agent Card** (JSON business cards broadcasting capabilities and security credentials). Asynchronous, task-oriented architecture.
- **Agents ↔ Money**: **AP2 (Agent Payments Protocol)** — cryptographic signature mandate. **x402** — HTTP 402 for micropayments.

## Security
- The trust trade-off between utility and power.
- Hybrid multi-layered defense: Deterministic guardrails (e.g., blocking payments over $100) + reasoning-based defense (adversarial training, small "guard models").
- **Agent Identity**: Agent as a third principal alongside users (OAuth/SSO) and service accounts (IAM) — based on **SPIFFE**. *(Strengthened May 2026)* Gemini Enterprise Agent Platform natively enforces Agent Identity — issuing unique cryptographic IDs to all agents, providing a complete audit trail integrated with enterprise authorization policies.
- ADK Security: Parameter inspection via `before_tool_callback`, "Gemini as Judge" pattern (screening prompt injection using Flash-Lite or fine-tuned Gemma), and **Model Armor** managed defense against PII leaks, jailbreaks, and malicious URLs.
- *(Added May 2026)* **Agent Gateway**: The central control point within the Gemini Enterprise Agent Platform for all agentic traffic (user-to-agent UI, agent-to-tool MCP, agent-to-agent A2A, direct LM calls). Natively enforces Model Armor protection.

## Enterprise Scaling
- "Agent sprawl" issue → **Agent Gateway** centralizes user-agent prompts, agent-tool (MCP) traffic, agent-agent (A2A) calls, and direct LM requests. *(May 2026: Agent Gateway is designated as an official component of the Gemini Enterprise Agent Platform)*
- Dual functions: Runtime Policy Enforcement + Centralized Governance (central registry, internal "agent app store").
- *(Added May 2026)* **Agent Registry**: A central library indexing all internal agents, tools, and skills (reusable coded workflows). Manages pre-security reviews, versioning, and team-based access control lifecycles.
- Cost & Reliability: Provisioned Throughput, Cloud Run 99.9% SLA, scale-to-zero.

## Self-Evolution
- Learning Sources: Runtime Experience (logs, traces, memory, HITL feedback) + External Signals (new documentation/regulations).
- Adaptation Modes: Enhanced Context Engineering, Tool Optimization/Creation. RLHF is mentioned as a research area.
- **Compliance 4-agent workflow**: Querying → Reporting → Critiquing (holding compliance guidelines) → Learning Agent generalizes HITL feedback into global rules.
- **Agent Gym (MLGym)**: An off-ops simulation platform. Generates synthetic data, supports red-teaming, dynamic evaluation, critic agent swarms, tool absorption via MCP/A2A, and domain-expert consultations.

## Advanced Agents
- **Co-Scientist**: A "generate, debate, evolve" scientific methodology leveraging a supervisor + swarm of specialist agents.
- **AlphaEvolve**: An evolutionary process combining Gemini code generation with automated evaluators. Contributed to Google datacenter efficiency, chip design, and matrix multiplication acceleration.

## Key Takeaways
- Agent is not just a chatbot, but a system equipped with tools, memory, and orchestration.
- Developer work has shifted from "prompt engineering" to "[[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]]."
- The combination of **multi-agent + HITL** becomes the default for production rather than a single agent.
- Security, identity, and gateway are not optional, but essential infrastructure.
- *(Added May 2026)* Deployment is the 4th key component — making local agents into always-on services completes the architecture. The Gemini Enterprise Agent Platform delivers this in a unified platform.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]
