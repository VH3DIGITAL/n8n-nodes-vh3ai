#!/usr/bin/env node
/**
 * generate-webservices-descriptions.mjs
 *
 * Generates n8n INodeProperties description TypeScript files from the BigChange
 * Web Services OpenAPI spec (scripts/openapi-webservices.json).
 *
 * Usage:
 *   node scripts/generate-webservices-descriptions.mjs <tag>
 *     [--resource <value>]       n8n resource value, default ws+PascalTag
 *     [--out <file>]             output .ts file, default WebServices<Tag>Description.ts
 *     [--handlers-out <file>]    emit handler switch stubs to this file
 *     [--skip <v1,v2,...>]       skip these operation values (already hand-crafted)
 *
 * Example — regenerate Jobs with 5 Phase-1 ops preserved:
 *   node scripts/generate-webservices-descriptions.mjs jobs \
 *     --skip wsListJobs,wsGetJob,wsCancelJob,wsJobStatusHistory,wsJobsList \
 *     --handlers-out /tmp/ws-jobs-handlers.ts
 *
 * Skip rules (always applied):
 *   - tag == not-documented
 *   - requestBody is multipart/form-data only (no application/json key)
 *   - requestBody application/json schema contains a `format: binary` property
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (!args[0] || args[0].startsWith('--')) {
	console.error('Usage: generate-webservices-descriptions.mjs <tag> [--resource …] [--out …] [--skip …] [--handlers-out …]');
	process.exit(1);
}
const tag = args[0];

/** @type {Record<string,string>} */
const opts = {};
for (let i = 1; i < args.length - 1; i++) {
	if (args[i].startsWith('--')) opts[args[i].slice(2)] = args[i + 1];
}

// ── Load spec + enrichment ────────────────────────────────────────────────────
const spec = JSON.parse(readFileSync(join(ROOT, 'scripts/openapi-webservices.json'), 'utf8'));

const enrichPath = join(ROOT, 'scripts/bigchange-enrichment.json');
const enrichment = existsSync(enrichPath) ? JSON.parse(readFileSync(enrichPath, 'utf8')) : {};

/** Look up enrichment data for a given OpenAPI path (e.g. '/tracking/journeys'). */
function getEnrichment(path) {
	const slug = path.replace(/^\//, '');
	return enrichment[slug] ?? null;
}

/** Find an enriched param by name (case-insensitive). */
function findEnrichedParam(enriched, apiName) {
	if (!enriched?.params) return null;
	const lower = apiName.toLowerCase();
	return enriched.params.find(p => p.name.toLowerCase() === lower) ?? null;
}

/** True if an enriched type string looks like a date/datetime. */
function isEnrichedDate(typeStr) {
	const t = (typeStr ?? '').toLowerCase();
	return t === 'datetime' || t === 'date' || t === 'date time';
}

// ── Config ────────────────────────────────────────────────────────────────────
const tagPascal = tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
const resourceValue = opts.resource ?? `ws${tagPascal}`;
const outFile = opts.out ?? join(ROOT, `nodes/Vh3Ai/descriptions/WebServices${tagPascal}Description.ts`);
const handlersOut = opts['handlers-out'] ?? null;
const skipSet = new Set((opts.skip ?? '').split(',').filter(Boolean));

/**
 * Known operation values for paths that were hand-crafted in Phase 1.
 * Key format: "METHOD:/path"  (upper-case method).
 */
const KNOWN_OP_VALUES = {
	'GET:/jobs': 'wsListJobs',
	'GET:/jobs/job': 'wsGetJob',
	'POST:/jobs/job-cancel': 'wsCancelJob',
	'GET:/jobs/jobstatushistory': 'wsJobStatusHistory',
	'GET:/jobs/jobslist': 'wsJobsList',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Split PascalCase while keeping known abbreviations together. */
function splitPascalCase(str) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		.trim()
		.replace(/\s+/g, ' ');
}

/** 'FooBar' → 'fooBar'; handles acronym prefixes: 'SAJobId' → 'saJobId' */
function toCamelCase(str) {
	if (!str) return '';
	const m = str.match(/^([A-Z]{2,})([A-Z][a-z])/);
	if (m) return m[1].toLowerCase() + str.slice(m[1].length);
	return str.charAt(0).toLowerCase() + str.slice(1);
}

/** Derive an operation value from path + method. */
function pathToOpValue(path, method) {
	const key = `${method.toUpperCase()}:${path}`;
	if (KNOWN_OP_VALUES[key]) return KNOWN_OP_VALUES[key];

	const parts = path.split('/').filter(Boolean);
	const tagSlug = tag.replace(/-/g, '').toLowerCase();
	const idx = parts.findIndex(p => p.replace(/-/g, '').toLowerCase() === tagSlug);
	const meaningful = idx >= 0 ? parts.slice(idx + 1) : parts;

	if (meaningful.length === 0) {
		const suffix = method.toLowerCase() === 'get' ? `${tagPascal}List` : `${tagPascal}Save`;
		return `ws${suffix}`;
	}

	const suffix = meaningful
		.join('-')
		.split('-')
		.map(s => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''))
		.join('');
	return `ws${suffix}`;
}

