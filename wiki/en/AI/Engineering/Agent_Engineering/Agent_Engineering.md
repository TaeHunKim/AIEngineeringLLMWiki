---
order: 0
nav_order: 60
---

# Agent Engineering

## Overview

**Agent Engineering** is the discipline of designing LLMs not as mere text generators, but as **systems that autonomously pursue goals**. Per Lilian Weng's (OpenAI, 2023) definition, agents rest on three pillars — Planning, Memory, and Tools — with **Deployment** added as the fourth core element in the May 2026 update.

```mermaid
flowchart LR
    subgraph simple["Simple LLM — single call"]
        Q[Question] --> A[Answer]
    end
    subgraph agent["LLM Agent"]
        G[Goal] --> P[Plan] --> T[Tool execution] --> O[Observation] --> RP[Re-plan]
        RP -->|repeat| T
        RP --> DA[Goal achieved]
    end
    DEPLOY["Deployment infrastructure<br/>sustains the entire cycle in production"] -.-> agent
```

## Sub-documents

Agent design knowledge splits into four groups. **Techniques & Patterns** are building blocks reusable across any agent; **Infrastructure & Operations** is the foundation for building, deploying, and observing agents; **Applications** are system types where both come together in a specific domain.

### Foundations

| Document | Content |
|------|------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Core_Pillars\|Agent Core Pillars]] | Planning/Memory/Tools/**Deployment** 4 pillars (Weng 2023 + May 2026) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Architectures\|Agent Architectures]] | Single/Orchestrator/Router/Multi-Agent/**Long-running** |

### Techniques/Patterns

| Document | Content |
|------|------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Techniques\|Agent_Techniques]] | Category Overview |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Anthropic_Workflow_Patterns\|Anthropic_Workflow_Patterns]] | 5 Workflow Patterns (chaining/routing/parallelization/orchestrator-workers/evaluator-optimizer) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Planning_and_Reflection\|Planning_and_Reflection]] | Plan-and-Solve, Reflexion (NeurIPS 2023) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Memory\|Agent_Memory]] | Memory Extraction/Update/Conflict/Deletion lifecycle, provenance and user isolation |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination\|Multi_Agent_Coordination]] | Coordination Patterns, Communication Protocols, Failure Modes (MASFT/MAST/Groupthink) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols\|Agent_Skills_and_Protocols]] | Anthropic Skills, MCP, Google A2A Protocol, AG-UI |

### Infrastructure & Operations

| Document | Content |
|------|------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Infrastructure\|Agent_Infrastructure]] | Category overview |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks\|Agent Frameworks]] | AutoGen v0.4, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Agno/Mastra |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment\|Agent Deployment]] | Agent Runtime, Memory Bank, Gateway, Registry, Identity & authorization (JIT, NIST NCCoE), Simulation *(May 2026)* |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/AgentOps\|AgentOps]] | 3 Pillars methodology, agentops.ai platform, tool comparison (LangSmith/Langfuse/Braintrust, etc.) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench\|Eval-Driven Development & Agent Workbench]] | 3-stage evaluation layers, 7 Agent Workbench surfaces |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Sandboxes\|Agent Sandboxes]] | Isolation spectrum (container/gVisor/microVM), E2B and Kubernetes agent-sandbox, egress control, credential-injection proxy *(2026-10)* |

### Applications

| Document | Content |
|------|------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Agent_Applications\|Agent_Applications]] | Category overview |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents\|Coding Agents]] | Context files (AGENTS.md), spec-driven development, Plan→Edit→Verify loop, parallel worktrees, ACI |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Deep_Research_Agents\|Deep Research Agents]] | Planner/Researcher/Synthesizer structure, bounded sub-agents, citation verification, BrowseComp |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents\|Computer Use & Voice Agents]] | Claude/OpenAI CUA/Gemini computer use, Pipecat/LiveKit voice agents |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous Systems]] | METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, kill switch/HITL, stop/interrupt compliance |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Background_Agents\|Background Agents]] | Delegated, parallel, and proactive agents; triggers, approval gates, notifications; GPT-6 Pro parallel agents, Claude Duet *(2026-10)* |

## When to Use an Agent

```mermaid
flowchart LR
    subgraph no["Agent not needed"]
        N1["Simple Q&A<br/>RAG is enough"]
        N2["Fixed transformation task<br/>Linear Flow is enough"]
    end
    subgraph yes["Agent needed"]
        Y1["Multiple steps until task completion"]
        Y2["Dynamically decide when to use tools"]
        Y3["Revise the plan based on intermediate results"]
        Y4["Integrate multiple systems<br/>code execution, search, email, etc."]
    end
```

## Complexity vs Reliability Trade-off

```mermaid
flowchart LR
    subgraph reliability["Higher reliability →"]
        LF1[Linear Flow] --> SA1[Single Agent] --> MA1[Multi-Agent]
    end
    subgraph capability["Stronger capability →"]
        MA2[Multi-Agent] --> SA2[Single Agent] --> LF2[Linear Flow]
    end
    reliability & capability --> RULE["Choose the minimum complexity you need"]
```

## Role in AI Engineering

Agent Engineering is the **frontier of AI automation**. It builds systems that autonomously handle repetitive knowledge work (research, code writing, data analysis), serving as the "brain" of the AI Engineering stack.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Flow_Engineering|Flow Engineering]] · [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Harness_Engineering/Harness_Safety/Guardrail_Engineering]] · [[en/AI/Engineering/Loop_Engineering/Data_Flywheel|Loop_Engineering/Data_Flywheel]] · [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment|Agent Deployment]]
