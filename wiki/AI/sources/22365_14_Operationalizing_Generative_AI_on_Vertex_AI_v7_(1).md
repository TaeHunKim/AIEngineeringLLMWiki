# 22365_14 — Operationalizing Generative AI on Vertex AI using MLOps v7

## 메타데이터
- **파일명**: 22365_14_Operationalizing Generative AI on Vertex AI_v7 (1).pdf
- **저자**: Anant Nawalgaria, Gabriela Hernandez Larios, Elia Secchi, Mike Styer, Christos Aniftos, Onofrio Petragallo, Sokratis Kartakis (Google)
- **발행 시점**: February 2025
- **주제**: Vertex AI 플랫폼으로 생성형 AI를 MLOps 관점에서 운영화하는 방법론 — [[Vertex_AI]], [[LLMOps]], [[MLOps]], [[Evaluation]], [[Agents]], [[RAG]]
- **출처 (URL)**: https://www.kaggle.com/whitepaper-operationalizing-generative-ai-on-vertex-ai-using-mlops

## 요약
Foundation Model과 생성형 AI의 등장은 ML 시스템 개발에 새로운 패러다임을 가져왔다. 이 문서는 전통적인 MLOps 원칙이 gen AI에서 어떻게 변형·확장되는지를 체계적으로 설명하고, Google Cloud의 Vertex AI가 이 lifecycle 전체를 어떻게 지원하는지를 8개 기능군으로 정리한다. Discover → Develop → Deploy → Monitor → Govern의 5단계 lifecycle을 중심으로 "prompted model component"라는 gen AI 고유의 핵심 단위 개념을 도입한다.

---

## 1. MLOps vs. LLMOps 핵심 차이

| 항목 | Predictive AI (MLOps) | Generative AI (LLMOps) |
|------|----------------------|----------------------|
| 개발 단위 | 모델 단독 | **Prompted model component** (모델 + 프롬프트) |
| 입력 변화 민감도 | 낮음 | **매우 높음** — 입력 변경만으로 태스크 전환 |
| 실험 반복 | 모델 독립 변경 | 프롬프트·모델·체인 **통합 실험** 필요 |
| 데이터 | 잘 정의된 단일 데이터셋 | 프롬프트/few-shot/RAG 데이터/인간 피드백 등 이종 혼합 |
| 평가 | 단일 metric | 복합·주관적·LLM-as-judge 필요 |
| 버전 관리 | 모델 가중치 | 프롬프트 템플릿 + 체인 정의 + adapter + 외부 데이터 전체 |
| 지속 개선 | 데이터 재학습 | **Foundation Model 교체 + 프롬프트 튜닝** |

### Prompted Model Component
gen AI의 최소 독립 단위. Foundation Model 단독으로는 충분하지 않고, "영어에서 프랑스어로 번역하세요"와 같은 프롬프트 없이는 원하는 태스크를 수행할 수 없다. 이 조합이 gen AI 실험과 평가의 기본 단위가 된다.

---

## 2. Gen AI 시스템 Lifecycle 5단계

### Discover
- 모델 수가 폭발적으로 증가 (오픈소스 + 독점 Foundation Model)
- 선택 기준: Quality (벤치마크/테스트 프롬프트), Latency & Throughput, 개발·유지 시간, 비용, 컴플라이언스
- **Vertex Model Garden**: 150+ 모델 탐색 허브 (Google 독점 + 오픈 웨이트 포함)

### Develop & Experiment
**Prompt Engineering** 2단계:
1. 원하는 행동을 유도하는 프롬프트 작성·정제
2. 출력을 평가하여 다음 반복 지침 생성

**체인(Chain) & 증강(Augmentation)**:
- 단일 prompted model로 해결 불가한 복잡 태스크 → 여러 모델·API·코드 로직 연결
- 주요 패턴: **RAG** (외부 데이터베이스로 환각 감소 + 최신 정보 반영), **Agents** (ReAct 기법, 도구 동적 선택)
- 체인은 격리 평가가 어려워 **end-to-end 평가** 필수

**Prompt의 이중 성격**:
- 프롬프트 as Data: few-shot 예시, 지식 베이스, 사용자 쿼리 → 데이터 검증·drift 탐지
- 프롬프트 as Code: 컨텍스트, 프롬프트 템플릿, guardrail → 버전 관리·승인 프로세스

### Tuning & Training
- **Supervised Fine-tuning**: 입력→출력 매핑 supervised 학습
- **RLHF (Reinforcement Learning from Human Feedback)**: 인간 선호도 기반 reward model로 LLM 유도
- 비용 절감 기법: **Quantization** (32-bit float → 8-bit integer), **Pruning** (불필요 가중치 제거), **Distillation** (큰 teacher model → 작은 student model)
- GPU (병렬 처리) vs. TPU (행렬 연산 특화) — Google Cloud TPU

### Deploy
**버전 관리 대상**:
- 프롬프트 템플릿 (Git)
- 체인 정의 코드 (Git)
- 외부 데이터셋 (BigQuery, AlloyDB)
- Adapter 모델 (Cloud Storage)

