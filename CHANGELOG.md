# Changelog

All notable changes to `n8n-nodes-vh3ai` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0 minor releases may include breaking changes; these are explicitly called out.

## [0.10.7] — 2026-06-27

### Fixed

- **Attachments (Web Services) — Retrieve an attachment by Id now returns a binary item.** The `wsAttachmentsGetanattachment` operation previously decoded the raw PDF response body as JSON text, producing garbled `%PDF-1.7` rows. The operation now requests the file with `encoding: arraybuffer`, reads the `Content-Type` and `Content-Disposition` response headers, and returns a proper n8n binary item under `binary.data` with the correct MIME type and filename. All other Web Services operations are unchanged.

## [0.10.6] — 2026-06-26

### Removed

- **Sentinel (VH3 AI) — Threshold Overrides (JSON) field removed from Run All Sentinels.** The multi-sentinel JSON override field has been removed from the "All Sentinels" run path. It was causing validation errors due to stale saved values in existing workflows. Per-sentinel threshold overrides (via the structured **Threshold Overrides** collection when a specific sentinel is selected) continue to work as before.

## [0.10.5] — 2026-06-26

### Fixed

- **Sentinel run-all (`POST /sentinels/run`) — `list_type` validation error.** The run-all body now always includes `sentinelIds: []`. The VH3 AI backend requires `sentinelIds` to be a list; omitting it caused a validation error. An empty list means "run all enabled sentinels". The backend proxy functions (`fsi/sentinels_run` and `fsi/sentinels_run_single`) now accept and forward `paramOverrides` and `exclusions` inputs — these were previously stripped at the API layer and never reached the sentinel engine.
- **Sentinel `paramOverrides` and `exclusions` not forwarded.** Both API endpoints (`sentinels/run` and `sentinels/run/{sentinel_id}`) now declare `paramOverrides?` and `exclusions?` as inputs and pass them through to the underlying functions, which conditionally append them to the request body.

## [0.10.4] — 2026-06-24

### Added

- **Sentinel (VH3 AI) — full registry parity (19 sentinels).** The Run Sentinels enum now lists all 19 FSI sentinels (added `timing_anomaly_detector`, `dormant_customer_revival`, `service_interval_due`, `single_service_customer`, `engineer_flagged_followup`, `seasonal_uplift_window`, `geographic_cluster_opportunity`). IDs and labels mirror `backfill/sentinels/registry.py`.
- **Sentinel › per-sentinel threshold overrides.** Selecting a specific sentinel reveals a **Threshold Overrides** collection containing only that sentinel's tunable parameters (registry keys, snake_case, with the registry default shown). Only fields you add are sent as `paramOverrides[<sentinelId>]`; omitted keys use the registry default. Zero is preserved as a valid override.
- **Sentinel › run-all overrides via JSON.** When `Sentinel = All`, a **Threshold Overrides (JSON)** field accepts a multi-sentinel override map (or a full settings object with a top-level `paramOverrides` key, e.g. a stored tenant profile).
- **Sentinel › exclusions.** A **Exclusions** collection (`excludedSiteKeys`, `excludedJobTypeIds`, `excludedContactIds`, `excludedResourceIds`, comma-separated) is sent as `exclusions` on any run. Empty fields are omitted.
- New `GenericFunctions` helpers (`buildSentinelExclusions`, `buildSingleSentinelOverrides`, `parseSentinelOverridesJson`) with unit tests.

### Changed

- **Run Sentinels request shape.** `paramOverrides` and `exclusions` are now attached to both `POST /sentinels/run` and `POST /sentinels/run/{id}` when set. The run-all call no longer sends `sentinel_ids: []`; it omits `sentinelIds` entirely (empty body aside from auth = run all enabled).
- **`sentinelId` is no longer expression-driven** (`noDataExpression: true`) so the conditional per-sentinel threshold fields resolve correctly. Drive run-all overrides via the JSON field instead.

### Notes

