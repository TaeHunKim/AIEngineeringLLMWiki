# Context Engineering: Sessions & Memory

## 메타데이터
- **파일명**: `Context Engineering_ Sessions & Memory.pdf`
- **저자**: Kimberly Milam, Antonio Gulli (Google) — 기여자 Anant Nawalgaria, Kanchana Patlolla 외
- **발행 시점**: 2025년 11월 최초 발행 → **2026년 5월 업데이트**
- **주제**: stateful·개인화 LLM Agent를 만들기 위한 [[Context_Engineering]] — 대화 단위 working memory인 [[Session_Management]]과 세션 간 영속성인 [[Memory]] 레이어
- **출처 (URL)**: https://www.kaggle.com/whitepaper-context-engineering-sessions-and-memory

## 요약
"Context Engineering = LLM 컨텍스트 윈도우 안의 정보를 동적으로 구성·관리하는 과정"이라는 정의에서 출발한다. Prompt Engineering이 정적 system instruction을 다듬는 일이라면, Context Engineering은 사용자/이력/외부 데이터까지 포함한 **전체 동적 페이로드**를 다룬다. Sessions(대화 1건의 working memory)와 Memory(세션 간 영속성)를 분리해 정의하고, 추출(Extraction)·통합(Consolidation)·저장(Storage)·검색(Retrieval) 파이프라인 전체를 설명한다.

## 핵심 정의
- **Context Engineering** ≠ **Prompt Engineering**. 후자는 정적 시스템 지시문, 전자는 사용자·history·외부 데이터·tool output까지 포함한 동적 페이로드 전체.
- 비유: "mise en place" — 셰프가 조리 전 재료를 모두 갖춰 두는 것.
- 목표: "no more and no less than the most relevant information."

## Context Payload 3 buckets
1. **Reasoning을 가이드하는 컨텍스트**: System Instructions, Tool Definitions, Few-Shot Examples
2. **증거·사실 데이터**: Long-Term Memory, External Knowledge (RAG), Tool Outputs, Sub-Agent Outputs, Artifacts
3. **즉시 대화 정보**: Conversation History, State/Scratchpad, User's Prompt

## Context Rot
컨텍스트가 길어질수록 모델이 critical 정보에 attention을 두는 능력이 감퇴하는 현상.

## 운영 루프 (한 턴당 4단계)
Fetch Context → Prepare Context (blocking, hot path) → Invoke LLM/Tools → Upload Context (background async)

## Sessions
- 사용자별 자기 완결 기록.
- 두 컴포넌트: **events** (user input, agent response, tool call, tool output) + **state** (구조화된 working memory, 예: 장바구니).
- Gemini API의 `List[Content]` (`role`/`parts`) 와 유사.
- 프로덕션은 영속 저장소 필요 (Agent Engine Sessions 등).

### 프레임워크 차이
- **ADK**: 명시적 `Session` 객체 = `Event` 리스트 + 별도 `state`
- **LangGraph**: 공식 session 없음 — state가 곧 session, mutable, 모든 정보를 담음, 히스토리 압축 지원
- 프레임워크는 internal 객체를 LLM별 포맷(예: Gemini `Content` `role`/`parts`)으로 매핑하는 "universal translator"

### Multi-Agent Session Patterns
- **Shared unified history**: 모든 에이전트가 동일 로그를 read/write. tightly coupled task. ADK LLM 주도 위임 시 sub-agent event가 root session에 기록.
- **Separate individual histories**: 각 에이전트의 로그가 분리. Agent-as-a-Tool 또는 A2A로 통신.
- *(2026년 5월 추가)* **Agent Runtime 재엔지니어링**: 멀티에이전트 협업 지원을 위해 **최대 7일 multi-day operations** 지원. 외부 트리거(웹훅·인간 승인) 대기 후 컨텍스트/세션 상태 손실 없이 자동 재개.

### A2A 상호 운용성 문제
프레임워크 추상화가 에이전트를 격리. LangGraph는 ADK의 Session/Event 객체를 native로 못 읽음. 해법: **Memory layer를 framework-agnostic 문자열/딕셔너리로 추상화**.

