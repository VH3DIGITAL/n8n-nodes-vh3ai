---
name: n8n-nodes-release
description: >-
  Release and publish n8n-nodes-vh3ai via GitHub Actions with npm provenance,
  local lint prechecks, CHANGELOG bumps, and n8n Creator Portal re-review.
  Use when releasing, publishing, bumping version, tagging vX.Y.Z, fixing
  community-package lint review feedback, or running lint:n8n / lint:portal /
  scan-community-package before or after npm publish.
---

# n8n-nodes-vh3ai release

Ship a new npm version so CI publishes with provenance and n8n can re-scan. Never `npm publish` from a laptop.

## Preflight (gate)

Run from repo root. All must pass before tagging:

```bash
npm ci
npm run lint:n8n                 # eslint community ruleset + manifest + package.json
npm run lint:portal:changed      # Creator Portal style rules on files changed vs origin/main
npm run build
npx @n8n/scan-community-package@beta n8n-nodes-vh3ai   # after a version is on npm; portal uses @beta
```

**Done when:** `lint:n8n`, `lint:portal:changed`, and `build` exit 0. After publish, `@beta` scan of that version should only fail on issues the portal would actually report (it diffs against the last approved release).

### What each check covers

| Command | Catches |
|--------|---------|
| `npm run lint` | ESLint `plugin:n8n-nodes-base/community` on `package.json` (and a weak pass over TS) |
| `npm run lint:manifest` | Integer `n8n.n8nNodesApiVersion`, `n8n.nodes` / `n8n.credentials`, keyword `n8n-community-node-package` |
| `npm run lint:package` | `eslint-plugin-n8n-nodes-base` community ruleset on `package.json` |
| `npm run lint:portal` | **Full-tree** `nodes` + `credentials` + `community` rulesets (`.eslintrc.portal.js`). Hundreds of grandfathered hits — not a publish gate. |
| `npm run lint:portal:changed` | Same ruleset, **only files changed vs `origin/main`** (or `PORTAL_LINT_BASE`). This is the local stand-in for Creator Portal review. |
| `npm run lint:portal:fix` | Autofix portal style on the whole tree (do not run blindly — Limit defaults become 50). |
| `npx @n8n/node-cli@latest lint` | Runs **this repo's local ESLint**. It is **not** the Creator Portal scan. Do not treat a green result as portal-clean. |
| `npx @n8n/scan-community-package@beta n8n-nodes-vh3ai[@version]` | What Creator Portal uses. Lints attested GitHub **source** (`.ts`) plus the npm tarball. `@latest` has been mistagged older — always `@beta`. |
| `publish.yml` post-step scan | Cloud security/manifest scan on the published tarball (`@latest` tag) |

`lint:n8n` = `lint` + `lint:manifest` + `lint:package` (also `prepublishOnly`). It does **not** include portal style rules.

CI (`ci.yml`) runs `lint:n8n` then `lint:portal:changed`.

## Hard rules

- **`n8n.n8nNodesApiVersion`**: integer `1` (this package) or `2` — never `1.1`, never a string. Local ESLint is weaker than Cloud scan; `scripts/validate-package-manifest.mjs` enforces the integer rule.
- **No runtime `dependencies`** in `package.json`; only `devDependencies` / `peerDependencies`.
- **Publish path**: tag `vX.Y.Z` on `main` → `.github/workflows/publish.yml` → `npm publish --provenance --access public` on Node 24 with `id-token: write`.
- **Do not** publish from a developer machine; provenance requires GHA.
- Node UI copy and docs: English only. Errors: `NodeApiError` / `NodeOperationError`. No `process.env` or filesystem in node code.

## Creator Portal style traps (fix before bump)

These fail `lint:portal:changed` / official review even when `lint:n8n` and `npx @n8n/node-cli lint` are green. Autofix with `npx eslint -c .eslintrc.portal.js --fix <files>` then **re-read the diff** — Limit `default` is forced to `50`.

1. **Boolean `description` must start with `Whether`**  
   Bad: `'Set true for late finishes…'`  
   Good: `'Whether to filter for jobs that finished after their planned end time…'`

2. **`options` display names must be alphabetical** (by `name`)  
   Example Sort By order: `Actual End`, `Actual Start`, `Created At`, `End Delta (Mins)`, `Start Delta (Mins)`.  
   Same for operation lists (5+ items) and collection fields (5+ items).