- Additive to existing workflows: a saved Run Sentinels node with no overrides produces the same call as before (now without the empty `sentinel_ids`), and FSI registry defaults continue to apply.
- Docs `vh3ai-n8n-as-code-reference.md` §6.3 updated with the 19 sentinels, override fields, and exclusions.

## [0.10.3] — 2026-06-16

### Added

- **Attachment (Web Services)** — new resource. List attachments for any BigChange entity; retrieve an attachment by ID. Uses a shared generic route-dispatch pattern to keep the node description footprint minimal.
- **Report (Web Services)** — new resource. Driver/vehicle performance and infringement reports via BigChange Web Services.
- **Tracking (Web Services)** — new resource. GPS journeys, live positions, and odometer readings via BigChange Web Services.
- **Search › Search Summary Sections** (`searchSummarySections`) — semantic hybrid search across the CustomerSummary knowledge base (`POST /search/summary-sections`). Optional `contact_id` scopes results to one customer; optional `section_key` scopes to one of the 7 sections (`customer_overview`, `job_history_patterns`, `systems_equipment`, `key_analyses`, `operational_performance`, `communication_summary`, `risk_opportunity`). Omitting `section_key` searches the entire knowledge base.
- **Search › Get Summary By Contact** (`getSummaryByContact`) — retrieve all 7 stored CustomerSummary sections for a single contact in one call (`GET /search/summary-sections/by-contact/{company_id}/{contact_id}`). Optional `full_report` flag appends an assembled markdown string to the response.

### Notes

- Web Services helpers (`vh3WebServicesGetRequest`, `vh3WebServicesPostRequest`, `omitEmptyWsParams`, `toWebServicesDateTime`, `extractWsItems`) are isolated in `GenericFunctions.ts` and share no code paths with the FSI or BigChange API helpers.
- Purely additive — no existing operations, fields, credentials, or request shapes were modified.

## [0.10.2] — 2026-06-07

Restores v0.9.2 functionality. Versions 0.10.0 and 0.10.1 shipped an oversized node description (1,019 properties / 564 KB) that prevented loading on managed n8n instances. This release is identical to 0.9.2 in all respects except the version number. Web Services features are preserved on the `dev` branch for a future, lighter release.

## [0.9.2] — 2026-05-21

Republish of the 0.9.1 release set after a publish-pipeline retag conflict on npm. Contents identical to the intended 0.9.1 — no behavioural difference between 0.9.1 (npm) and 0.9.2.

## [0.9.1] — 2026-05-21

### Added

- **Job Feed › List Account Job Feed** (`listAccountJobFeed`) — new operation on the existing Job Feed (VH3 AI) resource. Paginated job feed scoped to a parent account and all its children via the `HAS_PARENT` graph hierarchy. Pass any contact ID (parent or child) and receive jobs for the entire account tree. Supports the same filters as List Job Feed (status, result, resource, type, category) plus full date-range controls.
- **Job Feed › List Job Feed** — added four new optional filters:
  - **Date From** / **Date To** — ISO date/datetime window to scope the feed.
  - **Date Field** — choose which timestamp the date window applies to (`createdAt`, `plannedStartAt`, `plannedEndAt`, `actualStartAt`, `actualEndAt`).
  - **Direction** — sort direction on createdAt (`asc` / `desc`).
- **package.json `keywords`** — expanded to surface the package against the major VH3 AI / BigChange resource verbs (`connie`, `jobs`, `contacts`, `resources`, `vehicles`, `worksheets`, `invoices`, `quotes`, `reports`, `search`, `cases`, `investigate`, `intelligence`, `briefing`, `account-report`, `email`, `triage`) for npm and n8n Community Nodes discovery.

### Changed

- **Job Feed › List Job Feed / List Account Job Feed — Status filter** is now multi-select (`multiOptions`). Multiple statuses are sent to the API as a comma-separated list (e.g. `completedOk,completedWithIssues`); empty selections are not sent. Workflows that only ever picked a single status continue to work unchanged.

### Notes

