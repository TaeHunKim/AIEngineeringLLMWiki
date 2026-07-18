# Agent Tools & Interoperability with Model Context Protocol (MCP)

## Metadata
- **Filename**: `Agent Tools & Interoperability with Model Context Protocol (MCP).pdf`
- **Author**: Mike Styer, Kanchana Patlolla, Madhuranjan Mohan, Sal Diaz (Google)
- **Publication Date**: First published November 2025 → **Updated May 2026**
- **Subject**: How foundation models use tools, and Anthropic's [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]](MCP) standardizing this — architecture, primitives, security threats, and enterprise readiness
- **Source (URL)**: https://www.kaggle.com/whitepaper-agent-tools-and-interoperability-with-mcp

## Summary
Starting from the premise that foundation models without tools are merely "pattern prediction engines," it classifies [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] into (1) Function Tools, (2) Built-in Tools, and (3) Agent Tools, and explains how MCP, introduced in November 2024, solves the NxM integration problem. It extensively covers JSON-RPC 2.0, stdio/Streamable HTTP transport, server/client primitives, and security threats such as Tool Shadowing and Confused Deputy. *(May 2026 Update)* Adds context on how Vertex AI has evolved into the **Gemini Enterprise Agent Platform** (Build, Scale, Govern, Optimize 4 pillars) to help transition from AI experiments to secure, production-grade agentic systems.

## Tool Definition and Classification
- **Tool**: LLM-based apps use tools to perform tasks outside the model. Two main functions — "know something" (retrieve) or "do something" (act).
- **Three Types**:
  - **Function Tools** — Developer-defined. Example: ADK `set_light_values(brightness, color_temp, context: ToolContext)` (docstring → description).
  - **Built-in Tools** — Provided by the model service. Gemini's Grounding with Google Search, Code Execution, URL Context, Computer Use.
  - **Agent Tools** — Wrapping an agent as a tool. ADK `AgentTool` class, remote agents can be turned into tools using A2A.

## Taxonomy by Function
- Information Retrieval (MCP Toolbox, NL2SQL, RAG)
- Action/Execution
- System/API Integration (Google Connectors: Gmail, Drive, Calendar)
- Human-in-the-Loop

## Tool Creation Best Practices
- **Name and Description**: `create_critical_bug_in_jira_with_priority` (NOT `update_jira`).
- **Describe all input/output parameters**, keep parameter lists short, and provide default values.
- **Use examples with dynamic retrieval to save context**.
- **Describe behavior, not implementation techniques**: "create a bug to describe the issue" (NOT "use the create_bug tool").
- **Publish tasks rather than direct API calls**: Do not expose complex enterprise APIs with hundreds of parameters directly; instead, encapsulate them into user tasks.
- **Granularity**: One tool, one responsibility.
- **Simplify output**: Move large data to external storage like the ADK Artifact Service.
- **Friendly error messages**: "No product data found for product ID XXX. Ask the customer to confirm the product name…"

## The NxM Integration Problem and MCP
A problem where custom glue code is required for each model-to-tool combination. MCP is a standard inspired by the LSP (Language Server Protocol).

## MCP Architecture — Host / Client / Server
- **Host**: Manages client, orchestrates tools, enforces UX, security, and guardrails.
- **Client**: Maintains connection, lifecycle, and message flow.
- **Server**: Tool discovery, execution, formatting results, external API adapters/proxies.

## Communication Layer
- **JSON-RPC 2.0**. Four message types: Request, Result, Error, Notification.
- Two transports: **stdio** (local subprocess) and **Streamable HTTP** (recommended for remote — SSE streaming + stateless plain HTTP). The old HTTP+SSE has been deprecated since 2024-11-05.

## MCP Primitives
- **Server-side**: Tools, Resources, Prompts
- **Client-side**: Sampling, Elicitation, Roots
- Client adoption rate (modelcontextprotocol.io/clients, 2025-09-15): Tools ~99%, Resources 34%, Prompts 32%, Sampling 10%, Elicitation 4%, Roots 5%.

### Tool Definition Fields
`name`, `title`(opt), `description`, `inputSchema`, `outputSchema`(opt but recommended), `annotations`(opt: `destructiveHint`, `idempotentHint`, `openWorldHint`, `readOnlyHint`, `title` — non-binding hints).

Example: `get_stock_price` — symbol/date inputSchema, price/date outputSchema.

### Tool Results
- **Unstructured Content**: Text/Audio/Image (base64 + MIME type)
- **Structured Content**: outputSchema validated JSON
- Links to resources (URI + title/description/size/MIME) or embedded resource