### 프로덕션 고려사항
- **보안**: 사용자 ACL 격리, 인증된 요청, persist 전 PII redaction (Model Armor) — GDPR/CCPA. *(2026년 5월 추가)* **Agent Sandbox**: Gemini Enterprise Agent Platform이 코드 실행·bash 명령·브라우저 자동화(Computer Use)를 핵심 기업 시스템과 격리하는 보안 환경 제공. 모든 세션 기반 호출은 **Agent Identity**(SPIFFE 기반 암호화 ID)로 완전한 감사 추적 형성.
- **데이터 무결성**: TTL 정책, 결정적 ordering
- **성능**: Session은 hot path → 필터링/압축으로 사이즈 감축. *(2026년 5월 추가)* revamped Agent Runtime이 **sub-second cold start** 및 신규 stateful 인스턴스 수초 내 프로비저닝으로 세션 복원 오버헤드 대폭 감소.

## Long-context 도전과 압축
한계: 컨텍스트 윈도우, 토큰 비용, latency, 품질(autoregressive 오류 누적). 비유: "여행 가방 — 필요한 것만".

### Compaction 전략
1. 마지막 N턴 유지 (sliding window)
2. 토큰 기반 truncation (최신부터 역산)
3. 재귀적 요약 (옛 부분을 AI 요약으로 대체)

ADK 예: `ContextFilterPlugin(num_invocations_to_keep=10)`, `EventsCompactionConfig(compaction_interval=5, overlap_size=1)`.

### 트리거
Count-based (토큰/턴), Time-based (비활성), Event-based (시멘틱/태스크 완료)

## Memory
- 대화에서 추출된 의미 있는 정보의 스냅샷. 프레임워크 독립 서비스.
- 일부 프레임워크는 sessions를 "short-term memory"라 부르지만, 본 문서는 구분.

### 능력
- Personalization (선호 좌석·팀 등)
- Context Window Management
- Data Mining/Insight (집계, privacy-preserving)
- Agent Self-Improvement (procedural memory playbook)

### 스택 역할
User → Agent (개발자 로직) → Agent Framework (ADK, LangGraph) → Session Storage (Agent Engine Sessions, Spanner, Redis) → **Memory Manager** (Agent Engine Memory Bank, Mem0, Zep). Memory manager 단계: **Extraction → Consolidation → Storage → Retrieval**.

### RAG vs Memory
| | RAG | Memory |
|---|---|---|
| 비유 | 연구 사서 | 개인 비서 |
| 데이터 | 사실, 공유 | 동적, 사용자별 |
| 색인 | 배치 (PDF/wiki) | 이벤트 기반 |
| 검색 | tool 호출 | tool 호출 또는 정적 retrieval |
| 형태 | chunk | snippet/structured profile |

### 컴포넌트
- **Content**: 구조화 (`{"seat_preference": "Window"}`) 또는 비구조화 ("The user prefers a window seat")
- **Metadata**: ID, owner, label

### 정보 유형 (인지과학)
- **Declarative** (knowing what): Semantic + Entity/Episodic
- **Procedural** (knowing how): tool 호출 시퀀스

### 조직 패턴
1. **Collections** — 자기 완결 자연어 메모리 다수
2. **Structured user profile** — 연락처 카드처럼 갱신
3. **Rolling summary** — 단일 진화하는 마스터 문서

### 저장 아키텍처
- **Vector DB**: 시멘틱 유사도, "atomic facts"
- **Knowledge Graph**: 엔티티 + 관계, "knowledge triples"
- **Hybrid**: 그래프 엔티티에 vector enrich

### 생성 메커니즘
- **Explicit** ("기억해 둬…") vs **Implicit** (agent 추론)
- **Internal** (프레임워크 내장) vs **External** (별도 서비스)

### Scope
- **User-level** (가장 흔함, 세션 간 지속)
- **Session-level** (한 세션 압축)
- **Application-level/global** (예: "코드네임 XYZ는 프로젝트…", procedural memory — 반드시 sanitize)

### Multimodal Memory
원본 source(multimodal)와 저장 content(보통 text) 구분. 대부분 multimodal source를 처리해 "User expressed frustration about the recent shipping delay" 같은 텍스트 메모리로 저장. 일부는 full multimodal 저장 (예: 로고 이미지). Memory Bank는 `types.Content` + `Part.from_text/from_bytes/from_uri` 지원.

## Memory ETL Pipeline
**Ingestion → Extraction & Filtering → Consolidation → Storage**

Memory Bank API: `client.agent_engines.memories.generate(name=…, scope={"user_id": "123"}, direct_contents_source={"events": [...]}, config={"wait_for_completion": False})`.

### Extraction 기법
- Schema/template 기반 (predefined JSON, structured output)
- Natural language topic 정의
- Few-shot prompting (입력 + 이상적 추출 메모리)
- Memory Bank 예: `customization_configs` → `memory_topics` (managed `USER_PERSONAL_INFO` + custom `business_feedback`), `generate_memories_examples` (이상적 출력: `{"fact": "The user reported that the drip coffee was lukewarm."}`)
- Rolling summary로 verbose 대화 재처리 회피