- Purely additive release — no existing operations, fields, credentials, or request shapes were modified. Existing workflows continue to run unchanged.
- Both `jobFeed` operations use the existing resource value; no new resource dropdown entry or `fsiResources` Set change was needed.
- Zero/empty optional filters are not sent to the API (guarded by truthiness checks), preventing accidental 422s from the upstream.

## [0.8.1] — 2026-05-20

### Fixed

- **package.json** — set `n8n.n8nNodesApiVersion` to `1` (was `1.1`). n8n Cloud verification requires a positive integer; no node or credential code changed.

## [0.8.0] — 2026-05-19

### Added

- **Sales Opportunity (BigChange)** — new resource with 10 operations covering the full CRM pipeline:
  - **List Sales Opportunities** (`/sales_opportunities/list`) — filter by `id[]`, `status[]`, `contactId`, `ownerId`, `reference[]`, `createdAtFrom/To`, or `dueDateFrom/To`. When no filter or date range is supplied, the node automatically scopes the query to the last 12 months (matching the Invoices / Quotes fallback).
  - **Get Sales Opportunity** (`/sales_opportunities/sales_opportunity`).
  - **Edit Sales Opportunity** (`/sales_opportunities/edit`, PATCH semantics — omit a field to keep its existing value). Supports stage, probability, owner, status, dates, notes, codes, and custom fields.
  - **List Probabilities** (`/sales_opportunities/probabilities/list`) — reference data for pipeline weighting.
  - **List Stages** (`/sales_opportunities/stages/list`) — reference data for pipeline progression.
  - **List / Get / Create / Edit / Delete Sales Opportunity Line Item** (`/sales_opportunities/line_item/*`).
- **Purchase Order (BigChange)** — new resource with 11 operations covering the full procurement lifecycle:
  - **List Purchase Orders** (`/purchase_orders/list`) — filter by `id[]`, `jobId[]`, `jobGroupId[]`, `contactId[]`, `reference[]`, or `createdAtFrom/To`. Same 12-month fallback as Invoices / Quotes.
  - **Get Purchase Order** (`/purchase_orders/purchase_order`).
  - **Create Purchase Order** (`/purchase_orders/create`) — `supplierId` required. Optional currency, links to job / job group / contact, delivery site, series, notes, codes, and custom fields.
  - **Edit Purchase Order** (`/purchase_orders/edit`, PATCH semantics).
  - **List / Get Purchase Order Series** (`/purchase_orders/series/list`, `/purchase_orders/series`) — numbering sequences (reference data).
  - **List / Get / Create / Edit / Delete Purchase Order Line Item** (`/purchase_orders/line_item/*`).

### Notes

- Both resources follow the canonical finance contract used by Invoices and Quotes: `{result, status}` with `result.items` / `pageNumber` / `pageSize` / `pageItemCount` on lists, and `result` as the entity on single-record GETs. Pagination, `Return All`, and `Simplify` (compact) toggles behave identically.
- Optional foreign-key filters on **List Sales Opportunities** (`contactId`, `ownerId`) are only sent when explicitly set to a positive value. This avoids the BigChange 422 returned when these scalar filters are submitted as `0`.
- Purely additive release — no existing resource, operation, field, credential, or request shape was modified. Existing workflows continue to run unchanged.
- Authentication is unchanged: both new resources use the same `vh3AiApi` credential (API key + company ID) as every other BigChange resource.

## [0.7.7] — 2026-05-18

### Fixed

- **Email › Classify Email** — corrected end-to-end parameter name mismatch on `/triage/classify`. The n8n node was sending `body` but the API function requires `email_body`; the endpoint was accepting `body` without mapping it correctly. Fixed in both places: n8n node now sends `email_body`, and the `triage/classify` endpoint input field and function-call mapping have been updated to `email_body`.

## [0.7.6] — 2026-05-17

### Added