### Error Handling
- JSON-RPC protocol errors (e.g., code -32602 "Unknown tool…")
- Tool execution errors: `"isError": true` + content (e.g., "API rate limit exceeded. Wait 15 seconds…")

### Resources / Prompts / Sampling / Elicitation / Roots
- **Resources**: Files, DB records, schemas, logs — care must be taken when exposing these to the LLM context.
- **Prompts**: Reusable templates. Not recommended in enterprise environments until security matures.
- **Sampling**: The server requests LLM completion from the client (inverting control flow) — HITL is recommended.
- **Elicitation**: The server requests additional information from the user via the client UI. The specification prohibits requesting sensitive information (not strictly enforced).
- **Roots**: File system boundaries based on `file:` URIs.

## Advantages
- Fast integration, plug-and-play ecosystem, **MCP Registry** (released by Anthropic in September 2025 — central source of truth + OpenAPI spec).
- Runtime dynamic tool discovery, standardized descriptions, modular architecture resembling an "agentic AI mesh", governance hooks, mandated user consent.
- *(Added May 2026)* **Governance Foundation**: Gemini Enterprise Agent Platform's **Agent Registry** (an integrated catalog of approved tools, MCP servers, and agent configurations) + Agent Identity combination natively supports enterprise-grade MCP governance.

## Risks and Limitations
### Performance/Scalability
- **Context Window Bloat**: The problem of filling the context window with all tool definitions.
- **Degraded Reasoning Quality**: Model confusion caused by having too many tools.
- **Stateful Protocol Challenges**: Harder to scale horizontally compared to stateless REST.
- Future direction: **RAG-MCP** (retrieving tools via a RAG step) — arXiv:2505.03275

### Enterprise Readiness Gap
- Auth (conflict between OAuth and enterprise security practices)
- Identity (ambiguity between user, agent, and service accounts) — *(Updated May 2026)* Gemini Enterprise Agent Platform's **Agent Identity** natively addresses this: it grants agents an encrypted, verifiable ID to provide complete accountability tracking and granular access control.
- Lack of native observability — *(Updated May 2026)* While Apigee continues to play a complementary role, Google Cloud's new **Agent Observability suite** additionally provides OTel-compliant telemetry, detailed execution traces, and logging. **Agent Simulation** allows stress-testing agents against synthetic traffic before production deployment.

### Security Threat Landscape
- **Dynamic Capability Injection**: Servers changing tools without notification → resolved by explicit allowlists, mandatory `listChanged` notifications, tool/package pinning, secure API gateways, and controlled hosting.
- **Tool Shadowing**: Attacks where malicious descriptions overwrite legitimate tools (e.g., `secure_storage_service` ← `save_secure_note` triggered by "save/store/keep/remember") → prevented by naming collision checks (LLM semantic verification), mTLS, policy enforcement, HITL, and limiting allowed servers.
- **Malicious Tool Definitions / Consumed Contents**: Manipulation of tool descriptors and prompt injection via external content → input validation, output sanitization (blocking API tokens, SSN, credit cards, Markdown/HTML, URLs), isolated system prompts, dual-planner architecture, and **Model Armor**.
- **Sensitive Information Leaks**: Input/output field annotations, tagging **Taint Sources/Sinks** (e.g., free text input is a taint source, `send_email_to_external_address` is a tainted sink).
- **Lack of fine-grained scope**: Credentials scoped by audience/scope + short expiration, principle of least privilege, secrets passed via side channels.
- **Confused Deputy Problem** (Appendix): The MCP server acts as an authorized deputy and performs tasks the user shouldn't be allowed to do due to prompt injection (e.g., copying `secret_algorithm.py` to the `backup_2025` branch). The server only checks its own permissions, not the user's permissions.

## Reference Tools/Products
Google ADK (`LlmAgent`, `AgentTool`, `ToolContext`, Artifact Service), Gemini API (`Tool`, `UrlContext`, `gemini-2.5-flash`), Google A2A Protocol, MCP Toolbox, NL2SQL, **Apigee** (MCP Gateway), **Model Armor**, MCP Registry, mTLS.

## Key Takeaways
- Tools must be designed with descriptions, schemas, and error messages in mind, rather than just simple function calls.
- MCP is almost entirely dominated by Tools; client support for other primitives (Resources/Prompts/Sampling/Elicitation/Roots) is thin.
- Security threats should be treated as systemic issues like Confused Deputy and Tool Shadowing, rather than simple input validation problems.

## Related Concepts
[[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]] · [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Agent_Engineering/Agent_Engineering|Agent Engineering]] · [[en/AI/Engineering/Context_Engineering/Context_Engineering|Context Engineering]] · [[en/AI/Engineering/Agent_Engineering/Agent_Memory|Agent Memory]]
