---
order: 7
---

# Automatic Prompt Optimization (자동 프롬프트 최적화)

## 개요

**Automatic Prompt Optimization**은 프롬프트를 사람이 손으로 쓰지 않고, 목표와 평가 지표만 선언하면 옵티마이저가 프롬프트 문구·Few-shot 예시·지시 구조를 자동으로 탐색하게 하는 접근이다. 2024년 말부터 실무에 자리잡기 시작했으며, 프롬프트를 "작성하는 것"이 아니라 "컴파일하는 것"으로 보는 관점의 전환을 담고 있다.

이 문서는 그 패러다임 전환 자체와 **어떤 옵티마이저를 언제 쓰는가**를 다룬다. DSPy 컴파일의 최소 구성을 함께 설명하며, 독립 평가·배포·rollback 운영 루프는 [[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]]에서 다룬다.

## 왜 수작업 프롬프팅에 한계가 있는가

```
수작업 프롬프트 엔지니어링의 구조적 문제:
  - 사람의 직관이 모델의 실제 반응 패턴과 다를 수 있음
    ("정중하게 부탁하면 더 잘 따를 것"이라는 직관이 항상 맞지는 않음)
  - 프롬프트 하나를 조금 바꿀 때마다 전체 파이프라인을 수동 재평가해야 함
  - 모델이 바뀌면(GPT-4→GPT-5, Claude 3.5→4.5) 기존 프롬프트가 최적이 아니게 됨
    → 매 모델 업그레이드마다 수작업 재튜닝 필요
  - 멀티스텝 파이프라인(RAG, 에이전트)에서는 단계별 프롬프트가 서로 영향을 주고받아
    사람이 전체 최적 조합을 직관적으로 찾기 어려움
```

## 자동 최적화 기법 지형

| 기법 | 방식 | 특징 |
|------|------|------|
| **APE** (Automatic Prompt Engineer) | LLM에게 시연 예시로부터 후보 instruction을 역생성시킨 뒤 스코어링 | 최초 세대의 "LLM이 LLM 프롬프트를 쓴다" 접근 (Zhou et al., 2022) |
| **OPRO** (Optimization by PROmpting) | LLM 자체를 메타 최적화 알고리즘처럼 사용 — 이전 시도-점수 기록을 프롬프트에 넣고 다음 후보를 생성시킴 | 그래디언트 없이 순수 자연어 피드백 루프만으로 최적화 |
| **TextGrad** | "텍스트 기반 역전파" — 평가 피드백을 미분 가능한 손실처럼 취급해 파이프라인 각 노드의 프롬프트에 전파 | 멀티스텝 파이프라인 전체를 동시에 최적화 |
| **벤더 Prompt Improver** | Anthropic/OpenAI 등이 콘솔에 내장한 1회성 프롬프트 개선 도구 | 별도 파이프라인 구축 없이 즉시 사용 가능하나 반복 최적화 루프는 아님 |
| **DSPy 옵티마이저 계열** | 시그니처·모듈·메트릭을 선언하면 컴파일러가 프롬프트+예시를 탐색 | 아래 선택 가이드와 컴파일 예제 참고 |

## GEPA (ICLR 2026) — 반성 기반 진화 탐색

**GEPA**(Genetic-Pareto)는 DSPy 3.0에 포함된 옵티마이저로, ICLR 2026에서 발표되었다. 기존 RL 기반 최적화(GRPO)와의 차이가 핵심이다.

```
GRPO(RL 기반) 방식:
  수치 보상 신호만으로 정책을 점진적으로 갱신
  → 대량의 rollout(수천~수만 회) 필요

GEPA(반성 기반 진화) 방식:
  각 반복마다 미니배치 실행 → 실행 궤적(trajectory)에 대한 자연어 반성(reflection) 생성
  → "왜 이 응답이 틀렸는가"를 텍스트로 분석해 프롬프트를 직접 수정
  → 수정된 후보들을 Pareto frontier(사례별 성능의 상보성 고려)로 유지·선별
```

GEPA 논문 v2(2026-02-14)는 **6개 task**에서 GRPO 대비 평균 6%, 최대 20% 개선과 최대 35배 적은 rollout을 보고한다. 이는 논문의 모델·task·budget 설정에서 얻은 결과이지 모든 workload의 개선 보장이 아니다. Rollout 수와 전체 비용은 다르며 reflection model 비용도 포함해 비교한다.

## DSPy 옵티마이저 선택 가이드

DSPy는 "프롬프트를 컴파일한다"는 접근의 대표 프레임워크다. 옵티마이저 계보와 각각의 트레이드오프:

```mermaid
flowchart LR
    A["BootstrapFewShot<br/>Few-shot 예시만 부트스트랩"] --> B
    B["COPRO<br/>Instruction만 좌표 하강 탐색"] --> C
    C["MIPROv2<br/>Instruction + Few-shot 결합 탐색<br/>(Bayesian Optimization)"] --> D
    D["GEPA<br/>반성 기반 진화 탐색<br/>+ Pareto frontier"]
```

| 상황 | 권장 옵티마이저 |
|------|-----------------|
| 예시 몇 개만 잘 고르면 충분한 단순 태스크 | BootstrapFewShot |
| Instruction 문구 자체가 중요하고 예시는 불필요 | COPRO |
| 예시·지시문을 함께 탐색해야 하는 일반적인 경우 | MIPROv2 |
| 실행 궤적에서 유용한 자연어 feedback을 얻을 수 있는 경우 | GEPA |
| 모델 가중치 자체를 변경해야 하는 경우 | Prompt optimizer와 별도로 학습 파이프라인 검토; GRPO 등은 [[AI/Engineering/Model_Engineering/Training_and_Tuning/Full_Fine-Tuning\|Full_Fine-Tuning]] 참조 |

