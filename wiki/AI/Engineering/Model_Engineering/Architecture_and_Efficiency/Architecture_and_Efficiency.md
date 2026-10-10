---
order: 0
---

# Architecture and Efficiency (아키텍처와 효율)

## 개요

**Architecture and Efficiency**는 모델이 입력을 얼마나 효율적으로 표현하고 연산하는지를 결정하는 구조적 선택을 다룬다. Tokenization은 텍스트를 모델이 처리할 단위로 바꾸는 첫 단계이고, Model Architectures and MoE는 Dense/MoE와 롱컨텍스트 구조로 지식 용량과 토큰당 비용을 결정하며, Quantization은 학습이 끝난 가중치를 더 적은 비트로 압축해 서빙 비용을 낮춘다. 셋 모두 모델이 "무엇을 배우는가"가 아니라 "그것을 어떻게 담고 계산하는가"를 다룬다는 공통점이 있다.

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Tokenization\|Tokenization]] | BPE/WordPiece/SentencePiece, 어휘 크기 트레이드오프, 다국어·한국어 토큰 효율 |
| [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Model_Architectures_and_MoE\|Model_Architectures_and_MoE]] | Dense vs MoE, RoPE/YaRN 롱컨텍스트, SLM-for-Agents |
| [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Quantization\|Quantization]] | INT8/INT4 양자화, GPTQ/AWQ/GGUF |

## 관련 개념
[[AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[AI/Engineering/Model_Engineering/Model_Types/Model_Types|Model Types]] · [[AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training and Tuning]] · [[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving_Engineering]]
