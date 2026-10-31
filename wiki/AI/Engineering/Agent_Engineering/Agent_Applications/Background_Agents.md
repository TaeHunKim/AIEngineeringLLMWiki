---
order: 5
---

# Background Agents (백그라운드·선제적 에이전트)

## 개요

**Background Agent**는 사용자가 대화창을 보고 있지 않을 때에도 자기 실행 환경에서 작업을 계속하고, 필요할 때만 사용자를 부르는 에이전트다. 채팅형 에이전트가 "요청 → 응답"의 동기 루프라면, background 에이전트는 **트리거 → 비동기 실행 → 알림 → 검토**의 비동기 루프로 동작한다. 2026년 10월 OpenAI와 Anthropic이 각각 병렬 에이전트와 선제적(proactive) 에이전트를 소비자 제품으로 내놓으면서, 이 형태가 코딩 도구 바깥의 일반 업무로 넓어졌다.

[[AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents|Coding_Agents]]가 이슈를 받아 PR까지 비동기로 처리하는 클라우드 코딩 에이전트를 다루고, [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]가 몇 시간짜리 단일 실행의 신뢰성과 안전장치를 다룬다면, 이 문서는 **사용자 세션과 분리된 실행이 사용자와 어떻게 상호작용하는가**를 다룬다. 언제 깨어나는지, 무엇을 혼자 하고 무엇을 묻는지, 결과를 어떻게 돌려주는지가 주제다.

## 세 가지 형태

| 형태 | 시작 | 사용자 접점 | 사례 (2026-10) |
|------|------|------------|----------------|
| **Delegated (위임형)** | 사용자가 태스크를 명시적으로 넘김 | 완료·검토 요청 알림 | 클라우드 코딩 에이전트(이슈 → PR) |
| **Parallel (병렬형)** | 하나의 요청을 여러 에이전트로 분할 | 대화 안에서 진행 상황 추적, 완료된 하위 작업을 열어 검토 | OpenAI GPT-6 Pro parallel agents (2026-10-16, ChatGPT Pro) |
| **Proactive (선제형)** | 에이전트가 주기적으로 연결된 앱을 확인하고 스스로 할 일을 찾음 | 아침 브리프, 주의가 필요할 때만 메시지 | Anthropic Claude Duet (2026-10-21, research preview) |

뒤로 갈수록 "무엇을 할지" 결정권이 사용자에서 에이전트로 넘어간다. 그만큼 승인 게이트와 알림 설계의 비중이 커진다.

## 아키텍처 구성 요소

```
Background Agent 구성:

  Trigger       스케줄(몇 시간마다 확인, 아침 브리프), 이벤트(새 메일·이슈), 사용자 위임
  Runtime       사용자 기기와 독립된 전용 VM / sandbox (기기가 꺼져도 계속 실행)
  Connectors    메일·캘린더·메신저·CRM 등 (MCP 서버, 플러그인)
  State         장기 메모리, 태스크 목록, 체크포인트 (Durable Execution)
  Gate          비가역 행동 전 정확한 행동을 보여주고 승인 대기
  Notify        완료 / 검토 필요 / 주의 필요 알림. 빈도는 사용자가 조절
  Review        태스크별 페이지에서 결과·행동 내역 확인, 실행 중 방향 수정
```

**Runtime**은 [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Sandboxes|Agent_Sandboxes]]의 persistent sandbox 패턴이다. **State**는 프로세스 재시작·재배포에도 이어서 실행할 수 있어야 하므로 [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]의 Durable Execution이 전제된다. 원격 도구 호출이 오래 걸리는 경우, MCP 2026-07-28 spec의 Tasks extension(작업 핸들 반환 후 `tasks/get`으로 폴링)이 프로토콜 수준의 비동기 처리 수단이 된다(→ [[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/MCP|MCP]]).

## 사례: Claude Duet의 설계 선택

Anthropic이 공개한 Claude Duet 설명(2026-10-21 발표, 10-23 보안 문서)은 proactive 에이전트에 필요한 설계 결정을 한 제품 안에서 보여준다.

