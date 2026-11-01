---
order: 1
---

# LangGraph

## Overview

**LangGraph** is an Agent orchestration runtime that explicitly configures state transitions, branching, cycles, and resumption after interruption. LangChain's `create_agent` also operates on this runtime. The reason for using LangGraph directly is not the possibility of cycles, but **how much you want to directly control the state and execution flow**.

## State, Node, Edge

- **State**: Data passed between nodes. Reducers for each key determine the merge method of updates.
- **Node**: A function that reads the state and returns the value of the key to be changed. It is not necessary to return the entire state every time.
- **Edge**: A path to select the next node. Conditional edges also define termination conditions.

## Minimal Working Example

Python 3.12, `langgraph==1.2.19`. Runs without external models or API keys. The input `{"count": 0}` is incremented from count 3, and the output is `3`. The number increment example verifies only graph control and does not guarantee the success of the LLM or tool.

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver

class CounterState(TypedDict):
    count: int

def increment(state: CounterState):
    return {"count": state["count"] + 1}

def route(state: CounterState):
    return END if state["count"] >= 3 else "increment"

builder = StateGraph(CounterState)
builder.add_node("increment", increment)
builder.add_edge(START, "increment")
builder.add_conditional_edges("increment", route)
graph = builder.compile(checkpointer=InMemorySaver())
config = {"configurable": {"thread_id": "counter-demo"}, "recursion_limit": 10}
result = graph.invoke({"count": 0}, config=config)
print(result["count"])
assert graph.get_state(config).values["count"] == 3
```

## Messages and Tool Loop

The conversation state can use the `MessagesState` or `add_messages` reducer. The common structure is to bind the tool schema to the model, and then `ToolNode` executes the tool call and returns the corresponding tool result. The correspondence between the tool call ID and the result is maintained, and the process terminates if the model does not request a tool.

A general Agent starts from [[en/AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]]'s `create_agent`. When migrating from the old `langgraph.prebuilt.create_react_agent` examples, do not just change the import; check the official migration guide for changes to the prompt, middleware, state, and streaming.

## Checkpoint and Resume

A checkpoint saves the execution state of a thread. It is necessary to distinguish between reading the previous state of the same thread and resuming a stopped node. The pattern for human approval uses `interrupt()` and `Command(resume=...)`, and details are discussed in [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human_in_the_Loop]].

- `InMemorySaver` is for single-process development. A persistent checkpointer is needed for recovery after process restart.
- Even with a checkpoint, exactly-once execution for external payments and email sending is not guaranteed. Design resubmittable nodes and use idempotency keys and result logging for side effects.
- It validates thread access rights per user. It does not simply retrieve the `thread_id` input from other users.
- It includes normal termination conditions along with step, time, and cost limits. `recursion_limit` alone cannot control external request timeouts.

## Selection Criteria and Failure Cases

| Need | Application | Caution |
|---|---|---|
| Conditional execution/looping | Conditional edge | Infinite loop due to missing termination condition |
| Continue execution after human approval | Interrupt + checkpoint | Possible re-execution of some nodes upon resumption |
| Intermediate state checking/recovery | State snapshot | Retention of sensitive data and access control |
| Simple fixed pipeline | LCEL comparison | Unnecessary complexity of state/checkpoint |

## Role in AI Engineering

LangGraph is a state-based execution mechanism for Flow Engineering. It solves problems different from organizational-level Agent authority/budget design or knowledge graphs for retrieval.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern|ReAct Pattern]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows|Cyclic Flows]] · [[en/AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human-in-the-Loop]] · [[en/AI/Engineering/Agent_Engineering/Agent_Architectures|Agent Architectures]]

## Sources
- LangGraph, [Quickstart](https://docs.langchain.com/oss/python/langgraph/quickstart)
- LangChain, [v1 migration guide](https://docs.langchain.com/oss/python/migrate/langchain-v1) (checked 2026-11-01)
- LangGraph, [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
