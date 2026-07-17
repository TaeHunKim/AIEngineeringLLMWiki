# Prototype to Production

## 메타데이터
- **파일명**: Prototype to Production.pdf
- **저자**: Sokratis Kartakis, Gabriela Hernandez Larios, Ran Li, Elia Secchi, Huang Xia (Google)
- **발행 시점**: 2025년 11월 최초 발행 → **2026년 5월 업데이트**
- **주제**: AI Agent를 프로토타입에서 프로덕션으로 전환하는 AgentOps 방법론 — [[AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]], [[AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]], [[AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]], [[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]], [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]
- **출처 (URL)**: https://www.kaggle.com/whitepaper-prototype-to-production

## 요약
"에이전트를 만드는 건 쉽다. 신뢰하는 건 어렵다." 이 문서는 agent prototype을 프로덕션 시스템으로 전환할 때 80%의 노력이 핵심 지능이 아닌 인프라·보안·검증에 쓰인다는 "last mile" 문제를 다룬다. 해결책은 **3 Pillars (자동화된 평가 + CI/CD + 종합적 Observability)**를 기반으로 한 **AgentOps** discipline이며, 최종적으로 A2A 프로토콜을 통한 멀티에이전트 생태계 구축으로 이어진다.

---

## 1. Last Mile 프로덕션 갭

프로토타입 배포 없이 발생하는 실제 비즈니스 장애 사례:
- Guardrail 미설정 → 고객 서비스 에이전트가 제품 무료 제공
- 인증 오설정 → 기밀 내부 DB 접근 가능
- 모니터링 부재 → 주말 동안 대규모 비용 청구 발생
- 지속적 평가 없음 → 전날 완벽히 작동하던 에이전트가 갑자기 중단

**에이전트 고유 운영 과제**:
- **Dynamic Tool Orchestration**: 매번 다른 도구 선택 경로 → robust versioning·접근 제어·observability 필요
- **Scalable State Management**: 세션 간 메모리 유지 → 안전하고 일관된 외부 상태 관리
- **Unpredictable Cost & Latency**: 다양한 경로 → smart budgeting·caching 없으면 비용 통제 불가

---

## 2. 사람과 프로세스 — People & Process

**전통 MLOps 팀**:
- Cloud Platform Team (아키텍처·보안·접근 제어)
- Data Engineering Team (파이프라인·데이터 품질)
- Data Science & MLOps Team (모델 실험·자동화 파이프라인)
- ML Governance (컴플라이언스·투명성·책임)

**Gen AI 추가 역할**:
- **Prompt Engineers**: 도메인 전문성 + 프롬프트 기술의 혼합 — 정확한 질문과 기대 답변 정의
- **AI Engineers**: 평가 at scale, guardrail, RAG/tool 통합 포함 robust 백엔드 구축
- **DevOps/App Developers**: Gen AI 백엔드와 통합된 프론트엔드·사용자 인터페이스

---

## 3. Pre-Production: Evaluation-Gated Deployment

### 평가를 Quality Gate로
전통 소프트웨어 단위 테스트로는 불충분 — 에이전트는 최종 답변뿐만 아니라 **전체 reasoning trajectory**를 평가해야 함. 100개 tool unit test를 통과해도 잘못된 도구 선택이나 환각이 발생 가능.

**두 가지 구현 방식**:
1. **Manual "Pre-PR" Evaluation**: AI Engineer/Prompt Engineer가 PR 전 로컬 평가 실행 → 성능 리포트를 PR description에 첨부 → 코드 + 에이전트 행동 변화 모두 review
2. **Automated In-Pipeline Gate**: 평가 harness를 CI/CD에 직접 통합 → 메트릭 미달 시 자동 배포 차단 (golden dataset 대비 "tool call success rate", "helpfulness" 등)

### 3-Phase CI/CD 파이프라인 (Funnel 구조)

```
Phase 1: Pre-Merge CI
  ├── Unit test, linting, dependency scan
  └── 에이전트 품질 평가 suite → main branch 오염 방지

Phase 2: Post-Merge CD (Staging)
  ├── Load test, integration test
  └── 내부 dogfooding (실제 사용자 체험)

Phase 3: Gated Production Deployment
  ├── Product Owner 최종 승인 (human-in-the-loop)
  └── Staging에서 검증된 동일 artifact 프로덕션 승격
```

**인프라 자동화**:
- **IaC (Terraform)**: 환경 코드화 → 동일하고 재현 가능한 환경
- **Automated Testing Frameworks (Pytest)**: 대화 히스토리, tool invocation 로그, 동적 reasoning trace 처리
- **Secrets Manager**: API 키 런타임 주입 (코드베이스 하드코딩 금지)

