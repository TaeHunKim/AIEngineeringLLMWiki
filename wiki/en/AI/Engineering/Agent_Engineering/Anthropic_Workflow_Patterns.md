---
order: 3
---

# Anthropic's Workflow Patterns

## Overview

In December 2024's "Building Effective Agents," Anthropic's Schluntz and Zhang made a clear distinction between **Workflow** and **Agent**. The piece emerged from a reflection on the industry tendency to introduce multi-agent frameworks for problems that a single function call would solve. The principle is simple: **start simple, add complexity only when needed**.

## Workflow vs Agent

```
Workflow:
  LLMs and tools orchestrated through "predefined code paths"
  → Engineers own the graph (execution flow)

Agent:
  LLM dynamically decides tool use and next steps on its own
  → Model owns the graph
```

Both have their place. Workflows are cheaper, faster, and easier to debug. Agents can solve open-ended problems but are harder to reason about for failure modes.

## Augmented LLM

The building block for all five patterns: a single LLM combined with Retrieval, Tools, and Memory. Every API call can leverage all three.

## 5 Workflow Patterns

### 1. Prompt Chaining

Output of call 1 becomes input of call 2. Use when a task can be decomposed into clear linear steps. Programmatic validation gates can be inserted between steps.

```python
def prompt_chain(input_text: str, steps: list[callable]) -> str:
    result = input_text
    for step in steps:
        result = step(result)          # previous output → next input
        if not passes_gate(result):    # optional programmatic gate
            return "Halted: validation failed"
    return result

# Example: draft blog → fact check → tone adjustment → final formatting
pipeline = [draft_outline, fact_check, adjust_tone, final_format]
```

### 2. Routing

A classifier LLM evaluates the input and delegates to the appropriate sub-LLM or tool. Use when clearly different categories of input require different handling (Tier 1 customer support vs refund vs bug report vs sales inquiry).

### 3. Parallelization

Run N LLM calls simultaneously and aggregate results. Two forms:
- **Sectioning**: Process different pieces in parallel, then combine
- **Voting**: Run the same prompt N times, then take majority/synthesis

### 4. Orchestrator-Workers

An orchestrator LLM dynamically decides which workers (also LLMs) to run and synthesizes the results. Similar to an agent loop but the orchestrator doesn't repeat indefinitely. Detailed architecture comparison → [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]]

### 5. Evaluator-Optimizer

One LLM proposes an answer, another evaluates it. Repeats until the evaluator passes it. A generalization of the Self-Refine pattern from [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]].

```python
def evaluator_optimizer(task: str, proposer, evaluator, max_iter: int = 5) -> str:
    proposal = proposer(task)
    for _ in range(max_iter):
        verdict = evaluator(proposal)
        if verdict.passed:
            return proposal
        proposal = proposer(task, feedback=verdict.feedback)
    return proposal  # max iterations reached
```

## 5 Patterns Summary

| Pattern | When to use | LLM call form |
|---------|-------------|---------------|
| Prompt Chaining | Clear linear steps | Sequential |
| Routing | Categorically different inputs | Classification → branch |
| Parallelization | Independent subtasks | Parallel N calls |
| Orchestrator-Workers | Dynamic task distribution | Orchestrator + workers |
| Evaluator-Optimizer | Output needing iterative improvement | Propose ↔ evaluate loop |

## When Workflow Beats Agent

- **Predictable tasks**: If you can enumerate the steps in advance, do so
- **Cost-bounded tasks**: Workflows have a finite number of steps, but agents can spiral indefinitely
- **Compliance-critical tasks**: Auditors want to read the graph directly rather than reason about execution traces

## When Agent Beats Workflow

- **Open-ended research**: When the next step depends on the results of the previous one
- **Variable-length tasks**: Work that may take minutes to hours
- **New domains**: When you don't yet know the correct workflow — explore first, codify later

## When to Introduce Frameworks

Anthropic's conclusion is clear: **direct API calls are sufficient for most work.** Frameworks are only introduced when patterns truly require:
- Durable state → LangGraph ([[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]])
- Actor-model-based concurrency → AutoGen v0.4
- Role templating → CrewAI
- Claude Code harness-style pattern → Claude Agent SDK

Detailed framework comparison → [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent Frameworks]]

## Role in AI Engineering

Anthropic's 5 workflow patterns are the most frequently cited "vocabulary" in agent design. Before introducing complex multi-agent frameworks, checking whether these 5 patterns alone can solve the problem is becoming the industry standard. While Agent Architectures addresses "who executes," Workflow Patterns addresses "in what order to combine LLM calls."

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] · [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] · [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent Frameworks]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] · [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]]

## Sources
- Schluntz, E. & Zhang, B. (Anthropic, 2024) "Building Effective Agents" — [anthropic.com](https://www.anthropic.com/research/building-effective-agents)
- Anthropic "Effective context engineering for AI agents" (2025) — [anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