3. **Update optional-field collections must be named `Update Fields`**  
   `displayName: 'Update Fields'` (not `Fields to Update`). `name` stays `updateFields`.

4. **Operation `action` must be sentence case** (eslint `sentence-case`: first word capitalised, rest lowercased).  
   Bad: `'Chat with Connie'` / `'Get a Quotient quote'`  
   Good: `'Chat with connie'` / `'Get a quotient quote'`  
   Parentheses in actions are stripped (`(basic)` → `basic`).

5. **`Return All` description must be exactly**  
   `Whether to return all results or only up to a given limit`

6. **Omit `description` when it matches `displayName`** (case-insensitive).  
   Bad: `displayName: 'Sort Order', description: 'Sort order'`  
   Good: no `description` field.

7. **Description strings that are a single sentence need a final period**, except **resource option descriptions**, which must **not** end with a period.

8. **`Limit` parameters**: `default: 50`, `typeOptions.minValue: 1`, description `Max number of results to return`.

9. **Options-type parameters must default to one of the listed values** (not `''`). For Additional Fields this only applies once the user adds the field.

Run `npm run lint:portal:changed` after any `nodes/**/descriptions/*.ts` or `Vh3Ai.node.ts` edit.

## Release steps

Copy and track:

```
Release:
- [ ] Preflight green (lint:n8n, lint:portal:changed, build)
- [ ] Bump package.json version + CHANGELOG section
- [ ] Commit on main
- [ ] Tag vX.Y.Z and push commit + tag
- [ ] publish.yml success (publish + scan)
- [ ] Confirm npm version / wait for auto re-review if fixing verification
```

### 1. Version + changelog

- Bump `"version"` in `package.json` (semver; patch for lint/review-only fixes).
- Add a top section in `CHANGELOG.md`:

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Fixed | Added | Changed

- Short user-facing why.
```

Match existing Keep a Changelog tone in that file.

**Done when:** version string and changelog section agree.

### 2. Commit

On `main` (or merge to `main` first). Stage only release files (`package.json`, `CHANGELOG.md`, and the code fix). Commit message style from recent history: `fix(area): … (X.Y.Z)` or `chore: release X.Y.Z — …`.

**Done when:** `git status` clean for release paths; branch ahead of origin by the release commit.

### 3. Tag and push

```bash
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

Tag must match `v*` (workflow trigger). Version in the tag equals `package.json`.

**Done when:** tag visible on origin.

### 4. Watch publish

```bash
gh run list --workflow=publish.yml --limit 3
gh run watch <run-id> --exit-status
```

Workflow: `npm ci` → `lint:n8n` → `build` → `test` (continue-on-error) → publish with provenance → `scan-community-package` for that version.

**Done when:** Publish job green including the scan step.

### 5. Verification / re-review

- First verification or portal form text: see `SUBMISSION.md`.
- After a “Changes required” email: publish a **new** version with fixes — n8n auto-detects npm; no manual resubmit.
- Live version may stay on the last approved release until the new one passes.
- Reproduce portal lint with `npx @n8n/scan-community-package@beta n8n-nodes-vh3ai` (not `@latest`).

## CI map

| Workflow | Trigger | Role |
|----------|---------|------|
| `ci.yml` | PR / push `main`/`dev` | Node 22: `lint:n8n`, `lint:portal:changed`, build, test |
| `publish.yml` | push tag `v*` | Node 24: `lint:n8n`, provenance publish, Cloud scan (`@latest` tarball) |

Auth: npm Trusted Publisher on `publish.yml` (preferred) or `NPM_TOKEN` secret — details in `publish.yml` header comments and `SUBMISSION.md`.

## Node conventions (release-adjacent)

- BigChange ops: `(BigChange)` in display names; intelligence: `(VH3 AI)`.
- Handlers: n8n camelCase UI → API snake_case.
- Manifest paths under `n8n.nodes` / `n8n.credentials` must point at `dist/…` built files.

## Pointers

- Agent overview: [AGENTS.md](../../../AGENTS.md)
- Manifest rule: [.cursor/rules/n8n-community-package.mdc](../../rules/n8n-community-package.mdc)
- Portal eslint config: [.eslintrc.portal.js](../../../.eslintrc.portal.js)
- Portal checklist / Trusted Publisher: [SUBMISSION.md](../../../SUBMISSION.md)
