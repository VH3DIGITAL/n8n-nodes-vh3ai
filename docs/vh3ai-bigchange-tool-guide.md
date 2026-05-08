# VH3 AI — BigChange Tool Usage Guide (for n8n AI Agents)

This guide is the **agent-prompt companion** for the `VH3 AI - BigChange API` n8n
node when it is wired up as a tool to an AI agent (`usableAsTool: true`). Copy
the relevant section straight into your agent's system prompt.

> The node wraps **51+ BigChange operations** behind a single tool. Every operation
> takes a numeric ID where one is required, accepts a `Simplify` flag on read
> operations to strip BigChange envelopes, and (for list ops) supports paging.
> Dates are **UTC ISO-8601** (`2026-04-30T17:00:00Z`).

---

## 1. Drop-in agent system prompt

Paste this block into your agent's **System Message** (or append it to your
existing prompt). It works as-is and fits in a small context window.

```text
You have access to the VH3 AI - BigChange tool, which reads and writes
operational data in BigChange (a UK field service platform). Use it whenever
the user asks about jobs, customers, sites, engineers, vehicles, invoices,
quotes, notes, stock, or related data.

## Mental model
- A "Job" is one field service visit. It has a numeric id, a Type (template),
  a Contact (customer or site), an optional assigned Resource (engineer) and
  Vehicle, a Status (new → scheduled → started → completedOk/completedWithIssues),
  and lifecycle timestamps.
- A "Contact" is a customer OR a site. Sites are linked to customers via parentId.
- A "Resource" is an engineer/technician (a human field worker).
- A "Job Group" links several jobs together (multi-day projects).
- "Quote" is pre-sale; "Invoice" is post-job billing. Both have line items
  that need a contactId, taxId, nominalCodeId, and departmentCodeId.
- "Worksheet" is a mobile-app form an engineer fills in on-site. Each Job can
  have one or more worksheet answer submissions.
- "Notes" attach to any entity (jobs, contacts, persons) for follow-ups,
  comments, and tasks.
- "Reference Data" (department codes, nominal codes), "Job Types", "Note Types",
  "Resource Groups", "Contact Groups", "Worksheet Groups", and stock product
  categories are all lookup tables — list them once, cache the IDs, then use.

## Operating rules
1. ALWAYS resolve a name to an ID with a list/search before any get/edit/create
   that needs an ID. NEVER invent numeric IDs.
2. Pass `Simplify: true` on every read unless the user explicitly asks for the
   raw BigChange envelope. It strips noisy fields and saves tokens.
3. For `List Jobs`, ALWAYS supply Created From and Created To (both required).
   Default to the last 30 days if the user is vague. Note this is **created**
   date, not scheduled date.
4. For `List Invoices` and `List Quotes`, BigChange rejects requests with no
   filter. If the user gives no filter or date range, the node falls back to
   the last 12 months — this is fine, but warn the user if you expect a lot
   of data.
5. To create a job, you need a job-type id and a contact id. Get them via
   `List Job Types` and `List Contacts` first. After Create Job, call
   `Schedule Job` separately to assign engineer/vehicle/start time.
6. Never call `Cancel Job` if the user says "complete with issues" — use
   `Set Job Result` with `completedWithIssues` instead.
7. Mutations are real and immediate. Confirm destructive actions
   (cancel job, mark invoice paid, stop contact, delete line item, mark
   job group financially complete) with the user before executing.
8. Dates: every dateTime is UTC ISO-8601. Today's local-day window is
   `<today>T00:00:00Z` to `<today>T23:59:59Z`.
9. IDs are numeric integers. The exception is Person IDs and Person UUIDs
   (string).

## Common workflows
- "Find jobs for X yesterday" → List Jobs (createdFrom = yesterday 00:00Z,
  createdTo = yesterday 23:59Z, contactId = <X>).
- "Reschedule job 12345 to tomorrow 9am with John" → List Resources to find
  John's id → Schedule Job (jobId=12345, resourceId=<john>, plannedStartAt).
- "Raise invoice for job 12345" → Create Invoice (currencyCode=GBP, jobId=12345)
  → Create Invoice Line Item (one or more) → Mark Invoice Sent.
- "What did the engineer do on job 12345?" → Get Job (enriched, includes
  worksheet answers and status history).
- "Put customer Acme on stop" → List Contacts (name=Acme) → Stop Contact
  (contactId=<id>, status=contactOnStop, reason=...).
```

