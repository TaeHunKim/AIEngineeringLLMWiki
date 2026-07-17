# Agent Tools & Interoperability with Model Context Protocol (MCP)

## 메타데이터
- **파일명**: `Agent Tools & Interoperability with Model Context Protocol (MCP).pdf`
- **저자**: Mike Styer, Kanchana Patlolla, Madhuranjan Mohan, Sal Diaz (Google)
- **발행 시점**: 2025년 11월 최초 발행 → **2026년 5월 업데이트**
- **주제**: Foundation 모델이 도구를 어떻게 사용하는가, 그리고 이를 표준화하는 Anthropic의 [[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]](MCP) — 아키텍처·primitive·보안 위협·엔터프라이즈 준비도
- **출처 (URL)**: https://www.kaggle.com/whitepaper-agent-tools-and-interoperability-with-mcp

## 요약
도구 없는 foundation model은 "패턴 예측 엔진"에 불과하다는 전제에서 출발해, [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]]를 (1) Function Tools, (2) Built-in Tools, (3) Agent Tools로 분류하고, 2024년 11월 도입된 MCP가 N×M 통합 문제를 어떻게 푸는지 설명한다. JSON-RPC 2.0과 stdio/Streamable HTTP transport, server·client primitives, 그리고 Tool Shadowing·Confused Deputy 등 보안 위협까지 광범위하게 다룬다. *(2026년 5월 업데이트)* AI 실험에서 보안·프로덕션급 agentic 시스템으로 전환을 돕기 위해 Vertex AI가 **Gemini Enterprise Agent Platform**(Build·Scale·Govern·Optimize 4 pillars)으로 진화했다는 맥락이 추가됨.

## Tool 정의와 분류
- **Tool**: LLM 기반 앱이 모델 외부 작업을 수행하기 위해 사용하는 함수/프로그램. 두 기능 — "know something"(retrieve) 또는 "do something"(act).
- **3가지 유형**:
  - **Function Tools** — 개발자 정의. 예: ADK `set_light_values(brightness, color_temp, context: ToolContext)` (docstring → description).
  - **Built-in Tools** — 모델 서비스 제공. Gemini의 Grounding with Google Search, Code Execution, URL Context, Computer Use.
  - **Agent Tools** — Agent를 도구로 wrap. ADK `AgentTool` 클래스, A2A로 원격 agent를 도구화 가능.

## 기능별 Taxonomy
- Information Retrieval (MCP Toolbox, NL2SQL, RAG)
- Action/Execution
- System/API Integration (Google Connectors: Gmail, Drive, Calendar)
- Human-in-the-Loop

## Tool 작성 베스트 프랙티스
- **이름과 description**: `create_critical_bug_in_jira_with_priority` (NOT `update_jira`).
- **모든 입출력 파라미터 설명**, 짧은 파라미터 리스트, 기본값 제공.
- **예시는 동적 retrieval로 컨텍스트 절약**.
- **동작 기술 ≠ 구현 기술**: "create a bug to describe the issue" (NOT "use the create_bug tool").
- **API 호출이 아닌 Task를 publish**: 수백 파라미터의 엔터프라이즈 API를 그대로 노출하지 말고 사용자 task로 캡슐화.
- **Granularity**: 한 도구 한 책임.
- **출력 간결화**: 큰 데이터는 ADK Artifact Service 같은 외부 저장소로.
- **친절한 에러 메시지**: "No product data found for product ID XXX. Ask the customer to confirm the product name…"

## N×M 통합 문제와 MCP
모델 × 도구 조합마다 커스텀 glue 코드가 필요한 문제. MCP는 LSP(Language Server Protocol)에서 모티브를 가져온 표준이다.

## MCP 아키텍처 — Host / Client / Server
- **Host**: 클라이언트 매니지·tool 오케스트레이션·UX/보안/가드레일 강제
- **Client**: 연결·라이프사이클·메시지 흐름 유지
- **Server**: tool discovery·실행·결과 포매팅, 외부 API 어댑터/프록시

## 통신 레이어
- **JSON-RPC 2.0**. 메시지 4종: Request, Result, Error, Notification.
- 두 transport: **stdio**(local subprocess), **Streamable HTTP**(권장 원격 — SSE 스트리밍 + stateless plain HTTP). 구 HTTP+SSE는 2024-11-05 이후 deprecated.

## MCP Primitives
- **Server-side**: Tools, Resources, Prompts
- **Client-side**: Sampling, Elicitation, Roots
- 클라이언트 지원율 (modelcontextprotocol.io/clients, 2025-09-15): Tools ~99%, Resources 34%, Prompts 32%, Sampling 10%, Elicitation 4%, Roots 5%.

### Tool 정의 필드
`name`, `title`(opt), `description`, `inputSchema`, `outputSchema`(opt이지만 권장), `annotations`(opt: `destructiveHint`, `idempotentHint`, `openWorldHint`, `readOnlyHint`, `title` — 강제력 없는 hint).

예: `get_stock_price` — symbol/date inputSchema, price/date outputSchema.

### Tool 결과
- **Unstructured Content**: Text/Audio/Image (base64 + MIME type)
- **Structured Content**: outputSchema 검증된 JSON
- Resources 링크 (URI + title/description/size/MIME) 또는 embedded resource

