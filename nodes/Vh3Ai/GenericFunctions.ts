import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	INode,
	JsonObject,
	JsonValue,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

const LIST_API_PREFIX = '/api:YdihQNr3';

/**
 * Normalise the three BigChange response envelope shapes into a flat items array.
 *
 * Shape A: { response: { result: { items, pageItemCount } } }
 * Shape B: { result: { items, pageItemCount } }
 * Shape C: { items, pageItemCount }
 */
/**
 * Convert any date/datetime input (ISO 8601, locale string, Date object, epoch ms,
 * or n8n dateTime field output like "2026-04-01 00:00:00") into the strict UTC
 * format the VH3 API expects: YYYY-MM-DDTHH:MM:SSZ (no milliseconds).
 *
 * Returns undefined for empty/invalid input so callers can skip sending the field.
 */
export function toUtcDateTime(value: unknown): string | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	const d = value instanceof Date ? value : new Date(value as string | number);
	if (isNaN(d.getTime())) return undefined;
	return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Default created-at date range for BigChange list endpoints that require at
 * least one filter or date range (e.g. /invoices/list, /quotes/list).
 *
 * Returns a `{ createdAtFrom, createdAtTo }` window of the last `monthsBack`
 * months ending now (default 12, which is BigChange's documented maximum
 * window for these endpoints), formatted as `YYYY-MM-DDTHH:MM:SSZ`.
 */
export function defaultCreatedAtRange(monthsBack = 12): { createdAtFrom: string; createdAtTo: string } {
	const now = new Date();
	const from = new Date(now);
	from.setMonth(from.getMonth() - monthsBack);
	return {
		createdAtFrom: toUtcDateTime(from)!,
		createdAtTo: toUtcDateTime(now)!,
	};
}

export function extractItems(raw: JsonObject): {
	items: JsonObject[];
	pageItemCount: number;
	totalItemCount?: number;
} {
	let result: JsonObject = raw;

	if (result.response && typeof result.response === 'object') {
		result = result.response as JsonObject;
	}
	if (result.result && typeof result.result === 'object') {
		result = result.result as JsonObject;
	}

	const items = (Array.isArray(result.items) ? result.items : []) as JsonObject[];
	const pageItemCount =
		typeof result.pageItemCount === 'number' ? result.pageItemCount : items.length;
	const totalItemCount =
		typeof result.totalItemCount === 'number' ? result.totalItemCount : undefined;

	return totalItemCount !== undefined
		? { items, pageItemCount, totalItemCount }
		: { items, pageItemCount };
}

function parseHttpStatusCode(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isInteger(value) && value >= 100 && value <= 599) {
		return value;
	}
	if (typeof value === 'string') {
		const match = value.trim().match(/^(\d{3})$/);
		if (match) {
			const code = Number(match[1]);
			if (code >= 100 && code <= 599) return code;
		}
	}
	return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}
	return undefined;
}

function extractHttpStatusCode(error: unknown): number | undefined {
	const err = asRecord(error);
	if (!err) return undefined;

	const response = asRecord(err.response);
	const cause = asRecord(err.cause);
	const causeResponse = asRecord(cause?.response);
	const context = asRecord(err.context);
	const contextData = asRecord(context?.data);

	const candidates = [
		err.httpCode,
		err.statusCode,
		err.status,
		response?.status,
		response?.statusCode,
		cause?.httpCode,
		cause?.statusCode,
		cause?.status,
		causeResponse?.status,
		causeResponse?.statusCode,
		contextData?.statusCode,
		contextData?.status,
	];

	for (const candidate of candidates) {
		const parsed = parseHttpStatusCode(candidate);
		if (parsed !== undefined) return parsed;
	}
	return undefined;
}

function tryParseJsonPayload(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return trimmed;
	try {
		return JSON.parse(trimmed);
	} catch {
		return trimmed;
	}
}

