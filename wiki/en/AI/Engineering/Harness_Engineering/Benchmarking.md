---
order: 4
---

# Benchmarking

## Overview

**Benchmarking** is an evaluation methodology that uses standardized test sets to measure LLM capabilities and enable objective comparison between models. While there are limitations to summarizing complex LLM capabilities in a single number, it is essential for setting community standards and tracking progress.

## Major Benchmarks

### MMLU (Massive Multitask Language Understanding)
- **Authors**: Hendrycks et al. (2021)
- **Content**: 57 subjects × 15,000+ multiple choice questions (elementary math to professional law and medicine)
- **Measures**: General world knowledge + problem-solving ability
- **Scores**: GPT-3.5 ~70%, GPT-4 ~87%, Claude 3 Opus ~86%

```
Subject examples:
  Elementary/Middle/High school math, US History, Computer Science
  Law, Medicine, Physics, Psychology, Economics — 57 fields total
  → Most cited benchmark for measuring a language model's "education level"
```

### HumanEval
- **Authors**: Chen et al., OpenAI (2021)
- **Content**: 164 Python function writing problems (docstring → code generation)
- **Measures**: Coding ability (pass rate = pass@k)
- **Feature**: Objective correct/incorrect determination via unit tests

```python
# HumanEval problem example
def has_close_elements(numbers: List[float], threshold: float) -> bool:
    """Check if in given list of numbers, are any two numbers closer to each other
    than given threshold.
    
    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    False
    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    True
    """
    # Model must write this function body
```

**pass@k metric**: Probability that at least one of k generations passes the test

### HellaSwag
- **Authors**: Zellers et al. (2019)
- **Content**: Everyday situation next-sentence selection (4-choice)
- **Measures**: Common sense reasoning
- **Feature**: Wrong choices designed to be statistically plausible (to confuse AI)

```
Situation: "He went out to the lawn with a hose."
Correct: "He started watering the flower bed."
Wrong: "He jumped out of the car." (statistically plausible but contextually wrong)
```

### GSM8K
- 8,500 elementary to middle school math word problems
- Frequently used for Chain-of-Thought evaluation
- GPT-4 achieves 95%+ accuracy

### MATH
- High school to college mathematics competition problems
- Includes calculus, linear algebra, probability
- Very hard (even GPT-4 scores ~40~50%)

### GPQA (Graduate-level Google-Proof Q&A)
- Problems difficult even for PhD-level experts (biology, chemistry, physics)
- Measures deep expertise "not easily found by Googling"

### SWE-bench
- Real GitHub issue resolution benchmark
- Measures LLM ability to fix actual code bugs
- Claude 3.5 Sonnet achieved 49% in 2024 (first in the industry)

## Agent-Specific Benchmarks

| Benchmark | Measures |
|-----------|---------|
| **BFCL** | Function Calling accuracy |
| **τ-bench** | Real business automation tasks |
| **WebArena** | Web browser automation |
| **OSWorld** | OS-level task execution |
| **GAIA** | General AI assistant capabilities |
| **AgentBench** | Multi-environment agent capabilities |

### GAIA (General AI Assistants)

Jointly developed by Meta, HuggingFace, and others. Consists of 466 real-world questions that are **easy for humans but difficult for AI** — requiring multi-step web search, file processing (PDF, spreadsheet, image), and tool combination.

```
3 difficulty levels:
  Level 1: Under 5 steps of reasoning, minimal tool use
  Level 2: 5~10 steps, multiple tool combinations needed
  Level 3: Arbitrary length planning, extensive tool use

Feature: Answers are clear and verifiable (fact-based, short answer)
         yet require multi-step reasoning "not directly searchable on Google"
         → Measures "agent problem-solving ability" not just pure knowledge recall
```

GAIA is famous for revealing the gap between agentic tool-use ability and pure language ability — human evaluators scored 92% while GPT-4 (without tools) scored only 15%.

### AgentBench

Developed by Tsinghua University et al. A benchmark suite that comprehensively measures LLM agent reasoning and decision-making across **8 different environments** (OS, DB, Knowledge Graph, Digital Card Game, Grid World, Web Shopping, Web Browsing, SQL).

```
AgentBench's 8 environment types:
  Operating System · Database · Knowledge Graph
  Digital Card Game · House-holding (grid world)
  Web Shopping · Web Browsing · SQL

Measurement goal: "Generalization across diverse environments" not single-task
                  → Verify whether an agent specialized in one environment also works in others
```

Both GAIA and AgentBench fall under the "static benchmarks" layer covered in [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]] — actual product evaluation also needs complementary custom offline and online evaluation.

## Benchmark Limitations

### 1. Data Contamination
Performance overestimated when test questions are included in training data:
```
LLM training data: web crawl up to 2021
MMLU released: 2020 → some questions may be in training data
→ Difficult to distinguish "memorized" from "understood"
```

### 2. Simple Benchmark Optimization (Goodhart's Law)
"When a measure becomes a target, it ceases to be a good measure":
```
Model trained specifically for MMLU → high MMLU but diverges from actual capability
```

### 3. Narrow Measurement Scope
Composite capabilities like multimodal, long context, code execution are hard to measure with a single benchmark.

### 4. Rapid Saturation
Latest models nearly saturate existing benchmarks:
- MMLU: Top models converging in the 85~90% range
- HellaSwag: Top models 95%+ → no longer discriminating

## Practical Benchmark Selection Strategy

```python
# 1. Task-specific benchmarks first
"Code generation service" → HumanEval, SWE-bench
"Math education service" → MATH, GSM8K
"Medical AI" → MedQA, USMLE
"General QA" → MMLU, TriviaQA

# 2. Build internal golden set
internal_test_set = [
    {"input": actual_user_query, "expected": expert_written_answer}
    for sample in production_samples
]
# → Evaluation reflecting actual use cases

# 3. Periodic re-evaluation
weekly_benchmark_run = schedule(
    evaluate_model(internal_test_set + standard_benchmarks),
    cron="0 0 * * 1"  # every Monday
)
```

## Role in AI Engineering

Benchmarking provides **objective criteria for model selection, prompt optimization, and fine-tuning effectiveness measurement**. The dual strategy of comparing models with community-recognized benchmarks while measuring actual production performance with internal domain-specific tests is recommended.

## Related Concepts
[[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/Engineering/Harness_Engineering/Human_Evaluation|Human Evaluation]] · [[en/AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench|Eval-Driven Development & Agent Workbench]] · [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]]

## Sources
- Hendrycks et al. (2021) "MMLU" — [arXiv:2009.03300](https://arxiv.org/abs/2009.03300)
- Chen et al. (2021) "HumanEval" — [arXiv:2107.03374](https://arxiv.org/abs/2107.03374)
- Mialon et al. (Meta/HuggingFace, 2023) "GAIA: A Benchmark for General AI Assistants" — [arXiv:2311.12983](https://arxiv.org/abs/2311.12983)
- Liu et al. (Tsinghua, 2023) "AgentBench: Evaluating LLMs as Agents" — [arXiv:2308.03688](https://arxiv.org/abs/2308.03688)
