---
order: 3
---

# Anthropic's Workflow Patterns (워크플로 패턴)

## 개요

Anthropic의 Schluntz와 Zhang은 2024년 12월 "Building Effective Agents"에서 **Workflow(워크플로)**와 **Agent(에이전트)**를 명확히 구분했다. 많은 팀이 단순한 함수 호출 하나로 충분한 문제에 멀티 에이전트 프레임워크를 가져다 쓰면서 불필요한 복잡도를 만든다는 업계에 대한 반성에서 나온 글이다. 원칙은 단순하다: **단순하게 시작하고, 필요할 때만 복잡도를 추가하라.**

## Workflow vs Agent

```
Workflow (워크플로):
  LLM과 도구가 "미리 정의된 코드 경로"를 통해 오케스트레이션됨
  → 엔지니어가 그래프(실행 흐름)를 소유

Agent (에이전트):
  LLM이 스스로 도구 사용과 다음 단계를 "동적으로" 결정
  → 모델이 그래프를 소유
```

둘 다 각자의 자리가 있다. Workflow는 저렴하고, 빠르고, 디버깅이 쉽다. Agent는 개방형(open-ended) 문제를 풀 수 있지만 실패 모드를 추론하기 어렵다.

## Augmented LLM (증강된 LLM)

다섯 가지 패턴 모두의 기초 단위: 검색(Retrieval) · 도구(Tools) · 메모리(Memory) 3가지가 결합된 LLM 한 대. 모든 API 호출이 이 세 가지를 활용할 수 있다.

## 5가지 워크플로 패턴

### 1. Prompt Chaining (프롬프트 체이닝)

호출 1의 출력이 호출 2의 입력이 된다. 태스크를 명확한 선형 단계로 분해할 수 있을 때 사용. 단계 사이에 프로그래밍적 검증 게이트를 넣을 수 있다.

```python
def prompt_chain(input_text: str, steps: list[callable]) -> str:
    result = input_text
    for step in steps:
        result = step(result)          # 이전 출력이 다음 입력
        if not passes_gate(result):    # 선택적 프로그래밍 게이트
            return "중단: 검증 실패"
    return result

# 예: 블로그 초안 작성 → 사실 검증 → 톤 조정 → 최종 포맷팅
pipeline = [draft_outline, fact_check, adjust_tone, final_format]
```

### 2. Routing (라우팅)

분류기 LLM이 입력을 판단해 적절한 하위 LLM·도구로 위임한다. 범주가 뚜렷이 다른 입력에 각기 다른 처리가 필요할 때 사용(1단계 고객지원 vs 환불 vs 버그 리포트 vs 영업 문의).

### 3. Parallelization (병렬화)

N개의 LLM 호출을 동시에 실행하고 결과를 취합한다. 두 형태:
- **Sectioning**: 서로 다른 조각을 병렬 처리 후 합침
- **Voting**: 동일 프롬프트를 N번 실행 후 다수결/합성

### 4. Orchestrator-Workers (오케스트레이터-워커)

오케스트레이터 LLM이 어떤 워커(역시 LLM)를 실행할지 동적으로 결정하고 결과를 종합한다. 에이전트 루프와 비슷하지만 오케스트레이터는 무한정 반복하지 않는다. 자세한 아키텍처 비교 → [[Agent_Architectures]]

### 5. Evaluator-Optimizer (평가자-최적화자)

한 LLM이 답을 제안하고, 다른 LLM이 이를 평가한다. 평가자가 통과할 때까지 반복한다. [[Planning_and_Reflection]]의 Self-Refine 패턴을 일반화한 형태다.

```python
def evaluator_optimizer(task: str, proposer, evaluator, max_iter: int = 5) -> str:
    proposal = proposer(task)
    for _ in range(max_iter):
        verdict = evaluator(proposal)
        if verdict.passed:
            return proposal
        proposal = proposer(task, feedback=verdict.feedback)
    return proposal  # 최대 반복 도달
```

## 5가지 패턴 요약

| 패턴 | 언제 쓰는가 | LLM 호출 형태 |
|------|-----------|-------------|
| Prompt Chaining | 명확한 선형 단계 | 순차 |
| Routing | 범주가 다른 입력 | 분류 → 분기 |
| Parallelization | 독립적 하위 작업 | 병렬 N회 |
| Orchestrator-Workers | 동적 작업 분배 | 오케스트레이터 + 워커 |
| Evaluator-Optimizer | 반복 개선이 필요한 산출물 | 제안 ↔ 평가 루프 |

## Workflow가 Agent보다 나은 경우

- **예측 가능한 태스크**: 단계를 미리 나열할 수 있다면 그렇게 해야 한다
- **비용 상한이 있는 태스크**: Workflow는 단계 수가 유한하지만, Agent는 무한정 반복(spiral)할 수 있다
- **컴플라이언스가 중요한 태스크**: 감사자는 실행 궤적을 추론하기보다 그래프를 직접 읽고 싶어한다

## Agent가 Workflow보다 나은 경우

- **개방형 리서치**: 다음 단계가 이전 단계의 결과에 따라 달라질 때
- **가변 길이 태스크**: 몇 분~몇 시간이 걸릴지 모르는 작업
- **새로운 도메인**: 올바른 워크플로를 아직 모를 때 — 먼저 탐색하고 나중에 코드화

## 프레임워크는 언제 필요한가

Anthropic의 결론은 명확하다: **대부분의 작업에는 직접 API 호출이면 충분하다.** 프레임워크는 패턴이 진짜로 다음을 필요로 할 때만 도입한다:
- 지속적 상태(durable state)가 필요할 때 → LangGraph ([[LangGraph]])
- 액터 모델 기반 동시성이 필요할 때 → AutoGen v0.4
- 역할 템플릿화가 필요할 때 → CrewAI
- Claude Code 하네스와 같은 형태가 필요할 때 → Claude Agent SDK

프레임워크 상세 비교 → [[Agent_Frameworks]]

## Context Engineering과의 관계

"Effective context engineering for AI agents" (Anthropic, 2025)는 이 워크플로 패턴들의 인접 분야를 공식화한다: 컨텍스트 창(200K 토큰 등)은 담을 수 있는 "그릇"이 아니라 관리해야 할 "예산"이다. 무엇을 포함할지, 언제 압축할지 결정하는 문제 → [[Context_Engineering]]

## AI Engineering에서의 역할

Anthropic의 5가지 워크플로 패턴은 에이전트 설계에서 가장 자주 인용되는 "어휘"다. 복잡한 멀티 에이전트 프레임워크를 도입하기 전에, 이 5가지 패턴만으로 문제가 풀리는지 먼저 검토하는 것이 실무 표준이 되고 있다. Agent Architectures([[Agent_Architectures]])가 "누가 실행하는가"를 다룬다면, Workflow Patterns는 "어떤 순서로 LLM 호출을 조합하는가"를 다룬다.

## 관련 개념
[[Agent_Architectures]] · [[Planning_and_Reflection]] · [[Agent_Frameworks]] · [[LangGraph]] · [[Context_Engineering]]

## 출처
- Schluntz, E. & Zhang, B. (Anthropic, 2024) "Building Effective Agents" — [anthropic.com](https://www.anthropic.com/research/building-effective-agents)
- Anthropic "Effective context engineering for AI agents" (2025) — [anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- AI Engineering from Scratch, Phase 14 · Lesson 12 "Anthropic's Workflow Patterns" — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/12-anthropic-workflow-patterns)
