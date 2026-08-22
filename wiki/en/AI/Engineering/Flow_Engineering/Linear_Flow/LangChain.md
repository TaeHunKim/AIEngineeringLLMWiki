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

## LangChain 1.0 (2026): Recentered Around the Core Agent Loop

In v1.0, LangChain kept its chain-centric API but shifted its center of gravity to the **core agent loop** [1]. Three key changes:

### `create_agent`

A fast-path agent-creation API built on the LangGraph runtime. It lets you spin up an agent immediately with any model provider, using just the core agent loop (call model → call tools → repeat):

```python
from langchain.agents import create_agent

agent = create_agent(
    model="claude-opus-5",
    tools=[search_tool, calculator_tool],
)
result = agent.invoke({"messages": [{"role": "user", "content": "..."}]})
```

### Middleware

Plays the same role inside the agent loop that middleware plays in web frameworks. It hooks into fixed points during execution (before/after the model call, before/after a tool call) to intercept or modify behavior:

```python
from langchain.agents.middleware import AgentMiddleware

class LoggingMiddleware(AgentMiddleware):
    def before_model(self, state):
        print(f"State before model call: {state}")

agent = create_agent(model="claude-opus-5", tools=[...], middleware=[LoggingMiddleware()])
```

This lets cross-cutting concerns — guardrail insertion, request retries, dynamic prompt edits, [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|context compaction]] — be slotted in without altering the chain's structure.

### Content Blocks

Adds a standardized `content_blocks` property to message objects that normalizes each provider's differing response formats (text, images, thinking blocks, citations, etc.), giving provider-agnostic, type-safe access.

Following these three changes, LangChain has committed to **no breaking changes until 2.0**, an explicit promise of production stability.

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

LangChain is the standard tool for Linear Flow Engineering. It enables rapid LLM application construction from prototyping to production, with a vast ecosystem (100+ integrations, community) as its advantage. Since v1.0, it has promised stability with no breaking changes, and its center of gravity has shifted from a pure pipeline tool toward an **agent-building tool** — see [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent_Engineering/Agent_Frameworks]] for a broader framework comparison.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] · [[en/AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent_Engineering/Agent_Frameworks]] · [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]]

## Sources
1. LangChain "LangChain and LangGraph Agent Frameworks Reach v1.0 Milestones" (2026) — [langchain.com/blog/langchain-langgraph-1dot0](https://www.langchain.com/blog/langchain-langgraph-1dot0)
- LangChain Official Documentation — [python.langchain.com](https://python.langchain.com)
- LangChain GitHub — [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain)
- LangChain Docs "Agents" — [docs.langchain.com/oss/python/langchain/agents](https://docs.langchain.com/oss/python/langchain/agents)
