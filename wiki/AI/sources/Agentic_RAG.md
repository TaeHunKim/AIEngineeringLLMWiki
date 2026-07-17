# Sources: Agentic RAG

wiki 문서 [[../Engineering/Context_Engineering/RAG/Agentic_RAG|Agentic RAG]]의 참고 문헌.

---

## 핵심 논문

### Agentic RAG Survey (2025)
- **제목**: Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG
- **저자**: Aditi Singh, Abul Ehtesham, Saket Kumar, Tala Talaei Khoei
- **발표**: arXiv, 2025년 1월
- **링크**: [arXiv:2501.09136](https://arxiv.org/abs/2501.09136)
- **요약**: Agentic RAG의 포괄적 분류 체계(Taxonomy)를 제시. 에이전트 수(cardinality), 제어 구조, 자율성, 지식 표현 기준으로 아키텍처를 분류. 의료·금융·교육 등 응용 분야와 평가·거버넌스 등 오픈 챌린지를 정리.

### Self-RAG (2023)
- **제목**: Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection
- **저자**: Asai et al. (University of Washington)
- **발표**: NeurIPS 2023
- **링크**: [arXiv:2310.11511](https://arxiv.org/abs/2310.11511)
- **요약**: `[Retrieve]`, `[IsRel]`, `[IsSup]`, `[IsUse]` 등 특수 reflection token을 도입해 LLM이 스스로 검색 필요성 및 결과 품질을 판단. 임상 QA 기준 환각률 5.8%로 12개 RAG 변형 중 최저.

### CRAG — Corrective RAG (2024)
- **제목**: Corrective Retrieval Augmented Generation
- **저자**: Yan et al.
- **발표**: arXiv, 2024년 1월
- **링크**: [arXiv:2401.15884](https://arxiv.org/abs/2401.15884)
- **요약**: 검색 결과를 경량 평가자(evaluator)로 Correct / Ambiguous / Incorrect로 분류하고, 낮은 품질의 경우 웹 검색으로 대체하거나 쿼리를 자동 교정. Precision@5 = 0.69, 환각률 10.5%.

---

## 블로그 & 기술 문서

- Weaviate "What Is Agentic RAG?" — [weaviate.io/blog/what-is-agentic-rag](https://weaviate.io/blog/what-is-agentic-rag)
- Neo4j "What is Agentic RAG?" — [neo4j.com/blog/agentic-ai/what-is-agentic-rag](https://neo4j.com/blog/agentic-ai/what-is-agentic-rag/)
- Analytics Vidhya "Top 7 Agentic RAG System Architectures" — [analyticsvidhya.com](https://www.analyticsvidhya.com/blog/2025/01/agentic-rag-system-architectures/)
- GitHub AgenticRAG Survey — [github.com/asinghcsu/AgenticRAG-Survey](https://github.com/asinghcsu/AgenticRAG-Survey)
