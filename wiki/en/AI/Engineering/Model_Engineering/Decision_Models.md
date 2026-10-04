---
order: 10
---

# Decision Models (System One Models)

## Overview

A **Decision Model** is a discriminative model that does not generate text. Given user-specified options, scales, or statements, it returns only **typed values together with probabilities and confidence scores**. Its purpose is to strip the long output, high latency, and unstable formatting of generative LLMs out of tasks where the job is to look at a short input and quickly pick one answer: classification, routing, scoring, and filtering.

When TypeSafe AI released **Jev** in September 2026, the category began to be called "System One Models" (a name borrowed from Kahneman's fast, intuitive thinking). Open-weight projects then rapidly produced reproductions in three forms: (a) newly trained models, (b) existing LLMs tuned with a head or LoRA, and (c) wrappers that simply read an existing LLM's next-token **logprobs**. None of the ideas is new on its own (NLI-based zero-shot classification, scoring options from logits). What is new is delivering **zero-shot flexibility, calibrated probabilities, and a type-safe API** as one package.

Where [[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured_Output]] is about fitting generated text to a schema, this document covers **a model class that never generates text in the first place**.

## Generative vs Discriminative

| Aspect | Generative LLM (System Two style) | Decision Model (System One style) |
|--------|-----------------------------------|-----------------------------------|
| Output | Free text → parsing | Per-option probabilities / scores / true-probability |
| Inference | Sequential token decoding (incl. CoT) | One prefill pass, no decoding |
| Latency / cost | Scales with output token count | Typically billed on input tokens only |
| Format errors | Possible (retries needed) | Values outside the options are structurally impossible |
| Explanation | Can provide reasoning | No rationale — probabilities only |
| Best suited for | Complex reasoning, generation, explanation | Routing, classification, moderation, scoring |

## Jev

TypeSafe AI's Jev (early access released 2026-09-15) exposes **three question primitives**.

| Primitive | Input | Returns |
|-----------|-------|---------|
| **Choice** | State + list of options | Probability per option |
| **Score** | State + ordered scale | Probability/score per scale level |
| **Noul** | State + true/false statement | Probability that the statement is true (0–1) |

Multiple questions can be sent in parallel in one request, and responses are schema-constrained so **values outside the options cannot occur**. Training is reported to use synthetic data and **RLCD** (Reinforcement Learning for Calibrated Decisions), which optimizes **the accuracy of stated probabilities against outcomes** (a higher stated probability should mean a higher hit rate) rather than human preference. The architecture and a technical report have not been published.

TypeSafe's self-reported figures are 70–500ms responses, $0.042 per million input tokens (output free), and 40–400x cheaper and 40–200x faster than frontier LLMs. These numbers come from **the vendor's own benchmarks** and should be read as near-best-case results.

## Lineage

```mermaid
flowchart LR
    NLI["NLI-based zero-shot classification<br/>(BART-MNLI etc.)<br/>labels rewritten as hypothesis sentences"] --> LT["Lightweight label-aware encoders<br/>GLiNER / GLiClass / SetFit"]
    NLI --> LP["LLM logprob classification<br/>read next-token probabilities of option tokens"]
    LT --> DM["Decision Model<br/>Choice / Score / Noul<br/>+ calibrated probabilities + type-safe API"]
    LP --> DM
```

## Four Implementation Approaches

| Approach | Method | Examples | Calibration | Notes |
|----------|--------|----------|-------------|-------|
| **Trained Decision Model** | Attach a decision head to an encoder/LLM, LoRA-tune it, or train from scratch | Laya (ModernBERT-based), Kev (Qwen3.5 LoRA + pointer head), NanoJev (0.6B scratch), pplx-decider / Clef (27B class) | Some report post-hoc calibration such as temperature scaling | Whether training code and data are released varies by project |
| **Logprob wrapper** | Model stays frozen. List options in the prompt and softmax the option-token logits | mini-jev (Qwen3-4B), SemIf, openjev-sglang (prefill-only server) | Most **make no calibration claim** | No retraining needed; can be sensitive to option order |
| **Classic zero-shot classifier** | An NLI model or label-aware encoder takes labels at runtime | NLI-head models, GLiClass, SetFit (few-shot) | Scores are often not calibrated probabilities | Runs on CPU; suited to short-input classification |
| **Structured output library** | Constrain any LLM's output to a schema or grammar | Outlines, Instructor, DSPy | Not applicable (no probabilities) | Types are guaranteed, but no calibrated confidence |

The project list above is a snapshot as of October 2026, and most are newly created projects only a few weeks old. Performance and license claims for individual projects should be verified directly before adoption.

### Minimal Logprob Wrapper

The simplest way to imitate the Choice primitive with an existing open-weight LLM. Attach letter labels to the options, then take **only the label tokens' logits from the next-token distribution** at the answer position and softmax them.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "Qwen/Qwen3-4B-Instruct"  # Example model — replace with an instruct model you can actually use
tok = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16)

