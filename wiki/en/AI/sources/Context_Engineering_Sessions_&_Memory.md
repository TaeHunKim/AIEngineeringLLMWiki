# Context Engineering: Sessions & Memory

## Metadata
- **File Name**: `Context Engineering_ Sessions & Memory.pdf`
- **Author**: Kimberly Milam, Antonio Gulli (Google) — Contributors Anant Nawalgaria, Kanchana Patlolla, et al.
- **Publication Date**: First published November 2025 → **Updated May 2026**
- **Subject**: [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] for building stateful and personalized LLM Agents — [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] as conversation-level working memory and the [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] layer for cross-session persistence
- **Source (URL)**: https://www.kaggle.com/whitepaper-context-engineering-sessions-and-memory

## Summary
It starts with the definition that "Context Engineering = the process of dynamically organizing and managing information within the LLM context window." While Prompt Engineering is about refining static system instructions, Context Engineering handles the **entire dynamic payload**, including user input, history, and external data. It defines Sessions (working memory for a single conversation) and Memory (cross-session persistence) separately, and explains the entire extraction, consolidation, storage, and retrieval pipeline.

## Core Definitions
- **Context Engineering** ≠ **Prompt Engineering**. The latter refers to static system instructions, while the former refers to the entire dynamic payload including user inputs, history, external data, and tool outputs.
- Analogy: "mise en place" — a chef preparing all ingredients before cooking.
- Goal: "no more and no less than the most relevant information."

## Context Payload 3 buckets
1. **Context that guides reasoning**: System Instructions, Tool Definitions, Few-Shot Examples
2. **Evidence/factual data**: Long-Term Memory, External Knowledge (RAG), Tool Outputs, Sub-Agent Outputs, Artifacts
3. **Immediate conversation information**: Conversation History, State/Scratchpad, User's Prompt

## Context Rot
A phenomenon where the model's ability to focus attention on critical information degrades as the context grows longer.

## Operational Loop (4 steps per turn)
Fetch Context → Prepare Context (blocking, hot path) → Invoke LLM/Tools → Upload Context (background async)

## Sessions
- Self-contained records per user.
- Two components: **events** (user input, agent response, tool call, tool output) + **state** (structured working memory, e.g., shopping cart).
- Similar to Gemini API's `List[Content]` (`role`/`parts`).
- Production requires persistent storage (e.g., Agent Engine Sessions).

### Framework Differences
- **ADK**: Explicit `Session` object = `Event` list + separate `state`
- **LangGraph**: No official session — state is the session, mutable, contains all information, supports history compaction
- Framework acts as a "universal translator" mapping internal objects to LLM-specific formats (e.g., Gemini `Content` `role`/`parts`)

### Multi-Agent Session Patterns
- **Shared unified history**: All agents read/write the same log. Tightly coupled tasks. In ADK's LLM-driven delegation, sub-agent events are recorded in the root session.
- **Separate individual histories**: Each agent's log is separated. Communicates via Agent-as-a-Tool or A2A.
- *(Added May 2026)* **Agent Runtime Re-engineering**: Supports **up to 7-day multi-day operations** for multi-agent collaboration. Automatically resumes after waiting for external triggers (webhooks, human approvals) without losing context or session state.

### A2A Interoperability Issues
Framework abstraction isolates agents. LangGraph cannot natively read ADK's Session/Event objects. Solution: **Abstract the memory layer into framework-agnostic strings/dictionaries**.

### Production Considerations
- **Security**: User ACL isolation, authenticated requests, PII redaction before persistence (Model Armor) — GDPR/CCPA. *(Added May 2026)* **Agent Sandbox**: The Gemini Enterprise Agent Platform provides a secure environment that isolates code execution, bash commands, and browser automation (Computer Use) from core enterprise systems. All session-based invocations establish a complete audit trail using **Agent Identity** (SPIFFE-based cryptographic ID).
- **Data Integrity**: TTL policies, deterministic ordering
- **Performance**: Sessions are on the hot path → reduce size via filtering/compaction. *(Added May 2026)* The revamped Agent Runtime significantly reduces session restoration overhead with **sub-second cold starts** and provisioning new stateful instances within seconds.

## Long-context Challenges and Compaction
Limitations: Context window, token cost, latency, quality (autoregressive error accumulation). Analogy: "Suitcase — only what is needed."

### Compaction Strategies
1. Keep the last N turns (sliding window)
2. Token-based truncation (counting backward from the latest)
3. Recursive summarization (replacing old parts with AI summaries)

ADK Example: `ContextFilterPlugin(num_invocations_to_keep=10)`, `EventsCompactionConfig(compaction_interval=5, overlap_size=1)`.

### Triggers
Count-based (tokens/turns), Time-based (inactivity), Event-based (semantic/task completion)

## Memory
- A snapshot of meaningful information extracted from conversations. Framework-independent service.
- Some frameworks call sessions "short-term memory", but this document distinguishes them.

### Capabilities
- Personalization (preferred seat, team, etc.)
- Context Window Management
- Data Mining/Insight (aggregation, privacy-preserving)
- Agent Self-Improvement (procedural memory playbook)

### Stack Roles
User → Agent (developer logic) → Agent Framework (ADK, LangGraph) → Session Storage (Agent Engine Sessions, Spanner, Redis) → **Memory Manager** (Agent Engine Memory Bank, Mem0, Zep). Memory manager steps: **Extraction → Consolidation → Storage → Retrieval**.

### RAG vs Memory
| | RAG | Memory |
|---|---|---|
| Analogy | Research Librarian | Personal Assistant |
| Data | Facts, Shared | Dynamic, User-specific |
| Indexing | Batch (PDF/wiki) | Event-driven |
| Retrieval | Tool call | Tool call or static retrieval |
| Format | Chunk | Snippet/structured profile |

