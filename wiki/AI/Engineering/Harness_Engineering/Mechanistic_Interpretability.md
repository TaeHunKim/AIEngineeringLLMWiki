---
order: 9
---

# Mechanistic Interpretability (기계적 해석가능성)

## 개요

**Mechanistic Interpretability**는 모델의 입출력 행동만 관찰하는 것이 아니라, 모델 내부의 **연산 메커니즘(회로·특징)을 직접 리버스 엔지니어링**해 "모델이 왜 이런 답을 냈는가"를 설명하려는 연구 분야다. [[AI/Engineering/Harness_Engineering/Alignment_Research|Alignment_Research]]가 모델의 행동을 관찰·테스트해 오정렬 가능성을 추론한다면, Mechanistic Interpretability는 그 행동을 만들어내는 내부 계산 자체를 열어본다.

## 배경: Polysemanticity와 Superposition 문제

신경망을 뉴런 단위로 직접 해석하려는 초기 시도는 근본적인 장애물에 부딪혔다.

```
Polysemanticity (다의성):
  개별 뉴런 하나가 서로 무관한 여러 개념을 동시에 인코딩
  예: 뉴런 #4821이 "고양이", "자동차 부품", "프랑스어 문법"에 모두 반응

Superposition (중첩):
  모델의 차원 수보다 훨씬 많은 수의 개념을 압축해 표현하기 위해
  여러 개념이 뉴런 공간에 중첩되어 저장됨

결과: 뉴런 하나하나를 봐서는 "이 뉴런이 무엇을 담당하는가"를 알 수 없음
     → 더 근본적인 분석 단위가 필요
```

## Sparse Autoencoders (SAE)

이 문제를 해결하기 위해 활성화(activation)를 더 **단의미적(monosemantic)**인 단위로 분해하는 기법.

- **Anthropic "Towards Monosemanticity" (2023)**: 작은 모델의 활성화를 SAE로 분해해, 개별 뉴런보다 훨씬 해석하기 쉬운 "특징(feature)" — 예를 들어 "아랍어 텍스트", "DNA 서열", "법률 용어" 등 명확히 하나의 개념에 대응하는 방향(direction) — 을 다수 추출할 수 있음을 보임
- **Anthropic "Scaling Monosemanticity" (2024)**: 이 기법을 실제 프로덕션 모델(Claude 3 Sonnet)까지 확장, 수백만 개의 해석 가능한 특징을 추출 — "Golden Gate Bridge" 특징을 인위적으로 활성화시켜 모델이 자신을 금문교라고 주장하게 만든 시연("Golden Gate Claude")으로 널리 알려짐

```
작동 원리 (간략):
  모델 활성화(dense, 저차원) → SAE 인코더 → sparse, 고차원 특징 벡터
                                          (대부분 0, 소수만 활성화)
  → 각 활성화된 특징이 사람이 이해 가능한 단일 개념에 대응하도록 학습
```

## Circuit Tracing (Anthropic, 2025년 3월)

SAE로 개별 특징을 찾는 것을 넘어, 특징들이 레이어를 가로질러 서로 어떻게 연결되어 최종 출력을 만드는지 — 즉 **회로(circuit)** — 를 추적하는 방법론.

- **핵심 기법**: 모델의 MLP를 **Cross-Layer Transcoder(CLT)**라는 새로운 형태의 SAE로 대체해, 원본 모델과 유사하게 동작하면서도 내부가 sparse하고 해석 가능한 특징으로 구성된 "대체 모델(replacement model)"을 구성
- **결과물**: 입력에서 출력까지 정보가 어떤 특징들을 거쳐 흐르는지 시각화한 attribution graph — 예를 들어 모델이 "댈러스가 속한 주(state)의 수도는?"에 답할 때 "댈러스 → 텍사스" 특징을 거쳐 "텍사스 → 오스틴" 특징으로 이어지는 다단계 추론 회로를 실제로 관찰
- **오픈소스화 (2025년 5월)**: 연구자들이 직접 attribution graph를 탐색할 수 있는 인터랙티브 시각화 도구 공개
- **"On the Biology of a Large Language Model" (2025)**: Circuit Tracing을 활용해 계획(planning), 다단계 추론, 심지어 모델이 사실을 "지어내는" 환각의 내부 메커니즘까지 여러 사례 연구로 분석