## DSPy 컴파일 구성

다음은 DSPy 3.4.1, Python 3.12 기준의 **설명용 API 예제**다. SDK import와 객체 구성은 검증했으며, 유료 LM 호출과 optimizer 학습은 실행하지 않았다. `DSPY_MODEL`은 LiteLLM provider/model 식별자이며 provider 인증과 사용 가능한 모델이 필요하다. 아래 toy dataset은 API 연결을 보여주기 위한 것으로 품질 주장의 근거가 아니다.

```python
import os
import dspy

dspy.configure(lm=dspy.LM(os.environ["DSPY_MODEL"]))

class Classify(dspy.Signature):
    """Classify sentiment as positive or negative."""
    text: str = dspy.InputField()
    label: str = dspy.OutputField()

program = dspy.Predict(Classify)
train = [
    dspy.Example(text="Useful and reliable.", label="positive").with_inputs("text"),
    dspy.Example(text="It fails repeatedly.", label="negative").with_inputs("text"),
]
validation = [
    dspy.Example(text="I would use this again.", label="positive").with_inputs("text"),
    dspy.Example(text="I regret buying this.", label="negative").with_inputs("text"),
]

def metric(example, prediction, trace=None):
    return prediction.label.strip().lower() == example.label

optimizer = dspy.MIPROv2(metric=metric, auto="light")
optimized = optimizer.compile(program, trainset=train, valset=validation)
optimized.save("sentiment-program.json")
```

실제 적용에는 충분한 대표 사례와 별도의 held-out test가 필요하다. `trainset`과 `valset`은 optimizer가 후보 탐색에 사용하므로 최종 품질은 둘 모두와 독립된 test에서 측정한다. 원본 program과 compiled artifact를 같은 모델·metric으로 비교하고 호출 수·token 비용도 기록한다.

## 적용 조건과 실패 모드

- 오류를 구분할 metric과 대표 데이터가 없으면 optimizer도 잘못된 목표를 최적화한다. Judge 편향·정답 누수·길이 편향을 먼저 점검한다.
- MIPROv2는 instruction과 few-shot 조합을 탐색한다. GEPA는 궤적에 대한 reflection이 유용할 때 검토한다. 알고리즘 이름만으로 우열을 정하지 않는다.
- 모델·tool schema·retrieval 분포가 바뀌면 artifact를 재평가한다. Validation 점수 상승만으로 배포하지 않는다.
- 쉬운 문제만 좋아지고 중요한 소수 task가 악화될 수 있다. 오류 유형별 성능, 실패율, 비용·latency를 함께 비교한다.

## 경계 정리

| 문서 | 다루는 것 |
|------|-----------|
| **본 문서 (Automatic_Prompt_Optimization)** | Prompt 후보 탐색·optimizer 선택·DSPy 컴파일 구성 |
| [[AI/Engineering/Loop_Engineering/Continuous_Optimization\|Continuous_Optimization]] | 실패 수집·독립 평가·A/B·버전 관리·rollback을 포함한 **운영 루프** |

## AI Engineering에서의 역할

자동 프롬프트 최적화는 Prompt Engineering과 Loop Engineering의 경계에 걸쳐 있는 기법이다 — 결과물은 여전히 "프롬프트"(Prompt Engineering의 대상)이지만, 그것을 만드는 과정은 반복적 평가·개선 루프(Loop Engineering의 방법론)를 따른다. 모델이 업그레이드될 때마다 프롬프트를 수작업으로 재튜닝하는 비용이 조직 규모에서 무시할 수 없어지면서, 자동 탐색의 비용을 회수할 만큼 반복 사용되는 pipeline에서 유용하다. 단순 task는 수작업 baseline과 먼저 비교한다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous_Optimization]] · [[AI/Engineering/Prompt_Engineering/Few_shot_Prompting|Few_shot_Prompting]] · [[AI/Engineering/Prompt_Engineering/System_and_Role_Prompting|System_and_Role_Prompting]] · [[AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge|LLM_as_a_Judge]] · [[AI/Engineering/Loop_Engineering/Self_Evolving_Harnesses|Self_Evolving_Harnesses]]

## 출처
- Zhou et al. (2022) "Large Language Models Are Human-Level Prompt Engineers (APE)" — [arXiv:2211.01910](https://arxiv.org/abs/2211.01910)
- Yang et al. (2023) "Large Language Models as Optimizers (OPRO)" — [arXiv:2309.03409](https://arxiv.org/abs/2309.03409)
- Yuksekgonul et al. (2024) "TextGrad: Automatic Differentiation via Text" — [arXiv:2406.07496](https://arxiv.org/abs/2406.07496)
- Khattab et al. (2023) "DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines" — [arXiv:2310.03714](https://arxiv.org/abs/2310.03714)
- Agrawal et al. (2026) "GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning" (ICLR 2026) — [arXiv:2507.19457](https://arxiv.org/abs/2507.19457)

- DSPy, [MIPROv2 API](https://dspy.ai/api/optimizers/MIPROv2/)
- DSPy, [Optimizers](https://dspy.ai/learn/optimization/optimizers/)
