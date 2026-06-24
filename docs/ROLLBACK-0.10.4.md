# Rollback runbook — 0.10.4 (Sentinel overrides)

If the Sentinel utilisation upgrade in **0.10.4** needs to be pulled, roll
**forward** to **0.10.5** that restores the **0.10.3** sentinel behaviour. Do not
unpublish 0.10.4 from npm (npm unpublish is restricted and disruptive); ship a
new patch instead.

## What 0.10.4 changed (scope of the rollback)

- `nodes/Vh3Ai/descriptions/FsiSentinelDescription.ts` — 19-sentinel enum,
  per-sentinel threshold collections, run-all JSON field, exclusions collection.
- `nodes/Vh3Ai/GenericFunctions.ts` — `buildSentinelExclusions`,
  `buildSingleSentinelOverrides`, `parseSentinelOverridesJson`.
- `nodes/Vh3Ai/Vh3Ai.node.ts` — `runSentinels` branch (sends `paramOverrides` /
  `exclusions`; omits `sentinel_ids` on run-all).
- `__tests__/GenericFunctions.test.ts` — sentinel helper tests.
- `docs/vh3ai-n8n-as-code-reference.md` §6.3, `CHANGELOG.md`, `package.json`.

Nothing outside the Sentinel resource was touched, so the revert is isolated.

## Option A — revert the feature commit (preferred, cleanest)

The work landed as a single commit on `feature/sentinel-overrides`. Find it and
revert:

```bash
# from a branch based on the released 0.10.4
git log --oneline --grep "sentinel" -i        # find the 0.10.4 feature commit <SHA>
git revert --no-edit <SHA>                     # restores 0.10.3 sentinel behaviour
```

Then bump and ship 0.10.5:

```bash
# package.json: "version": "0.10.5"
# CHANGELOG.md: add "## [0.10.5]" — "Revert 0.10.4 sentinel overrides; restore 0.10.3 behaviour."
npm run lint && npm run lint:manifest && npm test && npm run build
git commit -am "chore: release 0.10.5 (revert 0.10.4 sentinel overrides)"
git tag v0.10.5
# push tag on main per normal release flow → publish.yml publishes to npm
```

## Option B — restore the three files from the 0.10.3 tag

If the history is messier than a single commit:

```bash
git checkout v0.10.3 -- \
  nodes/Vh3Ai/descriptions/FsiSentinelDescription.ts \
  nodes/Vh3Ai/Vh3Ai.node.ts

# Manually remove the three sentinel helpers from nodes/Vh3Ai/GenericFunctions.ts
# (buildSentinelExclusions, buildSingleSentinelOverrides, parseSentinelOverridesJson)
# and their imports in Vh3Ai.node.ts and __tests__/GenericFunctions.test.ts.
```

Then bump to 0.10.5 and ship as in Option A. Option A is preferred because it
needs no manual helper surgery.

## Post-rollback verification

```bash
npm run lint && npm run lint:manifest && npm test && npm run build
```

After publish: `npx @n8n/scan-community-package n8n-nodes-vh3ai@0.10.5`, then
resubmit to the n8n Creator Portal if the manifest changed.
