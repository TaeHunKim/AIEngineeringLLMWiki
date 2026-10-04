---
order: 0
---

# Harness Evaluation

## Overview

**Harness Evaluation** is a layer that measures the quality of AI systems and observes their behavior during operation. Offline evaluation consists of benchmarking, which compares capabilities using standard test sets, automated evaluation, which uses LLMs or agents as evaluators, and human evaluation, which is based on human judgment. Observability and tracing serve as online evaluation, where the same questions are posed in real-time in production. Since automated evaluation is fast and inexpensive but prone to bias, a structure that periodically corrects it with human evaluation is common.

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge\|LLM_as_a_Judge]] | Automated Quality Evaluation — MT-Bench, RAGAS, G-Eval, Prometheus |
| [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Agent_as_a_Judge\|Agent_as_a_Judge]] | Agent Execution Trajectory Evaluation, Critic Agent, Agent Simulation |
| [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Benchmarking\|Benchmarking]] | MMLU/HumanEval/SWE-bench(Verified), pass@k |
| [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Human_Evaluation\|Human_Evaluation]] | Preference Annotation, IAA, Chatbot Arena |
| [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing\|Observability_and_Tracing]] | LangSmith/Langfuse/Arize Phoenix |

## Related Concepts
[[en/AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] · [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Harness_Safety|Harness Safety]] · [[en/AI/Engineering/Harness_Engineering/Alignment_and_Governance/Alignment_and_Governance|Alignment and Governance]]