**CI/CD for Gen AI**:
- 과제: 오픈엔드 출력으로 포괄적 테스트 케이스 정의 어려움 + 내재적 무작위성으로 재현성 도전
- 해결: gen AI 평가 기법을 CI 시스템에 동일 적용 (LLM-as-judge, AutoSxS 등)

**Foundation Model 배포 최적화**:
- Infrastructure Validation: 모델과 serving 구성 호환성 사전 검증 (TFX 활용)
- Quantization, Distillation, Pruning으로 compute/storage 절감

### Logging & Monitoring
- **드리프트·스큐 감지**: 프롬프트 alignment 모니터링, 멀티모달 출력 prompt-output 일치도 평가
- **LLM-as-a-Judge (AutoRater)**: 조직 정책의 주관적 기준을 점수화
- **Continuous Evaluation**: 프로덕션 출력 캡처 → 평가 파이프라인 실행 → 성능 추적
- **OpenTelemetry 기반 Tracing**: 에이전트 내부 단계 추적, 대형 페이로드 지원 spec 진화 중
- **알림 시스템**: drift·성능 저하 감지 시 즉각 개입

### Govern
- Chain element 전체의 lineage 추적: 사용된 데이터·모델·코드·평가 데이터·메트릭
- gen AI에서 lineage = 모델 아티팩트를 넘어 **체인 전체 컴포넌트** 포함
- 도구: Dataplex (데이터 거버넌스), Vertex ML Metadata, Vertex Experiments, Vertex Model Registry

---

## 3. Agent MLOps

### Agent 핵심 3요소
- **Foundation Model**: 인지 엔진 (추론 + 언어 처리)
- **Instructions**: 목표 지시사항 (단순 태스크~복잡 멀티스텝 목표)
- **Tool**: 실행 가능한 함수 설명 + 파라미터 (모델이 선택 결정, 실제 실행은 별도 코드)

### Tool 유형 비교 (Table 2)
| 특성 | Code Functions | Private REST APIs | Public REST APIs |
|------|---------------|-------------------|-----------------|
| Latency | 매우 낮음 | 보통 | 잠재적으로 높음 |
| 보안 | Agent 환경 | VPC 내 강함 | 세심한 고려 필요 |
| 소유권 | 완전 | VPC 내 완전 | 없음 |
| 내부 시스템 접근 | 직접 | 네트워크 경유 | 일반적으로 불가 |

### Tool Registry
- **Tool Registry** = 모든 도구의 중앙 카탈로그 (Model Registry의 에이전트 버전)
- 핵심 기능: 재사용성, 가시성, 접근 제어, 표준화, 버전 관리, 감사 추적
- Tool Selection 전략: Generalist (전체 카탈로그) / Specialist (사전 정의된 서브셋) / Dynamic (런타임 쿼리)

### Agent Observability
- Short-term memory: 개발자 코드가 conversation history 업데이트 (컨텍스트 반영)
- **OpenTelemetry** trace ID로 멀티에이전트 시스템 전체 디버깅 및 감사 추적

---

## 4. Vertex AI 8개 기능군

| 기능군 | 주요 서비스 | 역할 |
|--------|------------|------|
| **Discover** | Vertex Model Garden (150+ 모델) | Foundation Model 탐색·비교 |
| **Prototype** | Vertex AI Studio, Notebooks | UI 기반 프롬프트 테스트·실험 |
| **Customize** | Vertex AI Training & Tuning | Supervised FT, RLHF, Distillation, PEFT |
| **Chain & Augment** | Grounding, Extensions, Vector Search, Agent Builder | RAG 파이프라인·에이전트 구성 |
| **Evaluate** | Vertex AI Experiments, TensorBoard, Eval Pipelines | 실험 추적, AutoSxS, LLM-as-judge |
| **Predict** | Vertex AI Endpoints & Monitoring | 모델 서빙·프로덕션 모니터링 |
| **Govern** | Feature Store, Model Registry, Dataplex | 데이터·모델·코드 거버넌스 통합 |
| **Orchestrate** | Vertex AI Pipelines | 파이프라인 자동화·재현성 |

---

## Key Takeaways
- gen AI의 핵심 단위는 모델이 아닌 **"Prompted Model Component"** — 프롬프트 버전 관리가 MLOps만큼 중요
- 체인은 컴포넌트별 격리 평가가 어려워 **end-to-end 평가**를 기본값으로 삼아야 함
- **Prompt as Data + Prompt as Code**의 이중 성격을 인식하고 각각에 맞는 거버넌스 적용
- Tool Registry는 에이전트 생태계의 Model Registry — 규모가 커질수록 중앙화 필수
- Vertex AI는 8개 기능군으로 Discovery → Governance 전체 lifecycle을 단일 플랫폼에서 지원

## 관련 개념
[[Vertex_AI]] · [[LLMOps]] · [[MLOps]] · [[Agents]] · [[RAG]] · [[Fine-Tuning]] · [[Evaluation]] · [[Foundational_Models]] · [[Production]]
