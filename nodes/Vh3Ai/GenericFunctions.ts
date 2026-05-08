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
const MAX_PAGES = 200;

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
