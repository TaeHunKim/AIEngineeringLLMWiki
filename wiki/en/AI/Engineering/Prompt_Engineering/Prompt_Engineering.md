---
order: 0
nav_order: 20
---

# Prompt Engineering

## Overview

**Prompt Engineering** is the art of designing input text (prompts) sent to an LLM to elicit desired outputs. It **controls model behavior through the input/output interface alone**, without modifying model weights.

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Prompt_Engineering/System_and_Role_Prompting\|System & Role Prompting]] | System prompt structure design, role assignment, Constitutional AI |
| [[en/AI/Engineering/Prompt_Engineering/Few_shot_Prompting\|Few-shot Prompting]] | Teaching with examples — Zero/One/Few-shot (Brown 2020) |
| [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought\|Chain of Thought]] | Inducing step-by-step reasoning — CoT/ToT/Self-Consistency |
| [[en/AI/Engineering/Prompt_Engineering/Sampling_Controls\|Sampling Controls]] | Controlling output diversity via Temperature/Top-K/Top-P/Min-P |
| [[en/AI/Engineering/Prompt_Engineering/Structured_Output\|Structured Output]] | Ensuring structured output via JSON/YAML/Pydantic |

## Prompt Design Principles

```
1. Clear role assignment     "You are a senior Python developer."
2. Specific instructions     "Explain in 3 steps."
3. Format specification      "Return as JSON: {key: value}"
4. Providing examples        "Example: [input] → [output]"
5. Constraints               "Under 200 words, no jargon"
```

## Difference from Model Engineering

```
Model Engineering:  Modify model weights (high cost, permanent effect)
Prompt Engineering: Modify input text (low cost, instant application)

Practical order:
  1. First attempt to achieve goals via Prompt Engineering
  2. If insufficient, consider Fine-Tuning
  3. If still insufficient, consider the full Model Engineering stack
```

## Role in AI Engineering

Prompt Engineering is the **most cost-effective means of controlling model behavior**. Industry consensus is that 80% of model improvements can be addressed at the prompt level. It is the first optimization point for every AI system.

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]]
