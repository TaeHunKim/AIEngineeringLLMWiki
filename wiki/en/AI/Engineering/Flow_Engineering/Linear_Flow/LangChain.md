---
order: 1
---

# LangChain

## Overview

**LangChain** is a framework that connects models, tools, and messages via a common interface and constructs Agents. While LCEL allows for sequential pipelines, LangChain v1's `create_agent` also creates Agents that run iteratively on LangGraph. Therefore, one should not simply distinguish between LangChain and LangGraph as "linear vs. cyclical."

## API Standards and Legacy Distinction

The API standards for this document are `langchain==1.4.7`, `langgraph==1.2.19`, and Python 3.12 (confirmed as of 2026-11-01). The service connection examples are for illustration and require model access permissions, API keys, and the provider package. Specific model names should be configured after verifying support in the deployment environment.

| Purpose | Current Configuration | To Check in Legacy Code |
|---|---|---|
| Agent Creation | `langchain.agents.create_agent` | Migration from `langgraph.prebuilt.create_react_agent` |
| Prompt · Message · Runnable | `langchain_core` | Old `LLMChain`, etc., are in the `langchain-classic` area |
| Conversation State | Agent state + checkpointer | Do not use the `ConversationBufferMemory` series as the default for the new design |
| Document Loader · Splitter | `langchain_community.document_loaders`, `langchain_text_splitters` | Old `langchain.document_loaders`·`langchain.text_splitter` imports |
| Provider Integration | `langchain_openai` and other separate packages | Fix model and package versions together |

## LCEL: Sequential Pipelines

This minimal example runs without external APIs. With Python 3.12 and `langchain-core==1.7.3`, it turns `{"topic": "RAG"}` into a prompt and receives a string from a fake model. The expected output is `Retrieval supplies context.` It does not evaluate a real model's quality.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.language_models.fake_chat_models import FakeListChatModel
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("Explain {topic} in one sentence.")
model = FakeListChatModel(responses=["Retrieval supplies context."])
chain = prompt | model | StrOutputParser()
print(chain.invoke({"topic": "RAG"}))
```

In RAG, convert the retriever's `Document` list to text and align the prompt variables with the input mapping. The following illustrative fragment assumes that `retriever` and `model` have already been configured.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

rag_prompt = ChatPromptTemplate.from_template(
    "Answer using the context. If unsupported, say you do not know.\n"
    "Context: {context}\nQuestion: {question}"
)
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt | model | StrOutputParser()
)
```

## Agent and Middleware

This is an example API for explanation. `LANGCHAIN_MODEL` is specified in the `provider:model` format, and the corresponding provider integration and authentication must be prepared separately. `InMemorySaver` is a development storage that disappears when the process terminates.

```python
import os
from langchain.agents import create_agent
from langchain.agents.middleware import AgentMiddleware
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

@tool
def lookup_policy(topic: str) -> str:
    """Return a small demo policy entry."""
    return {"returns": "Returns are accepted within 30 days."}.get(topic, "Unknown topic.")

class StepCounter(AgentMiddleware):
    def before_model(self, state, runtime):
        # Observe aggregate values instead of raw messages or personal information
        print({"message_count": len(state["messages"])})
        return None

agent = create_agent(
    model=os.environ["LANGCHAIN_MODEL"],
    tools=[lookup_policy],
    middleware=[StepCounter()],
    checkpointer=InMemorySaver(),
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "What is the returns policy?"}]},
    config={"configurable": {"thread_id": "demo-thread"}},
)
```

`thread_id` is a key that distinguishes the state, not an authentication method. The application must verify the ownership of the user and thread. Long-term user memory and thread-level checkpoints are designed separately.

## Choosing between LangChain and LangGraph

| Scenario | Starting Point | Failure Conditions to Check |
|---|---|---|
| Fixed flow like Input → Search → Generation | LCEL | Input key mismatch, missing search results |
| General Agent where the model selects tools | `create_agent` | Tool failure, exceeding iteration count/cost |
| Explicitly controlling approval, branching, and recovery | LangGraph `StateGraph` | Duplicate side effects during replay, checkpoint loss |

Switching frameworks does not automatically solve search quality or authorization verification. Middleware is the point connecting [[en/AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic_Context_Management]] and guardrails, and tracing requires sensitive information redaction and sampling policies.

## Role in AI Engineering

LangChain provides a common interface for model integration and Agent construction. When designing more granular execution order and state transitions, LangGraph is used directly. Observability tools like LangSmith are optional, and tracking setup and data transmission scope are reviewed separately.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] · [[en/AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks|Agent_Engineering/Agent_Frameworks]] · [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability & Tracing]]

## Sources
- LangChain, [v1 migration guide](https://docs.langchain.com/oss/python/migrate/langchain-v1) (Checked 2026-11-01)
- LangChain, [Short-term memory](https://docs.langchain.com/oss/python/langchain/short-term-memory)
