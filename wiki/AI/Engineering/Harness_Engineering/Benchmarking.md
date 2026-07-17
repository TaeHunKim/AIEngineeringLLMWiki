---
order: 4
---

# Benchmarking (벤치마킹)

## 개요

**Benchmarking**은 표준화된 테스트 세트를 사용하여 LLM의 능력을 측정하고 모델 간 객관적 비교를 가능하게 하는 평가 방법론이다. 단일 숫자로 복잡한 LLM 능력을 요약하는 것의 한계가 있으나, 커뮤니티 기준 설정과 진보 추적에 필수적이다.

## 주요 벤치마크

### MMLU (Massive Multitask Language Understanding)
- **저자**: Hendrycks et al. (2021)
- **내용**: 57개 과목 × 15,000+ 객관식 문제 (초등수학 ~ 전문 법률·의학)
- **측정**: 일반 세계 지식 + 문제 해결 능력
- **점수**: GPT-3.5 ~70%, GPT-4 ~87%, Claude 3 Opus ~86%

```
포함 과목 예시:
  초등/중등/고등 수학, 미국 역사, 컴퓨터 과학
  법률, 의학, 물리, 심리학, 경제학 등 57개 분야
  → 언어 모델의 "교육 수준" 측정에 가장 많이 인용됨
```

### HumanEval
- **저자**: Chen et al., OpenAI (2021)
- **내용**: 164개 Python 함수 작성 문제 (독스트링 → 코드 생성)
- **측정**: 코딩 능력 (통과율 = pass@k)
- **특징**: 단위 테스트로 객관적 정오 판별

```python
# HumanEval 문제 예시
def has_close_elements(numbers: List[float], threshold: float) -> bool:
    """Check if in given list of numbers, are any two numbers closer to each other
    than given threshold.
    
    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    False
    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    True
    """
    # 모델이 이 함수 본체를 작성해야 함
```

**pass@k 메트릭**: k개 생성 중 하나라도 테스트 통과할 확률

### HellaSwag
- **저자**: Zellers et al. (2019)
- **내용**: 일상 상황 다음 문장 선택 (4지선다)
- **측정**: 상식 추론
- **특징**: 틀린 선택지가 통계적으로 그럴듯하게 설계 (AI 혼동 목적)

```
상황: "그는 잔디밭에 호스를 들고 나갔다."
정답: "그는 화단에 물을 주기 시작했다."
오답: "그는 자동차에서 뛰어내렸다." (통계적으로 그럴듯하나 문맥상 틀림)
```

### GSM8K
- 초등~중학교 수학 단어 문제 8,500개
- Chain-of-Thought 평가에 자주 사용
- GPT-4는 95%+ 정확도

### MATH
- 고등~대학 수학 경시대회 문제
- 미적분, 선형대수, 확률 등 포함
- 매우 어려움 (GPT-4도 ~40~50%)

### GPQA (Graduate-level Google-Proof Q&A)
- 박사급 전문가도 어려운 문제 (생물학, 화학, 물리)
- "Google로도 쉽게 못 찾는" 깊은 전문 지식 측정

### SWE-bench
- 실제 GitHub 이슈 해결 벤치마크
- LLM이 실제 코드 버그를 고치는 능력 측정
- Claude 3.5 Sonnet이 2024년 49% 달성 (업계 최초)

## 에이전트 전용 벤치마크

| 벤치마크 | 측정 대상 |
|---------|---------|
| **BFCL** | Function Calling 정확도 |
| **τ-bench** | 실제 업무 자동화 태스크 |
| **WebArena** | 웹 브라우저 자동화 |
| **OSWorld** | 운영체제 수준 태스크 실행 |
| **GAIA** | 범용 어시스턴트 능력 (아래 상세) |
| **AgentBench** | 다중 환경 에이전트 능력 (아래 상세) |

### GAIA (General AI Assistants)

Meta·HuggingFace 등이 공동 개발. **사람에게는 쉽지만 AI에게는 어려운** 실세계 질문 466개로 구성 — 여러 단계의 웹 검색, 파일 처리(PDF, 스프레드시트, 이미지), 도구 조합이 필요하다.

```
난이도 3단계:
  Level 1: 5단계 이하 추론, 최소 도구 사용
  Level 2: 5~10단계, 여러 도구 조합 필요
  Level 3: 임의 길이의 계획, 광범위한 도구 사용

특징: 답이 명확하고 검증 가능(사실 기반 단답형)하면서도
      "구글에 검색만 하면 바로 나오지 않는" 다단계 추론을 요구
      → 순수 지식 암기가 아니라 "에이전트로서의 문제 해결 능력"을 측정
```