function collectErrorDetails(value: unknown, out: string[], depth = 0): void {
	if (depth > 4 || value === undefined || value === null) return;
	const parsed = tryParseJsonPayload(value);

	if (typeof parsed === 'string') {
		const trimmed = parsed.trim();
		if (trimmed) out.push(trimmed);
		return;
	}

	const obj = asRecord(parsed);
	if (!obj) return;

	if (obj.payload !== undefined && obj.payload !== null && obj.payload !== '') {
		collectErrorDetails(obj.payload, out, depth + 1);
	}
	if (obj.error !== undefined && obj.error !== null && obj.error !== '') {
		collectErrorDetails(obj.error, out, depth + 1);
	}

	const title = typeof obj.title === 'string' ? obj.title.trim() : '';
	const detail = typeof obj.detail === 'string' ? obj.detail.trim() : '';
	if (title && detail && title.toLowerCase() !== detail.toLowerCase()) {
		out.push(`${title}: ${detail}`);
	} else if (detail) {
		out.push(detail);
	} else if (title) {
		out.push(title);
	}

	if (typeof obj.message === 'string' && obj.message.trim()) {
		out.push(obj.message.trim());
	}
	if (typeof obj.description === 'string' && obj.description.trim()) {
		out.push(obj.description.trim());
	}
}

function isGenericHttpClientMessage(msg: string): boolean {
	return (
		/^Request failed with status code \d{3}$/i.test(msg) ||
		/^\d{3}\s*-\s*"?\{/.test(msg)
	);
}

function extractUpstreamErrorDetail(error: unknown): string {
	const err = asRecord(error);
	const rawMessages: string[] = [];

	if (err) {
		const response = asRecord(err.response);
		const cause = asRecord(err.cause);
		const causeResponse = asRecord(cause?.response);
		const context = asRecord(err.context);

		collectErrorDetails(response?.data, rawMessages);
		collectErrorDetails(response?.body, rawMessages);
		collectErrorDetails(causeResponse?.data, rawMessages);
		collectErrorDetails(causeResponse?.body, rawMessages);
		collectErrorDetails(context?.data, rawMessages);
		collectErrorDetails(err.error, rawMessages);
		collectErrorDetails(err.payload, rawMessages);

		if (typeof err.description === 'string' && err.description.trim()) {
			rawMessages.push(err.description.trim());
		}
		if (typeof err.message === 'string' && err.message.trim()) {
			rawMessages.push(err.message.trim());
		}
	} else if (error instanceof Error && error.message.trim()) {
		rawMessages.push(error.message.trim());
	}

	const unique: string[] = [];
	for (const candidate of rawMessages) {
		const lower = candidate.toLowerCase();
		const alreadyCovered = unique.some(
			(existing) => existing.toLowerCase() === lower || existing.toLowerCase().includes(lower),
		);
		if (!alreadyCovered) {
			unique.push(candidate);
		}
	}

	const specific = unique.filter((msg) => !isGenericHttpClientMessage(msg));
	const chosen = specific.length > 0 ? specific : unique;
	return chosen.join(' — ');
}

/**
 * Construct a NodeApiError that preserves the upstream HTTP status code (notably 429)
 * and BigChange / Xano proxy error payload details without short-circuiting on
 * pre-wrapped NodeApiError instances.
 */
