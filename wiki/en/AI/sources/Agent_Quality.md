# Agent Quality

## Metadata
- **File Name**: `Agent Quality.pdf`
- **Authors**: Meltem Subasioglu, Turan Bulmus, Wafae Bakkali (Google) — Contributors: Anant Nawalgaria, Julia Wiesinger et al.
- **Published**: First published November 2025 → **Updated May 2026**
- **Topic**: Practical playbook for evaluating, observing, and continuously improving non-deterministic AI [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] — "Agent Quality Flywheel"
- **Source (URL)**: https://www.kaggle.com/whitepaper-agent-quality

## Summary
The three core messages of this document are (1) "Trajectory is the truth", (2) "Observability is the foundation", and (3) "Evaluation is a continuous loop." Quality is not a final-stage QA but an **architectural pillar**, and it explains step-by-step how to define, observe, and evaluate "200 OK but plausibly incorrect" outputs that are not caught by traditional unit tests.

## Why Traditional QA Fails — 4 Failure Modes
- **Algorithmic Bias** — e.g., A financial Agent unfairly discriminating based on zip codes
- **Factual Hallucination** — e.g., Generating fake historical dates
- **Performance/Concept Drift** — e.g., A fraud detector missing new fraud patterns
- **Emergent Unintended Behaviors** — e.g., A "proxy war" with other bots, exploiting loopholes

## Paradigm Shift (5 Stages)
1. Traditional ML — Precision/Recall/F1/RMSE
2. Passive LLM — Probabilistic, model-vs-model benchmarks
3. LLM + RAG (Lewis et al. 2020) — Addition of chunking, embeddings, and retriever
4. Active AI Agent — Planning, tool use, and memory
5. Multi-Agent Systems — Cooperative vs competitive, resource competition, deadlock

## Four Pillars of Agent Quality
1. **Effectiveness** — Goal achievement
2. **Efficiency** — Tokens, wall-clock latency, trajectory complexity/number of steps
3. **Robustness** — Elegant retries, handling ambiguity
4. **Safety & Alignment** — Responsible AI, prompt injection defense, data leakage prevention

## "Outside-In" Evaluation Hierarchy
- **Black Box (E2E)** first → **Glass Box (Trajectory)** next.
- Black Box metrics: Task Success Rate (coding Agent's PR acceptance, financial Agent's DB transaction rate, support bot's session completion), CSAT, Overall Quality.

## Glass Box — 6 Analytical Dimensions of Trajectory
1. **LLM Planning/Thought** — Hallucination, off-topic, context pollution, infinite loop
2. **Tool Selection & Parameterization** — Incorrect tools, hallucinated tools/parameter names, malformed JSON
3. **Tool Response Interpretation** — Misreading numbers, missing entities, ignoring 404s
4. **RAG Performance** — Irrelevant search, outdated docs, ignoring context
5. **Trajectory Efficiency & Robustness**
6. **Multi-Agent Dynamics** — Communication loops between agents

## ADK Application Tips
- Save sessions in the `adk web` UI → Create `.test.json` Eval Cases (using final response + tool call trajectory as ground truth).
- Run via `adk eval` CLI or pytest.

## Evaluators
### Automated Metrics
- **ROUGE / BLEU** — String similarity
- **BERTScore / cosine similarity** — Embedding similarity
- **TruthfulQA** — Task-specific
- Used as CI/CD trend indicators rather than absolute values (e.g., triggering a regression alert if BERTScore drops from 0.8 to 0.6).

### LLM-as-a-Judge (Li et al. 2024, arXiv:2411.16594)
- Provide a rubric to the Judge LLM (e.g., "helpfulness/correctness/safety 1–5 points").
- **Pairwise comparison is superior to single-scoring** (mitigating bias). Aggregated as win/loss/tie rates.
- Sample prompt: Customer support pairwise prompt + Order #12345 example + JSON output `{"winner":"A|B|tie","rationale":...}`.

### Agent-as-a-Judge (Zhuge et al. 2024, arXiv:2410.10934)
- A Critic Agent evaluates the entire execution trace. Dimensions: Plan quality, Tool use, Context handling.
- *(Added May 2026)* Recommends leveraging **Agent Simulation** for scaling before deployment: stress-testing thousands of scenarios and early-detecting reasoning drift through synthetic test interaction generation and persona-based evaluation. Applied Tip: Directly feed the execution trace object (initial plan, selected tools, passed arguments) into the Critic Agent prompt to automatically detect process failures (such as inefficient plans) even if the final response is correct.

### HITL (Human-in-the-Loop)
- Subjectivity, context understanding, golden set creation, and runtime safety stops for high-risk actions like `execute_payment` / `delete_database_entry`.

### Reviewer UI
- Dual-panel UI with conversation on the left and reasoning trace on the right.
- Inline tagging ("bad plan", "tool misuse"), governance dashboard, event-driven pipelines.

## Responsible AI / Safety
- Systematic Red Teaming, automated filters + human review.
- ADK **SafetyPlugin pattern**:
  - `check_input_safety()` → `before_model_callback`: Prompt injection classifier
  - `check_output_pii()` → `after_model_callback`: PII scanner

## Three Pillars of Observability
### Logs
- Structured JSON, INFO vs DEBUG. Capture prompt/response, intermediate reasoning, tool calls, and state changes.
- E.g., `gemini-2.0-flash`, `roll_die` function call `{"sides":6}` → `function_response{"result":2}`.

### Traces (OpenTelemetry)
- Spans (`llm_call`, `tool_execution`)
- Attributes (`prompt_id`, `latency_ms`, `token_count`, `user_id`)
- Context Propagation via `trace_id`
- Cloud Trace + Vertex AI Agent Engine integration.

### Metrics — 2 Types
- **System Metrics**: Latency P50/P99, Error Rate (`error=true` attribute), Tokens per Task, API Cost per Run, Task Completion Rate, Tool Usage Frequency
- **Quality Metrics**: Correctness, Trajectory Adherence, Safety, Helpfulness/Relevance — Requires comparison via LLM-as-a-Judge or against a golden dataset

## Operational Practices
- Separate Operational Dashboard (P99 latency >3s alert) vs Quality Dashboard ("Helpfulness Score dropped by 10% in 24h" alert).
- PII scrubbing before storage.
- **Dynamic Sampling**: In production, save 100% of errors and only 10% of successes.

## Agent Quality Flywheel (4 Stages)
1. **Define Quality** (Four Pillars)
2. **Instrument for Visibility** (Logs + Traces)
3. **Evaluate the Process** (LLM-as-a-Judge + HITL)
4. **Architect Feedback Loop** — Transform failure cases into permanent regression tests

## 3 Core Principles
1. Evaluation is an architectural pillar.
2. **Trajectory is the truth.**
3. **Human is the arbiter.**

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]]
