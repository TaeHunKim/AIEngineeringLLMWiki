---
order: 6
---

# Open Knowledge Format (OKF)

## 개요

**Open Knowledge Format (OKF)**은 Google Cloud가 2026년 6월 12일 발표한 AI 에이전트용 지식 패키징 오픈 표준이다. 마크다운 파일과 YAML frontmatter로 구성된 디렉터리 구조를 활용해, 조직의 지식을 AI 에이전트가 예측 가능하게 소비할 수 있는 형태로 패키징한다.

```
OKF의 핵심 명제:
  조직 지식(테이블 스키마, API 명세, 비즈니스 메트릭, Runbook)을
  어떤 LLM·프레임워크와도 호환되는 단일 표준 형식으로 표현한다
  → "지식 표현 비용을 한 번만 지불한다"
```

## 배경: 왜 필요한가

### 조직 지식 파편화 문제

AI 에이전트가 실세계에서 유용하게 작동하려면 방대한 **조직 내부 지식**이 필요하다. 그런데 이 지식은 사방에 흩어져 있다:

```
현실:
  - 메타데이터 카탈로그 (데이터 팀)
  - 내부 위키 (엔지니어링 팀)
  - 코드 주석 (개발자)
  - Slack 대화 (모두)
  - 엔지니어의 머릿속 (퇴사 시 소실)

결과:
  - 에이전트 빌더마다 context 조립 문제를 처음부터 해결
  - 카탈로그 벤더마다 같은 데이터 모델을 재발명
  - 지식이 특정 플랫폼 안에 Lock-in
```

### LLM-wiki 패턴 → OKF

OKF가 등장하기 전부터 실무에서는 "LLM-wiki 패턴" — 마크다운 파일들의 디렉터리로 컨텍스트를 관리하는 방식 — 이 자연발생적으로 사용되어 왔다. OKF는 이 검증된 패턴을 벤더 중립적인 공식 표준으로 포맷화한 것이다.

> **참고**: 이 위키 자체가 LLM-wiki 패턴의 구현 사례다. `order:` frontmatter를 가진 마크다운 파일들, 디렉터리 구조, 개념 간 위키링크로 형성된 그래프 — 이것이 정확히 OKF가 표준으로 정의하는 구조다.

## 핵심 구조

### 파일 시스템 기반 번들

OKF 번들은 **마크다운 파일 하나 = 개념(concept) 하나**의 디렉터리 구조다:

```
knowledge-bundle/
├── orders_table.md          # 주문 테이블 스키마
├── revenue_metric.md        # 매출 메트릭 정의
├── payment_service_api.md   # 결제 서비스 API
├── db_runbook.md            # DB 장애 대응 Runbook
└── customer_join_path.md    # customers ↔ orders 조인 경로
```

### YAML Frontmatter 스펙

각 파일은 YAML frontmatter + 마크다운 본문으로 구성:

```yaml
---
type: table              # (필수) 이 개념의 타입
title: "orders"          # (선택) 사람이 읽기 좋은 이름
description: "모든 고객 주문 기록을 저장하는 테이블"
resource: "bigquery://myproject.prod.orders"  # (선택) 실제 리소스 포인터
tags: ["ecommerce", "transactional"]          # (선택) 분류 태그
timestamp: "2026-06-01T00:00:00Z"            # (선택) 생성/수정 일시
# 이 외 커스텀 필드 자유롭게 추가 가능
---

# orders 테이블

주문 ID, 고객 ID, 상품 목록, 결제 상태를 포함한다.

## 컬럼

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| order_id | STRING | 주문 고유 식별자 (UUID) |
| customer_id | STRING | 고객 식별자 → [customers](./customers_table.md) |
| created_at | TIMESTAMP | 주문 생성 시각 (UTC) |
| status | STRING | 'pending', 'confirmed', 'shipped', 'delivered' |
| total_amount | FLOAT | 최종 결제 금액 (원화) |

## 비즈니스 규칙

- `status = 'confirmed'` 이후 취소 시 별도 refund 레코드 생성
- `created_at` 기준 파티셔닝 적용 (일별 쿼리 시 반드시 파티션 조건 명시)
```

**설계 철학**: 필수 필드는 `type` 하나뿐. 나머지는 선택이며 커스텀 필드도 자유롭게 추가 가능. 마크다운 링크로 개념 간 상호참조 → 에이전트가 탐색할 수 있는 그래프 형성.

### type 값 예시

```
table       — DB 테이블/뷰
metric      — KPI, 비즈니스 메트릭
api         — API 엔드포인트
runbook     — 운영 절차서
dataset     — 데이터셋
concept     — 도메인 개념 (비즈니스 용어 정의)
service     — 내부 서비스
```

## 실사용 예시: 에이전트가 OKF를 읽는 방법

