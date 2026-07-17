---
order: 4
---

# Production Operations (프로덕션 운영 인프라)

## 개요

[[Runtime_Optimization]]이 "요청 하나를 얼마나 저렴하고 빠르게 처리할 것인가"를 다룬다면, Production Operations는 **조직 전체의 LLM 트래픽을 어떻게 안전하게 배포·라우팅·관측·과금할 것인가**를 다룬다. 여러 팀, 여러 모델, 여러 벤더가 얽히는 순간 개별 최적화만으로는 부족해지고 게이트웨이·배포 전략·컴플라이언스 같은 조직 차원의 인프라가 필요해진다.

## 관리형 LLM 플랫폼과 추론 플랫폼 경제성

```
관리형 플랫폼 (Managed LLM Platforms):
  AWS Bedrock · Azure OpenAI Service · Google Vertex AI
  → 모델 호스팅·스케일링을 벤더가 담당, 기업 IAM·컴플라이언스와 통합 용이
  → 트레이드오프: 모델 선택 폭이 벤더 카탈로그로 제한, 벤더 락인

추론 특화 플랫폼 (Inference Platform Economics):
  Fireworks · Together AI · Baseten · Modal
  → 오픈 웨이트 모델을 커스텀 서빙 스택(vLLM/SGLang 등)에 얹어 종량제 제공
  → 관리형 플랫폼보다 저렴한 경우가 많으나 SLA·컴플라이언스 인증은 자체 확인 필요
```

선택 기준은 대개 세 축이다: 컴플라이언스 요구사항(금융/의료는 관리형 선호), 모델 커스터마이징 필요성(파인튜닝된 오픈 웨이트는 추론 특화 플랫폼 선호), 총소유비용.

## AI 게이트웨이 (AI Gateways)

여러 LLM Provider·내부 팀·MCP Server를 관통하는 트래픽의 **단일 제어점**. [[Agent_Skills_and_Protocols/MCP]]에서 다룬 MCP Gateway/Registry 생태계와 겹치지만, AI 게이트웨이는 MCP 트래픽뿐 아니라 모든 LLM API 호출을 포괄하는 더 넓은 개념이다.

| 게이트웨이 | 특징 |
|-----------|------|
| **LiteLLM** | 100+ LLM Provider를 OpenAI 호환 API로 통합, 오픈소스, 셀프호스팅 가능 |
| **Portkey** | 관측성·캐싱·폴백(fallback) 정책에 특화, 프롬프트 버전 관리 내장 |
| **Kong** | 범용 API Gateway 위에 AI 플러그인 — 기존 API 인프라와 통합 용이 |
| **Bifrost** | 고성능 Go 기반 AI 게이트웨이, 낮은 오버헤드 지향 |

```
게이트웨이가 중앙에서 담당하는 것:
  - 인증/인가 통합 (여러 팀이 각자 API 키를 관리하지 않도록)
  - Provider 장애 시 자동 폴백 (OpenAI 실패 → Anthropic으로 자동 전환)
  - 속도 제한(rate limiting)과 팀별 쿼터
  - 모든 트래픽의 중앙 로깅·비용 집계
```

## 배포 전략: Shadow, Canary, Progressive Deployment

새 모델·프롬프트·에이전트 버전을 안전하게 프로덕션에 내보내는 전략. [[AgentOps]]에서 다룬 Safe Rollout 4전략(Canary/Blue-Green/A-B/Feature Flags)의 인프라적 기반이다.

```
Shadow Deployment (섀도 배포):
  새 버전이 실제 트래픽을 "복제"로 받아 처리하되, 결과는 사용자에게 노출하지 않음
  → 실 트래픽 조건에서 안전하게 검증 (사용자 영향 0%)

Canary Deployment (카나리 배포):
  트래픽의 1% → 5% → 25% → 100% 순으로 점진 확대
  → 각 단계에서 에러율·품질 지표 확인 후 다음 단계 진행

Progressive Deployment:
  Canary를 지표 기반으로 자동화 — 사전 정의된 임계값을 넘으면 자동 롤백
```

## A/B 테스트: GrowthBook과 Statsig

프롬프트·모델·에이전트 아키텍처 변경이 실제 비즈니스 지표(전환율, 사용자 만족도, 태스크 완료율)에 미치는 영향을 통계적으로 검증한다.

```python
# GrowthBook 스타일 Feature Flag 기반 A/B 테스트 (개념적)
from growthbook import GrowthBook

gb = GrowthBook(api_host="https://cdn.growthbook.io", client_key="...")
variant = gb.get_feature_value("prompt-version", "control")  # "control" 또는 "treatment"

system_prompt = PROMPT_V1 if variant == "control" else PROMPT_V2
# 이후 각 그룹의 태스크 완료율·비용을 비교해 승자 결정
```

**LLM 특화 고려사항**: 전통적 웹 A/B 테스트와 달리 LLM 응답은 비결정적이라 표본 크기가 더 커야 하고, 품질 지표를 LLM-as-a-Judge([[LLM_as_a_Judge]])로 정량화해야 하는 경우가 많다.

## 부하 테스트 (Load Testing)

```
k6:          범용 부하 테스트 도구, LLM API 엔드포인트에 스크립트로 부하 시나리오 정의
LLMPerf:     LLM 서빙 특화 — TTFT, 토큰당 지연시간(ITL), 처리량을 동시에 측정
GenAI-Perf:  NVIDIA의 생성형 AI 특화 벤치마킹 도구, 서빙 엔진 비교에 최적화
```

