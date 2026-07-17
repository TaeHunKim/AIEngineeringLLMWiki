# 22365_13 — Solving Domain-Specific Problems Using LLMs v7

## 메타데이터
- **파일명**: 22365_13_Solving Domain-Specific problems using LLMs_v7.pdf
- **저자**: Christopher Semturs, Shekoofeh Azizi, Scott Coull, Umesh Shankar, Wieland Holfelder (Google)
- **발행 시점**: February 2025
- **주제**: 사이버보안(SecLM)과 의료(MedLM/Med-PaLM)라는 두 도메인 특화 LLM 사례 연구 — [[AI/sources/22365_13_Solving_Domain-Specific_problems_using_LLMs_v7|Domain-Specific LLMs]], [[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]], [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]], [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]
- **출처 (URL)**: https://www.kaggle.com/whitepaper-solving-domains-specific-problems-using-llms

## 요약
범용 LLM은 사이버보안·의료 같은 전문 도메인에서 공개 데이터 부족, 고도의 전문 언어, 민감한 사용 사례라는 세 가지 근본 한계를 갖는다. 이 문서는 Google이 각각 SecLM API(사이버보안)와 Med-PaLM 2/MedLM(의료)을 통해 어떻게 그 한계를 극복했는지를 상세히 서술한다. 핵심 전략은 **3-layer 아키텍처**와 **PET 어댑터**를 결합한 커스터마이즈드 파이프라인이다.

---

## 1. 사이버보안 — SecLM

### 도메인 특화의 필요성: 3T 과제
보안 현장이 직면한 세 가지 도전:
1. **Threats** — 새로운 공격 기법이 매일 등장하며, 위협 인텔리전스가 빠르게 outdated됨
2. **Toil** — 보안 분석가들이 수백 건의 alert triage, 쿼리 작성, 리포트 생성 등 반복 작업에 시간을 빼앗김
3. **Talent** — 전 세계적 보안 전문가 부족으로 신입 analyst가 전문 교육 없이 실전 투입됨

### 범용 LLM의 한계
- **공개 보안 데이터 부족**: 보안 데이터는 민감하므로 대부분 공개되지 않음. 공개된 자료는 소수 제품에 편중
- **심층 보안 언어 결여**: low-level 컴퓨터 사이언스부터 고수준 정책·인텔리전스 분석까지 넘나드는 전문 용어 처리 불가
- **민감 사용 사례 회피**: 범용 모델은 malware 분석, 피싱 탐지 등의 태스크를 abuse 위험 때문에 기피

### SecLM: 3-Layer 아키텍처
```
┌─────────────────────────────────────────────┐
│  Top Layer: 기존 보안 도구 (SIEM, EDR 등)      │  ← 컨텍스트 인식 + 액션 실행
├─────────────────────────────────────────────┤
│  Middle Layer: SecLM API                     │  ← 고급 추론 + 플래닝 + RAG
├─────────────────────────────────────────────┤
│  Bottom Layer: 권위 있는 보안 인텔리전스 DB    │  ← 위협 정보 + 운영 전문성
└─────────────────────────────────────────────┘
```

### SecLM 학습 파이프라인 (Figure 1 기반)
| 단계 | 내용 |
|------|------|
| Pre-training | 광범위한 Foundation Model (수조 토큰의 일반 텍스트·코드·구조화 데이터) |
| Continued Pre-training | 보안 블로그, 위협 인텔리전스 리포트, detection rules, IT 서적 등 오픈소스 + 라이선스 콘텐츠 |
| Supervised Fine-tuning | 악성 스크립트 분석, 커맨드라인 설명, 보안 이벤트 요약, SIEM 쿼리 생성 등 태스크별 SFT |
| PET 어댑터 | 특정 사용자 환경(신규 플랫폼·자산 정보)에 맞는 경량 파라미터 효율적 튜닝 |

**핵심**: proprietary 데이터는 core 모델에 통합하지 않고 PET 어댑터로 분리 — 보안성·일반화 동시 유지.

### 5단계 멀티스텝 추론 예시 (APT41 분석)
1. 위협 인텔리전스 서비스에서 APT41 최신 TTP 정보 검색
2. 방대한 인텔 데이터에서 TTP와 IOC 추출·합성
3. PET fine-tuned 쿼리 변환기가 해당 SIEM 스키마에 맞는 쿼리 생성
4. SIEM에서 매칭 보안 이벤트 직접 조회
5. 모든 정보를 SecLM이 분석가를 위한 종합 응답으로 집약

