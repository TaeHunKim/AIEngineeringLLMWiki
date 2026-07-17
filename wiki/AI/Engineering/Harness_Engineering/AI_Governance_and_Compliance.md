---
order: 9
---

# AI Governance and Compliance (AI 거버넌스와 규제 대응)

## 개요

[[Alignment_Research]]가 "모델이 실제로 정렬되어 있는가"라는 기술적 질문을 다룬다면, 이 문서는 **조직·산업·국가 수준에서 AI를 안전하게 개발·배포하도록 강제하는 프레임워크와 규제**를 다룬다. 프론티어 연구소의 자율적 안전 서약부터 각국의 법적 규제까지, AI Engineering 실무자가 알아야 할 거버넌스 지형을 정리한다.

## 프론티어 안전 프레임워크 (Frontier Safety Frameworks)

주요 AI 연구소가 자율적으로 채택한, 모델 능력이 특정 위험 임계값(threshold)을 넘으면 추가 안전 조치를 의무화하는 자체 서약이다.

### Anthropic Responsible Scaling Policy (RSP) v3.0

```
AI Safety Level (ASL) 체계:
  ASL-1: 명백히 위험이 낮은 시스템 (예: 체스 엔진)
  ASL-2: 현재 프론티어 모델 수준 — 표준 안전 조치로 충분
  ASL-3: 재앙적 오용 가능성이 유의미해지는 능력 수준
         → 강화된 보안(모델 가중치 유출 방지) + 배포 전 위험 평가 의무화
  ASL-4+: 정의되지 않은 더 높은 위험 수준 — 도달 전 추가 안전조치 사전 정의 필요

핵심 메커니즘: 새 모델 출시 전 위험 평가(Capability Evaluation) 실시
             → 특정 ASL 임계값을 넘으면 해당 레벨의 안전조치 없이는 배포 금지
```

### OpenAI Preparedness Framework와 Google DeepMind FSF

```
OpenAI Preparedness Framework:
  사이버보안·화학생물방사능핵(CBRN)·설득·모델 자율성 4개 영역에서
  능력을 Low/Medium/High/Critical로 채점 → High 이상이면 배포 전 완화조치 의무화

Google DeepMind Frontier Safety Framework (FSF):
  "Critical Capability Level(CCL)"이라는 유사 개념으로 위험 임계값 정의
  자기복제, 사이버공격 자동화 등 구체적 위험 능력 카테고리별 임계값 관리
```

세 프레임워크 모두 공통 철학을 공유한다: **능력이 증가할수록 안전조치도 비례해 강화**하며, 이를 사전에 문서화해 "능력이 갑자기 위험 수준에 도달했는데 대응책이 없는" 상황을 방지한다.

## METR 외부 평가와 독립 감사

프론티어 연구소의 자체 평가만으로는 이해상충(conflict of interest) 우려가 있다. **METR**(→ [[Autonomous_Systems]]에서 Time Horizon 벤치마크로 소개)은 여러 연구소의 모델을 출시 전 독립적으로 평가하는 제3자 기관 역할을 한다.

```
METR의 외부 평가 프로세스:
  모델 출시 전 연구소가 METR에 조기 접근권 제공
    → METR이 자율 복제, 사이버 공격, AI 연구 가속 등 위험 능력을 독립 평가
      → 평가 결과가 모델 카드/시스템 카드에 공개 인용
```

**독립 평가의 가치**: 연구소 자체 평가는 "우리 모델이 안전하다"는 결론에 편향될 유인이 있는 반면, METR 같은 독립 기관은 여러 연구소를 동일 기준으로 비교 평가할 수 있어 더 신뢰할 수 있는 시그널을 제공한다.

## CAIS와 CAISI — 사회적 규모의 리스크

**CAIS (Center for AI Safety)**는 AI로 인한 사회적 규모(societal-scale)의 리스크 — 대량 실업, 권력 집중, 점진적 통제력 상실 등 — 를 연구하는 비영리 기관이다. **CAISI (미국 AI Safety Institute의 후신 성격 기관들)**는 정부 차원에서 프론티어 모델의 국가 안보·공공 안전 영향을 평가하는 기능을 담당한다.

