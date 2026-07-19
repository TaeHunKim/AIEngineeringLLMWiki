---
order: 6
---

# Open Knowledge Format (OKF)

## Overview

**Open Knowledge Format (OKF)** is an open standard for packaging organizational knowledge for AI agents, announced by Google Cloud on June 12, 2026. It uses a directory structure of markdown files with YAML frontmatter to package organizational knowledge in a form that AI agents can predictably consume.

```
OKF's core proposition:
  Represent organizational knowledge (table schemas, API specs, business metrics, runbooks)
  in a single standard format compatible with any LLM or framework
  → "Pay the cost of knowledge representation once"
```

## Background: Why It's Needed

### The Fragmented Organizational Knowledge Problem

For AI agents to operate usefully in the real world, they need vast amounts of **internal organizational knowledge**. But this knowledge is scattered everywhere:

```
Reality:
  - Metadata catalogs (data teams)
  - Internal wikis (engineering teams)
  - Code comments (developers)
  - Slack conversations (everyone)
  - Engineers' heads (lost when they leave)

Result:
  - Every agent builder solves the context assembly problem from scratch
  - Every catalog vendor reinvents the same data models
  - Knowledge becomes locked inside specific platforms
```

### The LLM-wiki Pattern → OKF

Even before OKF emerged, practitioners were naturally using the "LLM-wiki pattern" — managing context with a directory of markdown files. OKF formalizes this battle-tested pattern into an official vendor-neutral standard.

> **Note**: This wiki itself is an example of the LLM-wiki pattern. The markdown files with `order:` frontmatter, directory structure, and wikilinks forming a concept graph — this is exactly what OKF describes as a standard.

## Core Structure

### File System-Based Bundle

An OKF bundle is a directory where **one markdown file = one concept**:

```
knowledge-bundle/
├── orders_table.md          # orders table schema
├── revenue_metric.md        # revenue metric definition
├── payment_service_api.md   # payment service API
├── db_runbook.md            # DB incident runbook
└── customer_join_path.md    # customers ↔ orders join path
```

### YAML Frontmatter Spec

Each file consists of YAML frontmatter + markdown body:

```yaml
---
type: table              # (required) the type of this concept
title: "orders"          # (optional) human-readable name
description: "Table storing all customer order records"
resource: "bigquery://myproject.prod.orders"  # (optional) pointer to actual resource
tags: ["ecommerce", "transactional"]          # (optional) categorical tags
timestamp: "2026-06-01T00:00:00Z"            # (optional) created/modified datetime
# Any additional custom fields can be added freely
---

# orders table

Contains order ID, customer ID, product list, and payment status.

## Columns

| Column | Type | Description |
|--------|------|-------------|
| order_id | STRING | Unique order identifier (UUID) |
| customer_id | STRING | Customer identifier → [customers](./customers_table.md) |
| created_at | TIMESTAMP | Order creation timestamp (UTC) |
| status | STRING | 'pending', 'confirmed', 'shipped', 'delivered' |
| total_amount | FLOAT | Final payment amount |

## Business Rules

- Cancellations after `status = 'confirmed'` create a separate refund record
- Partitioned by `created_at` (always include partition condition in daily queries)
```

**Design philosophy**: The only required field is `type`. Everything else is optional, and custom fields can be added freely. Markdown links create cross-references between concepts → forming a graph that agents can traverse.

### Example `type` Values

```
table       — DB table/view
metric      — KPI, business metric
api         — API endpoint
runbook     — Operations procedure
dataset     — Dataset
concept     — Domain concept (business term definition)
service     — Internal service
```

## Usage Example: How an Agent Reads OKF

