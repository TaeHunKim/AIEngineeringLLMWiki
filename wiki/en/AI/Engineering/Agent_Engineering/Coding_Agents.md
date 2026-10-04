---
order: 14
---

# Coding Agents

## Overview

A **Coding Agent** reads a codebase, edits files, and runs tests and builds in a shell to carry out software tasks autonomously (Claude Code, Codex, Cursor Agent, OpenHands [1], Devin, and others). Starting from autocomplete, it has evolved into a **teammate that takes on long, independent work** in the terminal, IDE, and cloud. Code also has **immediate, cheap verifiers — tests, compilers, type checkers**, which made this the domain where agent techniques matured first.

With model capability converging, the differentiator is the **surrounding scaffolding** — context files, tool surface, permissions, verification loop — rather than the model. This document groups those elements from the coding-domain perspective and delegates each element's general theory to the relevant page.

## Components

### 1. Project Context Files

A file at the repository root such as `AGENTS.md` (a tool-neutral convention) or `CLAUDE.md` acts as **persistent instructions loaded automatically every session**. It holds build and test commands, architecture rules, and prohibitions. Design principles:

- **Keep it short**: it is always loaded, so length consumes tokens and brings [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Context Rot]] sooner. Split detailed procedures into Skills loaded on demand (→ [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols|Agent Skills & Protocols]]).
- **Enforce mechanically what can be enforced mechanically**: use hooks and linters rather than prose rules — a written rule can be violated, a pre-commit check blocks the violation.
- Directory layout examples and Agent Workbench surfaces are in [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]].

### 2. Spec-driven Development

A workflow that **fixes requirements, design, and a task list as a document (spec) before generating code**, then has the agent implement and verify against that spec. Tools such as AWS Kiro and GitHub Spec Kit productized it. Unlike "vibe coding" that starts from a vague one-line prompt, the spec becomes a **human-reviewable intermediate artifact**, reducing intent drift and rework. The cost is authoring the spec, so it suits multi-file features more than small edits.

### 3. Plan → Edit → Verify Loop

```
Explore (read-only)  →  Plan  →  Edit  →  Run tests/lint  →  On failure, re-edit based on logs
```

The key is the last step — **test results are objective feedback**, so the agent converges on execution results rather than its own judgment. Weak tests let an agent produce code that merely passes, so supplement with test-first (TDD) or a separate reviewer agent. The general patterns follow [[en/AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern|ReAct Pattern]] and [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows|Cyclic Flows]].

### 4. Parallel and Background Execution

- **git worktree** isolates working directories so several agents work in the same repository without conflicts
- **Subagent delegation** runs side tasks such as exploration and review in a separate context to protect the main one (→ [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]])
- **Cloud/background agents** take an issue and carry it to a PR asynchronously — for long-running infrastructure see Durable Execution in [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]]

### 5. Permissions and Sandboxing

File writes and shell execution can be irreversible, so **permission modes** (read-only → auto-accept edits → fully autonomous) tune autonomy to risk (→ [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]]). Repository contents, issue bodies, and dependency READMEs are **untrusted input**, so any environment where the Lethal Trifecta holds (secret access + untrusted content + external communication) needs a sandbox and approval gates (→ [[en/AI/Engineering/Harness_Engineering/Prompt_Injection_Defense|Prompt Injection Defense]], Agent Sandbox in [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]]).

### 6. Agent–Computer Interface (ACI)

SWE-agent [2] showed that a **purpose-built command interface** for agents (file viewer, linted editor, concise search output) improves performance substantially over a raw shell. That tool output format is a performance variable is the same theme as tool design in [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]].

## Evaluation

| Benchmark | Measures |
|-----------|----------|
| SWE-bench Verified / Pro | Resolving real GitHub issues (judged by tests passing) |
| Terminal-Bench | Composite shell tasks in a terminal environment |

For details and limitations (contamination, saturation) see [[en/AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]]. Scores **vary heavily with harness configuration**, so the same model is not comparable across different scaffolding. A regression eval set built on your own codebase is the final basis for judgment.

## Boundaries

| Document | Covers |
|----------|--------|
| [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks\|Agent Frameworks]] | Agent SDKs (Claude Agent SDK, etc.) in general |
| [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench\|Eval-Driven Development & Agent Workbench]] | Eval-driven development and Workbench surfaces |
| [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems\|Autonomous Systems]] | Permission modes, safety controls, long-running execution |
| **This document** | Integrated view of coding-specific elements (context files, spec, verify loop, worktree) |

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent Frameworks]] · [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]] · [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]] · [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols|Agent Skills & Protocols]] · [[en/AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]] · [[en/AI/Engineering/Harness_Engineering/Prompt_Injection_Defense|Prompt Injection Defense]]

## Sources
- [1] Wang et al. (2024) "OpenHands: An Open Platform for AI Software Developers as Generalist Agents" — [arXiv:2407.16741](https://arxiv.org/abs/2407.16741)
- [2] Yang et al. (2024) "SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering" — [arXiv:2405.15793](https://arxiv.org/abs/2405.15793)
- Jimenez et al. (2024) "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" — [arXiv:2310.06770](https://arxiv.org/abs/2310.06770)
- AGENTS.md — [agents.md](https://agents.md)