일반 웹 서비스와 달리 LLM 부하 테스트는 응답 "완료 시간"뿐 아니라 [[Runtime_Optimization]]에서 다룬 TTFT(Time-to-First-Token)·TPOT(Time-per-Output-Token) 같은 스트리밍 특화 지표를 함께 측정해야 실제 사용자 체감 속도를 반영할 수 있다.

## SRE for AI와 카오스 엔지니어링

**멀티 에이전트 인시던트 대응**: [[Multi_Agent_Coordination]]에서 다룬 STRATUS 패턴(Detection/Diagnosis/Validation 3인조 에이전트)이 실제로는 SRE의 사고 대응 프로세스를 에이전트 시스템에 적용한 것이다. 전통적 SRE 관행(온콜, 포스트모템, SLO)에 LLM 고유의 실패 모드(환각, 프롬프트 인젝션, 모델 벤더 장애)를 추가한 형태로 확장된다.

**카오스 엔지니어링**: 프로덕션과 유사한 환경에서 의도적으로 장애를 주입해(모델 API 타임아웃, MCP Server 다운, 컨텍스트 창 초과) 시스템의 복원력을 검증한다. [[Multi_Agent_Coordination]]의 Retry Storm·Circuit Breaker 방어가 실제로 작동하는지 사전에 확인하는 실전 훈련이다.

## 보안 운영: Secrets, PII, 감사 로그

```
Secrets 관리:
  API 키·인증 토큰을 코드/프롬프트에 하드코딩 금지 — Vault, AWS Secrets Manager 등 사용
  MCP Server 인증 정보는 특히 주의 (→ [[Agent_Skills_and_Protocols/MCP]] 보안 위협 참고)

PII 스크러빙:
  로그·트레이스에 사용자 개인정보가 그대로 남지 않도록 자동 마스킹
  → [[Guardrail_Engineering]]의 Output Validation과 같은 기법을 로깅 파이프라인에도 적용

감사 로그 (Audit Logs):
  "누가·언제·어떤 프롬프트로·어떤 도구를 호출했는가"를 불변(immutable) 기록으로 보존
  → [[Agent_Deployment]]의 Agent Identity와 결합하면 에이전트별 책임 추적 가능
```

## 컴플라이언스

SOC 2, HIPAA, GDPR, EU AI Act, ISO 42001 등 규제 프레임워크가 LLM 프로덕션 시스템에 요구하는 기술적 통제(데이터 처리 위치 제한, 로그 보존 기간, 설명가능성 요구사항)를 시스템 설계에 반영해야 한다. 규제 자체의 상세 내용과 조직 거버넌스 관점은 → [[AI_Governance_and_Compliance]]

## FinOps for LLMs

전통 클라우드 FinOps(비용 가시성·최적화·거버넌스)를 LLM 비용 구조에 특화한 것.

```
단위 경제성 (Unit Economics):
  요청당 비용 = (입력 토큰 × 입력단가 + 출력 토큰 × 출력단가) / 요청 수
  → 기능별·고객 세그먼트별로 이 단위 경제성을 추적해야 어떤 기능이 실제로 수익성이 있는지 파악 가능

멀티테넌트 비용 귀속 (Multi-Tenant Attribution):
  공유 인프라(캐시, 배치 처리, 파인튜닝된 모델)를 여러 고객/팀이 사용할 때
  실제 소비량에 비례해 비용을 정확히 배분하는 회계 체계
  → [[Runtime_Optimization]]의 Cost Control Loop를 조직 전체로 확장한 형태
```

## AI Engineering에서의 역할

Production Operations는 개별 최적화 기법([[Runtime_Optimization]])들을 조직 규모에서 안전하고 관측 가능하며 책임 추적 가능한 방식으로 운영하는 계층이다. 하나의 프롬프트 변경이나 모델 업그레이드가 수백만 사용자에게 영향을 미치는 규모에서는, 게이트웨이·점진적 배포·A/B 테스트·카오스 엔지니어링 없이 변경을 내보내는 것 자체가 리스크가 된다.

## 관련 개념
[[Runtime_Optimization]] · [[AgentOps]] · [[Agent_Deployment]] · [[Observability_and_Tracing]] · [[Guardrail_Engineering]] · [[AI_Governance_and_Compliance]]

## 출처
- LiteLLM 공식 문서 — [docs.litellm.ai](https://docs.litellm.ai)
- Portkey 공식 문서 — [portkey.ai/docs](https://portkey.ai/docs)
- GrowthBook 공식 문서 — [docs.growthbook.io](https://docs.growthbook.io)
- Statsig 공식 문서 — [docs.statsig.com](https://docs.statsig.com)
- Grafana k6 문서 — [k6.io/docs](https://k6.io/docs/)
- Ray Project "LLMPerf" — [github.com/ray-project/llmperf](https://github.com/ray-project/llmperf)
- NVIDIA "GenAI-Perf" — [github.com/triton-inference-server/perf_analyzer](https://github.com/triton-inference-server/perf_analyzer)
- FinOps Foundation "FinOps for AI" — [finops.org](https://www.finops.org/)
- AI Engineering from Scratch, Phase 17 전체 (Infrastructure & Production) — [GitHub](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/17-infrastructure-and-production)
