---
order: 0
---

# Harness Safety (하네스 안전)

## 개요

**Harness Safety**는 AI 시스템이 유해하거나 사실이 아닌 출력을 내보내지 않도록 막는 방어 계층이다. 입력·출력을 실시간으로 걸러내는 guardrail, 외부 데이터에 숨은 지시를 차단하는 prompt injection 방어, 공격자 관점에서 약점을 먼저 찾아내는 red teaming, 근거 없는 생성을 탐지하는 grounding 검증이 여기에 속한다. 앞의 둘은 런타임 방어이고, red teaming은 배포 전 방어를 검증하는 수단이며, hallucination 대응은 악의 없는 실패를 다룬다는 점에서 구분된다.

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering\|Guardrail_Engineering]] | NeMo Guardrails, Guardrails AI, LlamaGuard |
| [[AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense\|Prompt_Injection_Defense]] | Lethal Trifecta, Rule of Two, CaMeL, Dual-LLM, Spotlighting |
| [[AI/Engineering/Harness_Engineering/Harness_Safety/Red_Teaming\|Red_Teaming]] | HarmBench, PAIR, Jailbreaking 탐지, OWASP LLM Top 10, Garak/PyRIT |
| [[AI/Engineering/Harness_Engineering/Harness_Safety/Hallucination_and_Grounding\|Hallucination_and_Grounding]] | 환각 탐지·근거 검증, Semantic Entropy, claim 단위 groundedness |

## 관련 개념
[[AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] · [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Harness_Evaluation|Harness Evaluation]] · [[AI/Engineering/Harness_Engineering/Alignment_and_Governance/Alignment_and_Governance|Alignment and Governance]]
