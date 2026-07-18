---
order: 0
---

# Knowledge Graph

## Overview

A **Knowledge Graph (KG)** is a data model that represents entities (objects) and their relationships in a node-edge structure. Popularized by Google's introduction into search in 2012, it is re-attracting attention in the LLM era as a provider of formalized structural context.

```
[Vector DB limitation]
"Find documents related to Samsung Electronics" → similarity search
→ "What companies does Samsung Electronics collaborate with, and who is their CEO?" cannot be answered

[Knowledge Graph strength]
Samsung Electronics → [partner] → TSMC → [CEO] → C.C. Wei
→ Multi-step relationship reasoning possible
```

## Sub-documents

| Document | Content |
|----------|---------|
| [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/LPG_and_RDF\|LPG & RDF]] | Two KG standards — Property Graph (Neo4j) vs RDF (SPARQL) |
| [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology\|Ontology]] | Formal specification of domain knowledge — OWL, inference engines |
| [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG\|GraphRAG]] | Microsoft 2024 — realizing global search by combining KG + RAG |

## Vector DB vs Knowledge Graph

| Comparison | Vector DB | Knowledge Graph |
|------------|----------|----------------|
| Search method | Semantic similarity | Relationship traversal |
| Strength | Unstructured text | Structured relationships |
| Multi-step reasoning | Difficult | Natural |
| Updates | Index rebuild | Add nodes/edges |
| Best use | Document search | Entity relationship queries |

## LLM + Knowledge Graph Patterns

```
1. GraphRAG: Community summaries from KG → answer global queries
2. KG-to-Text: Graph triples → convert to natural language for context
3. Text-to-Cypher: Natural language queries → convert to Cypher/SPARQL
4. Hybrid: Combine vector similarity + graph traversal
```

## Role in AI Engineering

Knowledge Graph is a core component **when LLMs need to handle structural knowledge**. It enables precise multi-step reasoning that RAG alone cannot achieve in enterprise data (product-category-brand relationships), medical ontologies (disease-symptom-treatment relationships), legal systems (law-clause-precedent relationships), and similar domains.

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]]

## Sources
- Google "Introducing the Knowledge Graph" (2012) — [google.com/intl/es419/insidesearch](https://www.google.com/intl/es419/insidesearch/features/search/knowledge.html)
- Hogan et al. (2021) "Knowledge Graphs" — [arxiv.org/abs/2003.02320](https://arxiv.org/abs/2003.02320)
