---
order: 1
---

# MCP (Model Context Protocol)

## 개요

**Model Context Protocol (MCP)**은 Anthropic이 2024년 11월 오픈소스로 공개한 표준 프로토콜이다. AI Host 애플리케이션과 외부 데이터·도구·서비스 사이의 통신을 표준화한다. "AI를 위한 USB-C"라고도 불리며, 각 통합마다 별도 커넥터를 만들어야 했던 파편화 문제를 해결한다.

```mermaid
flowchart LR
    subgraph before["MCP 이전 — N개 도구 = N개 커스텀 통합"]
        C1[Claude] -->|커스텀 코드| G1[GitHub]
        C1 -->|커스텀 코드| S1[Slack]
        C1 -->|커스텀 코드| D1[DB]
    end
    subgraph after["MCP 이후 — 표준 프로토콜 하나로 모든 통합"]
        C2[Claude] -->|MCP| G2[GitHub MCP Server]
        C2 -->|MCP| S2[Slack MCP Server]
        C2 -->|MCP| D2[DB MCP Server]
    end
```

## 역사 및 현황

- **2024년 11월**: Anthropic이 오픈소스로 공개
- **2025년 11월**: 1주년 기념 Spec 업데이트
- **2025년 12월**: Linux Foundation 산하 Agentic AI Foundation에 기증 — OpenAI, Google, Microsoft, AWS, Block 등 공동 참여
- **2026년 5월 21일**: 2026-07-28 spec Release Candidate 고정
- **2026년 7월 28일**: 2026-07-28 spec 정식 출시 — 출시 이후 가장 큰 개정(stateless core, 공식 extensions 체계, 인가 강화, deprecation 정책). 아래 절 참고
- **2026년 기준**: Tier 1 SDK(TypeScript, Python, Go, C#) 합산 월 약 5억 다운로드, TypeScript·Python SDK는 각각 누적 10억 다운로드 돌파. 수천 개 서드파티 MCP Server 생태계 형성

## 2026-07-28 Spec: Stateless Core와 Extensions

2026-07-28 spec은 breaking change를 포함한다. 핵심은 **프로토콜 수준의 연결 상태를 없애 일반 HTTP 인프라에서 수평 확장되게 한 것**이다.

| 변경 | 내용 | 이전 |
|------|------|------|
| Handshake 제거 (SEP-2575) | 매 요청의 `_meta`에 protocol version·client 정보·capability를 담는다. 필요하면 `server/discover`로 capability를 미리 조회 | `initialize`/`initialized` 교환 |
| Session 제거 (SEP-2567) | `Mcp-Session-Id` 헤더와 프로토콜 세션을 없애 round-robin 로드밸런서 뒤 어느 인스턴스든 요청을 처리. 상태가 필요하면 tool이 명시적 handle(예: `basket_id`)을 발급하고 모델이 인자로 되돌려 준다 | sticky routing, 공유 세션 저장소 |
| Multi Round-Trip Requests (SEP-2322) | Server가 `resultType: "input_required"`와 `requestState`를 반환하면 Client가 `inputResponses`를 붙여 재호출. 재호출은 어느 인스턴스든 받을 수 있다 | 열린 SSE 스트림 위의 Server 발신 `elicitation/create`·`sampling/createMessage`·`roots/list` |
| 라우팅 헤더 (SEP-2243) | Streamable HTTP 요청에 `Mcp-Method`·`Mcp-Name` 필수. gateway가 본문을 파싱하지 않고 라우팅·rate limit | 본문 파싱 필요 |
| 캐시 가능한 목록 (SEP-2549) | `tools/list` 등과 `resources/read` 결과에 `ttlMs`·`cacheScope`, 목록 순서 결정적 | 매번 재조회 |
| Trace context (SEP-414) | `_meta`의 `traceparent`·`tracestate`·`baggage` 키를 W3C Trace Context로 고정 | 비공식 |
| Tool schema (SEP-2106) | `inputSchema`·`outputSchema`가 JSON Schema 2020-12 전체를 지원(`oneOf`, `$ref` 등). 외부 `$ref` 자동 역참조 금지 | 제한된 부분집합 |

**Extensions 체계 (SEP-2133)**: extension은 reverse-DNS ID로 식별하고 capability의 `extensions` 맵으로 협상하며, spec과 별개로 버전이 매겨진다. Tasks, MCP Apps, Enterprise Managed Authorization이 공식 extension이다.

**Deprecation 정책 (SEP-2577)**: Active → Deprecated → Removed 단계를 두고, deprecation부터 제거까지 최소 12개월을 보장한다. 이번 개정에서 **Roots**(→ tool 파라미터·resource URI·서버 설정), **Sampling**(→ LLM provider API 직접 연동), **Logging**(→ stdio는 `stderr`, 구조화 관측은 OpenTelemetry)이 deprecated됐고, 레거시 HTTP+SSE transport도 1년 유예와 함께 공식 deprecated됐다.

마이그레이션 시 주의할 점: `initialize` 호출 제거, 세션 의존 제거, 라우팅 헤더 추가, SSE 기반 Server→Client 질의를 MRTR로 전환, 실험적 Tasks 코드를 새 extension 수명 주기로 이전, 인가 응답의 `iss` 검증, 리소스 없음 오류 코드를 `-32002`에서 `-32602`로 변경.

## 핵심 아키텍처: Host-Client-Server

```mermaid
flowchart TD
    subgraph HOST["HOST (예: Claude Desktop, Cursor)"]
        C1[MCP Client 1]
        C2[MCP Client 2]
    end
    C1 -->|"JSON-RPC 2.0"| SA["MCP Server A<br/>파일 시스템"]
    C2 -->|"JSON-RPC 2.0"| SB["MCP Server B<br/>GitHub API"]
```

- **Host**: LLM 애플리케이션 (Claude Desktop, Cursor, VS Code Copilot 등)
- **MCP Client**: Host 내부에서 특정 MCP Server와 1:1 통신하는 컴포넌트. 세션 상태 관리, 요청 포매팅 담당
- **MCP Server**: 실제 도구·리소스를 노출하는 경량 서버 (로컬 프로세스 또는 원격 API)
- **통신 방식**: JSON-RPC 2.0 (표준화된 원격 프로시저 호출)

## MCP Primitives (4가지 핵심 기능)

| Primitive | 방향 | 설명 | 예시 |
|-----------|------|------|------|
| **Tools** | Client → Server | 함수 실행 — 외부 시스템 상태 변경·계산 수행 | `create_file()`, `send_email()` |
| **Resources** | Client → Server | 데이터 노출 — 파일·DB 레코드를 LLM 컨텍스트에 제공 | 프로젝트 파일, DB 레코드 |
| **Prompts** | Client → Server | 재사용 가능한 프롬프트 템플릿 공유 | "코드 리뷰해줘" 템플릿 |
| **Sampling** | Server → Client | Server가 Host에게 LLM 호출 요청 | Server-initiated AI 생성 |

## 설정 예시

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/project"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_TOKEN": "ghp_..."}
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {"SLACK_BOT_TOKEN": "xoxb-..."}
    }
  }
}
```

## MCP Server 구현 예시 (Python SDK)

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import mcp.types as types

app = Server("my-server")

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_database",
            description="내부 제품 DB에서 검색합니다",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "검색어"},
                    "limit": {"type": "integer", "default": 10}
                },
                "required": ["query"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "search_database":
        results = db.search(arguments["query"], limit=arguments.get("limit", 10))
        return [TextContent(type="text", text=str(results))]

async def main():
    async with stdio_server() as streams:
        await app.run(*streams, app.create_initialization_options())
```