export function buildBigChangeApiError(
	node: INode,
	error: unknown,
	method: 'GET' | 'POST',
	endpoint: string,
): NodeApiError {
	const statusCode = extractHttpStatusCode(error);
	const upstreamDetail = extractUpstreamErrorDetail(error);
	const httpCode = statusCode !== undefined ? String(statusCode) : undefined;

	let message: string;
	let description: string;

	if (statusCode === 429) {
		message = upstreamDetail
			? `BigChange API rate/quota limit exceeded (429): ${upstreamDetail}`
			: 'BigChange API rate/quota limit exceeded (429)';
		description = upstreamDetail
			? `${method} ${endpoint} failed with HTTP 429: ${upstreamDetail}`
			: `${method} ${endpoint} failed with HTTP 429`;
	} else if (statusCode !== undefined) {
		message = upstreamDetail
			? `BigChange API request failed (${statusCode}): ${method} ${endpoint} — ${upstreamDetail}`
			: `BigChange API request failed (${statusCode}): ${method} ${endpoint}`;
		description = upstreamDetail
			? `${method} ${endpoint} failed with HTTP ${statusCode}: ${upstreamDetail}`
			: `${method} ${endpoint} failed with HTTP ${statusCode}`;
	} else {
		const prefix = method === 'GET' ? 'Proxy API request failed' : 'List API request failed';
		message = `${prefix}: ${method} ${endpoint}`;
		description = upstreamDetail || (error instanceof Error ? error.message : 'Unknown error');
	}

	const errorPayload: JsonObject =
		error instanceof NodeApiError
			? ({
					message: error.message,
					...(error.description ? { description: error.description } : {}),
					...(error.httpCode ? { httpCode: error.httpCode } : {}),
					...(error.context?.data ? { data: error.context.data } : {}),
			  } as JsonObject)
			: ((error ?? {}) as JsonObject);

	const apiError = new NodeApiError(node, errorPayload, {
		message,
		description,
		httpCode,
	});

	apiError.message = message;
	apiError.description = description;
	if (httpCode) {
		apiError.httpCode = httpCode;
	}

	return apiError;
}

/**
 * Make an authenticated POST request to a VH3 list API endpoint.
 */
export async function vh3ListApiRequest(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject,
): Promise<JsonObject> {
	const credentials = await this.getCredentials('vh3AiApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}${LIST_API_PREFIX}${endpoint}`,
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'vh3AiApi',
			options,
		);
		if (typeof response === 'string') {
			return JSON.parse(response) as JsonObject;
		}
		return response as JsonObject;
	} catch (error) {
		throw buildBigChangeApiError(this.getNode(), error, 'POST', endpoint);
	}
}

/**
 * Validate that companyId is present before a VH3 AI call.
 */
export function requireCompanyId(context: IExecuteFunctions, companyId: unknown): asserts companyId is string {
	if (!companyId || (typeof companyId === 'string' && companyId.trim() === '')) {
		throw new NodeOperationError(
			context.getNode(),
			'Company ID is required for this operation. Set it in your VH3 AI API credentials.',
		);
	}
}

/**
 * Make an authenticated GET request to a VH3 proxy API endpoint.
 */
export async function vh3ProxyGetRequest(
	this: IExecuteFunctions,
	endpoint: string,
	qs: Record<string, string | number | boolean>,
): Promise<JsonObject> {
	const credentials = await this.getCredentials('vh3AiApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${baseUrl}${LIST_API_PREFIX}${endpoint}`,
		qs,
		json: true,
	};

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'vh3AiApi',
			options,
		)) as JsonObject;
	} catch (error) {
		throw buildBigChangeApiError(this.getNode(), error, 'GET', endpoint);
	}
}

/**
 * Fetch all pages from a list endpoint, auto-paginating until all items are collected.
 * Stops early when `items.length === 0`, `pageItemCount < pageSize`, or
 * `totalItemCount` has been reached.
 */
export const MAX_PAGES = 200;

export async function vh3ListApiRequestAllPages(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject,
	pageSize = 100,
): Promise<JsonObject[]> {
	const allItems: JsonObject[] = [];
	let page = 1;

	while (page <= MAX_PAGES) {
		const pagedBody: JsonObject = { ...body, pageNumber: page, pageSize };
		const raw = await vh3ListApiRequest.call(this, endpoint, pagedBody);
		const { items, pageItemCount, totalItemCount } = extractItems(raw);

		allItems.push(...items);

		if (
			items.length === 0 ||
			pageItemCount < pageSize ||
			(typeof totalItemCount === 'number' && allItems.length >= totalItemCount)
		) {
			break;
		}
		page++;
	}

	return allItems;
}

/**
 * Fetch up to `limit` items from a paginated list endpoint using internal pagination.
 * When `limit <= maxPageSize` (default 1000), only a single request is made.
 */
