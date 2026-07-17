---
order: 7
---

# Agent Frameworks (에이전트 프레임워크)

## 개요

[[Anthropic_Workflow_Patterns|Workflow Patterns]]가 "언제 프레임워크가 필요한가"의 기준을 제시했다면, 이 문서는 "어떤 프레임워크를 고를 것인가"를 다룬다. 2024~2026년 사이 프로덕션급 에이전트 프레임워크가 빠르게 성숙했다. 각 프레임워크는 서로 다른 설계 철학(상태 그래프, 액터 모델, 역할 크루, SDK 네이티브)에서 출발했다.

## LangGraph — 상태 그래프

[[LangGraph]] 문서에서 상세히 다룬다. StateGraph 기반으로 노드·엣지를 명시적으로 정의하며, cyclical flow와 durable execution(체크포인트 기반 재개)이 강점이다. LangChain 생태계와 통합이 깊다.

## AutoGen v0.4 — Actor Model

Microsoft Research가 개발. v0.4에서 **액터 모델(Actor Model)** 기반으로 전면 재설계됐다 — 각 에이전트가 독립된 액터로서 비동기 메시지를 주고받는다.

```python
from autogen_core import SingleThreadedAgentRuntime, AgentId
from autogen_core.models import UserMessage

runtime = SingleThreadedAgentRuntime()

# 각 에이전트는 독립 액터 — 메시지 큐를 통해서만 통신
await runtime.send_message(
    UserMessage(content="시장 조사 보고서를 작성해줘", source="user"),
    AgentId("researcher", "default"),
)
runtime.start()
```

**특징**:
- 액터 간 통신이 완전 비동기 — 대규모 멀티 에이전트 확장에 유리
- 이벤트 기반 아키텍처로 분산 배포(distributed runtime)까지 확장 가능
- v0.2 대비 코드 안정성·타입 안전성 대폭 강화

## CrewAI — Role-Based Crews and Flows

**역할(Role) 기반**의 크루 구성이 핵심 은유다. 각 에이전트에 역할(Role)·목표(Goal)·배경 스토리(Backstory)를 부여하고, 이들을 "Crew"로 묶어 순차 또는 계층적으로 실행한다.

```python
from crewai import Agent, Task, Crew, Process

researcher = Agent(
    role="시장 조사원",
    goal="경쟁사 최신 동향을 조사한다",
    backstory="10년 경력의 시장 분석가",
)
writer = Agent(role="보고서 작성자", goal="조사 결과를 보고서로 정리한다")

crew = Crew(
    agents=[researcher, writer],
    tasks=[Task(description="경쟁사 A 분석", agent=researcher),
           Task(description="분석 결과 보고서 작성", agent=writer)],
    process=Process.sequential,  # 또는 Process.hierarchical
)
crew.kickoff()
```

**Flows**는 CrewAI의 결정론적 오케스트레이션 레이어로, Crew(자율적) + 명시적 제어 흐름(결정론적)을 결합한다 — [[Anthropic_Workflow_Patterns]]의 Workflow/Agent 스펙트럼에서 중간 지점에 해당한다.

## OpenAI Agents SDK — Handoffs, Guardrails, Tracing

OpenAI가 실험적 Swarm 프레임워크를 프로덕션급으로 발전시킨 것. 세 가지 1급 개념이 핵심이다.

```python
from agents import Agent, handoff, Runner

billing_agent = Agent(name="Billing", instructions="결제 문의를 처리한다")
support_agent = Agent(
    name="Triage",
    instructions="문의를 분류하고 적절한 에이전트로 넘긴다",
    handoffs=[handoff(billing_agent)],   # Handoff: 다른 에이전트로 제어 이전
)

result = Runner.run_sync(support_agent, "환불 어떻게 하나요?")
```

**핵심 개념**:
- **Handoffs**: 한 에이전트가 대화의 제어권을 통째로 다른 에이전트에 넘김 (CrewAI의 역할 분담과 달리 대화 컨텍스트가 그대로 이전)
- **Guardrails**: 입출력에 대한 병렬 체크 함수 — 조건 위반 시 실행 중단 → [[Guardrail_Engineering]]
- **Tracing**: 내장 실행 추적 — OpenAI 대시보드에서 바로 시각화

## Claude Agent SDK — Subagents and Session Store

Claude Code의 내부 하네스를 범용 SDK로 공개한 것. **Claude Code와 동일한 에이전트 루프**(파일 시스템 접근, 코드 실행, 서브에이전트 위임)를 자체 애플리케이션에 내장할 수 있다.

```python
from claude_agent_sdk import ClaudeAgent, Subagent

agent = ClaudeAgent(
    system_prompt="코드 리뷰를 수행하는 에이전트",
    subagents=[
        Subagent(name="security-reviewer", description="보안 취약점 검토 전담"),
        Subagent(name="style-reviewer", description="코드 스타일 검토 전담"),
    ],
    session_store="./sessions",  # 세션 영속화 — 재개 가능
)
```

