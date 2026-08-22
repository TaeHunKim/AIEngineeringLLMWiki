---
order: 0
nav_order: 50
---

# Flow Engineering

## Overview

**Flow Engineering** is the architecture design skill of **connecting multiple LLM calls, tool executions, and data transformations into a pipeline** to complete complex tasks. It answers "how to compose things that a single LLM call cannot solve."

## Two Flow Types

```mermaid
flowchart LR
    subgraph linear["Linear Flow"]
        A1[Load docs] --> B1[Chunk] --> C1[Embed] --> D1[Retrieve] --> E1[Answer]
    end
    subgraph graph["Graph Flow"]
        A2[Analyze] --> B2[Execute tool]
        B2 --> C2{Evaluate result}
        C2 -->|Retry| A2
        C2 -->|Done| D2[Complete]
    end
```

## Sub-documents

| Document | Content |
|----------|---------|
| [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Linear_Flow\|Linear Flow]] | Sequential pipeline overview |
| [[en/AI/Engineering/Flow_Engineering/Linear_Flow/LangChain\|LangChain]] | LCEL pipeline (Harrison Chase, 2022) |
| [[en/AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex\|LlamaIndex]] | Indexing-query pipeline (Jerry Liu, 2022) |
| [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling\|Tool Use & Function Calling]] | OpenAI/Anthropic Function Calling |
| [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Graph_Flow\|Graph Flow]] | Cyclic graph flow overview |
| [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph\|LangGraph]] | StateGraph agents (LangChain AI, 2024) |
| [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows\|Cyclic Flows]] | Evaluate-and-Retry, Self-Correction |
| [[en/AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern\|ReAct Pattern]] | Thought-Action-Observation (Yao, 2022) |
| [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop\|Human-in-the-Loop]] | Human intervention points — Breakpoints, Time Travel |

## Technology Selection Criteria

```mermaid
flowchart TD
    T{Task type} -->|Simple RAG QA| LC[LangChain LCEL chain]
    T -->|Document indexing pipeline| LI[LlamaIndex]
    T -->|Agent + tool use| LG[LangGraph]
    T -->|Quality validation loop| CF[Cyclic Flows]
    T -->|Human approval needed| HITL[HITL pattern]
    T -->|.NET/Microsoft ecosystem| MAF[Microsoft Agent Framework]
```

**Microsoft Agent Framework 1.0** (GA 2026-04-03) unified the previously separate **Semantic Kernel** (enterprise state management, type safety) and **AutoGen** (multi-agent orchestration) into a single .NET+Python SDK — with native MCP and A2A support from 1.0. AutoGen and Semantic Kernel have both moved to maintenance mode. It's considered a LangGraph alternative for .NET/Azure-centric organizations. See [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent_Engineering/Agent_Frameworks]] for a detailed framework comparison.

## Role in AI Engineering

Flow Engineering is the **layer that solves tasks impossible for a single LLM call by building a system around it**. It overcomes the limitations of single model calls (context length, step-by-step reasoning) through pipelines, and serves as the direct foundation for Agent Engineering.

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]]
