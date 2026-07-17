---
order: 3
---

# Runtime Optimization (런타임 최적화)

## 개요

**Runtime Optimization**은 AI 시스템이 프로덕션에서 실행되는 동안 **비용, 레이턴시, 처리량을 실시간으로 최적화**하는 기술과 전략이다. 모델을 다시 학습하지 않고도 운영 효율을 높이는 방법들을 다룬다.

## 왜 필요한가

```
GPT-4 Turbo 비용 (2024 기준):
  입력: $10 / 1M tokens
  출력: $30 / 1M tokens

월 100만 요청, 평균 2000 토큰/요청:
  비용 = 100만 × 2000 / 1000 × ($10 + $30) / 2 = $40,000/월

→ 10% 절감 = $4,000/월 = $48,000/년
```

## Semantic Cache (시맨틱 캐시)

### 개념

전통적 캐시는 정확한 문자열 일치만 저장한다. **Semantic Cache**는 의미적으로 유사한 질의에 캐시된 응답을 재사용한다.

```
전통 캐시:
  "파이썬이란?" → 캐시 HIT
  "Python이 무엇인가요?" → 캐시 MISS (다른 문자열)

Semantic Cache:
  "파이썬이란?" → 캐시 HIT
  "Python이 무엇인가요?" → 캐시 HIT (의미 유사도 0.94)
```

### 구현

```python
from langchain.cache import InMemoryCache, SQLiteCache
from langchain.globals import set_llm_cache
import numpy as np
from redis import Redis

class SemanticCache:
    def __init__(self, redis_client: Redis, similarity_threshold: float = 0.85):
        self.redis = redis_client
        self.threshold = similarity_threshold
        self.embedding_model = OpenAIEmbeddings()
    
    def _embed(self, text: str) -> np.ndarray:
        return np.array(self.embedding_model.embed_query(text))
    
    def get(self, query: str) -> Optional[str]:
        query_embedding = self._embed(query)
        
        # Redis에서 모든 캐시 항목 임베딩 로드
        cached_keys = self.redis.keys("cache:*")
        
        best_similarity = 0
        best_response = None
        
        for key in cached_keys:
            cached_data = json.loads(self.redis.get(key))
            cached_embedding = np.array(cached_data["embedding"])
            
            # 코사인 유사도 계산
            similarity = np.dot(query_embedding, cached_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(cached_embedding)
            )
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_response = cached_data["response"]
        
        if best_similarity >= self.threshold:
            return best_response  # 캐시 HIT
        return None  # 캐시 MISS
    
    def set(self, query: str, response: str, ttl: int = 3600):
        embedding = self._embed(query)
        cache_entry = {
            "query": query,
            "embedding": embedding.tolist(),
            "response": response
        }
        key = f"cache:{hash(query)}"
        self.redis.setex(key, ttl, json.dumps(cache_entry))

# 사용
cache = SemanticCache(Redis())

def cached_llm_call(query: str) -> str:
    # 캐시 먼저 확인
    cached = cache.get(query)
    if cached:
        return cached  # LLM 호출 없이 즉시 반환
    
    # 캐시 MISS: LLM 호출
    response = llm.invoke(query)
    cache.set(query, response)  # 캐시 저장
    return response
```

### GPTCache

오픈소스 Semantic Cache 라이브러리:

```python
from gptcache import cache
from gptcache.adapter import openai
from gptcache.embedding import Onnx
from gptcache.similarity_evaluation import SearchDistanceEvaluation
from gptcache.manager import CacheBase, VectorBase, get_data_manager

# 캐시 초기화
onnx = Onnx()
data_manager = get_data_manager(CacheBase("sqlite"), VectorBase("faiss", dimension=onnx.dimension))

cache.init(
    embedding_func=onnx.to_embeddings,
    data_manager=data_manager,
    similarity_evaluation=SearchDistanceEvaluation()
)
cache.set_openai_key()

# OpenAI API를 투명하게 캐싱
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "파이썬이란?"}]
)
# 두 번째 유사한 질문: 캐시에서 반환 (API 호출 없음)
```

