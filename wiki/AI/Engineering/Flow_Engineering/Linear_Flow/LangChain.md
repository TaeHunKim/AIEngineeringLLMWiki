---
order: 1
---

# LangChain

## 개요

**LangChain**은 모델·도구·메시지를 공통 인터페이스로 연결하고 Agent를 구성하는 프레임워크다. LCEL로 순차 파이프라인을 만들 수 있지만, LangChain v1의 `create_agent`도 LangGraph 위에서 반복 실행되는 Agent를 만든다. 따라서 LangChain과 LangGraph를 단순히 "선형 vs 순환"으로 구분하면 안 된다.

## API 기준과 Legacy 구분

이 문서의 API 기준은 `langchain==1.4.7`, `langgraph==1.2.19`, Python 3.12다(2026-11-01 확인). 서비스 연결 예제는 설명용이며, 모델 접근 권한·API key와 provider 패키지가 필요하다. 특정 모델 이름은 배포 환경에서 지원 여부를 확인해 설정한다.

| 목적 | 현재 구성 | Legacy 코드에서 확인할 것 |
|---|---|---|
| Agent 생성 | `langchain.agents.create_agent` | `langgraph.prebuilt.create_react_agent`에서 migration |
| 프롬프트·메시지·Runnable | `langchain_core` | 옛 `LLMChain` 등은 `langchain-classic` 영역 |
| 대화 상태 | Agent state + checkpointer | `ConversationBufferMemory` 계열을 신규 설계의 기본값으로 사용하지 않음 |
| 문서 로더·splitter | `langchain_community.document_loaders`, `langchain_text_splitters` | 옛 `langchain.document_loaders`·`langchain.text_splitter` import |
| Provider integration | `langchain_openai` 등 별도 패키지 | 모델·패키지 버전을 함께 고정 |

## LCEL: 순차 파이프라인

다음은 외부 API 없이 실행 가능한 최소 예제다. Python 3.12와 `langchain-core==1.7.3`에서 입력 `{"topic": "RAG"}`를 prompt로 만들고 fake model의 문자열을 받는다. 예상 출력은 `Retrieval supplies context.`다. 실제 모델의 품질을 평가하는 예제는 아니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.language_models.fake_chat_models import FakeListChatModel
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("Explain {topic} in one sentence.")
model = FakeListChatModel(responses=["Retrieval supplies context."])
chain = prompt | model | StrOutputParser()
print(chain.invoke({"topic": "RAG"}))
```

RAG에서는 retriever의 `Document` 목록을 본문으로 변환하고, prompt의 변수명과 입력 mapping을 맞춰야 한다. 다음은 `retriever`와 `model`이 준비되어 있다는 전제의 설명용 조각이다.

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

## Agent와 Middleware

설명용 API 예제다. `LANGCHAIN_MODEL`은 `provider:model` 형식으로 지정하며, 해당 provider integration과 인증을 별도로 준비한다. `InMemorySaver`는 프로세스가 종료되면 사라지는 개발용 저장소다.

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
        # 원문 메시지·개인정보 대신 집계값만 관찰
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

`thread_id`는 상태를 구분하는 key이지 인증 수단이 아니다. 애플리케이션에서 사용자와 thread의 소유권을 검증해야 한다. 장기 사용자 기억과 thread-level checkpoint는 별도로 설계한다.

## LangChain과 LangGraph 선택

| 상황 | 출발점 | 확인할 실패 조건 |
|---|---|---|
| 입력→검색→생성처럼 고정된 흐름 | LCEL | 입력 key 불일치, 검색 결과 누락 |
| 모델이 도구를 선택하는 일반 Agent | `create_agent` | tool 실패, 반복 횟수·비용 초과 |
| 승인·분기·복구를 명시적으로 제어 | LangGraph `StateGraph` | replay 중 side effect 중복, checkpoint 유실 |

프레임워크를 바꾼다고 검색 품질이나 권한 검증이 자동으로 해결되지는 않는다. Middleware는 [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic_Context_Management]]와 guardrail을 연결하는 지점이며, tracing에는 민감 정보 redaction과 sampling 정책이 필요하다.

## AI Engineering에서의 역할

LangChain은 모델 integration과 Agent 구성의 공통 인터페이스를 제공한다. 더 세밀한 실행 순서·상태 전이를 설계할 때는 LangGraph를 직접 사용한다. LangSmith 같은 observability 도구는 선택 사항이며, 추적 설정과 데이터 전송 범위를 별도로 검토한다.

## 관련 개념
[[AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]] · [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]] · [[AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] · [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks|Agent_Engineering/Agent_Frameworks]] · [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability_and_Tracing]]

## 출처
- LangChain, [v1 migration guide](https://docs.langchain.com/oss/python/migrate/langchain-v1) (2026-11-01 확인)
- LangChain, [Short-term memory](https://docs.langchain.com/oss/python/langchain/short-term-memory)
