---
order: 4
---

# Hallucination & Grounding (환각 탐지와 근거 검증)

## 개요

**Hallucination**은 LLM이 그럴듯하지만 사실과 다르거나 주어진 근거에 없는 내용을 생성하는 현상이다. 모델이 "모르는 것을 모른다고 말하는 대신 추측으로 채우도록" 학습·평가되는 구조에서 비롯되므로 [[AI/Engineering/Model_Engineering/Model_Engineering|모델 수준]]에서 완전히 제거되지 않고, 프로덕션에서는 **탐지하고 차단하는 시스템 계층**의 문제로 다뤄진다.

[[AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge|LLM_as_a_Judge]]가 품질 평가 일반을, [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]]이 입출력 차단 인프라를 다룬다면, 이 문서는 그 위에서 돌아가는 **"이 답변의 주장이 근거에 의해 뒷받침되는가"라는 단일 질문**과 그 측정·강제 기법을 다룬다.

## 분류

| 구분 | 정의 | 예 |
|------|------|-----|
| **Intrinsic (faithfulness 위반)** | 주어진 소스와 **모순**되는 출력 | 문서에는 "2023년"인데 요약에 "2021년" |
| **Extrinsic (factuality 위반)** | 소스로 **검증 불가능**하거나 세계 지식과 어긋나는 출력 | 존재하지 않는 논문·API 인용 |

RAG 시스템에서는 주로 **faithfulness**(검색된 컨텍스트에 충실한가)가 측정 대상이고, 컨텍스트가 없는 일반 질의에서는 **factuality**가 대상이다. 둘은 탐지 기법도 다르다 — 전자는 소스와의 대조로, 후자는 모델 자체 신호(일관성·불확실성)나 외부 지식으로 검증한다.

## 왜 생기는가

- **평가 인센티브**: 정답에 점수를 주고 "모르겠다"에 0점을 주는 벤치마크는 추측을 보상한다. OpenAI 연구진은 이 점을 환각의 구조적 원인으로 분석한다 [4].
- **분포 밖 질문**: 학습 데이터에 드문 사실(long-tail)일수록 그럴듯한 패턴 완성이 사실 회상을 대체한다.
- **컨텍스트 오염**: 검색 결과가 틀렸거나 무관하면 모델은 그것을 충실히 반영한 "근거 있는 오답"을 만든다 — [[AI/Engineering/Context_Engineering/Lost_in_the_Middle|Lost in the Middle]]처럼 긴 컨텍스트에서 근거를 놓치는 경우도 포함된다.

## 탐지 기법

### 1. Groundedness 검증 (claim 단위)

답변을 **원자적 주장(atomic claim)** 으로 분해하고, 각 주장이 검색된 컨텍스트에 의해 entailment되는지 NLI 모델이나 judge LLM으로 판정한다. FActScore [3]가 이 분해-검증 방식을 정립했다. 문장 단위 판정보다 어느 주장이 문제인지 **span 수준으로 위치를 짚을 수 있어** 사용자에게 "이 부분은 근거 없음"이라고 표시하거나 해당 문장만 재생성할 수 있다. 판정 모델로는 Vectara HHEM 같은 전용 경량 분류기와 RAGAS의 faithfulness 지표(→ [[AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge|LLM_as_a_Judge]])가 쓰인다.

### 2. 샘플링 일관성 (Self-consistency 계열)

같은 질문을 여러 번 샘플링해 답이 흔들리면 환각 가능성이 높다고 본다. **SelfCheckGPT** [2]는 외부 지식 없이 이 아이디어만으로 문장별 환각 점수를 낸다. 한계는 비용(N배 호출)과, 모델이 **일관되게 틀리는** 경우를 못 잡는다는 점이다.

### 3. Semantic Entropy

표면 문자열이 아니라 **의미가 같은 답끼리 묶은 뒤** 그 분포의 엔트로피를 계산한다. Farquhar et al. (Nature, 2024) [1]은 표현만 다른 같은 답을 불확실성으로 오인하지 않도록 해 단순 토큰 엔트로피보다 임의적 오답(confabulation) 탐지 성능을 높였다. 샘플링 비용이 들지만 "모델이 정말 모르는 질문"을 가려내는 가장 원리적인 신호로 평가된다.

### 4. 토큰 확률·내부 신호

