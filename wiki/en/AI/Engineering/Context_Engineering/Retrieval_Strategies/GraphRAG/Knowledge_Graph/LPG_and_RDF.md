---
order: 1
---

# LPG & RDF (Knowledge Graph Models)

## Overview

Two major data models for implementing Knowledge Graphs. **LPG (Labeled Property Graph)** is used in practical graph DBs (Neo4j, etc.), while **RDF (Resource Description Framework)** is used in semantic web and ontology-based reasoning.

## What Is a Knowledge Graph

A knowledge storage structure representing entities (nodes) and their relationships (edges) as a graph:
```
[Seoul] --(capital_of)--> [South Korea]
[Yi Sun-sin] --(born_in)--> [Asan]
[South Korea] --(located_in)--> [East Asia]
```

## LPG (Labeled Property Graph)

### Characteristics
- **Nodes**: Labels + properties (key-value dictionary)
- **Edges**: Type + properties (directed)
- Query language: Cypher (Neo4j), Gremlin (Apache TinkerPop)

```cypher
// Neo4j Cypher example
CREATE (p:Person {name: "Yi Sun-sin", birth_year: 1545})
CREATE (c:City {name: "Asan"})
CREATE (p)-[:BORN_IN {year: 1545}]->(c)

// Query
MATCH (p:Person)-[:BORN_IN]->(c:City)
WHERE p.birth_year < 1600
RETURN p.name, c.name
```

### Pros
- Fast graph traversal (pointer-based)
- Flexible schema
- Intuitive data modeling
- Optimized for large-scale OLTP graph queries

### Cons
- No formal ontology/reasoning support
- Limited semantic interoperability with external systems

## RDF (Resource Description Framework)

### Characteristics
- W3C standard. All data expressed as **Triples (subject-predicate-object)**
- Uses URIs for global identifiers → semantic interoperability
- Query language: SPARQL
- Reasoning support: Logical reasoning with OWL (Web Ontology Language)

```turtle
# Turtle format RDF example
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:Yi_Sun-sin foaf:birthPlace ex:Asan .
ex:Yi_Sun-sin ex:birthYear "1545"^^xsd:integer .
ex:Yi_Sun-sin rdf:type ex:Admiral .
```

```sparql
# SPARQL query
SELECT ?person ?city
WHERE {
    ?person foaf:birthPlace ?city .
    ?person ex:birthYear ?year .
    FILTER (?year < 1600)
}
```

### Pros
- Formal semantics and logical reasoning possible (OWL)
- Global interoperability (URI-based)
- Strong for distributed data integration (linked data)
- Reusable standardized ontologies

### Cons
- Complex query and data modeling
- Slower than LPG (OLTP performance)
- High developer learning curve

## LPG vs RDF Comparison

| Criterion | LPG | RDF |
|-----------|-----|-----|
| **Data model** | Node + edge + properties | Subject-predicate-object triples |
| **Identifier** | Internal ID | Global URI |
| **Query language** | Cypher, Gremlin | SPARQL |
| **Reasoning** | None by default | OWL reasoning possible |
| **Performance** | Fast | Relatively slow |
| **Schema** | Flexible | Strict (ontology) |
| **Representative DB** | Neo4j, Amazon Neptune | Stardog, AllegroGraph, Virtuoso |
| **Best for** | Social networks, recommendations, fraud detection | Bioinformatics, enterprise knowledge management |

## Changes in the LLM Era

RDF's core assumption ("meaning resides in ontologies") is being challenged by the emergence of LLMs:
```
Traditional RDF: meaning = explicitly defined in ontology
LLM era: meaning = position in embedding space

→ Graph's role shifts to structural context provider for LLMs
→ LPG + Vector is mainstream in practical AI systems
```

## Role in AI Engineering

In AI systems, Knowledge Graphs serve as **structured memory** for LLMs. RDF is suitable for enterprise knowledge management requiring formal reasoning; LPG is suitable for recommendation, fraud detection, and RAG systems requiring fast graph traversal. Graph RAG is primarily implemented on LPG (Neo4j).

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology|Ontology]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG|GraphRAG]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]]

## Sources
- W3C RDF 1.1 Specification — [w3.org](https://www.w3.org/TR/rdf11-concepts/)
- Kargar (2023) "RDF vs. LPG Knowledge Graphs" — [Medium](https://kargarisaac.medium.com/graphs-to-graph-neural-networks-from-fundamentals-to-applications-part-2c-rdf-vs-43f246764e39)
- Galaxy "RDF vs. LPG: The Right Choice for Knowledge Graphs" — [getgalaxy.io](https://www.getgalaxy.io/articles/rdf-vs-lpg-knowledge-graphs)
- Vasiliev "RDF Is a Knowledge Representation Model. LPG Is a Decision Infrastructure." — [Substack](https://sergeyvasiliev.substack.com/p/rdf-is-a-knowledge-representation)
