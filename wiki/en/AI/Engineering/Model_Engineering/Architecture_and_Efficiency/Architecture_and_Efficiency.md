---
order: 0
---

# Architecture and Efficiency

## Overview

**Architecture and Efficiency** covers the structural choices that determine how efficiently a model represents and computes inputs. Tokenization is the first step of converting text into units that the model can process, while Model Architectures and MoE determine the knowledge capacity and cost per token through Dense/MoE and long-context structures, and Quantization reduces serving costs by compressing the trained weights into fewer bits. All three share the commonality of dealing with "how it is stored and computed" rather than "what it learns."

## Sub-documents

| Document | Content |
|------|------|
| [[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Tokenization\|Tokenization]] | BPE/WordPiece/SentencePiece, vocabulary size trade-off, multilingual/Korean token efficiency |
| [[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Model_Architectures_and_MoE\|Model_Architectures_and_MoE]] | Dense vs MoE, RoPE/YaRN long context, SLM-for-Agents |
| [[en/AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Quantization\|Quantization]] | INT8/INT4 quantization, GPTQ/AWQ/GGUF |

## Related Concepts
[[en/AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[en/AI/Engineering/Model_Engineering/Model_Types/Model_Types|Model Types]] · [[en/AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training and Tuning]] · [[en/AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]]