**GPTCache 성능**:
- 캐시 적중률: 61.6~68.8% (유사 쿼리가 많은 환경)
- 응답 속도: 100ms 이하 (vs LLM 1-10초)
- 비용 절감: 적중률만큼 API 비용 감소

## 모델 라우팅 (Model Routing)

쿼리 복잡도에 따라 적절한 모델 선택:

```python
class ModelRouter:
    """쿼리 복잡도에 따라 최적 모델 선택"""
    
    def __init__(self):
        self.cheap_model = ChatOpenAI(model="gpt-4o-mini")   # $0.15/1M 입력
        self.expensive_model = ChatOpenAI(model="gpt-4o")    # $2.5/1M 입력
    
    def route(self, query: str) -> tuple:
        complexity = self.assess_complexity(query)
        
        if complexity < 0.3:
            return self.cheap_model, "cheap"    # 간단한 질문
        elif complexity < 0.7:
            return self.cheap_model, "cheap"    # 중간 복잡도도 저렴한 모델
        else:
            return self.expensive_model, "expensive"  # 복잡한 분석만 고가
    
    def assess_complexity(self, query: str) -> float:
        """간단한 휴리스틱으로 복잡도 추정"""
        signals = {
            "길이": min(len(query) / 500, 1.0) * 0.3,
            "수학": 0.3 if any(c in query for c in ["계산", "수식", "증명"]) else 0,
            "분석": 0.2 if any(c in query for c in ["분석", "비교", "평가"]) else 0,
            "코드": 0.2 if "코드" in query or "```" in query else 0,
        }
        return sum(signals.values())
```

### RouteLLM *(ICLR 2025)*

UC Berkeley · Anyscale · Canva가 공동 개발한 **학습된 라우터** 프레임워크. 휴리스틱 대신 선호도 데이터(preference data)로 훈련된 모델이 라우팅을 수행한다.

```
RouteLLM 성능 (MT-Bench 기준):
  - 비용 85% 절감
  - GPT-4 Turbo 품질 95% 유지
  - Matrix Factorization 라우터: 쿼리의 14%만 강한 모델로 전달

MMLU:
  - 비용 최대 45% 절감
  - GPT-4 성능 유지

지원 라우터 종류:
  1. BERT 분류기
  2. LLM 기반 분류기
  3. Matrix Factorization (가장 효율적)
  4. Causal LLM
```

```python
# RouteLLM 사용 예시
from routellm.controller import Controller

client = Controller(
    routers=["mf"],   # matrix factorization router
    strong_model="gpt-4o",
    weak_model="gpt-4o-mini",
)

# 자동으로 쿼리 복잡도에 따라 모델 선택
response = client.chat.completions.create(
    model="router-mf-0.11856",  # cost threshold 설정
    messages=[{"role": "user", "content": query}]
)
```

### RouteProfile *(2026년 5월)*

각 LLM의 "프로파일"(강점·약점·비용 특성)을 체계적으로 정의해 라우팅에 활용하는 범용 프레임워크. 단일 쌍(강/약)을 넘어 **다중 모델 풀**에서 최적 모델을 선택한다.

```
2026년 라우팅 트렌드:
  1. Cascade: 약한 모델 먼저 → 불확실하면 강한 모델 재시도
  2. Consensus: 동일 쿼리를 여러 모델에 전송 → 결과 집계
  3. Speculative: 약한 모델이 초안 → 강한 모델이 검증 (Speculative Decoding과 유사)
```

## 배치 처리 (Batching)

여러 요청을 묶어서 처리하면 API 오버헤드 감소:

```python
import asyncio

async def batch_llm_calls(queries: list[str], batch_size: int = 10) -> list[str]:
    """비동기 배치 처리"""
    results = []
    
    for i in range(0, len(queries), batch_size):
        batch = queries[i:i + batch_size]
        
        # 배치 내 병렬 실행
        tasks = [llm.ainvoke(q) for q in batch]
        batch_results = await asyncio.gather(*tasks)
        results.extend(batch_results)
    
    return results