## Transports

MCP Client와 Server가 실제로 메시지를 주고받는 물리적 통로. 용도에 따라 세 가지를 지원한다:

| Transport | 방식 | 적합한 경우 |
|-----------|------|------------|
| **stdio** | 표준 입출력 파이프 | 로컬 프로세스(같은 머신에서 Host가 Server를 자식 프로세스로 실행) |
| **HTTP + SSE** (레거시) | HTTP 요청 + Server-Sent Events로 스트리밍 응답 | 초기 원격 Server 지원 |
| **Streamable HTTP** (2025년 3월~ 표준) | 단일 HTTP 엔드포인트, 필요시 SSE로 업그레이드 | 원격 Server, 로드밸런서 뒤 배포, 재연결 복원력 |

Streamable HTTP는 기존 HTTP+SSE의 "연결이 끊기면 세션 전체 유실" 문제를 해결하며, 2025년 이후 원격 MCP Server의 표준 전송 방식이 됐다. 2026-07-28 spec에서 레거시 HTTP+SSE는 1년 유예와 함께 공식 deprecated됐고, Streamable HTTP는 `Mcp-Method`·`Mcp-Name` 헤더가 필수가 됐다.

## Resources, Prompts, Sampling 심화

### Resources — 데이터 노출

Server가 파일·DB 레코드처럼 **읽기 전용 컨텍스트**를 URI로 노출한다. Tool과 달리 부작용이 없고, Host가 사용자에게 "첨부파일처럼" 보여줄 수 있다.