/** Build a human-readable display name from an operation value. */
function opValueToDisplayName(opValue) {
	return splitPascalCase(opValue.replace(/^ws/, ''));
}

/** True if the param or schema looks like a WS date-time. */
function isWsDate(schema, description, enrichedType) {
	if (isEnrichedDate(enrichedType)) return true;
	const desc = (description ?? '').toLowerCase();
	return (
		schema?.format === 'date-time' ||
		desc.includes('yyyy-mm-dd hh:mm:ss') ||
		desc.includes('format: yyyy-mm-dd') ||
		desc.includes('yyyy-mm-dd') ||
		desc.includes('date and time') ||
		desc.includes('allowed values: yyyy')
	);
}

/** Map OpenAPI schema type to an n8n INodePropertyType string. */
function mapType(schema, description, enrichedType) {
	if (!schema) return 'string';
	if (schema.format === 'binary') return '__binary__';
	if (isWsDate(schema, description, enrichedType)) return 'dateTime';
	switch (schema.type) {
		case 'integer':
		case 'number':
			return 'number';
		case 'boolean':
			return 'boolean';
		default:
			return 'string';
	}
}

/** Strip risk suffix and trim. */
function cleanSummary(summary) {
	return (summary ?? '').replace(/\s*\[(read-only|mutation|destructive mutation|undocumented)\]/gi, '').trim();
}

/** Strip boilerplate suffixes/prefixes from summaries to get a clean action phrase. */
function stripBoilerplate(str) {
	let d = (str ?? '')
		.replace(/\.?\s*BigChange Web Services action \w+ \(\w+\)\.?/gi, '')
		.replace(/\s*\((?:read[_-]?only|mutation|destructive[_\s]?mutation|undocumented)\)\s*/gi, '')
		.replace(/\s*\(BigChange[^)]*\)\s*/gi, '')
		.replace(/^BigChange Web Services\s+\w+:\s*/i, '')
		.replace(/;\s*risk\s*=\s*\w+/gi, '')
		.replace(/\.\s*$/, '')
		.trim();
	if (d) d = d.charAt(0).toUpperCase() + d.slice(1);
	return d;
}

/**
 * Derive a user-facing display name from an operation.
 * Handles three spec formats:
 *   clean:  "Add Attachments to a Job [mutation]"
 *   new:    "Add a Job Financial Line. BigChange Web Services action AddJobFinancialLine (mutation)."
 *   old:    "BigChange Web Services: JobAddAttachments (action=JobAddAttachments)."
 */