### Safe Rollout 4가지 전략
| 전략 | 방법 | 장점 |
|------|------|------|
| **Canary** | 1% 사용자부터 시작, 점진적 확대 | 즉각 롤백 가능 |
| **Blue-Green** | 두 동일 프로덕션 환경, 트래픽 전환 | 제로 다운타임 |
| **A/B Testing** | 실제 비즈니스 메트릭 기반 버전 비교 | 데이터 기반 의사결정 |
| **Feature Flags** | 코드 배포 후 릴리즈 동적 제어 | 선택적 사용자 테스트 |

**모든 전략의 전제**: 코드·프롬프트·모델 엔드포인트·tool schema·메모리 구조·평가 데이터셋 전체의 **rigorous versioning** → 이슈 발생 시 즉각 rollback ("production undo 버튼").

### 보안 3-Layer 프레임워크
에이전트 고유 보안 위험:
- **Prompt Injection & Rogue Actions**: 악의적 사용자의 제한 우회
- **Data Leakage**: 응답이나 tool 사용으로 민감 정보 노출
- **Memory Poisoning**: 잘못된 메모리 정보가 모든 미래 상호작용 오염

**방어 3계층**:
1. **Policy Definition & System Instructions (에이전트의 헌법)**: 원하는/원하지 않는 행동 정책 정의 → System Instructions로 엔지니어링
2. **Guardrails, Safeguards, Filtering (강제 집행 계층)**:
   - Input Filtering: 분류기 + Perspective API로 악의적 입력 차단
   - Output Filtering: Vertex AI 내장 safety filter로 PII·독성·정책 위반 검사
   - Human-in-the-Loop (HITL): 고위험·모호한 행동에 대한 인간 검토·승인
3. **Continuous Assurance & Testing**: RAI 테스트 (NPOV, Parity evaluations), Proactive Red Teaming

---

## 4. Operations In-Production: Observe → Act → Evolve

### Observe: 에이전트의 감각 시스템
3가지 관찰 지주:
- **Logs**: 모든 tool 호출·오류·결정의 세부 기록 (what happened)
- **Traces**: 인과 경로 연결 (why an agent took a certain action)
- **Metrics**: 성능·비용·운영 건강 집약 리포트 카드 (how well the system performs)

Google Cloud 구현: Cloud Trace (고유 ID로 모든 단계 연결) + Cloud Logging + Cloud Monitoring + ADK 내장 Cloud Trace 통합

### Act: 운영 제어 레버

**시스템 건강 관리 (성능·비용·확장)**:
- **Horizontal Scaling**: stateless 컨테이너화 에이전트 + 외부 상태 → Cloud Run·Agent Engine 자동 확장
- **Async Processing**: 장시간 태스크를 Pub/Sub 이벤트로 오프로드
- **Externalized State**: Vertex AI Agent Engine (내장 session·memory) 또는 AlloyDB/Cloud SQL
- **속도-안정성-비용 균형**: 병렬 처리 + 캐싱 / exponential backoff retry + idempotent tool 설계 / 짧은 프롬프트 + 배칭

**보안 대응 Playbook** (위협 감지 시):
1. **Contain**: circuit breaker (feature flag)로 영향 받은 tool 즉시 비활성화
2. **Triage**: 의심 요청을 HITL 검토 큐로 라우팅
3. **Resolve**: 패치(업데이트된 input filter·system prompt) → CI/CD 파이프라인 통해 배포

### Evolve: 프로덕션에서 배우기
**Evolution Workflow**:
1. 프로덕션 로그에서 사용자 행동·성공률·보안 사건 패턴 분석
2. 프로덕션 실패 케이스 → 평가 데이터셋(golden dataset) 추가
3. 프롬프트 개선·tool 추가·guardrail 업데이트 → CI/CD 파이프라인 커밋

**실제 사례**: 소매 에이전트 로그에서 15% 사용자가 "similar products" 요청 시 오류 발생 → 신규 실패 테스트 케이스 추가 → 프롬프트 개선 + robust tool 추가 → canary 배포 → **48시간 내 해결**.

**보안 피드백 루프**: Observe(새 prompt injection 발견) → Act(containment) → Evolve(평가 데이터셋에 추가 + guardrail 개선 + CI/CD 배포) = 프로덕션 사건마다 에이전트가 강해지는 선순환

---

## 5. A2A — 에이전트 간 상호운용성

