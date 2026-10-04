---
order: 12
---

# Hallucination & Grounding

## Overview

**Hallucination** is when an LLM generates content that is plausible but factually wrong or unsupported by the evidence it was given. It stems from models being trained and evaluated to "fill gaps with a guess instead of saying they don't know," so it is not fully eliminated at the [[en/AI/Engineering/Model_Engineering/Model_Engineering|model level]]; in production it is treated as a problem for a **detection-and-blocking system layer**.

Where [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] covers quality evaluation in general and [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] covers input/output blocking infrastructure, this document covers the **single question running on top of them — "is each claim in this answer supported by evidence?"** — and the techniques to measure and enforce it.

## Taxonomy

| Type | Definition | Example |
|------|------------|---------|
| **Intrinsic (faithfulness violation)** | Output that **contradicts** the given source | Document says "2023"; summary says "2021" |
| **Extrinsic (factuality violation)** | Output that **cannot be verified** from the source or conflicts with world knowledge | Citing a nonexistent paper or API |

In RAG systems the measured target is mainly **faithfulness** (does the answer stay true to the retrieved context); for open-ended queries with no context it is **factuality**. The detection techniques differ: the former checks against the source, the latter uses the model's own signals (consistency, uncertainty) or external knowledge.

## Why It Happens

- **Evaluation incentives**: benchmarks that score correct answers and give zero for "I don't know" reward guessing. OpenAI researchers analyze this as a structural cause of hallucination [4].
- **Out-of-distribution questions**: for long-tail facts that are rare in training data, plausible pattern completion replaces factual recall.
- **Context contamination**: if retrieval is wrong or irrelevant, the model faithfully reflects it and produces a "grounded wrong answer" — this includes missing evidence in long contexts, as in [[en/AI/Engineering/Context_Engineering/Lost_in_the_Middle|Lost in the Middle]].

## Detection Techniques

### 1. Groundedness Verification (per claim)

Decompose the answer into **atomic claims** and judge, with an NLI model or a judge LLM, whether each claim is entailed by the retrieved context. FActScore [3] established this decompose-and-verify approach. Compared with sentence-level judgments it can **localize the problem at span level**, so the UI can mark "this part is unsupported" or regenerate only that sentence. Judges include lightweight dedicated classifiers such as Vectara HHEM and the RAGAS faithfulness metric (→ [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]).

### 2. Sampling Consistency (Self-consistency family)

Sample the same question several times; if answers fluctuate, hallucination is more likely. **SelfCheckGPT** [2] produces per-sentence hallucination scores from this idea alone, with no external knowledge. Limitations are cost (N× calls) and that it misses cases where the model is **consistently wrong**.

### 3. Semantic Entropy

Cluster answers that **mean the same thing**, then compute the entropy of that distribution rather than of surface strings. Farquhar et al. (Nature, 2024) [1] avoided mistaking differently-worded identical answers for uncertainty, improving detection of arbitrary wrong answers (confabulations) over naive token entropy. It costs sampling, but is considered the most principled signal for "questions the model truly doesn't know."

### 4. Token Probabilities and Internal Signals

Logprob-based confidence is cheap but **calibration is not guaranteed** — calibration techniques and ECE measurement are covered in [[en/AI/Engineering/Model_Engineering/Decision_Models|Decision Models]]. White-box probes that read internal representations extend [[en/AI/Engineering/Harness_Engineering/Mechanistic_Interpretability|Mechanistic Interpretability]].

## Prevention Techniques

- **RAG-first**: design so the model does not answer without retrieved context → [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]], plus CRAG/Self-RAG in [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG|Agentic RAG]] for retrying when retrieval quality is low
- **Mandatory citation**: require a source span ID on every claim, guarantee format with a [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]] schema, then verify afterward that the cited span actually supports the claim (ALCE [5] provides citation-quality criteria).
- **Allow abstention**: accept "insufficient evidence" as a normal output in both prompts and eval sets. Evaluations that penalize abstention increase hallucination.
- **Delegate to tools**: hand deterministic answers — arithmetic, dates, DB lookups — to [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] rather than relying on model memory.

## Production Stack

```
1. Deterministic checks   schema validation, citation ID exists, banned patterns (cost ≈ 0)
2. Confidence triage      logprob / lightweight classifier selects suspicious responses
3. Grounding check        claim-level entailment on suspicious responses only (expensive)
4. Threshold policy       route to: pass / regenerate / abstain / human review
```

Running step 3 on every response blows up cost, so the point is to **filter with cheap signals and apply expensive verification only to suspicious responses**. Tune thresholds to domain risk (conservative for medical and legal), and log blocked responses to [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]] to feed them back into offline eval sets.

## Boundaries

| Document | Covers |
|----------|--------|
| [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge\|LLM-as-a-Judge]] | General quality evaluation (relevance, tone, accuracy), judge bias |
| [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering\|Guardrail Engineering]] | Input/output blocking infrastructure (NeMo, LlamaGuard), safety and policy violations |
| [[en/AI/Engineering/Model_Engineering/Decision_Models\|Decision Models]] | Decision-style models and probability calibration |
| **This document** | "Is the claim supported by evidence?" — detection, prevention, policy |

## Related Concepts
[[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Model_Engineering/Decision_Models|Decision Models]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]] · [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]]

## Sources
- [1] Farquhar et al. (2024) "Detecting hallucinations in large language models using semantic entropy" — Nature 630, 625–630, [nature.com](https://www.nature.com/articles/s41586-024-07421-0)
- [2] Manakul et al. (2023) "SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection" — [arXiv:2303.08896](https://arxiv.org/abs/2303.08896)
- [3] Min et al. (2023) "FActScore: Fine-grained Atomic Evaluation of Factual Precision" — [arXiv:2305.14251](https://arxiv.org/abs/2305.14251)
- [4] Kalai et al. (2025) "Why Language Models Hallucinate" — [arXiv:2509.04664](https://arxiv.org/abs/2509.04664)
- [5] Gao et al. (2023) "Enabling Large Language Models to Generate Text with Citations (ALCE)" — [arXiv:2305.14627](https://arxiv.org/abs/2305.14627)
- Ji et al. (2023) "Survey of Hallucination in Natural Language Generation" — ACM Computing Surveys, [arXiv:2202.03629](https://arxiv.org/abs/2202.03629)
