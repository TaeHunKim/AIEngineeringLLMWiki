---
order: 1
---

# LangChain

## Overview

**LangChain** is an open-source Python/JavaScript framework for building complex AI applications centered on LLMs. It provides prompt templates, memory, chains, agents, and tools as modules for easily composing LLM-based pipelines.

## Origin

- **Creator**: Harrison Chase
- **Release**: October 2022 (GitHub public)
- **Characteristics**: Rapid growth (GitHub 50K+ stars in 6 months), de facto standard in LLM framework market

## Core Components

### LCEL (LangChain Expression Language)

A declarative way to compose pipelines. Build chains with Python's `|` operator:

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# LCEL pipeline
prompt = ChatPromptTemplate.from_template("Explain the following topic: {topic}")
model = ChatOpenAI(model="gpt-4o")
output_parser = StrOutputParser()

chain = prompt | model | output_parser

# Execute
result = chain.invoke({"topic": "RAG"})
```

### Prompt Templates

Dynamic prompt generation:
```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert in {role}."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{user_input}")
])
```

### Memory

Multi-turn conversation state management:
```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(
    k=5,  # keep only last 5 turns
    return_messages=True
)
```

### Document Loaders & Text Splitters

Load documents from various sources:
```python
from langchain.document_loaders import PyPDFLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load PDF
loader = PyPDFLoader("document.pdf")
docs = loader.load()

# Chunk
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
chunks = splitter.split_documents(docs)
```

### Retrievers & Vector Stores

RAG pipeline construction:
```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# RAG chain
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## Chain Types

| Chain type | Purpose |
|-----------|---------|
| **LLMChain** | Basic LLM call |
| **RetrievalQA** | RAG Q&A |
| **ConversationalRetrievalChain** | Conversational RAG |
| **SequentialChain** | Sequential chain |
| **MapReduceChain** | Long document processing |
| **Router Chain** | Conditional branching |

## LangChain vs LangGraph

```
LangChain (Linear Flow):
  Input → [Step1] → [Step2] → [Step3] → Output
  Unidirectional, fixed-order pipeline

LangGraph (Graph Flow):
  → Supports cycles
  → Conditional branches (Conditional Edges)
  → State management
  → Human-in-the-Loop
```

LangChain is best for simple pipelines; LangGraph is better for complex agent workflows.

## LangSmith (Observability)

LLM observability platform provided with LangChain:
```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "..."
# All subsequent LangChain executions are automatically traced
```

## Role in AI Engineering

LangChain is the standard tool for Linear Flow Engineering. It enables rapid LLM application construction from prototyping to production, with a vast ecosystem (100+ integrations, community) as its advantage. However, the high level of abstraction and frequent breaking changes on upgrades mean there's a learning curve.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] · [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]]

## Sources
- LangChain Official Documentation — [python.langchain.com](https://python.langchain.com)
- LangChain GitHub — [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain)
