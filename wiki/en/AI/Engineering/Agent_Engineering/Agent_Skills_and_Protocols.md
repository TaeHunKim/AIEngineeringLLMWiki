---
order: 6
---

# Agent Skills & Protocols

## Overview

Two infrastructure elements are needed for agents to operate usefully in the real world. One is **Agent Skills** — reusable units of capability — and the other is **Protocols** that standardize communication between agents and between agents and tools.

```
Tool:     Simple function call → get_stock_price("AAPL")
Skill:    Bundled capability → stock analysis skill = multiple tools + prompts + logic
Protocol: Agent ecosystem standard → MCP, A2A
```

---

## Agent Skills

### Concept

Agent Skills are a higher-order concept than tools — reusable units of capability that bundle **multiple tools + prompts + execution logic**.

```
Agent Skill example:
  "Stock Analysis Skill" =
    get_stock_price() +
    get_financial_statements() +
    calculate_ratios() +
    "prompt to analyze P/E, P/B, ROE and present investment opinion"
```

### Anthropic's Agent Skills Concept

Anthropic released "Equipping Agents for the Real World with Agent Skills" in October 2025:

```
Agent Skill composition:
  - Specification: define what it does
  - Tool Bundle: tools needed to execute the skill
  - Instructions: how to combine tools
  - Context: required background knowledge
```

### Skill Design Principles

```python
# Good skill: clear boundaries, single responsibility
class DataAnalysisSkill:
    """
    CSV data analysis skill.
    Input: CSV file path
    Output: statistical summary + visualization + insights
    """
    tools = [python_exec, file_read, chart_generator]
    
    def execute(self, csv_path: str) -> AnalysisReport:
        data = self.load_and_validate(csv_path)
        stats = self.compute_statistics(data)
        charts = self.generate_visualizations(data)
        insights = self.extract_insights(stats)
        return AnalysisReport(stats=stats, charts=charts, insights=insights)
```

---

## Protocol Standards

Key open standards for agents to communicate with the external world:

| | [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP\|MCP]] | [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/A2A\|A2A]] | [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/AG_UI\|AG-UI]] | A2UI | AP2 |
|--|-----|-----|-----|-----|-----|
| **Target** | LLM ↔ tools/services | Agent ↔ Agent | Agent ↔ user UI | Agent → UI component generation | Agent ↔ payment systems |
| **Announced** | Anthropic, Nov 2024 | Google, Apr 2025 | CopilotKit, Jun 2025 | Google, 2026 | Google, Sep 2025 |
| **Governance** | Linux Foundation (Dec 2025~) | Linux Foundation (Jun 2025~) | ag-ui-protocol open source org | Open source (github.com/google/A2UI) | Open protocol (Google + 60+ partners) |

MCP, A2A, AG-UI, A2UI, AP2 are complementary — use MCP to call tools, A2A to delegate to agents, AG-UI for real-time user interaction, A2UI for dynamic UI components, and AP2 for agent payments.

- Details → [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]]
- Details → [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/A2A|A2A]]
- Details → [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/AG_UI|AG-UI]]

---

## A2UI (Agent-to-UI Protocol)

**A2UI** is a declarative protocol for agents to dynamically create and stream UI components (forms, charts, buttons, cards, etc.) during conversation. It moves beyond the limitation of chatbots returning only text blocks, allowing agents to compose interactive UIs tailored to the situation.

### How It Works

A2UI is a **JSONL-based declarative protocol**. Instead of Markdown text tokens, the agent streams JSON objects representing UI components.

```json
// Example A2UI payload streamed by agent (response to stock analysis request)
[
  {
    "id": "header-1",
    "type": "Heading",
    "props": { "level": 2, "text": "Apple (AAPL) Analysis" }
  },
  {
    "id": "chart-1",
    "type": "LineChart",
    "props": {
      "data": [{"date": "2026-01", "price": 220}, {"date": "2026-06", "price": 235}],
      "xKey": "date",
      "yKey": "price",
      "title": "6-month stock price"
    }
  },
  {
    "id": "action-1",
    "type": "Button",
    "props": { "label": "Add to Portfolio", "action": "add_to_portfolio" }
  }
]
```

The client app maintains a "catalog" (list of pre-approved components). Agents can only request components within this catalog, ensuring security.

### Security Model

A2UI is a **declarative data format** — not executable code. Agents request rendering of only trusted component types (Card, Button, Chart, etc.) that the client supports, rather than executing arbitrary JavaScript.

---

## AP2 (Agent Payments Protocol)

**AP2** is an open protocol standardizing how AI agents can safely authorize and execute payments on behalf of users. Announced by Google on September 16, 2025, designed as an extension of A2A and MCP.

### Core Mechanism: 3-Stage Mandate

AP2 structures the purchase flow as three stages of signed documents:

```
1. Intent Mandate
   Created when user gives high-level instructions.
   Signs conditions like "Find the cheapest flight and book it (limit $1,000, by July 2026)"

2. Cart Mandate
   Created when agent finds items matching the conditions.
   Agent can auto-sign if within Intent Mandate conditions.

3. Payment Mandate
   Final document delivered to actual payment network (card/bank/stablecoin).
   Explicitly states "whether human approved or AI approved" for accountability tracking.
```

---

## Role in AI Engineering

Agent Skills enable **modularization and reusability** of capabilities, while MCP/A2A/AG-UI ensure **interoperability** of the agent ecosystem. As agent systems evolve from single agents to agent networks and rich user experiences, the importance of these protocols is rapidly growing.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Agent_Engineering/Agent_Core_Pillars|Agent Core Pillars]] · [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]]

## Sources
- Anthropic (2025) "Equipping Agents for the Real World with Agent Skills" — [anthropic.com](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- Google Developers Blog "Introducing A2UI" — [developers.googleblog.com](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- Google Cloud Blog "Announcing Agent Payments Protocol (AP2)" — [cloud.google.com](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)