```python
@app.list_resources()
async def list_resources() -> list[Resource]:
    return [Resource(uri="file:///project/README.md", name="프로젝트 개요", mimeType="text/markdown")]

@app.read_resource()
async def read_resource(uri: str) -> str:
    return open(uri.replace("file://", "")).read()
```

### Prompts — 재사용 가능한 템플릿

Server가 "미리 만들어진 프롬프트 템플릿"을 노출해, 사용자가 슬래시 커맨드처럼 호출할 수 있게 한다 (예: `/review-pr`). Host UI에 템플릿 목록으로 노출되는 것이 일반적이다.

### Sampling — Server가 주도하는 LLM 호출

네 가지 Primitive 중 유일하게 **방향이 반대**다 — Server가 Host에게 "LLM 호출을 대신 해달라"고 요청한다. Server 자체는 LLM API 키를 갖지 않고, Host의 모델·정책을 그대로 사용하도록 설계됐다(비용·거버넌스를 Host가 중앙 통제).

```python
# Server가 Host에게 샘플링을 요청하는 흐름 (개념적)
async def summarize_via_host(large_document: str):
    result = await server.request_sampling(
        messages=[{"role": "user", "content": f"다음을 3줄로 요약: {large_document}"}],
        max_tokens=200,
    )
    return result.content
```

2026-07-28 spec에서 Sampling은 deprecated됐다. 대안은 Server가 LLM provider API와 직접 연동하는 것이다. 최소 12개월은 계속 동작한다.

## Roots와 Elicitation

**Roots**: Client가 Server에게 "작업 가능한 파일시스템/URI 경계"를 명시적으로 알려주는 메커니즘. Server가 프로젝트 루트 바깥을 함부로 건드리지 않도록 하는 최소 권한 원칙의 구현체다.

**Elicitation**(2025년 6월 스펙 추가): Server가 작업 중 **사용자에게 추가 정보를 요청**할 수 있는 표준 방법. 예를 들어 배포 도구 Server가 "어느 환경에 배포할까요? (staging/production)"처럼 실행 중간에 사용자 입력을 되물을 수 있다 — 기존에는 이런 상호작용이 Server마다 제각각이었다.

2026-07-28 spec에서 Roots는 deprecated됐고(tool 파라미터·resource URI로 대체), Elicitation은 열린 스트림 대신 Multi Round-Trip Requests(`input_required` 반환 후 Client 재호출) 방식으로 바뀌었다.

## Async Tasks (비동기 작업)

오래 걸리는 도구 호출(수 분~수 시간)을 위한 표준 패턴. 동기 호출처럼 응답을 기다리지 않고, Server가 작업 ID를 즉시 반환하고 Client가 나중에 상태를 폴링하거나 완료 알림을 받는다.

```
1. Client → Server: "대규모 코드베이스 리팩토링 시작" 요청
2. Server → Client: task_id 즉시 반환 (동기 대기 없음)
3. Client: 필요 시 get_task_status(task_id) 폴링
4. Server: 작업 완료 시 notification 전송
```