```
CAIS/CAISI가 다루는 리스크 범주:
  - 오용 리스크 (Misuse): 생물무기, 사이버공격 등 악의적 사용
  - 사고 리스크 (Accident): 의도치 않은 시스템 오작동의 광범위한 영향
  - 구조적 리스크 (Structural): 노동시장 붕괴, 권력 집중, 의사결정의 AI 의존 심화
```

## 규제 프레임워크: EU, 미국, 영국, 한국

### EU AI Act

가장 포괄적이고 법적 구속력이 있는 AI 규제. **위험 기반 계층화(risk-based tiering)**가 핵심 구조다.

```
위험 등급:
  Unacceptable Risk (금지):     사회적 점수화(Social Scoring), 실시간 생체 인식 감시 등
  High Risk (고위험, 엄격 규제):  채용·신용평가·의료기기 등에 사용되는 AI
                                → 리스크 관리 시스템, 데이터 거버넌스, 인간 감독 의무화
  Limited Risk (제한적 위험):    챗봇 등 — AI와 상호작용 중임을 고지할 의무
  Minimal Risk (최소 위험):      대부분의 AI 애플리케이션 — 규제 부담 낮음

General-Purpose AI (GPAI) 모델 별도 규제:
  일정 컴퓨팅 임계값을 넘는 파운데이션 모델에 "시스테믹 리스크(systemic risk)" 추가 의무
  (투명성 문서화, 모델 평가, 사고 보고 등)
```

### 미국

연방 차원의 포괄적 AI 법안은 부재하나, 행정명령(Executive Order)과 주(state) 단위 법률(캘리포니아 SB 1047 계열 등)이 프론티어 모델 안전성·투명성을 부분적으로 규율한다. 섹터별 규제(의료의 FDA, 금융의 기존 규제기관)가 AI 애플리케이션에도 확장 적용되는 경우가 많다.

### 영국

법적 구속력이 있는 별도 AI법 대신, 기존 규제기관(ICO, FCA 등)이 각자의 영역에서 AI를 규율하는 **섹터별·원칙 기반(principle-based)** 접근을 취한다. AI Safety Institute(현재는 AI Security Institute로 개편)가 프론티어 모델의 국가 안보 리스크 평가를 담당한다.

### 한국

2024년 제정, 2026년 시행된 **AI 기본법**(인공지능 발전과 신뢰 기반 조성 등에 관한 기본법)이 고영향(high-impact) AI에 대한 안전성 확보 의무, 생성형 AI 표시 의무(AI 생성 콘텐츠임을 고지) 등을 규정한다. EU AI Act의 위험 기반 접근과 유사한 구조를 취하되, 세부 고시·가이드라인은 지속적으로 구체화되는 단계다.

## 모델·시스템·데이터셋 카드

프론티어 모델의 능력·한계·평가 결과를 투명하게 문서화하는 표준 관행. 규제 준수와 사용자 신뢰 확보의 실무적 접점이다.

```
Model Card (모델 카드):
  학습 데이터 개요, 의도된 사용처, 알려진 한계, 벤치마크 성능

System Card (시스템 카드):
  모델 카드보다 넓은 범위 — 배포 시스템 전체(가드레일, 안전 평가, 레드팀 결과 포함)

Dataset Card (데이터셋 카드):
  데이터 출처, 수집 방법, 알려진 편향, 라이선스 정보
```

## 데이터 출처와 학습 데이터 거버넌스

학습 데이터의 **출처(Provenance)**를 추적하고 관리하는 것은 저작권 분쟁 대응, 데이터 오염 방지([[Benchmarking]]), 규제 대응(EU AI Act의 데이터 거버넌스 요구사항)에 모두 필요하다. 데이터 수집 파이프라인 단계에서부터 출처 메타데이터를 유지하는 것이 사후 감사보다 훨씬 저비용이다.