```

## 스트리밍 (Streaming)

Time-to-First-Token 최소화로 체감 속도 향상:

```python
# LangChain 스트리밍
for chunk in llm.stream("긴 분석 리포트 작성해줘"):
    print(chunk.content, end="", flush=True)
    # → 첫 토큰이 0.5초 만에 사용자에게 전달
    # (전체 완료 10초 vs TTFB 0.5초)
```

## 비용 제어 루프 (Cost Control Loop)

```python
class CostControlLoop:
    def __init__(self, monthly_budget_usd: float):
        self.budget = monthly_budget_usd
        self.spent = 0
        self.router = ModelRouter()
    
    def get_current_model(self, query: str):
        """남은 예산에 따라 모델 선택 조정"""
        budget_remaining = 1 - (self.spent / self.budget)
        
        if budget_remaining < 0.1:  # 예산 90% 소진
            return self.router.cheap_model  # 강제로 저렴한 모델
        else:
            model, _ = self.router.route(query)
            return model
    
    def record_cost(self, tokens_used: int, model: str):
        pricing = {"gpt-4o": 0.0025, "gpt-4o-mini": 0.00015}
        cost = tokens_used / 1000 * pricing.get(model, 0.001)
        self.spent += cost
        
        if self.spent > self.budget * 0.8:
            alert_team(f"월 예산 80% 소진: ${self.spent:.2f}/${self.budget}")
```

## Speculative Decoding *(2025년 프로덕션 표준)*

**Speculative Decoding**은 작은 Draft 모델이 토큰을 미리 예측하고, 큰 Target 모델이 일괄 검증하는 기법이다. GPU의 병렬 처리 능력을 활용해 **품질 손실 없이 2-3x 속도 향상**을 달성한다.

```
기존 Autoregressive 생성:
  "The" → "cat" → "sat" → "on"
  (한 번에 토큰 1개, 메모리 로드 4회)

Speculative Decoding:
  Draft 모델: "The cat sat on" (4개 동시 예측)
  Target 모델: 4개를 한 번에 병렬 검증
  → 메모리 로드 1회로 동일한 결과
```

```
2025년 프로덕션 현황:
  - vLLM, SGLang, TensorRT-LLM에 기본 내장
  - NVIDIA H200: 3.6x 처리량 향상 달성
  - Draft 모델이 5-8 토큰 예측 → Target 모델이 병렬 검증
  - 출력 품질: Target 모델과 동일 (수학적으로 동등)

주요 변형:
  - SpecInfer: 트리 구조 draft로 수락 기회 증가
  - EAGLE: 특화 draft head로 수락률 향상
  - Medusa: 여러 head가 여러 토큰을 병렬 예측
```

## 서빙 엔진 내부 구조 (Serving Engine Internals)

Semantic Cache·Routing이 "어떤 요청을 어떻게 줄일 것인가"를 다룬다면, 서빙 엔진은 "각 요청을 GPU에서 어떻게 가장 효율적으로 처리할 것인가"를 다룬다. 프로덕션 셀프호스팅의 표준 스택이 된 세 엔진의 핵심 기법을 정리한다.

### vLLM — PagedAttention과 연속 배칭

```
문제: 전통적 배칭은 배치 내 모든 요청이 같은 길이라고 가정
      → 짧은 응답이 긴 응답을 기다려야 함 (GPU 유휴 시간 발생)
      → KV Cache를 연속된 메모리 블록으로 미리 할당 → 메모리 단편화·낭비

PagedAttention (vLLM, UC Berkeley 2023):
  OS의 가상 메모리 페이징 기법을 KV Cache에 적용
  → KV Cache를 고정 크기 블록(page) 단위로 비연속 할당
  → 메모리 낭비를 4% 미만으로 감소 (기존 시스템 대비 최대 24배 처리량)

