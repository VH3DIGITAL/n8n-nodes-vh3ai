# Agent context — n8n-nodes-vh3ai

Community node package for [VH3 AI](https://vh3.ai) on n8n. Single programmatic node (`Vh3Ai`) with one credential type.

## Layout

- `nodes/Vh3Ai/` — node implementation, handlers, resource descriptions
- `credentials/` — `Vh3AiApi` API key credential
- `dist/` — build output (referenced from `package.json` `n8n` manifest)

## Linting and verification

| Command | Purpose |
|--------|---------|
| `npm run lint` | ESLint community ruleset on `package.json` (does **not** catch Creator Portal style) |
| `npm run lint:manifest` | Validates `package.json` n8n manifest (integer `n8nNodesApiVersion`, nodes/credentials paths, keyword) |
| `npm run lint:package` | ESLint `community` ruleset on `package.json` |
| `npm run lint:portal:changed` | Same `nodes`/`credentials` style rules Creator Portal uses, on files changed vs `origin/main` |
| `npx @n8n/scan-community-package@beta n8n-nodes-vh3ai@<version>` | Official portal scanner (always `@beta`, not `@latest`) |

**Critical:** `n8n.n8nNodesApiVersion` must be **`1`** or **`2`** (integer). Never `1.1` or a string. Use `1` for this repo unless explicitly migrating to API v2.

`npx @n8n/node-cli lint` only runs this repo's local ESLint. It is not a portal pass. After description/UI edits, run `npm run lint:portal:changed` before shipping.

## Releases

- Bump `version` in `package.json` and add a `CHANGELOG.md` section.
- Tag `vX.Y.Z` on `main`; `publish.yml` publishes to npm with provenance.
- Resubmit new versions to [n8n Creator Portal](https://creators.n8n.io/nodes) after manifest or verification fixes.
- Full release preflight, tag→publish, and Creator Portal lint traps: `.cursor/skills/n8n-nodes-release/SKILL.md`.

## Conventions

- BigChange resources: `(BigChange)` in display names; VH3 AI intelligence: `(VH3 AI)`.
- Handlers map n8n camelCase UI fields to API snake_case.
- Use `NodeApiError` / `NodeOperationError`; no `process.env` or filesystem access in node code.
- English only for UI strings and docs.
