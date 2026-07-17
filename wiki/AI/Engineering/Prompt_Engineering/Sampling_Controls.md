---
order: 4
---

# Sampling Controls (Temperature, Top-K, Top-P)

## 개요

LLM은 각 토큰을 생성할 때 **확률 분포**에서 샘플링한다. Sampling Controls는 이 확률 분포를 조정하여 출력의 다양성(창의성) vs 집중도(정확성) 균형을 제어하는 파라미터들이다.

## 토큰 생성 기본 원리

```
입력: "오늘 날씨가"
LLM이 계산한 다음 토큰 확률 분포:
  "좋다": 0.45
  "나쁘다": 0.30
  "맑다": 0.15
  "춥다": 0.08
  기타: 0.02

→ Sampling Controls로 이 분포를 변형 후 샘플링
```

## Temperature

### 개념
확률 분포의 **"날카로움"** 을 조절하는 파라미터. 로짓(logit)을 Temperature로 나누어 softmax 적용:

```
P(token_i) = exp(logit_i / T) / Σ exp(logit_j / T)
```

### 효과

```
T=0.1 (낮음 — 집중):
  "좋다": 0.90, "나쁘다": 0.08, "맑다": 0.02
  → 항상 "좋다" 선택. 예측 가능, 반복적

T=1.0 (기본):
  원래 분포 유지

T=2.0 (높음 — 분산):
  "좋다": 0.35, "나쁘다": 0.30, "맑다": 0.25, 기타...
  → 다양하고 의외의 토큰 선택. 창의적이나 불안정
```

### 실무 설정값

| 태스크 | Temperature | 이유 |
|------|------------|------|
| 코드 생성, 수학 | 0.0~0.3 | 정확성 우선 |
| Q&A, 요약 | 0.3~0.7 | 균형 |
| 창작 글쓰기 | 0.7~1.2 | 다양성 |
| 브레인스토밍 | 1.0~1.5 | 창의성 극대화 |

**T=0** (Greedy Decoding): 항상 가장 확률 높은 토큰 선택. 결정론적.

## Top-K Sampling

### 개념
확률 상위 **K개 토큰만** 후보로 유지하고 나머지 제거 후 재정규화:

```
K=5로 설정:
  상위 5개 토큰만 후보:
    "좋다": 0.45 → 0.58 (재정규화)
    "나쁘다": 0.30 → 0.38
    "맑다": 0.15 → 0.19 (이하 제거)
    "춥다": 제거
    기타: 제거
```

### 장단점
- 확률이 낮은 이상한 토큰(obscure tokens) 차단
- K를 고정하면 분포 형태에 따라 효과가 달라짐 (분포가 평탄하면 K=5도 많음)

## Top-P (Nucleus Sampling)

### 개념
누적 확률이 **P에 도달할 때까지** 상위 토큰만 후보로 유지:

```
P=0.9 설정:
  "좋다": 0.45 → 누적 0.45
  "나쁘다": 0.30 → 누적 0.75
  "맑다": 0.15 → 누적 0.90 ← 여기서 중단
  "춥다": 0.08 → 제거
  → 후보: {좋다, 나쁘다, 맑다} 재정규화 후 샘플링
```

### Top-P의 장점
분포 형태에 **동적으로 적응**:
- 분포가 집중적일 때 (모델 확신↑): 자동으로 적은 토큰 선택
- 분포가 평탄할 때 (모델 불확실↑): 자동으로 많은 토큰 선택

Top-K보다 Top-P가 더 안정적인 경향 → **Top-P가 실무에서 더 많이 사용**

## Min-P Sampling (2024)

Top-P의 약점(낮은 확률 토큰 포함 가능성)을 보완:
- 최고 확률 토큰의 확률 × min_p 미만인 토큰 모두 제거
- 최고 확률이 높을 때 더 강하게 필터링
- Min-P=0.05~0.1 권장

## 조합 사용

실무에서는 보통 여러 파라미터를 함께 사용:

```python
# OpenAI/Anthropic API 예시
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    temperature=0.7,   # 적당한 창의성
    top_p=0.9,         # 상위 90% 누적 확률
    # top_k=40,        # Anthropic은 top_k도 지원
)
```

**주의**: Temperature와 Top-P/Top-K를 동시에 조정하면 상호작용이 복잡해짐. 보통 하나만 조정.

## Beam Search (결정론적 방식)

샘플링과 다른 접근: 상위 B개 시퀀스를 동시에 유지하며 탐색:
```
B=3으로 설정, 3개 경로 동시 탐색:
  경로1: "오늘 날씨가 좋다" (누적 확률: 0.45×0.6 = 0.27)
  경로2: "오늘 날씨가 나쁘다" (누적 확률: 0.30×0.7 = 0.21)
  경로3: "오늘 날씨가 맑다" (누적 확률: 0.15×0.8 = 0.12)
→ 가장 높은 누적 확률 경로 선택
```
주로 번역, 요약 등에서 사용. 창의성 낮음.

## AI Engineering에서의 역할

Sampling Controls는 LLM 애플리케이션의 **품질 특성을 결정**하는 핵심 파라미터다. 고객 응대 봇(낮은 Temperature)과 창작 도구(높은 Temperature)는 동일 모델로도 전혀 다른 출력 특성을 가진다. 프로덕션 배포 전 각 태스크에 맞는 최적 파라미터를 실험으로 결정해야 한다.

---

## 최신 모델의 Temperature 제한 추세 (2025~2026)

