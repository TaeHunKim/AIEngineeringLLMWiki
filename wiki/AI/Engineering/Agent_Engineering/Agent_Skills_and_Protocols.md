---
order: 6
---

# Agent Skills & Protocols

## 개요

에이전트가 실세계에서 유용하게 작동하려면 두 가지 인프라가 필요하다. 하나는 **재사용 가능한 능력 단위**인 Agent Skills이고, 다른 하나는 **에이전트 간·에이전트-도구 간 통신을 표준화**하는 Protocol이다.

```
도구(Tool):      단순 함수 호출 → get_stock_price("005930.KS")
스킬(Skill):     능력 묶음 → 주식 분석 스킬 = 여러 도구 + 프롬프트 + 로직
프로토콜(Protocol): 에이전트 생태계 표준 → MCP, A2A
```

---

## Agent Skills

### 개념

Agent Skills는 도구의 상위 개념으로, **여러 도구 + 프롬프트 + 실행 로직**이 묶인 재사용 가능한 능력 단위다.

```
에이전트 스킬 (Agent Skill) 예시:
  "주식 분석 스킬" =
    get_stock_price() +
    get_financial_statements() +
    calculate_ratios() +
    "PER, PBR, ROE를 분석하고 투자 의견을 제시하는 프롬프트"
```

### Anthropic의 Agent Skills 개념

Anthropic은 2025년 10월 "Equipping Agents for the Real World with Agent Skills"를 발표:

```
Agent Skill 구성:
  - 스킬 명세(Specification): 무엇을 하는지 정의
  - 도구 세트(Tool Bundle): 스킬 실행에 필요한 도구들
  - 실행 지침(Instructions): 도구를 조합하는 방법
  - 컨텍스트(Context): 필요한 배경 지식
```

### Claude Code Plugins/Skills

```json
// SKILL.md 구조 예시
{
  "name": "create-word-document",
  "description": "Word (.docx) 문서 생성 및 편집",
  "tools": ["python_exec", "file_write"],
  "dependencies": ["python-docx"],
  "prompt": "python-docx 라이브러리를 사용하여 Word 문서를 생성합니다..."
}
```

### 스킬 설계 원칙

```python
# 좋은 스킬: 명확한 경계, 단일 책임
class DataAnalysisSkill:
    """
    CSV 데이터 분석 스킬.
    입력: CSV 파일 경로
    출력: 통계 요약 + 시각화 + 인사이트
    """
    tools = [python_exec, file_read, chart_generator]
    
    def execute(self, csv_path: str) -> AnalysisReport:
        data = self.load_and_validate(csv_path)
        stats = self.compute_statistics(data)
        charts = self.generate_visualizations(data)
        insights = self.extract_insights(stats)
        return AnalysisReport(stats=stats, charts=charts, insights=insights)
```

### Skill Registry (스킬 레지스트리)

```python
class SkillRegistry:
    def __init__(self):
        self.skills = {}
    
    def register(self, skill: AgentSkill):
        self.skills[skill.name] = skill
    
    def discover(self, task_description: str) -> list[AgentSkill]:
        """태스크 설명에 맞는 스킬 시맨틱 검색"""
        task_embed = embed(task_description)
        return sorted_by_similarity(task_embed, self.skills)
```

---

## 프로토콜 표준

에이전트가 외부 세계와 통신하기 위한 주요 오픈 표준:

| | [[Agent_Skills_and_Protocols/MCP\|MCP]] | [[Agent_Skills_and_Protocols/A2A\|A2A]] | [[Agent_Skills_and_Protocols/AG_UI\|AG-UI]] | A2UI | AP2 |
|--|-----|-----|-----|-----|-----|
| **대상** | LLM ↔ 도구/서비스 | 에이전트 ↔ 에이전트 | 에이전트 ↔ 사용자 UI | 에이전트 → UI 컴포넌트 생성 | 에이전트 ↔ 결제 시스템 |
| **발표** | Anthropic, 2024년 11월 | Google, 2025년 4월 | CopilotKit, 2025년 6월 | Google, 2026년 | Google, 2025년 9월 |
| **거버넌스** | Linux Foundation (2025년 12월~) | Linux Foundation (2025년 6월~) | ag-ui-protocol 오픈소스 조직 | 오픈소스 (github.com/google/A2UI) | 오픈 프로토콜 (Google + 60개 이상 파트너) |
| **관계** | 도구 통합 표준 | 에이전트 간 통신 표준 | 에이전트-사용자 상호작용 표준 | 에이전트→UI 생성 표준 | 에이전트 결제 표준 |

MCP, A2A, AG-UI, A2UI, AP2는 상호 보완 관계다 — MCP로 도구를 호출하고, A2A로 에이전트에 위임하고, AG-UI로 사용자와 실시간 상호작용하며, A2UI로 동적 UI 컴포넌트를 제공하고, AP2로 에이전트 결제를 처리한다.

- 자세한 내용 → [[Agent_Skills_and_Protocols/MCP]]
- 자세한 내용 → [[Agent_Skills_and_Protocols/A2A]]
- 자세한 내용 → [[Agent_Skills_and_Protocols/AG_UI]]

---

## A2UI (Agent-to-UI Protocol)

### 개요

**A2UI**는 에이전트가 대화 중 동적으로 UI 컴포넌트(폼, 차트, 버튼, 카드 등)를 생성·스트리밍하는 선언적 프로토콜이다. 기존 챗봇이 텍스트 블록만 반환하던 한계를 넘어, 에이전트가 상황에 맞는 인터랙티브 UI를 즉석에서 구성한다.

```
기존 에이전트-사용자 상호작용 스펙트럼:

  텍스트 챗봇        → 마크다운 블록 반환
  구조화 JSON        → 프론트엔드가 미리 정해진 템플릿으로 렌더링
  MCP UI            → 도구로 UI 요소 제어
  AG UI             → 에이전트-클라이언트 상태 동기화
  A2UI (최상위)     → 에이전트가 완전 새로운 UI 컴포넌트를 즉석 생성·스트리밍

A2UI의 특징:
  에이전트가 대화 중 매 순간 필요한 UI를 동적으로 결정
  사전 정의된 템플릿 없이도 복잡한 인터랙티브 인터페이스 생성
  동일 에이전트가 Web(React), Mobile(Flutter/SwiftUI), Desktop에서 동일 UI 생성
```

### 작동 방식

A2UI는 **JSONL 기반 선언적 프로토콜**이다. 에이전트는 마크다운 텍스트 토큰 대신 UI 컴포넌트를 나타내는 JSON 객체를 스트리밍한다.

```json
// 에이전트가 스트리밍하는 A2UI 페이로드 예시
// (주식 분석 요청에 대한 응답)
[
  {
    "id": "header-1",
    "type": "Heading",
    "props": { "level": 2, "text": "삼성전자 (005930) 분석" }
  },
  {
    "id": "chart-1",
    "type": "LineChart",
    "props": {
      "data": [{"date": "2026-01", "price": 78000}, {"date": "2026-06", "price": 82000}],
      "xKey": "date",
      "yKey": "price",
      "title": "최근 6개월 주가"
    }
  },
  {
    "id": "table-1",
    "type": "DataTable",
    "props": {
      "columns": ["지표", "값", "업종 평균"],
      "rows": [
        ["PER", "12.3", "15.1"],
        ["PBR", "1.2", "1.8"],
        ["ROE", "18.5%", "14.2%"]
      ]
    }
  },
  {
    "id": "action-1",
    "type": "Button",
    "props": { "label": "포트폴리오에 추가", "action": "add_to_portfolio" }
  }
]
```