logprob 기반 신뢰도는 저렴하지만 **calibration**이 보장되지 않는다 — 확률 보정 기법과 ECE 측정은 [[AI/Engineering/Model_Engineering/Model_Types/Decision_Models|Decision_Models]]가 다룬다. 모델 내부 표현을 읽는 white-box probe는 [[AI/Engineering/Harness_Engineering/Alignment_and_Governance/Mechanistic_Interpretability|Mechanistic_Interpretability]]의 연장선이다.

## 예방 기법

- **RAG-first**: 검색된 컨텍스트가 없으면 답하지 않도록 설계 → [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]], 검색 품질이 낮을 때 재시도하는 [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic_RAG]]의 CRAG/Self-RAG
- **인용 강제**: 모든 주장에 소스 span ID를 붙이게 하고 [[AI/Engineering/Prompt_Engineering/Structured_Output|Structured_Output]] 스키마로 형식을 보장한 뒤, 인용된 span이 실제로 주장을 지지하는지 사후 검증한다(ALCE [5]가 인용 품질 평가 기준을 제공).
- **기권(abstention) 허용**: 프롬프트와 평가셋 모두에서 "근거 부족"을 정상 출력으로 인정한다. 기권을 감점하는 평가는 환각을 키운다.
- **도구 위임**: 계산·날짜·DB 조회처럼 결정적으로 답이 정해진 것은 [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]]으로 위임해 모델의 기억에 의존하지 않는다.

## 프로덕션 스택

```
1. 결정적 검사     스키마 검증, 인용 ID 존재 여부, 금지 패턴 (비용 ≈ 0)
2. 신뢰도 triage   logprob / 경량 분류기로 의심 응답만 선별
3. 근거 검증       의심 응답에 한해 claim 단위 entailment (비용 높음)
4. 임계값 정책     통과 / 재생성 / 기권 / 사람 검토 중 하나로 라우팅
```

모든 응답에 3단계를 돌리면 비용이 폭증하므로 **싼 신호로 거르고 비싼 검증은 의심 응답에만** 적용하는 것이 요점이다. 임계값은 도메인 위험도(의료·법률은 보수적)에 맞춰 조정하고, 차단된 응답은 [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability_and_Tracing]]에 기록해 오프라인 평가셋으로 환류한다.

## 경계 정리

| 문서 | 다루는 것 |
|------|-----------|
| [[AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge\|LLM_as_a_Judge]] | 품질 평가 일반(관련성·톤·정확성), judge 편향 |
| [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering\|Guardrail_Engineering]] | 입출력 차단 인프라(NeMo, LlamaGuard), 안전·정책 위반 |
| [[AI/Engineering/Model_Engineering/Model_Types/Decision_Models\|Decision_Models]] | 판정형 모델과 확률 calibration |
| **본 문서** | "주장이 근거에 의해 뒷받침되는가" — 탐지·예방·정책 |

## 관련 개념
[[AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge|LLM_as_a_Judge]] · [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]] · [[AI/Engineering/Model_Engineering/Model_Types/Decision_Models|Decision_Models]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[AI/Engineering/Prompt_Engineering/Structured_Output|Structured_Output]] · [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability_and_Tracing]]

## 출처
- [1] Farquhar et al. (2024) "Detecting hallucinations in large language models using semantic entropy" — Nature 630, 625–630, [nature.com](https://www.nature.com/articles/s41586-024-07421-0)
- [2] Manakul et al. (2023) "SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection" — [arXiv:2303.08896](https://arxiv.org/abs/2303.08896)
- [3] Min et al. (2023) "FActScore: Fine-grained Atomic Evaluation of Factual Precision" — [arXiv:2305.14251](https://arxiv.org/abs/2305.14251)
- [4] Kalai et al. (2025) "Why Language Models Hallucinate" — [arXiv:2509.04664](https://arxiv.org/abs/2509.04664)
- [5] Gao et al. (2023) "Enabling Large Language Models to Generate Text with Citations (ALCE)" — [arXiv:2305.14627](https://arxiv.org/abs/2305.14627)
- Ji et al. (2023) "Survey of Hallucination in Natural Language Generation" — ACM Computing Surveys, [arXiv:2202.03629](https://arxiv.org/abs/2202.03629)