[[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]의 장기 실행 에이전트와 자연스럽게 맞물리는 패턴이다 — 몇 시간짜리 MCP 도구 호출도 동일한 프로토콜로 다룰 수 있다.

2026-07-28 spec에서 Tasks는 실험적 core 기능에서 `io.modelcontextprotocol/tasks` extension으로 옮겨졌다. Server가 `tools/call`에 task handle로 응답하면 Client는 `tasks/get`(폴링)·`tasks/update`·`tasks/cancel`로 관리한다. 세션 없이는 범위를 안전하게 한정할 수 없어 `tasks/list`는 제거됐고, 변경 알림은 Client가 알림 유형별로 구독하는 `subscriptions/listen` 스트림으로 받는다. 2025-11-25 실험 API 사용자는 마이그레이션이 필요하다. 사용자 세션 밖에서 오래 도는 에이전트에서의 활용은 [[AI/Engineering/Agent_Engineering/Agent_Applications/Background_Agents|Background_Agents]] 참고.

## MCP Apps (UI 확장)

MCP Server가 텍스트/데이터뿐 아니라 **인터랙티브 UI 컴포넌트**를 Host 안에 렌더링할 수 있게 하는 확장(2026-07-28 spec의 공식 extension, SEP-1865). Server가 보낸 HTML을 Host가 sandboxed iframe에서 렌더링하고, tool이 UI 템플릿을 미리 선언해 Host가 prefetch·캐시·검토할 수 있다. UI에서 시작된 행동도 직접 tool 호출과 같은 JSON-RPC 감사·동의 경로를 거친다. 도구 호출 결과를 표·차트·폼 형태로 직접 보여줄 수 있다. Agent Skills & Protocols의 A2UI([[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols|Agent_Skills_and_Protocols]])와 목적은 비슷하지만, MCP Apps는 "MCP Server가 자신의 도구 결과를 표현하는" 좁은 범위인 반면 A2UI는 에이전트가 임의 UI를 생성하는 더 일반적인 프로토콜이다.

## MCP 보안 심화: OAuth 2.1

초기 MCP는 인증 표준이 없어 Server마다 제각각의 인증을 구현했다. 2025년 스펙은 **OAuth 2.1**을 원격 MCP Server의 표준 인증 방식으로 채택했다.

```
OAuth 2.1 흐름 (MCP 적용):
  1. Client가 Server에 접근 시도 → 인증 필요 응답
  2. Client가 사용자를 인가 서버(Authorization Server)로 리다이렉트
  3. 사용자 로그인·동의 → Authorization Code 발급
  4. Client가 Code를 Access Token으로 교환
  5. 이후 모든 MCP 요청에 Access Token 첨부

MCP 특화 요구사항:
  - PKCE(Proof Key for Code Exchange) 필수 — 퍼블릭 클라이언트 보호
  - Dynamic Client Registration(DCR) — Client가 사전 등록 없이 자동 등록 가능
  - Resource Indicator — 토큰이 특정 MCP Server에만 유효하도록 범위 제한 (토큰 재사용 공격 방지)
```

2026-07-28 spec의 인가 강화: Client는 인가 응답의 `iss` 파라미터를 RFC 9207에 따라 검증해야 하고(SEP-2468), 등록된 자격 증명을 발급한 인가 서버의 issuer에 묶는다(SEP-2352). 데스크톱·CLI Client는 DCR에서 OpenID Connect `application_type`을 선언해 localhost redirect 거부를 피한다(SEP-837). DCR 자체는 Client ID Metadata Documents(CIMD)로 대체될 예정이라 deprecated됐다.

## MCP Gateway와 Registry 생태계

엔터프라이즈 환경에서 수십~수백 개의 MCP Server를 개별 관리하는 것은 비현실적이다. 이를 해결하는 중간 계층 도구들이 2025~2026년 빠르게 성숙했다.

| 도구 | 역할 |
|------|------|
| **LiteLLM** | 여러 LLM Provider + MCP Server를 단일 API 뒤에서 통합 관리, 라우팅·비용 추적 |
| **Portkey** | MCP 트래픽 관측성, 캐싱, 폴백(fallback) 정책 |
| **Kong / Bifrost** | API Gateway 계층에서 MCP 요청에 인증·속도제한·로깅 적용 |

이 도구들은 [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment|Agent_Deployment]]에서 다룬 Google의 엔터프라이즈 전용 Agent Gateway/Registry와 같은 문제(중앙 인증, 거버넌스, 관측성)를 플랫폼 독립적으로 해결한다. 프로덕션 운영 관점의 상세 비교는 → [[AI/Engineering/Loop_Engineering/Production_Operations|Loop_Engineering/Production_Operations]]

## MCP vs Function Calling vs A2A

| | Function Calling | MCP | A2A |
|--|-----------------|-----|-----|
| **대상** | 단일 앱 내 함수 | LLM ↔ 외부 도구/서비스 | 에이전트 ↔ 에이전트 |
| **표준화** | 모델별 상이 | 오픈 표준 | 오픈 표준 |
| **재사용** | 앱 내부에 국한 | Server 한 번 만들면 모든 Host에서 사용 | 에이전트 네트워크 |
| **상태** | Stateless | Stateless | Stateful |
| **거버넌스** | 각 모델 공급사 | Linux Foundation (구 Anthropic) | Linux Foundation |

자세한 A2A 비교 → [[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/A2A|A2A]]

## 보안 위협 5가지

```
1. Prompt Injection via Tools
   악의적 데이터를 MCP 응답에 삽입 → 에이전트 행동 조작

2. Tool Poisoning
   악성 MCP Server가 정상 서버인 척 등록

3. Excessive Permissions
   최소 권한 원칙(least privilege) 위반

4. Data Exfiltration
   민감 데이터를 외부 MCP Server로 전송 유도

5. Rug Pull Attack
   신뢰 구축 후 MCP Server 동작을 사후에 변경
```

**대응 전략**:
- MCP Server 소스 검증 및 서명 확인
- 최소 권한 원칙 적용
- Human-in-the-Loop 승인 게이트
- 민감 데이터 처리 전 명시적 사용자 동의

