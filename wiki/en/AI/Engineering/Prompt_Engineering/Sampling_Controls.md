---
order: 4
---

# Sampling Controls (Temperature, Top-K, Top-P)

## Overview

LLMs sample from a **probability distribution** when generating each token. Sampling Controls are parameters that adjust this probability distribution to balance output diversity (creativity) vs. focus (accuracy).

## Basic Token Generation Principle

```
Input: "Today the weather is"
LLM-computed probability distribution for the next token:
  "great": 0.45
  "bad": 0.30
  "clear": 0.15
  "cold": 0.08
  other: 0.02

→ Transform this distribution with Sampling Controls, then sample
```

## Temperature

### Concept
A parameter that adjusts the **"sharpness"** of the probability distribution. Divides logits by Temperature before applying softmax:

```
P(token_i) = exp(logit_i / T) / Σ exp(logit_j / T)
```

### Effect

```
T=0.1 (low — focused):
  "great": 0.90, "bad": 0.08, "clear": 0.02
  → Always selects "great". Predictable, repetitive

T=1.0 (default):
  Maintains original distribution

T=2.0 (high — dispersed):
  "great": 0.35, "bad": 0.30, "clear": 0.25, others...
  → Selects diverse and unexpected tokens. Creative but unstable
```

### Practical Settings

| Task | Temperature | Reason |
|------|------------|------|
| Code generation, math | 0.0~0.3 | Accuracy priority |
| Q&A, summarization | 0.3~0.7 | Balance |
| Creative writing | 0.7~1.2 | Diversity |
| Brainstorming | 1.0~1.5 | Maximize creativity |

**T=0** (Greedy Decoding): Always selects the highest probability token. Deterministic.

## Top-K Sampling

### Concept
Keeps only the **top K tokens** by probability and removes the rest before renormalization:

```
K=5 setting:
  Only top 5 tokens as candidates:
    "great": 0.45 → 0.58 (renormalized)
    "bad": 0.30 → 0.38
    "clear": 0.15 → 0.19 (below removed)
    "cold": removed
    other: removed
```

### Pros and Cons
- Blocks low-probability obscure tokens
- Fixing K means effectiveness varies by distribution shape (flat distribution means even K=5 allows too many)

## Top-P (Nucleus Sampling)

### Concept
Keep only the top tokens **until cumulative probability reaches P**:

```
P=0.9 setting:
  "great": 0.45 → cumulative 0.45
  "bad": 0.30 → cumulative 0.75
  "clear": 0.15 → cumulative 0.90 ← stop here
  "cold": 0.08 → removed
  → Candidates: {great, bad, clear} renormalized then sampled
```

### Top-P Advantage
**Dynamically adapts** to distribution shape:
- When distribution is concentrated (model more confident): automatically selects fewer tokens
- When distribution is flat (model more uncertain): automatically selects more tokens

Top-P tends to be more stable than Top-K → **Top-P is used more in practice**

## Min-P Sampling (2024)

Compensates for Top-P's weakness (possibility of including low-probability tokens):
- Remove all tokens below: highest probability token's probability × min_p
- Stronger filtering when highest probability is high
- Recommended: Min-P=0.05~0.1

## Combined Usage

In practice, multiple parameters are typically used together:

```python
# OpenAI/Anthropic API example
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    temperature=0.7,   # moderate creativity
    top_p=0.9,         # top 90% cumulative probability
    # top_k=40,        # Anthropic also supports top_k
)
```

**Note**: Adjusting Temperature and Top-P/Top-K simultaneously creates complex interactions. Usually adjust only one.

## Beam Search (Deterministic Approach)

A different approach from sampling: maintain top B sequences simultaneously:
```
B=3, explore 3 paths simultaneously:
  Path1: "Today the weather is great" (cumulative prob: 0.45×0.6 = 0.27)
  Path2: "Today the weather is bad" (cumulative prob: 0.30×0.7 = 0.21)
  Path3: "Today the weather is clear" (cumulative prob: 0.15×0.8 = 0.12)
→ Select path with highest cumulative probability
```
Mainly used for translation, summarization, etc. Low creativity.

## Role in AI Engineering

Sampling Controls are **core parameters that determine the quality characteristics** of LLM applications. A customer service bot (low Temperature) and a creative tool (high Temperature) have entirely different output characteristics even with the same model. Before production deployment, optimal parameters for each task should be determined through experimentation.

---

## Trend of Temperature Restrictions in Recent Models (2025~2026)

