---
order: 2
---

# Deep Research Agents (딥 리서치 에이전트)

## 개요

**Deep Research Agent**는 하나의 복잡한 질문을 받아 **검색·읽기·추론을 수십~수백 단계 반복**하고 출처가 달린 보고서를 산출하는 장기 실행 에이전트다. 단발 RAG가 "질문 → 검색 1회 → 답변"이라면, 딥 리서치는 검색 결과를 보고 **다음에 무엇을 찾을지 스스로 결정**하며 가설을 갱신한다. 서베이 [1]는 이를 동적 추론, 장기 계획, 다단계 정보 수집, 반복적 도구 사용, 구조화된 보고서 생성의 결합으로 정의한다.

[[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic_RAG]]가 검색 단계의 자율화(재질의·교정)를 다룬다면, 이 문서는 **연구 전체 수명주기**(계획 → 병렬 탐색 → 종합 → 인용 검증)를 다룬다.

## 표준 아키텍처

```
사용자 질문
   ↓
Planner (Lead agent)   질문을 하위 질문으로 분해, 연구 계획 수립
   ↓ 병렬 fan-out
Researcher × N         하위 질문별 검색·읽기, 요약만 반환 (각자 독립 컨텍스트)
   ↓
Synthesizer            결과 종합, 충돌·공백 식별 → 필요 시 추가 라운드
   ↓
Citation verifier      각 주장 ↔ 출처 대조
   ↓
보고서
```

핵심 설계 선택:

- **Bounded sub-agent**: 각 researcher에 단계·토큰 상한을 두고 **결과 요약만** lead에 돌려준다. 탐색 중 쌓이는 원문이 lead의 컨텍스트를 오염시키지 않게 하는 [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Context Isolation]] 적용이다. LangChain deepagents(2025-07)가 이 plan/execute/synthesize 구조를 오픈소스로 공개했다.
- **Orchestrator-Worker**: Anthropic은 lead(상위 모델) + 병렬 subagent(하위 모델) 구성이 단일 에이전트보다 자사 내부 리서치 평가에서 크게 앞섰다고 보고했다 [4]. 다만 **토큰 사용량이 일반 채팅의 십수 배**이므로 가치가 높은 질문에만 적합하다는 점도 함께 밝혔다. (자사 보고 수치이며 독립 재현 전이다.)
- **반복 종료 조건**: 새 정보가 더 이상 계획을 바꾸지 않을 때 멈춘다. 상한이 없으면 비용이 폭주한다 → [[AI/Engineering/Agent_Engineering/Agent_Applications/Autonomous_Systems|Autonomous_Systems]]의 Action Budget.

## 정보 획득 방식

| 방식 | 장점 | 한계 |
|------|------|------|
| **검색 API** | 빠르고 저렴, 구조화된 결과 | 색인된 상위 결과에 편향, 심층 페이지 접근 약함 |
| **브라우저 탐색** | 동적 페이지·로그인 뒤 콘텐츠 접근 | 느림, 비쌈, **간접 프롬프트 인젝션** 노출 |
| **사내 소스(MCP)** | 비공개 문서·DB 포함 | 권한·신원 관리 필요 |

브라우저·웹 콘텐츠는 모두 비신뢰 입력이므로 방어는 [[AI/Engineering/Harness_Engineering/Prompt_Injection_Defense|Prompt_Injection_Defense]]를 따른다. 도구 연결 표준은 [[AI/Engineering/Agent_Engineering/Agent_Techniques/Agent_Skills_and_Protocols/MCP|MCP]], 브라우저 조작은 [[AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents|Computer_Use_and_Voice_Agents]].

## 신뢰성: 출처와 인용 검증

보고서의 가치는 **검증 가능성**에 있다. 흔한 실패는 (1) 존재하지 않는 출처 인용, (2) 출처에 없는 내용을 인용 형태로 서술, (3) 서로 충돌하는 출처 중 하나만 채택이다. 대응은 인용 span 단위 entailment 검증과 충돌 출처 병기이며, 기법은 [[AI/Engineering/Harness_Engineering/Hallucination_and_Grounding|Hallucination_and_Grounding]]을 따른다. 출처 신뢰도(1차 vs 2차, SEO 사이트) 가중도 종합 단계의 책임이다.

## 평가

- **BrowseComp** [2]: 찾기는 어렵지만 정답 검증은 쉬운 웹 탐색 질문으로 끈질긴 탐색 능력을 측정
- **DeepResearch Bench** [3]: 보고서 품질과 인용 정확도를 다차원으로 평가
- 보고서는 정답이 하나가 아니므로 rubric 기반 [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM_as_a_Judge]]와 궤적 평가([[AI/Engineering/Harness_Engineering/Agent_as_a_Judge|Agent_as_a_Judge]])를 병행한다.

## 경계 정리

| 문서 | 다루는 것 |
|------|-----------|
| [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG\|Agentic_RAG]] | 검색 단계의 자율 교정(Self-RAG, CRAG) |
| [[AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination\|Multi_Agent_Coordination]] | 멀티에이전트 조정 패턴·실패 모드 일반 |
| **본 문서** | 리서치 수명주기 전체와 인용 검증, 비용 대비 가치 판단 |

## 관련 개념
[[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic_RAG]] · [[AI/Engineering/Agent_Engineering/Agent_Techniques/Multi_Agent_Coordination|Multi_Agent_Coordination]] · [[AI/Engineering/Agent_Engineering/Agent_Techniques/Planning_and_Reflection|Planning_and_Reflection]] · [[AI/Engineering/Harness_Engineering/Hallucination_and_Grounding|Hallucination_and_Grounding]] · [[AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents|Computer_Use_and_Voice_Agents]]

## 출처
- [1] Huang et al. (2025) "Deep Research Agents: A Systematic Examination and Roadmap" — [arXiv:2506.18096](https://arxiv.org/abs/2506.18096)
- [2] Wei et al. (2025) "BrowseComp: A Simple Yet Challenging Benchmark for Browsing Agents" — [arXiv:2504.12516](https://arxiv.org/abs/2504.12516)
- [3] Du et al. (2025) "DeepResearch Bench: A Comprehensive Benchmark for Deep Research Agents" — [arXiv:2506.11763](https://arxiv.org/abs/2506.11763)
- [4] Anthropic (2025) "How we built our multi-agent research system" — [anthropic.com](https://www.anthropic.com/engineering/multi-agent-research-system)