export async function vh3ListApiRequestWithLimit(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject,
	limit: number,
	maxPageSize = 1000,
): Promise<JsonObject[]> {
	const targetLimit = Math.max(1, Math.trunc(limit));
	const pageSize = Math.min(targetLimit, maxPageSize);
	const allItems: JsonObject[] = [];
	let page = 1;

	while (page <= MAX_PAGES && allItems.length < targetLimit) {
		const pagedBody: JsonObject = { ...body, pageNumber: page, pageSize };
		const raw = await vh3ListApiRequest.call(this, endpoint, pagedBody);
		const { items, pageItemCount, totalItemCount } = extractItems(raw);

		allItems.push(...items);

		if (
			allItems.length >= targetLimit ||
			items.length === 0 ||
			pageItemCount < pageSize ||
			(typeof totalItemCount === 'number' && allItems.length >= totalItemCount)
		) {
			break;
		}
		page++;
	}

	return allItems.slice(0, targetLimit);
}

// ── Web Services API helpers ──────────────────────────────────────────────────

export const WEBSERVICES_API_PREFIX = '/api:U8zIv3U8';

/**
 * Strip null, undefined, and empty-string values from a Web Services params
 * object. Keeps 0 and false because those are meaningful filter values.
 */
export function omitEmptyWsParams(
	obj: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
	return Object.fromEntries(
		Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ''),
	) as Record<string, string | number | boolean>;
}

/**
 * Convert any date/datetime input into the BigChange Web Services date format:
 * 'yyyy-MM-dd HH:mm:ss'. Returns undefined for empty or unparseable input.
 *
 * For strings: normalises ISO 8601 (strips T separator, trailing Z, and
 * milliseconds). Strings that carry no timezone info are returned as-is
 * after normalisation (n8n datetime fields already in WS format pass through).
 * Date objects and epoch numbers are formatted in UTC.
 */
export function toWebServicesDateTime(value: unknown): string | undefined {
	if (value === undefined || value === null || value === '') return undefined;

	if (typeof value === 'string') {
		// Fast path: normalise ISO 8601 → WS format by string manipulation only.
		// This preserves the original "wall clock" time for timezone-less inputs.
		const normalised = value
			.replace('T', ' ')
			.replace(/\.\d+Z?$/, '')
			.replace(/Z$/, '')
			.trim();
		if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalised)) {
			return normalised;
		}
		// Strings with explicit timezone offsets (e.g. +01:00) fall through to
		// Date parsing so the offset is respected and output is UTC.
	}

	const d = value instanceof Date ? value : new Date(value as string | number);
	if (isNaN(d.getTime())) return undefined;
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
		`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
	);
}

/**
 * Make an authenticated GET request to the VH3 Web Services API.
 * Response is returned raw — do not call extractItems() on the result.
 */
export async function vh3WebServicesGetRequest(
	this: IExecuteFunctions,
	endpoint: string,
	qs: Record<string, string | number | boolean>,
): Promise<JsonObject> {
	const credentials = await this.getCredentials('vh3AiApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${baseUrl}${WEBSERVICES_API_PREFIX}${endpoint}`,
		qs,
		json: true,
	};

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'vh3AiApi',
			options,
		)) as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Web Services API request failed: GET ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * Make an authenticated POST request to the VH3 Web Services API.
 * Response is returned raw — do not call extractItems() on the result.
 */