```python
import os
import yaml

def load_okf_bundle(bundle_dir: str) -> list[dict]:
    """Load all concepts from an OKF bundle directory"""
    concepts = []
    for fname in os.listdir(bundle_dir):
        if not fname.endswith(".md"):
            continue
        with open(os.path.join(bundle_dir, fname)) as f:
            content = f.read()
        
        # Parse YAML frontmatter
        if content.startswith("---"):
            parts = content.split("---", 2)
            metadata = yaml.safe_load(parts[1])
            body = parts[2].strip()
        else:
            metadata, body = {}, content
        
        concepts.append({
            "file": fname,
            "metadata": metadata,
            "content": body
        })
    return concepts

# Inject into agent context
bundle = load_okf_bundle("./knowledge-bundle")

# Filter by type (when agent only needs table info)
tables = [c for c in bundle if c["metadata"].get("type") == "table"]

# Assemble context to pass to LLM
context = "\n\n".join([
    f"## {c['metadata'].get('title', c['file'])}\n{c['content']}"
    for c in tables
])
```

**Key feature**: No database, no runtime, no API keys needed. Just read from the file system.

## Relationship with RAG

OKF and RAG are **complementary layers, not competitors**:

```
OKF (knowledge structuring standard):
  - Defines "what the agent needs to know"
  - Packages organizational knowledge as structured markdown
  - In a form agents can directly read and reason over

RAG (retrieval execution strategy):
  - Handles "how to find relevant knowledge"
  - Uses vector search, hybrid search, etc. to retrieve relevant concepts from OKF bundles
  - Manages context size for large bundles

Combined pattern:
  OKF bundle → (vector indexing) → RAG retrieval → agent context injection
```

Small bundles (tens to hundreds of files) can have their full content placed in context; large bundles use RAG to selectively retrieve only relevant concepts.

## Comparison with JSON-LD / RDF

Comparing with existing knowledge representation standards:

| | OKF | JSON-LD | RDF/OWL |
|---|---|---|---|
| Authoring difficulty | Very low (markdown) | Medium | High |
| Required expertise | None | JSON + contexts | Semantic web expert |
| AI readability | Natural language, high | Structured data | Requires inference engine |
| Human readability | High | Medium | Low |
| Runtime/DB needed | No | No | Triple store required |
| Expressiveness | Free-form markdown | Strict schema | Formal logic |

OKF's positioning: a pragmatic standard that's "easy for engineers to write, readable by AI agents."

## Vendor Neutrality

OKF is not tied to any specific cloud, database, or AI model:

```
Any LLM:        OpenAI, Anthropic, Gemini, open-source models all read it identically
Any framework:  LangChain, LlamaIndex, custom implementations all compatible
Any environment: Local, cloud, air-gapped environments all work
Any language:   Any language capable of file I/O — Python, Go, TypeScript, etc.
```

## Role in AI Engineering

OKF standardizes the **"organizational knowledge layer"** of Context Engineering. While RAG solves "how to retrieve relevant information," OKF solves the prior step: "in what format should organizational knowledge be represented."

In practice, OKF addresses:
- Eliminating the repeated context assembly code written for every AI project
- Enabling domain experts (data teams, backend teams) to contribute knowledge without AI infrastructure
- Sharing the same organizational knowledge across agents (can be served as "Knowledge" resources via MCP Server)

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Knowledge_Graph|Knowledge Graph]] · [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]]

## Sources
- Google Cloud (2026-06-12) "How the Open Knowledge Format can improve data sharing" — [cloud.google.com/blog](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing/)
- Google Cloud Platform "knowledge-catalog" GitHub — [github.com/GoogleCloudPlatform/knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog)
- OKF Official Spec — [github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- MindStudio "What Is the Open Knowledge Format (OKF)?" — [mindstudio.ai/blog](https://www.mindstudio.ai/blog/what-is-open-knowledge-format-okf-google-llm-wiki-standard)
- Analytics Vidhya "OKF: Redefining Knowledge Bases for AI Agents" — [analyticsvidhya.com](https://www.analyticsvidhya.com/blog/2026/07/open-knowledge-format-okf/)
