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

### Claude Code Plugins/Skills

```json
// Example SKILL.md structure
{
  "name": "create-word-document",
  "description": "Create and edit Word (.docx) documents",
  "tools": ["python_exec", "file_write"],
  "dependencies": ["python-docx"],
  "prompt": "Use the python-docx library to create Word documents..."
}
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

### Skill Registry

```python
class SkillRegistry:
    def __init__(self):
        self.skills = {}

    def register(self, skill: AgentSkill):
        self.skills[skill.name] = skill

    def discover(self, task_description: str) -> list[AgentSkill]:
        """Semantic search for skills matching the task description"""
        task_embed = embed(task_description)
        return sorted_by_similarity(task_embed, self.skills)
```

---

## Protocol Standards

Key open standards for agents to communicate with the external world:

| | [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP\|MCP]] | [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/A2A\|A2A]] | [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/AG_UI\|AG-UI]] | A2UI | AP2 |
|--|-----|-----|-----|-----|-----|
| **Target** | LLM ↔ tools/services | Agent ↔ Agent | Agent ↔ user UI | Agent → UI component generation | Agent ↔ payment systems |
| **Announced** | Anthropic, Nov 2024 | Google, Apr 2025 | CopilotKit, Jun 2025 | Google, 2026 | Google, Sep 2025 |
| **Governance** | Linux Foundation (Dec 2025~) | Linux Foundation (Jun 2025~) | ag-ui-protocol open source org | Open source (github.com/google/A2UI) | Open protocol (Google + 60+ partners) |
| **Relationship** | Tool integration standard | Agent-to-agent communication standard | Agent-user interaction standard | Agent→UI generation standard | Agent payments standard |

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
    "id": "table-1",
    "type": "DataTable",
    "props": {
      "columns": ["Metric", "Value", "Sector Average"],
      "rows": [
        ["P/E", "12.3", "15.1"],
        ["P/B", "1.2", "1.8"],
        ["ROE", "18.5%", "14.2%"]
      ]
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

```
Security boundary:
  Agent → A2UI JSON → [client catalog validation] → render

  If the agent requests a type not in the catalog → the client rejects it
  The agent cannot directly manipulate the DOM or execute code → attacks like XSS are blocked
```

### Multiplatform Support

The same A2UI JSON payload is rendered by multiple renderers, each adapted to its platform:

| Renderer | Platform | Release |
|--------|--------|---------|
| React | Web | 2026 Q1 |
| Flutter | iOS/Android | 2026 Q2 |
| SwiftUI | iOS Native | 2026 Q2 |
| Jetpack Compose | Android Native | 2026 Q2 |

### Gemini Enterprise App Integration

As of May 2026, the Gemini Enterprise app natively supports A2UI:
- Custom agents can generate dynamic data visualizations, forms, and interactive widgets directly within a user's workspace
- Computer use (agent operates UI) ↔ A2UI (agent generates UI) — complementary approaches

### MCP UI / AG-UI / A2UI Comparison

```
MCP UI:
  Agent controls existing UI elements as a Tool
  "Click this button", "enter a value in this field"
  → Suited for operating existing UI

AG-UI (Agent-User Interaction Protocol, CopilotKit):
  Synchronizes state between agent and client in real time
  Event-driven streaming delivers text, tool calls, and state changes
  → Suited for bidirectional collaboration between agent and user
  Details → [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/AG_UI|AG-UI]]

A2UI:
  Agent generates and streams new UI components on the fly
  Composes situation-optimal UI without predefined templates
  → Suited for generating tailored interactive interfaces
```

---

## AP2 (Agent Payments Protocol)

**AP2 (Agent Payments Protocol)** is an open protocol standardizing how AI agents can safely authorize and execute payments on behalf of users. Announced by Google on September 16, 2025, it is designed as an extension of A2A and MCP, adding a payment layer to the existing agent communication stack [5].

The core problem it addresses: there was previously no way to cryptographically prove that a payment triggered by an agent actually reflected the real user's intent. AP2 solves this by introducing the **Mandate** concept — a user-signed Mandate that clearly defines the scope, limit, and validity period of the agent's payment authority, delivered as a W3C Verifiable Credential [6].

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

Each Mandate has a JWT-like structure with digital signatures, key binding, and expiration timestamps, ensuring integrity, authenticity, and accountability tracking [6].

### Status (announced September 2025, early adoption stage)

Launch partners include Mastercard, PayPal, Coinbase, American Express, Adyen, Revolut, Salesforce, ServiceNow, UnionPay, and over 60 other organizations [5]. In collaboration with Coinbase and the Ethereum Foundation, an **A2A x402 extension** for stablecoin payments was also released.

As of Q1 2026, over 60 partners are in early production adoption, but AP2 is still in an early stage of rollout. Its distinguishing feature is a payment-agnostic design that treats cards, bank transfers, and stablecoins all as first-class citizens.

---

## Role in AI Engineering

Agent Skills enable **modularization and reusability** of capabilities, while MCP/A2A/AG-UI ensure **interoperability** of the agent ecosystem. As agent systems evolve from single agents to agent networks and rich user experiences, the importance of these protocols is rapidly growing.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Agent_Engineering/Agent_Core_Pillars|Agent Core Pillars]] · [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]]

## Sources
- Anthropic (2025) "Equipping Agents for the Real World with Agent Skills" — [anthropic.com](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- Google Developers Blog "Introducing A2UI: An open project for agent-driven interfaces" — [developers.googleblog.com](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/) [1]
- Google Developers Blog "A2UI v0.9: The New Standard for Portable, Framework-Agnostic Generative UI" — [developers.googleblog.com](https://developers.googleblog.com/a2ui-v0-9-generative-ui/) [2]
- AG2 Docs "A2UIAgent: Rich UI from Your AG2 Agents" — [docs.ag2.ai](https://docs.ag2.ai/latest/docs/blog/2026/03/20/AG2-A2UI/) [3]
- A2UI GitHub — [github.com/google/A2UI](https://github.com/google/A2UI) [4]
- Google Cloud Blog "Announcing Agent Payments Protocol (AP2)" — [cloud.google.com](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol) [5]
- Cloud Security Alliance "Secure Use of the Agent Payments Protocol (AP2)" — [cloudsecurityalliance.org](https://cloudsecurityalliance.org/blog/2025/10/06/secure-use-of-the-agent-payments-protocol-ap2-a-framework-for-trustworthy-ai-driven-transactions) [6]
- [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]] — MCP detail page
- [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/A2A|A2A]] — A2A detail page

### References
[1] https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/
[2] https://developers.googleblog.com/a2ui-v0-9-generative-ui/
[3] https://docs.ag2.ai/latest/docs/blog/2026/03/20/AG2-A2UI/
[4] https://github.com/google/A2UI
[5] https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol
[6] https://cloudsecurityalliance.org/blog/2025/10/06/secure-use-of-the-agent-payments-protocol-ap2-a-framework-for-trustworthy-ai-driven-transactions