function deriveDisplayName(op, opValue) {
	const cleaned = cleanSummary(op.summary);
	const stripped = stripBoilerplate(cleaned);
	if (stripped && !stripped.startsWith('BigChange Web Services:') && !/\(action=/i.test(stripped)) {
		return stripped;
	}
	const actionMatch = cleaned.match(/\(action=([^)]+)\)/);
	if (actionMatch) {
		return splitPascalCase(actionMatch[1]);
	}
	return splitPascalCase(opValue.replace(/^ws/, ''));
}

function isDestructive(summary) {
	return /destructive/i.test(summary ?? '');
}

/**
 * Strip HTML tags, the "Authentication: not required" boilerplate,
 * and the old-format "BigChange Web Services: Xxx (action=Xxx)." prefix
 * to produce a clean n8n-style description sentence.
 */
function cleanDescription(raw) {
	let d = (raw ?? '')
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/\s*Authentication:\s*not required\s*/gi, '')
		.replace(/BigChange Web Services:\s*\S+\s*\(action=\S+\)\.?\s*/gi, '')
		.replace(/\.?\s*BigChange Web Services action \w+ \(\w+\)\.?/gi, '')
		.replace(/\s*\((?:read[_-]?only|mutation|destructive[_\s]?mutation|undocumented)\)\s*/gi, '')
		.replace(/\s*\(BigChange[^)]*\)\s*/gi, '')
		.replace(/;\s*risk\s*=\s*\w+/gi, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (!d) return '';
	const risk = d.match(/Risk:\s*\*{0,2}(read-only|mutation|destructive mutation|undocumented)\*{0,2}\.?/i);
	if (risk) {
		d = d.replace(risk[0], '').replace(/\.\s*$/, '').trim();
	}
	const action = d.match(/BigChange action:\s*`?(\w+)`?\.?/i);
	if (action) {
		d = d.replace(action[0], '').replace(/\.\s*$/, '').trim();
	}
	d = d.replace(/\.\s*$/, '').trim();
	return d || '';
}