## Dual-Use 리스크와 WMDP

**Dual-Use(이중 용도) 리스크**는 정당한 연구 목적과 악의적 오용 목적이 동일한 지식·능력을 공유하는 문제다 — 예를 들어 병원체 생물학 지식은 백신 개발과 생물무기 제조 모두에 쓰일 수 있다.

```
주요 우려 영역: 사이버(Cyber), 생물(Bio), 화학(Chem), 핵(Nuclear)

WMDP (Weapons of Mass Destruction Proxy) 벤치마크:
  실제 위험 정보를 직접 포함하지 않으면서도 모델의 위험 지식 수준을 측정하도록
  설계된 대리(proxy) 벤치마크
  → 모델이 위험 영역에서 얼마나 "유능한지" 측정하면서도, 벤치마크 자체가
    위험 정보 유출 경로가 되지 않도록 설계된 것이 핵심
```

RSP·Preparedness Framework의 CBRN 리스크 평가가 실무적으로 이 벤치마크 계열을 활용한다.

## 실무자를 위한 체크리스트

```
프로덕션 배포 전 거버넌스 점검:
  □ 배포 대상 관할권의 규제 등급 확인 (EU AI Act 기준 고위험 분류 여부 등)
  □ 모델/시스템 카드 작성 및 공개 여부 결정
  □ 학습·파인튜닝 데이터의 출처·라이선스 문서화
  □ AI 생성 콘텐츠 고지 의무 준수 (한국 AI 기본법, EU AI Act Limited Risk 조항)
  □ 고영향 도메인(의료·금융·채용)이라면 섹터별 기존 규제기관 요구사항 별도 확인
  □ 프론티어 모델을 파인튜닝/배포하는 경우 해당 연구소의 사용 정책(RSP 등) 준수 확인
```

## AI Engineering에서의 역할

AI Governance and Compliance는 기술적 안전 조치([[Guardrail_Engineering]], [[Alignment_Research]])를 조직·법적 책임으로 연결하는 다리다. 프론티어 연구소의 자율 서약(RSP/Preparedness/FSF)이 "능력에 비례한 안전조치"라는 원칙을 확립했다면, EU AI Act 같은 법적 규제는 이를 산업 전반에 강제한다. 실무자에게는 두 계층 모두 실질적 제약이다 — 하나는 사용하는 프론티어 모델의 정책을 통해, 다른 하나는 자사 애플리케이션에 대한 직접 규제를 통해 적용된다.

## 관련 개념
[[Alignment_Research]] · [[Guardrail_Engineering]] · [[Red_Teaming]] · [[Autonomous_Systems]] · [[Benchmarking]] · [[Production_Operations]]

## 출처
- Anthropic "Responsible Scaling Policy" — [anthropic.com](https://www.anthropic.com/rsp)
- OpenAI "Preparedness Framework" — [openai.com](https://openai.com/safety/preparedness/)
- Google DeepMind "Frontier Safety Framework" — [deepmind.google](https://deepmind.google/discover/blog/updating-the-frontier-safety-framework/)
- METR "About" — [metr.org](https://metr.org/about)
- Center for AI Safety "Statement on AI Risk" — [safe.ai](https://safe.ai/work/statement-on-ai-risk)
- European Commission "EU Artificial Intelligence Act" — [artificialintelligenceact.eu](https://artificialintelligenceact.eu)
- 대한민국 과학기술정보통신부 "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법" — [law.go.kr](https://www.law.go.kr)
- Li et al. (2024) "The WMDP Benchmark: Measuring and Reducing Malicious Use With Unlearning" — [arXiv:2403.03218](https://arxiv.org/abs/2403.03218)
- Mitchell et al. (2019) "Model Cards for Model Reporting" — [arXiv:1810.03993](https://arxiv.org/abs/1810.03993)
- AI Engineering from Scratch, Phase 18 · Lessons 17-18, 24-30 (거버넌스, 규제, 카드, Dual-Use) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/18-ethics-safety-alignment)
