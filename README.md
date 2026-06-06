# n8n-nodes-vh3ai

Community node for [n8n](https://n8n.io/) that integrates with the [VH3 AI](https://vh3.ai) field service management platform.

This package provides a single unified node (**VH3 AI**) that combines BigChange API operations, BigChange Web Services, and VH3 AI intelligence features under one credential type. Resources are clearly labelled `(BigChange)`, `(Web Services)`, or `(VH3 AI)` in the dropdown.

The node is marked `usableAsTool: true` so it can be called directly by n8n AI agents.

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

The node uses the **VH3 AI API** credential type:


| Field        | Description                         | Default                                  |
| ------------ | ----------------------------------- | ---------------------------------------- |
| API Key      | Your VH3 API key (issued by VH3 AI) | —                                        |
| Company ID   | Your tenant / company ID            | —                                        |
| Base URL     | VH3 Connect gateway URL             | `https://api.vh3connect.io`              |
| FSI Base URL | VH3 Field Service Intelligence API  | `https://api.vh3connect.io/api:kP8T1CK7` |


All operations authenticate using the same API Key and Company ID credentials.

---

## Resources & Operations

### BigChange API Resources (`(BigChange)`)

These resources talk to the BigChange REST proxy (`/api:YdihQNr3`). Parameters are **camelCase**. Responses use the `extractItems()` envelope and support **Return All** auto-pagination.

| Resource                | Operations                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Job (BigChange)**                 | List Jobs · Get Job · Get Job by ID · Create Job · Edit Job · Cancel Job · Schedule Job · Start Job · Set Job Result · List Job Status History · Create / Delete / List Job Constraints · Create / List Job Stock |
| **Contact (BigChange)**             | List Contacts · Get Contact · Create / Edit Contact · Stop / Unstop Contact · List Contact Groups · Get / Create / Update Contact Group                                                                           |
| **Resource / Engineer (BigChange)** | List Resources · Get Resource · Create / Update Resource · List Resource Groups · Get Resource Group                                                                                                              |
| **Vehicle (BigChange)**             | List Vehicles · Get / Create / Update Vehicle                                                                                                                                                                     |
| **Worksheet (BigChange)**           | List Worksheet Definitions · Get Worksheet · Get Worksheet Questions · List Worksheet Answers                                                                                                                     |
| **Worksheet Group (BigChange)**     | List · Get                                                                                                                                                                                                        |
| **Invoice (BigChange)**             | List Invoices · Get Invoice · Create / Edit Invoice · Cancel Invoice · Mark Invoice Sent / Paid · List Invoice Line Items · Get Invoice Line Item · Create / Delete Invoice Line Item                             |
| **Quote (BigChange)**               | List Quotes · Get Quote · Create / Edit Quote · Mark Quote Sent / Accepted / Rejected · List Quote Line Items · Get / Create / Edit / Delete Quote Line Item                                                      |
| **Sales Opportunity (BigChange)**   | List Sales Opportunities · Get Sales Opportunity · Edit Sales Opportunity · List Probabilities · List Stages · List / Get / Create / Edit / Delete Sales Opportunity Line Item                                    |
| **Purchase Order (BigChange)**      | List Purchase Orders · Get Purchase Order · Create / Edit Purchase Order · List / Get Purchase Order Series · List / Get / Create / Edit / Delete Purchase Order Line Item                                        |
| **Note (BigChange)**                | List Notes · Get Note · Create / Edit Note · Create Progress Update · List Note Types · Get Note Type                                                                                                             |
| **Person (BigChange)**              | List Persons · Get Person · Create / Edit Person · List Consent History                                                                                                                                           |
| **Job Group (BigChange)**           | List Job Groups · Get Job Group · Create / Edit Job Group · Mark Complete · Mark Financially Complete · List Status History                                                                                       |
| **Stock (BigChange)**               | List Product Categories · Get Product Category · List / Get / Create / Update Stock Details · List / Get / Create / Update Stock Item · List Stock Movements · List Stock Suppliers · Get Stock Supplier         |
| **Reference Data (BigChange)**      | List Department Codes · Get Department Code · List Nominal Codes · Get Nominal Code                                                                                                                               |
| **Job Type (BigChange)**            | List Job Types · Get Job Type                                                                                                                                                                                     |

### BigChange Web Services Resources (`(Web Services)`)

These resources talk to the legacy BigChange Web Services API (`/api:U8zIv3U8`). Parameters are **PascalCase**. Dates use `yyyy-MM-dd HH:mm:ss` format. Responses are returned raw — there is no envelope unwrapping or auto-pagination.

> **When to use Web Services vs BigChange REST proxy:** some entities (jobs, contacts, stock) exist on both surfaces. Use `(BigChange)` for the modern REST contract with envelope pagination and camelCase params. Use `(Web Services)` for legacy Web Services fields, endpoints, or date handling not available via the REST proxy.

> **`/jobs/job` parameter collision:** `Job (BigChange)` › Get Job by ID uses query key `id`; `Job (Web Services)` › Get Job uses `JobId` / `JobRef`. These are different endpoints on different URL prefixes.

| Resource | Ops | Highlights |
| --- | ---:| --- |
| **Asset (Web Services)** | 10 | CRUD, transfers, audits |
| **Asset Check (Web Services)** | 2 | Check retrieval, defect updates |
| **Attachment (Web Services)** | 2 | Retrieval and deletion |
| **Contact (Web Services)** | 27 | Search, create, update, groups, flags, consent |
| **Contact Note (Web Services)** | 9 | List, create, update, delete |
| **Contract (Web Services)** | 8 | Contract management |
| **Custom Field (Web Services)** | 5 | Field definitions and values |
| **Expense (Web Services)** | 5 | Create, list, approve |
| **Financial (Web Services)** | 42 | Documents, invoices, payments, tax |
| **Job (Web Services)** | 58 | 5 hand-crafted + 53 generated (schedule, stock, waypoints, recurrence, cards, etc.) |
| **Messaging (Web Services)** | 1 | Send messages |
| **Report (Web Services)** | 7 | Report queries and exports |
| **Resource (Web Services)** | 24 | Availability, skills, groups, GPS |
| **Route (Web Services)** | 6 | Route planning and optimisation |
| **Sales Opportunity (Web Services)** | 8 | Opportunity management |
| **Stock (Web Services)** | 19 | Inventory management |
| **Tag (Web Services)** | 5 | Assign, remove, list tags |
| **Tracking (Web Services)** | 4 | GPS tracking and location data |
| **Web User (Web Services)** | 5 | Portal user management |
| **Workflow (Web Services)** | 1 | Workflow triggers and actions |
| **Worksheet (Web Services)** | 1 | Worksheet data retrieval |

### VH3 AI Intelligence Resources (`(VH3 AI)`)

| Resource           | Operations                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Account Report (VH3 AI)** | Generate Account Report (monthly account review for a contact)                                                                                                                                                                             |
| **Briefing (VH3 AI)**       | Generate Briefing (engineer pre-visit briefing and call script)                                                                                                                                                                            |
| **Case (VH3 AI)**           | Create / Get / Update / Search / List Cases · Transition Case (lifecycle status change) · Add Comment · List Activity · List / Add / Remove Case Items · Add / Remove Participants · List Cases for Item (reverse lookup by external item) |
| **Connie (VH3 AI)**         | Chat · List Sessions · Get Session Messages · Search History                                                                                                                                                                               |
| **Email (VH3 AI)**          | Batch Classify Emails · Classify Email · Ingest Portal Email · List Triage Categories · List Triage Rules                                                                                                                                  |
| **Intelligence (VH3 AI)**   | List Profiles (with **Profiled Only** filter) · Get Profile · Generate Profiles                                                                                                                                                            |
| **Investigate (VH3 AI)**    | Run Investigation (multi-step hybrid investigation across vector + graph data)                                                                                                                                                             |
| **Job Feed (VH3 AI)**       | List Job Feed · List Account Job Feed · Get Enriched Job · Aggregate Jobs (metrics with grouping, time-axis control, period-over-period comparison)                                                                                        |
| **Pulse (VH3 AI)**          | Get Pulse (cached business-health dashboard snapshot for the tenant)                                                                                                                                                                       |
| **Report (VH3 AI)**         | Generate Report (accepts `sections` parameter to scope the output) · List Report Sections                                                                                                                                                  |
| **Search (VH3 AI)**         | Autocomplete · Search Outcomes · Search Intake · Search Intake (Basic)                                                                                                                                                                     |
| **Sentinel (VH3 AI)**       | Run Sentinels (all or single by ID) · List Sentinel Registry · Get Latest Results                                                                                                                                                          |
| **User (VH3 AI)**           | List Users · List Invites · Invite User · Update User Role · Delete User                                                                                                                                                                   |
| **Weather (VH3 AI)**        | Get Weather for Job · Get Weather for Site · Get Forecast · Get Historical                                                                                                                                                                 |

---

## Key Features

### Simplify switch — LLM-friendly for cost-saving and efficiency

Every BigChange read operation exposes a top-level **Simplify** boolean. When ON, the node sends `compact=true` and the API returns LLM-optimised payloads (empty values stripped, nested structures flattened, custom fields collapsed to a key→value dict).

The **Search › Autocomplete** operation also has a **Simplify** toggle (default ON). This is handled at the node layer — it strips `null`, empty string, and empty array fields from each result and its nested `extra` object before returning data. `false` and `0` are retained as meaningful values.

### List Invoices / Quotes / Sales Opportunities / Purchase Orders — automatic 12-month fallback

BigChange's finance list endpoints reject requests with no filter or date range. When no filter is supplied, the node automatically scopes the query to the last 12 months.

### Email operations — attachment support

**Classify Email** and **Ingest Email** support optional attachments via URL (server-side fetch) or binary data (base64-encoded upload).

### Search operations — per-result unwrapping

All search operations return one n8n item per result (envelope unwrapped at the node layer).

### Sentinels — proactive monitoring

Deterministic checks (no LLM cost) against your VH3 AI platform fee. Available sentinels include Engineer Performance Slip, FVF Rate Drop, Workload Imbalance, Site Deterioration, Repeat Failure Escalation, and more.

---

## Architecture & Patterns

### Three API surfaces

The node exposes three distinct API transports under one credential:

| Surface | URL prefix | Param casing | Date format | Response handling |
| ------- | ---------- | ------------ | ----------- | ----------------- |
| `(BigChange)` REST proxy | `/api:YdihQNr3` | camelCase | ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`) | `extractItems()` envelope unwrap, auto-pagination |
| `(Web Services)` legacy | `/api:U8zIv3U8` | PascalCase | `yyyy-MM-dd HH:mm:ss` | raw response, no envelope helper |
| `(VH3 AI)` intelligence | `/api:6q5N0phZ` + FSI | camelCase / snake_case | ISO 8601 | per-endpoint |

Do **not** mix helpers across surfaces. Use `vh3ListApiRequest` / `extractItems` for BigChange REST; `vh3WebServicesGetRequest` / `vh3WebServicesPostRequest` for Web Services; `vh3FsiGetRequest` etc. for VH3 AI.

### Parameter casing

The n8n UI uses **camelCase** field names. The handlers map these to the appropriate API parameter format before sending.

### Response normalisation

- **BigChange**: `extractItems()` unwraps the three known envelope shapes into a flat item array.
- **Web Services**: raw response returned as-is. Consumers inspect the payload structure directly.
- **VH3 AI**: semantic search and autocomplete responses are unwrapped to per-hit / per-result items.

### Auto-pagination

List operations expose a **Return All** toggle. When ON, the node walks every page automatically (capped at 200 pages).

### AI tool compatibility

The node sets `usableAsTool: true`. n8n auto-generates a Tool variant (**VH3 AI Tool**) which implements the `supplyData()` interface for LangChain agents.

---

## Deployment & Hosting

| Model                              | Description                                                                                                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Managed Hosting by VH3 AI**      | VH3 deploys and hosts the n8n instance at `{customer}.n8n.vh3.ai`. Runs the standard n8n Docker image from Docker Hub with `n8n-nodes-vh3ai` installed as a community node on startup. Database and config managed via environment variables on DigitalOcean. |
| **BYOI (Bring Your Own Instance)** | Customer runs their own n8n (self-hosted or n8n Cloud), installs `n8n-nodes-vh3ai` via Community Nodes, and gives VH3 an API key for workflow support.                                                                                   |

---

## Compatibility

- n8n version: 1.0+ (tested on 2.16.x; community-node tool usage requires n8n ≥ 1.62 with `usableAsTool` enabled)
- Node.js: 18.10+

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for release history.

## License

MIT