```python
import os
import yaml

def load_okf_bundle(bundle_dir: str) -> list[dict]:
    """OKF 번들 디렉터리에서 모든 개념을 로드"""
    concepts = []
    for fname in os.listdir(bundle_dir):
        if not fname.endswith(".md"):
            continue
        with open(os.path.join(bundle_dir, fname)) as f:
            content = f.read()
        
        # YAML frontmatter 파싱
        if content.startswith("---"):
            parts = content.split("---", 2)
            metadata = yaml.safe_load(parts[1])
            body = parts[2].strip()
        else:
            metadata, body = {}, content
        
        concepts.append({
            "file": fname,
            "metadata": metadata,
            "content": body
        })
    return concepts

# 에이전트 컨텍스트에 주입
bundle = load_okf_bundle("./knowledge-bundle")

# 타입별 필터링 (에이전트가 테이블 정보만 필요할 때)
tables = [c for c in bundle if c["metadata"].get("type") == "table"]

# LLM에게 전달할 컨텍스트 조립
context = "\n\n".join([
    f"## {c['metadata'].get('title', c['file'])}\n{c['content']}"
    for c in tables
])
```

**특징**: 데이터베이스도, 런타임도, API 키도 필요 없다. 파일 시스템에서 읽기만 하면 된다.

## RAG와의 관계

OKF와 RAG는 **경쟁 관계가 아닌 상호보완적 레이어**다:

```
OKF (지식 구조화 표준):
  - "무엇을 알아야 하는가"를 정의
  - 조직 지식을 구조화된 마크다운으로 패키징
  - 에이전트가 직접 읽고 추론할 수 있는 형태

RAG (검색 실행 전략):
  - "어떻게 관련 지식을 찾는가"를 처리
  - 벡터 검색, 하이브리드 검색 등으로 OKF 번들에서 관련 개념 검색
  - 대규모 번들에서 컨텍스트 크기를 관리

조합 패턴:
  OKF 번들 → (벡터 인덱싱) → RAG 검색 → 에이전트 컨텍스트 주입
```

소규모 번들(수십~수백 개 파일)은 전체를 컨텍스트에 넣을 수 있고, 대규모 번들은 RAG로 관련 개념만 선별적으로 검색한다.

## JSON-LD / RDF와의 차이

기존 지식 표현 표준들과의 비교:

| | OKF | JSON-LD | RDF/OWL |
|---|---|---|---|
| 작성 난이도 | 매우 낮음 (마크다운) | 중간 | 높음 |
| 필수 전문 지식 | 없음 | JSON + 컨텍스트 | 시맨틱 웹 전문가 |
| AI 가독성 | 자연어 기반, 높음 | 구조화 데이터 | 추론 엔진 필요 |
| 사람 가독성 | 높음 | 중간 | 낮음 |
| 런타임/DB 필요 | 없음 | 없음 | 트리플스토어 필요 |
| 표현력 | 자유로운 마크다운 | 엄격한 스키마 | 형식 논리 기반 |

OKF의 포지션: "AI 에이전트가 읽을 수 있는, 엔지니어가 쉽게 쓸 수 있는" 실용주의 표준.

## Vendor Neutrality

OKF는 특정 클라우드, 데이터베이스, AI 모델에 종속되지 않는다:

```
어떤 LLM이든:    OpenAI, Anthropic, Gemini, 오픈소스 모델 모두 동일하게 읽을 수 있음
어떤 프레임워크:  LangChain, LlamaIndex, 직접 구현 모두 호환
어떤 환경:       로컬, 클라우드, 에어갭(air-gap) 환경 모두 작동
어떤 언어:       Python, Go, TypeScript 등 파일 I/O 가능한 언어면 됨
```

## AI Engineering에서의 역할

OKF는 Context Engineering의 **"조직 지식 계층"**을 표준화한다. RAG가 "어떻게 검색할 것인가"를 해결한다면, OKF는 그 이전 단계인 "조직 지식을 어떤 형식으로 표현할 것인가"를 해결한다.

실무에서 OKF는 다음 문제를 해결한다:
- AI 프로젝트마다 동일한 컨텍스트 조립 코드를 재작성하는 중복 제거
- 도메인 전문가(데이터 팀, 백엔드 팀)가 AI 인프라 없이도 지식 기여 가능
- 에이전트 간 동일한 조직 지식 공유 (MCP Server의 "Knowledge" 리소스로 서빙 가능)

## 관련 개념
[[Context_Engineering]] · [[Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies]] · [[Retrieval_Strategies/RAG/RAG|RAG]] · [[Retrieval_Strategies/GraphRAG/Knowledge_Graph/Knowledge_Graph|Knowledge Graph]] · [[../Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]]

## 출처
- Google Cloud (2026-06-12) "How the Open Knowledge Format can improve data sharing" — [cloud.google.com/blog](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing/)
- Google Cloud Platform "knowledge-catalog" GitHub — [github.com/GoogleCloudPlatform/knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog)
- OKF 공식 Spec — [github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- MindStudio "What Is the Open Knowledge Format (OKF)?" — [mindstudio.ai/blog](https://www.mindstudio.ai/blog/what-is-open-knowledge-format-okf-google-llm-wiki-standard)
- Analytics Vidhya "OKF: Redefining Knowledge Bases for AI Agents" — [analyticsvidhya.com](https://www.analyticsvidhya.com/blog/2026/07/open-knowledge-format-okf/)