## 분야로서의 인정

```
"Open Problems in Mechanistic Interpretability" (2025년 1월):
  18개 기관 29명의 연구자가 공동 저술 — 분야의 목표와 미해결 문제를 정리한 서베이
  → 개별 실험실 단위 연구를 넘어 하나의 독립된 학문 분야로 성숙했음을 보여주는 신호

MIT Technology Review "2026 Breakthrough Technologies":
  Mechanistic Interpretability를 올해의 주요 혁신 기술 중 하나로 선정
```

## AI Engineering과의 실무적 연결

- **Activation Steering**: 특정 특징(예: 특정 주제, 톤, 안전 관련 개념)에 대응하는 방향을 찾아 활성화에 직접 더하거나 빼는 방식으로, 파인튜닝 없이 모델 행동을 실시간 조향 — [[AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail_Engineering]]의 런타임 필터와는 다른 축의 개입 지점(출력을 사후 검열하는 대신 생성 과정 자체를 조정)
- **환각·기만 탐지**: 모델이 "모른다"는 사실을 내부적으로는 알고 있으면서도 그럴듯한 답을 지어내는 경우, 내부 특징 수준에서 이 불일치를 포착할 가능성 — 순수 출력 기반 평가([[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM_as_a_Judge]])로는 원천적으로 놓치는 신호
- **정렬 검증의 근본적 한계에 대한 보완책**: [[AI/Engineering/Harness_Engineering/Alignment_Research|Alignment_Research]]가 다루는 Sleeper Agents·Alignment Faking처럼 "평가 중에는 정상적으로 행동하고 실제 배포에서만 다르게 행동"하는 기만적 모델은 행동 관찰만으로는 근본적으로 탐지하기 어렵다. 내부 메커니즘을 직접 들여다보는 것은 이런 종류의 기만을 포착할 수 있는 몇 안 되는 잠재적 수단으로 여겨진다

## AI Engineering에서의 역할

Mechanistic Interpretability는 아직 프로덕션 파이프라인에 일상적으로 통합되는 도구라기보다는 **모델을 신뢰할 수 있는 근본적 방법을 찾는 기초 연구**에 가깝다. 하지만 Circuit Tracing 도구의 오픈소스화와 Activation Steering 같은 실용적 응용이 늘어나면서, 가드레일·평가처럼 행동을 관찰하는 계층만으로는 잡을 수 없는 오정렬을 보완하는 심층 방어의 한 축으로 자리잡고 있다.

## 관련 개념
[[AI/Engineering/Harness_Engineering/Alignment_Research|Alignment_Research]] · [[AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail_Engineering]] · [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM_as_a_Judge]]

## 출처
- Anthropic (2023) "Towards Monosemanticity: Decomposing Language Models With Dictionary Learning" — [transformer-circuits.pub](https://transformer-circuits.pub/2023/monosemantic-features)
- Anthropic (2024) "Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet" — [transformer-circuits.pub](https://transformer-circuits.pub/2024/scaling-monosemanticity/)
- Anthropic (2025-03) "Circuit Tracing: Revealing Computational Graphs in Language Models" — [transformer-circuits.pub](https://transformer-circuits.pub/2025/attribution-graphs/methods.html)
- Anthropic (2025) "On the Biology of a Large Language Model" — [transformer-circuits.pub](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)
- "Open Problems in Mechanistic Interpretability" (2025) — [arXiv:2501.16496](https://arxiv.org/abs/2501.16496)
- MIT Technology Review "10 Breakthrough Technologies 2026" — [technologyreview.com](https://www.technologyreview.com/)
