---
order: 6
---

# Prompt Caching (프롬프트 캐싱)

## 개요

**Prompt Caching**은 프롬프트의 반복되는 앞부분(정적 프리픽스)을 서버 측에서 캐싱해, 같은 프리픽스로 시작하는 이후 요청에서 **모델의 내부 연산 상태(KV Cache)를 재사용**하는 최적화 기법이다. 여기서는 이를 *프롬프트를 어떻게 구조화해야 캐시가 걸리는가*라는 **프롬프트 설계 문제**로 다룬다. 비용·인프라 관점의 캐싱 전략은 [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]]과 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Loop_Engineering/Cost_Engineering]]을 참고.

```
일반 캐시(예: Semantic Cache): "이 질문에 대한 답을 이미 갖고 있는가?" → 저장된 응답 그대로 반환
Prompt Caching:               "이 프롬프트 앞부분을 이미 처리한 적 있는가?" → 그 계산 상태만 재사용, 출력은 매번 새로 생성
```

## 왜 KV Cache 재사용인가

Transformer는 각 토큰을 처리할 때 이전 모든 토큰의 Key/Value 벡터를 참조한다. 같은 시스템 프롬프트·같은 few-shot 예시·같은 대량 문서로 시작하는 요청이 반복되면, 그 프리픽스에 대한 Key/Value 계산은 매번 동일하다. Prompt Caching은 이 프리픽스의 KV 상태를 서버에 보관해두고, 다음 요청이 같은 프리픽스로 시작하면 **그 부분의 연산을 건너뛰고 이어서 처리**한다.

```
요청1: [시스템 프롬프트 5,000 토큰] + [문서 20,000 토큰] + [질문A]
        → 전체 25,000 토큰 처리, KV 상태 캐시에 기록

요청2: [시스템 프롬프트 5,000 토큰] + [문서 20,000 토큰] + [질문B]   ← 프리픽스 동일
        → 캐시 히트: 25,000 토큰 재계산 없이 질문B만 처리
```

이 위키의 [[AI/Engineering/Context_Engineering/LLM_Memory|LLM_Memory]] 문서가 정리한 4대 메모리 유형 중 **In-Cache Memory**가 바로 이 메커니즘을 가리킨다. 다만 이 메커니즘 자체를 어떻게 프롬프트 설계에 반영할지는 별도로 다룰 만큼 실무적으로 중요하다.

## 프롬프트 구조 설계: 정적 프리픽스를 앞에

Prompt Caching의 효과는 전적으로 **얼마나 긴 프리픽스가, 얼마나 자주, 정확히 동일하게 반복되는가**에 달려 있다. 따라서 프롬프트 설계 원칙이 뒤집힌다 — 가장 자주 바뀌는 내용(사용자 질문)을 맨 뒤로, 가장 안 바뀌는 내용(시스템 프롬프트, 도구 정의, 참고 문서)을 맨 앞으로 배치한다.

```
캐시 친화적 구조 (권장):
  [System Prompt]          ← 절대 안 바뀜, 가장 앞
  [도구 정의 / Few-shot 예시] ← 거의 안 바뀜
  [검색된 문서 / 배경 지식]   ← 세션 내에서는 안 바뀜
  [대화 히스토리]            ← 턴마다 조금씩 늘어남
  [현재 사용자 질문]         ← 매번 바뀜, 가장 뒤

캐시 비친화적 구조 (안티패턴):
  [현재 타임스탬프] + [System Prompt] + [질문]
  → 프리픽스 맨 앞이 매 요청 달라짐 → 캐시가 전혀 걸리지 않음
```

## Cache Breakpoint, TTL, 비용 구조

Anthropic과 OpenAI는 구현 방식이 다르다.

| 항목 | Anthropic (Claude) | OpenAI |
|------|---------------------|--------|
| **캐시 지정 방식** | 명시적 `cache_control` breakpoint (요청당 최대 4개) | 자동 — 1,024 토큰 이상 프리픽스에 대해 가장 긴 일치 구간 자동 탐지 |
| **TTL** | 기본 5분, 1시간 옵션(더 비싼 write 비용) — 캐시를 읽을 때마다 TTL 갱신 | 약 5~10분, 비피크 시간대는 최대 1시간까지 유지 |
| **Write 비용** | 기본 입력 단가의 1.25배(5분) | 추가 비용 없음 |
| **Read(히트) 비용** | 기본 입력 단가의 10% (90% 할인) | 기본 입력 단가의 50%(모델에 따라 최대 90%까지) |
| **개발자 제어** | 어디를 캐시할지 명시적으로 지정 가능 | 코드 변경 없이 자동 적용 |

**Write/Read 비용 배수가 갖는 의미**: 캐시 쓰기는 일반 입력보다 비싸고(Anthropic 기준 1.25배), 캐시 히트는 훨씬 싸다(10~50% 수준). 즉 **한 번 쓰고 여러 번 읽는 패턴**(같은 시스템 프롬프트로 수백 번 호출되는 프로덕션 API, 같은 문서를 두고 여러 질문을 던지는 세션)에서만 이득이며, 프리픽스를 딱 한 번만 쓰고 마는 경우 오히려 손해다.