Continuous Batching (연속 배칭):
  요청이 완료되는 즉시 배치에서 빠지고 새 요청이 즉시 합류
  → 고정 배치 크기로 기다릴 필요 없음 → GPU 활용률 극대화
```

### SGLang — RadixAttention

Prefix가 많이 겹치는 워크로드(동일 시스템 프롬프트를 공유하는 다수 요청, Few-shot 예시 재사용)에 특화.

```
RadixAttention:
  여러 요청이 공유하는 프롬프트 접두사(prefix)의 KV Cache를
  Radix Tree(트라이 자료구조) 형태로 캐싱·재사용

  예: 시스템 프롬프트 500 토큰을 공유하는 요청 100개
    → 기존: 요청마다 500 토큰 KV Cache 재계산
    → RadixAttention: 공유 접두사는 1회만 계산, 트리에서 재사용
```

Prefix가 많이 겹치는 멀티턴 대화·Few-shot 프롬프팅·에이전트(반복되는 시스템 프롬프트 + 도구 정의)에서 특히 효과적이다.

### TensorRT-LLM — FP8 / NVFP4

NVIDIA의 서빙 엔진으로, 최신 GPU 아키텍처(Blackwell)의 저정밀도 연산을 적극 활용한다. FP8·NVFP4(4비트 부동소수점) 양자화로 처리량을 늘리면서 정확도 손실을 최소화하는 것이 핵심 — 프로덕션 양자화 기법 상세는 → [[Quantization]]

### Disaggregated Prefill/Decode (분리형 서빙)

LLM 추론은 성격이 다른 두 단계로 나뉜다: **Prefill**(입력 프롬프트를 한 번에 처리, GPU 연산 집약적)과 **Decode**(토큰을 하나씩 생성, 메모리 대역폭 집약적). 두 단계를 같은 GPU에서 처리하면 서로의 자원 요구가 충돌한다.

```
기존 (통합 서빙): 하나의 GPU 풀이 Prefill + Decode 모두 처리
  → 긴 Prefill이 진행 중인 Decode의 지연시간을 증가시킴 (헤드 오브 라인 블로킹)

Disaggregated Serving (NVIDIA Dynamo, llm-d 등):
  Prefill 전용 GPU 풀 + Decode 전용 GPU 풀로 물리적 분리
  → Prefill 완료 후 KV Cache를 Decode 풀로 전송(KV Cache Transfer)
  → 각 단계를 독립적으로 스케일링·최적화 가능