### Consolidation
- 중복 제거, 충돌 정보 처리, 정보 진화, 활성 "forgetting" (TTL 또는 deferral)
- 연산: UPDATE / CREATE / DELETE/INVALIDATE

### Provenance & Lineage
- Source 종류와 신뢰도:
  - **Bootstrapped** (CRM, 고신뢰 — cold-start 해결)
  - **User Input** (explicit form 고신뢰 / implicit 대화 저신뢰)
  - **Tool Output** (비추천 — brittle/stale, cache로 대체)
- 충돌 해결: 신뢰도 → 최신성 → corroboration
- 데이터 폐기 시: 잔여 source로 재생성
- 추론 시점: confidence score를 system prompt에 주입 (사용자에겐 미노출)

### Pruning Triggers
시간 감쇠, 낮은 confidence, 무관성

### 생성 트리거
Session Completion, Turn Cadence (N턴마다), Real-Time, Explicit Command — 비용 vs 충실도 trade-off

## Memory-as-a-Tool
Agent가 LLM 판단으로 `create_memory`/`generate_memories`를 호출. ADK 예: `VertexAiMemoryBankService` + custom tool — `add_session_to_memory(session)` (Option 1) 또는 `client.agent_engines.memories.generate(...)` (Option 2).

Internal 변형: agent가 직접 추출 후 `direct_memories_source={"direct_memories": [{"fact": query}]}`로 Memory Bank에 consolidation만 위임.

**Background vs blocking**: 메모리 생성은 비싸므로 응답 후 비동기.

## Retrieval
- 조직 형태가 결정 (구조화 프로필 = lookup, collection = 복잡한 검색).
- 점수: **Relevance** (semantic similarity) + **Recency** + **Importance**. 순수 vector relevance만 쓰면 함정.
- 고급: Query rewriting, Reranking (top-50 재순위 — arXiv:2503.08026), 전용 retriever fine-tuning, 캐싱 layer.
- 타이밍: **Proactive** (매 턴 — ADK `PreloadMemoryTool`/`before_model_callback`), **Reactive Memory-as-a-Tool** (`LoadMemoryTool` 또는 custom `load_memory(query)`).

### Inference 위치
- **System instructions**: 권위 높음, 안정적 글로벌 메모리에 적합. 단점: 과도한 영향력, Memory-as-a-Tool 비호환, multimodal 약함. Jinja 템플릿.
- **Conversation history**: noisy, 대화 주입 위험, 1인칭 시점 문제 (user role + user-level memory).
- **Hybrid 권장**.

## Procedural Memory
상업적 관심은 적지만 강력. Lifecycle은 declarative와 평행하지만 추출은 "playbook" 증류, consolidation은 워크플로우 큐레이션, retrieval은 plan을 가져옴. RLHF가 느린 offline weight update라면 procedural memory는 빠른 online in-context learning.

## 평가
- **품질**: Precision, Recall, F1 (golden set 대비)
- **검색 성능**: Recall@K, latency 예산 (예: <200ms)
- **End-to-End 태스크 성공**: LLM judge가 golden answer와 비교

## 프로덕션 메모리 아키텍처 (4-step async flow)
Agent push → Memory manager 백그라운드 큐 처리 → durable DB 영속 → 다음 턴 retrieve.

Race condition 완화: 트랜잭션/optimistic locking, 메시지 큐, exponential backoff 재시도 + dead-letter queue, 멀티 리전 DB 복제.

## 프라이버시/보안
- 사용자/테넌트 레벨 ACL 격리, opt-out·삭제 컨트롤
- persist 전 PII redaction
- **Memory Poisoning** 위험 (arXiv:2503.03704) — Model Armor로 완화
- 공유 procedural memory의 exfiltration 위험 → 익명화

## Key Takeaways
- Sessions = 한 대화의 working memory, Memory = 세션 간 지속 — 둘은 분리해서 설계해야 한다.
- Memory는 "그냥 저장소"가 아니라 ETL 파이프라인 (Extraction → Consolidation → Storage → Retrieval).
- Provenance/Lineage가 빠지면 "garbage in, confident garbage out"이 된다.

## 관련 개념
[[Context_Engineering]] · [[Session_Management]] · [[Memory]] · [[Agents]] · [[RAG]] · [[Embeddings]] · [[Vectorstore]]
