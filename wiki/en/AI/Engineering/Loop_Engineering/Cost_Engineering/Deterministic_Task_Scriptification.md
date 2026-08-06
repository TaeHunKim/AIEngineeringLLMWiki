---
order: 2
---

# Deterministic Task Scriptification

## Overview

A large share of the LLM calls repeated in production are actually **deterministic tasks that apply the same rule to the same input every time**. Handling these with an LLM inference every single time means spending expensive computation on an already fully standardized, repetitive task. A watcher agent observes execution traces, detects repeating patterns, compiles them into verified code registered as a tool, and thereafter handles matching requests instantly with that code, with no LLM call at all.

## Agentic Compilation

- "Agentic Compilation: Mitigating the LLM Rerun Crisis for Minimized-Inference-Cost Web Automation" (2026) — [arXiv:2604.09718](https://arxiv.org/html/2604.09718v1)
- **Problem**: Production LLM agents waste latency and reliability by regenerating code from scratch (rerunning) for the same procedural steps on every request — this is called the "LLM Rerun Crisis"
- **Solution**: An agentic tool-making pipeline that compiles repeated SOP steps into validated, versioned tools ahead of time, replacing the inference-time "regenerate code every time" loop
- **Effect**: Compiles a workflow into a deterministic JSON workflow blueprint via a single one-shot LLM call, reducing per-workflow inference cost to under $0.10

## Tool-Making and Self-Evolution

- "Tool-Making and Self-Evolving LLM Agents in Low-Latency Systems" (2026) — [arXiv:2607.08010](https://arxiv.org/html/2607.08010v1)
- **How it works**: A tool-maker collects execution traces from the live production environment, observing backend schemas and values → generates candidate tools → validates and repairs them against labeled cases
- **Effect**: Reported that converting to tool calls reduced p50 latency by 42%

## LOOP Skill Engine: One-Shot Recording + Deterministic Replay

- "Good to Go: The LOOP Skill Engine That Hits 99% Success and Slashes Token Usage by 99% via One-Shot Recording and Deterministic Replay" (2026) — [arXiv:2605.14237](https://arxiv.org/pdf/2605.14237)
- **Core idea**: Applies record-replay, a technique from software debugging, to an LLM agent's tool-call sequences — records the execution the first time an agent solves a problem, then deterministically replays the recorded sequence with no LLM call whenever the same pattern is detected afterward
- **Effect**: Reported 99% token usage reduction while maintaining a 99% success rate

## Relationship to Existing Wiki Concepts

These three approaches aren't entirely new — they're a natural extension of two concepts this wiki already covers.

- The **Voyager skill library** (Wang et al. 2023) in [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] — fundamentally the same idea as an agent storing successful action sequences as reusable code skills to build up a library. The difference: Voyager focuses on "expanding capability," while here the explicit goal is "reducing cost"
- The **DSPy compilation** concept in [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]] — where DSPy "compiles" declarative LM calls into an optimized prompt, this goes one step further and compiles all the way down to deterministic code instead of a prompt. DSPy compilation's output still requires an LLM call, but scriptification's output eliminates the LLM call entirely

## Failure Handling: Fallback and Re-review

The biggest risk of this approach is **incorrectly judging a task to be deterministic when it actually isn't**. Tasks involving external APIs are especially prone to this: a script may work fine at first, then start failing silently the moment an API response format changes or a service is redesigned.

```
Execution flow:
  Request → [attempt script execution]
              ├─ success → return result (low cost)
              └─ failure (exception/schema mismatch) → [immediate fallback to LLM inference]
                                                          → return result (handled normally, cost incurred)

Handling accumulated fallbacks:
  Same script falls back N+ times within a short window
    → move that script to "under review" status, halt auto-reregistration
    → watcher agent re-observes the changed API spec and attempts to regenerate the script
    → redeploy only after human approval (avoid fully automatic redeployment)
```

As the Tool-Making research emphasizes, a tool-maker must keep observing backend schemas and values in the "live environment" — even a once-validated script shouldn't be trusted permanently; periodic re-validation is the safer default.

## Sandboxing

Because an auto-generated script must never perform actions beyond its intended scope (e.g., unintended file deletion, calling the wrong API endpoint), this applies the **Agent Sandbox** pattern from [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] as-is — isolating the script's execution environment from core systems (databases, production services) so that even a malfunctioning script has bounded impact. Scripts auto-generated and auto-registered by a watcher agent carry more unvalidated risk than tools written by humans, making sandboxing not optional but mandatory.

## Role in AI Engineering

Unlike [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity-Aware Model Routing]], which substitutes a cheaper model, Deterministic Task Scriptification **eliminates the LLM call entirely** where possible — giving it the largest potential savings among the three mechanisms. At the same time, its failure mode when "deterministic" is judged incorrectly is the most dangerous, so it can only be applied in practice with all three safeguards — fallback, re-review, and sandboxing — in place together.

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity-Aware Model Routing]]

## Sources
- "Agentic Compilation: Mitigating the LLM Rerun Crisis for Minimized-Inference-Cost Web Automation" (2026) — [arXiv:2604.09718](https://arxiv.org/html/2604.09718v1)
- "Tool-Making and Self-Evolving LLM Agents in Low-Latency Systems" (2026) — [arXiv:2607.08010](https://arxiv.org/html/2607.08010v1)
- "Good to Go: The LOOP Skill Engine That Hits 99% Success and Slashes Token Usage by 99% via One-Shot Recording and Deterministic Replay" (2026) — [arXiv:2605.14237](https://arxiv.org/pdf/2605.14237)
- Wang et al. (2023) "Voyager: An Open-Ended Embodied Agent with Large Language Models" — [arXiv:2305.16291](https://arxiv.org/abs/2305.16291)
