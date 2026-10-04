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

### Techniques & Patterns

| Document | Content |
|------|------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Techniques\|Agent_Techniques]] | Category overview |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Anthropic_Workflow_Patterns\|Anthropic Workflow Patterns]] | 5 workflow patterns (chaining/routing/parallelization/orchestrator-workers/evaluator-optimizer) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Planning_and_Reflection\|Planning & Reflection]] | Plan-and-Solve, Reflexion (NeurIPS 2023) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Memory\|Agent Memory]] | Short/Long-term Memory, Memory ETL, Agent Runtime/Memory Bank |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination\|Multi-Agent Coordination]] | Coordination patterns, communication protocols, failure modes (MASFT/MAST/Groupthink) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols\|Agent Skills & Protocols]] | Anthropic Skills, MCP, Google A2A Protocol, AG-UI |

### Infrastructure & Operations

| Document | Content |
|------|------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Infrastructure\|Agent_Infrastructure]] | Category overview |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks\|Agent Frameworks]] | AutoGen v0.4, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Agno/Mastra |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment\|Agent Deployment]] | Agent Runtime, Memory Bank, Gateway, Registry, Identity, Simulation *(May 2026)* |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/AgentOps\|AgentOps]] | 3 Pillars methodology, agentops.ai platform, tool comparison (LangSmith/Langfuse/Braintrust, etc.) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench\|Eval-Driven Development & Agent Workbench]] | 3-stage evaluation layers, 7 Agent Workbench surfaces |

### Applications

| Document | Content |
|------|------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Agent_Applications\|Agent_Applications]] | Category overview |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents\|Coding Agents]] | Context files (AGENTS.md), spec-driven development, Plan→Edit→Verify loop, parallel worktrees, ACI |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Deep_Research_Agents\|Deep Research Agents]] | Planner/Researcher/Synthesizer structure, bounded sub-agents, citation verification, BrowseComp |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents\|Computer Use & Voice Agents]] | Claude/OpenAI CUA/Gemini computer use, Pipecat/LiveKit voice agents |
| [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous Systems]] | METR Time Horizon, STaR/AlphaEvolve/Darwin Gödel Machine, kill switch/HITL |

Agent Engineering is the **frontier of AI automation**. It builds systems that autonomously handle repetitive knowledge work (research, code writing, data analysis), serving as the "brain" of the AI Engineering stack.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Flow_Engineering|Flow Engineering]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment|Agent Deployment]]