최근 주요 LLM 제공사들은 최신 모델에서 Temperature를 포함한 샘플링 파라미터의 사용자 조정을 **금지하거나 강력히 비권장**하는 방향으로 전환하고 있다.

### OpenAI

**추론 모델 (o1, o3) 계열**: temperature, top_p, n은 1로 고정되며 변경 불가. 값을 전달하면 API 에러를 반환한다 [1].

```
# 에러 예시
openai.BadRequestError: temperature is not supported with this model (o3)
```

**GPT-5**: temperature 조정이 더 이상 허용되지 않으며, 모든 프롬프트에 대해 자동으로 1.0으로 설정된다 [2].

**Realtime API**: GA 인터페이스에서 temperature 파라미터가 완전 제거됨. 베타 인터페이스는 0.6~1.2 범위로 제한 (기본값 0.8) [3].

### Anthropic Claude

**Claude Opus 4.7 (2026년 5월~)**: temperature, top_p, top_k에 기본값이 아닌 값을 전달하면 **HTTP 400 에러**를 반환한다 [4][5].

```python
# 더 이상 동작하지 않음 (Claude Opus 4.7)
client.messages.create(
    model="claude-opus-4-7",
    temperature=0.7,   # → 400 Bad Request
    top_p=0.9,         # → 400 Bad Request
)
# 권장: 해당 파라미터를 아예 제거
```

마이그레이션 가이드 공식 권고: "파라미터를 제거하고 행동 조정은 프롬프트로 대체하라" [6].

**Claude 4.5**: temperature와 top_p를 동시에 지정 불가. `temperature and top_p cannot both be specified` 에러 반환.

### Google Gemini

**Gemini 3.x 계열**: temperature를 공식 폐기하지는 않았으나, **기본값(1.0) 유지를 강력 권장**. 변경 시 루핑, 추론 성능 저하 등 예측 불가능한 동작이 발생할 수 있다고 공식 문서에서 명시 [7].

```
"setting temperature below 1.0 can cause unexpected behavior,
such as looping or degraded performance, particularly in
complex mathematical or reasoning tasks"
— Google Gemini API 공식 문서
```

### 제한하는 이유

| 이유 | 설명 |
|------|------|
| **사전 최적화된 샘플링** | 최신 모델은 RLHF, Constitutional AI 등으로 이미 내부 분포가 최적화되어 있어 추가 조정이 불필요하거나 역효과를 낼 수 있음 |
| **추론 안정성** | 추론(Reasoning) 모델은 Chain-of-Thought를 내부적으로 수행하며, temperature가 낮으면 탐색 다양성이 사라지고 높으면 논리 일관성이 깨짐 |
| **Safety 훼손 위험** | temperature를 극단값으로 설정하면 안전 필터의 균형이 무너질 수 있음 |
| **결정론적 출력의 환상** | `temperature=0`도 완전한 결정론적 출력을 보장하지 않으며, 이 오해를 방지하기 위해 아예 제거하는 추세 |

### 실무 권고

최신 모델을 사용할 때는 **sampling 파라미터를 요청에서 제거**하고, 출력 스타일 조정은 System Prompt나 지시문으로 대체하는 것이 권장된다.

```python
# 구식 접근 (최신 모델에서 에러 가능)
response = client.messages.create(
    model="claude-opus-4-7",
    temperature=0.3,
    messages=[{"role": "user", "content": "코드를 작성해줘"}]
)

# 현재 권장 접근
response = client.messages.create(
    model="claude-opus-4-7",
    system="정확하고 간결하게 답변하라. 불필요한 설명을 생략하라.",
    messages=[{"role": "user", "content": "코드를 작성해줘"}]
)
```

## 관련 개념
[[Structured_Output]] · [[Chain_of_Thought]] · [[LLM_as_a_Judge]]

## 출처
- Holtzman et al. (2020) "The Curious Case of Neural Text Degeneration (Top-P)" — [arXiv:1904.09751](https://arxiv.org/abs/1904.09751)
- Anthropic API 문서 — [docs.anthropic.com](https://docs.anthropic.com/en/api/getting-started)
- "Give Me BF16 or Give Me Death: Accuracy-Performance Trade-Offs" (2024) — [arXiv:2411.02355](https://arxiv.org/pdf/2411.02355)
- [1] OpenAI Community: "temperature is not supported with this model (o3)" — [github.com/openai/openai-python/issues/2104](https://github.com/openai/openai-python/issues/2104)
- [2] OpenAI Community: "Temperature in GPT-5 models" — [community.openai.com](https://community.openai.com/t/temperature-in-gpt-5-models/1337133)
- [3] OpenAI Developer Blog: "Developer notes on the Realtime API" — [developers.openai.com](https://developers.openai.com/blog/realtime-api)
- [4] LaoZhang AI Blog: "Claude Opus 4.7 Temperature Parameter: Remove It, Do Not Retune It" — [blog.laozhang.ai](https://blog.laozhang.ai/en/posts/claude-opus-4-7-temperature-parameter)
- [5] Zenn: "A Summary of Breaking Changes in Claude Opus 4.7" — [zenn.dev](https://zenn.dev/knowledge_graph/articles/claude-opus-47-breaking-changes?locale=en)
- [6] Anthropic: "Migration guide" — [platform.claude.com/docs/en/about-claude/models/migration-guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide)
- [7] Google AI: "Gemini API — Content generation parameters" — [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs/gemini-3)