/** Escape single quotes and truncate for use inside a TS string literal. */
function esc(str) {
	return (str ?? '')
		.replace(/\\/g, '\\\\')
		.replace(/'/g, "\\'")
		.replace(/\r?\n/g, ' ')
		.trim()
		.slice(0, 220);
}

/** True if we should skip this path+method combo entirely. */
function shouldSkip(op) {
	const rb = op.requestBody?.content;
	if (!rb) return false;
	const hasJson = !!rb['application/json'];
	const hasMultipart = !!rb['multipart/form-data'];
	if (!hasJson && hasMultipart) return true; // multipart-only
	if (hasJson) {
		const props = rb['application/json']?.schema?.properties ?? {};
		if (Object.values(props).some(p => p.format === 'binary')) return true; // binary upload
	}
	return false;
}

// ── Collect operations ────────────────────────────────────────────────────────

/**
 * @typedef {{ name: string; value: string; action: string; description: string }} OpEntry
 * @typedef {{ name: string; apiName: string; type: string; required: boolean; description: string; default: string|number|boolean }} FieldEntry
 */

/** @type {{ op: OpEntry; path: string; method: string; fields: FieldEntry[] }[]} */
const collected = [];

for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
	for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
		const op = pathItem[method];
		if (!op) continue;
		if (!(op.tags ?? []).includes(tag)) continue;
		if (shouldSkip(op)) {
			console.warn(`SKIP (binary/multipart): ${method.toUpperCase()} ${path}`);
			continue;
		}

		const opValue = pathToOpValue(path, method);
		if (skipSet.has(opValue)) {
			console.warn(`SKIP (hand-crafted):     ${method.toUpperCase()} ${path}  →  ${opValue}`);
			continue;
		}

		const enriched = getEnrichment(path);
		const summary = cleanSummary(op.summary);
		const destructive = isDestructive(op.summary);
		const displayName = deriveDisplayName(op, opValue);
		const cleaned = cleanDescription(op.description ?? op.summary ?? '');
		const actionName = displayName.replace(/ \(Web Services\)$/, '');
		const enrichedDesc = enriched?.description ? cleanDescription(enriched.description) : '';
		const descBody = enrichedDesc || cleaned || actionName;
		const desc = (destructive ? 'Destructive — ' : '') + descBody + '.';
		const opEntry = {
			name: actionName,
			value: opValue,
			action: `${actionName} via Web Services`.replace(/\s+/g, ' ').trim(),
			description: esc(desc.replace(/\.\.$/, '.')),
		};

		/** @type {FieldEntry[]} */
		const fields = [];

		if (method === 'get') {
			for (const param of op.parameters ?? []) {
				if (param.in !== 'query') continue;
				const schema = param.schema ?? {};
				if (schema.type === 'object') continue;
				const ep = findEnrichedParam(enriched, param.name);
				const type = mapType(schema, ep?.description ?? param.description, ep?.type);
				if (type === '__binary__') continue;
				const isReq = ep ? /required/i.test(ep.required ?? '') : !!param.required;
				fields.push({
					name: toCamelCase(param.name),
					apiName: param.name,
					type,
					required: isReq,
					description: esc(ep?.description ?? param.description ?? ''),
					default: type === 'boolean' ? false : type === 'number' ? 0 : '',
				});
			}
		} else {
			const jsonSchema = op.requestBody?.content?.['application/json']?.schema;
			if (jsonSchema?.properties) {
				const required = jsonSchema.required ?? [];
				for (const [propName, propSchema] of Object.entries(jsonSchema.properties)) {
					if (propSchema.type === 'object') continue;
					if (!propSchema.type) continue;
					const ep = findEnrichedParam(enriched, propName);
					const type = mapType(propSchema, ep?.description ?? propSchema.description, ep?.type);
					if (type === '__binary__') continue;
					const isReq = ep ? /required/i.test(ep.required ?? '') : (required.includes(propName) && !propSchema.nullable);
					fields.push({
						name: toCamelCase(propName),
						apiName: propName,
						type,
						required: isReq,
						description: esc(ep?.description ?? propSchema.description ?? ''),
						default: type === 'boolean' ? false : type === 'number' ? 0 : '',
					});
				}
			}
		}

		// Add params from enrichment that are missing from the OpenAPI spec.
		if (enriched?.params) {
			const existing = new Set(fields.map(f => f.apiName.toLowerCase()));
			for (const ep of enriched.params) {
				if (ep.name.toLowerCase() === 'action') continue;
				if (existing.has(ep.name.toLowerCase())) continue;
				const enrichType = isEnrichedDate(ep.type) ? 'dateTime'
					: /^int/i.test(ep.type ?? '') ? 'number'
					: /^bool/i.test(ep.type ?? '') ? 'boolean'
					: 'string';
				const isReq = /required/i.test(ep.required ?? '') && !/optional|see tip/i.test(ep.required ?? '');
				fields.push({
					name: toCamelCase(ep.name),
					apiName: ep.name,
					type: enrichType,
					required: isReq,
					description: esc(ep.description ?? ''),
					default: enrichType === 'boolean' ? false : enrichType === 'number' ? 0 : '',
				});
			}
		}

		// Detect ID/Ref pairs — make neither required, add hint to description.
		const fieldsByLower = new Map(fields.map(f => [f.apiName.toLowerCase(), f]));
		for (const f of fields) {
			const lower = f.apiName.toLowerCase();
			if (!lower.endsWith('id')) continue;
			const base = lower.slice(0, -2);
			const refField = fieldsByLower.get(base + 'ref') ?? fieldsByLower.get(base + 'reference');
			if (!refField) continue;
			const hint = `Provide either ${f.apiName} or ${refField.apiName}.`;
			f.required = false;
			refField.required = false;
			if (!f.description.includes(hint)) {
				f.description = esc(f.description ? `${f.description}. ${hint}` : hint);
			}
			if (!refField.description.includes(hint)) {
				refField.description = esc(refField.description ? `${refField.description}. ${hint}` : hint);
			}
		}

		collected.push({ op: opEntry, path, method, fields });
	}
}