Recently, major LLM providers are moving toward **prohibiting or strongly discouraging** user adjustment of sampling parameters including Temperature in their latest models.

### OpenAI

**Reasoning models (o1, o3) series**: temperature, top_p, n are fixed at 1 and cannot be changed. Passing values returns an API error [1].

```
# Error example
openai.BadRequestError: temperature is not supported with this model (o3)
```

**GPT-5**: Temperature adjustment is no longer allowed; automatically set to 1.0 for all prompts [2].

**Realtime API**: Temperature parameter completely removed from GA interface. Beta interface limited to 0.6~1.2 range (default 0.8) [3].

### Anthropic Claude

**Claude Opus 4.7 (from May 2026)**: Passing non-default values for temperature, top_p, top_k returns an **HTTP 400 error** [4][5].

```python
# No longer works (Claude Opus 4.7)
client.messages.create(
    model="claude-opus-4-7",
    temperature=0.7,   # → 400 Bad Request
    top_p=0.9,         # → 400 Bad Request
)
# Recommended: Remove the parameters entirely
```

Official migration guide recommendation: "Remove parameters and replace behavior adjustment with prompts" [6].

**Claude 4.5**: temperature and top_p cannot both be specified. Returns `temperature and top_p cannot both be specified` error.

### Google Gemini

**Gemini 3.x series**: Has not officially deprecated temperature, but **strongly recommends maintaining the default (1.0)**. Official documentation states that changing it can cause unpredictable behavior such as looping or degraded reasoning performance [7].

```
"setting temperature below 1.0 can cause unexpected behavior,
such as looping or degraded performance, particularly in
complex mathematical or reasoning tasks"
— Google Gemini API official documentation
```

### Why This Restriction

| Reason | Explanation |
|------|------|
| **Pre-optimized sampling** | Latest models are already internally optimized via RLHF, Constitutional AI, etc., making additional adjustment unnecessary or counterproductive |
| **Reasoning stability** | Reasoning models perform Chain-of-Thought internally; low temperature eliminates exploration diversity, high temperature breaks logical consistency |
| **Safety degradation risk** | Setting temperature to extreme values can disrupt safety filter balance |
| **Illusion of deterministic output** | `temperature=0` doesn't guarantee fully deterministic output, and the trend is to remove it entirely to prevent this misconception |

### Practical Recommendation

When using latest models, **remove sampling parameters from requests** and replace output style adjustments with System Prompt or instructions.

```python
# Old approach (may cause errors in latest models)
response = client.messages.create(
    model="claude-opus-4-7",
    temperature=0.3,
    messages=[{"role": "user", "content": "Write code"}]
)

# Currently recommended approach
response = client.messages.create(
    model="claude-opus-4-7",
    system="Answer accurately and concisely. Omit unnecessary explanations.",
    messages=[{"role": "user", "content": "Write code"}]
)
```

## Related Concepts
[[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]] · [[en/AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]

## Sources
- Holtzman et al. (2020) "The Curious Case of Neural Text Degeneration (Top-P)" — [arXiv:1904.09751](https://arxiv.org/abs/1904.09751)
- Anthropic API documentation — [docs.anthropic.com](https://docs.anthropic.com/en/api/getting-started)
- "Give Me BF16 or Give Me Death: Accuracy-Performance Trade-Offs" (2024) — [arXiv:2411.02355](https://arxiv.org/pdf/2411.02355)
1. OpenAI Community: "temperature is not supported with this model (o3)" — [github.com/openai/openai-python/issues/2104](https://github.com/openai/openai-python/issues/2104)
2. OpenAI Community: "Temperature in GPT-5 models" — [community.openai.com](https://community.openai.com/t/temperature-in-gpt-5-models/1337133)
3. OpenAI Developer Blog: "Developer notes on the Realtime API" — [developers.openai.com](https://developers.openai.com/blog/realtime-api)
4. LaoZhang AI Blog: "Claude Opus 4.7 Temperature Parameter: Remove It, Do Not Retune It" — [blog.laozhang.ai](https://blog.laozhang.ai/en/posts/claude-opus-4-7-temperature-parameter)
5. Zenn: "A Summary of Breaking Changes in Claude Opus 4.7" — [zenn.dev](https://zenn.dev/knowledge_graph/articles/claude-opus-47-breaking-changes?locale=en)
6. Anthropic: "Migration guide" — [platform.claude.com/docs/en/about-claude/models/migration-guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide)
7. Google AI: "Gemini API — Content generation parameters" — [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs/gemini-3)
