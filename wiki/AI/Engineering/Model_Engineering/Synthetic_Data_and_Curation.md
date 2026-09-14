---
order: 7
---

# Synthetic Data & Curation (합성 데이터와 데이터 큐레이션)

## 개요

**Fine-Tuning**([[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full_Fine-Tuning]], [[AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA|PEFT_LoRA_QLoRA]])이 "어떻게 학습시키는가"를 다루고 [[AI/Engineering/Model_Engineering/Model_Distillation|Model_Distillation]]이 "어떻게 가중치를 압축하는가"를 다룬다면, 본 문서는 그 이전 단계 — **학습에 쓸 데이터셋을 어떻게 만들고 정제하는가**를 다룬다. 2025~2026년 SFT 데이터의 대세는 사람이 직접 쓰는 것이 아니라 **프론티어 모델이 생성하고, 별도 judge가 걸러낸** 합성 데이터다.

## 합성 데이터 생성 기법

```mermaid
flowchart LR
    S1["Seed Task<br/>사람이 만든 소량의 시드 예시"] --> S2["생성 LLM<br/>(프론티어 모델)"]
    S2 --> S3["대량 합성 데이터<br/>(instruction, response)"]
    S3 --> S4["Judge 필터링"]
    S4 --> S5["학습 데이터셋"]
```

| 기법 | 방식 | 특징 |
|------|------|------|
| **Self-Instruct** | 소수 시드 태스크 → LLM이 스스로 새 instruction·response 생성 | 최초의 합성 instruction tuning 데이터 생성법 (Wang et al., 2022) |
| **Evol-Instruct** | 기존 instruction을 LLM으로 "진화"(복잡도 증가·제약 추가·심화) | WizardLM 계열, 난이도 분포를 인위적으로 넓힘 |
| **프론티어 모델 distillation** | GPT-5/Claude/Gemini 같은 최상위 모델의 응답을 그대로 SFT 데이터로 사용 | 2025~2026년 실무에서 가장 흔한 경로 — 사람이 쓰는 것보다 품질·비용 모두 유리 |
| **Function-calling trace 생성** | 에이전트가 도구를 호출하는 궤적을 합성 태스크로 생성 | 에이전트 SFT/RLVR용 데이터의 핵심 소스, [[AI/Engineering/Loop_Engineering/RL_Environments\|RL_Environments]]와 연결 |
| **RAG QA 페어 생성** | 문서 코퍼스에서 (질문, 근거 문단, 답변) 삼중항을 LLM으로 자동 생성 | retrieval-grounded 파인튜닝 데이터 |
| **Constitutional AI 데이터** | 모델이 스스로 유해 응답을 비판·수정한 기록을 학습 데이터로 사용 | 안전 정렬 데이터 생성, [[AI/Engineering/Harness_Engineering/Guardrail_Engineering\|Guardrail_Engineering]] 참고 |

## Judge 필터링 — 가장 큰 레버

**필터링되지 않은 대량의 합성 데이터 < 필터링된 소량의 합성 데이터.** 이는 2025~2026년 데이터 큐레이션 실무에서 가장 반복적으로 확인되는 원칙이다.

```
파이프라인:
  대량 생성 (10,000개) → LLM Judge 채점 → 하위 70% 폐기 → 상위 30% (3,000개)만 학습에 사용

  10,000개 필터링 없이 학습 → 노이즈·저품질 응답이 그대로 모델에 각인
  3,000개 필터링 후 학습   → 더 적은 데이터로도 더 높은 최종 성능
```

Judge는 [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM_as_a_Judge]]에서 다루는 것과 동일한 기법(pairwise/reference-based grading)을 데이터 생성 파이프라인에 적용한 것이다 — 차이는 judge의 출력이 "제품 품질 평가"가 아니라 "이 샘플을 학습셋에 넣을지 말지"라는 이진 게이트로 쓰인다는 점이다.

## 데이터 위생 (Hygiene)

