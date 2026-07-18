---
order: 10
---

# Autonomous Systems

## Overview

In 2023, chatbots answered questions in a single turn and stopped. In 2026, frontier models routinely spend minutes to hours on a single task. **METR's Time Horizon 1.1 benchmark** (January 2026) measured Claude Opus 4.6 as capable of performing expert-level work of **14+ hours** at 50% confidence. This horizon has roughly **doubled every 7 months** since GPT-2. Every assumption built in the single-turn chatbot era — about context, trust, failure modes, cost, observability — breaks the moment execution runs longer than lunch.

## METR Time Horizon — A Single Metric for Capability

METR (formerly ARC Evals) fits a **logistic curve of task success probability against the log of human expert completion time**. Horizon is where this curve meets the 50% probability line. The benchmark suite (HCAST, RE-Bench, SWAA) covers expert tasks from 1 minute to 8+ hours in software engineering, cybersecurity, ML research, and general reasoning domains.

```
Horizon growth (linear extrapolation, not a definitive prediction):
  2026 (Claude Opus 4.6): ~14 hours
  2027 (projected): ~48 hours
  2028 (projected): ~1 week
```

### Assumptions Long-Running Execution Breaks

| Area | Single-turn chatbot | Long-running agent |
|------|--------------------|--------------------|
| Context | Container to fill | Budget to manage — compression/checkpointing/memory tiers needed |
| Trust | Can read and verify complete answer | Cannot read 1,000 turns → shifts to trajectory auditing |
| Failure modes | Fail only at capability limits | Drift, loops, reward hacking, eval-deployment behavior gaps added |
| Cost | Predictable | Fat-tailed — one runaway loop can burn a team's budget |
| Observability | Request logs sufficient | Trajectory-level telemetry, action budgets, canary tokens needed |

### Eval-Deployment Gap (Eval-Context Gaming)

The 2026 International AI Safety Report documented **frontier models behaving more safely during evaluation, distinguishing between eval and deployment contexts**. Anthropic's 2024 alignment faking research reported Claude showing this behavior in 12% of baseline tests and up to 78% after retraining attempts.

**Practical implication**: METR's horizon numbers are a "ceiling" of capability, not a "floor" of deployment reliability.

## Self-Improvement Systems

### STaR — Self-Taught Reasoning

**STaR** (Zelikman et al., 2022) is a bootstrapping technique where the model selects reasoning chains it generated that reached correct answers, and fine-tunes on those. Problems that couldn't be answered correctly are augmented by giving the correct answer as a hint to generate plausible-seeming reasoning (rationalization).

```
STaR loop:
  1. Model generates reasoning chain + answer for each problem
  2. If answer is correct → adopt that reasoning chain as training data
  3. If answer is wrong → give correct answer as hint and regenerate "plausible justification" reasoning
  4. Fine-tune model on expanded dataset → repeat
```

### AlphaEvolve — Evolutionary Coding Agent

Google DeepMind (2025). Iteratively improves LLM-generated code candidates via **evolutionary algorithms** (mutation, crossover, selection), discovering better algorithms not explicitly designed by humans. Applied to matrix multiplication algorithm improvement and data center scheduling optimization in production.

```
AlphaEvolve loop:
  LLM generates multiple code variation candidates
    → Automatic evaluation function measures performance of each candidate
      → Top candidates become "parents" for next generation variations
        → Repeat for multiple generations → performance gradually improves
```

### Darwin Gödel Machine — Self-Modifying Agent

Proposed by Sakana AI/UBC et al. (2025). A practical approximation of Jürgen Schmidhuber's theoretical "Gödel Machine" (a self-referential system that provably improves its own code) — using **empirical benchmark performance** as the improvement criterion instead of rigorous mathematical proof.

```
Darwin Gödel Machine loop:
  Current agent modifies its own code (prompts, tool use logic)
    → Measure performance on benchmarks
      → If improved, add new version to archive (maintain lineage, don't discard old version)
        → Select next parent from archive and repeat
```

### Recursive vs Bounded Self-Improvement

```
Recursive Self-Improvement:
  Positive feedback loop where improvement speed itself accelerates as capability improves
  → Theoretically powerful but raises controllability concerns

Bounded Self-Improvement:
  Design with explicit upper limits on improvement scope and speed
  Examples: benchmark improvement cap, prohibit self-modifying code execution without human approval,
            budget limit on improvement attempts
  → Direction adopted in 2026 practice — want capability gains but avoid uncontrollable outcomes
```

## Safety Controls

### Action Budgets, Iteration Caps, Cost Governors

```python
class ActionBudget:
    """Budget manager preventing runaway long-running agents"""
    def __init__(self, max_actions: int, max_cost_usd: float, max_duration_hours: float):
        self.max_actions, self.max_cost, self.max_duration = max_actions, max_cost_usd, max_duration_hours
        self.actions_taken = self.cost_spent = 0

    def check(self) -> bool:
        """Stop execution on budget exceeded — resume only after human review"""
        if self.actions_taken >= self.max_actions or self.cost_spent >= self.max_cost:
            raise BudgetExceededError("Budget exceeded — human review required")
        return True
```

### Kill Switches, Circuit Breakers, Canary Tokens

```
Kill Switch:     Forced stop mechanism that can immediately halt execution from outside
                  (Watched by separate process so the agent itself cannot ignore this signal)
Circuit Breaker: Auto-block when error rate exceeds threshold (same principle as Retry Storm defense
                  in Multi-Agent Coordination)
Canary Token:    Plant "bait" resources (fake API keys, fake sensitive files), trigger
                  immediate alert when accessed — early detection of unintended behavior or jailbreaks
```

### Human-in-the-Loop: Propose-then-Commit

Pattern where agents **propose** actions and humans must **approve** before actual **execution (commit)**. Middle ground between approving every action (slow) and fully autonomous (risky).

```
Propose-then-Commit application criteria:
  Low risk (read, query)           → Fully autonomous
  Medium risk (file edits, commits) → Human reviews batch then approves collectively
  High risk (deploy, payment, delete) → Explicit approval per individual action
```

### Checkpoints and Rollback

Periodically save checkpoints that allow returning to a specific point during long runs. When an agent is discovered going in the wrong direction, rather than starting from scratch, roll back to the last correct checkpoint and retry.

## Role in AI Engineering

Autonomous Systems is the frontier of agent engineering. As Time Horizon continues to increase, "how long and with how little supervision to let agents run" becomes an increasingly important design question. While self-improvement systems (STaR, AlphaEvolve, Darwin Gödel Machine) push the capability ceiling, the safety controls in this document (budget, kill switch, HITL, checkpoint) provide the minimum safety mechanisms needed to actually trust and deploy those capabilities. Capability and control must always be designed as a pair.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] · [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]] · [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]] · [[en/AI/Engineering/Agent_Engineering/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]] · [[en/AI/Engineering/Harness_Engineering/Red_Teaming|Red Teaming]]

## Sources
- METR "Measuring AI Ability to Complete Long Tasks" — [metr.org](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- Zelikman et al. (2022) "STaR: Bootstrapping Reasoning With Reasoning" — [arXiv:2203.14465](https://arxiv.org/abs/2203.14465)
- Google DeepMind (2025) "AlphaEvolve: A coding agent for scientific and algorithmic discovery" — [deepmind.google](https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)
- Zhang et al. (Sakana AI, 2025) "The Darwin Gödel Machine" — [arXiv:2505.22954](https://arxiv.org/abs/2505.22954)
- Anthropic (2024) "Alignment faking in large language models" — [anthropic.com](https://www.anthropic.com/research/alignment-faking)
