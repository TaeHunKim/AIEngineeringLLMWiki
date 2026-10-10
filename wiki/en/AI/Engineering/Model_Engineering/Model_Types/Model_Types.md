---
order: 0
---

# Model Types

## Overview

Classifying models by "what they take as input and what they output" clarifies the criteria for selection, evaluation, and serving. The four axes distinguished in this wiki are **LLMs** and **Multimodal Models** (VLMs) that generate token sequences, **Embedding Models** and **Multimodal Embedding Models** that output vectors, and **Decision Models** that return only probabilities adjusted for options, scales, or propositions. Even when using the same Transformer backbone, different output forms lead to entirely different points for applying training methods ([[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training_and_Tuning]]) and structural choices ([[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Architecture_and_Efficiency|Architecture_and_Efficiency]]).

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Model_Engineering/Model_Types/Large_Language_Models\|Large_Language_Models]] | Decoder-only Transformer-based general generation model — base/instruct/reasoning, open/closed weight |
| [[en/AI/Engineering/Model_Engineering/Model_Types/Multimodal_Models\|Multimodal_Models]] | VLM architecture (adapter-based vs native), image tokenization, audio/video, MMMU/DocVQA |
| [[en/AI/Engineering/Model_Engineering/Model_Types/Embedding_Models\|Embedding_Models]] | Embedding/Reranker models themselves — Bi/Cross-encoder/Late Interaction, Matryoshka, MTEB |
| [[en/AI/Engineering/Model_Engineering/Model_Types/Multimodal_Embeddings\|Multimodal_Embeddings]] | Multimodal embedding models — alignment learning, modality gap, EmbeddingGemma 2 · Gemini Embedding 2 |
| [[en/AI/Engineering/Model_Engineering/Model_Types/Decision_Models\|Decision_Models]] | System One Models such as Jev · OpenAI Decisions · Microsoft-Decision-1, Choice/Score/Noul primitives, logprob wrapper vs trainable, calibration (ECE) |

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training and Tuning]] · [[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Architecture_and_Efficiency|Architecture and Efficiency]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies]]