def choose(state: str, question: str, options: list[str]) -> dict[str, float]:
    labels = [chr(ord("A") + i) for i in range(len(options))]
    listing = "\n".join(f"{l}. {o}" for l, o in zip(labels, options))
    prompt = f"{state}\n\n{question}\n{listing}\nAnswer with a single letter.\nAnswer:"

    ids = tok(prompt, return_tensors="pt")
    with torch.no_grad():
        logits = model(**ids).logits[0, -1]  # Next-token logits at the last position (no decoding)

    # Keep only the label token ids and softmax → values outside the options are structurally impossible
    label_ids = [tok.encode(" " + l, add_special_tokens=False)[-1] for l in labels]
    probs = torch.softmax(logits[label_ids].float(), dim=-1)
    return dict(zip(options, probs.tolist()))
```

This approach has three limitations. ① The **order and label bias** (position bias) of the options in the prompt leaks into the probabilities. ② Softmax only normalizes within the options, so the result is **relative dominance among options, not the probability of being correct**. ③ Without separate calibration it tends toward over-confidence. Order bias can be reduced by shuffling the options and averaging over several runs, and some projects claim to guarantee option-order invariance by design.

## Calibration

The value of a Decision Model lies less in accuracy than in **whether the probabilities can be trusted enough to put a threshold on them**.

- **ECE** (Expected Calibration Error): the average gap between predicted confidence and actual hit rate per confidence bin. Lower is better calibrated.
- **Brier score**: squared error between probabilistic predictions and outcomes. Reflects accuracy and calibration together.
- **Temperature scaling**: learn a single temperature on the logits using a small validation set for post-hoc calibration. Used with both logprob wrappers and trained models; one project reports ECE dropping from 0.466 to 0.081.
- **Pitfall**: the probability is often merely "concentration of the distribution", not "likelihood of being correct". Using the confidence of a wrapper that makes no calibration claim directly as a threshold is risky.

This problem shares a root with the score inconsistency of LLM rerankers ([[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced_Retrieval]]) and the uncertainty estimation in cascade routing ([[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity_Aware_Model_Routing]]).

## Independent Evaluation of Jev (Deußer et al., 2026)

A University of Bonn team evaluated Jev v1.13.0 on 37 public datasets (sentiment, intent/topic, NLI, reading comprehension, commonsense reasoning, safety/moderation, rubric scoring). The baselines were the open-weight Qwen3.8-27B and Gemma-4-E4B, using **their next-token probabilities read directly** (i.e. the logprob wrapper approach).

| Item | Result |
|------|--------|
| Accuracy | Ahead of Qwen on 27 of 37 datasets, ahead of Gemma on all |
| Choice probability calibration | Pooled ECE 0.028 across 22 datasets — good |
| Noul (true/false) probability | Slightly under-confident → lower recall, ranking metric (AUROC) still good |
| Multi-label | Over-predicts positives (mean probability 0.209 vs actual 0.041). Tuning thresholds on 1,000 training examples improves F₁ substantially |
| Weaknesses | Low-resource languages, noisy labels, fine-grained 5-class sentiment, legal judgments needing domain knowledge, rubric scoring of generated text |
| Caveat | Anomalous pattern on MMLU calculation subjects → the authors could not rule out data contamination |

The authors state as limitations that the open models were scored in a single pass without reasoning, so their performance may be understated, and that the results are specific to one version (1.13.0).

## Usage Patterns

```mermaid
flowchart TD
    IN["Input (trace, request, document)"] --> DM["Decision Model<br/>returns probabilities"]
    DM -->|"probability ≥ threshold"| AUTO["Automatic handling<br/>(routing, filtering, approval)"]
    DM -->|"uncertain band"| ESC["Larger model / LLM judge / human<br/>(selective prediction)"]