## 캐시를 깨는 안티패턴

- **프리픽스 중간 삽입**: 캐시된 프리픽스보다 앞쪽 내용을 바꾸면 그 지점부터 전체가 캐시 미스로 처리된다. 동적 정보(타임스탬프, 세션 ID)는 반드시 프리픽스 끝에 배치한다.
- **TTL 만료 방치**: 5분 TTL 내에 다음 요청이 오지 않으면 캐시가 소실된다. 트래픽이 뜸한 시스템은 1시간 TTL 옵션을 쓰거나, 캐시를 의도적으로 "워밍업"하는 더미 요청을 고려한다.
- **프롬프트 템플릿의 미세한 비결정성**: 같은 정보를 담고 있어도 JSON 키 순서, 공백, 타임스탬프 포맷이 매번 미세하게 다르면 정확 일치(exact match) 기반 캐시가 걸리지 않는다.
- **도구 정의를 요청마다 동적으로 재정렬**: 사용 가능한 도구 목록을 매번 다른 순서로 직렬화하면, 도구 설명이 내용상 동일해도 프리픽스 바이트열이 달라져 캐시가 깨진다.

## Semantic Cache와의 차이

이 위키의 [[AI/Engineering/Context_Engineering/Semantic_Cache|Semantic_Cache]]와 자주 혼동되지만 완전히 다른 계층의 기법이다.

| 구분 | Prompt Caching | Semantic Cache |
|------|----------------|----------------|
| **재사용 대상** | 모델 내부 연산 상태(KV Cache) | 과거에 생성된 **응답 자체** |
| **일치 기준** | 프리픽스의 정확한 일치(exact prefix match) | 임베딩 기준 의미적 유사도 |
| **출력** | 캐시 히트여도 **매번 새로 생성**(같은 프리픽스+다른 질문 → 다른 답) | 캐시 히트 시 **저장된 응답 그대로 반환** — 새 생성 없음 |
| **적용 위치** | 모델 제공자 인프라(Anthropic/OpenAI 서버) | 애플리케이션 레이어(자체 구축, GPTCache 등) |
| **비용 절감 메커니즘** | 입력 토큰 처리 비용 절감 | 입력·출력 토큰 처리 자체를 생략(LLM 미호출) |

즉 Prompt Caching은 "같은 앞부분을 다시 계산하지 않는" 최적화이고, Semantic Cache는 "아예 모델을 다시 부르지 않는" 최적화다. 두 기법은 상호 배타적이지 않고 함께 쓰인다 — Semantic Cache 미스가 나면 그다음이 Prompt Caching이 적용된 LLM 호출이다.

## 에이전트 장기 루프에서의 캐시 효율

멀티턴 에이전트 루프에서는 매 턴마다 이전 대화 전체 + 도구 호출 결과가 프리픽스에 누적되므로, Prompt Caching의 효과가 단발 질의응답보다 훨씬 크다. 장기 실행 에이전트 서빙에서 Prompt Caching을 평가한 연구(2026) [1]는 대화가 길어질수록 캐시 히트율과 절감 효과가 커지지만, 동시에 [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic_Context_Management]]에서 다룬 Compaction(대화 요약 후 새 창 시작)이 실행될 때마다 프리픽스가 바뀌어 **캐시가 통째로 무효화**된다는 트레이드오프를 지적한다. 즉 Compaction 주기를 너무 짧게 잡으면 컨텍스트 절약은 되지만 캐시 재활용 이득을 반복적으로 잃는다 — 두 최적화가 서로를 상쇄할 수 있다는 점을 설계 시 고려해야 한다.

## AI Engineering에서의 역할

Prompt Caching은 프롬프트를 "이번 한 번의 요청"이 아니라 **반복 호출되는 구조물**로 설계하게 만드는 관점 전환이다. 시스템 프롬프트·도구 정의·참고 문서처럼 변하지 않는 부분을 의도적으로 앞에 고정 배치하는 것 자체가 프롬프트 엔지니어링의 일부가 된다. 비용 관점의 상세 최적화 루프는 [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Cost_Engineering]] 챕터를 참고.

## 관련 개념
[[AI/Engineering/Context_Engineering/Semantic_Cache|Semantic_Cache]] · [[AI/Engineering/Context_Engineering/LLM_Memory|LLM_Memory]] · [[AI/Engineering/Context_Engineering/Agentic_Context_Management|Agentic_Context_Management]] · [[AI/Engineering/Loop_Engineering/Runtime_Optimization|Loop_Engineering/Runtime_Optimization]] · [[AI/Engineering/Loop_Engineering/Cost_Engineering/Cost_Engineering|Loop_Engineering/Cost_Engineering]]

## 출처
1. "An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks" (2026) — [arXiv:2601.06007](https://arxiv.org/abs/2601.06007)
2. Anthropic "Prompt caching" — [platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
3. OpenAI "Prompt Caching in the API" — [openai.com/index/api-prompt-caching](https://openai.com/index/api-prompt-caching/)