```
1. Deduplication (중복 제거)
   MinHash/LSH 기반 근사 중복 탐지 — 정확히 같은 문장뿐 아니라
   패러프레이즈 수준의 near-duplicate까지 제거

2. Decontamination (벤치마크 오염 제거)
   학습 데이터에 평가 벤치마크(MMLU, GSM8K 등) 문제가 그대로 섞여 들어가면
   벤치마크 점수가 과장됨 → n-gram overlap 검사로 사전 제거
   (벤치마크 신뢰성 문제는 Benchmarking의 contamination 절 참고)

3. PII/시크릿/독성 위생
   개인정보(주민번호·이메일·전화번호), API 키·비밀번호 패턴, 유해 콘텐츠를
   정규식 + 분류기로 스캔·마스킹·제거
```

## Model Collapse — 합성 데이터의 위험

모델이 자기 자신(또는 이전 세대 모델)이 생성한 데이터로 반복 학습되면, 세대를 거듭할수록 분포의 꼬리(rare하지만 중요한 패턴)가 소실되고 평균으로 수렴하는 **model collapse** 현상이 보고되어 있다. 완화책:

```
- 매 세대마다 원본 인간 데이터를 일정 비율 이상 유지 (완전 합성 데이터로만 학습 금지)
- 생성 다양성을 인위적으로 늘리는 샘플링 전략(temperature, 다중 생성 후 다양성 필터링)
- 세대별 데이터 계보(provenance) 추적 — 어떤 데이터가 몇 세대를 거쳐 재생산됐는지 기록
```

## 라이선스·출처 추적

프론티어 모델의 출력을 다른 모델 학습에 사용하는 것은 벤더 이용약관에 따라 제약이 있을 수 있다(경쟁 모델 학습 목적 사용 금지 조항 등). 합성 데이터 파이프라인은 각 샘플이 어떤 생성 모델·어떤 라이선스 조건에서 나왔는지 메타데이터로 추적해야 한다.

## 경계 정리

| 문서 | 다루는 것 |
|------|-----------|
| **본 문서 (Synthetic_Data_and_Curation)** | **학습 데이터셋 자체를 생성·정제**하는 방법 — Self-Instruct, judge 필터링, dedup, decontamination |
| [[AI/Engineering/Loop_Engineering/Data_Flywheel\|Data_Flywheel]] | **프로덕션 운영 중 발생하는 피드백 데이터**를 다시 학습에 순환시키는 루프 |
| [[AI/Engineering/Model_Engineering/Model_Distillation\|Model_Distillation]] | 데이터가 아니라 **가중치 수준**에서 Teacher→Student 지식을 옮기는 기법 |

## AI Engineering에서의 역할

파인튜닝·RLVR·증류 모두 "좋은 학습 데이터"를 전제로 한다. 모델 아키텍처나 학습 알고리즘을 아무리 정교하게 골라도, 입력 데이터의 품질이 낮으면 그 상한을 넘어설 수 없다("garbage in, garbage out"). 2025~2026년 데이터 큐레이션이 별도 전문 영역으로 분화된 이유가 여기에 있다 — 데이터 생성·필터링 파이프라인 자체가 모델 성능을 좌우하는 독립 변수가 되었기 때문이다.

## 관련 개념
[[AI/Engineering/Loop_Engineering/Data_Flywheel|Data_Flywheel]] · [[AI/Engineering/Model_Engineering/Model_Distillation|Model_Distillation]] · [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM_as_a_Judge]] · [[AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]] · [[AI/Engineering/Loop_Engineering/RL_Environments|RL_Environments]]

## 출처
- Wang et al. (2022) "Self-Instruct: Aligning Language Models with Self-Generated Instructions" — [arXiv:2212.10560](https://arxiv.org/abs/2212.10560)
- Xu et al. (2023) "WizardLM: Empowering Large Language Models to Follow Complex Instructions (Evol-Instruct)" — [arXiv:2304.12244](https://arxiv.org/abs/2304.12244)
- Bai et al. (2022) "Constitutional AI: Harmlessness from AI Feedback" — [arXiv:2212.08073](https://arxiv.org/abs/2212.08073)
- Shumailov et al. (2024) "AI models collapse when trained on recursively generated data" — [Nature](https://www.nature.com/articles/s41586-024-07566-y)
- CuratorKIT (2026) "Data Curation and Synthetic Data Generation for LLM Post-Training" — [arXiv:2606.21631](https://arxiv.org/abs/2606.21631)
