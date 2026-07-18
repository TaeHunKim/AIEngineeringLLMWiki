---
order: 1
---

# System Prompting & Role Prompting

## Overview

**System Prompting** is a special input that sets the overall behavior, personality, and constraints of an LLM. **Role Prompting** is a technique that assigns the model a specific expert or persona role to elicit responses from that perspective. Both are core tools for Input Control.

## Role of the System Prompt

All modern chat LLM APIs (OpenAI, Anthropic, Google, etc.) support System messages separately:

```python
# OpenAI API example
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "You are an AI assistant specializing in contract law. "
                       "Answer based on case law and statutes, "
                       "and always note that this is not legal advice."
        },
        {"role": "user", "content": "I have questions about contract termination conditions."}
    ]
)
```

### System Prompt Components

| Component | Example | Role |
|---------|------|------|
| **Persona** | "You are a data scientist with 10 years of experience" | Set expertise and tone |
| **Task definition** | "Find and fix bugs in user code" | Scope of behavior |
| **Constraints** | "Do not make medical diagnoses" | Safety guardrails |
| **Output format** | "Respond only in JSON" | Format control |
| **Context** | "Company: Acme Corp. Product: CRM Software" | Background information |

## Role Prompting

### Basic Concept
```
"You are a [role]. Answer with the characteristics/knowledge/constraints of [role]."
```

### Effective Role Types

**Expert roles**: Improve response expertise and accuracy
```
"You are a senior SRE engineer with 15 years at Google.
You have extensive experience handling incidents in large-scale distributed systems."
```

**Persona roles**: Assign specific communication styles
```
"You are an educator who uses the Socratic method.
Instead of giving direct answers, guide students' thinking through questions."
```

**Simulation roles**: Set up hypothetical situations
```
"You are a Devil's Advocate.
Find and point out possible weaknesses and risks in the user's ideas."
```

## System Prompt Best Practices

### 1. Be Specific and Clear
```
❌ "Answer helpfully"
✅ "Answer user questions in the following format:
    1. Core answer (1~2 sentences)
    2. Detailed explanation (3~5 sentences)
    3. One practical example"
```

### 2. Include Examples (Positive + Negative)
```
"For weather questions, answer like this: 'Based on current meteorological data...'
But do not provide precise forecasts. Example: 'For accurate weather, check the weather service'"
```

### 3. Specify Constraints
```
"Do not respond to the following topics:
- Competitor product comparisons
- Unannounced product roadmaps
- Content related to legal disputes"
```

## Anthropic Claude's System Prompt Structure

Anthropic officially supports multi-layer System Prompts:
- **Operator Prompt**: Set by service operators (business rules)
- **User Turn**: Actual user messages
- Claude follows System Prompts strongly through RLHF training

## Role in AI Engineering

System Prompts are the **design contract** of LLM applications. A well-designed System Prompt can control model behavior as desired without Fine-Tuning. In production deployments, System Prompts should be managed as important assets alongside code.

## Related Concepts
[[en/AI/Engineering/Prompt_Engineering/Few_shot_Prompting|Few-shot Prompting]] · [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]] · [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]]

## Sources
- Anthropic "Prompt Engineering Overview" — [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- OpenAI "Prompt Engineering Guide" — [platform.openai.com](https://platform.openai.com/docs/guides/prompt-engineering)
- White et al. (2023) "A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT" — [arXiv:2302.11382](https://arxiv.org/abs/2302.11382)
