---
order: 1
---

# LangChain

## 개요

**LangChain**은 LLM을 중심으로 복잡한 AI 애플리케이션을 구축하기 위한 Python/JavaScript 오픈소스 프레임워크다. 프롬프트 템플릿, 메모리, 체인, 에이전트, 도구 등을 모듈로 제공하여 LLM 기반 파이프라인을 쉽게 조합할 수 있다.

## 제창

- **창시자**: Harrison Chase
- **출시**: 2022년 10월 (GitHub 공개)
- **특징**: 빠른 성장 (6개월 만에 GitHub 50K+ stars), LLM 프레임워크 시장의 사실상 표준

## 핵심 구성 요소

### LCEL (LangChain Expression Language)

파이프라인을 선언적으로 구성하는 방식. Python의 `|` 연산자로 체인 구성:

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# LCEL 파이프라인
prompt = ChatPromptTemplate.from_template("다음 주제를 한국어로 설명하세요: {topic}")
model = ChatOpenAI(model="gpt-4o")
output_parser = StrOutputParser()

chain = prompt | model | output_parser

# 실행
result = chain.invoke({"topic": "RAG"})
```

### Prompt Templates

동적 프롬프트 생성:
```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 {role} 전문가입니다."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{user_input}")
])
```

### Memory

멀티턴 대화 상태 관리:
```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(
    k=5,  # 최근 5턴만 유지
    return_messages=True
)
```

### Document Loaders & Text Splitters

다양한 소스에서 문서 로드:
```python
from langchain.document_loaders import PyPDFLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# PDF 로드
loader = PyPDFLoader("document.pdf")
docs = loader.load()

# 청킹
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
chunks = splitter.split_documents(docs)
```

### Retrievers & Vector Stores

RAG 파이프라인 구성:
```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# RAG 체인
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## 체인 유형

| 체인 유형 | 용도 |
|---------|------|
| **LLMChain** | 기본 LLM 호출 |
| **RetrievalQA** | RAG 질의응답 |
| **ConversationalRetrievalChain** | 대화형 RAG |
| **SequentialChain** | 순차 체인 |
| **MapReduceChain** | 긴 문서 처리 |
| **Router Chain** | 조건 분기 |

## LangChain 1.0 (2026): Core Agent Loop 중심 재편

LangChain은 v1.0에서 체인 중심 API를 유지하면서도, 무게중심을 **에이전트 코어 루프**로 옮겼다 [1]. 핵심 변화 세 가지:

### `create_agent`

LangGraph 런타임 위에 구축된 최단 경로 에이전트 생성 API. 어떤 모델 제공자든 core agent loop(모델 호출 → 도구 호출 → 반복)만으로 즉시 에이전트를 만들 수 있다:

```python
from langchain.agents import create_agent

agent = create_agent(
    model="claude-opus-5",
    tools=[search_tool, calculator_tool],
)
result = agent.invoke({"messages": [{"role": "user", "content": "..."}]})
```

### Middleware

웹 프레임워크의 미들웨어와 같은 역할을 에이전트 루프 내부에서 수행한다. 실행 중 정해진 지점(모델 호출 전/후, 도구 호출 전/후)에 개입해 동작을 가로채거나 수정한다:

```python
from langchain.agents.middleware import AgentMiddleware

class LoggingMiddleware(AgentMiddleware):
    def before_model(self, state):
        print(f"모델 호출 전 상태: {state}")

agent = create_agent(model="claude-opus-5", tools=[...], middleware=[LoggingMiddleware()])
```

가드레일 삽입, 요청 재시도, 동적 프롬프트 수정, [[AI/Engineering/Context_Engineering/Agentic_Context_Management|컨텍스트 압축(Compaction)]] 같은 횡단 관심사를 체인 구조를 바꾸지 않고 끼워 넣을 수 있다.

### Content Blocks

모델 제공자마다 다른 응답 형식(텍스트, 이미지, thinking block, 인용 등)을 표준화한 `content_blocks` 속성을 메시지 객체에 추가해, 제공자에 구애받지 않는 타입 안전한 접근을 제공한다.

이 세 변화 이후 LangChain은 **2.0까지 breaking change 없음**을 공식화해, 프로덕션 안정성을 명시적으로 약속하고 있다.

## LangChain vs LangGraph

```
LangChain (Linear Flow):
  입력 → [Step1] → [Step2] → [Step3] → 출력
  단방향, 순서가 고정된 파이프라인

LangGraph (Graph Flow):
  → 순환(Cycle) 지원
  → 조건 분기 (Conditional Edges)
  → 상태 관리 (State)
  → Human-in-the-Loop
```

LangChain은 단순 파이프라인에, LangGraph는 복잡한 에이전트 워크플로우에 적합.

## LangSmith (관찰성)

LangChain과 함께 제공되는 LLM 옵저버빌리티 플랫폼:
```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "..."
# 이후 모든 LangChain 실행이 자동으로 추적됨
```

## AI Engineering에서의 역할

LangChain은 Linear Flow Engineering의 표준 도구다. 프로토타이핑부터 프로덕션까지 빠르게 LLM 애플리케이션을 구축할 수 있게 해주며, 방대한 생태계(100+ 통합, 커뮤니티)가 장점이다. v1.0 이후로는 breaking change 없는 안정성을 약속하며 순수 파이프라인 도구에서 **에이전트 구축 도구**로 무게중심이 이동했다 — 프레임워크 선택 전반의 비교는 [[AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent_Engineering/Agent_Frameworks]] 참고.

## 관련 개념
[[AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex|LlamaIndex]] · [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]] · [[AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph|LangGraph]] · [[AI/Engineering/Agent_Engineering/Agent_Frameworks|Agent_Engineering/Agent_Frameworks]] · [[AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability_and_Tracing]]

## 출처
1. LangChain "LangChain and LangGraph Agent Frameworks Reach v1.0 Milestones" (2026) — [langchain.com/blog/langchain-langgraph-1dot0](https://www.langchain.com/blog/langchain-langgraph-1dot0)
- LangChain 공식 문서 — [python.langchain.com](https://python.langchain.com)
- LangChain GitHub — [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain)
- LangChain Docs "Agents" — [docs.langchain.com/oss/python/langchain/agents](https://docs.langchain.com/oss/python/langchain/agents)
