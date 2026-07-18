---
order: 7
---

# Agent Frameworks

## Overview

While [[en/AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Workflow Patterns]] provides criteria for "when a framework is needed," this document addresses "which framework to choose." Production-grade agent frameworks matured rapidly between 2024~2026. Each framework starts from a different design philosophy (state graphs, actor model, role crews, SDK-native).

## LangGraph — State Graph

Covered in detail in the [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] document. Explicitly defines nodes and edges based on StateGraph, with cyclic flow and durable execution (checkpoint-based resumption) as strengths. Deep integration with the LangChain ecosystem.

## LangChain Deep Agents — Agent Harness

If LangGraph is the low-level execution runtime, **Deep Agents** (`pip install deepagents`) is a "batteries-included agent harness" built on top of it. It provides planning, context management, sub-delegation, and safety mechanisms that each team previously had to implement themselves for long-horizon tasks.

```python
from deepagents import DeepAgent

agent = DeepAgent(
    model="claude-sonnet-4-6",
    system_prompt="Agent performing large-scale codebase refactoring",
)

# Structure tasks with write_todos → parallel delegation to subagents
result = await agent.run("Migrate the entire src/ directory to async/await patterns")
```

**4-layer architecture**:

| Layer | Role | Key features |
|-------|------|-------------|
| Execution Environment | Tool execution environment | MCP server integration, sandboxed code execution, type-safe event streaming |
| Context Management | Context optimization | Automatic summarization/offloading, AGENTS.md-based skill loading, prompt caching |
| Delegation | Sub-delegation | Task planning with `write_todos`, subagent spawning (independent context window) |
| Steering | Control/safety | Human-in-the-Loop interrupts, declarative filesystem access control |

**Relationship with LangGraph**: LangGraph = low-level graph runtime (maximum control over custom workflows), Deep Agents = opinionated harness layer for production agents (provides defaults, fast startup). Both layers coexist in the stack.

## AutoGen v0.4 — Actor Model

Developed by Microsoft Research. Completely redesigned in v0.4 based on the **Actor Model** — each agent is an independent actor that exchanges asynchronous messages.

```python
from autogen_core import SingleThreadedAgentRuntime, AgentId
from autogen_core.models import UserMessage

runtime = SingleThreadedAgentRuntime()

# Each agent is an independent actor — communicates only through message queues
await runtime.send_message(
    UserMessage(content="Write a market research report", source="user"),
    AgentId("researcher", "default"),
)
runtime.start()
```

**Features**:
- Fully asynchronous inter-actor communication — advantageous for large-scale multi-agent scaling
- Event-driven architecture scalable to distributed deployment (distributed runtime)
- Greatly improved code stability and type safety compared to v0.2

## CrewAI — Role-Based Crews and Flows

**Role-based** crew composition is the core metaphor. Each agent is given a Role, Goal, and Backstory, then grouped into a "Crew" for sequential or hierarchical execution.

```python
from crewai import Agent, Task, Crew, Process

researcher = Agent(
    role="Market Researcher",
    goal="Research latest competitor trends",
    backstory="10-year veteran market analyst",
)
writer = Agent(role="Report Writer", goal="Organize research findings into a report")

crew = Crew(
    agents=[researcher, writer],
    tasks=[Task(description="Analyze Competitor A", agent=researcher),
           Task(description="Write analysis report", agent=writer)],
    process=Process.sequential,
)
crew.kickoff()
```

**Flows** is CrewAI's deterministic orchestration layer that combines Crew (autonomous) + explicit control flow (deterministic) — corresponding to the middle point in the Workflow/Agent spectrum from [[en/AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Anthropic Workflow Patterns]].

## OpenAI Agents SDK — Handoffs, Guardrails, Tracing

A production-grade evolution of OpenAI's experimental Swarm framework. Three first-class concepts are central.

```python
from agents import Agent, handoff, Runner

billing_agent = Agent(name="Billing", instructions="Handle payment inquiries")
support_agent = Agent(
    name="Triage",
    instructions="Classify inquiries and route to appropriate agent",
    handoffs=[handoff(billing_agent)],
)

result = Runner.run_sync(support_agent, "How do I get a refund?")
```

