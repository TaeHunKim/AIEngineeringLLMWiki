---
order: 6
---

# Self-Evolving Harnesses

## Overview

**Self-Evolving Harness** is a loop that iteratively modifies the **execution scaffolding** (system prompt, tool, middleware, memory, skill, control flow) surrounding an agent while keeping the model weights fixed, thereby boosting performance based on the agent's own execution history. As it has been confirmed that benchmark scores can vary by several percentage points depending on the harness design even with the same base model in 2026, research on "automatically evolving the harness that was manually tuned by humans in a loop" has rapidly increased.

Here, harness refers to the meaning of **agent harness (execution scaffolding)** distinguished in the "Naming Conflict" section of [[en/AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] Hub. This is different from the Harness Engineering referred to in this wiki, which points to the safety, evaluation, and observation layers. However, the evaluation layer is an essential component of this loop. This is because whether the evolved harness has actually improved can only be judged by held-out evaluation and traces.

While DSPy and GEPA in [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] optimize **prompts and few-shot examples**, and [[en/AI/Engineering/Loop_Engineering/Data_Flywheel|Data_Flywheel]] accumulates **data to change weights**, this document covers a loop that takes the **entire harness, including code, tools, and memory**, as the optimization target.

## Basic Loop

```
Self-Evolving Harness Loop (Model weights fixed):

  1. Execute    Run a task batch with the current harness, collect trajectories and traces
  2. Diagnose   Extract causes from failed trajectories (which tool, step, or context was the problem)
  3. Propose    Generate harness modifications (prompt wording, new tool, middleware, memory rules, code patch)
  4. Gate       Verify proposals on held-out / regression batches → adopt only those that pass
  5. Promote    Deploy the new harness snapshot, roll back to the previous snapshot on failure
  → return to 1
```

Who is responsible for each step is the core of the design. Most systems **separate the execution agent from the evolution pipeline**. This is because if the agent solving the task modifies its own harness, there is a risk of changing the evaluation criteria as well.

## Representative Research (2026)

| Research | Evolution Target | Core Idea | Reported Results |
|------|----------|--------------|------------|
| **AHE** (Agentic Harness Engineering, 2604.25850) | Entire coding agent harness | Three axes of observability — component (editable/revertible at file level), experience (compressing trajectories into hierarchical evidence corpus), decision (attaching predictions to each modification for verification in the next round) | Terminal-Bench 2 pass@1 69.7% → 77.0% (10 repetitions), surpassing human-designed Codex-CLI harness (71.9%). Fixed harness transfers to SWE-bench-verified, saving 12% in tokens. |
| **HarnessEvolve** (2609.00829) | Prompt, skill, tool, execution logic | Extracting error signals by aligning **reference trajectories** executed with correct answers and failed runs → discovering systematic failure patterns through clustering. Quality gate (data leakage/prompt bloat filter) + Performance gate (improving current batch & non-regression from recent batch) | Outperforming existing baselines in open-domain and enterprise scenarios (self-reported). |
| **RRSI** (2609.24972) | Prompt, control flow, tooling, memory, context management | **Overfitting suppression** for recursive self-improvement. Proposer uses a budget (annealing) that reduces the number of modifications bundled at once over time, and Selector uses a critic to filter benchmark-specific modifications and a pruner to discard changes that are too small, too expensive, or useless. | Across 8 benchmarks, up to +6.0 points on the split it evolves against and up to +4.3 points on 5 OOD benchmarks; 30% fewer policy tokens than unregularized evolution. |
| **MOSS** (2605.22794) | Agent **source code** | Moving beyond fixing only text outputs to source-level rewriting. Delegating modifications to an external coding-agent CLI based on production failure batches → verifying by replaying failed batches in ephemeral workers → replacing the container after user consent, rolling back if the health probe fails. | Average score of 0.25 → 0.61 (1 cycle, no human intervention) on 4 OpenClaw tasks. |

AHE reports that most of the gains came not from the system prompt but from modifications to **tools, middleware, and long-term memory**. This provides evidence that there are areas beyond prompt optimization.

## Does Evolution Actually Help — Critical Findings

"A modification occurred" and "performance improved" are different issues. Research that separates and measures these since mid-2026 has emerged.

- **Harness Updating Is Not Harness Benefit** (2605.30621): Divides capability into two aspects: the **ability to make** useful modifications (harness-updating) and the **ability to benefit** from the modified harness (harness-benefit). The making ability was flat regardless of model grade (modifications made by Qwen3.5-9B yielded gains comparable to those of Claude Opus 4.6). Conversely, the benefiting ability was non-monotonic. Weaker models gained little, mid-tier models gained the most, and stronger models gained less than the mid-tier. The failure of weaker models was attributed to either failing to invoke relevant artifacts or failing to adhere faithfully to them even when invoked.
- **SEAGym** (2606.17546): An evaluation environment that transforms the Harbor-compatible benchmark into a self-evolution task. It compares ACE, TF-GRPO, and AHE on Terminal-Bench 2.0·HLE. The conclusion is that **frequent updates may not increase held-out performance**, and snapshots that were good in the middle might degrade with subsequent evolution.
- **EvoHarnessBench** (2609.04280): Evaluates 17 streams (802 tasks, 520 tools, 42 skills, 62 agents) where the harness itself changes incrementally, rather than the task. **Harness-induced forgetting**, where performance on previously solved tasks drops just by adding components, was observed, suggesting that retaining existing capabilities and adapting to new capabilities can conflict.

The practical implication is similar to the A/B testing in [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]]. The evolution loop must record **frozen held-out sets, OOD sets, replay per snapshot, and cost metrics**, and the **snapshot with the best validation score** should be deployed, not the latest snapshot.

