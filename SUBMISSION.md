# n8n Verification Submission

This file documents the submission of `n8n-nodes-vh3ai` to the n8n Creator
Portal for verification. Once the package is verified, this file can be
removed (or kept for reference).

## Pre-flight checklist

- [x] Public GitHub repository: https://github.com/VH3DIGITAL/n8n-nodes-vh3ai
- [x] MIT license (`LICENSE` file at repo root)
- [x] README with installation, credentials, resources, and operations
- [x] No runtime dependencies (`package.json` has no `dependencies` key)
- [x] No `process.env` or filesystem access in node code
- [x] TypeScript with proper `NodeApiError` / `NodeOperationError` handling
- [x] All UI text and documentation in English
- [x] Linter passes — `npm run lint:n8n`, `npm run lint:portal:changed`, and `npx @n8n/scan-community-package@beta n8n-nodes-vh3ai@<version>` (always `@beta`; `@latest` has been mistagged older)
- [x] `n8n.n8nNodesApiVersion` is a positive integer (`1`, not `1.1`) — required by n8n Cloud verification
- [x] `package.json` contains `n8n-community-node-package` keyword
- [x] `package.json` n8n attribute lists nodes and credentials
- [x] Credentials test endpoint defined (`Vh3AiApi.credentials.ts` → `test`)
- [x] Both nodes carry `usableAsTool: true` for AI-agent compatibility
- [x] GitHub Actions publish workflow with `id-token: write` permission and
      `npm publish --provenance` flag
- [ ] npm Trusted Publisher configured (or `NPM_TOKEN` secret set)
- [ ] First release published from GitHub Actions (tag `v0.6.5` or higher)
- [ ] Submitted via https://creators.n8n.io/nodes

## npm publish setup (one-time)

### Recommended: OIDC Trusted Publisher (no secret needed)

1. Log in to https://www.npmjs.com/ as the package owner.
2. Open the package settings for `n8n-nodes-vh3ai`.
3. **Publish access** → **Trusted Publishers** → **Add a publisher**.
4. Select **GitHub Actions** and fill in:
   - Repository owner: `VH3DIGITAL`
   - Repository name: `n8n-nodes-vh3ai`
   - Workflow name: `publish.yml`
   - Environment: (leave blank)
5. Save. No `NPM_TOKEN` secret required.

### Fallback: Granular access token

If Trusted Publisher is unavailable:

1. https://www.npmjs.com/ → Access Tokens → Generate New Token → **Granular
   Access Token**.
2. Scope: package `n8n-nodes-vh3ai`, permission **Read and write**.
3. Copy the token, then in this repo set the secret:

   ```bash
   gh secret set NPM_TOKEN --repo VH3DIGITAL/n8n-nodes-vh3ai --body "<paste-token>"
   ```

   Or via the GitHub UI: Settings → Secrets and variables → Actions → New
   repository secret → name `NPM_TOKEN`.

## First publish

Once npm auth is configured:

```bash
# From the repo root, after bumping version in package.json:
git tag v0.6.5
git push origin v0.6.5
```

The `Publish to npm` workflow will run, build, lint, test, and publish with
provenance. Verify the published package shows the green "Provenance" badge
on the npm package page.

## Submission text for the Creator Portal

Use the text below when filling in the n8n Creator Portal form at
https://creators.n8n.io/nodes.

---

**Package name:** `n8n-nodes-vh3ai`

**npm URL:** `https://www.npmjs.com/package/n8n-nodes-vh3ai`

**GitHub URL:** `https://github.com/VH3DIGITAL/n8n-nodes-vh3ai`

**Description**

`n8n-nodes-vh3ai` is the first-party integration for the **VH3 AI field
service intelligence platform** (https://vh3.ai). It exposes the platform's
two complementary API tiers as a single, cohesive integration:

- **VH3 AI** — operational CRUD against the VH3 Connect API: jobs,
  contacts, engineers, vehicles, worksheets, invoices, quotes, notes,
  persons, job groups, stock, and reference data.
- **VH3 AI PRO** — the AI intelligence layer (VH3 FSI API): enriched job
  feed, semantic search and investigation, agent chat (Connie), email
  triage, sentinels, cases, weather context, and intelligence profiles.

Both nodes share a single `vh3AiApi` credential type and are marked
`usableAsTool: true` for n8n AI-agent compatibility.

**Why two nodes in one package**

The package contains two `INodeType` classes for the same platform — this
is analogous to (and explicitly permitted by) the "main node + trigger
node" pattern in the verification guidelines. Specifically:

1. Both nodes integrate the **same third-party service** — the VH3 AI
   platform — exposed via two API gateways under the same domain
   (`api.vh3connect.io`).
2. They share a **single credential type** (`vh3AiApi`). Users configure
   one set of credentials and authenticate to both nodes.
3. They are **complementary tiers**, not unrelated APIs: VH3 AI is the
   record-of-truth CRUD layer; VH3 AI PRO is the AI intelligence layer
   that consumes the same underlying data and adds search, classification,
   triage, and agent-driven workflows on top.
4. Splitting the nodes across two packages would force every customer to
   install two community packages and configure two credential types for
   what is architecturally one platform integration — degrading the
   verified-node user experience this programme exists to deliver.

**Compliance with the verification guidelines**

- ✅ Not an existing built-in node.
- ✅ Not a logic / flow control node.
- ✅ Single third-party service (VH3 AI platform).
- ✅ Not a generic API proxy — the package is the official, typed,
  first-party integration for the VH3 AI platform, maintained by VH3.
- ✅ Repository public, MIT-licensed, README present.
- ✅ Published from GitHub Actions with provenance attestation.
- ✅ Zero runtime dependencies.
- ✅ No `process.env` or filesystem access.
- ✅ TypeScript with `NodeApiError` / `NodeOperationError` error handling.
- ✅ English-only UI and documentation.
- ✅ Passes `npm run lint:n8n`, `npm run lint:portal:changed`, and `npx @n8n/scan-community-package@beta n8n-nodes-vh3ai@<version>`.
- ✅ `n8n.n8nNodesApiVersion` is integer `1` (not float `1.1`).

**Maintenance commitment**

VH3 AI maintains this package as a first-party integration. The platform
team owns the code, the npm publishing pipeline, and the API gateways the
nodes call. Issues filed against the GitHub repository are triaged by
the same team that builds and operates the underlying API.