- **User (VH3 AI)** — new resource with 5 operations for company user management:
  - **List Users** (`listUsers`) — get all active (non-archived) users for the company (`GET /users/list`).
  - **List Invites** (`listInvites`) — get all pending (unaccepted) invitations (`GET /users/invites`).
  - **Invite User** (`inviteUser`) — send an email invitation to join the company (`POST /users/invite`). Requires email, role, company name, and inviter name.
  - **Update User Role** (`updateUserRole`) — change the role assigned to a user (`PUT /users/{user_id}/role`).
  - **Delete User** (`deleteUser`) — soft-delete (archive) a user (`DELETE /users/{user_id}`).
- New `vh3FsiPutRequest` helper in `GenericFunctions.ts` for FSI PUT operations.

### Notes

- User management endpoints are served from the FSI API (`fsiBaseUrl`) using the same `company_id + api_key` authentication as all other VH3 AI resources. No new credential fields required.

## [0.7.5] — 2026-05-16

### Fixed

- **Email › Classify Email** — the email body was being sent to the API as `email_body` but the `/triage/classify` endpoint requires the field to be named `body`. All classify calls were returning `400 Missing param: body`. Field name corrected.

## [0.7.4] — 2026-05-16

### Added

- **Email › Batch Classify Emails** (`batchClassifyEmail`). New operation that runs up to 50 emails through the full four-stage triage pipeline in a single call (`POST /triage/batch`). Portal short-circuit and pre-filter hits are resolved instantly (zero LLM tokens); only genuinely novel emails consume a Gemini call. Per-item errors are captured at their index — a failure on one email does not abort the rest of the batch. Accepts a JSON array of email objects; each item must include `subject`, `email_body`, and `sender_address`, with the same optional fields as single-email classify.
- **Email › List Triage Rules** (`listTaxonomyRules`). New operation that returns the tenant's active routing rules with their full condition/action JSON from the taxonomy database (`GET /triage/taxonomy/rules`). An optional **Phase** selector filters to `pre_classify` (noise filters) or `post_classify` (routing decisions); omit to return all rules.
- **Email › List Triage Categories** — updated to read from the new taxonomy database endpoint (`GET /triage/taxonomy/categories`), which returns richer per-category data: `category_code`, `display_name`, `default_destination`, `prompt_includes`, and `prompt_excludes`, sorted by priority. The previous `/triage/categories` endpoint is superseded.
- **Search › Autocomplete — `Person` filter type.** `person` is now available in the **Filter by Type** multi-select. This matches the `"type": "person"` values already returned by the API and was previously invisible in the node UI.
- **Search › Autocomplete — `Limit` description corrected.** The tooltip now accurately states that the limit applies per entity type (the API returns up to N results for each type), not as a global total.
- **Search › Autocomplete — `Simplify` toggle.** A new **Simplify** boolean (default `true`) strips null, empty string, and empty array fields from each result — including inside the nested `extra` object — before returning data. Useful when passing results to an LLM or AI agent to reduce token waste.

### Notes

- The hardcoded `_enforce_system_safety` override that previously forced any email containing health/safety keywords to `health_safety_compliance` has been removed from the classification pipeline. Safety is now a configurable routing rule (`safety_override`) stored in the tenant's taxonomy — visible, editable per tenant, and applied through the standard rule engine rather than buried in Python code.

## [0.7.3] — 2026-05-14

### Changed

- **Email › Ingest Email** now routes to `/ingest/email/portal` instead of the legacy `/ingest/email` endpoint. The operation is renamed to **Ingest Portal Email** in the node UI to reflect the new surface area. Input schema and behaviour are identical — this is a drop-in replacement with no workflow migration required.

## [0.6.5] — 2026-05-08

### Changed