**Core concepts**:
- **Handoffs**: One agent transfers full conversation control to another (unlike CrewAI's role division, conversation context transfers intact)
- **Guardrails**: Parallel check functions on inputs/outputs — stop execution when conditions are violated → [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]]
- **Tracing**: Built-in execution tracing — visualize directly in OpenAI dashboard

## Claude Agent SDK — Subagents and Session Store

A general-purpose SDK that exposes Claude Code's internal harness. Allows embedding the **same agent loop as Claude Code** (filesystem access, code execution, sub-agent delegation) into your own applications.

```python
from claude_agent_sdk import ClaudeAgent, Subagent

agent = ClaudeAgent(
    system_prompt="Agent performing code review",
    subagents=[
        Subagent(name="security-reviewer", description="Dedicated security vulnerability review"),
        Subagent(name="style-reviewer", description="Dedicated code style review"),
    ],
    session_store="./sessions",
)
```

**Features**:
- **Subagents**: Sub-agents delegated with separated context — don't contaminate the main agent's context window
- **Session Store**: File-based session storage — resume from exact point even if process dies
- Reusable "harness" design validated in Claude Code's real-world usage

## Agno and Mastra — Production Runtimes

**Agno** (formerly Phidata) is Python-based with very low instantiation overhead (~microsecond level) and built-in memory, knowledge bases, and multimodal support. Specialized for lightweight production deployment.

**Mastra** is a TypeScript/Node.js framework with deep Vercel AI SDK integration that handles workflow graphs + agents + RAG in a single TS codebase. A natural choice for fullstack JS teams.

## Framework Selection Guide

| Framework | Core metaphor | Strengths | Best fit |
|-----------|--------------|---------|---------|
| LangGraph | State graph | Durable execution, cyclic flow | Complex conditional branching, checkpoint needed |
| Deep Agents | Agent harness | Long-task planning, subagent spawning, context offloading | Fast production agent building on LangGraph |
| AutoGen v0.4 | Actor model | Async scalability, distributed deployment | Large-scale multi-agent, event-driven systems |
| CrewAI | Role crews | Fast prototyping, intuitive role division | Tasks clearly divisible (research→write→review) |
| OpenAI Agents SDK | Handoff | Built-in Guardrails/Tracing | OpenAI ecosystem, customer support branching |
| Claude Agent SDK | Subagent + Session | Reuse Claude Code harness | Coding agents, long session resumption |
| Agno | Lightweight runtime | Low overhead, multimodal | Latency-sensitive production deployment |
| Mastra | TS workflow | JS/TS ecosystem integration | Fullstack Node.js teams |

## Agent Framework Tradeoffs

Introducing frameworks is not free. As [[en/AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Anthropic Workflow Patterns]] points out, frameworks hide prompts and control flow behind additional layers.

```
Framework adoption costs:
  - Increased debugging difficulty (must understand framework internals)
  - API change risk with every version upgrade
  - Vendor/ecosystem lock-in

Framework adoption benefits:
  - No need to implement durable state, checkpoints, retry logic yourself
  - Observability integration often included by default
  - Team standardization — multiple engineers working with same patterns
```

**Practical recommendation**: First implement Anthropic Workflow Patterns' 5 patterns directly with API calls, and only migrate to a framework with the relevant strengths when actual gaps appear in state management, concurrency, or role division.

## Role in AI Engineering

Agent Frameworks represent the shift from "language of agent design" to "products." Framework selection should be an implementation detail made after architecture and workflow pattern decisions, not the other way around.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Anthropic Workflow Patterns]] · [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] · [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]]

## Sources
- Microsoft Research "AutoGen v0.4: A New Foundation" — [microsoft.com/research](https://www.microsoft.com/en-us/research/blog/autogen-v0-4-reimagining-the-foundation-agentic-ai-frameworks/)
- CrewAI official documentation — [docs.crewai.com](https://docs.crewai.com)
- OpenAI "New tools for building agents" — [openai.com](https://openai.com/index/new-tools-for-building-agents/)
- OpenAI Agents SDK docs — [openai.github.io/openai-agents-python](https://openai.github.io/openai-agents-python/)
- Anthropic "Claude Agent SDK" — [docs.claude.com](https://docs.claude.com/en/api/agent-sdk/overview)
- Agno official documentation — [docs.agno.com](https://docs.agno.com)
- Mastra official documentation — [mastra.ai/docs](https://mastra.ai/docs)
