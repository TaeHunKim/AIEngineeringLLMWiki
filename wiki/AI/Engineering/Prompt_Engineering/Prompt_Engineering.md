---
order: 0
nav_order: 20
---

# Prompt Engineering (프롬프트 엔지니어링)

## 개요

**Prompt Engineering**은 LLM에게 전달하는 입력 텍스트(프롬프트)를 설계하여 원하는 출력을 이끌어내는 기술이다. 모델 가중치를 변경하지 않고 **입출력 인터페이스만으로 모델 동작을 제어**한다.

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[System_and_Role_Prompting]] | System Prompt 구조 설계, 역할 부여, Constitutional AI |
| [[Few_shot_Prompting]] | 예시로 가르치기 — Zero/One/Few-shot (Brown 2020) |
| [[Chain_of_Thought]] | 단계적 추론 유도 — CoT/ToT/Self-Consistency |
| [[Sampling_Controls]] | Temperature/Top-K/Top-P/Min-P로 출력 다양성 제어 |
| [[Structured_Output]] | JSON/YAML/Pydantic으로 구조화된 출력 보장 |

## 프롬프트 설계 원칙

```
1. 명확한 역할 부여     "당신은 시니어 Python 개발자입니다."
2. 구체적 지시         "3단계로 나누어 설명하세요."
3. 형식 명세           "JSON 형식으로 반환하세요: {key: value}"
4. 예시 제공           "예시: [입력] → [출력]"
5. 제약 조건           "200자 이내로, 전문 용어 없이"
```

## Model Engineering과의 차이

```
Model Engineering:  모델 가중치 변경 (비용 높음, 효과 영구적)
Prompt Engineering: 입력 텍스트 변경 (비용 낮음, 즉시 적용)

실무 순서:
  1. 먼저 Prompt Engineering으로 목표 달성 시도
  2. 부족하면 Fine-Tuning 검토
  3. 그래도 부족하면 Model Engineering 전체 고려
```

## AI Engineering에서의 역할

Prompt Engineering은 **가장 비용 효율적인 모델 동작 제어 수단**이다. 모델 개선의 80%는 프롬프트 수준에서 해결 가능하다는 것이 현장의 통념이다. 모든 AI 시스템의 첫 번째 최적화 포인트.

## 관련 개념
[[AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[Loop_Engineering/Continuous_Optimization]]
