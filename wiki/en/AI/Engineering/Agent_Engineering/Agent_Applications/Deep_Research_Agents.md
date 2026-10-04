---
order: 2
---

# Deep Research Agents

## Overview

A **Deep Research Agent** takes one complex question, **iterates search, reading, and reasoning over dozens to hundreds of steps**, and produces a sourced report — a long-running agent. Where single-shot RAG is "question → one retrieval → answer," deep research looks at each result and **decides for itself what to look for next**, updating its hypotheses. The survey [1] defines it as the combination of dynamic reasoning, long-horizon planning, multi-hop information gathering, iterative tool use, and structured report generation.

Where [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic RAG]] covers autonomy within the retrieval step (re-querying, correction), this document covers the **entire research lifecycle** (planning → parallel exploration → synthesis → citation verification).

## Standard Architecture

```
User question
   ↓
Planner (Lead agent)   decompose into sub-questions, form a research plan
   ↓ parallel fan-out
Researcher × N         search and read per sub-question, return only a summary (own isolated context)
   ↓
Synthesizer            merge results, find conflicts and gaps → extra round if needed
   ↓
Citation verifier      check each claim against its source
   ↓
Report
```

Key design choices:

- **Bounded sub-agents**: each researcher gets step and token caps and returns **only a summary** to the lead. This applies [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Context Isolation]] so raw text accumulated during exploration does not pollute the lead's context. LangChain deepagents (2025-07) open-sourced this plan/execute/synthesize structure.
- **Orchestrator-Worker**: Anthropic reported that a lead (stronger model) plus parallel subagents (smaller model) clearly beat a single agent on its internal research evaluation [4]. It also noted that **token usage is many times that of ordinary chat**, so it suits only high-value questions. (These are vendor-reported figures, not independently reproduced.)
- **Stopping condition**: stop when new information no longer changes the plan. Without a cap, cost runs away → Action Budget in [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous Systems]].

## Information Acquisition

| Method | Strength | Limitation |
|--------|----------|------------|
| **Search API** | Fast, cheap, structured results | Biased toward indexed top results, weak on deep pages |
| **Browser exploration** | Reaches dynamic pages and content behind logins | Slow, expensive, exposed to **indirect prompt injection** |
| **Internal sources (MCP)** | Includes private documents and DBs | Needs permission and identity management |

Browser and web content are all untrusted input, so defense follows [[en/AI/Engineering/Harness_Engineering/Prompt_Injection_Defense|Prompt Injection Defense]]. For the tool-connection standard see [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/MCP|MCP]], and for browser control see [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]].

## Reliability: Sources and Citation Verification

A report's value lies in its **verifiability**. Common failures are (1) citing nonexistent sources, (2) stating content absent from the source in citation form, and (3) adopting only one of several conflicting sources. The countermeasures are span-level entailment checks on citations and presenting conflicting sources side by side; the techniques follow [[en/AI/Engineering/Harness_Engineering/Hallucination_and_Grounding|Hallucination & Grounding]]. Weighting source reliability (primary vs. secondary, SEO sites) is also the synthesis step's responsibility.

## Evaluation

- **BrowseComp** [2]: web-browsing questions that are hard to find but easy to verify, measuring persistent search ability
- **DeepResearch Bench** [3]: multi-dimensional evaluation of report quality and citation accuracy
- Reports have no single correct answer, so combine rubric-based [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] with trajectory evaluation ([[en/AI/Engineering/Harness_Engineering/Agent_as_a_Judge|Agent-as-a-Judge]]).

## Boundaries

| Document | Covers |
|----------|--------|
| [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG\|Agentic RAG]] | Autonomous correction in the retrieval step (Self-RAG, CRAG) |
| [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination\|Multi-Agent Coordination]] | Multi-agent coordination patterns and failure modes in general |
| **This document** | The full research lifecycle, citation verification, and cost-versus-value judgment |

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic RAG]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi-Agent Coordination]] · [[en/AI/Engineering/Agent_Engineering/Agent_Techniques/Planning_and_Reflection|Planning & Reflection]] · [[en/AI/Engineering/Harness_Engineering/Hallucination_and_Grounding|Hallucination & Grounding]] · [[en/AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]]

## Sources
- [1] Huang et al. (2025) "Deep Research Agents: A Systematic Examination and Roadmap" — [arXiv:2506.18096](https://arxiv.org/abs/2506.18096)
- [2] Wei et al. (2025) "BrowseComp: A Simple Yet Challenging Benchmark for Browsing Agents" — [arXiv:2504.12516](https://arxiv.org/abs/2504.12516)
- [3] Du et al. (2025) "DeepResearch Bench: A Comprehensive Benchmark for Deep Research Agents" — [arXiv:2506.11763](https://arxiv.org/abs/2506.11763)
- [4] Anthropic (2025) "How we built our multi-agent research system" — [anthropic.com](https://www.anthropic.com/engineering/multi-agent-research-system)