export async function vh3WebServicesPostRequest(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject,
): Promise<JsonObject> {
	const credentials = await this.getCredentials('vh3AiApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}${WEBSERVICES_API_PREFIX}${endpoint}`,
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'vh3AiApi',
			options,
		);
		if (typeof response === 'string') {
			return JSON.parse(response) as JsonObject;
		}
		return response as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Web Services API request failed: POST ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * Unwrap a Web Services response envelope into an array of items.
 * WS responses follow: { result: { Code, Result: [...] } } or { result: { Code, Result: {} } }.
 * Falls back to returning the raw object as a single item if the shape doesn't match.
 */
export function extractWsItems(raw: JsonObject): JsonObject[] {
	const result = raw?.result as JsonObject | undefined;
	if (!result) return [raw];
	const inner = result.Result;
	if (Array.isArray(inner)) return inner as JsonObject[];
	if (inner && typeof inner === 'object') return [inner as JsonObject];
	return [raw];
}

/**
 * Unwrap common FSI list envelopes into a flat items array.
 * Tries the supplied keys, then `items` / `result.items`, then the raw object.
 */
export function unwrapFsiList(raw: JsonObject | JsonObject[], keys: string[] = []): JsonObject[] {
	if (Array.isArray(raw)) return raw;
	const candidates = [...keys, 'items', 'result'];
	for (const key of candidates) {
		const value = raw[key];
		if (Array.isArray(value)) return value as JsonObject[];
	}
	const nested = raw.result as JsonObject | undefined;
	if (nested && typeof nested === 'object') {
		for (const key of [...keys, 'items']) {
			const value = nested[key];
			if (Array.isArray(value)) return value as JsonObject[];
		}
	}
	return [raw];
}

export function parseJsonField(value: unknown): JsonValue | undefined {
	if (value == null || value === '') return undefined;
	if (typeof value !== 'string') return value as JsonValue;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	return JSON.parse(trimmed) as JsonValue;
}

// ── FSI (Field Service Intelligence) API helpers ─────────────────────────────

async function getFsiAuth(context: IExecuteFunctions) {
	const credentials = await context.getCredentials('vh3AiApi');
	const fsiBaseUrl = (credentials.fsiBaseUrl as string).replace(/\/$/, '');
	const company_id = credentials.companyId as string;
	const api_key = credentials.apiKey as string;
	return { fsiBaseUrl, company_id, api_key };
}

/**
 * GET request to the VH3 FSI API.
 * Auth is injected as query params (company_id, api_key).
 */
export async function vh3FsiGetRequest(
	this: IExecuteFunctions,
	endpoint: string,
	qs: Record<string, string | number | boolean>,
): Promise<JsonObject> {
	const { fsiBaseUrl, company_id, api_key } = await getFsiAuth(this);

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${fsiBaseUrl}${endpoint}`,
		qs: { company_id, api_key, ...qs },
		json: true,
	};

	try {
		return (await this.helpers.httpRequest(options)) as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `FSI API request failed: GET ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * POST request to the VH3 FSI API.
 * Auth is injected into the request body (company_id, api_key).
 */
export async function vh3FsiPostRequest(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject,
): Promise<JsonObject> {
	const { fsiBaseUrl, company_id, api_key } = await getFsiAuth(this);

	const fullBody = { company_id, api_key, ...body };

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${fsiBaseUrl}${endpoint}`,
		body: JSON.stringify(fullBody),
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await this.helpers.httpRequest(options);
		if (typeof response === 'string') {
			return JSON.parse(response) as JsonObject;
		}
		return response as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `FSI API request failed: POST ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

const JOB_IDENTITY_KEYS = ['id', 'job_id', 'reference'] as const;

function isEmptyPayloadValue(value: unknown): boolean {
	if (value === undefined || value === null || value === '') return true;
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === 'object') return Object.keys(value as object).length === 0;
	return false;
}

/**
 * A successful enriched-job response that is only an error detail, with no job identity.
 */
export function enrichedJobResponseIsErrorDetail(body: JsonObject): boolean {
	const hasIdentity = JOB_IDENTITY_KEYS.some((key) => !isEmptyPayloadValue(body[key]));
	if (hasIdentity) return false;
	if (typeof body.detail !== 'string' || body.detail.trim() === '') return false;
	return Object.entries(body).every(([key, value]) => key === 'detail' || isEmptyPayloadValue(value));
}

export function assertEnrichedJobPayload(context: IExecuteFunctions, raw: JsonObject): void {
	if (!enrichedJobResponseIsErrorDetail(raw)) return;
	const detail = String(raw.detail);
	throw new NodeApiError(context.getNode(), { message: detail }, {
		message: detail,
		description: detail,
	});
}

export function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

/**
 * Multipart POST to the VH3 AI API. Auth fields are sent in the form body.
 */
export async function vh3FsiMultipartPostRequest(
	this: IExecuteFunctions,
	endpoint: string,
	fields: Record<string, string>,
	file: { buffer: Buffer; fileName: string; mimeType: string },
): Promise<JsonObject> {
	const { fsiBaseUrl, company_id, api_key } = await getFsiAuth(this);
	const form = new FormData();
	form.append('company_id', company_id);
	form.append('api_key', api_key);
	for (const [key, value] of Object.entries(fields)) {
		form.append(key, value);
	}
	form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimeType }), file.fileName);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${fsiBaseUrl}${endpoint}`,
		body: form,
	};

	try {
		const response = await this.helpers.httpRequest(options);
		if (typeof response === 'string') {
			return JSON.parse(response) as JsonObject;
		}
		return response as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `FSI API request failed: POST ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * PATCH request to the VH3 FSI API.
 */
