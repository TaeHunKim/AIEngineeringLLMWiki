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

LangChain은 Linear Flow Engineering의 표준 도구다. 프로토타이핑부터 프로덕션까지 빠르게 LLM 애플리케이션을 구축할 수 있게 해주며, 방대한 생태계(100+ 통합, 커뮤니티)가 장점이다. 다만 추상화가 복잡하고 업그레이드 시 breaking change가 잦아 학습 곡선이 있다.

## 관련 개념
[[LlamaIndex]] · [[Tool_Use_and_Function_Calling]] · [[LangGraph]] · [[Observability_and_Tracing]]

## 출처
- LangChain 공식 문서 — [python.langchain.com](https://python.langchain.com)
- LangChain GitHub — [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain)
