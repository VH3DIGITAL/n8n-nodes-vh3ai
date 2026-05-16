# Changelog

All notable changes to `n8n-nodes-vh3ai` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0 minor releases may include breaking changes; these are explicitly called out.

## [Unreleased]

### Added

- **Search › Autocomplete — `Person` filter type.** `person` is now available in the **Filter by Type** multi-select. This matches the `"type": "person"` values already returned by the API and was previously invisible in the node UI.
- **Search › Autocomplete — `Limit` description corrected.** The tooltip now accurately states that the limit applies per entity type (the API returns up to N results for each type), not as a global total.

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
