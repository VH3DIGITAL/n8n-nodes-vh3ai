import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

const MAX_PAGES = 200;

export function requireCompanyId(context: IExecuteFunctions, companyId: unknown): asserts companyId is string {
	if (!companyId || (typeof companyId === 'string' && companyId.trim() === '')) {
		throw new NodeOperationError(
			context.getNode(),
			'Company ID is required for this operation. Set it in your VH3 AI API credentials.',
		);
	}
}

async function getFsiAuth(context: IExecuteFunctions) {
	const credentials = await context.getCredentials('vh3AiApi');
	const fsiBaseUrl = (credentials.fsiBaseUrl as string).replace(/\/$/, '');
	const company_id = credentials.companyId as string;
	const api_key = credentials.apiKey as string;
	return { fsiBaseUrl, company_id, api_key };
}

/**
 * GET request to the VH3 FSI (Xano proxy) API.
 * No header auth — company_id and api_key are injected as query params.
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
 * POST request to the VH3 FSI (Xano proxy) API.
 * No header auth — company_id and api_key are injected into body.
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
 * PATCH request to the VH3 FSI (Xano proxy) API.
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
 * DELETE request to the VH3 FSI (Xano proxy) API.
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