## Design Checklist

```
Evolution scope:   prompt only → + tool/middleware → + memory rules → + source code
                   (further right means both larger gains and larger risk)
Evidence:          failed trajectories, reference trajectories, traces (→ Observability)
Gate:              held-out non-regression + OOD transfer + cost ceiling + data leakage check
Regularization:    limit edits bundled at once, reject benchmark-specific rules, prune dead rules
Deployment:        snapshot versioning, human approval (for source edits), health-probe-based rollback
Separation:        task execution agent ≠ evolution pipeline ≠ evaluation criteria
```

## Boundary Definitions

| Topic | What it changes | Document |
|------|----------------|------|
| Automatic Prompt Optimization | Prompt wording and examples | [[en/AI/Engineering/Prompt_Engineering/Automatic_Prompt_Optimization\|Automatic_Prompt_Optimization]] |
| DSPy / GEPA / RLVR | Prompt programs, or weights | [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization\|Continuous_Optimization]] |
| Data Flywheel | Training data → weights | [[en/AI/Engineering/Loop_Engineering/Data_Flywheel\|Data_Flywheel]] |
| Deterministic Task Scriptification | Fixing repetitive tasks into scripts (for cost purposes) | [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Deterministic_Task_Scriptification\|Deterministic_Task_Scriptification]] |
| Darwin Gödel Machine, AlphaEvolve | Open-ended evolution of agent code/algorithms (exploring capability ceilings) | [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous_Systems]] |
| **Self-Evolving Harness** | Weights fixed; evolves the entire harness based on production/benchmark evidence | This document |

## Role in AI Engineering

Self-Evolving Harness extends the "deployment is the start" principle of Loop Engineering to the harness level. Since it does not modify weights, it does not require training infrastructure, and the units of modification are files/snapshots, making rollback easy. Therefore, it is an improvement loop that can be attempted before fine-tuning. However, as shown by RRSI and SEAGym, this loop is easily overfit to benchmarks. Success is determined not by the evolutionary capability itself, but by **how strictly the gates and evaluations are designed**.

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] · [[en/AI/Engineering/Prompt_Engineering/Automatic_Prompt_Optimization|Automatic_Prompt_Optimization]] · [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]] · [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench|Eval_Driven_Development_and_Agent_Workbench]] · [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability_and_Tracing]] · [[en/AI/Engineering/Harness_Engineering/Harness_Engineering|Harness_Engineering]]

## Sources
- Lin et al. (2026) "Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses" — [arXiv:2604.25850](https://arxiv.org/abs/2604.25850)
- Jiang et al. (2026) "HarnessEvolve: Learning from Reference Trajectories for Reliable Agent Self-Evolution" — [arXiv:2609.00829](https://arxiv.org/abs/2609.00829)
- Xia et al. (2026) "RRSI: Regularized Recursive Self-Improvement of Agent Harnesses" — [arXiv:2609.24972](https://arxiv.org/abs/2609.24972)
- Cai et al. (2026) "MOSS: Self-Evolution through Source-Level Rewriting in Autonomous Agent Systems" — [arXiv:2605.22794](https://arxiv.org/abs/2605.22794)
- Lin et al. (2026) "Harness Updating Is Not Harness Benefit: Disentangling Evolution Capabilities in Self-Evolving LLM Agents" — [arXiv:2605.30621](https://arxiv.org/abs/2605.30621)
- Zheng et al. (2026) "SEAGym: An Evaluation Environment for Self-Evolving LLM Agents" — [arXiv:2606.17546](https://arxiv.org/abs/2606.17546)
- Ke et al. (2026) "EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness?" — [arXiv:2609.04280](https://arxiv.org/abs/2609.04280)
