---
order: 0
---

# Harness Safety

## Overview

**Harness Safety** is a defense layer that prevents AI systems from emitting harmful or ungrounded outputs. This includes guardrails that filter inputs and outputs in real-time, prompt injection defense that blocks hidden instructions in external data, red teaming that proactively finds vulnerabilities from an attacker's perspective, and grounding verification that detects unfounded generation. The first two are runtime defenses, red teaming is a method to verify defenses before deployment, and hallucination handling stands apart because it deals with non-malicious failures.

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering\|Guardrail_Engineering]] | NeMo Guardrails, Guardrails AI, LlamaGuard |
| [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Prompt_Injection_Defense\|Prompt_Injection_Defense]] | Lethal Trifecta, Rule of Two, CaMeL, Dual-LLM, Spotlighting |
| [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Red_Teaming\|Red_Teaming]] | HarmBench, PAIR, Jailbreaking Detection, OWASP LLM Top 10, Garak/PyRIT |
| [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Hallucination_and_Grounding\|Hallucination_and_Grounding]] | Hallucination Detection/Groundedness Verification, Semantic Entropy, claim-level groundedness |

## Related Concepts
[[en/AI/Engineering/Harness_Engineering/Harness_Engineering|Harness Engineering]] · [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/Harness_Evaluation|Harness Evaluation]] · [[en/AI/Engineering/Harness_Engineering/Alignment_and_Governance/Alignment_and_Governance|Alignment and Governance]]
