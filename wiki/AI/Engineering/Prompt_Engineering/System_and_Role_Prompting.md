---
order: 1
---

# System Prompting & Role Prompting

## 개요

**System Prompting**은 LLM의 전반적인 행동, 성격, 제약 조건을 설정하는 특수 입력이다. **Role Prompting**은 모델에게 특정 전문가나 페르소나의 역할을 부여하여 해당 관점의 응답을 유도하는 기법이다. 두 기법 모두 Input Control의 핵심 도구다.

## System Prompt의 역할

모든 현대 채팅 LLM API(OpenAI, Anthropic, Google 등)는 System 메시지를 별도로 지원:

```python
# OpenAI API 예시
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "당신은 한국 법률 전문 AI 어시스턴트입니다. "
                       "판례와 법조문을 기반으로 답변하고, "
                       "법적 조언이 아님을 항상 명시하세요."
        },
        {"role": "user", "content": "계약 해지 조건이 궁금합니다."}
    ]
)
```

### System Prompt의 구성 요소

| 구성 요소 | 예시 | 역할 |
|---------|------|------|
| **페르소나** | "당신은 10년 경력의 데이터 과학자입니다" | 전문성·톤 설정 |
| **태스크 정의** | "사용자 코드의 버그를 찾고 수정하세요" | 행동 범위 |
| **제약 조건** | "의료 진단은 하지 마세요" | 안전 가드레일 |
| **출력 형식** | "JSON으로만 응답하세요" | 형식 제어 |
| **컨텍스트** | "회사명: Acme Corp. 제품: CRM 소프트웨어" | 배경 정보 |

## Role Prompting

### 기본 개념
```
"당신은 [역할]입니다. [역할의 특성/지식/제약]을 가지고 답변하세요."
```

### 효과적인 Role 유형

**전문가 역할**: 응답의 전문성과 정확도 향상
```
"당신은 Google에서 15년간 근무한 시니어 SRE 엔지니어입니다.
대규모 분산 시스템의 장애 대응 경험이 풍부합니다."
```

**페르소나 역할**: 특정 커뮤니케이션 스타일 부여
```
"당신은 소크라테스식 문답법을 사용하는 교육자입니다.
직접 답을 주지 않고 질문으로 학생의 사고를 유도합니다."
```

**시뮬레이션 역할**: 가상 상황 설정
```
"당신은 반론자(Devil's Advocate)입니다.
사용자의 아이디어에서 가능한 약점과 리스크를 찾아 지적하세요."
```

## System Prompt 작성 모범 사례

### 1. 구체적이고 명확하게
```
❌ "도움이 되게 답변하세요"
✅ "사용자 질문에 대해 다음 형식으로 답변하세요:
    1. 핵심 답변 (1~2문장)
    2. 상세 설명 (3~5문장)
    3. 실용적 예시 1개"
```

### 2. 예시 포함 (Positive + Negative)
```
"날씨 질문에는 이렇게 답변하세요: '현재 기상청 데이터 기준...'
단, 정확한 예보는 제공하지 마세요. 예시: '정확한 날씨는 기상청을 확인하세요'"
```

### 3. 제약 조건 명시
```
"다음 주제에는 응답하지 마세요:
- 경쟁사 제품 비교
- 미발표 제품 로드맵
- 법적 분쟁 관련 내용"
```

## Anthropic Claude의 System Prompt 구조

Anthropic은 다층 System Prompt를 공식 지원:
- **Operator Prompt**: 서비스 운영자가 설정 (비즈니스 규칙)
- **User Turn**: 실제 사용자 메시지
- Claude의 RLHF 학습으로 System Prompt를 강력하게 따름

## AI Engineering에서의 역할

System Prompt는 LLM 애플리케이션의 **설계 계약서**다. 잘 설계된 System Prompt는 Fine-Tuning 없이도 모델 행동을 원하는 대로 제어할 수 있게 한다. 프로덕션 배포 시 System Prompt는 코드만큼 중요한 자산으로 관리되어야 한다.

## 관련 개념
[[Few_shot_Prompting]] · [[Chain_of_Thought]] · [[Structured_Output]] · [[Guardrail_Engineering]]

## 출처
- Anthropic "Prompt Engineering Overview" — [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- OpenAI "Prompt Engineering Guide" — [platform.openai.com](https://platform.openai.com/docs/guides/prompt-engineering)
- White et al. (2023) "A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT" — [arXiv:2302.11382](https://arxiv.org/abs/2302.11382)
