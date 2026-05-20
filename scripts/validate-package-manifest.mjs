/**
 * Local checks for package.json n8n manifest fields.
 * n8n Cloud verification requires n8n.n8nNodesApiVersion to be a positive
 * integer (1 or 2). eslint-plugin-n8n-nodes-base only enforces "is a number".
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const errors = [];

if (!pkg.n8n || typeof pkg.n8n !== 'object') {
	errors.push('package.json must define an "n8n" object.');
} else {
	const { n8nNodesApiVersion } = pkg.n8n;

	if (n8nNodesApiVersion === undefined) {
		errors.push('package.json n8n.n8nNodesApiVersion is required.');
	} else if (typeof n8nNodesApiVersion !== 'number' || !Number.isInteger(n8nNodesApiVersion) || n8nNodesApiVersion < 1) {
		errors.push(
			`package.json n8n.n8nNodesApiVersion must be a positive integer (1 or 2), not ${JSON.stringify(n8nNodesApiVersion)}.`,
		);
	} else if (n8nNodesApiVersion > 2) {
		errors.push(
			`package.json n8n.n8nNodesApiVersion must be 1 or 2, not ${n8nNodesApiVersion}.`,
		);
	}

	if (!Array.isArray(pkg.n8n.nodes) || pkg.n8n.nodes.length === 0) {
		errors.push('package.json n8n.nodes must list at least one built node path.');
	}

	if (!Array.isArray(pkg.n8n.credentials) || pkg.n8n.credentials.length === 0) {
		errors.push('package.json n8n.credentials must list at least one built credential path.');
	}
}

if (!Array.isArray(pkg.keywords) || !pkg.keywords.includes('n8n-community-node-package')) {
	errors.push('package.json keywords must include "n8n-community-node-package".');
}

if (errors.length > 0) {
	console.error('package.json manifest validation failed:\n');
	for (const message of errors) {
		console.error(`  - ${message}`);
	}
	process.exit(1);
}

console.log('package.json manifest validation passed.');
