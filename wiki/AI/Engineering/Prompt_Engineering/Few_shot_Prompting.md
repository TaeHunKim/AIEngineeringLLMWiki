---
order: 2
---

# One-shot & Few-shot Prompting

## 개요

**Few-shot Prompting**은 프롬프트 내에 태스크의 입력-출력 예시를 포함시켜 모델이 원하는 패턴을 따르도록 유도하는 기법이다. 별도의 Fine-tuning 없이 In-Context Learning을 통해 새로운 태스크를 즉시 수행하게 만든다.

## 제창

- **저자**: Brown et al., OpenAI (2020)
- **논문**: "Language Models are Few-Shot Learners" (GPT-3 논문) — [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)
- GPT-3이 few-shot 예시만으로 많은 태스크를 수행함을 보여줌

## 유형

### Zero-shot
예시 없이 태스크 설명만으로 수행:
```
Q: "다음 리뷰의 감성을 분류하세요: '이 영화는 최고였어요!'"
A: 긍정
```

### One-shot
예시 1개 제공:
```
예시:
  입력: "배송이 너무 느렸어요"
  출력: 부정

질문:
  입력: "품질이 기대 이상이에요"
  출력: ?
```

### Few-shot
예시 3~10개 제공:
```
예시들:
  입력: "배송이 느렸어요" → 부정
  입력: "가격 대비 최고예요" → 긍정
  입력: "그냥 평범해요" → 중립

질문: "다음 달 다시 구매할게요" → ?
```

## 효과적인 Few-shot 예시 선정

### 예시 품질 기준
1. **다양성**: 다양한 패턴·엣지 케이스 커버
2. **관련성**: 실제 추론 태스크와 유사
3. **균형**: 클래스별 균등 분포
4. **명확성**: 모호하지 않은 정답

### 예시 수와 성능

일반적으로 예시 수 증가 → 성능 향상, 단 수확 체감:
```
0-shot: 기준
1-shot: +10~20% 향상
3-shot: +15~25% 향상
10-shot: +18~28% 향상
20+shot: 컨텍스트 창 제한 & 수확 체감
```

### 예시 순서의 영향
최근 연구(2022~)에서 예시 순서가 성능에 영향을 줌이 밝혀짐 (Recency Bias). 중요한 예시를 마지막에 배치하면 효과적.

## 포맷 제어에서의 활용

Few-shot은 특정 출력 형식을 강제하는 데 매우 효과적:

```
예시:
  입력: "회의 요약: 다음 분기 매출 목표 10억으로 설정"
  출력: {
    "주제": "매출 목표 설정",
    "결정 사항": ["Q4 목표: 10억원"],
    "담당자": []
  }

질문:
  입력: "회의 요약: 박팀장이 신규 채용 3명 승인"
  출력: ?
```

## Zero-shot vs Few-shot 선택

| 상황 | 추천 |
|------|------|
| 일반적인 태스크 | Zero-shot |
| 특수 형식 출력 필요 | Few-shot |
| 도메인 특화 판단 기준 | Few-shot |
| 모델이 태스크를 이해 못함 | Few-shot |
| 컨텍스트 창이 짧음 | Zero-shot |

## Few-shot + CoT 조합

복잡한 추론이 필요한 태스크에서 특히 강력:
```
예시 (CoT 포함):
  Q: "John은 5개, Mary는 3개 사과가 있다. 둘이 합치면?"
  A: "John 5개 + Mary 3개 = 8개" → 8개

질문:
  Q: "Tom은 8개, Jim은 4개를 Sam에게 주었다. Sam이 받은 것은?"
  A: ?
```

→ [[Chain_of_Thought]] 참조

## AI Engineering에서의 역할

Few-shot Prompting은 Fine-tuning 전 빠른 프로토타이핑의 핵심 기법이다. "이 예시들처럼 해줘"는 가장 직관적인 모델 제어 방법이며, 새로운 도메인에 빠르게 적응시킬 때 Fine-tuning보다 훨씬 저렴하다. 단, 컨텍스트 창 비용과 Prompt Injection 위험도 고려해야 한다.

## 관련 개념
[[System_and_Role_Prompting]] · [[Chain_of_Thought]] · [[Structured_Output]]

## 출처
- Brown et al. (2020) "Language Models are Few-Shot Learners" — [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)
- Min et al. (2022) "Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?" — [arXiv:2202.12837](https://arxiv.org/abs/2202.12837)
- Anthropic Prompt Engineering Guide — [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
