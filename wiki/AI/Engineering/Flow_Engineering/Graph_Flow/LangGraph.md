---
order: 1
---

# LangGraph

## 개요

**LangGraph**는 상태 전이·분기·순환·중단 후 재개를 명시적으로 구성하는 Agent orchestration runtime이다. LangChain의 `create_agent`도 이 runtime 위에서 동작한다. LangGraph를 직접 쓰는 이유는 순환 가능 여부가 아니라 **상태와 실행 흐름을 어디까지 직접 제어할 것인가**에 있다.

## State, Node, Edge

- **State**: node 사이에 전달되는 데이터. key별 reducer가 update의 병합 방식을 정한다.
- **Node**: state를 읽고 변경할 key의 값을 반환하는 함수. 전체 state를 매번 반환할 필요는 없다.
- **Edge**: 다음 node를 선택하는 경로. 조건부 edge는 종료 조건을 함께 정의한다.

## 실행 가능한 최소 예제

Python 3.12, `langgraph==1.2.19`. 외부 모델·API key 없이 실행한다. 입력 `{"count": 0}`에서 count를 3까지 증가시키며, 출력은 `3`이다. 숫자 증가 예제는 graph 제어만 검증하고 LLM이나 tool의 성공을 보장하지 않는다.

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

## Messages와 Tool Loop

대화 state에는 `MessagesState` 또는 `add_messages` reducer를 사용할 수 있다. 모델에 tool schema를 바인딩하고, `ToolNode`가 tool call을 실행한 뒤 대응하는 tool result를 돌려주는 구조가 일반적이다. 도구 호출 ID와 결과의 대응을 유지하고, 모델이 tool을 요청하지 않으면 종료한다.

일반 Agent는 [[AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]]의 `create_agent`에서 시작한다. 옛 `langgraph.prebuilt.create_react_agent` 예제를 옮길 때는 import만 바꾸지 말고 prompt·middleware·state·streaming 변경을 공식 migration guide로 확인한다.

## Checkpoint와 재개

Checkpoint는 thread의 실행 상태를 저장한다. 같은 thread의 이전 상태를 읽는 것과, 중단된 node를 재개하는 것은 구분해야 한다. Human approval에는 `interrupt()`와 `Command(resume=...)`를 사용하는 패턴이 있으며 상세는 [[AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human_in_the_Loop]]에서 다룬다.

- `InMemorySaver`는 단일 프로세스 개발용이다. 프로세스 재시작 후 복구에는 영속 checkpointer가 필요하다.
- Checkpoint가 있어도 외부 결제·메일 전송의 exactly-once 실행이 보장되지는 않는다. 재실행 가능한 node를 설계하고 side effect에는 idempotency key와 결과 기록을 사용한다.
- 사용자별 thread 접근 권한을 검증한다. 다른 사용자의 `thread_id`를 입력받아 그대로 조회하지 않는다.
- 정상 종료 조건과 step·시간·비용 한도를 함께 둔다. `recursion_limit`만으로 외부 요청 timeout까지 제어할 수는 없다.

## 선택 기준과 실패 사례

| 필요 | 적용 | 주의점 |
|---|---|---|
| 조건부 실행·순환 | Conditional edge | 종료 조건 누락으로 무한 반복 |
| 사람 승인 후 계속 실행 | Interrupt + checkpoint | 재개 시 node 일부 재실행 가능 |
| 중간 상태 검사·복구 | State snapshot | 민감 데이터 retention과 접근 통제 |
| 단순 고정 pipeline | LCEL도 비교 | 불필요한 state·checkpoint 복잡도 |

## AI Engineering에서의 역할

LangGraph는 Flow Engineering의 상태 기반 실행 메커니즘이다. 조직 수준의 Agent 권한·예산 설계나 검색용 Knowledge Graph와는 다른 문제를 해결한다.

## 관련 개념
[[AI/Engineering/Flow_Engineering/Linear_Flow/LangChain|LangChain]] · [[AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern|ReAct_Pattern]] · [[AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows|Cyclic_Flows]] · [[AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human_in_the_Loop]] · [[AI/Engineering/Agent_Engineering/Agent_Architectures|Agent_Architectures]]

## 출처
- LangGraph, [Quickstart](https://docs.langchain.com/oss/python/langgraph/quickstart)
- LangChain, [v1 migration guide](https://docs.langchain.com/oss/python/migrate/langchain-v1) (2026-11-01 확인)
- LangGraph, [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