### Components
- **Content**: Structured (`{"seat_preference": "Window"}`) or unstructured ("The user prefers a window seat")
- **Metadata**: ID, owner, label

### Types of Information (Cognitive Science)
- **Declarative** (knowing what): Semantic + Entity/Episodic
- **Procedural** (knowing how): tool call sequences

### Organization Patterns
1. **Collections** — Multiple self-contained natural language memories
2. **Structured user profile** — Updated like a contact card
3. **Rolling summary** — A single evolving master document

### Storage Architecture
- **Vector DB**: Semantic similarity, "atomic facts"
- **Knowledge Graph**: Entities + relations, "knowledge triples"
- **Hybrid**: Vector-enriched graph entities

### Generation Mechanisms
- **Explicit** ("Remember this...") vs **Implicit** (agent inference)
- **Internal** (built-in framework) vs **External** (separate service)

### Scope
- **User-level** (most common, persists across sessions)
- **Session-level** (compacting a single session)
- **Application-level/global** (e.g., "Codename XYZ is project...", procedural memory — must be sanitized)

### Multimodal Memory
Distinction between original source (multimodal) and stored content (usually text). Most process multimodal sources and store them as text memories like "User expressed frustration about the recent shipping delay". Some support full multimodal storage (e.g., logo images). Memory Bank supports `types.Content` + `Part.from_text/from_bytes/from_uri`.

## Memory ETL Pipeline
**Ingestion → Extraction & Filtering → Consolidation → Storage**

Memory Bank API: `client.agent_engines.memories.generate(name=..., scope={"user_id": "123"}, direct_contents_source={"events": [...]}, config={"wait_for_completion": False})`.

### Extraction Techniques
- Schema/template-based (predefined JSON, structured output)
- Natural language topic definitions
- Few-shot prompting (input + ideal extracted memory)
- Memory Bank Example: `customization_configs` → `memory_topics` (managed `USER_PERSONAL_INFO` + custom `business_feedback`), `generate_memories_examples` (ideal output: `{"fact": "The user reported that the drip coffee was lukewarm."}`)
- Avoiding reprocessing verbose conversations via rolling summary

### Consolidation
- Deduplication, handling conflicting information, information evolution, active "forgetting" (TTL or deferral)
- Operations: UPDATE / CREATE / DELETE/INVALIDATE

### Provenance & Lineage
- Source types and confidence levels:
  - **Bootstrapped** (CRM, high confidence — resolves cold start)
  - **User Input** (explicit form high confidence / implicit conversation low confidence)
  - **Tool Output** (not recommended — brittle/stale, replace with cache)
- Conflict resolution: confidence → recency → corroboration
- Upon data deletion: recreate from remaining sources
- Inference time: inject confidence score into system prompt (not exposed to user)

### Pruning Triggers
Time decay, low confidence, irrelevance

### Generation Triggers
Session Completion, Turn Cadence (every N turns), Real-Time, Explicit Command — cost vs fidelity trade-off

## Memory-as-a-Tool
Agent calls `create_memory`/`generate_memories` based on LLM judgment. ADK Example: `VertexAiMemoryBankService` + custom tool — `add_session_to_memory(session)` (Option 1) or `client.agent_engines.memories.generate(...)` (Option 2).

Internal variant: agent extracts directly and delegates only consolidation to Memory Bank via `direct_memories_source={"direct_memories": [{"fact": query}]}`.

**Background vs blocking**: Memory generation is expensive, so it is asynchronous after response.

## Retrieval
- Organization structure determines retrieval (structured profile = lookup, collection = complex search).
- Score: **Relevance** (semantic similarity) + **Recency** + **Importance**. Relying solely on vector relevance is a pitfall.
- Advanced: Query rewriting, Reranking (top-50 reranking — arXiv:2503.08026), fine-tuning a dedicated retriever, caching layer.
- Timing: **Proactive** (every turn — ADK `PreloadMemoryTool`/`before_model_callback`), **Reactive Memory-as-a-Tool** (`LoadMemoryTool` or custom `load_memory(query)`).

### Inference Location
- **System instructions**: High authority, suitable for stable global memories. Disadvantages: excessive influence, incompatible with Memory-as-a-Tool, weak multimodal support. Jinja template.
- **Conversation history**: noisy, risk of prompt injection, first-person perspective issues (user role + user-level memory).
- **Hybrid recommended**.

## Procedural Memory
Less commercial interest, but powerful. Lifecycle is parallel to declarative memory, but extraction distills the "playbook", consolidation curates workflows, and retrieval fetches the plan. While RLHF is a slow offline weight update, procedural memory is fast online in-context learning.

## Evaluation
- **Quality**: Precision, Recall, F1 (against a golden set)
- **Retrieval Performance**: Recall@K, latency budget (e.g., <200ms)
- **End-to-End Task Success**: LLM judge compares against golden answer

## Production Memory Architecture (4-step async flow)
Agent push → Memory manager background queue processing → durable DB persistence → retrieve in the next turn.

Mitigating race conditions: transactions/optimistic locking, message queues, exponential backoff retries + dead-letter queue, multi-region DB replication.

## Privacy/Security
- User/tenant-level ACL isolation, opt-out/deletion controls
- PII redaction before persistence
- **Memory Poisoning** risks (arXiv:2503.03704) — mitigated by Model Armor
- Risk of exfiltration of shared procedural memory → anonymization

## Key Takeaways
- Sessions = working memory of a single conversation, Memory = persistence across sessions — these two must be designed separately.
- Memory is not "just storage", but an ETL pipeline (Extraction → Consolidation → Storage → Retrieval).
- Without Provenance/Lineage, it becomes "garbage in, confident garbage out".

## Related Concepts
[[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]] · [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]] · [[en/AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]]