### MCP vs. A2A 역할 구분
| | MCP | A2A |
|--|-----|-----|
| **대상** | 도구와 리소스 | 다른 에이전트 |
| **상호작용** | stateless 함수 (날씨 조회, DB 쿼리) | stateful 복잡 목표 달성 |
| **메시지** | "이것을 하라" | "이 복잡한 목표를 달성하라" |
| **거버넌스** | Anthropic (오픈 표준) | ~~Google~~ → **Linux Foundation** (오픈 표준) *(2026년 5월 변경)* |

### A2A 프로토콜 구현

**Agent Cards** — 에이전트의 명함 (JSON 표준 명세):
```json
{
  "name": "check_prime_agent",
  "version": "1.0.0",
  "description": "소수 여부 판별 에이전트",
  "capabilities": {},
  "securitySchemes": {"agent_oauth_2_0": {"type": "oauth2"}},
  "skills": [{"id": "prime_checking", "tags": ["mathematical"]}],
  "url": "http://localhost:8001/a2a/check_prime_agent"
}
```

**ADK로 A2A 노출**:
```python
from google.adk.a2a.utils.agent_to_a2a import to_a2a
# 기존 에이전트를 A2A 호환으로 변환
a2a_app = to_a2a(root_agent, port=8001)
```

**계층적 에이전트 구성** (A2A + 로컬 sub-agent 혼합):
```python
# 로컬 서브에이전트 (주사위 굴리기)
roll_agent = Agent(name="roll_agent", ...)
# 원격 A2A 에이전트 (소수 확인)
prime_agent = RemoteA2aAgent(
    name="prime_agent",
    agent_card="http://localhost:8001/.well-known/agent-card.json"
)
# 루트 오케스트레이터
root_agent = Agent(sub_agents=[roll_agent, prime_agent])
```

**자동차 수리점 비유 (A2A + MCP 협업)**:
1. 고객(User) → Shop Manager(A2A): "차에서 덜컹거리는 소리가 남"
2. Shop Manager → Mechanic(A2A): 진단 태스크 위임
3. Mechanic → 진단 도구(MCP): `scan_vehicle_for_error_codes()`, `get_repair_procedure()`, `raise_platform()` 호출
4. Mechanic → Parts Supplier(A2A): 부품 가용성 조회 및 주문

### Registry 아키텍처
- **Tool Registry**: 50개 도구는 수동 설정 가능 → 5,000개는 중앙 카탈로그 필요
  - 패턴: Generalist (전체 카탈로그) / Specialist (사전 정의된 서브셋) / Dynamic (런타임 쿼리)
- **Agent Registry**: Agent Cards 형식, 팀 간 에이전트 발견·재사용. *(2026년 5월 추가)* Gemini Enterprise Agent Platform이 **native Agent Registry**를 제공: 모든 에이전트·도구·MCP 서버를 조직 전반에서 추적·관리하는 중앙 카탈로그. **Agent Identity**(에이전트별 고유 암호화 ID)와 연동해 즉시 사용 가능한 거버넌스·접근 제어 지원.
- **원칙**: 필요할 때만 구축 (규모가 bottleneck이 될 때). Tool Registry는 tool discovery가 병목 또는 보안 중앙 감사가 필요할 때, Agent Registry는 팀 간 특화 에이전트 발견·재사용이 필요할 때.

---

## 6. AgentOps Lifecycle 전체 그림

```
개발자 Inner Loop (로컬 테스트·프로토타이핑)
       ↓
Pre-Production Engine (평가 게이트 → CI/CD 자동 검증)
       ↓
Safe Rollout (Canary/Blue-Green/A-B/Feature Flags)
       ↓
Production (Observability 기반 운영)
       ↓
Evolution Loop (프로덕션 인사이트 → 다음 개선 사이클)
```

---

## Key Takeaways
- **80% rule**: 프로덕션 전환 비용의 80%는 에이전트의 핵심 지능이 아닌 인프라·보안·검증
- **Evaluation-Gated Deployment**: 어떤 에이전트 버전도 포괄적 평가 통과 없이 프로덕션 도달 불가
- **Observe → Act → Evolve**: 정적 모니터링을 넘어 프로덕션 사건을 에이전트 강화의 연료로 전환
- **A2A + MCP 계층**: MCP는 도구 통합, A2A는 에이전트 간 협업 — 보완적이며 다른 추상화 레벨
- **모든 것을 버전 관리**: 코드·프롬프트·모델·tool schema·메모리·평가 데이터셋 — 이것이 production "undo 버튼"

## 관련 개념
[[AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] · [[AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]] · [[AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[AI/sources/22365_14_Operationalizing_Generative_AI_on_Vertex_AI_v7_(1)|Vertex AI]] · [[AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]] · [[AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]]