if (collected.length === 0) {
	console.error(`No operations found for tag "${tag}" (after skip/filter).`);
	process.exit(1);
}

collected.sort((a, b) => a.op.name.localeCompare(b.op.name));

// ── Render TypeScript ──────────────────────────────────────────────────────────

function defaultLiteral(val) {
	if (val === '' || val === "''") return "''";
	if (typeof val === 'boolean') return val ? 'true' : 'false';
	return String(val);
}

function renderOperationsArray() {
	const entries = collected.map(({ op }) =>
		`\t\t{\n\t\t\tname: '${esc(op.name)}',\n\t\t\tvalue: '${op.value}',\n\t\t\taction: '${esc(op.action)}',\n\t\t\tdescription: '${op.description}',\n\t\t},`,
	).join('\n');

	return `export const ${resourceValue}Operations: INodeProperties[] = [\n\t{\n\t\tdisplayName: 'Operation',\n\t\tname: 'operation',\n\t\ttype: 'options',\n\t\tnoDataExpression: true,\n\t\tdisplayOptions: {\n\t\t\tshow: {\n\t\t\t\tresource: ['${resourceValue}'],\n\t\t\t},\n\t\t},\n\t\toptions: [\n${entries}\n\t\t],\n\t\tdefault: '${collected[0].op.value}',\n\t},\n];`;
}

function renderFieldsArray() {
	const blocks = collected.flatMap(({ op, fields }) => {
		if (fields.length === 0) return [];
		return fields.map(f => {
			const requiredLine = f.required ? `\t\trequired: true,\n` : '';
			const label = splitPascalCase(f.apiName);
			return (
				`\t// ── ${op.value} · ${f.apiName} ──────────────────────────────────────\n` +
				`\t{\n` +
				`\t\tdisplayName: '${label}',\n` +
				`\t\tname: '${f.name}',\n` +
				`\t\ttype: '${f.type}',\n` +
				requiredLine +
				`\t\tdefault: ${defaultLiteral(f.default)},\n` +
				`\t\tdescription: '${f.description}',\n` +
				`\t\tdisplayOptions: {\n` +
				`\t\t\tshow: {\n` +
				`\t\t\t\tresource: ['${resourceValue}'],\n` +
				`\t\t\t\toperation: ['${op.value}'],\n` +
				`\t\t\t},\n` +
				`\t\t},\n` +
				`\t},`
			);
		});
	});

	return `export const ${resourceValue}GeneratedFields: INodeProperties[] = [\n${blocks.join('\n')}\n];`;
}

function renderOptionsOnlyArray() {
	const entries = collected.map(({ op }) =>
		`\t{\n\t\tname: '${esc(op.name)}',\n\t\tvalue: '${op.value}',\n\t\taction: '${esc(op.action)}',\n\t\tdescription: '${op.description}',\n\t},`,
	).join('\n');
	return `/** Operation options for merging into the combined dropdown. */\nexport const ${resourceValue}GeneratedOperationOptions: INodePropertyOptions[] = [\n${entries}\n];`;
}

function renderRoutesMap() {
	const entries = collected.map(({ op, path, method, fields }) => {
		const paramsArr = JSON.stringify(
			fields.map(f => ({ camelName: f.name, apiName: f.apiName, type: f.type, default: f.default })),
		);
		return `\t'${op.value}': { path: '${path}', method: '${method}', params: ${paramsArr} },`;
	}).join('\n');

	return [
		`/** Generic dispatch table — keyed by operation value. Used by the node's catch-all handler. */`,
		`export const ${resourceValue}GeneratedRoutes: Record<string, {`,
		`\tpath: string;`,
		`\tmethod: string;`,
		`\tparams: Array<{ camelName: string; apiName: string; type: string; default: string | number | boolean }>;`,
		`}> = {`,
		entries,
		`};`,
	].join('\n');
}

