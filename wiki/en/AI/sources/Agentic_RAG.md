# Sources: Agentic RAG

References for the wiki document [[../Engineering/Context_Engineering/RAG/Agentic_RAG|Agentic RAG]].

---

## Key Papers

### Agentic RAG Survey (2025)
- **Title**: Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG
- **Authors**: Aditi Singh, Abul Ehtesham, Saket Kumar, Tala Talaei Khoei
- **Published**: arXiv, January 2025
- **Link**: [arXiv:2501.09136](https://arxiv.org/abs/2501.09136)
- **Summary**: Presents a comprehensive taxonomy of Agentic RAG. Classifies architectures based on agent cardinality, control structure, autonomy, and knowledge representation. Summarizes application fields such as healthcare, finance, and education, alongside open challenges like evaluation and governance.

### Self-RAG (2023)
- **Title**: Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection
- **Authors**: Asai et al. (University of Washington)
- **Published**: NeurIPS 2023
- **Link**: [arXiv:2310.11511](https://arxiv.org/abs/2310.11511)
- **Summary**: Introduces special reflection tokens such as `[Retrieve]`, `[IsRel]`, `[IsSup]`, and `[IsUse]` to enable the LLM to determine the necessity of retrieval and the quality of the results by itself. Achieved the lowest hallucination rate of 5.8% among 12 RAG variants on clinical QA.

### CRAG — Corrective RAG (2024)
- **Title**: Corrective Retrieval Augmented Generation
- **Authors**: Yan et al.
- **Published**: arXiv, January 2024
- **Link**: [arXiv:2401.15884](https://arxiv.org/abs/2401.15884)
- **Summary**: Classifies retrieval results into Correct / Ambiguous / Incorrect using a lightweight evaluator, and replaces them with web search or automatically corrects the query in case of low quality. Precision@5 = 0.69, hallucination rate of 10.5%.

---

## Blogs & Technical Documents

- Weaviate "What Is Agentic RAG?" — [weaviate.io/blog/what-is-agentic-rag](https://weaviate.io/blog/what-is-agentic-rag)
- Neo4j "What is Agentic RAG?" — [neo4j.com/blog/agentic-ai/what-is-agentic-rag](https://neo4j.com/blog/agentic-ai/what-is-agentic-rag/)
- Analytics Vidhya "Top 7 Agentic RAG System Architectures" — [analyticsvidhya.com](https://www.analyticsvidhya.com/blog/2025/01/agentic-rag-system-architectures/)
- GitHub AgenticRAG Survey — [github.com/asinghcsu/AgenticRAG-Survey](https://github.com/asinghcsu/AgenticRAG-Survey)