- **Public source repository.** The package is now developed in the public repository at [`github.com/VH3DIGITAL/n8n-nodes-vh3ai`](https://github.com/VH3DIGITAL/n8n-nodes-vh3ai) under MIT licence. `package.json#repository.url` updated accordingly.
- **Published from GitHub Actions with npm provenance.** The release workflow now runs in CI with OIDC Trusted Publisher authentication and `npm publish --provenance`, producing a cryptographically verifiable provenance attestation for every release. This satisfies the n8n verified-community-node publishing requirement that becomes mandatory on May 1 2026.

### Added

- `LICENSE` file at the repository root (MIT, matches `package.json#license`).
- `SUBMISSION.md` — pre-flight checklist and submission notes for the n8n Creator Portal verification request.

### Notes

No node behaviour, parameter, or API surface changes in this release. Existing `0.6.4` workflows continue to work unchanged.

## [0.6.4] — 2026-05-06

### Added

- **Jobs › Create Job (Dynamic Fields)** (`createJobDynamic`). A second create-job operation alongside the existing `createJob`. Where `createJob` exposes custom fields as a fixed-collection UI for manual configuration, `createJobDynamic` accepts a JSON expression (`customFieldsJson`) that resolves at runtime to an array of `{ definitionId, value }` objects. Designed for automated pipelines that build their custom field set from upstream data (e.g. an email-extraction Code node).

### Fixed

- **Jobs › Create Job** previously failed with a `customFields` validation error even when the user did not supply any custom fields. The upstream API now treats `customFields` as a properly nullable optional list, so calls without custom fields succeed. Existing callers that supply custom fields are unaffected.
- **Jobs › Create Job** requests now reach the upstream BigChange API with a correct `Content-Type: application/json` header. A missing header on the upstream side previously caused every Create Job call to fail with HTTP 415.
- Upstream BigChange error bodies now propagate cleanly through the API to the n8n error output instead of being replaced with a `null` payload, making failed Create Job calls debuggable from the n8n execution log.

## [0.6.3] — 2026-05-01

### Changed

- **README** rewritten to reflect the 0.6.x feature set on the npm package page: full Simplify coverage across all 14 resources, the new operations added in 0.6.0, the 12-month fallback behaviour on List Invoices / List Quotes, an AI-tool-compatibility section explaining the auto-generated `*Tool` variants and `$fromAI()` parameter wiring, and a link to the new BigChange tool-usage guide.

This release is README-only — no node code, schema, or runtime behaviour changes from 0.6.2.

## [0.6.2] — 2026-05-01

### Changed

- **VH3 AI (BigChange) — agent-grade descriptions across every resource and operation.** The node ships with `usableAsTool: true`, so every `description` field is read by AI agents at tool-selection time. Every operation in all 14 description files (Jobs, Contacts, Invoices, Quotes, Notes, Persons, Resources, Vehicles, Stock, Job Groups, Job Types, Worksheets, Worksheet Groups, Reference Data) now states verb-first what it does, what IDs it requires (and where to source them), what it returns, when to pick it over a sibling op, and surfaces BigChange-specific gotchas inline.
- **VH3 AI — Resource selector enriched.** Every entry in the resource dropdown now carries a description explaining when to pick it. Reduces the failure mode where an LLM picks Contact when the user asked about an engineer, or Stock when they asked about Reference Data.
- **JobsDescription / ContactsDescription field descriptions tightened** for the high-impact filters: `createdAtFrom` / `createdAtTo`, status multi-select, `contactId` / `resourceId` / `typeId` / `vehicleId`, custom field semantics. Each now states format, units, and where to source the IDs.

### Added

- `docs/vh3ai-bigchange-tool-guide.md` — copy-paste agent-prompt companion. Includes a drop-in agent system prompt, resource cheat sheet, disambiguation guide, exhaustive ID lookup map, status-value reference, four worked examples, and output-etiquette guidance.

This release contains no runtime / API behaviour changes — pure copy and documentation.

## [0.6.1] — 2026-05-01

### Fixed

- **VH3 AI › List Invoices / List Quotes** would fail with HTTP 422 ("at least one filter or date range must be provided") when called with no Additional Fields. The node now applies a sensible default — last 12 months → now — when the caller has not supplied any filter or date range. Explicit values still take precedence; this only kicks in when nothing is set, so existing workflows are unaffected.
- New shared helper `defaultCreatedAtRange(monthsBack)` in `GenericFunctions.ts` returns a `{ createdAtFrom, createdAtTo }` window in the strict UTC format the API requires.

### Server-side

- The upstream `compact_response` utility is now envelope-shape-agnostic. Previous versions only compacted responses wrapped as `{ response: { result, status } }` and silently no-op'd on flatter `{ result, status }` envelopes, so Simplify appeared to be ignored on roughly half of the read endpoints. This single fix activates Simplify across all 51 endpoints retrofitted in 0.6.0.

## [0.6.0] — 2026-05-01

Companion release to a sweep across the VH3 AI node and the upstream BigChange API integration. The headline is end-to-end **Simplify** support for every read-shaped endpoint — flick the toggle on any list/get and the API returns a compacted, LLM-friendly payload (nulls and empties stripped, custom fields flattened to a key → value dict).

### Added

- **Invoices › Get Invoice Line Item.**
- **Notes › Get Note Type.**
- **Persons › List Consent History.**
- **Reference Data › Get Department Code.**
- **Reference Data › Get Nominal Code.**
- **Stock › Get Product Category.**
- **Stock › Get Stock Supplier.**
- **Simplify (compact response) toggle** on ~50 read operations across all 14 VH3 AI resource description files. Default `false`. When ON, the node sends `compact=true` and the upstream compactor strips `null` / `""` / `[]` / `{}`, preserves `contactName` / `contactAddress` / `reference` / `result`, and flattens `customFields[]` into a dict with a parallel `_customFieldIds` map.

### Changed

- **VH3 AI › Reference Data › List Department Codes** — `Sort By` options trimmed from `[Code, Created At, Description, Name]` → `[Code, Description]` to match what the upstream `/v1/departmentCodes` endpoint actually accepts.
- **VH3 AI › Worksheets › List Worksheet Definitions** retroactively wired to Simplify.

### Fixed

- **`/worksheet/worksheet_get`** — previously returned HTTP 500 ("Function does not exist") because of a missing function reference. Now wired correctly and confirmed working end-to-end via the `Get Worksheet` operation.
- **`/reference_data/department_codes_list`** — removed five phantom inputs (`status`, `name`, `reference`, `parentId`, `groupId`) that were not declared on the underlying function and trimmed the `sortBy` enum to match what BigChange accepts.
- **`/worksheet/worksheet_list`** — removed two phantom arguments (`sortBy`, `direction`) that the upstream endpoint does not accept.

## [0.5.0] — 2026-05-01

### Added

- **VH3 AI › Get Job by ID — Include Worksheets** boolean. When ON, the node sends `worksheets=true` and the API fetches and appends cleaned worksheet data to the response.
- **VH3 AI PRO › Connie › Chat — Experimental Mode** boolean. When ON, routes to the experimental Connie pipeline.

### Changed

- **VH3 AI display name** is now **VH3 AI - BigChange API** (was: VH3 AI). The machine identifier (`name: 'vh3Ai'`) is unchanged so existing workflows continue to function. The rename clarifies system scope.
- **VH3 AI › Get Job by ID — Simplify** default flipped from `true` to `false` (paired with the upstream default flip).

### Removed

- **BREAKING** — VH3 AI PRO: removed the **Agent** resource entirely (operations: `Ask`, `Search`, `Chat with Connie`, plus the `experimentalMode` toggle). The `Chat with Connie` operation is fully covered by the dedicated **Connie** resource (now with its own `Experimental Mode` toggle); the `Ask` and `Search` agent operations are not exposed in this release.
- **BREAKING** — VH3 AI PRO: removed Connie operations **Chat (Voice)** and **Generate Summary**. Neither is currently used by shipped workflows.

### Fixed

- VH3 AI date inputs were being sent raw (e.g. `2026-04-01 00:00:00`) on `listQuotes`, `listInvoices`, `listContacts`, `createNote`, `editNote`, `createJobGroup`, and `editJobGroup`, causing the API to reject the request with `Invalid date format. Please enter date in UTC format: YYYY-MM-DDTHH:MM:SSZ`. All date / datetime fields now route through a shared `toUtcDateTime` helper in `GenericFunctions.ts` and are normalised to the strict UTC format the API expects.

## [0.4.1] — 2026-04-17

### Changed

- README: removed links to internal documentation that were not intended for public consumption on the npm package page.

## [0.4.0] — 2026-04-17

### Added

#### VH3 AI

- **Simplify** top-level boolean (Gmail-style) on `listJobs`, `getJobById`, `listContacts`, `getContact`. When ON, sends `compact=true` for LLM-optimised payloads.
- New distinct icon to differentiate from the Pro node.

#### VH3 AI PRO

- **Simplify** on `listJobFeed` and `getEnrichedJob`.
- New **Cases** resource (14 operations): create, list, search, get, update, transition (status lifecycle), comments, activity timeline, items (link/unlink), participants (add/remove), reverse lookup by external item.
- New **Connie** resource (6 operations): chat, voice chat, generate summary, search history, list sessions, get session messages.
- New **Pulse** resource: tenant business-health dashboard snapshot.
- New **Weather** resource (4 operations): for-job, for-site, forecast, historical.
- New **Intelligence** resource (3 operations): list profiles, get profile, generate profiles. Includes a **Profiled Only** boolean (defaults ON) so empty profiles are stripped at the API layer.
- New **Investigate** resource: hybrid vector + graph multi-step investigation.
- Existing **Agent** resource extended with `agentSearch` and `agentAsk` operations.
- Existing **Email** resource extended with `listTriageCategories` operation.
- Existing **Search** resource extended with `searchIntakeBasic` (non-enriched variant alongside the enriched one).
- Existing **Reports** resource: `generateReport` now accepts a `sections` parameter.
- New PATCH and DELETE FSI request helpers in `GenericFunctions` to support Cases CRUD.
- New distinct icon for the Pro node.

#### Search ergonomics

- New **Date From / Date To / Max Age (Months)** post-response filter on `searchOutcomes`, `searchIntake`, and `searchIntakeBasic`. Filters on `actualStartAt` with fallbacks through `actualEndAt`, `createdAt`, `created_at`, `plannedStartAt`, `scheduledAt`. Items missing all timestamps are kept rather than silently dropped.
- New **Filter by Type** multi-select (customer / engineer / job / site) on `autocomplete`. Major win for the `usableAsTool` agent path — agents can scope autocomplete to a single entity type in the tool call instead of post-processing mixed results.

### Changed

- **BREAKING (additive interpretation in 0.x)** — search response envelopes are now unwrapped at the n8n layer. `searchOutcomes`, `searchIntake`, and `searchIntakeBasic` previously returned a single n8n item containing `{ hits: [...], count: N }`; they now return one n8n item per hit. `autocomplete` previously returned a single n8n item containing `{ results: [...], query, count }`; it now returns one n8n item per result. **Migration:** any downstream node referencing `$json.hits[N].xxx` or `$json.results[N].xxx` should be updated to operate on the per-item shape (or to use a `Set` / `Item Lists` node to re-aggregate if the wrapper is needed).

### Fixed

- VH3 AI PRO `getEnrichedJob` previously had no Additional Fields collection at all — `compact` was unreachable from the UI even though the executor read it. Now exposed as the top-level Simplify switch.

## [0.3.0] — 2026-03-20

### Added

- Quotes resource on VH3 AI with full CRUD, line items, and state transition operations.
- Contact list filters and job custom fields.

### Changed

- CI publish workflow: clear error when `NPM_TOKEN` secret is unset, normalised repo URL, setup-node bumped to 22.

[0.9.2]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.9.2
[0.9.1]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.9.1
[0.8.1]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.8.1
[0.8.0]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.8.0
[0.7.7]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.7.7
[0.7.6]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.7.6
[0.7.5]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.7.5
[0.7.4]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.7.4
[0.7.3]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.7.3
[0.6.5]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.6.5
[0.6.4]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.6.4
[0.6.3]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.6.3
[0.6.2]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.6.2
[0.6.1]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.6.1
[0.6.0]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.6.0
[0.5.0]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.5.0
[0.4.1]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.4.1
[0.4.0]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.4.0
[0.3.0]: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai/releases/tag/v0.3.0