const isStandalone = skipSet.size === 0;

function renderStandaloneOperationsArray() {
	const entries = collected.map(({ op }) =>
		`\t\t\t{\n\t\t\t\tname: '${esc(op.name)}',\n\t\t\t\tvalue: '${op.value}',\n\t\t\t\taction: '${esc(op.action)}',\n\t\t\t\tdescription: '${op.description}',\n\t\t\t},`,
	).join('\n');

	return `export const ${resourceValue}Operations: INodeProperties[] = [\n\t{\n\t\tdisplayName: 'Operation',\n\t\tname: 'operation',\n\t\ttype: 'options',\n\t\tnoDataExpression: true,\n\t\tdisplayOptions: {\n\t\t\tshow: {\n\t\t\t\tresource: ['${resourceValue}'],\n\t\t\t},\n\t\t},\n\t\toptions: [\n${entries}\n\t\t],\n\t\tdefault: '${collected[0].op.value}',\n\t},\n];`;
}

function renderField(f, indent = '\t') {
	const label = splitPascalCase(f.apiName);
	const requiredLine = f.required ? `${indent}\trequired: true,\n` : '';
	return (
		`${indent}{\n` +
		`${indent}\tdisplayName: '${label}',\n` +
		`${indent}\tname: '${f.name}',\n` +
		`${indent}\ttype: '${f.type}',\n` +
		requiredLine +
		`${indent}\tdefault: ${defaultLiteral(f.default)},\n` +
		`${indent}\tdescription: '${f.description}',\n` +
		`${indent}},`
	);
}

function renderStandaloneFieldsArray() {
	const blocks = collected.flatMap(({ op, fields }) => {
		if (fields.length === 0) return [];

		const required = fields.filter(f => f.required);
		const optional = fields.filter(f => !f.required);

		const result = [];

		for (const f of required) {
			result.push(
				`\t{\n` +
				`\t\tdisplayName: '${splitPascalCase(f.apiName)}',\n` +
				`\t\tname: '${f.name}',\n` +
				`\t\ttype: '${f.type}',\n` +
				`\t\trequired: true,\n` +
				`\t\tdefault: ${defaultLiteral(f.default)},\n` +
				`\t\tdescription: '${f.description}',\n` +
				`\t\tdisplayOptions: {\n` +
				`\t\t\tshow: {\n` +
				`\t\t\t\tresource: ['${resourceValue}'],\n` +
				`\t\t\t\toperation: ['${op.value}'],\n` +
				`\t\t\t},\n` +
				`\t\t},\n` +
				`\t},`
			);
		}

		if (optional.length > 0) {
			const optionFields = optional.map(f => renderField(f, '\t\t\t')).join('\n');
			result.push(
				`\t{\n` +
				`\t\tdisplayName: 'Additional Fields',\n` +
				`\t\tname: 'additionalFields',\n` +
				`\t\ttype: 'collection',\n` +
				`\t\tplaceholder: 'Add Field',\n` +
				`\t\tdefault: {},\n` +
				`\t\tdisplayOptions: {\n` +
				`\t\t\tshow: {\n` +
				`\t\t\t\tresource: ['${resourceValue}'],\n` +
				`\t\t\t\toperation: ['${op.value}'],\n` +
				`\t\t\t},\n` +
				`\t\t},\n` +
				`\t\toptions: [\n${optionFields}\n\t\t],\n` +
				`\t},`
			);
		}

		return result;
	});

	return `export const ${resourceValue}Fields: INodeProperties[] = [\n${blocks.join('\n')}\n];`;
}