```

### 셀프호스팅 서빙 옵션 비교

| 엔진 | 강점 | 적합한 경우 |
|------|------|------------|
| **vLLM** | PagedAttention, 폭넓은 모델 지원, 성숙한 생태계 | 범용 프로덕션 서빙의 기본 선택지 |
| **SGLang** | RadixAttention, 구조화 출력에 강함 | Prefix 공유가 많은 에이전트/멀티턴 워크로드 |
| **TensorRT-LLM** | NVIDIA GPU 최적화, FP8/NVFP4 | 최신 NVIDIA 하드웨어에서 최대 처리량 필요 시 |
| **llama.cpp** | CPU/엣지에서도 실행, 낮은 리소스 요구 | 로컬/엣지 배포, 소규모 모델 |
| **Ollama** | llama.cpp 기반, 매우 쉬운 설치·관리 | 개발자 로컬 환경, 프로토타이핑 |
| **TGI** (HuggingFace) | HuggingFace 생태계 통합 | HF Hub 모델을 빠르게 서빙 |

### 콜드 스타트와 멀티 리전

서버리스 LLM 배포에서는 모델 가중치(수십 GB)를 새 인스턴스에 로드하는 콜드 스타트가 지연시간의 주요 원인이다. 완화 기법: 가중치 프리페칭, 스냅샷 기반 빠른 복원, 최소 인스턴스 유지(warm pool). 멀티 리전 배포 시에는 KV Cache Locality(사용자가 이전에 요청한 리전으로 재라우팅해 캐시 재사용률 유지)가 비용·지연시간에 큰 영향을 준다.

## 최적화 전략 요약

| 전략 | 비용 절감 | 레이턴시 감소 | 구현 복잡도 |
|------|----------|-------------|-----------|
| Semantic Cache | 40-70% | 90%+ | 중간 |
| RouteLLM (학습된 라우터) | 85% | 20-40% | 중간 |
| Model Routing (휴리스틱) | 30-60% | 20-40% | 낮음 |
| Speculative Decoding | 없음 | 2-3x 속도 향상 | 중간 (서빙 프레임워크 내장) |
| Streaming | 없음 | TTFB 80%+ | 낮음 |
| Batching | 10-20% | 처리량 2-5배 | 낮음 |
| Quantization | N/A (자체 호스팅) | 30-50% | 높음 |
| Prompt Compression | 20-40% | 20-30% | 중간 |
| PagedAttention (vLLM) | N/A (자체 호스팅) | 처리량 최대 24배 | 중간 (엔진 내장) |
| RadixAttention (SGLang) | N/A (자체 호스팅) | Prefix 재사용 시 대폭 감소 | 중간 (엔진 내장) |
| Disaggregated Serving | N/A (자체 호스팅) | Prefill/Decode 각각 최적화 | 높음 (인프라 분리 필요) |

## AI Engineering에서의 역할

Runtime Optimization은 AI 서비스가 **경제적으로 지속 가능하도록 하는 엔지니어링**이다. 2025년 이후로 RouteLLM 같은 학습된 라우터가 단순 휴리스틱을 대체하고, Speculative Decoding이 프로덕션 표준이 되면서 같은 모델 품질을 훨씬 낮은 비용·레이턴시로 제공하는 것이 가능해졌다. API 호출 측 최적화(캐싱·라우팅·배칭)와 자체 호스팅 서빙 엔진 내부 최적화(PagedAttention, RadixAttention, Disaggregated Serving)는 서로 다른 레이어이며, 두 레이어를 함께 고려해야 총소유비용(TCO)을 최소화할 수 있다. 게이트웨이·배포 전략 등 조직 차원의 프로덕션 운영은 → [[Production_Operations]]

## 관련 개념
[[Context_Compression]] · [[Quantization]] · [[Continuous_Optimization]] · [[Data_Flywheel]] · [[Memory_and_Semantic_Cache]] · [[Production_Operations]]

## 출처
- GPTCache GitHub — [github.com/zilliztech/GPTCache](https://github.com/zilliztech/GPTCache)
- Ong et al. (ICLR 2025) "RouteLLM: Learning to Route LLMs with Preference Data" — [arxiv.org/abs/2406.18665](https://arxiv.org/abs/2406.18665)
- "Speculative Decoding: 2-3x Faster LLM Inference" (2026) — [blog.premai.io](https://blog.premai.io/speculative-decoding-2-3x-faster-llm-inference-2026/)
- LangChain Caching 문서 — [python.langchain.com](https://python.langchain.com/docs/how_to/llm_caching/)
- Anthropic "Reducing LLM API Costs" — [anthropic.com/docs](https://docs.anthropic.com/en/docs/build-with-claude/caching)
- Kwon et al. (2023) "Efficient Memory Management for LLM Serving with PagedAttention" — [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)
- Zheng et al. (2024) "SGLang: Efficient Execution of Structured Language Model Programs" — [arXiv:2312.07104](https://arxiv.org/abs/2312.07104)
- NVIDIA "TensorRT-LLM" 문서 — [nvidia.github.io/TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/)
- NVIDIA "Dynamo: Disaggregated Serving" — [developer.nvidia.com](https://developer.nvidia.com/blog/introducing-nvidia-dynamo/)
- AI Engineering from Scratch, Phase 17 · Lessons 04-18 (서빙 엔진 내부, Disaggregated Serving, 셀프호스팅) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/17-infrastructure-and-production)
