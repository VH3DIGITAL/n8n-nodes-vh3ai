# VH3 AI — n8n Node: Field Operations Help Guide

**Version:** 0.7.4 | **Support:** support@vh3.ai | **Platform:** [vh3.ai](https://vh3.ai)

---

## What Is This?

The **VH3 AI** node is a plug-in for n8n (your automation platform) that lets your workflows talk directly to two systems:

- **BigChange** — your core field service management platform (jobs, contacts, engineers, vehicles, invoices, etc.)
- **VH3 AI Intelligence** — the AI layer built on top of BigChange that adds smart reporting, briefings, monitoring alerts, and conversational lookup

You'll see both in the same dropdown menu inside n8n. BigChange functions are labelled **(BigChange)**; AI intelligence features are labelled **(VH3 AI)**.

---

## Getting Set Up — Credentials

Before any workflow can run, one set of credentials must be configured. A VH3 administrator will do this once. The four fields required are:

| Field | What It Is |
|---|---|
| API Key | Your unique key issued by VH3 AI |
| Company ID | Your tenant/account identifier |
| Base URL | VH3 Connect gateway (default: `https://api.vh3connect.io`) |
| FSI Base URL | VH3 AI Intelligence endpoint (set by VH3 AI) |

Once saved, every operation in the node automatically uses these credentials — you don't need to enter them again per workflow.

---

## A Note on "Simplify"

Many BigChange read operations have a **Simplify** toggle. When turned **ON** (recommended), the system strips out noise and returns a clean, trimmed version of the data — smaller, faster, and easier to read. Only turn it off if you need the raw BigChange data envelope for a specific technical reason.

---

## A Note on "Return All"

List operations have a **Return All** toggle. When **OFF**, the node returns one page of results (typically 25–200 records). When **ON**, it automatically fetches every page — useful for full exports but can be slow for large datasets. The node caps at 200 pages as a safety limit.

---

## Part 1: BigChange Operations

These functions read and write data directly in your BigChange account.

---

### Jobs (BigChange)

A **Job** is a single field service visit — a callout, inspection, installation, or repair.

| Operation | What It Does |
|---|---|
| **List Jobs** | Returns a filtered list of jobs. You must supply a **Created From** and **Created To** date. Note: this filters by when the job was *created*, not when it was *scheduled*. |
| **Get Job** | Returns the full enriched detail of a job — including worksheet answers, status history, and all linked data. Use this when you need the complete picture. |
| **Get Job by ID** | A lightweight lookup by job number. Use this for a quick check when you already know the ID. |
| **Create Job** | Creates a new job. You need a **Job Type ID** (the template) and a **Contact ID** (the customer or site). The job is created but not yet scheduled. |
| **Edit Job** | Updates fields on an existing job. |
| **Cancel Job** | Cancels a job that did not take place. Do **not** use this to mark a job where the engineer attended but had problems — use **Set Job Result** for that. |
| **Schedule Job** | Assigns an engineer, vehicle, and planned start time to an existing job. Run this after Create Job. |
| **Start Job** | Marks a job as started (the engineer has arrived on site). |
| **Set Job Result** | Records the outcome of a completed job. Use `completedOk` or `completedWithIssues` depending on what happened. |
| **List Job Status History** | Shows the full timeline of status changes for a job. |
| **Create Job Constraint** | Adds a scheduling rule to a job (e.g. "must start after 9am", "must use engineer X"). |
| **Delete Job Constraint** | Removes a constraint from a job. |
| **List Job Constraints** | Lists all constraints currently applied to a job. |
| **Create Job Stock** | Records a stock movement against a job (e.g. parts used on-site). |
| **List Job Stock** | Lists stock recorded against a job. |

**Job Status Values** (for filtering): `new`, `scheduled`, `onTheWay`, `started`, `completedOk`, `completedWithIssues`, `cancelled`, `suspended`, and others.

---

### Contacts (BigChange)

A **Contact** in BigChange can be either a **customer account** or a **site** (a physical location). Sites are linked to customers via a parent relationship.

| Operation | What It Does |
|---|---|
| **List Contacts** | Returns a list of contacts. Can be filtered by name, group, or status. |
| **Get Contact** | Returns full details for one contact, including address and custom fields. |
| **Create Contact** | Creates a new customer or site. |
| **Edit Contact** | Updates contact details. Note: you must re-supply the name, group ID, and coordinates even if unchanged. |
| **Stop Contact** | Places a customer account on stop (e.g. for credit issues). |
| **Unstop Contact** | Removes the stop from a contact. |
| **List Contact Groups** | Lists the folder/group structure for contacts. |
| **Get Contact Group** | Returns details of a single contact group. |
| **Create Contact Group** | Creates a new contact group. |
| **Update Contact Group** | Updates an existing contact group. |

**Contact Status Values**: `normal`, `contactOnStop`, `creditLimitOnStop`.

---

### Resources / Engineers (BigChange)

A **Resource** is a field engineer or technician — a human worker. Resources are separate from Contacts (customers/sites).

| Operation | What It Does |
|---|---|
| **List Resources** | Returns all engineers. Can be filtered by name or group. |
| **Get Resource** | Returns full detail for one engineer. |
| **Create Resource** | Adds a new engineer to BigChange. |
| **Update Resource** | Updates an existing engineer's details. |
| **List Resource Groups** | Lists the grouping structure for engineers (e.g. by region or team). |
| **Get Resource Group** | Returns details of a specific engineer group. |

---

### Vehicles (BigChange)

| Operation | What It Does |
|---|---|
| **List Vehicles** | Returns all vehicles in your fleet. |
| **Get Vehicle** | Returns full detail for a specific vehicle. |
| **Create Vehicle** | Adds a new vehicle to BigChange. |
| **Update Vehicle** | Updates an existing vehicle's details. |

---

### Worksheets (BigChange)

A **Worksheet** is a digital form that engineers complete on-site using the BigChange mobile app — checklists, risk assessments, photos, signatures, readings.

| Operation | What It Does |
|---|---|
| **List Worksheet Definitions** | Lists all worksheet templates configured in your account. |
| **Get Worksheet** | Returns a specific worksheet template. |
| **Get Worksheet Questions** | Returns the question structure of a worksheet template. |
| **List Worksheet Answers** | Returns the answers submitted by engineers for specified jobs. This is the primary way to read what an engineer captured on-site. |

Worksheets are read-only through this node — answers are created via the mobile app.

---

### Worksheet Groups (BigChange)

| Operation | What It Does |
|---|---|
| **List Worksheet Groups** | Lists the folders that organise worksheet templates. |
| **Get Worksheet Group** | Returns a specific worksheet group. |

---

### Invoices (BigChange)

| Operation | What It Does |
|---|---|
| **List Invoices** | Returns invoices. If no date filter is supplied, the node automatically defaults to the last 12 months. |
| **Get Invoice** | Returns full detail for a single invoice. |
| **Create Invoice** | Creates a new invoice, linked to a job and contact. |
| **Edit Invoice** | Updates invoice details. |
| **Cancel Invoice** | Cancels an invoice. This is irreversible — confirm before running. |
| **Mark Invoice Sent** | Records that the invoice has been sent to the customer. |
| **Mark Invoice Paid** | Records that the invoice has been paid. This is irreversible — confirm before running. |
| **List Invoice Line Items** | Returns all line items on an invoice. |
| **Get Invoice Line Item** | Returns a single line item. |
| **Create Invoice Line Item** | Adds a billable line to an invoice. Requires a nominal code ID and department code ID (look these up via Reference Data first). |
| **Delete Invoice Line Item** | Removes a line item from an invoice. |

---

### Quotes (BigChange)

| Operation | What It Does |
|---|---|
| **List Quotes** | Returns quotes. Defaults to last 12 months if no filter supplied. |
| **Get Quote** | Returns full detail for a single quote. |
| **Create Quote** | Creates a new quote linked to a contact. |
| **Edit Quote** | Updates quote details. |
| **Mark Quote Sent** | Records that the quote has been sent to the customer. |
| **Mark Quote Accepted** | Records that the customer has accepted the quote. |
| **Mark Quote Rejected** | Records that the customer has rejected the quote. |
| **List Quote Line Items** | Returns all line items on a quote. |
| **Get Quote Line Item** | Returns a single line item. |
| **Create Quote Line Item** | Adds a line to a quote. Requires nominal and department codes. |
| **Edit Quote Line Item** | Updates an existing line item. |
| **Delete Quote Line Item** | Removes a line item from a quote. |

---

### Notes (BigChange)

Notes are attached to jobs, contacts, or persons. They cover follow-ups, tasks, callbacks, and internal comments.

| Operation | What It Does |
|---|---|
| **List Notes** | Returns notes, filterable by entity (job, contact, etc.). |
| **Get Note** | Returns a single note. |
| **Create Note** | Creates a new note. |
| **Edit Note** | Updates an existing note. |
| **Create Progress Update** | Adds a progress update note to a job or entity. |
| **List Note Types** | Lists the available note categories configured in your account. |
| **Get Note Type** | Returns detail for a specific note type. |

---

### Persons (BigChange)

A **Person** is an individual named contact at a customer or site — distinct from the Contact (which is the account or location itself).

| Operation | What It Does |
|---|---|
| **List Persons** | Returns people linked to contacts. |
| **Get Person** | Returns detail for a specific person. |
| **Create Person** | Adds a new named person to a contact. |
| **Edit Person** | Updates person details. |
| **List Consent History** | Returns the GDPR consent history for a person. |

---

### Job Groups (BigChange)

A **Job Group** links several related jobs together — typically for multi-day projects or packages of work.

| Operation | What It Does |
|---|---|
| **List Job Groups** | Returns all job groups. |
| **Get Job Group** | Returns detail for a specific job group. |
| **Create Job Group** | Creates a new job group. |
| **Edit Job Group** | Updates job group details. |
| **Mark Complete** | Marks a job group as operationally complete. |
| **Mark Financially Complete** | Marks a job group as financially closed. This is irreversible — confirm before running. |
| **List Status History** | Shows the lifecycle status timeline for a job group. |

---

### Stock (BigChange)

Inventory management — physical parts, SKUs, serial numbers, and movement tracking.

| Operation | What It Does |
|---|---|
| **List Product Categories** | Returns the stock category hierarchy. |
| **Get Product Category** | Returns detail for a category. |
| **List Stock Details** | Lists SKU-level stock definitions. |
| **Get Stock Details** | Returns a specific SKU. |
| **Create Stock Details** | Creates a new stock SKU. |
| **Update Stock Details** | Updates an existing SKU. |
| **List Stock Items** | Lists individual physical stock items (unique units). |
| **Get Stock Item** | Returns a specific stock item. |
| **Create Stock Item** | Creates a new physical stock item record. |
| **Update Stock Item** | Updates a stock item. |
| **List Stock Movements** | Returns the movement history of stock items. |
| **List Stock Suppliers** | Returns the supplier list. |
| **Get Stock Supplier** | Returns a specific supplier. |

---

### Reference Data (BigChange)

These are lookup tables used when creating invoices and quotes. You typically list these once at the start of a workflow, pick the right ID, and pass it to the create operation.

| Operation | What It Does |
|---|---|
| **List Department Codes** | Returns all configured department cost codes. |
| **Get Department Code** | Returns a single department code. |
| **List Nominal Codes** | Returns all nominal (account) codes (used for invoice/quote line items). |
| **Get Nominal Code** | Returns a single nominal code. |

---

### Job Types (BigChange)

Job Types are the templates that define what kind of job is being created — they control which worksheets are attached, which custom fields appear, and how the job is classified.

| Operation | What It Does |
|---|---|
| **List Job Types** | Returns all job type templates. |
| **Get Job Type** | Returns full detail for a job type, including custom field definitions. |

---

## Part 2: VH3 AI Intelligence Operations

These features are powered by the VH3 AI layer — they use AI, machine learning, and your historical BigChange data to generate insights, briefings, alerts, and smart search.

---

### Account Report (VH3 AI)

**What it does:** Generates a structured monthly account review for a customer. It automatically resolves the full parent–child site hierarchy, aggregating jobs across all linked sites.

**Use case:** Send a monthly service summary to a key account, or generate the data pack for an account review meeting.

| Field | Description |
|---|---|
| Contact ID | The customer's BigChange contact ID (parent or child — it resolves the hierarchy automatically) |
| Month | The month to report on in `YYYY-MM` format. Defaults to last calendar month if left blank. |
| Include Narrative | When on, adds an AI-written summary paragraph to the report (recommended). |

---

### Briefing (VH3 AI)

**What it does:** Generates a structured pre-visit briefing for an engineer heading to a job. Includes a customer history summary, key context, and an AI-generated call script.

**Use case:** Automatically send an engineer a briefing to their phone before they leave for a job — so they already know the customer's history, common issues, and what to expect.

| Field | Description |
|---|---|
| Job ID | The job the engineer is attending |
| Contact ID | The customer linked to the job |
| Force Regenerate Summary | Bypass cached data and generate fresh context (slower but up-to-date) |
| Job Payload (JSON) | Fallback: provide raw job data if the job isn't yet in the VH3 knowledge graph |

---

### Cases (VH3 AI)

**What it does:** A case management system for tracking incidents, investigations, audits, compliance matters, and project reviews. Cases can link to jobs, customers, sites, and engineers.

**Case Types:** Audit, Case Study, Compliance, Incident, Investigation, Project Review

**Case Statuses:** Draft → Open → In Progress → Under Review → Resolved → Closed → Archived

| Operation | What It Does |
|---|---|
| **Create Case** | Opens a new case in **draft** with a title and type. Optional: priority, tags, description, due date. |
| **Get Case** | Returns full case detail including participants, linked items, and latest activity. |
| **Update Case** | Updates selected fields only. Unselected fields are preserved. Adding an empty Description, Resolution, Tags, or Metadata, or using Clear Due Date, clears that value. Title cannot be empty. Actor ID is a Connect user ID; omit or 0 uses the API-key owner. |
| **Transition Case** | Moves a case to a new status (e.g. from Open to In Progress). Includes lifecycle validation. |
| **Search Cases** | Full-text search across case titles and descriptions. |
| **List Cases** | Lists cases with filtering by status, type, priority, owner, or search. Optional Scope (`active` / `all` / `closed`), Sort, and Order map to the FSI API. Sorting is server-side. Omitted Scope, Sort, and Order use the FSI API defaults. Exact Status overrides Scope. |
| **Add Comment** | Adds a comment to the case activity timeline. |
| **List Activity** | Returns the full activity timeline (comments, transitions, changes) for a case. |
| **Add Case Item** | Links a job, customer, site, engineer, or document to the case. |
| **Remove Case Item** | Unlinks an item from a case. |
| **List Case Items** | Lists all records linked to a case, optionally filtered by type. |
| **Add Participant** | Adds a user to the case with a role. Roles are exactly owner, investigator, reviewer, observer, and contributor. |
| **Remove Participant** | Removes a participant from a case. |
| **List Cases for Item** | Reverse lookup — finds all cases that reference a specific job, site, or customer. |

---

### Connie (VH3 AI)

**What it does:** Connie is the VH3 AI conversational assistant. You can send natural-language questions about jobs, customers, or operational data and receive intelligent, context-aware responses. Conversations are session-based so context carries across messages.

**Use case:** Wire Connie into a chat bot, a WhatsApp workflow, or a Teams integration so operations staff can ask questions like "What happened at Acme last week?" and get a real answer.

| Operation | What It Does |
|---|---|
| **Chat** | Sends a message to Connie and returns the response. Can be tied to a session, a contact, or a job reference for context. |
| **List Sessions** | Lists Connie chat sessions for a user or contact. |
| **Get Session Messages** | Returns the full message history for a specific chat session. |
| **Search History** | Searches across all past Connie conversations for a given query. |

---

### Email (VH3 AI)

**What it does:** AI-powered email triage. Feed an incoming email into VH3 AI and it will classify it, extract structured job data, and resolve entities (customers, sites, job types) from your BigChange account.

| Operation | What It Does |
|---|---|
| **Classify Email** | Reads an email (subject, body, sender) and returns a triage category — e.g. "new job request", "complaint", "invoice query". |
| **Ingest Email** | Extracts structured job data from a field management portal email. Returns resolved entity IDs ready for use in a Create Job operation. |
| **List Triage Categories** | Returns all triage classification categories available in your account. |

Both operations support optional **attachments** (e.g. a PDF from the customer) via a public URL or binary file upload.

---

### Intelligence (VH3 AI)

**What it does:** Job type intelligence profiles — AI-generated summaries that describe the typical characteristics, patterns, and insights for each job type category in your account (e.g. "Boiler Service", "Emergency Callout").

**Use case:** Use in dashboards or reporting workflows to surface what each job type typically looks like, how it performs, and where it deviates.

| Operation | What It Does |
|---|---|
| **List Profiles** | Lists all job type intelligence profiles. The **Profiled Only** toggle filters to types that have been analysed (recommended — filters out types with no profile). |
| **Get Profile** | Returns the intelligence profile for a specific job type. |
| **Generate Profiles** | Triggers regeneration of profiles for specified job types (or all). This is a background operation. |

---

### Investigate (VH3 AI)

**What it does:** Deep-dive investigation tool. Ask a natural-language question and VH3 AI runs a multi-step hybrid search across both the vector knowledge base and the operational graph database, returning structured evidence and a synthesised answer.

**Use case:** "Why is this site having so many repeat failures?" or "What is the common factor across all the jobs that completed with issues last quarter?"

| Field | Description |
|---|---|
| Question | Your investigation question in plain English |
| Max Evidence Items | How many supporting evidence items to collect (default: 10) |

---

### Job Feed (VH3 AI)

**What it does:** The AI-enriched view of your jobs — each job is augmented with AI classifications (vertical, sentiment, key phrases) and richer timing data. This is the recommended way to pull job data into analytics and reporting workflows.

| Operation | What It Does |
|---|---|
| **List Job Feed** | Returns a paginated, filtered list of AI-enriched jobs. Filterable by status, result, engineer, customer, job type, and category. |
| **Get Enriched Job** | Returns a single job with full AI enrichment. Optionally include worksheet answers. |
| **Aggregate Jobs** | Computes summary metrics across a time period with grouping and period-over-period comparison. |

**Aggregate Jobs** is particularly powerful for operations dashboards:

- **Metrics available:** Job Count, Completion Rate, First Visit Fix (FVF) Rate, Average Start Delay, Average End Delay
- **Group by:** Status, Result, Job Type, Category, Engineer, Site, Day, Week, Month
- **Compare to:** Previous Period, Same Period Last Week, Same Period Last Month
- **Time axis options:** Actual Start, Actual End, Created At, Planned Start, Scheduled At

---

### Pulse (VH3 AI)

**What it does:** Returns a cached business-health snapshot for your entire operation — a single call that gives you pipeline status, performance metrics, workforce indicators, and asset data all in one.

**Use case:** The foundation for an operational dashboard or a scheduled morning briefing report. Because the data is cached, it returns quickly.

| Operation | What It Does |
|---|---|
| **Get Pulse** | Returns the current health snapshot. No parameters required. |

---

### Report (VH3 AI)

**What it does:** Generates AI-powered operational reports. Seven pre-built report types cover the full working day and week cycle.

| Report Type | When to Use |
|---|---|
| **Start of Day** | Morning: what's on the schedule, who's working, any overnight issues |
| **Midday** | Mid-shift check-in: job progress, any slippage |
| **Close of Business** | End-of-day summary: what completed, what's outstanding |
| **Day Review** | Full day retrospective with metrics |
| **Start of Week** | Weekly planning view |
| **Midweek** | Wednesday check-in |
| **End of Week** | Weekly close-out and performance summary |

| Field | Description |
|---|---|
| Report Type | Which of the seven report types to generate |
| Date | The date to report on. Defaults to today. |
| Include Narrative | Adds an AI-written narrative paragraph (adds 2–5 seconds). |
| Sections (JSON) | Optionally limit the report to specific sections. Use **List Report Sections** to see what's available. |

---

### Search (VH3 AI)

**What it does:** Four search modes that leverage the VH3 AI knowledge graph and vector database for smart, semantic lookups — going beyond simple keyword matching.

| Operation | What It Does |
|---|---|
| **Autocomplete** | Fast fuzzy search across customers, engineers, jobs, persons, and sites. Type-ahead style — ideal for search boxes and lookup fields. `limit` controls the maximum results **per entity type** (not a global total). Filterable by type. A **Simplify** toggle (default ON) strips null, empty string, and empty array fields at the node layer — keeps output lean for LLM/agent use. |
| **Search Outcomes** | Natural-language search across job outcome and diagnostic summaries. Example: "boiler pressure fault resolved with pressure relief valve replacement". |
| **Search Intake** | Natural-language search across job intake (what was reported). Returns enriched job context from the knowledge graph. |
| **Search Intake (Basic)** | Same as Search Intake but without graph enrichment — faster but less context-rich. |

All semantic search operations return one n8n item per result (pre-unwrapped for easy downstream processing). Filterable by engineer, customer, site, job type, and date range.

---

### Sentinel (VH3 AI)

**What it does:** Proactive automated monitoring checks. Sentinels run deterministic checks against your operational data — no AI inference cost — and fire alerts only when something crosses a threshold. Run them on a schedule to get early warnings before problems escalate.

**Available Sentinels:**

| Sentinel | What It Detects |
|---|---|
| **Engineer Performance Slip** | An engineer's metrics have dropped below their personal baseline |
| **FVF Rate Drop** | First Visit Fix rate has fallen across the operation or by engineer/type |
| **Workload Imbalance** | Uneven job distribution across the engineer team |
| **Site Deterioration** | A specific site is generating more repeat visits or failures than normal |
| **Repeat Failure Escalation** | The same fault type is recurring at increasing frequency |
| **Customer Non-Complete Anomaly** | Unusual rate of incomplete jobs for a specific customer |
| **Customer Risk Escalation** | A customer account is exhibiting risk indicators |
| **New Problem Site** | A site that hasn't been flagged before is now showing deterioration patterns |
| **Carryover Accumulation** | Jobs are being pushed forward without resolution |
| **Scheduling Accuracy Drift** | Planned vs actual times are diverging across the operation |
| **SLA Breach Cluster** | A cluster of SLA breaches is forming, potentially indicating systemic issues |
| **Data Quality Alert** | Missing or inconsistent data is detected in job records |

| Operation | What It Does |
|---|---|
| **Run Sentinels** | Executes one or all sentinel checks and returns only those that have triggered. |
| **List Sentinel Registry** | Lists all available sentinel definitions with their thresholds and recommended run schedules. |
| **Get Latest Results** | Returns the cached results from the most recent sentinel run — no re-computation required. |

---

### Weather (VH3 AI)

**What it does:** Retrieves weather data correlated to your field operations — useful for understanding whether conditions may have affected job outcomes, or for proactively flagging weather risk for upcoming jobs.

| Operation | What It Does |
|---|---|
| **Get Weather for Job** | Returns weather conditions at the job location at the time of the visit, by Job ID. |
| **Get Weather for Site** | Returns weather for a specific site over a date range, by site key. |
| **Get Forecast** | Returns a forecast for a latitude/longitude with optional timezone and hour range. |
| **Get Historical** | Returns historical weather for a latitude/longitude over a date range. |

### Users (VH3 AI)

**What it does:** Manage company users — list who's on the team, send invitations, update roles, and remove users. All operations are tenant-scoped via your existing `company_id` and `api_key`.

| Operation | What It Does |
|---|---|
| **List Users** | Returns all active (non-archived) users for your company with name, email, username, role, and profile picture. |
| **List Invites** | Returns all pending (unaccepted) email invitations for the company. |
| **Invite User** | Sends an invitation email to a new user. Requires the invitee's email, role, company name, and the inviter's name. |
| **Update User Role** | Changes the role of an existing user (e.g. from `user` to `manager`). |
| **Delete User** | Soft-deletes (archives) a user. The user record is not permanently removed. |

---

## Quick Reference: Common Field Operations Tasks

| What you want to do | Which operation(s) to use |
|---|---|
| See all jobs for a customer this week | **List Jobs** (BigChange) — filter by contactId and created date range |
| Get the full detail of a specific job | **Get Job** (BigChange) — returns worksheets, history, and linked data |
| Reassign a job to a different engineer | **Schedule Job** (BigChange) — supply the new resourceId and planned start |
| Check what an engineer completed on-site | **List Worksheet Answers** (BigChange) or **Get Enriched Job** (VH3 AI) |
| Raise an invoice for a completed job | **Create Invoice** → **Create Invoice Line Items** → **Mark Invoice Sent** (BigChange) |
| Put a customer on stop | **List Contacts** to find the contactId → **Stop Contact** (BigChange) |
| Get a briefing for an upcoming job | **Generate Briefing** (VH3 AI) |
| Get a morning operations report | **Generate Report** — type: Start of Day (VH3 AI) |
| Check for any performance alerts | **Run Sentinels** — select All (VH3 AI) |
| Search for a previous job description | **Search Outcomes** or **Search Intake** (VH3 AI) |
| Ask a question about operational data | **Connie — Chat** (VH3 AI) |
| Get an overview of business health | **Get Pulse** (VH3 AI) |
| Generate a customer account review | **Generate Account Report** (VH3 AI) |
| Track an ongoing incident | **Case — Create Case** then link jobs/sites via **Add Case Item** (VH3 AI) |

---

## Important Safety Notes

The following operations make **permanent, irreversible changes** in BigChange. Always confirm with your workflow builder that a human approval step is in place before these run automatically:

- Cancel Job
- Mark Invoice Paid
- Cancel Invoice
- Mark Job Group Financially Complete
- Stop Contact / Unstop Contact
- Delete Invoice or Quote Line Item

---

## Getting Help

For technical support with the node or your workflows, contact: **support@vh3.ai**

For BigChange platform queries: refer to your BigChange account manager.

---

*This guide covers `n8n-nodes-vh3ai` v0.7.6. For the latest changes, see the CHANGELOG in the package repository.*