function renderStandaloneRoutesMap() {
	const entries = collected.map(({ op, path, method, fields }) => {
		const paramsArr = JSON.stringify(
			fields.map(f => ({ camelName: f.name, apiName: f.apiName, type: f.type, default: f.default })),
		);
		return `\t'${op.value}': { path: '${path}', method: '${method}', params: ${paramsArr} },`;
	}).join('\n');

	return [
		`export const ${resourceValue}Routes: Record<string, {`,
		`\tpath: string;`,
		`\tmethod: string;`,
		`\tparams: Array<{ camelName: string; apiName: string; type: string; default: string | number | boolean }>;`,
		`}> = {`,
		entries,
		`};`,
	].join('\n');
}

let ts;
if (isStandalone) {
	ts = [
		`import type { INodeProperties } from 'n8n-workflow';`,
		``,
		`// Generated by scripts/generate-webservices-descriptions.mjs`,
		`// Tag: ${tag}  |  Resource value: ${resourceValue}`,
		`// ${collected.length} operations generated (standalone).`,
		`// Re-run the generator to pick up new OpenAPI operations; do not hand-edit.`,
		``,
		renderStandaloneOperationsArray(),
		``,
		renderStandaloneFieldsArray(),
		``,
		renderStandaloneRoutesMap(),
	].join('\n');
} else {
	ts = [
		`import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';`,
		``,
		`// Generated by scripts/generate-webservices-descriptions.mjs`,
		`// Tag: ${tag}  |  Resource value: ${resourceValue}`,
		`// ${collected.length} operations generated.  Skipped (hand-crafted): ${[...skipSet].join(', ') || 'none'}`,
		`// Re-run the generator to pick up new OpenAPI operations; do not hand-edit.`,
		``,
		renderOptionsOnlyArray(),
		``,
		renderFieldsArray(),
		``,
		renderRoutesMap(),
	].join('\n');
}

writeFileSync(outFile, ts, 'utf8');
console.log(`✓ Wrote ${collected.length} operations → ${outFile}`);

// ── Render handler stubs ──────────────────────────────────────────────────────
if (handlersOut) {
	function paramGetter(f) {
		if (f.type === 'dateTime') return `toWebServicesDateTime(this.getNodeParameter('${f.name}', i) as string)`;
		if (f.type === 'number') return `(this.getNodeParameter('${f.name}', i, 0) as number) || undefined`;
		if (f.type === 'boolean') return `this.getNodeParameter('${f.name}', i, false) as boolean`;
		return `this.getNodeParameter('${f.name}', i, '') as string`;
	}

	const cases = collected.map(({ op, path, method, fields }) => {
		const paramBlock = fields.length > 0
			? fields.map(f => `\t\t\t\t${f.apiName}: ${paramGetter(f)},`).join('\n')
			: '';

		let body;
		if (method === 'get') {
			if (fields.length === 0) {
				body = `\t\t\t\tconst raw = await vh3WebServicesGetRequest.call(this, '${path}', {});\n\t\t\t\tresponseData = [raw];`;
			} else {
				body = `\t\t\t\tconst qs = omitEmptyWsParams({\n${paramBlock}\n\t\t\t\t});\n\t\t\t\tconst raw = await vh3WebServicesGetRequest.call(this, '${path}', qs);\n\t\t\t\tresponseData = [raw];`;
			}
		} else {
			if (fields.length === 0) {
				body = `\t\t\t\tconst raw = await vh3WebServicesPostRequest.call(this, '${path}', {});\n\t\t\t\tresponseData = [raw];`;
			} else {
				body = `\t\t\t\tconst body = omitEmptyWsParams({\n${paramBlock}\n\t\t\t\t});\n\t\t\t\tconst raw = await vh3WebServicesPostRequest.call(this, '${path}', body as JsonObject);\n\t\t\t\tresponseData = [raw];`;
			}
		}
		return `\t\t\t\t} else if (operation === '${op.value}') {\n${body}`;
	});

	writeFileSync(handlersOut, cases.join('\n'), 'utf8');
	console.log(`✓ Wrote handler stubs → ${handlersOut}`);
}
