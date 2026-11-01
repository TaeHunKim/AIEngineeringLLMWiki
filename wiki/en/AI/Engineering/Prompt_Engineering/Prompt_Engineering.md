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
| [[en/AI/Engineering/Prompt_Engineering/System_and_Role_Prompting\|System_and_Role_Prompting]] | System Prompt structure design, role assignment, Constitutional AI |
| [[en/AI/Engineering/Prompt_Engineering/Few_shot_Prompting\|Few_shot_Prompting]] | Learning by example — Zero/One/Few-shot (Brown 2020) |
| [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought\|Chain_of_Thought]] | Inducing step-by-step reasoning — CoT/ToT/Self-Consistency |
| [[en/AI/Engineering/Prompt_Engineering/Sampling_Controls\|Sampling_Controls]] | Controlling output diversity with Temperature/Top-K/Top-P/Min-P |
| [[en/AI/Engineering/Prompt_Engineering/Structured_Output\|Structured_Output]] | Distinguishing JSON·Schema·semantic validation, provider contracts and failure handling |
| [[en/AI/Engineering/Prompt_Engineering/Prompt_Caching\|Prompt_Caching]] | Prioritizing static prefixes, Cache Breakpoint/TTL, differences with Semantic Cache |
| [[en/AI/Engineering/Prompt_Engineering/Automatic_Prompt_Optimization\|Automatic_Prompt_Optimization]] | APE/OPRO/TextGrad·GEPA, DSPy selection·compilation·independent evaluation |

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

## The Shift in the Reasoning-Model Era

Reasoning models like o1/o3, Claude Extended Thinking, and Gemini Deep Think perform CoT internally, so eliciting phrases like "think step by step" matter less, and the center of gravity is shifting toward API-level controls like thinking budgets. See [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]] for details.

## Role in AI Engineering

Prompt Engineering is a means to adjust behavior without changing weights. The improvement effect varies depending on the task and the cause of failure, and it is evaluated separately from retrieval, tool, and training data issues.

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Loop_Engineering/Continuous_Optimization|Continuous Optimization]]
