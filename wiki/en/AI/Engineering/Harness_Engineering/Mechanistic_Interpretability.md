---
order: 9
---

# Mechanistic Interpretability

## Overview

**Mechanistic Interpretability** is the research field that goes beyond observing a model's input-output behavior to directly **reverse-engineer the model's internal computational mechanisms (circuits, features)**, explaining "why the model produced this particular answer." Where [[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]] observes and tests behavior to infer the possibility of misalignment, Mechanistic Interpretability opens up the internal computation that produces that behavior.

## Background: The Polysemanticity and Superposition Problem

Early attempts to interpret neural networks at the individual-neuron level ran into a fundamental obstacle.

```
Polysemanticity:
  A single neuron simultaneously encodes multiple unrelated concepts
  Example: neuron #4821 fires for "cats," "car parts," and "French grammar" alike

Superposition:
  To represent far more concepts than the model has dimensions,
  many concepts are stored overlapping within the same neuron space

Result: looking at individual neurons doesn't reveal "what this neuron represents"
       → a more fundamental unit of analysis is needed
```

## Sparse Autoencoders (SAE)

A technique that decomposes activations into more **monosemantic** units to address this problem.

- **Anthropic "Towards Monosemanticity" (2023)**: Showed that decomposing a small model's activations with an SAE yields many "features" — directions corresponding clearly to a single concept, such as "Arabic text," "DNA sequences," or "legal terminology" — that are far easier to interpret than individual neurons
- **Anthropic "Scaling Monosemanticity" (2024)**: Scaled this technique to a real production model (Claude 3 Sonnet), extracting millions of interpretable features — widely known for the "Golden Gate Claude" demonstration, where artificially activating the "Golden Gate Bridge" feature made the model insist it was the Golden Gate Bridge

```
How it works (simplified):
  Model activations (dense, low-dimensional) → SAE encoder → sparse, high-dimensional feature vector
                                                              (mostly zero, few active)
  → Each active feature is trained to correspond to a single, human-interpretable concept
```

## Circuit Tracing (Anthropic, March 2025)

Beyond finding individual features with SAEs, this methodology traces how features connect across layers to produce the final output — i.e., **circuits**.

- **Core technique**: Replaces the model's MLPs with a new type of SAE called a **Cross-Layer Transcoder (CLT)**, constructing a "replacement model" that behaves similarly to the original but whose internals are composed of sparse, interpretable features
- **Output**: An attribution graph visualizing which features information flows through from input to output — for example, actually observing a multi-step reasoning circuit where the model answers "what state is the capital of the city containing Dallas?" by flowing through a "Dallas → Texas" feature and then a "Texas → Austin" feature
- **Open-sourced (May 2025)**: Researchers released an interactive visualization tool for exploring attribution graphs directly
- **"On the Biology of a Large Language Model" (2025)**: Uses Circuit Tracing to analyze internal mechanisms behind planning, multi-step reasoning, and even cases where the model "confabulates" facts, through a series of case studies

## Recognition as a Field

```
"Open Problems in Mechanistic Interpretability" (January 2025):
  Co-authored by 29 researchers from 18 institutions — a survey mapping the
  field's goals and open problems
  → A signal that the field has matured beyond isolated lab-level research
    into an independent discipline

MIT Technology Review "2026 Breakthrough Technologies":
  Named Mechanistic Interpretability as one of the year's major breakthrough
  technologies
```

## Practical Connections to AI Engineering

- **Activation Steering**: Finding the direction corresponding to a specific feature (e.g., a topic, tone, or safety-related concept) and adding or subtracting it directly from activations, steering model behavior in real time without fine-tuning — a different axis of intervention than [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]]'s runtime filters (adjusting the generation process itself rather than post-hoc censoring output)
- **Hallucination and deception detection**: When a model internally "knows" it doesn't know something but confabulates a plausible answer anyway, this inconsistency may be catchable at the level of internal features — a signal fundamentally invisible to purely output-based evaluation ([[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]])
- **A complement to the fundamental limits of alignment verification**: deceptive models that "behave normally during evaluation and only differ during actual deployment," as covered by [[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]]'s Sleeper Agents and Alignment Faking, are fundamentally hard to detect through behavioral observation alone. Directly inspecting internal mechanisms is considered one of the few potential means of catching this kind of deception

## Role in AI Engineering

Mechanistic Interpretability is still closer to **foundational research seeking a fundamental way to trust models** than a tool routinely integrated into production pipelines today. But as Circuit Tracing tools are open-sourced and practical applications like Activation Steering grow, it is establishing itself as one pillar of defense-in-depth — complementing behavior-observing layers like guardrails and evaluation, which alone cannot catch certain kinds of misalignment.

## Related Concepts
[[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]

## Sources
- Anthropic (2023) "Towards Monosemanticity: Decomposing Language Models With Dictionary Learning" — [transformer-circuits.pub](https://transformer-circuits.pub/2023/monosemantic-features)
- Anthropic (2024) "Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet" — [transformer-circuits.pub](https://transformer-circuits.pub/2024/scaling-monosemanticity/)
- Anthropic (2025-03) "Circuit Tracing: Revealing Computational Graphs in Language Models" — [transformer-circuits.pub](https://transformer-circuits.pub/2025/attribution-graphs/methods.html)
- Anthropic (2025) "On the Biology of a Large Language Model" — [transformer-circuits.pub](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)
- "Open Problems in Mechanistic Interpretability" (2025) — [arXiv:2501.16496](https://arxiv.org/abs/2501.16496)
- MIT Technology Review "10 Breakthrough Technologies 2026" — [technologyreview.com](https://www.technologyreview.com/)
