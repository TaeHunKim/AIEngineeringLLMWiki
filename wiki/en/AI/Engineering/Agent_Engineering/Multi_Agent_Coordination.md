---
order: 8
---

# Multi-Agent Coordination (Coordination and Failure Modes)

## Overview

While [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] addresses architecture choices within a single system, this document dives deeper into **how multiple agents communicate and coordinate, and why they fail**. Research in 2025~2026 revealed that Multi-Agent Systems (MAS) can significantly boost performance on certain tasks, but also show **41~86.7% failure rates in real tasks** (Cemri et al., 2025). In production, knowing failure modes is just as important as knowing coordination patterns.

## Coordination Patterns

### Supervisor / Orchestrator-Worker

The multi-agent version of the Orchestrator & Sub-Agents pattern from [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]]. The most widely used pattern; relatively easy to debug (all communication goes through the Supervisor).

### Hierarchical Architecture and Decomposition Drift

Multi-level structure with sub-supervisors under the main supervisor. Advantageous for large-scale task decomposition, but **Decomposition Drift** risk increases — the decomposition from upper layers gradually deviates from the original goal as it propagates downward.

### Society of Mind and Multi-Agent Debate

Borrowing Minsky's "Society of Mind" concept — intelligence emerges from interactions among multiple simple agents rather than a single intelligence. The Debate pattern (propose→critique→defend→moderate) is a representative implementation.

### Role Specialization — Planner / Critic / Executor / Verifier

Assign fixed roles to each agent to separate responsibilities:

```
Planner:  Decompose goals into actionable steps
Executor: Actually execute each step (tool calls)
Critic:   Critique Executor's results (similar to Self-Refine/CRITIC)
Verifier: Independently verify final results against original goals
```

**Core design principle**: Verifier must independently re-verify without "trusting" Executor's output — otherwise directly exposed to the "Verification Gap" failure mode below.

### Handoffs and Routines

Pattern popularized by OpenAI Agents SDK. One agent completely transfers conversation control to another without a heavy orchestration layer. Lighter than Supervisor-always-intervening, closer to stateless orchestration.

## Shared Memory and Blackboard Patterns

**Blackboard architecture** (revival of 1980s classic AI pattern): A shared workspace (blackboard) all agents can read and write, with each agent autonomously contributing when their expertise is needed.

```python
class Blackboard:
    def __init__(self):
        self.facts = {}       # verified facts
        self.hypotheses = []  # unverified hypotheses
        self.provenance = {}  # source tracking for each item

    def post(self, key: str, value, source_agent: str, confidence: float):
        self.hypotheses.append({"key": key, "value": value, "source": source_agent, "confidence": confidence})

    def promote_to_fact(self, key: str, verifier_agent: str):
        """Only hypotheses verified by Verifier promoted to facts"""
        ...
```

Shared memory accelerates collaboration but is also the source of the "Memory Poisoning" failure mode below.

## Consensus and Trust

### Consensus and Byzantine Fault Tolerance (BFT)

The problem of how to reach a final conclusion when multiple agents disagree. Borrowing BFT theory from distributed systems — design so the overall system can reach correct consensus even if some agents malfunction (e.g., require more than majority agreement).

### Voting, Self-Consistency, Debate Topology

- **Voting**: N agents (or N samplings of the same agent) each answer, then majority vote — the multi-agent version of Self-Consistency
- **Debate Topology**: What graph structure to connect debating agents — all-connected (everyone sees all arguments), chain (sequential relay), tree (hierarchical synthesis)

---

## Failure Modes: MASFT / MAST and Groupthink

### MASFT / MAST — 3 Failure Categories

Cemri et al. (2025, arXiv:2503.13657, NeurIPS 2025) collected and analyzed **1,642 real execution traces** from 7 open-source multi-agent systems, confirming **41~86.7% failure rates** and 14 failure modes (Inter-annotator Cohen's Kappa 0.88 — high reliability classification). 3 main categories:

```
1. Specification Problems (41.77%) — Specification issues
   Role ambiguity (two agents both identify themselves as reviewer)
   Task unclear (success criteria implicit, agent cannot judge)

2. Coordination Failures (36.94%) — Coordination failures
   Concurrent updates without shared state synchronization
   Message loss (queue failure, timeout)
   State drift (A thinks it's done, B is still running)

3. Verification Gaps (21.30%) — Verification gaps
   No one verifies even when one agent claims success
   Chained agents each uncritically trust previous output
```

**Countermeasures**: Specification problems → explicit role contracts + pre-task definition review; Coordination failures → versioned shared state + explicit acknowledgment; Verification gaps → independent Verifier agent + explicit handoff contracts.

### Groupthink Failures (arXiv:2508.05687)

5 related failures that occur when agents **homogenize**:

| Failure type | Description |
|-------------|-------------|
| **Monoculture Collapse** | Same base model used → errors become correlated (three agents share the same hallucination) |
| **Conformity Bias** | Other agents conform to the most confident (loudest) agent — even if that answer is wrong |
| **Deficient Theory of Mind** | Cannot read other agents' belief states → coordination failure |
| **Mixed-Motive Dynamics** | Agents with only partially aligned interests converge on a compromise satisfying no one |
| **Cascading Reliability Failures** | Error patterns from one component propagate to dependent components |

### Cascading Failure Example — Retry Storm

```
Payment service fails 10% of requests
  → Order agent retries payments (naive exponential backoff)
    → Each retry triggers new inventory check
      → Inventory service load doubles
        → Inventory service timeouts begin
          → All orders retry inventory check too
            → Inventory service load 10x → cluster down
```

**Solution**: Apply the classic distributed systems **Circuit Breaker** pattern directly. When downstream service error rate exceeds threshold, immediately block and switch to cached/default responses.

### Memory Poisoning

When one agent's hallucination is recorded as "fact" in shared memory, downstream agents treat it as true without verification. Symptom is **gradual decay of accuracy** rather than abrupt errors — making root cause diagnosis difficult. Countermeasures: append-only log + provenance tracking + immutable Verifier.

### STRATUS — Detection·Diagnosis·Validation Trio

STRATUS (NeurIPS 2025) deploys three specialized agents to improve failure response success rate by 1.5x:
```
Detection Agent:  Monitor symptom patterns (high disagreement rate, retry spikes, accuracy drift)
Diagnosis Agent:  Infer root cause from symptoms based on MAST categories
Validation Agent: Confirm that symptoms actually resolved after mitigation is applied
```
SRE (Site Reliability Engineering) incident response applied directly to multi-agent systems.

## Role in AI Engineering

Multi-agent systems are more powerful than single agents, but bring new attack surfaces for coordination failure. As Cemri et al.'s numbers (41~86.7% failure rates) show, the intuition "more agents = better" is dangerous without verification. In practice, when choosing coordination patterns, always design the corresponding failure modes and mitigation strategies (explicit role contracts, independent Verifier, Circuit Breaker, regular MAST audits) together.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] · [[en/AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns|Anthropic Workflow Patterns]] · [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent Frameworks]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]]

## Sources
- Cemri et al. (2025) "Why Do Multi-Agent LLM Systems Fail? (MAST)" — [arXiv:2503.13657](https://arxiv.org/abs/2503.13657), NeurIPS 2025
- "Groupthink failures in multi-agent LLMs" (2025) — [arXiv:2508.05687](https://arxiv.org/abs/2508.05687)
- Park et al. (2023) "Generative Agents: Interactive Simulacra of Human Behavior" — [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)
- Anthropic "How we built our multi-agent research system" — [anthropic.com](https://www.anthropic.com/engineering/multi-agent-research-system)
