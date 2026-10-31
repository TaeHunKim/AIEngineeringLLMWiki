---
order: 5
---

# Background Agents (Proactive Agents)

## Overview

**Background Agent** is an agent that continues to work in its own execution environment even when the user is not looking at the chat window, and only calls the user when necessary. If a chat-style agent operates on a synchronous loop of "request → response," a background agent operates on an asynchronous loop of **trigger → asynchronous execution → notification → review**. With OpenAI and Anthropic releasing parallel and proactive agents as consumer products in October 2026, this form has expanded beyond coding tools into general tasks.

While [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents|Coding_Agents]] deals with cloud coding agents that asynchronously handle issues up to PRs, and [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]] covers the reliability and safety mechanisms of long, single-run executions, this document addresses **how execution separated from the user session interacts with the user**. The topics include when it wakes up, what it does independently versus what it asks, and how it returns the results.

## Three Forms

| Form | Initiation | User Touchpoint | Example (Oct 2026) |
|---|---|---|---|
| **Delegated** | User explicitly passes the task | Completion/review request notification | Cloud coding agent (Issue → PR) |
| **Parallel** | A single request is divided among multiple agents | Tracking progress within the conversation, opening completed subtasks for review | OpenAI GPT-6 Pro parallel agents (Oct 16, 2026, ChatGPT Pro) |
| **Proactive** | The agent periodically checks connected apps and finds tasks to perform autonomously | Morning brief, messages only when attention is needed | Anthropic Claude Duet (Oct 21, 2026, research preview) |

Further down the table, the decision of "what to do" shifts from the user to the agent. Consequently, the importance of approval gates and notification design increases.

## Architecture Components

```
Background Agent Configuration:

  Trigger       Schedule (check every few hours, morning brief), event (new mail/issue), user delegation
  Runtime       Dedicated VM / sandbox independent of the user's device (keeps running when the device is off)
  Connectors    Mail, calendar, messenger, CRM, etc. (MCP servers, plugins)
  State         Long-term memory, task list, checkpoints (Durable Execution)
  Gate          Shows the exact action before any irreversible action and waits for approval
  Notify        Done / needs review / needs attention notifications; frequency set by the user
  Review        Per-task pages with results and action history; steer the run mid-task
```

**Runtime** is the persistent sandbox pattern of [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Sandboxes|Agent_Sandboxes]]. Since **State** must be executable even after process restart/redeployment, Durable Execution of [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]] is prerequisite. When remote tool calls take a long time, the Tasks extension of the MCP 2026-07-28 spec (polling with `tasks/get` after returning a job handle) serves as a protocol-level asynchronous processing mechanism (→ [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/MCP|MCP]]).

## Case Study: Claude Duet Design Choices

The description of Claude Duet released by Anthropic (announced 2026-10-21, security document 10-23) shows, within a single product, the design decisions a proactive agent requires.

- **Standalone Environment**: It runs on its own VM and browser, meaning the user's device does not need to be powered on. The browser is a separate cloud VM isolated from the model and agent, and the agent controls it only through a fixed set of commands.
- **Frequency and Cost**: It checks connected accounts every few hours. This frequency is a choice made to conserve usage limits, and background checks are included in the usage.
- **Approval Gate**: It autonomously handles reading, drafting, and preparation, but it waits after showing the exact actions (target, full content, all recipients) before sending messages, making payments, signing, or deleting. Some **actions stay blocked even with approval**, such as trading securities or moving money between accounts, while payments, order deletions, and account creations are excluded from the "don't ask again" rule.
- **Separation of Action Verification**: A classifier **outside** the task model (based on the Claude Code auto mode classifier) judges whether each action aligns with the user's intent. This is intended to prevent hidden instructions on the page from influencing the judgment.
- **Credential Isolation**: The model cannot see passwords, cookies, or tokens. The token on the agent side is a placeholder, and a proxy outside the agent machine inserts the actual value at the time of the request.
- **Payment Scope Limitation**: Purchases are processed using one-time virtual cards tied to a single vendor and a single amount.

## Design Considerations

### Notification Fatigue vs. Missed Alerts

The value of a proactive agent lies in notifying users only about "important things." If it notifies too often, users turn off notifications; if it notifies too rarely, important events are missed. A common compromise is to allow users to adjust the notification criteria and frequency, while gathering missed items in a regular brief. Claude Duet also specifies limitations such as misjudging urgency or misreading threads.

### Cost of Reviewing Parallel Results

Parallel agents reduce execution time but increase the **number of artifacts to review**. To prevent human review from becoming a bottleneck, the system must allow viewing what was done for each subtask and present both the final integrated result and individual evidence. The divide-and-conquer strategy is similar to the orchestrator-worker pattern in [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi_Agent_Coordination]].

### Runtime Intervention

Even if running in the background, users must be able to change direction midway. However, there are research findings that models can ignore stop signals passed as prompts (→ compliance with stop/interrupt in [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]). Therefore, it is safer to enforce stopping/pausing at the harness level and only convey direction modifications through conversation.

## Boundary Definitions

| Topic | Focus | Document |
|------|------|------|
| Cloud Coding Agent | Delegated execution of code domains, worktree parallelism | [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents\|Coding_Agents]] |
| Long-running Autonomous Systems | Reliability, safety mechanisms, and self-improvement of single long-running systems | [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous_Systems]] |
| Computer Use | The ability to operate screen and browser | [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents\|Computer_Use_and_Voice_Agents]] |
| HITL Pattern | Design of approval and suspension graphs | [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop\|Human_in_the_Loop]] |
| **Background Agents** | Triggers, notifications, approvals, and reviews for executions separated from sessions | This document |

## Role in AI Engineering

The Background Agent transforms agents from "tools that answer when called" to "colleagues that work autonomously." The difficult problem here is designing the delegation boundary: **when to work alone versus when to ask.** Products in 2026 are converging on a three-tier structure: autonomous reading and preparation, irreversible actions requiring approval after accurate preview, and certain high-risk actions that are forbidden even with approval. The infrastructure supporting this structure includes sandboxing, credential isolation, and behavior checking outside the task model.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]] · [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents|Coding_Agents]] · [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Sandboxes|Agent_Sandboxes]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/MCP|MCP]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi_Agent_Coordination]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human_in_the_Loop]]

## Sources
- OpenAI "ChatGPT Release Notes" — GPT-6 Pro parallel agents (2026-10-16) — [help.openai.com](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
- Anthropic "Introducing Claude Duet" (2026-10-21) — [claude.com](https://claude.com/resources/articles/claude-duet)
- Anthropic "Claude Duet Safety, Privacy, and Security" (2026-10-23) — [claude.com](https://claude.com/resources/articles/claude-duet-safety-privacy-and-security)
- MCP "The 2026-07-28 Specification" — [blog.modelcontextprotocol.io](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
