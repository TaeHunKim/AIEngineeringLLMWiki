---
order: 5
---

# Agent Sandboxes (에이전트 실행 격리)

## 개요

**Agent Sandbox**는 에이전트가 생성·실행하는 코드, 셸 명령, 브라우저 세션을 호스트와 다른 테넌트, 그리고 핵심 시스템으로부터 격리하는 실행 환경이다. 코딩 에이전트와 background 에이전트가 사람 감독 없이 몇 시간씩 셸을 쓰게 되면서, sandbox는 선택 기능이 아니라 기본 전제가 되었다. 에이전트가 실행하는 코드는 모델이 만든 것이고, 모델은 저장소·웹페이지·이슈 본문 같은 **비신뢰 입력**에 영향받는다. 그러니 그 코드도 비신뢰 코드로 취급해야 한다.

[[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]]이 무엇을 허용·차단할지 정하는 **정책 계층**을 다룬다면, 이 문서는 정책이 뚫렸을 때 피해 범위를 물리적으로 제한하는 **격리 계층**을 다룬다.

## 격리 수준 스펙트럼

| 수준 | 대표 기술 | 경계 | 시작 시간·오버헤드 | 적합한 경우 |
|------|----------|------|-------------------|-------------|
| 프로세스 제한 | seccomp, Landlock, macOS Seatbelt | 같은 커널, syscall·경로 제한 | 거의 0 | 로컬 CLI 에이전트의 파일·네트워크 접근 제한 |
| 컨테이너 | Docker, namespaces + cgroups | 같은 호스트 커널 공유 | 빠름, 낮음 | 신뢰된 단일 테넌트 코드. 커널 취약점 하나로 탈출 가능 |
| 사용자 공간 커널 | gVisor | syscall을 사용자 공간 커널(Sentry)이 가로챔 | 빠름, syscall 집약 작업은 느려짐 | 멀티테넌트 코드 실행. 컨테이너 호환성을 유지하며 커널 공격면 축소 |
| microVM | Firecracker, Kata Containers, Cloud Hypervisor | VM마다 별도 게스트 커널(KVM) | 수백 ms 내외(스냅샷·warm pool로 단축), VM당 메모리 | 비신뢰·멀티테넌트 에이전트 코드의 사실상 표준 |
| WebAssembly | Wasmtime, Pyodide | capability 기반 런타임 | 매우 빠름 | 순수 계산형 코드. 언어·라이브러리 제약 큼 |

공통된 판단 기준은 이렇다. **사용자나 모델이 만든 코드를 여러 테넌트가 공유하는 인프라에서 실행한다면 컨테이너만으로는 부족하다.** Firecracker는 AWS Lambda·Fargate용으로 최소 공격면을 목표로 설계된 microVM이고, 현재 주요 관리형 에이전트 sandbox 대부분의 기반이다.

## 관리형 sandbox와 오케스트레이션

| 제품·프로젝트 | 격리 | 성격 |
|--------------|------|------|
| E2B | Firecracker microVM | 코드 실행 API. 여러 에이전트 턴에 걸쳐 sandbox 유지, 수명 설정 가능 |
| Vercel Sandbox | Firecracker microVM | 짧은 코드 실행. 세션은 수 시간 상한 |
| Modal | 서버리스 런타임의 sandbox primitive | GPU·장시간 작업, volume 영속화 |
| Daytona | 개발 워크스페이스 | 저장소 단위로 사람 개발자처럼 일하는 에이전트용 영속 환경 |
| Kubernetes `agent-sandbox` (SIG Apps) | RuntimeClass로 gVisor·Kata 선택 | 자체 클러스터용 선언형 API. `Sandbox`(stable hostname·network identity·영속 스토리지를 가진 단일 pod), `SandboxTemplate`, `SandboxClaim`, `SandboxWarmPool` CRD 제공 |

(2026-10 기준 스냅샷이며 기능·상한은 각 벤더 문서로 재확인해야 한다.)

Kubernetes `agent-sandbox`는 격리 자체를 제공하지 않는다. gVisor나 Kata 같은 sandbox 런타임을 쓰는 pod의 **수명 주기**(생성, 예약 삭제, 일시정지·재개, warm pool 할당)를 관리하는 오케스트레이션 계층이다. 에이전트 런타임과 RL 롤아웃 환경([[AI/Engineering/Loop_Engineering/RL_Environments|RL_Environments]])이 대표 용도다.

## 설계 패턴

### Ephemeral vs Persistent

```
Ephemeral (태스크당 1개, 완료 즉시 폐기):
  장점: 이전 태스크의 오염·비밀·악성 파일이 다음 태스크로 넘어가지 않음
  단점: 매번 의존성 설치·저장소 clone 비용 → snapshot / warm pool로 상쇄

Persistent (세션·프로젝트 단위로 유지):
  장점: 장기 작업, 빌드 캐시, 사람 개발자 같은 작업 흐름
  단점: 상태가 누적되므로 주기적 재생성·스냅샷 롤백 정책이 필요
```