**특징**:
- **Subagents**: 컨텍스트를 분리한 채로 위임되는 하위 에이전트 — 메인 에이전트의 컨텍스트 창을 오염시키지 않음
- **Session Store**: 파일 기반 세션 저장 — 프로세스가 죽어도 정확한 지점에서 재개 (→ [[Autonomous_Systems]]의 durable execution과 같은 문제의식)
- Claude Code가 실전에서 검증한 "하네스" 설계를 그대로 재사용 가능

## Agno와 Mastra — 프로덕션 런타임

**Agno**(구 Phidata)는 Python 기반, 매우 낮은 인스턴스화 오버헤드(~마이크로초 단위)와 내장 메모리·지식 베이스·멀티모달 지원이 강점. 경량 프로덕션 배포에 특화.

**Mastra**는 TypeScript/Node.js 생태계를 위한 프레임워크로, Vercel AI SDK와 통합이 깊고 워크플로 그래프 + 에이전트 + RAG를 하나의 TS 코드베이스에서 다룬다. 풀스택 JS 팀에게 자연스러운 선택지.

## 프레임워크 선택 가이드

| 프레임워크 | 핵심 은유 | 강점 | 적합 상황 |
|-----------|---------|------|----------|
| LangGraph | 상태 그래프 | Durable execution, cyclical flow | 복잡한 조건부 분기, 체크포인트 필요 |
| AutoGen v0.4 | 액터 모델 | 비동기 확장성, 분산 배포 | 대규모 멀티 에이전트, 이벤트 기반 시스템 |
| CrewAI | 역할 크루 | 빠른 프로토타이핑, 직관적 역할 분담 | 명확히 분업 가능한 태스크 (조사→작성→검토) |
| OpenAI Agents SDK | Handoff | 내장 Guardrails/Tracing | OpenAI 생태계, 고객지원형 분기 |
| Claude Agent SDK | Subagent + Session | Claude Code 하네스 재사용 | 코딩 에이전트, 장기 세션 재개 |
| Agno | 경량 런타임 | 낮은 오버헤드, 멀티모달 | 지연시간에 민감한 프로덕션 배포 |
| Mastra | TS 워크플로 | JS/TS 생태계 통합 | 풀스택 Node.js 팀 |

## Agent Framework Tradeoffs

프레임워크 도입은 공짜가 아니다. [[Anthropic_Workflow_Patterns]]가 지적하듯, 프레임워크는 프롬프트와 제어 흐름을 추가 레이어 뒤에 숨긴다.

```
프레임워크 도입 비용:
  - 디버깅 난이도 증가 (프레임워크 내부 동작을 이해해야 함)
  - 버전 업그레이드마다 API 변경 리스크
  - 벤더/생태계 락인

프레임워크 도입 이득:
  - 지속 상태·체크포인트·재시도 로직을 직접 구현할 필요 없음
  - 관찰가능성(Observability) 통합이 기본 제공되는 경우가 많음
  - 팀 표준화 — 여러 엔지니어가 같은 패턴으로 작업
```

**실무 권고**: 먼저 [[Anthropic_Workflow_Patterns]]의 5가지 패턴을 직접 API 호출로 구현해보고, 상태 관리·동시성·역할 분담 중 실제로 부족한 지점이 드러나면 그때 해당 강점을 가진 프레임워크로 이전한다.

## AI Engineering에서의 역할

Agent Frameworks는 에이전트 설계의 "언어"에서 "제품"으로의 전환을 대표한다. 프레임워크 선택은 아키텍처([[Agent_Architectures]])와 워크플로 패턴([[Anthropic_Workflow_Patterns]]) 결정 이후에 이뤄져야 하는 구현 세부사항이며, 잘못된 순서로 접근하면(프레임워크부터 고르고 아키텍처를 끼워 맞추면) 불필요한 복잡도로 이어진다.

## 관련 개념
[[Anthropic_Workflow_Patterns]] · [[Agent_Architectures]] · [[LangGraph]] · [[Multi_Agent_Coordination]] · [[Agent_Skills_and_Protocols]]

## 출처
- Microsoft Research "AutoGen v0.4: A New Foundation" — [microsoft.com/research](https://www.microsoft.com/en-us/research/blog/autogen-v0-4-reimagining-the-foundation-agentic-ai-frameworks/)
- CrewAI 공식 문서 — [docs.crewai.com](https://docs.crewai.com)
- OpenAI "New tools for building agents" — [openai.com](https://openai.com/index/new-tools-for-building-agents/)
- OpenAI Agents SDK 문서 — [openai.github.io/openai-agents-python](https://openai.github.io/openai-agents-python/)
- Anthropic "Claude Agent SDK" — [docs.claude.com](https://docs.claude.com/en/api/agent-sdk/overview)
- Agno 공식 문서 — [docs.agno.com](https://docs.agno.com)
- Mastra 공식 문서 — [mastra.ai/docs](https://mastra.ai/docs)
- AI Engineering from Scratch, Phase 14 · Lessons 14-18 (AutoGen, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Agno/Mastra) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering)
