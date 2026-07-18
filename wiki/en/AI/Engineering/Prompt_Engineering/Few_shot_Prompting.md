---
order: 2
---

# One-shot & Few-shot Prompting

## Overview

**Few-shot Prompting** is a technique that includes task input-output examples in the prompt to guide the model to follow the desired pattern. It enables immediate performance of new tasks through In-Context Learning without separate fine-tuning.

## Origin

- **Authors**: Brown et al., OpenAI (2020)
- **Paper**: "Language Models are Few-Shot Learners" (GPT-3 paper) — [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)
- Showed that GPT-3 can perform many tasks with just a few examples

## Types

### Zero-shot
Performs task with only task description, no examples:
```
Q: "Classify the sentiment of the following review: 'This movie was amazing!'"
A: Positive
```

### One-shot
Provides 1 example:
```
Example:
  Input: "The delivery was way too slow"
  Output: Negative

Question:
  Input: "The quality exceeded my expectations"
  Output: ?
```

### Few-shot
Provides 3~10 examples:
```
Examples:
  Input: "Delivery was slow" → Negative
  Input: "Great value for money" → Positive
  Input: "Just average" → Neutral

Question: "I'll buy again next month" → ?
```

## Selecting Effective Few-shot Examples

### Example Quality Criteria
1. **Diversity**: Cover diverse patterns and edge cases
2. **Relevance**: Similar to the actual inference task
3. **Balance**: Uniform distribution across classes
4. **Clarity**: Unambiguous answers

### Number of Examples vs. Performance

Generally more examples → better performance, but with diminishing returns:
```
0-shot: Baseline
1-shot: +10~20% improvement
3-shot: +15~25% improvement
10-shot: +18~28% improvement
20+shot: Context window limits & diminishing returns
```

### Impact of Example Order
Recent research (2022~) shows example order affects performance (Recency Bias). Placing important examples last is effective.

## Use in Format Control

Few-shot is very effective for enforcing specific output formats:

```
Example:
  Input: "Meeting summary: Next quarter revenue target set at $1M"
  Output: {
    "topic": "Revenue target setting",
    "decisions": ["Q4 target: $1M"],
    "stakeholders": []
  }

Question:
  Input: "Meeting summary: Manager Kim approved 3 new hires"
  Output: ?
```

## Zero-shot vs Few-shot Selection

| Situation | Recommendation |
|------|------|
| General tasks | Zero-shot |
| Special format output needed | Few-shot |
| Domain-specific judgment criteria | Few-shot |
| Model doesn't understand the task | Few-shot |
| Short context window | Zero-shot |

## Few-shot + CoT Combination

Particularly powerful for tasks requiring complex reasoning:
```
Example (with CoT):
  Q: "John has 5, Mary has 3 apples. How many together?"
  A: "John 5 + Mary 3 = 8" → 8

Question:
  Q: "Tom gave 8, Jim gave 4 to Sam. How many did Sam receive?"
  A: ?
```

→ See [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]]

## Role in AI Engineering

Few-shot Prompting is the core technique for rapid prototyping before fine-tuning. "Do it like these examples" is the most intuitive method of model control, and it's far cheaper than fine-tuning when quickly adapting to a new domain. However, context window costs and Prompt Injection risks must also be considered.

## Related Concepts
[[en/AI/Engineering/Prompt_Engineering/System_and_Role_Prompting|System & Role Prompting]] · [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]] · [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]]

## Sources
- Brown et al. (2020) "Language Models are Few-Shot Learners" — [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)
- Min et al. (2022) "Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?" — [arXiv:2202.12837](https://arxiv.org/abs/2202.12837)
- Anthropic Prompt Engineering Guide — [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