기본값은 **비신뢰 코드 실행은 ephemeral, 장기 코딩 작업은 persistent + 스냅샷**이다. 체크포인트·롤백은 [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]의 Checkpoints and Rollback과 같은 인프라를 쓴다.

### 네트워크 egress 통제

격리된 VM이라도 인터넷에 자유롭게 나갈 수 있으면 데이터 유출 경로가 열린다. [[AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense|Prompt_Injection_Defense]]의 Lethal Trifecta(비밀 접근 + 비신뢰 콘텐츠 + 외부 통신) 중 "외부 통신"을 끊는 것이 sandbox의 핵심 역할이다.

- **기본 거부 + allowlist**: 패키지 레지스트리, 사내 Git, 지정 API만 허용
- **egress proxy**: 모든 요청을 proxy로 보내 도메인·메서드·용량 기준으로 기록·차단
- **DNS 제한**: 임의 도메인 해석을 막아 DNS 터널링 차단

### 비밀 주입: 모델이 자격 증명을 보지 않게 하기

sandbox 안의 에이전트에 API 키를 환경 변수로 넣으면 모델이 그 값을 읽고, 출력하고, 유출할 수 있다. 2026년에 확산된 패턴은 **sandbox 밖의 proxy가 요청 시점에 실제 자격 증명을 주입**하는 방식이다. 에이전트 쪽에는 placeholder 토큰만 있다. Anthropic의 Claude Duet은 이 구조를 쓴다. 브라우저를 모델·에이전트와 분리된 별도 클라우드 VM에서 돌리고, 에이전트는 정해진 명령 집합으로만 브라우저를 조작한다. 사이트 코드와 쿠키는 브라우저 VM에만 남는다.

### 리소스 상한

CPU·메모리·디스크·프로세스 수·실행 시간 상한을 sandbox 단위로 건다. 무한 루프, fork bomb, 대용량 다운로드가 비용 폭주로 이어지지 않게 하려는 것이며, [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]의 Action Budget과 같은 목적의 인프라 측 방어선이다.

## 경계 정리

| 주제 | 다루는 것 | 문서 |
|------|----------|------|
| 정책·필터·콜백 | 무엇을 허용·차단할지 | [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering\|Guardrail_Engineering]] |
| 권한 모드·승인 게이트 | 사람이 언제 개입할지 | [[AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents\|Coding_Agents]], [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous_Systems]] |
| Agent Identity·인가 | 에이전트가 누구이고 어떤 자원에 접근할 수 있는지 | [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment\|Agent_Deployment]] |
| **Agent Sandbox** | 실행이 어디서 일어나고, 뚫렸을 때 피해가 어디까지인지 | 이 문서 |

## AI Engineering에서의 역할

Sandbox는 프롬프트 인젝션을 완전히 막을 수 없다는 전제에서 출발하는 방어선이다. 모델 수준 방어와 가드레일이 실패해도 피해가 VM 하나와 그 VM이 허락받은 네트워크 범위를 넘지 않도록 만든다. 그래서 에이전트에 부여할 수 있는 자율성의 상한은 모델 능력보다 **격리와 egress 통제의 강도**에 의해 결정되는 경우가 많다.

## 관련 개념
[[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]] · [[AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense|Prompt_Injection_Defense]] · [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Deployment|Agent_Deployment]] · [[AI/Engineering/Agent_Engineering/Agent_Applications/Coding_Agents|Coding_Agents]] · [[AI/Engineering/Agent_Engineering/Agent_Applications/Background_Agents|Background_Agents]] · [[AI/Engineering/Loop_Engineering/RL_Environments|RL_Environments]]

## 출처
- Agache et al. (2020) "Firecracker: Lightweight Virtualization for Serverless Applications", NSDI '20 — [usenix.org](https://www.usenix.org/conference/nsdi20/presentation/agache)
- gVisor 문서 — [gvisor.dev](https://gvisor.dev/docs/)
- Kubernetes SIG Apps `agent-sandbox` — [GitHub](https://github.com/kubernetes-sigs/agent-sandbox)
- "Sandboxing AI-Generated Code: E2B vs Vercel Sandbox vs Modal vs Daytona in 2026" (2026-05) — [alexcloudstar.com](https://www.alexcloudstar.com/blog/sandboxing-ai-generated-code-execution-2026/)
- Anthropic "Claude Duet Safety, Privacy, and Security" (2026-10-23) — [claude.com](https://claude.com/resources/articles/claude-duet-safety-privacy-and-security)