클라이언트 앱은 "카탈로그"(사전 승인된 컴포넌트 목록)를 유지한다. 에이전트는 이 카탈로그 내의 컴포넌트만 요청할 수 있어 보안이 확보된다.

### 보안 모델

A2UI는 **선언적 데이터 포맷** — 실행 가능한 코드가 아니다. 에이전트가 임의 JavaScript를 실행하는 것이 아니라, 클라이언트가 신뢰하는 컴포넌트 타입(Card, Button, Chart 등)만 렌더링을 요청할 수 있다.

```
보안 경계:
  에이전트 → A2UI JSON → [클라이언트 카탈로그 검증] → 렌더링

  에이전트가 카탈로그에 없는 타입 요청 시 → 클라이언트가 거부
  에이전트가 직접 DOM 조작/코드 실행 불가 → XSS 등 공격 차단
```

### 멀티플랫폼 지원

동일한 A2UI JSON 페이로드를 여러 렌더러가 각 플랫폼에 맞게 렌더링:

| 렌더러 | 플랫폼 | 출시 시점 |
|--------|--------|---------|
| React | 웹 | 2026 Q1 |
| Flutter | iOS/Android | 2026 Q2 |
| SwiftUI | iOS Native | 2026 Q2 |
| Jetpack Compose | Android Native | 2026 Q2 |

### Gemini Enterprise App 통합

2026년 5월 기준, Gemini Enterprise 앱이 A2UI를 네이티브 지원한다:
- 커스텀 에이전트가 사용자 워크스페이스 내에 동적 데이터 시각화·폼·인터랙티브 위젯을 직접 생성
- Computer use (에이전트가 UI 조작) ↔ A2UI (에이전트가 UI 생성) — 보완적 접근

### MCP UI / AG UI / A2UI 비교

```
MCP UI:
  에이전트가 도구(Tool)로 기존 UI 요소를 제어
  "이 버튼을 클릭해라", "이 필드에 값을 입력해라"
  → 기존 UI 조작에 적합

AG-UI (Agent-User Interaction Protocol, CopilotKit):
  에이전트-클라이언트 간 상태를 실시간 동기화
  이벤트 기반 스트리밍으로 텍스트·도구 호출·상태 변경을 전달
  → 에이전트와 사용자의 양방향 협력에 적합
  자세한 내용 → [[Agent_Skills_and_Protocols/AG_UI]]

A2UI:
  에이전트가 새로운 UI 컴포넌트를 즉석 생성·스트리밍
  사전 정의된 템플릿 없이 상황별 최적 UI 생성
  → 맞춤형 인터랙티브 인터페이스 생성에 적합
```

---

## AP2 (Agent Payments Protocol)

### 개요

**AP2 (Agent Payments Protocol)**는 AI 에이전트가 사용자를 대신해 결제를 안전하게 승인·실행할 수 있도록 표준화한 오픈 프로토콜이다. Google이 2025년 9월 16일 발표했으며, A2A·MCP의 확장으로 설계되어 기존 에이전트 통신 스택에 결제 레이어를 추가한다 [5].

핵심 문제 의식은 에이전트가 결제를 트리거할 때 "이 거래가 실제 사용자의 의도인가"를 암호학적으로 증명할 수단이 없었다는 점이다. AP2는 **Mandate(위임장)** 개념을 도입해 이를 해결한다 — 사용자가 서명한 Mandate가 에이전트의 결제 권한 범위, 한도, 유효 기간을 명확히 정의하며, W3C Verifiable Credentials 형태로 전달된다 [6].

### 핵심 메커니즘: 3단계 Mandate

AP2는 구매 흐름을 세 단계의 서명된 문서로 구조화한다:

```
1. Intent Mandate  (의도 위임장)
   사용자가 고수준 지시를 내릴 때 생성.
   "항공권 최저가를 찾아 예약해줘 (한도 100만 원, 2026-07까지)" 같은 조건을 서명.

2. Cart Mandate  (장바구니 위임장)
   에이전트가 조건에 맞는 구매 항목을 찾았을 때 생성.
   Intent Mandate 조건 범위 내라면 에이전트가 자동 서명 가능.

3. Payment Mandate  (결제 위임장)
   실제 결제 네트워크(카드사·은행·스테이블코인)에 전달되는 최종 문서.
   "사람이 승인했는지, AI가 승인했는지"를 명시해 책임 추적 가능.
```

각 Mandate는 JWT와 유사한 구조에 디지털 서명·키 바인딩·만료 타임스탬프를 포함해 무결성·진위성·책임 추적성을 보장한다 [6].

### 현황 (2025년 9월 발표, 초기 도입 단계)

출시 파트너로 Mastercard, PayPal, Coinbase, American Express, Adyen, Revolut, Salesforce, ServiceNow, UnionPay 등 60개 이상 기관이 참여했다 [5]. Coinbase·Ethereum Foundation과 협력해 스테이블코인 결제를 위한 **A2A x402 확장**도 공개했다.

2026년 Q1 기준으로 60개 이상 파트너와 초기 프로덕션 적용이 진행 중이나, AP2는 여전히 도입 초기 단계다. 카드·은행 이체·스테이블코인을 모두 1급 시민(first-class citizen)으로 지원하는 결제-불가지론적(payment-agnostic) 설계가 특징이다.

---

## AI Engineering에서의 역할

Agent Skills는 능력의 **모듈화와 재사용성**을 가능하게 하고, MCP/A2A/A2UI는 에이전트 생태계의 **상호운용성**을 확보한다. 에이전트 시스템이 단일 에이전트에서 에이전트 네트워크로, 그리고 풍부한 사용자 경험까지 진화하면서 이 프로토콜들의 중요성이 빠르게 높아지고 있다.

## 관련 개념
[[Agent_Architectures]] · [[Tool_Use_and_Function_Calling]] · [[Agent_Core_Pillars]] · [[Agent_Deployment]]

## 출처
- Anthropic (2025) "Equipping Agents for the Real World with Agent Skills" — [anthropic.com](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- Google Developers Blog "Introducing A2UI: An open project for agent-driven interfaces" — [developers.googleblog.com](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/) [1]
- Google Developers Blog "A2UI v0.9: The New Standard for Portable, Framework-Agnostic Generative UI" — [developers.googleblog.com](https://developers.googleblog.com/a2ui-v0-9-generative-ui/) [2]
- AG2 Docs "A2UIAgent: Rich UI from Your AG2 Agents" — [docs.ag2.ai](https://docs.ag2.ai/latest/docs/blog/2026/03/20/AG2-A2UI/) [3]
- A2UI GitHub — [github.com/google/A2UI](https://github.com/google/A2UI) [4]
- Google Cloud Blog "Announcing Agent Payments Protocol (AP2)" — [cloud.google.com](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol) [5]
- Cloud Security Alliance "Secure Use of the Agent Payments Protocol (AP2)" — [cloudsecurityalliance.org](https://cloudsecurityalliance.org/blog/2025/10/06/secure-use-of-the-agent-payments-protocol-ap2-a-framework-for-trustworthy-ai-driven-transactions) [6]
- [[Agent_Skills_and_Protocols/MCP]] — MCP 상세 문서
- [[Agent_Skills_and_Protocols/A2A]] — A2A 상세 문서

### 참고 문헌
[1] https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/
[2] https://developers.googleblog.com/a2ui-v0-9-generative-ui/
[3] https://docs.ag2.ai/latest/docs/blog/2026/03/20/AG2-A2UI/
[4] https://github.com/google/A2UI
[5] https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol
[6] https://cloudsecurityalliance.org/blog/2025/10/06/secure-use-of-the-agent-payments-protocol-ap2-a-framework-for-trustworthy-ai-driven-transactions
