---
order: 4
---

# Multi-Agent Coordination (Coordination and Failure Modes)

## Overview

While [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] addresses architecture choices within a single system, this document dives deeper into **how multiple agents communicate and coordinate, and why they fail**. Research in 2025~2026 revealed that Multi-Agent Systems (MAS) can significantly boost performance on certain tasks, but also show **41~86.7% failure rates in real tasks** (Cemri et al., 2025). In production, knowing failure modes is just as important as knowing coordination patterns.

## Lineage of Communication Protocols

The roots of inter-agent communication standards trace back to 1990s multi-agent systems (MAS) research.

```
FIPA-ACL (late 1990s, Foundation for Intelligent Physical Agents)
  → Based on Speech Act theory — tags messages with speech acts such as
    "inform", "request", "propose" to make intent explicit
  → Conceptually influenced the message-type design of today's A2A and MCP

Modern standard: A2A (Agent-to-Agent Protocol, Google 2025)
  → Standard for stateful communication between agents
  → Details → A2A
```

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

### Parallel Swarm and Group Chat

**Parallel Swarm**: Multiple agents work independently toward the same goal and merge results afterward (→ parallel execution in [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]]). **Group Chat** (AutoGen style): Multiple agents speak in turn in one shared conversation room. Speaker Selection (choosing the next speaker) is the key design point — fixed order, round-robin, LLM-based dynamic selection, etc.

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

- **Voting**: N agents (or N samplings of the same agent) each answer, then majority vote — the multi-agent version of Self-Consistency ([[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]])
- **Debate Topology**: What graph structure to connect debating agents — all-connected (everyone sees all arguments), chain (sequential relay), tree (hierarchical synthesis)

### Negotiation and Bargaining

Negotiation between agents whose goals only partly align (e.g., a buyer agent vs a seller agent). It borrows negotiation models from game theory, and protocols such as AP2 (Agent Payments Protocol) in [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols|Agent Skills & Protocols]] address the trust problem at the actual transaction stage.

## Emergent Behavior

### Generative Agents and Emergent Simulation

An experiment proposed by Park et al. (2023, Stanford "Generative Agents") in which dozens of LLM agents live in a simulated town, each with its own memory, plans, and reactions. Social behaviors that no human explicitly designed (such as a party plan spreading) emerged from agent-to-agent interaction.

### Theory of Mind and Emergent Coordination

**Theory of Mind**: The ability of one agent to model another agent's "beliefs, intentions, and knowledge state." Without ToM (as covered under Groupthink failures below), agents repeat information others already know or misjudge others' intentions and fail to coordinate.

## Learning-Based Coordination and Economies

**MARL (Multi-Agent Reinforcement Learning)**: MADDPG, QMIX, MAPPO, and similar RL algorithms train multiple agents to cooperate or compete over rewards. In the LLM agent era this is often replaced by prompt/role design, but it remains valid for simulation and game-style tasks that need large-scale repeated interaction.

**Agent Economies**: An emerging research area in which many autonomous agents interact through token incentives and reputation systems. It touches on attempts to guarantee inter-agent trust at the protocol level (AP2 and Agent Identity in [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols|Agent Skills & Protocols]]).

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

### Failure Mode Audit Routine

```
Quarterly MAST audit process:
  1. Sample ~1000 real execution traces
  2. Tag each failure with MAST + Groupthink categories
  3. Compute failure rate per category — which category dominates?
  4. Prioritize mitigations — which fix removes the most failures?
  5. Implement 2–3 mitigations → re-audit next quarter
```

The most dangerous failure is the **silent correctness failure** — returning a plausible but wrong result without any exception. Even though the Verification Gap accounts for only 21.30% of occurrences, its cost per incident is the highest.

## Role in AI Engineering

Multi-agent systems are more powerful than single agents, but bring new attack surfaces for coordination failure. As Cemri et al.'s numbers (41~86.7% failure rates) show, the intuition "more agents = better" is dangerous without verification. In practice, when choosing coordination patterns, always design the corresponding failure modes and mitigation strategies (explicit role contracts, independent Verifier, Circuit Breaker, regular MAST audits) together.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Anthropic_Workflow_Patterns|Anthropic Workflow Patterns]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Planning_and_Reflection|Planning & Reflection]] · [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks|Agent Frameworks]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/A2A|A2A]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic Context Management]] · [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability & Tracing]] · [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Graph_Engineering/Multi_Agent_Topology|Multi-Agent Topology]] · [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Deep_Research_Agents|Deep Research Agents]]

## Sources
- Cemri et al. (2025) "Why Do Multi-Agent LLM Systems Fail? (MAST)" — [arXiv:2503.13657](https://arxiv.org/abs/2503.13657), NeurIPS 2025
- "Groupthink failures in multi-agent LLMs" (2025) — [arXiv:2508.05687](https://arxiv.org/abs/2508.05687)
- Park et al. (2023) "Generative Agents: Interactive Simulacra of Human Behavior" — [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)
- Anthropic "How we built our multi-agent research system" — [anthropic.com](https://www.anthropic.com/engineering/multi-agent-research-system)
- Nygard, M. "Release It! — Stability Patterns" (origin of the Circuit Breaker) — [pragprog.com](https://pragprog.com/titles/mnee2/release-it-second-edition/)
- AI Engineering from Scratch, Phase 14 · Lessons 25-28, all of Phase 16 — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms)