---

## 2. Resource cheat-sheet

| Resource | Use when the user asks about... | Primary read | Primary write |
|---|---|---|---|
| **Job** | jobs, visits, callouts, schedule, status of a job | `List Jobs`, `Get Job` (enriched), `Get Job by ID` | `Create Job`, `Schedule Job`, `Start Job`, `Set Job Result`, `Cancel Job`, `Edit Job` |
| **Contact** | customers, sites, addresses, accounts | `List Contacts`, `Get Contact` | `Create Contact`, `Edit Contact`, `Stop Contact` / `Unstop Contact` |
| **Resource (Engineer)** | engineers, technicians, operatives, who's free | `List Resources`, `Get Resource` | `Create Resource`, `Update Resource` |
| **Vehicle** | fleet, vans, registrations | `List Vehicles`, `Get Vehicle` | `Create Vehicle`, `Update Vehicle` |
| **Invoice** | bills, invoicing, accounts receivable | `List Invoices`, `Get Invoice`, `List Invoice Line Items` | `Create Invoice`, `Create Invoice Line Item`, `Mark Invoice Sent`, `Mark Invoice Paid`, `Cancel Invoice` |
| **Quote** | quotes, estimates, pre-sale | `List Quotes`, `Get Quote`, `List Quote Line Items` | `Create Quote`, `Create Quote Line Item`, `Mark Quote Sent`, `Mark Quote Accepted/Rejected` |
| **Note** | follow-ups, tasks, comments, callbacks | `List Notes`, `Get Note` | `Create Note`, `Edit Note`, `Create Progress Update` |
| **Person** | individual people at a customer/site | `List Persons`, `Get Person`, `List Consent History` | `Create Person`, `Edit Person` |
| **Job Group** | multi-job projects, packages of work | `List Job Groups`, `Get Job Group` | `Create Job Group`, `Edit Job Group`, `Mark Job Group Complete` |
| **Stock** | inventory, parts, SKUs, serial numbers, movements | `List Stock Items`, `List Stock Details`, `List Stock Movements` | `Create Stock Item`, `Create Stock Details`, `Update Stock Item` |
| **Worksheet** | on-site checklists, captured photos, signatures | `List Worksheet Answers` (per job), `List Worksheet Definitions` | (read-only resource) |
| **Job Type** | what kinds of jobs are configured | `List Job Types`, `Get Job Type` | (read-only) |
| **Reference Data** | department codes, nominal codes (for invoice/quote lines) | `List Department Codes`, `List Nominal Codes` | (read-only) |
| **Worksheet Group** | folders that organise worksheet templates | `List Worksheet Groups` | (read-only) |

---

## 3. Disambiguation guide (avoid common AI mistakes)

| If the agent is tempted to... | ...do this instead |
|---|---|
| Use `Get Job` for a quick lookup | Prefer `Get Job by ID` (lightweight). Reserve `Get Job` for full enriched detail incl. worksheets and history. |
| Cancel a job that was attended but failed | Use `Set Job Result` with `completedWithIssues` and a result string. `Cancel Job` is for jobs that didn't happen. |
| Create an invoice line item without reference data | First call `List Reference Data` (department + nominal codes) and `List Job Types` for tax IDs. |
| Search jobs by scheduled date | `List Jobs` filters by **created** date. To filter by scheduled time, list a wider window then filter the result by `plannedStartAt` in a downstream node. |
| Look up an engineer by name as the customer/site | Engineers are `Resource`, customers/sites are `Contact`. They are different resources. |
| Edit a contact and only supply one field | `Edit Contact` requires name, group ID, and lat/lng even if unchanged — re-supply them from `Get Contact`. |
| List invoices/quotes with no filter | Either supply at least one filter or accept the node's last-12-months fallback. |
| Make up custom field IDs on Create/Edit Job | Custom field `definitionId`s come from `Get Job Type`. Always look them up. |

---

## 4. ID lookup map

To avoid agents hallucinating IDs, here's the source for every ID the node accepts:

| ID | Source operation |
|---|---|
| `jobId` | `List Jobs`, any prior `Get Job*` step |
| `contactId` (customer/site) | `List Contacts` |
| `resourceId` (engineer) | `List Resources` |
| `vehicleId` | `List Vehicles` |
| `personId` (string UUID) | `List Persons` |
| `typeId` (job type) | `List Job Types` |
| `groupId` (depending on context) | `List Contact Groups` / `List Resource Groups` / `List Worksheet Groups` |
| `worksheetId` | `List Worksheet Definitions` |
| `noteTypeId` | `List Note Types` |
| `taxId` | (BigChange tax codes — provided by client config; not yet exposed via this node) |
| `nominalCodeId` | `List Nominal Codes` |
| `departmentCodeId` | `List Department Codes` |
| `productCategoryId` | `List Product Categories` |
| `stockDetailsId` (SKU) | `List Stock Details` |
| `stockItemId` (physical unit) | `List Stock Items` |
| `invoiceId` / `lineItemId` | `List Invoices` / `List Invoice Line Items` |
| `quoteId` / `lineItemId` | `List Quotes` / `List Quote Line Items` |
| `jobGroupId` | `List Job Groups` |
| `constraintId` | `List Job Constraints` (per job) |

---

## 5. Status values reference

**Job status** (`List Jobs` → status filter, also seen on individual jobs):

`new`, `read`, `accepted`, `refused`, `scheduled`, `unscheduled`, `rescheduled`,
`onTheWay`, `started`, `lateStart`, `lateFinish`, `completedOk`,
`completedWithIssues`, `cancelled`, `suspended`, `sent`.

**Contact status**: `normal`, `contactOnStop`, `creditLimitOnStop`.

**Note status**: configured per tenant — discover via `List Note Types`.

**Job constraint types** (for `Create Job Constraint`):

`jobMustStartAfter`, `jobMustStartBefore`, `jobMustCompleteBefore`,
`jobMustStartInAvailableHours`, `jobMustCompleteInAvailableHours`,
`jobResource`, `jobResourceGroup`, `jobVehicle`, `jobVehicleGroup`,
`jobRequiresResourceSkill`, `jobRequiresVehicleAttribute`.

**Job stock action** (for `Create Job Stock`):

`noMovement`, `broughtAndLeft`, `broughtAndTakenBack`, `onSiteAndLeft`,
`onSiteAndTakenBack`, `usedInStock`.

---

## 6. Worked examples

### Example A — "Show me all jobs for Acme yesterday that completed with issues"

1. `List Contacts` → name=`Acme` → take `id` (e.g. `4012`)
2. `List Jobs` → `createdAtFrom=<yesterday 00:00Z>`, `createdAtTo=<yesterday 23:59Z>`,
   `contactId=4012`, `status=["completedWithIssues"]`, `simplify=true`
3. For each job, optionally `Get Job` (enriched) for worksheet answers.

### Example B — "Raise an invoice for job 12345"

1. `Get Job by ID` (`jobId=12345`) → confirm it's `completedOk`/`completedWithIssues`
   and grab `contactId`.
2. `List Department Codes`, `List Nominal Codes` → pick the right ones.
3. `Create Invoice` (`currencyCode='GBP'`, `jobId=12345`, `contactId=<contactId>`).
4. `Create Invoice Line Item` for each billable line.
5. `Mark Invoice Sent`.

### Example C — "Reassign job 12345 to engineer Sarah Patel for tomorrow at 9am"

1. `List Resources` → name=`Sarah Patel` → take `id` (e.g. `87`).
2. `Schedule Job` (`jobId=12345`, `resourceId=87`,
   `plannedStartAt=<tomorrow>T09:00:00Z`).

### Example D — "What worksheets did the engineer fill in on job 12345?"

1. `List Worksheet Answers` (`jobIds='12345'`, `simplify=true`).
   (Or `Get Job` (enriched) which embeds them.)

---

## 7. Output etiquette

- When summarising lists, prefer counts + top-N rows over dumping every record.
- Format dates back to the user in their locale; the node's UTC timestamps
  are the source of truth.
- Reference jobs, invoices, quotes, contacts by their **ID** at least once
  in the answer so the user can click through.
- If a write succeeded, echo the resulting `id` and a one-line confirmation.
- If the tool returned an error, surface the message; don't silently retry
  with hallucinated IDs.
