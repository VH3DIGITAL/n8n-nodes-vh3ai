# n8n-nodes-vh3ai

Community node for [n8n](https://n8n.io/) that integrates with the [VH3 AI](https://vh3.ai) field service management platform.

This package provides two nodes that share a single credential type:

- **VH3 AI** — operations against the BigChange-backed VH3 Connect API (jobs, contacts, engineers, vehicles, worksheets, invoices, quotes, notes, persons, job groups, stock, reference data).
- **VH3 AI PRO** — AI-powered Field Service Intelligence (FSI) operations: enriched job feed, search and investigation, agent chat (Connie), email triage and ingestion, sentinels, cases, weather, intelligence profiles, and more.

Both nodes are marked `usableAsTool: true` so they can be called directly by n8n AI agents.

---

## Installation

### Self-hosted n8n

Go to **Settings → Community Nodes**, click **Install**, and enter:

```
n8n-nodes-vh3ai
```

### n8n Cloud

Search for **VH3 AI** in the community nodes section.

### Manual / Development

```bash
cd n8n-nodes-vh3ai
npm install
npm run build
npm link

mkdir -p ~/.n8n/custom && cd ~/.n8n/custom
npm init -y
npm link n8n-nodes-vh3ai

n8n start
```

---

## Credentials

Both nodes use the **VH3 AI API** credential type:


| Field        | Description                         | Default                                  |
| ------------ | ----------------------------------- | ---------------------------------------- |
| API Key      | Your VH3 API key (issued by VH3 AI) | —                                        |
| Company ID   | Your tenant / company ID            | —                                        |
| Base URL     | VH3 Connect gateway URL             | `https://api.vh3connect.io`              |
| FSI Base URL | VH3 Field Service Intelligence API  | `https://api.vh3connect.io/api:kP8T1CK7` |


- **VH3 AI**: authenticates via `X-API-KEY` header on every request.
- **VH3 AI PRO**: injects `company_id` and `api_key` into the body or query string (no header auth). VH3 AI validates server-side.

---

## VH3 AI — Resources & Operations


| Resource                | Operations                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Job**                 | List Jobs · Get Job · Get Job by ID · Create Job · Edit Job · Cancel Job · Schedule Job · Start Job · Set Job Result · List Job Status History · Create / Delete / List Job Constraints · Create / List Job Stock |
| **Contact**             | List Contacts · Get Contact · Create / Edit Contact · Stop / Unstop Contact · List Contact Groups · Get / Create / Update Contact Group                                                                           |
| **Resource (Engineer)** | List Resources · Get Resource · Create / Update Resource · List Resource Groups · Get Resource Group                                                                                                              |
| **Vehicle**             | List Vehicles · Get / Create / Update Vehicle                                                                                                                                                                     |
| **Worksheet**           | List Worksheet Definitions · Get Worksheet · Get Worksheet Questions · List Worksheet Answers                                                                                                                     |
| **Worksheet Group**     | List · Get                                                                                                                                                                                                        |
| **Invoice**             | List Invoices · Get Invoice · Create / Edit Invoice · Cancel Invoice · Mark Invoice Sent / Paid · List Invoice Line Items · Get Invoice Line Item · Create / Delete Invoice Line Item                             |
| **Quote**               | List Quotes · Get Quote · Create / Edit Quote · Mark Quote Sent / Accepted / Rejected · List Quote Line Items · Get / Create / Edit / Delete Quote Line Item                                                      |
| **Note**                | List Notes · Get Note · Create / Edit Note · Create Progress Update · List Note Types · Get Note Type                                                                                                             |
| **Person**              | List Persons · Get Person · Create / Edit Person · List Consent History                                                                                                                                           |
| **Job Group**           | List Job Groups · Get Job Group · Create / Edit Job Group · Mark Complete · Mark Financially Complete · List Status History                                                                                       |
| **Stock**               | List Product Categories · Get Product Category · List / Get / Create / Update Stock Details · List / Get / Create / Update Stock Item · List Stock Movements · List Stock Suppliers · Get Stock Supplier         |
| **Reference Data**      | List Department Codes · Get Department Code · List Nominal Codes · Get Nominal Code                                                                                                                               |


### Simplify switch — LLM-friendly for cost-saving and efficiency

Every read operation across all 14 resources exposes a top-level **Simplify** boolean (Gmail-style). When ON, the node sends `compact=true` and the API returns LLM-optimised payloads (empty values stripped, nested structures flattened, custom fields collapsed to a key→value dict). As of 0.6.x, ~50 list/get endpoints across Jobs, Contacts, Resources, Vehicles, Worksheets, Worksheet Groups, Invoices, Quotes, Notes, Persons, Job Groups, Job Types, Stock, and Reference Data all support it.

Default is OFF on most operations (preserve raw envelope for backward compatibility); ON for the agent-heavy ones (List Jobs, Get Job by ID, List Contacts, Get Contact). Always pass `Simplify=true` when wiring this node up as an AI tool — payloads can otherwise be 5–10× larger than they need to be.

### List Invoices / List Quotes — automatic 12-month fallback

BigChange's `/v1/finance/invoices` and `/v1/quotes` endpoints reject requests with no filter or date range (HTTP 422). When the caller hasn't supplied any filter (`id`/`jobId`/`jobGroupId`/`contactId`/`reference`) and no `createdAtFrom`/`createdAtTo`, the node automatically scopes the query to the last 12 months ending now. Explicit values still take precedence — this only kicks in when nothing is set, so existing workflows are unaffected.

---

## VH3 AI PRO — Resources & Operations


| Resource           | Operations                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Account Report** | Generate Account Report (monthly account review for a contact)                                                                                                                                                                             |
| **Agent**          | Chat with Connie · Agent Search (NL search returning job objects) · Agent Ask (NL Q&A via the Weaviate Query Agent)                                                                                                                        |
| **Briefing**       | Generate Briefing (engineer pre-visit briefing and call script)                                                                                                                                                                            |
| **Cases**          | Create / Get / Update / Search / List Cases · Transition Case (lifecycle status change) · Add Comment · List Activity · List / Add / Remove Case Items · Add / Remove Participants · List Cases for Item (reverse lookup by external item) |
| **Connie**         | Chat · Voice Chat · Generate Summary (contact summary) · Search History · List Sessions · Get Session Messages                                                                                                                             |
| **Email**          | Classify Email · Ingest Email · List Triage Categories                                                                                                                                                                                     |
| **Intelligence**   | List Profiles (with **Profiled Only** filter, default ON) · Get Profile · Generate Profiles                                                                                                                                                |
| **Investigate**    | Run Investigation (multi-step hybrid investigation across vector + graph data)                                                                                                                                                             |
| **Job Feed**       | List Job Feed · Get Enriched Job · Aggregate Jobs (metrics with grouping, time-axis control, period-over-period comparison)                                                                                                                |
| **Pulse**          | Get Pulse (cached business-health dashboard snapshot for the tenant)                                                                                                                                                                       |
| **Report**         | Generate Report (now accepts a `sections` parameter to scope the output) · List Report Sections                                                                                                                                            |
| **Search**         | Autocomplete · Search Outcomes · Search Intake · Search Intake (Basic) — non-enriched variant                                                                                                                                              |
| **Sentinel**       | Run Sentinels (all or single by ID) · List Sentinel Registry · Get Latest Results                                                                                                                                                          |
| **Weather**        | Get Weather for Job · Get Weather for Site · Get Forecast · Get Historical                                                                                                                                                                 |


### Agent operations

The legacy **Chat with Connie** operation derives its endpoint dynamically from the operation value, which keeps the agent registry extensible. **Agent Search** and **Agent Ask** are explicit operations against the dedicated `/agent/search` and `/agent/ask` endpoints.

**Connie** has a dedicated resource for richer scenarios beyond chat: voice chat, contact summaries, conversation-history search, session listing, and per-session message retrieval.

### Email operations

**Classify Email** and **Ingest Email** both support an optional **Attachment Source** (None / From URL / From Binary Data):

- **From URL** — passes `{ filename, url, mimeType }` to the backend for server-side fetch.
- **From Binary Data** — reads the n8n binary buffer, base64-encodes it, sends `{ filename, contentBase64, mimeType }`.
- **None** — sends `attachments: []`.

The Ingest Email operation also accepts **Preferred Type IDs** (comma-separated integers) for extraction weighting.

**List Triage Categories** returns the available triage categories used by Classify Email.

### Search operations

All four search operations return **one n8n item per result** — the upstream wrapper envelopes (`{ hits, count }` from semantic search and `{ results, query, count }` from autocomplete) are unwrapped at the node layer so downstream nodes can iterate naturally without an extra Split Out step.

#### Autocomplete

- **Filter by Type** (multi-select) — constrain results to `customer`, `engineer`, `job`, and/or `site`. Default empty (returns all). Particularly useful when the node is being called as an AI agent tool — the agent can scope the search in a single call instead of post-processing mixed hits.

#### Search Outcomes / Search Intake / Search Intake (Basic)

These three semantic search operations all support a **client-side date filter** applied after the API response:

- **Date From** / **Date To** — explicit ISO date bounds.
- **Max Age (Months)** — convenience int (defaults to 6) that's equivalent to "Date From = now − N months". Ignored if Date From is also set.

The filter looks at `actualStartAt` first, then falls back through `actualEndAt`, `createdAt`, `created_at`, `plannedStartAt`, `scheduledAt`, and nested `job.`* variants. Items that don't expose any timestamp are kept rather than silently dropped.

### Intelligence — Profiled Only

`List Profiles` exposes a **Profiled Only** boolean (default ON). When ON, the API filters out items whose `profile` is null — only types with a generated profile are returned. The filter runs server-side via `profiled_only=true` on `/intelligence/profiles/{company_id}`.

### Sentinels

The **Sentinel** resource runs proactive, deterministic checks (no LLM cost) against your VH3 AI plaform fee. The full set of available sentinels is exposed via **List Sentinel Registry**; common ones include Engineer Performance Slip, FVF Rate Drop, Workload Imbalance, Site Deterioration, Repeat Failure Escalation, New Problem Site, SLA Breach Cluster, Customer Risk Escalation, Customer Non-Complete Anomaly, Scheduling Accuracy Drift, Carryover Accumulation, and Data Quality Alert. Run Sentinels accepts either `all` or a specific Sentinel ID.

---

## Architecture & Patterns

### Parameter casing

The n8n UI uses **camelCase** field names (e.g. `emailBody`, `senderAddress`, `preferredTypeIds`). The handlers map these to **snake_case** API parameters (`email_body`, `sender_address`, `preferred_type_ids`) before sending to the upstream API.

### FSI API authentication

The VH3 AI PRO node does **not** use the `X-API-KEY` header. Instead, `company_id` and `api_key` are injected directly:

- **GET requests** — as query string parameters
- **POST / PATCH / DELETE requests** — into the JSON body

Handled by `vh3FsiGetRequest`, `vh3FsiPostRequest`, `vh3FsiPatchRequest`, and `vh3FsiDeleteRequest` in `nodes/Vh3AiPro/GenericFunctions.ts`.

### Attachment handling

Both email operations share `buildAttachments()` from `GenericFunctions.ts`:

1. Reads `attachmentSource` from the n8n UI.
2. **URL mode** — constructs `{ filename, url, mimeType }`. No download on the n8n side; the backend fetches server-side.
3. **Binary mode** — reads the binary buffer, base64-encodes, constructs `{ filename, contentBase64, mimeType }`.
4. Returns `[]` when no attachment is selected.

### Response normalisation

- **VH3 AI (BigChange proxy)**: `extractItems()` automatically unwraps the three known envelope shapes (`{ response: { result: { items, pageItemCount } } }`, `{ result: { items, pageItemCount } }`, `{ items, pageItemCount }`) into a flat item array.
- **VH3 AI PRO (FSI search)**: semantic search and autocomplete responses are unwrapped to per-hit / per-result items at the node layer.

### Auto-pagination

List operations expose a **Return All** toggle. When ON, the node walks every page automatically (capped at 200 pages × the page size for safety).

### AI tool compatibility

Both nodes set `usableAsTool: true`. n8n auto-generates a `*Tool` variant of each (the cube-icon entry in the node picker — **VH3 AI - BigChange API Tool** and **VH3 AI PRO Tool**) which implements the `supplyData()` interface that the LangChain agent calls.

When you wire one of these nodes as an `ai_tool` connection, **always pick the Tool variant** (or use type `n8n-nodes-vh3ai.vh3AiTool` / `n8n-nodes-vh3ai.vh3AiProTool` in workflow JSON). The bare regular node (`vh3Ai` / `vh3AiPro`) does not expose `supplyData` and the agent will throw at run time.

Operation descriptions, resource descriptions, and field hints across all 14 BC Proxy resources have been rewritten to be agent-grade: every operation states verb-first what it does, what IDs it requires (and where to source them), what it returns, when to pick it over a sibling op, and BigChange-specific gotchas. The Filter by Type (autocomplete), Profiled Only (intelligence), Simplify (compact), and 12-month fallback (invoices/quotes) toggles were all designed with the agent path in mind.

For tool-call ergonomics, mark agent-fillable parameters with the n8n `$fromAI(name, description, type)` expression — this is the runtime form of the "AI defined" toggle in the node UI. Avoid `type: 'json'` for optional fields: n8n's tool-input schema rejects empty strings for json-typed fields and some agents force-fill every declared parameter, which raises *"Value must be a non-empty object or a non-empty array"* at run time. Stick to `'string'` (which accepts empty strings) for optional filters; the node's truthy-checks will skip them.

### Agent prompt companion

`docs/vh3ai-bigchange-tool-guide.md` ships with this package and is designed to be pasted directly into an AI agent's system message. It covers:

- A condensed mental model of the BigChange data graph (job ⇄ contact ⇄ resource ⇄ quote ⇄ invoice ⇄ worksheet ⇄ note).
- 9 operating rules (always resolve names → IDs first, simplify=true on every read, required date windows on List Jobs, etc.).
- A resource cheat sheet, a disambiguation guide ("if the agent is tempted to X, do Y"), and an exhaustive ID lookup map.
- The full enum of job statuses, constraint types, stock actions, and contact statuses.
- 4 worked end-to-end agent workflows (find jobs by customer, raise an invoice, reassign a job, summarise a job's worksheets).

---

## Deployment & Hosting

VH3 operates n8n instances across two models:


| Model                              | Description                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Managed Hosting by VH3 AI**      | VH3 deploys and hosts the n8n instance at `{customer}.n8n.vh3.ai`. Custom Docker image with VH3 nodes baked in, automated provisioning, backups, and updates. |
| **BYOI (Bring Your Own Instance)** | Customer runs their own n8n (self-hosted or n8n Cloud), installs `n8n-nodes-vh3ai` via Community Nodes, and gives VH3 an API key for workflow support.        |


---

## Compatibility

- n8n version: 1.0+ (tested on 2.16.x; community-node tool usage requires n8n ≥ 1.62 with `usableAsTool` enabled)
- Node.js: 18.10+

## Changelog

See `[CHANGELOG.md](CHANGELOG.md)` for release history.

## License

MIT