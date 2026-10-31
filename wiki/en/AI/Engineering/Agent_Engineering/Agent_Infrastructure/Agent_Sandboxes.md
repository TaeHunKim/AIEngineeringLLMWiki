---
order: 5
---

# Agent Sandboxes

## Overview

An **Agent Sandbox** is an execution environment that isolates the code, shell commands, and browser sessions an agent generates and runs from the host, from other tenants, and from core systems. Once coding agents and background agents started running shells for hours without human supervision, sandboxing stopped being an optional feature and became a baseline assumption. The code an agent runs is model-generated, and the model is influenced by **untrusted input** such as repositories, web pages, and issue bodies — so that code must be treated as untrusted code too.

Where [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]] covers the **policy layer** that decides what to allow or block, this document covers the **isolation layer** that physically limits the blast radius when policy is bypassed.

## The Isolation Spectrum

| Level | Representative tech | Boundary | Startup / overhead | Good fit |
|------|----------|------|-------------------|-------------|
| Process restriction | seccomp, Landlock, macOS Seatbelt | Same kernel, syscall and path restrictions | Near zero | Limiting file and network access for local CLI agents |
| Container | Docker, namespaces + cgroups | Shares the host kernel | Fast, low | Trusted single-tenant code; a single kernel vulnerability allows escape |
| User-space kernel | gVisor | Syscalls intercepted by a user-space kernel (Sentry) | Fast; syscall-heavy work slows down | Multi-tenant code execution; shrinks kernel attack surface while keeping container compatibility |
| microVM | Firecracker, Kata Containers, Cloud Hypervisor | Separate guest kernel per VM (KVM) | Around hundreds of ms (cut by snapshots and warm pools), memory per VM | The de facto standard for untrusted, multi-tenant agent code |
| WebAssembly | Wasmtime, Pyodide | Capability-based runtime | Very fast | Pure compute code; heavy language and library constraints |

The common rule of thumb: **if user- or model-generated code runs on infrastructure shared by multiple tenants, containers alone are not enough.** Firecracker is a microVM designed for AWS Lambda and Fargate around a minimal attack surface, and it underpins most major managed agent sandboxes today.

## Managed Sandboxes and Orchestration

| Product / project | Isolation | Character |
|--------------|------|------|
| E2B | Firecracker microVM | Code execution API; keeps a sandbox alive across agent turns, configurable lifetime |
| Vercel Sandbox | Firecracker microVM | Short code execution; sessions capped at a few hours |
| Modal | Sandbox primitives on a serverless runtime | GPU and long-running jobs, persistent volumes |
| Daytona | Development workspace | Persistent environments for agents that work on a repository like a human developer |
| Kubernetes `agent-sandbox` (SIG Apps) | gVisor or Kata selected via RuntimeClass | Declarative API for your own cluster. Provides `Sandbox` (a single pod with stable hostname, network identity, and persistent storage), `SandboxTemplate`, `SandboxClaim`, and `SandboxWarmPool` CRDs |

(This is a 2026-10 snapshot; re-check features and limits against each vendor's docs.)

Kubernetes `agent-sandbox` does not provide isolation itself. It is an orchestration layer that manages the **lifecycle** (creation, scheduled deletion, pause/resume, warm-pool allocation) of pods running on sandbox runtimes such as gVisor or Kata. Agent runtimes and RL rollout environments ([[en/AI/Engineering/Loop_Engineering/RL_Environments|RL_Environments]]) are the main use cases.

## Design Patterns

### Ephemeral vs Persistent

```
Ephemeral (one per task, destroyed on completion):
  Pros: contamination, secrets, or malicious files from one task never carry into the next
  Cons: dependency installs and repo clones every time → offset with snapshots / warm pools

Persistent (kept per session or project):
  Pros: long-running work, build caches, a human-developer-like workflow
  Cons: state accumulates, so periodic recreation and snapshot-rollback policies are required
```

The default is **ephemeral for untrusted code execution, persistent + snapshots for long coding work**. Checkpoints and rollback use the same infrastructure as Checkpoints and Rollback in [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]].

### Network Egress Control

Even an isolated VM opens an exfiltration path if it can reach the internet freely. Cutting the "external communication" leg of the Lethal Trifecta (secret access + untrusted content + external communication) from [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense|Prompt_Injection_Defense]] is a core job of the sandbox.

- **Default deny + allowlist**: allow only package registries, internal Git, and designated APIs
- **Egress proxy**: route every request through a proxy that logs and blocks by domain, method, and volume
- **DNS restriction**: block resolution of arbitrary domains to stop DNS tunneling

### Secret Injection: Keeping Credentials Away from the Model

If you put an API key into a sandboxed agent's environment variables, the model can read it, print it, and leak it. The pattern that spread in 2026 is **a proxy outside the sandbox that injects the real credential at request time**, while the agent side holds only a placeholder token. Anthropic's Claude Duet uses this structure. It runs the browser in a separate cloud VM, apart from the model and agent, and the agent controls the browser only through a fixed set of commands. Site code and cookies stay on the browser VM.

### Resource Limits

Set CPU, memory, disk, process-count, and wall-clock limits per sandbox. The goal is to keep infinite loops, fork bombs, and huge downloads from turning into runaway costs. It is the infrastructure-side counterpart to the Action Budget in [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]].

## Boundaries

| Topic | Covers | Document |
|------|----------|------|
| Policies, filters, callbacks | What to allow or block | [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering\|Guardrail_Engineering]] |
| Permission modes, approval gates | When a human steps in | [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents\|Coding_Agents]], [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous_Systems]] |
| Agent identity and authorization | Who the agent is and which resources it may access | [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment\|Agent_Deployment]] |
| **Agent Sandbox** | Where execution happens and how far damage can reach when it is breached | This document |

## Role in AI Engineering

Sandboxing is a line of defense that starts from the premise that prompt injection cannot be fully prevented. Even when model-level defenses and guardrails fail, it keeps the damage within one VM and the network scope that VM was granted. As a result, the ceiling on how much autonomy you can give an agent is often set less by model capability than by **the strength of isolation and egress control**.

## Related Concepts
[[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]] · [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense|Prompt_Injection_Defense]] · [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment|Agent_Deployment]] · [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents|Coding_Agents]] · [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Background_Agents|Background_Agents]] · [[en/AI/Engineering/Loop_Engineering/RL_Environments|RL_Environments]]

## Sources
- Agache et al. (2020) "Firecracker: Lightweight Virtualization for Serverless Applications", NSDI '20 — [usenix.org](https://www.usenix.org/conference/nsdi20/presentation/agache)
- gVisor documentation — [gvisor.dev](https://gvisor.dev/docs/)
- Kubernetes SIG Apps `agent-sandbox` — [GitHub](https://github.com/kubernetes-sigs/agent-sandbox)
- "Sandboxing AI-Generated Code: E2B vs Vercel Sandbox vs Modal vs Daytona in 2026" (2026-05) — [alexcloudstar.com](https://www.alexcloudstar.com/blog/sandboxing-ai-generated-code-execution-2026/)
- Anthropic "Claude Duet Safety, Privacy, and Security" (2026-10-23) — [claude.com](https://claude.com/resources/articles/claude-duet-safety-privacy-and-security)