GAIA는 사람 평가자가 92%, GPT-4(도구 없이)가 15% 수준의 정확도를 보여, 에이전트형 도구 사용 능력과 순수 언어 능력 사이의 간극을 드러낸 것으로 유명하다.

### AgentBench

칭화대 등이 개발. **8개의 서로 다른 환경**(OS, DB, 지식그래프, 디지털 카드게임, 격자 세계, 웹 쇼핑, 웹 브라우징, SQL)에서 LLM 에이전트의 추론·의사결정 능력을 통합 측정하는 벤치마크 스위트다.

```
AgentBench의 8개 환경 유형:
  Operating System · Database · Knowledge Graph
  Digital Card Game · House-holding (그리드 월드)
  Web Shopping · Web Browsing · SQL

측정 목적: 단일 태스크가 아니라 "다양한 환경에 걸친 일반화 능력"
          → 한 환경에 특화된 에이전트가 다른 환경에서도 잘 작동하는지 검증
```

GAIA·AgentBench 모두 [[Eval_Driven_Development_and_Agent_Workbench]]에서 다룬 "정적 벤치마크" 레이어에 해당하며, 실제 제품 평가에는 이를 보완하는 커스텀 오프라인·온라인 평가가 함께 필요하다.

## 벤치마크의 한계

### 1. 데이터 오염 (Data Contamination)
훈련 데이터에 테스트 문제가 포함될 경우 성능 과대 측정:
```
LLM 학습 데이터: 2021년까지 웹 크롤링
MMLU 출시: 2020년 → 일부 문제가 학습 데이터에 포함 가능
→ "외운 것"과 "이해한 것" 구분 어려움
```

### 2. 단순 벤치마크 최적화 (Goodhart's Law)
"측정치가 목표가 되면 좋은 측정치가 아니다":
```
모델이 MMLU 특화 훈련 → MMLU 높지만 실제 능력과 괴리
```

### 3. 좁은 측정 범위
멀티모달, 장기 맥락, 코드 실행 등 복합 능력은 단일 벤치마크로 측정 어려움.

### 4. 빠른 포화
최신 모델들이 기존 벤치마크를 거의 포화(saturation)시킴:
- MMLU: 상위 모델들이 85~90%대로 수렴
- HellaSwag: 상위 모델들이 95%+ → 변별력 없어짐

## 실무 벤치마크 선택 전략

```python
# 1. 태스크 특화 벤치마크 우선
"코드 생성 서비스" → HumanEval, SWE-bench
"수학 교육 서비스" → MATH, GSM8K
"의료 AI" → MedQA, USMLE
"일반 QA" → MMLU, TriviaQA

# 2. 내부 골든 셋 구축
internal_test_set = [
    {"input": 실제 사용자 쿼리, "expected": 전문가 작성 답변}
    for sample in production_samples
]
# → 실제 유스케이스 반영한 평가

# 3. 주기적 재평가
weekly_benchmark_run = schedule(
    evaluate_model(internal_test_set + standard_benchmarks),
    cron="0 0 * * 1"  # 매주 월요일
)
```

## AI Engineering에서의 역할

Benchmarking은 **모델 선택, 프롬프트 최적화, 파인튜닝 효과 측정**의 객관적 기준을 제공한다. 커뮤니티 공인 벤치마크로 모델 간 비교를 하되, 실제 프로덕션 성능은 내부 도메인 특화 테스트로 측정하는 이중 전략이 권장된다.

## 관련 개념
[[LLM_as_a_Judge]] · [[Human_Evaluation]] · [[Continuous_Optimization]] · [[Eval_Driven_Development_and_Agent_Workbench]] · [[Multi_Agent_Coordination]]

## 출처
- Hendrycks et al. (2021) "MMLU" — [arXiv:2009.03300](https://arxiv.org/abs/2009.03300)
- Chen et al. (2021) "HumanEval" — [arXiv:2107.03374](https://arxiv.org/abs/2107.03374)
- IBM "What Are LLM Benchmarks?" — [ibm.com](https://www.ibm.com/think/topics/llm-benchmarks)
- DataCamp "LLM Benchmarks Explained" — [datacamp.com](https://www.datacamp.com/tutorial/llm-benchmarks)
- Mialon et al. (Meta/HuggingFace, 2023) "GAIA: A Benchmark for General AI Assistants" — [arXiv:2311.12983](https://arxiv.org/abs/2311.12983)
- Liu et al. (Tsinghua, 2023) "AgentBench: Evaluating LLMs as Agents" — [arXiv:2308.03688](https://arxiv.org/abs/2308.03688)
- AI Engineering from Scratch, Phase 14 · Lesson 19 (Benchmarks — SWE-bench, GAIA, AgentBench) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering)
