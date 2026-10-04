---
order: 1
---

# Coding Agents (코딩 에이전트)

## 개요

**Coding Agent**는 코드베이스를 읽고, 파일을 수정하고, 셸에서 테스트·빌드를 실행하며 소프트웨어 작업을 자율적으로 수행하는 에이전트다(Claude Code, Codex, Cursor Agent, OpenHands [1], Devin 등). 자동완성에서 시작해 터미널·IDE·클라우드에서 **장시간 독립 작업을 맡는 팀원**으로 진화했고, 코드에는 **테스트·컴파일러·타입체커라는 즉각적이고 저렴한 verifier**가 있어 에이전트 기법이 가장 먼저 성숙한 영역이다.

모델 능력이 비슷해진 지금 차별점은 모델보다 **주변 스캐폴딩** — 컨텍스트 파일, 도구 표면, 권한, 검증 루프 — 에 있다. 이 문서는 그 요소를 코딩 도메인 관점에서 묶고, 각 요소의 일반론은 해당 문서에 위임한다.

## 구성 요소

### 1. 프로젝트 컨텍스트 파일

저장소 루트의 `AGENTS.md`(도구 중립 관례)나 `CLAUDE.md` 같은 파일이 **매 세션 자동 로드되는 영속 지침** 역할을 한다. 빌드·테스트 명령, 아키텍처 규칙, 금지 사항을 담는다. 설계 원칙은 다음과 같다.

- **짧게 유지**: 항상 로드되므로 길수록 토큰을 소모하고 [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Context Rot]]을 앞당긴다. 상세 절차는 필요할 때만 불러오는 Skill로 분리한다(→ [[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols|Agent_Skills_and_Protocols]]).
- **기계적으로 강제할 수 있는 규칙은 지침이 아니라 훅·린터로**: 문장 규칙은 위반될 수 있지만 pre-commit 검사는 위반을 막는다.
- 디렉터리 구조 예시와 Agent Workbench 표면은 [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench|Eval_Driven_Development_and_Agent_Workbench]]에 있다.

### 2. Spec-driven 개발

코드 생성 전에 **요구사항·설계·작업 목록을 문서(spec)로 먼저 확정**하고, 에이전트가 그 spec을 기준으로 구현·검증하게 하는 워크플로다. AWS Kiro, GitHub Spec Kit 같은 도구가 이를 제품화했다. 모호한 프롬프트 한 줄로 시작하는 "vibe coding"과 달리 spec이 **사람이 검토 가능한 중간 산출물**이 되어 의도 드리프트와 재작업을 줄인다. 대가는 spec 작성 비용이므로 작은 수정보다 다중 파일 기능에 적합하다.

### 3. Plan → Edit → Verify 루프

```
탐색(read-only)  →  계획 수립  →  수정  →  테스트/린트 실행  →  실패 시 로그를 근거로 재수정
```

핵심은 마지막 단계다 — **테스트 결과가 객관적 피드백**이므로 에이전트가 자기 판단이 아니라 실행 결과로 수렴한다. 테스트가 부실하면 에이전트는 통과만 하는 코드를 만들 수 있으므로, 테스트 먼저 작성(TDD)이나 별도 reviewer 에이전트로 보완한다. 일반 패턴은 [[AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern|ReAct_Pattern]]·[[AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows|Cyclic_Flows]]를 따른다.

### 4. 병렬·백그라운드 실행

- **git worktree**로 작업 디렉터리를 분리해 여러 에이전트가 같은 저장소에서 충돌 없이 병렬 작업
- **서브에이전트 위임**으로 탐색·리뷰 같은 부작업을 별도 컨텍스트에서 수행해 메인 컨텍스트 보호 (→ [[AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi_Agent_Coordination]])
- **클라우드/백그라운드 에이전트**가 이슈를 받아 PR까지 비동기로 처리 — 장시간 실행 인프라는 [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]의 Durable Execution 참고

### 5. 권한과 샌드박스

파일 쓰기·셸 실행은 비가역적일 수 있으므로 **권한 모드**(읽기 전용 → 수정 자동 승인 → 완전 자율)로 자율성을 위험도에 맞춰 조절한다(→ [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]). 저장소 내용·이슈 본문·의존성 README는 **비신뢰 입력**이므로 Lethal Trifecta(비밀 접근 + 비신뢰 콘텐츠 + 외부 통신)가 성립하는 환경은 샌드박스와 승인 게이트가 필요하다(→ [[AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense|Prompt_Injection_Defense]], [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]]의 Agent Sandbox).

### 6. Agent–Computer Interface (ACI)

SWE-agent [2]는 에이전트용으로 설계한 **전용 명령 인터페이스**(파일 뷰어, 린트가 붙은 편집기, 간결한 검색 출력)가 원시 셸보다 성능을 크게 높인다고 보였다. 도구 출력 형식이 에이전트 성능의 변수라는 점은 [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]]의 도구 설계와 같은 맥락이다.

## 평가

| 벤치마크 | 측정 |
|----------|------|
| SWE-bench Verified / Pro | 실제 GitHub 이슈 해결(테스트 통과 기준) |
| Terminal-Bench | 터미널 환경의 복합 셸 작업 |

세부와 한계(데이터 오염, 포화)는 [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Benchmarking|Benchmarking]]을 참고한다. 벤치마크 점수는 **하네스 구성에 따라 크게 달라지므로** 같은 모델도 스캐폴딩이 다르면 비교 불가하다. 자사 코드베이스 기준의 회귀 평가셋이 최종 판단 근거다.

## 경계 정리

| 문서 | 다루는 것 |
|------|-----------|
| [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks\|Agent_Frameworks]] | 에이전트 SDK(Claude Agent SDK 등) 일반 |
| [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench\|Eval_Driven_Development_and_Agent_Workbench]] | 평가 주도 개발과 Workbench 표면 |
| [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems\|Autonomous_Systems]] | 권한 모드, 안전 제어, 장기 실행 |
| **본 문서** | 코딩 도메인에 특화된 요소(컨텍스트 파일·spec·verify 루프·worktree)의 통합 관점 |

## 관련 개념
[[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Agent_Frameworks|Agent_Frameworks]] · [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/Eval_Driven_Development_and_Agent_Workbench|Eval_Driven_Development_and_Agent_Workbench]] · [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]] · [[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols|Agent_Skills_and_Protocols]] · [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Benchmarking|Benchmarking]] · [[AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense|Prompt_Injection_Defense]]

## 출처
- [1] Wang et al. (2024) "OpenHands: An Open Platform for AI Software Developers as Generalist Agents" — [arXiv:2407.16741](https://arxiv.org/abs/2407.16741)
- [2] Yang et al. (2024) "SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering" — [arXiv:2405.15793](https://arxiv.org/abs/2405.15793)
- Jimenez et al. (2024) "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" — [arXiv:2310.06770](https://arxiv.org/abs/2310.06770)
- AGENTS.md — [agents.md](https://agents.md)
