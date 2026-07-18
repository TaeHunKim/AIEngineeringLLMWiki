# Prototype to Production

## Metadata
- **File Name**: Prototype to Production.pdf
- **Author**: Sokratis Kartakis, Gabriela Hernandez Larios, Ran Li, Elia Secchi, Huang Xia (Google)
- **Publication Date**: First published November 2025 → **Updated May 2026**
- **Topic**: AgentOps methodology for transitioning AI Agents from prototype to production — [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]], [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]], [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]], [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]], [[en/AI/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]
- **Source (URL)**: https://www.kaggle.com/whitepaper-prototype-to-production

## Summary
"Building an agent is easy. Trusting it is hard." This document addresses the "last mile" problem, where 80% of the effort in transitioning an agent prototype to a production system is spent on infrastructure, security, and evaluation rather than the core intelligence. The solution is the **AgentOps** discipline based on the **3 Pillars (automated evaluation + CI/CD + comprehensive observability)**, which ultimately leads to establishing a multi-agent ecosystem through the A2A protocol.

---

## 1. Last Mile Production Gap

Real-world business failures that occur without production deployment best practices:
- Missing Guardrails → Customer service agent offering products for free
- Misconfigured authentication → Access allowed to confidential internal databases
- Absence of monitoring → Massive cost charges incurred over the weekend
- Lack of continuous evaluation → An agent that worked perfectly yesterday suddenly stopping

**Unique operational challenges of agents**:
- **Dynamic Tool Orchestration**: Different tool selection paths every time → requires robust versioning, access control, and observability
- **Scalable State Management**: Maintaining memory across sessions → secure and consistent external state management
- **Unpredictable Cost & Latency**: Diverse execution paths → cost control is impossible without smart budgeting and caching

---

## 2. People & Process

**Traditional MLOps Teams**:
- Cloud Platform Team (architecture, security, access control)
- Data Engineering Team (pipeline, data quality)
- Data Science & MLOps Team (model experimentation, automation pipeline)
- ML Governance (compliance, transparency, accountability)

**Additional Generative AI Roles**:
- **Prompt Engineers**: Mix of domain expertise and prompt engineering skills — defining precise questions and expected answers
- **AI Engineers**: Building robust backends including evaluation at scale, guardrails, and RAG/tool integration
- **DevOps/App Developers**: Frontend and user interfaces integrated with the Generative AI backend

---

## 3. Pre-Production: Evaluation-Gated Deployment

### Evaluation as a Quality Gate
Traditional software unit testing is insufficient — agents require evaluation of not only the final response but also the **entire reasoning trajectory**. Even if 100 tool unit tests pass, incorrect tool selection or hallucination can still occur.

**Two implementation approaches**:
1. **Manual "Pre-PR" Evaluation**: AI Engineer/Prompt Engineer runs local evaluations before creating a PR → attaches the performance report to the PR description → reviews both code changes and changes in agent behavior
2. **Automated In-Pipeline Gate**: Integrates the evaluation harness directly into CI/CD → automatically blocks deployment if metrics fall short (e.g., "tool call success rate" or "helpfulness" against a golden dataset)

### 3-Phase CI/CD Pipeline (Funnel Structure)

```
Phase 1: Pre-Merge CI
  ├── Unit test, linting, dependency scan
  └── Agent quality evaluation suite → prevents main branch contamination

Phase 2: Post-Merge CD (Staging)
  ├── Load test, integration test
  └── Internal dogfooding (real user experience)

Phase 3: Gated Production Deployment
  ├── Product Owner final approval (human-in-the-loop)
  └── Promotion of the identical artifact validated in Staging to Production
```

**Infrastructure Automation**:
- **IaC (Terraform)**: Code-defined environments → identical and reproducible environments
- **Automated Testing Frameworks (Pytest)**: Handles conversation history, tool invocation logs, and dynamic reasoning traces
- **Secrets Manager**: API key injection at runtime (never hardcode in the codebase)

### 4 Safe Rollout Strategies
| Strategy | Method | Advantages |
|------|------|------|
| **Canary** | Start with 1% of users, gradually expand | Immediate rollback possible |
| **Blue-Green** | Two identical production environments, switch traffic | Zero downtime |
| **A/B Testing** | Compare versions based on actual business metrics | Data-driven decision making |
| **Feature Flags** | Dynamically control release after code deployment | Selective user testing |

**Prerequisite for all strategies**: **Rigorous versioning** of code, prompts, model endpoints, tool schemas, memory structures, and evaluation datasets → immediate rollback in case of issues (the "production undo button").

### 3-Layer Security Framework
Unique agent security risks:
- **Prompt Injection & Rogue Actions**: Malicious users bypassing restrictions
- **Data Leakage**: Leakage of sensitive information through responses or tool use
- **Memory Poisoning**: Harmful memory updates contaminating all future interactions

**3 Layers of Defense**:
1. **Policy Definition & System Instructions (The Agent's Constitution)**: Defines policies for desired/undesired behaviors → engineered into System Instructions
2. **Guardrails, Safeguards, Filtering (Enforcement Layer)**:
   - Input Filtering: Blocks malicious inputs using classifiers and the Perspective API
   - Output Filtering: Inspects responses for PII, toxicity, and policy violations using Vertex AI's built-in safety filters
   - Human-in-the-Loop (HITL): Human review and approval for high-risk or ambiguous actions
3. **Continuous Assurance & Testing**: RAI testing (NPOV, Parity evaluations), Proactive Red Teaming

---

## 4. Operations In-Production: Observe → Act → Evolve

### Observe: The Agent's Sensory System
Three pillars of observation:
- **Logs**: Detailed record of all tool calls, errors, and decisions (what happened)
- **Traces**: Linking causal pathways (why an agent took a certain action)
- **Metrics**: Aggregated report card of performance, cost, and operational health (how well the system performs)

Google Cloud Implementation: Cloud Trace (linking all steps with unique IDs) + Cloud Logging + Cloud Monitoring + built-in Cloud Trace integration in ADK

### Act: Operational Control Levers

**System Health Management (Performance, Cost, Scale)**:
- **Horizontal Scaling**: Stateless containerized agents + external state → auto-scaling with Cloud Run or Agent Engine
- **Async Processing**: Offloading long-running tasks to Pub/Sub events
- **Externalized State**: Vertex AI Agent Engine (built-in session and memory) or AlloyDB/Cloud SQL
- **Latency-Reliability-Cost Balance**: Parallel processing + caching / exponential backoff retry + idempotent tool design / short prompts + batching

**Security Response Playbook** (upon threat detection):
1. **Contain**: Immediately disable the affected tool using a circuit breaker (feature flag)
2. **Triage**: Route suspicious requests to a HITL review queue
3. **Resolve**: Deploy patches (updated input filter or system prompt) through the CI/CD pipeline

### Evolve: Learning from Production
**Evolution Workflow**:
1. Analyze user behavior, success rates, and security incident patterns from production logs
2. Add production failure cases → evaluation dataset (golden dataset)
3. Improve prompts, add tools, and update guardrails → commit to CI/CD pipeline

**Real-world Example**: Retail agent logs showed that 15% of users experienced errors when requesting "similar products" → added a new failure test case → improved prompt + added robust tool → canary deployment → **resolved within 48 hours**.

**Security Feedback Loop**: Observe (new prompt injection detected) → Act (containment) → Evolve (add to evaluation dataset + improve guardrails + CI/CD deployment) = a virtuous cycle where the agent becomes stronger with every production incident

---

## 5. A2A — Agent-to-Agent Interoperability

### Role Differentiation: MCP vs. A2A
| | MCP | A2A |
|---|-----|-----|
| **Target** | Tools and resources | Other agents |
| **Interaction** | Stateless functions (weather lookup, DB query) | Stateful complex goal achievement |
| **Messages** | "Do this" | "Achieve this complex goal" |
| **Governance** | Anthropic (open standard) | ~~Google~~ → **Linux Foundation** (open standard) *(changed May 2026)* |

### A2A Protocol Implementation

**Agent Cards** — Agent business card (JSON standard specification):
```json
{
  "name": "check_prime_agent",
  "version": "1.0.0",
  "description": "Prime checking agent",
  "capabilities": {},
  "securitySchemes": {"agent_oauth_2_0": {"type": "oauth2"}},
  "skills": [{"id": "prime_checking", "tags": ["mathematical"]}],
  "url": "http://localhost:8001/a2a/check_prime_agent"
}
```

**Exposing as A2A with ADK**:
```python
from google.adk.a2a.utils.agent_to_a2a import to_a2a
# Convert existing agent to A2A compatible
a2a_app = to_a2a(root_agent, port=8001)
```

**Hierarchical Agent Configuration** (Mixed A2A + local sub-agent):
```python
# Local sub-agent (rolling dice)
roll_agent = Agent(name="roll_agent", ...)
# Remote A2A agent (checking prime)
prime_agent = RemoteA2aAgent(
    name="prime_agent",
    agent_card="http://localhost:8001/.well-known/agent-card.json"
)
# Root orchestrator
root_agent = Agent(sub_agents=[roll_agent, prime_agent])
```

**Car Repair Shop Analogy (A2A + MCP Collaboration)**:
1. Customer (User) → Shop Manager (A2A): "There's a rattling sound in my car"
2. Shop Manager → Mechanic (A2A): Delegate diagnosis task
3. Mechanic → Diagnosis tools (MCP): Call `scan_vehicle_for_error_codes()`, `get_repair_procedure()`, and `raise_platform()`
4. Mechanic → Parts Supplier (A2A): Check parts availability and place order

### Registry Architecture
- **Tool Registry**: 50 tools can be configured manually → 5,000 tools require a centralized catalog
  - Patterns: Generalist (full catalog) / Specialist (predefined subset) / Dynamic (runtime query)
- **Agent Registry**: In Agent Cards format, for agent discovery and reuse across teams. *(Added May 2026)* Gemini Enterprise Agent Platform provides a **native Agent Registry**: a centralized catalog to track and manage all agents, tools, and MCP servers across the organization. It integrates with **Agent Identity** (unique cryptographic IDs for each agent) to support out-of-the-box governance and access control.
- **Principle**: Build only when needed (when scale becomes a bottleneck). A Tool Registry is needed when tool discovery becomes a bottleneck or when centralized security auditing is required. Agent Registry is needed when discovering and reusing specialized agents across different teams is required.

---

## 6. The Overall AgentOps Lifecycle

```
Developer Inner Loop (local testing and prototyping)
       ↓
Pre-Production Engine (evaluation gate → CI/CD automated validation)
       ↓
Safe Rollout (Canary/Blue-Green/A-B/Feature Flags)
       ↓
Production (observability-driven operations)
       ↓
Evolution Loop (production insights → next improvement cycle)
```

---

## Key Takeaways
- **80% rule**: 80% of the cost of transitioning to production is spent on infrastructure, security, and evaluation rather than the agent's core intelligence
- **Evaluation-Gated Deployment**: No agent version can reach production without passing comprehensive evaluation
- **Observe → Act → Evolve**: Moving beyond static monitoring to turn production incidents into fuel for strengthening the agent
- **A2A + MCP Layers**: MCP is for tool integration, while A2A is for collaboration between agents — complementary and at different levels of abstraction
- **Version everything**: Code, prompts, models, tool schemas, memory, and evaluation datasets — this is the production "undo button"

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]] · [[en/AI/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/sources/22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)|Vertex AI]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[en/AI/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]]
