---
order: 2
---

# LlamaIndex

## 개요

**LlamaIndex**(구 GPT Index)는 커스텀 데이터 소스와 LLM을 연결하는 데 특화된 Python 프레임워크다. LangChain이 범용 LLM 오케스트레이션에 강점을 가진다면, LlamaIndex는 **데이터 인덱싱과 RAG 파이프라인**에 더 깊이 최적화되어 있다.

## 제창

- **창시자**: Jerry Liu
- **원래 이름**: GPT Index (2022) → LlamaIndex로 개명 (2023)
- **위치**: RAG 특화 프레임워크의 사실상 표준

## 핵심 아키텍처

### Data Layer (데이터 레이어)

**Documents & Nodes**:
```python
from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter

# 문서 로드
documents = [Document(text="LlamaIndex는 RAG 프레임워크입니다...")]

# 파싱 (Node로 분할)
parser = SentenceSplitter(chunk_size=512, chunk_overlap=20)
nodes = parser.get_nodes_from_documents(documents)

# 인덱스 생성
index = VectorStoreIndex(nodes)
```

**SimpleDirectoryReader**: 폴더의 모든 문서 자동 로드
```python
from llama_index.core import SimpleDirectoryReader

documents = SimpleDirectoryReader("./docs").load_data()
```

### Query Layer (쿼리 레이어)

```python
# Query Engine — 단일 질의
query_engine = index.as_query_engine(
    similarity_top_k=5,
    response_mode="compact"  # 또는 "tree_summarize", "refine"
)
response = query_engine.query("LlamaIndex란 무엇인가?")

# Chat Engine — 대화형
chat_engine = index.as_chat_engine(chat_mode="condense_plus_context")
response = chat_engine.chat("이전 답변을 더 자세히 설명해줘")

# Retriever — 검색만
retriever = index.as_retriever(similarity_top_k=3)
nodes = retriever.retrieve("검색 쿼리")
```

## 고급 RAG 기능

### Hierarchical Node Parser

```python
from llama_index.core.node_parser import HierarchicalNodeParser, get_leaf_nodes
from llama_index.core.retrievers import AutoMergingRetriever

# 3단계 계층 파싱 (2048, 512, 128 토큰)
node_parser = HierarchicalNodeParser.from_defaults(
    chunk_sizes=[2048, 512, 128]
)
nodes = node_parser.get_nodes_from_documents(documents)

# 리프 노드로 인덱스 생성
leaf_nodes = get_leaf_nodes(nodes)
index = VectorStoreIndex(leaf_nodes, storage_context=storage_context)

# Auto-merging: 충분한 leaf가 검색되면 parent 반환
retriever = AutoMergingRetriever(
    index.as_retriever(similarity_top_k=12),
    storage_context=storage_context,
    simple_ratio_thresh=0.3
)
```

### Sub-Question Query Engine

복잡한 질문을 서브 질문으로 분해:
```python
from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.core.tools import QueryEngineTool

# 여러 데이터 소스 정의
tools = [
    QueryEngineTool.from_defaults(
        query_engine=financial_engine,
        name="financial_docs",
        description="재무 보고서 관련 질문"
    ),
    QueryEngineTool.from_defaults(
        query_engine=legal_engine,
        name="legal_docs",
        description="법률 문서 관련 질문"
    )
]

# Sub-Question 엔진
engine = SubQuestionQueryEngine.from_defaults(query_engine_tools=tools)
response = engine.query("작년 대비 매출 성장률과 관련 법적 리스크는?")
# → 자동으로 재무 + 법률 서브 질문으로 분해하여 각각 검색
```

### Re-ranking

```python
from llama_index.core.postprocessor import CohereRerank, SentenceTransformerRerank

reranker = CohereRerank(api_key="...", top_n=3)

query_engine = index.as_query_engine(
    similarity_top_k=10,  # 1차 검색: 10개
    node_postprocessors=[reranker]  # 2차 rerank: 상위 3개로 좁힘
)
```

## LlamaIndex vs LangChain

| 기준 | LlamaIndex | LangChain |
|------|-----------|----------|
| **주력** | 데이터 인덱싱 + RAG | 범용 LLM 파이프라인 |
| **인덱스 유형** | 다양 (Vector, Tree, List, KG) | 주로 Vector |
| **RAG 기능 깊이** | 더 깊음 | 기본적 |
| **Agent 지원** | ReAct 등 기본 지원 | LangGraph 필요 |
| **학습 곡선** | 중간 | 높음 |
| **생태계 크기** | LangChain보다 작음 | 더 큼 |

## LlamaCloud

LlamaIndex의 관리형 클라우드 서비스:
- 매니지드 인덱싱 파이프라인
- 자동 재인덱싱 (문서 변경 시)
- 엔터프라이즈 지원

## AI Engineering에서의 역할

LlamaIndex는 RAG 파이프라인의 "스위스 군용 칼"이다. 단순한 VectorStore 기반 RAG부터 Multi-hop RAG, 계층적 검색, 멀티 인덱스 등 복잡한 데이터-LLM 통합 패턴을 지원한다. 데이터가 복잡하거나 정교한 검색 전략이 필요할 때 LangChain보다 LlamaIndex가 더 적합하다.

## 관련 개념
[[LangChain]] · [[Chunking_Strategies]] · [[Advanced_Retrieval]] · [[Vector_Storage]]

## 출처
- LlamaIndex 공식 문서 — [docs.llamaindex.ai](https://docs.llamaindex.ai)
- LlamaIndex GitHub — [github.com/run-llama/llama_index](https://github.com/run-llama/llama_index)
- Galileo AI "LlamaIndex Complete Guide" — [galileo.ai](https://galileo.ai/blog/llamaindex-complete-guide-rag-data-workflows-llms)