### 에러 처리
- JSON-RPC 프로토콜 에러 (예: code -32602 "Unknown tool…")
- 도구 실행 에러: `"isError": true` + content (예: "API rate limit exceeded. Wait 15 seconds…")

### Resources / Prompts / Sampling / Elicitation / Roots
- **Resources**: 파일·DB record·schema·log — LLM 컨텍스트 노출에 주의.
- **Prompts**: 재사용 템플릿. 엔터프라이즈에선 보안 성숙 전까지 권장 안 함.
- **Sampling**: 서버가 클라이언트의 LLM completion 요청 (control flow 역전) — HITL 권장.
- **Elicitation**: 서버가 클라이언트 UI를 통해 사용자에게 추가 정보 요청. spec상 민감정보 요청 금지(강제 안 됨).
- **Roots**: `file:` URI 기반 파일시스템 경계.

## 장점
- 빠른 통합, plug-and-play 생태계, **MCP Registry**(2025년 9월 Anthropic 출시 — 중앙 진실 + OpenAPI spec).
- 런타임 동적 tool discovery, 표준화된 description, "agentic AI mesh"형 모듈 아키텍처, 거버넌스 hook, 사용자 동의 mandate.
- *(2026년 5월 추가)* **거버넌스 기반 제공**: Gemini Enterprise Agent Platform의 **Agent Registry**(승인된 도구·MCP 서버·에이전트 구성의 통합 카탈로그) + Agent Identity 조합으로 엔터프라이즈 수준의 MCP 거버넌스 네이티브 지원.

## 위험과 한계
### 성능/확장성
- **Context Window Bloat**: 모든 tool definition을 컨텍스트에 채우는 문제
- **Degraded Reasoning Quality**: 너무 많은 도구로 모델 혼란
- **Stateful Protocol Challenges**: stateless REST 대비 수평 확장 어려움
- 미래 방향: **RAG-MCP** (도구 검색을 RAG step으로) — arXiv:2505.03275

### 엔터프라이즈 준비도 갭
- Auth (OAuth와 엔터프라이즈 보안 관행 충돌)
- Identity (사용자/agent/서비스 계정 모호) — *(2026년 5월 업데이트)* Gemini Enterprise Agent Platform의 **Agent Identity**가 이를 네이티브 해결: 에이전트에 암호화·검증 가능한 ID를 부여해 완전한 책임 추적 및 세밀한 접근 제어 제공.
- 네이티브 observability 부재 — *(2026년 5월 업데이트)* Apigee가 보완 역할을 계속하는 한편, Google Cloud의 신규 **Agent Observability suite**가 OTel 준수 텔레메트리·상세 실행 트레이스·로깅을 추가로 제공. **Agent Simulation**으로 synthetic 트래픽 대상 에이전트 stress-test 후 프로덕션 배포 가능.

### 보안 Threat Landscape
- **Dynamic Capability Injection**: 서버가 알림 없이 tool 변경 → 명시적 allowlist, 필수 `listChanged` 알림, tool/package pinning, secure API gateway, 통제된 호스팅.
- **Tool Shadowing**: 악성 description이 정상 도구를 덮어쓰는 공격 (예: `secure_storage_service` ← `save_secure_note`가 "save/store/keep/remember"에 트리거) → naming collision 방지(LLM 시멘틱 검증), mTLS, 정책 강제, HITL, 허용 서버 제한.
- **Malicious Tool Definitions / Consumed Contents**: tool descriptor 조작·외부 콘텐츠의 prompt injection → 입력 검증, 출력 sanitization(API token, SSN, 신용카드, Markdown/HTML, URL 차단), 분리된 system prompt, dual-planner architecture, **Model Armor**.
- **Sensitive Information Leaks**: 입출력 필드 어노테이션, **Taint Sources/Sinks** 태깅 (예: free text input는 tainted, `send_email_to_external_address`는 tainted sink).
- **Fine-grained scope 부재**: audience/scope 자격 + 짧은 만료, 최소 권한 원칙, 비밀은 side channel로.
- **Confused Deputy Problem** (부록): MCP 서버가 권한 있는 deputy로서 prompt injection으로 사용자가 못할 작업을 수행 (예: `secret_algorithm.py`를 `backup_2025` 브랜치로 복사). 서버는 자기 권한만 검사, 사용자 권한 미검증.

## 참조 도구/제품
Google ADK (`LlmAgent`, `AgentTool`, `ToolContext`, Artifact Service), Gemini API (`Tool`, `UrlContext`, `gemini-2.5-flash`), Google A2A Protocol, MCP Toolbox, NL2SQL, **Apigee** (MCP 게이트웨이), **Model Armor**, MCP Registry, mTLS.

## Key Takeaways
- 도구는 단순 함수 호출이 아니라 description·schema·error 메시지까지 설계되어야 한다.
- MCP는 Tools가 거의 전부고, 다른 primitive(Resources/Prompts/Sampling/Elicitation/Roots)는 클라이언트 지원이 얇다.
- 보안 위협은 단순 입력 검증이 아니라 Confused Deputy·Tool Shadowing 같은 시스템적 문제로 다뤄야 한다.

## 관련 개념
[[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]] · [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]]