## 엔터프라이즈 MCP 거버넌스 *(2026년 5월)*

오픈 MCP 표준만으로는 해결되지 않는 엔터프라이즈 요구사항이 있다. Gemini Enterprise Agent Platform은 이를 네이티브 레이어로 해결한다:

```
MCP 엔터프라이즈 갭 → 플랫폼 해결책

Identity (신원 모호성)
  문제: MCP 호출이 어떤 에이전트에서 왔는지 불분명
  해결: Agent Identity (SPIFFE 기반 암호화 ID)
        에이전트마다 검증 가능한 자격증명 자동 부여
        모든 MCP 호출에 발신 에이전트 ID 첨부

Auth (인증 충돌)
  문제: MCP Server의 OAuth와 엔터프라이즈 IAM이 충돌
  해결: Agent Gateway가 중앙에서 인증 통합
        모든 MCP 트래픽이 Gateway를 통과하여 일관된 인증 적용

Observability (관찰 불투명)
  문제: MCP 호출 내부가 블랙박스
  해결: Agent Observability Suite (OTel 준수)
        모든 MCP 호출 자동 계측·추적·로깅

Pre-deployment Validation (배포 전 검증 부재)
  문제: MCP 통합의 안전성을 배포 전에 확인하기 어려움
  해결: Agent Simulation으로 수천 개 합성 시나리오로 사전 테스트

Tool Governance (도구 거버넌스 부재)
  문제: 어떤 MCP Server가 승인되었는지 추적 불가
  해결: Agent Registry — 승인된 MCP Server 중앙 카탈로그
        버전 관리, 팀별 접근 제어, 보안 사전 검토 통합
```

순수 MCP 표준은 프로토콜 표준화에 집중하고, 엔터프라이즈 플레이어들은 그 위에 중앙 거버넌스 레이어를 추가하는 방식으로 수렴하고 있다.

## 생태계 영향

MCP 표준화 효과:
- 개발자는 MCP Server를 한 번만 만들면 Claude, Cursor, VS Code Copilot 등 모든 MCP-compatible Host에서 재사용 가능
- "Long tail of context providers" — 수천 개 서드파티 통합으로 생태계 형성
- OpenAI, Google, Microsoft, AWS 모두 MCP 채택 → 사실상 업계 표준

## AI Engineering에서의 역할

MCP는 **도구 통합의 표준 레이어**다. Function Calling이 "어떻게 함수를 호출하는가"의 문제를 풀었다면, MCP는 "어떤 도구가 어떤 방식으로 노출되는가"를 표준화한다. Agent Engineering 스택에서 외부 세계와의 인터페이스를 담당하며, 에이전트가 커지고 복잡해질수록 MCP의 역할이 중요해진다.

## 관련 개념
[[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/A2A|A2A]] · [[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols|Agent_Skills_and_Protocols]] · [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]] · [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]] · [[AI/Engineering/Agent_Engineering/Agent_Applications/Background_Agents|Background_Agents]]

## 출처
- Anthropic (2024) "Introducing the Model Context Protocol" — [anthropic.com](https://www.anthropic.com/news/model-context-protocol)
- MCP 공식 문서 — [modelcontextprotocol.io](https://modelcontextprotocol.io)
- MCP Blog "One Year of MCP: November 2025 Spec Release" — [blog.modelcontextprotocol.io](https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)
- MCP Blog "The 2026-07-28 MCP Specification Release Candidate" (2026-05-21) — [blog.modelcontextprotocol.io](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)
- MCP Blog "The 2026-07-28 Specification" (2026-07-28) — [blog.modelcontextprotocol.io](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- Wikipedia "Model Context Protocol" — [en.wikipedia.org](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- MCP 공식 스펙 "Transports" · "Authorization" — [modelcontextprotocol.io/specification](https://modelcontextprotocol.io/specification)
- LiteLLM 문서 (MCP Gateway) — [docs.litellm.ai](https://docs.litellm.ai)
- AI Engineering from Scratch, Phase 13 · Lessons 06-18 (MCP 심화, 보안, 게이트웨이) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols)
- [[AI/sources/Agent_Tools_&_Interoperability_with_Model_Context_Protocol_(MCP)|Agent Tools & MCP]] (이 위키의 기존 소스, 2025년 11월 최초 발행 → 2026년 5월 업데이트)
- [[AI/sources/Prototype_to_Production|Prototype_to_Production]] (MCP vs A2A 비교, 2025년 11월 최초 발행 → 2026년 5월 업데이트)
