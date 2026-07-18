---
order: 2
---

# LlamaIndex

## Overview

**LlamaIndex** (formerly GPT Index) is a Python framework specialized in connecting custom data sources to LLMs. While LangChain excels at general-purpose LLM orchestration, LlamaIndex is more deeply optimized for **data indexing and RAG pipelines**.

## Origin

- **Creator**: Jerry Liu
- **Original name**: GPT Index (2022) → renamed to LlamaIndex (2023)
- **Position**: De facto standard RAG-specialized framework

## Core Architecture

### Data Layer

**Documents & Nodes**:
```python
from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter

# Load document
documents = [Document(text="LlamaIndex is a RAG framework...")]

# Parse (split into Nodes)
parser = SentenceSplitter(chunk_size=512, chunk_overlap=20)
nodes = parser.get_nodes_from_documents(documents)

# Create index
index = VectorStoreIndex(nodes)
```

**SimpleDirectoryReader**: Auto-load all documents in a folder
```python
from llama_index.core import SimpleDirectoryReader

documents = SimpleDirectoryReader("./docs").load_data()
```

### Query Layer

```python
# Query Engine — single query
query_engine = index.as_query_engine(
    similarity_top_k=5,
    response_mode="compact"  # or "tree_summarize", "refine"
)
response = query_engine.query("What is LlamaIndex?")

# Chat Engine — conversational
chat_engine = index.as_chat_engine(chat_mode="condense_plus_context")
response = chat_engine.chat("Please explain the previous answer in more detail")

# Retriever — search only
retriever = index.as_retriever(similarity_top_k=3)
nodes = retriever.retrieve("search query")
```

## Advanced RAG Features

### Hierarchical Node Parser

```python
from llama_index.core.node_parser import HierarchicalNodeParser, get_leaf_nodes
from llama_index.core.retrievers import AutoMergingRetriever

# 3-level hierarchical parsing (2048, 512, 128 tokens)
node_parser = HierarchicalNodeParser.from_defaults(
    chunk_sizes=[2048, 512, 128]
)
nodes = node_parser.get_nodes_from_documents(documents)

# Create index with leaf nodes
leaf_nodes = get_leaf_nodes(nodes)
index = VectorStoreIndex(leaf_nodes, storage_context=storage_context)

# Auto-merging: return parent when enough leaves are retrieved
retriever = AutoMergingRetriever(
    index.as_retriever(similarity_top_k=12),
    storage_context=storage_context,
    simple_ratio_thresh=0.3
)
```

### Sub-Question Query Engine

Decompose complex questions into sub-questions:
```python
from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.core.tools import QueryEngineTool

# Define multiple data sources
tools = [
    QueryEngineTool.from_defaults(
        query_engine=financial_engine,
        name="financial_docs",
        description="Questions about financial reports"
    ),
    QueryEngineTool.from_defaults(
        query_engine=legal_engine,
        name="legal_docs",
        description="Questions about legal documents"
    )
]

# Sub-Question engine
engine = SubQuestionQueryEngine.from_defaults(query_engine_tools=tools)
response = engine.query("What's the revenue growth rate vs last year and related legal risks?")
# → Automatically decomposes into financial + legal sub-questions and retrieves each
```

### Re-ranking

```python
from llama_index.core.postprocessor import CohereRerank, SentenceTransformerRerank

reranker = CohereRerank(api_key="...", top_n=3)

query_engine = index.as_query_engine(
    similarity_top_k=10,  # Stage 1 retrieval: 10 docs
    node_postprocessors=[reranker]  # Stage 2 rerank: narrow to top 3
)
```

## LlamaIndex vs LangChain

| Criterion | LlamaIndex | LangChain |
|-----------|-----------|----------|
| **Specialization** | Data indexing + RAG | General-purpose LLM pipeline |
| **Index types** | Various (Vector, Tree, List, KG) | Mainly Vector |
| **RAG feature depth** | Deeper | Basic |
| **Agent support** | Basic ReAct support | Requires LangGraph |
| **Learning curve** | Medium | High |
| **Ecosystem size** | Smaller than LangChain | Larger |

## LlamaCloud

LlamaIndex's managed cloud service:
- Managed indexing pipeline
- Automatic re-indexing (on document changes)
- Enterprise support

## Role in AI Engineering

LlamaIndex is the "Swiss Army knife" of RAG pipelines. It supports complex data-LLM integration patterns from simple VectorStore-based RAG to Multi-hop RAG, hierarchical retrieval, and multi-index configurations. When data is complex or sophisticated retrieval strategies are needed, LlamaIndex is more suitable than LangChain.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]]

## Sources
- LlamaIndex Official Documentation — [docs.llamaindex.ai](https://docs.llamaindex.ai)
- LlamaIndex GitHub — [github.com/run-llama/llama_index](https://github.com/run-llama/llama_index)
- Galileo AI "LlamaIndex Complete Guide" — [galileo.ai](https://galileo.ai/blog/llamaindex-complete-guide-rag-data-workflows-llms)
