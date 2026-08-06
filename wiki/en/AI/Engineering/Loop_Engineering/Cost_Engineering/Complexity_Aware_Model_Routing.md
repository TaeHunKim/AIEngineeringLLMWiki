---
order: 1
---

# Complexity-Aware Model Routing

## Overview

**Complexity-Aware Model Routing** automatically detects a request's actual difficulty and switches it to the cheapest model capable of handling it. Unlike the static, rule-based model routing already covered in [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]], this document covers an automated variant in which **a watcher agent continuously analyzes production logs and keeps updating the routing policy itself** — repeatedly re-asking "can this request actually be handled with lighter resources?"

## LLM Cascade: FrugalGPT

- **Authors**: Chen, Zaharia & Zou (2023), "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance" — [arXiv:2305.05176](https://arxiv.org/abs/2305.05176)
- **Core idea**: Try the smallest/cheapest model first; if the response's confidence is sufficient, return it immediately; if not, escalate to the next, larger and more expensive model.

```
Cascade flow:
  Request → [smallest model] → compute confidence score
                                  ├─ sufficient → return response (low-cost exit)
                                  └─ insufficient → [next-tier model] → repeat
                                                       ... → [largest model] (last resort)

FrugalGPT's confidence judgment: a lightweight scorer (e.g., fine-tuned
DistilBERT) predicts answer correctness from the (query, response) pair,
compared against a per-stage threshold
```

- **Effect**: Reported up to 98% cost reduction (50–98% average across benchmarks) while maintaining equivalent quality
- FrugalGPT also proposes **prompt adaptation** (reformulating into a cheaper prompt form) and **LLM approximation** (approximating with caching or fine-tuned small models), jointly optimized via a framework called FrugalML.

## Learned Routers: RouteLLM and UCCI

Where FrugalGPT's cascade is "try sequentially, escalate conditionally," a learned router predicts which model to send a request to in a single pass, as soon as it arrives.

- **RouteLLM** (UC Berkeley/Anyscale/Canva, ICLR 2025) — the learned router already introduced in [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]]. Trained on preference data, reported to cut costs 85% on MT-Bench and 45% on MMLU
- **UCCI** (2026), "Calibrated Uncertainty for Cost-Optimal LLM Cascade Routing" — [arXiv:2605.18796](https://arxiv.org/abs/2605.18796) — a follow-up that calibrates a model's uncertainty about its own answer, more precisely estimating the threshold for "how confident is confident enough before escalating"

## Agentic Workflow-Specific Routing

Unlike a single-turn chatbot, an agent needs a routing decision at every step of a multi-turn, multi-step execution.

- **Budget-Aware Agentic Routing via Boundary-Guided Training** (2026) — [arXiv:2602.21227](https://arxiv.org/abs/2602.21227) — trains routing so an agent approximates large-model-level performance under a budget constraint at far lower cost
- **SWE-Router** (2026), "Routing in Multi-turn Agentic Software Engineering Tasks" — [arXiv:2607.00053](https://arxiv.org/pdf/2607.00053) — routes each turn of a multi-turn agentic software engineering task to the minimum-cost model sufficient for that turn, improving the cost-performance frontier

## Task Decomposition Before Routing

A request that looks complex on the surface can often be split into several genuinely simple subtasks. In that case, instead of handing the whole thing to one heavy model, a watcher agent can:

```
1. Attempt to decompose the request into subtasks (e.g., "write a report" →
   gather data + summarize + reformat + final review)
2. Estimate the difficulty of each subtask individually
3. Route simple subtasks (data gathering, reformatting) to a lightweight/local model,
   keeping only the genuinely complex subtask (final review) on the heavy model
```

If this judgment is wrong — forcibly decomposing a task that actually can't be split — quality can degrade, which is why the verification period below is mandatory.

## A Verification Period Before Switching

Changing a routing policy is a change that directly affects service quality. If a watcher agent incorrectly judges "this task is fine for a lightweight model," the resulting quality degradation is exposed directly to users. So this applies the **Shadow/Canary Deployment** pattern from [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] as-is:

```
1. Shadow stage: run the new routing policy alongside production traffic
   without actually serving it — compare results against the existing policy
   only (measure quality difference; cost isn't actually billed)
2. Canary stage: apply the new policy to a small slice of traffic (e.g., 5%),
   monitor quality metrics
3. If quality degradation stays within threshold, gradually expand traffic share
4. If quality degradation exceeds threshold, roll back immediately
```

The length of this verification period should scale with task risk — tasks producing hard-to-reverse outcomes (e.g., drafting an email sent externally) need longer observation windows.

## Role in AI Engineering

Complexity-Aware Model Routing is, among the three mechanisms covered by [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]], both the one with the largest immediate cost impact and one of the easier to implement. But because a routing error translates directly into degraded user experience, any watcher agent that automatically updates static routing rules must be designed alongside safeguards like Shadow/Canary from the start.

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost Engineering]] · [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]] · [[en/AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Deterministic_Task_Scriptification|Deterministic Task Scriptification]]

## Sources
- Chen, Zaharia & Zou (2023) "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance" — [arXiv:2305.05176](https://arxiv.org/abs/2305.05176)
- Ong et al. (ICLR 2025) "RouteLLM: Learning to Route LLMs with Preference Data" — [arXiv:2406.18665](https://arxiv.org/abs/2406.18665)
- "Calibrated Uncertainty for Cost-Optimal LLM Cascade Routing" (2026) — [arXiv:2605.18796](https://arxiv.org/abs/2605.18796)
- "Budget-Aware Agentic Routing via Boundary-Guided Training" (2026) — [arXiv:2602.21227](https://arxiv.org/abs/2602.21227)
- "SWE-Router: Routing in Multi-turn Agentic Software Engineering Tasks" (2026) — [arXiv:2607.00053](https://arxiv.org/pdf/2607.00053)
