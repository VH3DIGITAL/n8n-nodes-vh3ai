import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

const LIST_API_PREFIX = '/api:YdihQNr3';
const ENRICH_API_PREFIX = '/api:6q5N0phZ';

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

export function extractItems(raw: JsonObject): { items: JsonObject[]; pageItemCount: number } {
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

	return { items, pageItemCount };
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
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `List API request failed: POST ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * Validate that companyId is present in credentials before calling enrich endpoints.
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
 * Make an authenticated GET request to the VH3 enrichment API.
 */
export async function vh3EnrichApiRequest(
	this: IExecuteFunctions,
	endpoint: string,
	qs: Record<string, string | number>,
): Promise<JsonObject> {
	const credentials = await this.getCredentials('vh3AiApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${baseUrl}${ENRICH_API_PREFIX}${endpoint}`,
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
			message: `Enrich API request failed: GET ${endpoint}`,
			description: (error as Error).message,
		});
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
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Proxy API request failed: GET ${endpoint}`,
			description: (error as Error).message,
		});
	}
}

/**
 * Fetch all pages from a list endpoint, auto-paginating until all items are collected.
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
		const { items, pageItemCount } = extractItems(raw);

		allItems.push(...items);

		if (pageItemCount < pageSize) {
			break;
		}
		page++;
	}

	return allItems;
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
