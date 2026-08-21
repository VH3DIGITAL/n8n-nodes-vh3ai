#!/usr/bin/env node
/**
 * Lint node/credential sources with the same eslint-plugin-n8n-nodes-base
 * nodes + credentials + community rulesets that @n8n/scan-community-package@beta
 * applies to GitHub source. Creator Portal then filters to new/changed files
 * versus the last approved version — this script approximates that by linting
 * files changed versus the base ref (origin/main by default).
 *
 * Full-tree `npm run lint:portal` reports ~200 grandfathered issues and is not
 * a publish gate. Always run this (or lint:portal on the files you touched)
 * before tagging a version for Creator Portal review.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const baseRef = process.env.PORTAL_LINT_BASE ?? 'origin/main';
const extraArgs = process.argv.slice(2);

const lintable = (file) =>
	file === 'package.json' ||
	/^(nodes|credentials)\/.*\.(ts|js|json)$/.test(file);

const git = (args) => {
	const result = spawnSync('git', args, { encoding: 'utf8' });
	if (result.status !== 0) {
		throw new Error(result.stderr || `git ${args.join(' ')} failed`);
	}
	return result.stdout;
};

let files;
if (extraArgs.length > 0) {
	files = extraArgs.filter((file) => existsSync(file) && lintable(file));
} else {
	const names = new Set();
	for (const args of [
		['diff', '--name-only', '--diff-filter=ACMR', `${baseRef}...HEAD`],
		['diff', '--name-only', '--diff-filter=ACMR'],
		['ls-files', '--others', '--exclude-standard'],
	]) {
		for (const line of git(args).split('\n')) {
			if (line) names.add(line);
		}
	}
	files = [...names].filter((file) => existsSync(file) && lintable(file));
}

if (files.length === 0) {
	console.log('lint:portal:changed: no node/credential/package.json files to lint');
	process.exit(0);
}

console.log(`lint:portal:changed (${baseRef}):\n${files.map((f) => `  ${f}`).join('\n')}\n`);

const eslint = spawnSync(
	'npx',
	['eslint', '-c', '.eslintrc.portal.js', ...files],
	{ stdio: 'inherit', shell: process.platform === 'win32' },
);

process.exit(eslint.status ?? 1);
