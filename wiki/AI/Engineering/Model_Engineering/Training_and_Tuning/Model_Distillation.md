---
order: 4
---

# Model Distillation (지식 증류)

## 개요

**Knowledge Distillation**은 크고 강력한 **Teacher 모델**의 지식을 작고 효율적인 **Student 모델**에 전달하는 모델 압축 기법이다. 대형 모델의 성능을 유지하면서 배포 비용을 크게 줄일 수 있다.

## 제창

- **원조**: Hinton et al. (2015) "Distilling the Knowledge in a Neural Network" — 이미지 분류 모델 대상
- **LLM 적용**: 2023~2024년 급속히 발전. GPT-4급 모델을 소형 오픈소스 모델로 증류하는 연구 다수

## 핵심 원리

### Soft Label (소프트 레이블)

Teacher의 출력 분포를 사용하여 Student가 "왜 이 답이 맞는지"뿐 아니라 **각 후보 답의 상대적 확률**까지 학습:

```
일반 학습 (Hard Label):
  입력: "고양이는?" → 정답: "동물" (1), 나머지 0

Distillation (Soft Label, T=4 온도):
  입력: "고양이는?" → Teacher 출력:
    "동물": 0.82, "포유류": 0.15, "생물": 0.03
  → Student는 이 분포를 학습 (클래스 간 관계도 학습)
```

**Temperature(T)**: T가 높을수록 분포가 부드러워져 "어두운 지식(dark knowledge)" 전달 강화.

## LLM 증류 방식

### White-box Distillation
Teacher의 내부 표현(레이어별 활성화, 어텐션 패턴)까지 접근 가능할 때:
- **MiniLLM**: 역 KL divergence로 Teacher 분포의 모드 포착 최적화
- **DistilBERT**: BERT를 6레이어로 압축, 97% 성능 유지, 60% 빠름

```python
# 레이어별 지식 증류
loss = CrossEntropy(student_output, labels)
     + α × KL_div(student_logits / T, teacher_logits / T)
     + β × MSE(student_hidden, teacher_hidden)  # 중간 레이어 정렬
```

### Black-box Distillation
Teacher의 출력(텍스트)만 사용. 단, 대부분의 상용 API(OpenAI, Anthropic 등)는 출력으로 경쟁 모델을 학습하는 것을 서비스 약관(ToS)으로 금지하므로, 실무에서는 **오픈웨이트 Teacher**(예: DeepSeek-R1, Qwen, Llama 대형 모델) 또는 자체 보유 Teacher를 사용하는 것이 표준이다:
- **Alpaca / Vicuna (초기 사례)**: GPT-3.5/ChatGPT 대화 데이터를 활용한 초기 연구 계보
- **오픈웨이트 Teacher 증류**: DeepSeek-R1(671B)의 추론 체인을 Qwen/Llama 소형 모델(1.5B~70B)로 증류

### On-Policy Distillation (GKD)
오프라인 SFT 기반 증류는 Teacher가 생성한 고정 데이터셋으로만 학습하므로, 추론 시 Student가 한 번 틀린 토큰을 생성하면 이후 분포가 어긋나는 **노출 편향(exposure bias)** 에 취약하다. **On-Policy Distillation(Generalized Knowledge Distillation, GKD)**(Agarwal et al., ICLR 2024)은 학습 중 **Student가 직접 생성한 시퀀스 위에서 Teacher의 로짓 분포(역 KL 등)로 피드백**을 받아 정렬한다. Gemma 2/3 및 최신 오픈웨이트 소형 모델 학습에서 표준 기법으로 채택됐다.

### Context / Prompt Distillation
매 요청마다 수천 토큰의 긴 시스템 프롬프트·Few-shot 예시·가이드라인을 입력하는 대신, **긴 컨텍스트가 주어진 Teacher의 응답 분포를 컨텍스트가 제거된 Student에 증류**해 프롬프트 비용과 TTFT를 영구적으로 절감한다.

### Chain-of-Thought 증류
Teacher의 추론 과정(CoT)까지 Student에게 전달:
```
Teacher (GPT-4):
  Q: "x² + 5x + 6 = 0 풀기"
  A: "x² + 5x + 6 = (x+2)(x+3) = 0이므로 x = -2 또는 x = -3"

Student (소형 모델):
  이 CoT 전체를 학습 → 수학 추론 능력 전수
```

## 증류 전략 비교

| 전략 | 접근 가능 | 효과 | 비용 |
|------|---------|------|------|
| **Logit Distillation** | Teacher 로짓 | 중간 | Teacher 추론 비용 |
| **Feature Distillation** | Teacher 내부 표현 | 높음 | White-box만 가능 |
| **Data Augmentation** | Teacher 텍스트 출력 | 낮음~중간 | API 호출 비용 |
| **CoT Distillation** | Teacher 추론 체인 | 높음 (추론 태스크) | API 비용 + 긴 시퀀스 |

## 실제 성공 사례

- **DistilBERT** (2019): BERT 66M → 40M, 97% NLP 성능, 60% 빠름
- **Alpaca** (2023): GPT-3.5 출력 → LLaMA-7B 학습, 지시 따르기 능력 급상승
- **Phi 시리즈** (Microsoft): 소형 고품질 합성 데이터로 3.8B 모델이 13B 수준 성능
- **DeepSeek-R1** (2025): 대형 추론 모델의 CoT를 소형 모델로 증류

## 증류 vs 양자화 vs PEFT

| | 증류 | 양자화 | PEFT |
|--|------|-------|------|
| **목적** | 작은 모델 생성 | 기존 모델 압축 | 기존 모델 특화 |
| **결과물** | 새 모델 | 동일 구조 모델 | 어댑터 |
| **성능 손실** | 있음 (5~15%) | 미미 (1~5%) | 거의 없음 |
| **배포 형태** | 독립 모델 | 압축 모델 | Base + Adapter |

## AI Engineering에서의 역할

증류는 "API 비용을 줄이고 싶지만 성능은 유지하고 싶다"는 니즈를 충족시킨다. GPT-4 수준 성능의 작은 모델을 자체 인프라에서 서빙하거나, 엣지 디바이스(모바일, IoT)에 LLM 능력을 탑재하는 데 핵심 기술이다.

## 관련 개념
[[AI/Engineering/Model_Engineering/Training_and_Tuning/Full_Fine-Tuning|Full_Fine-Tuning]] · [[AI/Engineering/Model_Engineering/Training_and_Tuning/PEFT_LoRA_QLoRA|PEFT_LoRA_QLoRA]] · [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Quantization|Quantization]]

## 출처
- Hinton et al. (2015) "Distilling the Knowledge in a Neural Network" — [arXiv:1503.02531](https://arxiv.org/abs/1503.02531)
- Sanh et al. (2019) "DistilBERT" — [arXiv:1910.01108](https://arxiv.org/abs/1910.01108)
- Agarwal et al. (ICLR 2024) "On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes (GKD)" — [arXiv:2306.13649](https://arxiv.org/abs/2306.13649)
- MIT TACL Survey (2024) "A Survey on Model Compression for Large Language Models" — [MIT Press](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00704/125482/A-Survey-on-Model-Compression-for-Large-Language)