**결과**: 수 시간 걸리던 작업을 자동화. 일반 LLM 대비 보안 특화 작업에서 **53~79% win rate**.

### 평가 방법론
- **분류 과제** (malware 분류 등): 표준 분류 메트릭
- **유사도 기반**: ROUGE, BLEU, BERTScore를 golden response와 비교
- **자동 SxS(Side-by-side)**: 대형 LLM을 judge로 활용한 선호도 평가
- **인간 전문가 평가**: Likert scale + SxS 선호도 평가

---

## 2. 의료 — Med-PaLM 2 / MedLM

### 의료 AI의 기회
- 환자 의무기록 컨텍스트 기반 질문 응답
- 임상의에게 오는 환자 메시지 triage (긴급도 분류)
- 환자 intake 절차 동적 적응 (고정 문항 → 응답 기반 맞춤형)
- 진료 중 의사-환자 대화 실시간 모니터링 + 피드백
- 낯선 질병에 대한 on-demand curbside consult

### Med-PaLM → Med-PaLM 2 발전
| 버전 | 발표 | 성과 |
|------|------|------|
| Med-PaLM | 2022년 말 preprint, Nature 2023년 7월 | **최초로 USMLE passing mark(67%) 초과** |
| Med-PaLM 2 | 2023년 3월 preprint (arXiv:2305.09617) | **USMLE 86.5%** — 전문의 수준(expert-level), 전 버전 대비 +19% |

Med-PaLM 2는 PaLM 2 기반 instruction fine-tuning으로 MultiMedQA 데이터셋(MedQA, MedMCQA, HealthSearchQA, LiveQA, MedicationQA)을 활용.

### Training 전략 3종
1. **Few-shot prompting**: 입력에 예시 포함하여 특정 태스크 지도
2. **Chain-of-Thought (CoT) prompting**: 단계별 풀이를 few-shot에 포함 → 중간 출력 기반 다단계 추론 가능
3. **Ensemble Refinement (ER)**: 
   - 1단계: temperature sampling으로 다양한 설명·답변 stochastic 생성
   - 2단계: 원래 프롬프트 + 1단계 생성물을 컨디셔닝 → 최종 정제된 답변 생성
   - 효과: self-consistency보다 flexible, 정답이 제한적이지 않은 질문에도 적용 가능

### 임상 평가 프레임워크 (Figure 6)
전문의 평가 루브릭 주요 항목:
- 과학적·임상적 컨센서스와의 일치도
- 잠재적 해악의 범위 및 가능성
- 독해 이해력, 지식 회상, 추론 단계의 정확성
- 부적절 내용 포함 여부 / 중요 내용 누락 여부
- 특정 의료 집단에 부정확한 정보 포함 여부
- 사용자 의도 부응도 및 실용적 도움 정도

**평가 절차**: Med-PaLM과 board-certified 의사가 독립적으로 동일 질문에 응답 → 블라인드 평가자가 양측 비교.

### 태스크 vs. 도메인 특화 구분
Med-PaLM 2는 PaLM 2 기반 대비 **9배의 정밀 추론 향상**을 보였으나, 일반 의료 QA에서 뛰어나도 정신 건강 평가 태스크에서는 별도 검증과 적응이 필요함. 도메인 내에서도 **태스크별 validation**이 필수.

### 임상 환경 통합 3단계
1. **Retrospective evaluation**: 과거 실제 케이스(비식별화) 데이터로 평가
2. **Prospective observational (non-interventional)**: 실시간 데이터 투입, 결과는 의료진이 검토 — 환자 케어에 영향 없음
3. **Prospective interventional**: IRB 승인 프로토콜 하에 실제 임상 환경 배포, 환자 케어 영향 측정

---

## Key Takeaways
- 도메인 특화 LLM은 **3-layer 아키텍처** (tool layer + model API + data store)로 최고의 성능 발휘
- **PET 어댑터**는 민감 데이터를 core 모델 오염 없이 활용하는 핵심 기법
- Med-PaLM 2의 **Ensemble Refinement**는 단순 majority voting을 넘어 self-conditioned answer refinement
- 임상 AI는 benchmark 성능 ≠ 실제 임상 성능임을 당뇨성 망막증 스크리닝 사례로 재확인 — 단계적 검증 필수
- 보안·의료 모두 **"기술 혼자는 충분하지 않다"** — human expertise와의 협업이 성공의 열쇠

## 관련 개념
[[AI/sources/22365_13_Solving_Domain-Specific_problems_using_LLMs_v7|Domain-Specific LLMs]] · [[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]]
