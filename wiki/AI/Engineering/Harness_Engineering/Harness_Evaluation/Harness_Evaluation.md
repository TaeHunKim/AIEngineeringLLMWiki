---
order: 0
---

# Harness Evaluation (하네스 평가·관찰)

## 개요

**Harness Evaluation**은 AI 시스템의 품질을 측정하고 운영 중 동작을 관찰하는 계층이다. 표준 테스트셋으로 능력을 비교하는 benchmarking, LLM이나 에이전트를 평가자로 쓰는 자동 평가, 사람의 판단을 기준으로 삼는 human evaluation이 오프라인 평가를 이루고, observability와 tracing은 프로덕션에서 같은 질문을 실시간으로 던지는 온라인 평가 역할을 한다. 자동 평가는 빠르고 저렴하지만 편향이 있으므로, 사람 평가로 주기적으로 보정하는 구조가 일반적이다.

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge\|LLM_as_a_Judge]] | 자동 품질 평가 — MT-Bench, RAGAS, G-Eval, Prometheus |
| [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Agent_as_a_Judge\|Agent_as_a_Judge]] | 에이전트 실행 궤적 평가, Critic Agent, Agent Simulation |
| [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Benchmarking\|Benchmarking]] | MMLU/HumanEval/SWE-bench(Verified), pass@k |
| [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Human_Evaluation\|Human_Evaluation]] | Preference Annotation, IAA, Chatbot Arena |
| [[AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing\|Observability_and_Tracing]] | LangSmith/Langfuse/Arize Phoenix |

## 관련 개념
[[AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] · [[AI/Engineering/Harness_Engineering/Harness_Safety/Harness_Safety|Harness Safety]] · [[AI/Engineering/Harness_Engineering/Alignment_and_Governance/Alignment_and_Governance|Alignment and Governance]]