- **독립 실행 환경**: 자체 VM과 브라우저에서 돌아 사용자 기기가 켜져 있을 필요가 없다. 브라우저는 모델·에이전트와 분리된 별도 클라우드 VM이며, 에이전트는 정해진 명령 집합으로만 조작한다.
- **주기와 비용**: 연결된 계정을 몇 시간마다 확인한다. 이 주기는 사용량 한도를 아끼기 위한 선택이고, background 확인도 사용량에 포함된다.
- **승인 게이트**: 읽기·초안·준비는 자율로 하지만, 메시지 전송·결제·서명·삭제 전에는 정확한 행동(대상, 전체 내용, 모든 수신자)을 보여주고 기다린다. 증권 거래·계좌 간 이체처럼 **승인해도 막히는 행동**이 있고, 결제·주문 삭제·계정 생성은 "다시 묻지 않기" 규칙에서 제외된다.
- **행동 검사 분리**: 각 행동이 사용자 의도와 맞는지를 작업 모델 **바깥**의 분류기(Claude Code auto mode 분류기 기반)가 판정한다. 페이지에 숨은 지시가 판정에 영향을 주지 못하게 하려는 것이다.
- **자격 증명 격리**: 모델은 비밀번호·쿠키·토큰을 보지 못한다. 에이전트 쪽 토큰은 placeholder이고, 에이전트 머신 밖의 proxy가 요청 시점에 실제 값을 넣는다.
- **결제 범위 제한**: 구매는 판매자 하나와 금액 하나로 묶인 일회용 가상 카드로 처리한다.

## 설계 고려사항

### 알림 피로 vs 놓침

선제형 에이전트의 가치는 "중요한 것만" 알리는 데 있다. 너무 자주 부르면 사용자가 알림을 끄고, 너무 드물면 중요한 일을 놓친다. 알림 기준과 빈도를 사용자가 조절할 수 있게 하고, 놓친 항목은 정기 브리프에 모으는 것이 일반적인 절충이다. Claude Duet도 긴급도를 잘못 판단하거나 스레드를 잘못 읽을 수 있다는 한계를 명시한다.

### 병렬 결과의 검토 비용

병렬 에이전트는 실행 시간을 줄이지만 **검토할 산출물의 수**를 늘린다. 하위 작업마다 무엇을 했는지 열어볼 수 있게 하고, 최종 통합 결과와 개별 근거를 함께 보여줘야 사람의 검토가 병목이 되지 않는다. 분할·통합 전략은 [[AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi_Agent_Coordination]]의 orchestrator-worker 패턴과 같다.

### 실행 중 개입

background 실행이라도 사용자가 도중에 방향을 바꿀 수 있어야 한다. 그런데 중단 신호를 프롬프트로 전달하면 모델이 무시할 수 있다는 연구 결과가 있다(→ [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]의 정지·인터럽트 준수). 따라서 중지·일시정지는 harness 수준에서 강제하고, 방향 수정만 대화로 전달하는 것이 안전하다.

## 경계 정리

| 주제 | 초점 | 문서 |
|------|------|------|
| 클라우드 코딩 에이전트 | 코드 도메인의 위임형 실행, worktree 병렬 | [[AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents\|Coding_Agents]] |
| 장기 실행 자율 시스템 | 단일 장기 실행의 신뢰성·안전장치·자기개선 | [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous_Systems]] |
| Computer Use | 화면·브라우저 조작 능력 자체 | [[AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents\|Computer_Use_and_Voice_Agents]] |
| HITL 패턴 | 승인·중단 그래프 설계 | [[AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop\|Human_in_the_Loop]] |
| **Background Agents** | 세션과 분리된 실행의 트리거·알림·승인·검토 | 이 문서 |

## AI Engineering에서의 역할

Background 에이전트는 에이전트를 "부르면 답하는 도구"에서 "맡겨두면 일하는 동료"로 바꾼다. 이때 어려운 문제는 모델 능력보다 **언제 혼자 하고 언제 묻는가**라는 위임 경계의 설계다. 2026년 제품들은 읽기·준비는 자율, 비가역 행동은 정확한 미리보기 후 승인, 일부 고위험 행동은 승인해도 금지하는 3단 구조로 수렴하고 있다. 이 구조를 지탱하는 것은 sandbox, 자격 증명 격리, 작업 모델 밖의 행동 검사 같은 인프라다.

## 관련 개념
[[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]] · [[AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents|Coding_Agents]] · [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Sandboxes|Agent_Sandboxes]] · [[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/MCP|MCP]] · [[AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi_Agent_Coordination]] · [[AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop|Human_in_the_Loop]]

## 출처
- OpenAI "ChatGPT Release Notes" — GPT-6 Pro parallel agents (2026-10-16) — [help.openai.com](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
- Anthropic "Introducing Claude Duet" (2026-10-21) — [claude.com](https://claude.com/resources/articles/claude-duet)
- Anthropic "Claude Duet Safety, Privacy, and Security" (2026-10-23) — [claude.com](https://claude.com/resources/articles/claude-duet-safety-privacy-and-security)
- MCP "The 2026-07-28 Specification" — [blog.modelcontextprotocol.io](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