export async function vh3FsiPatchRequest(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject,
): Promise<JsonObject> {
	const { fsiBaseUrl, company_id, api_key } = await getFsiAuth(this);

	const fullBody = { company_id, api_key, ...body };

	const options: IHttpRequestOptions = {
		method: 'PATCH',
		url: `${fsiBaseUrl}${endpoint}`,
		body: JSON.stringify(fullBody),
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await this.helpers.httpRequest(options);
		if (typeof response === 'string') {
			return JSON.parse(response) as JsonObject;
		}
		return response as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `FSI API request failed: PATCH ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * PUT request to the VH3 FSI API.
 */
export async function vh3FsiPutRequest(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject,
): Promise<JsonObject> {
	const { fsiBaseUrl, company_id, api_key } = await getFsiAuth(this);

	const fullBody = { company_id, api_key, ...body };

	const options: IHttpRequestOptions = {
		method: 'PUT',
		url: `${fsiBaseUrl}${endpoint}`,
		body: JSON.stringify(fullBody),
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await this.helpers.httpRequest(options);
		if (typeof response === 'string') {
			return JSON.parse(response) as JsonObject;
		}
		return response as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `FSI API request failed: PUT ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * DELETE request to the VH3 FSI API.
 */
export async function vh3FsiDeleteRequest(
	this: IExecuteFunctions,
	endpoint: string,
	body: JsonObject = {},
): Promise<JsonObject> {
	const { fsiBaseUrl, company_id, api_key } = await getFsiAuth(this);

	const fullBody = { company_id, api_key, ...body };

	const options: IHttpRequestOptions = {
		method: 'DELETE',
		url: `${fsiBaseUrl}${endpoint}`,
		body: JSON.stringify(fullBody),
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await this.helpers.httpRequest(options);
		if (typeof response === 'string') {
			return JSON.parse(response) as JsonObject;
		}
		return response as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `FSI API request failed: DELETE ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * Build the attachments array from n8n UI parameters.
 * URL mode passes the URL through for server-side fetch.
 * Binary mode base64-encodes the file from n8n's binary data.
 * Returns [] when no attachment is selected.
 */
export async function buildAttachments(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<JsonObject[]> {
	const source = context.getNodeParameter('attachmentSource', itemIndex) as string;

	if (source === 'url') {
		const url = context.getNodeParameter('attachmentUrl', itemIndex) as string;
		const filename = context.getNodeParameter('attachmentFilename', itemIndex) as string;
		const mimeType = context.getNodeParameter('attachmentMimeType', itemIndex) as string;
		if (url && filename) {
			return [{ filename, url, mimeType }] as unknown as JsonObject[];
		}
	} else if (source === 'binary') {
		const binaryProp = context.getNodeParameter('attachmentBinaryProperty', itemIndex) as string;
		const binaryData = context.helpers.assertBinaryData(itemIndex, binaryProp);
		const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryProp);
		const contentBase64 = buffer.toString('base64');
		return [
			{
				filename: binaryData.fileName || 'attachment',
				contentBase64,
				mimeType: binaryData.mimeType || 'application/octet-stream',
			},
		] as unknown as JsonObject[];
	}

	return [] as JsonObject[];
}

/**
 * Auto-paginate a GET endpoint on the FSI API.
 */
export async function vh3FsiGetAllPages(
	this: IExecuteFunctions,
	endpoint: string,
	qs: Record<string, string | number | boolean>,
	arrayKey: string,
	pageSize = 100,
): Promise<JsonObject[]> {
	const allItems: JsonObject[] = [];
	let page = 1;

	while (page <= MAX_PAGES) {
		const pagedQs = { ...qs, page_number: page, page_size: pageSize };
		const raw = await vh3FsiGetRequest.call(this, endpoint, pagedQs);

		const items = (Array.isArray(raw[arrayKey]) ? raw[arrayKey] : []) as JsonObject[];
		allItems.push(...items);

		if (items.length < pageSize) {
			break;
		}
		page++;
	}

	return allItems;
}

// ── SENTINEL HELPERS (FSI) ───────────────────────────────────────────────────

/**
 * Split a comma-separated string into trimmed, non-empty string parts.
 * Returns [] for empty/undefined input.
 */
function csvToStringArray(value: unknown): string[] {
	if (typeof value !== 'string' || value.trim() === '') return [];
	return value
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part !== '');
}

/**
 * Split a comma-separated string into numbers, dropping any non-numeric parts.
 */
function csvToNumberArray(value: unknown): number[] {
	return csvToStringArray(value)
		.map((part) => Number(part))
		.filter((n) => !Number.isNaN(n));
}

/**
 * Build the `exclusions` object for a sentinel run from the n8n "Exclusions"
 * collection. Only non-empty arrays are included. Returns undefined when no
 * exclusions were provided so the caller can omit the key entirely.
 */
export function buildSentinelExclusions(raw: JsonObject | undefined): JsonObject | undefined {
	if (!raw || typeof raw !== 'object') return undefined;

	const out: JsonObject = {};
	const siteKeys = csvToStringArray(raw.excludedSiteKeys);
	const jobTypeIds = csvToNumberArray(raw.excludedJobTypeIds);
	const contactIds = csvToNumberArray(raw.excludedContactIds);
	const resourceIds = csvToNumberArray(raw.excludedResourceIds);

	if (siteKeys.length > 0) out.excludedSiteKeys = siteKeys;
	if (jobTypeIds.length > 0) out.excludedJobTypeIds = jobTypeIds;
	if (contactIds.length > 0) out.excludedContactIds = contactIds;
	if (resourceIds.length > 0) out.excludedResourceIds = resourceIds;

	return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Build paramOverrides for a single-sentinel run from its threshold-override
 * collection. The collection object already contains only the keys the user
 * added, so it is sent verbatim under the sentinel ID. Returns undefined when
 * empty (zero is a valid override and is preserved). 
 */
export function buildSingleSentinelOverrides(
	sentinelId: string,
	overrides: JsonObject | undefined,
): JsonObject | undefined {
	if (!overrides || typeof overrides !== 'object' || Object.keys(overrides).length === 0) {
		return undefined;
	}
	return { [sentinelId]: overrides };
}

/**
 * Parse the "Threshold Overrides (JSON)" field used for run-all. Accepts either
 * a bare map of `{ sentinelId: { threshold: value } }` or a full settings object
 * containing a top-level `paramOverrides` key (e.g. pasted from a tenant config).
 * Returns undefined for empty input; throws a NodeOperationError on invalid JSON
 * or a non-object payload.
 */
export function parseSentinelOverridesJson(
	context: IExecuteFunctions,
	raw: unknown,
): JsonObject | undefined {
	if (raw === undefined || raw === null) return undefined;

	let parsed: unknown = raw;
	if (typeof raw === 'string') {
		const trimmed = raw.trim();
		if (trimmed === '' || trimmed === '{}') return undefined;
		try {
			parsed = JSON.parse(trimmed);
		} catch (error) {
			throw new NodeOperationError(
				context.getNode(),
				`Threshold Overrides (JSON) is not valid JSON: ${(error as Error).message}`,
			);
		}
	}

	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		throw new NodeOperationError(
			context.getNode(),
			'Threshold Overrides (JSON) must be a JSON object mapping sentinel IDs to threshold overrides',
		);
	}

	let obj = parsed as JsonObject;
	if (obj.paramOverrides && typeof obj.paramOverrides === 'object' && !Array.isArray(obj.paramOverrides)) {
		obj = obj.paramOverrides as JsonObject;
	}

	return Object.keys(obj).length > 0 ? obj : undefined;
}

/**
 * Job Feed / Account Job Feed true-only query flags (same pattern as compact).
 * Unset or false is omitted — not an inverse filter.
 */
export function applyJobFeedTrueOnlyQuery(
	qs: Record<string, string | number | boolean>,
	additionalFields: JsonObject,
): void {
	if (additionalFields.hasFollowUp === true) {
		qs.has_follow_up = true;
	}
	if (additionalFields.includeVh3Ai === true) {
		qs.include_vh3_ai = true;
	}
}

/**
 * Strictly parse a comma-separated string or JSON array of positive integer IDs
 * into `number[]`. Throws NodeOperationError on empty, malformed, or non-integer
 * values so destructive PUT/replace endpoints never accidentally overwrite with [].
 */
export function parseStrictNumericIdList(
	context: IExecuteFunctions,
	raw: unknown,
	fieldLabel = 'Worksheet IDs',
): number[] {
	if (raw === undefined || raw === null) {
		throw new NodeOperationError(
			context.getNode(),
			`${fieldLabel} is required and must be a comma-separated list of numeric IDs or a JSON array of numbers.`,
		);
	}

	let candidates: unknown[];
	if (Array.isArray(raw)) {
		candidates = raw;
	} else if (typeof raw === 'number') {
		candidates = [raw];
	} else if (typeof raw === 'string') {
		const trimmed = raw.trim();
		if (!trimmed) {
			throw new NodeOperationError(
				context.getNode(),
				`${fieldLabel} cannot be empty. Provide comma-separated numeric IDs (e.g. "12345, 67890") or a JSON array (e.g. [12345, 67890]).`,
			);
		}
		if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
			let parsed: unknown;
			let parseFailed = false;
			try {
				parsed = JSON.parse(trimmed);
			} catch {
				parseFailed = true;
			}
			if (parseFailed || !Array.isArray(parsed)) {
				throw new NodeOperationError(
					context.getNode(),
					`${fieldLabel} must be a valid JSON array of numeric IDs or a comma-separated list of numeric IDs.`,
				);
			}
			candidates = parsed;
		} else {
			candidates = trimmed.split(',').map((part) => part.trim());
		}
	} else {
		throw new NodeOperationError(
			context.getNode(),
			`${fieldLabel} must be a comma-separated list of numeric IDs or a JSON array of numbers.`,
		);
	}

	const ids: number[] = [];
	for (const entry of candidates) {
		if (typeof entry === 'number') {
			if (!Number.isInteger(entry) || entry <= 0) {
				throw new NodeOperationError(
					context.getNode(),
					`${fieldLabel} contains invalid numeric ID "${String(entry)}". All IDs must be positive integers.`,
				);
			}
			ids.push(entry);
		} else if (typeof entry === 'string') {
			const trimmedEntry = entry.trim();
			if (!/^[1-9]\d*$/.test(trimmedEntry)) {
				throw new NodeOperationError(
					context.getNode(),
					`${fieldLabel} contains invalid non-numeric value "${entry}". All IDs must be positive integers.`,
				);
			}
			ids.push(Number(trimmedEntry));
		} else {
			throw new NodeOperationError(
				context.getNode(),
				`${fieldLabel} contains an invalid value (${String(entry)}). All IDs must be positive integers.`,
			);
		}
	}

	return ids;
}