```

- **Routing and intent classification**: decide which tool, model, or workflow to send a request to at the front of an agent. Escalate to a larger model when probability is low.
- **Moderation and guardrails**: judge whether input/output violates policy using Noul.
- **Exhaustive eval + sampled deep review**: run the cheap judgment on every trace and send only a sample to an LLM judge for careful review. Arize notes that Jev cannot fully replace an LLM judge (no rationale, accuracy slightly behind frontier models) and recommends this kind of hybrid.
- **Selective prediction**: use calibrated probabilities to split "bands to handle automatically" from "bands to hand to a human" via thresholds.

## Boundary Summary

| Document | Covers |
|----------|--------|
| **This document (Decision_Models)** | A model class that **returns calibrated probabilities** without generating text, and its implementation approaches |
| [[en/AI/Engineering/Prompt_Engineering/Structured_Output\|Structured_Output]] | Fitting a generative LLM's output to a schema — types guaranteed, no probabilities |
| [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge\|LLM_as_a_Judge]] | A generative LLM evaluating with rationale — slower and costlier but explainable |
| [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/Embedding_Models\|Embedding_Models]] | Pair-scoring models such as cross-encoders — discriminative models specialized for retrieval relevance |
| [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing\|Complexity_Aware_Model_Routing]] | Strategies for choosing a model by difficulty — a Decision Model can serve as the router itself |
| [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering\|Guardrail_Engineering]] | Designing input/output safety controls — a Decision Model is a candidate classifier for them |

## Role in AI Engineering

A Decision Model is a component that replaces the "short judgment" calls scattered through agent and RAG pipelines (routing, relevance checks, policy checks, evaluation scoring) with **low-latency, low-cost, calibrated probabilities**. However, it cannot replace the reasoning and explanation abilities of a generative LLM, so it must be designed together with a structure that hands uncertain cases outside the threshold to a larger model or a human. Before adoption, it is essential to **measure calibration (ECE) and threshold performance yourself on your own domain data**.

## Related Concepts
[[en/AI/Engineering/Prompt_Engineering/Structured_Output|Structured_Output]] · [[en/AI/Engineering/Harness_Engineering/Harness_Evaluation/LLM_as_a_Judge|LLM_as_a_Judge]] · [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail_Engineering]] · [[en/AI/Engineering/Loop_Engineering/Cost_Engineering/Complexity_Aware_Model_Routing|Complexity_Aware_Model_Routing]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/Embedding_Models|Embedding_Models]] · [[en/AI/Engineering/Model_Engineering/Model_Distillation|Model_Distillation]]

## Sources
- Deußer, Sparrenberg, Sifa (2026) "Evaluating and Benchmarking the System One Model Jev" — [arXiv:2609.37647](https://arxiv.org/html/2609.37647v1)
- Arize, "TypeSafe Jev: Can Decision Models Replace LLM Judges?" — [arize.com](https://arize.com/blog/typesafe-jev-llm-judge/)
- Glean, "Jev and the return of the zero-shot classifier" — [glean.com](https://www.glean.com/blog/jev-zero-shot-classifier)
- "Jev (AI model)" — [Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))
- systemonemodels.org, "Jev alternatives: open-source reproductions, local models and classifiers" — [systemonemodels.org](https://systemonemodels.org/examples/alternatives/) (community-curated — re-verify per-project figures in each repo)
