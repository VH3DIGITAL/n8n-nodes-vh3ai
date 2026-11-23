import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import {
	extractItems,
	omitEmptyWsParams,
	toWebServicesDateTime,
	buildSentinelExclusions,
	buildSingleSentinelOverrides,
	parseSentinelOverridesJson,
	unwrapFsiList,
	parseJsonField,
	applyJobFeedTrueOnlyQuery,
	vh3ListApiRequest,
	vh3ListApiRequestAllPages,
	vh3ListApiRequestWithLimit,
	vh3ProxyGetRequest,
} from '../nodes/Vh3Ai/GenericFunctions';
import { Vh3Ai } from '../nodes/Vh3Ai/Vh3Ai.node';

describe('extractItems', () => {
	it('unwraps Shape A: { response: { result: { items, pageItemCount } } }', () => {
		const raw: JsonObject = {
			response: {
				result: {
					items: [{ id: 1 }, { id: 2 }],
					pageItemCount: 2,
				},
			},
		};
		const { items, pageItemCount } = extractItems(raw);
		expect(items).toEqual([{ id: 1 }, { id: 2 }]);
		expect(pageItemCount).toBe(2);
	});

	it('unwraps Shape B: { result: { items, pageItemCount } }', () => {
		const raw: JsonObject = {
			result: {
				items: [{ id: 10 }],
				pageItemCount: 1,
			},
		};
		const { items, pageItemCount } = extractItems(raw);
		expect(items).toEqual([{ id: 10 }]);
		expect(pageItemCount).toBe(1);
	});

	it('unwraps Shape C: { items, pageItemCount }', () => {
		const raw: JsonObject = {
			items: [{ id: 100 }, { id: 200 }, { id: 300 }],
			pageItemCount: 3,
		};
		const { items, pageItemCount } = extractItems(raw);
		expect(items).toEqual([{ id: 100 }, { id: 200 }, { id: 300 }]);
		expect(pageItemCount).toBe(3);
	});

	it('returns empty array when items is missing', () => {
		const raw: JsonObject = { result: { pageItemCount: 0 } };
		const { items, pageItemCount } = extractItems(raw);
		expect(items).toEqual([]);
		expect(pageItemCount).toBe(0);
	});

	it('returns empty array for completely empty envelope', () => {
		const raw: JsonObject = {};
		const { items, pageItemCount } = extractItems(raw);
		expect(items).toEqual([]);
		expect(pageItemCount).toBe(0);
	});

	it('falls back to items.length when pageItemCount is missing', () => {
		const raw: JsonObject = {
			items: [{ id: 1 }, { id: 2 }],
		};
		const { items, pageItemCount } = extractItems(raw);
		expect(items).toEqual([{ id: 1 }, { id: 2 }]);
		expect(pageItemCount).toBe(2);
	});

	it('handles deeply nested response.result.items with pageItemCount=0 (last page)', () => {
		const raw: JsonObject = {
			response: {
				result: {
					items: [],
					pageItemCount: 0,
				},
			},
		};
		const { items, pageItemCount } = extractItems(raw);
		expect(items).toEqual([]);
		expect(pageItemCount).toBe(0);
	});
});

describe('omitEmptyWsParams', () => {
	it('drops null values', () => {
		expect(omitEmptyWsParams({ a: null, b: 'x' })).toEqual({ b: 'x' });
	});

	it('drops undefined values', () => {
		expect(omitEmptyWsParams({ a: undefined, b: 1 })).toEqual({ b: 1 });
	});

	it('drops empty-string values', () => {
		expect(omitEmptyWsParams({ a: '', b: 'hello' })).toEqual({ b: 'hello' });
	});

	it('keeps 0', () => {
		expect(omitEmptyWsParams({ page: 0, name: 'test' })).toEqual({ page: 0, name: 'test' });
	});

	it('keeps false', () => {
		expect(omitEmptyWsParams({ active: false, name: 'test' })).toEqual({ active: false, name: 'test' });
	});

	it('returns empty object when all values are empty', () => {
		expect(omitEmptyWsParams({ a: null, b: undefined, c: '' })).toEqual({});
	});

	it('passes through numbers and non-empty strings unchanged', () => {
		expect(omitEmptyWsParams({ JobId: 42, JobRef: 'REF-001', Page: 0 })).toEqual({
			JobId: 42,
			JobRef: 'REF-001',
			Page: 0,
		});
	});
});

describe('toWebServicesDateTime', () => {
	it('converts ISO 8601 UTC string to yyyy-MM-dd HH:mm:ss', () => {
		expect(toWebServicesDateTime('2026-04-01T10:30:00Z')).toBe('2026-04-01 10:30:00');
	});

	it('converts ISO 8601 with milliseconds', () => {
		expect(toWebServicesDateTime('2026-04-01T10:30:00.123Z')).toBe('2026-04-01 10:30:00');
	});

	it('converts n8n-style datetime string (space separator)', () => {
		expect(toWebServicesDateTime('2026-04-01 00:00:00')).toBe('2026-04-01 00:00:00');
	});

	it('converts a Date object', () => {
		const d = new Date('2025-12-31T23:59:59Z');
		expect(toWebServicesDateTime(d)).toBe('2025-12-31 23:59:59');
	});

	it('converts epoch milliseconds', () => {
		const epoch = new Date('2026-01-01T00:00:00Z').getTime();
		expect(toWebServicesDateTime(epoch)).toBe('2026-01-01 00:00:00');
	});

	it('returns undefined for empty string', () => {
		expect(toWebServicesDateTime('')).toBeUndefined();
	});

	it('returns undefined for null', () => {
		expect(toWebServicesDateTime(null)).toBeUndefined();
	});

	it('returns undefined for undefined', () => {
		expect(toWebServicesDateTime(undefined)).toBeUndefined();
	});

	it('returns undefined for an invalid date string', () => {
		expect(toWebServicesDateTime('not-a-date')).toBeUndefined();
	});

	it('zero-pads month, day, hour, minute, second', () => {
		expect(toWebServicesDateTime('2026-02-03T04:05:06Z')).toBe('2026-02-03 04:05:06');
	});
});

describe('vh3ListApiRequestAllPages (pagination logic)', () => {
	let mockContext: Partial<IExecuteFunctions>;
	let callCount: number;
	let mockResponses: JsonObject[];

	beforeEach(() => {
		callCount = 0;
		mockResponses = [];
	});

	function createMockContext(responses: JsonObject[]): IExecuteFunctions {
		mockResponses = responses;
		callCount = 0;

		return {
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.test.io',
				companyId: 'test-company',
			}),
			helpers: {
				httpRequestWithAuthentication: jest.fn().mockImplementation(
					async (_credType: string, _options: IHttpRequestOptions) => {
						const response = mockResponses[callCount] ?? { items: [], pageItemCount: 0 };
						callCount++;
						return response;
					},
				),
			} as any,
			getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
		} as unknown as IExecuteFunctions;
	}

	it('collects items across multiple pages and stops when last page is partial', async () => {
		const ctx = createMockContext([
			{ items: [{ id: 1 }, { id: 2 }], pageItemCount: 2 },
			{ items: [{ id: 3 }], pageItemCount: 1 },
		]);

		const { vh3ListApiRequestAllPages } = require('../nodes/Vh3Ai/GenericFunctions');
		const result = await vh3ListApiRequestAllPages.call(ctx, '/test/list', {}, 2);

		expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
		expect(callCount).toBe(2);
	});

	it('stops after a single page when pageItemCount < pageSize', async () => {
		const ctx = createMockContext([
			{ items: [{ id: 1 }], pageItemCount: 1 },
		]);

		const { vh3ListApiRequestAllPages } = require('../nodes/Vh3Ai/GenericFunctions');
		const result = await vh3ListApiRequestAllPages.call(ctx, '/test/list', {}, 10);

		expect(result).toEqual([{ id: 1 }]);
		expect(callCount).toBe(1);
	});

	it('returns empty array when first page has no items', async () => {
		const ctx = createMockContext([
			{ items: [], pageItemCount: 0 },
		]);

		const { vh3ListApiRequestAllPages } = require('../nodes/Vh3Ai/GenericFunctions');
		const result = await vh3ListApiRequestAllPages.call(ctx, '/test/list', {}, 100);

		expect(result).toEqual([]);
		expect(callCount).toBe(1);
	});

	it('respects MAX_PAGES guard (does not loop infinitely)', async () => {
		const infiniteResponses = Array.from({ length: 250 }, (_, i) => ({
			items: [{ id: i }],
			pageItemCount: 100,
		}));
		const ctx = createMockContext(infiniteResponses);

		const { vh3ListApiRequestAllPages } = require('../nodes/Vh3Ai/GenericFunctions');
		const result = await vh3ListApiRequestAllPages.call(ctx, '/test/list', {}, 1);

		expect(result.length).toBe(200);
		expect(callCount).toBe(200);
	});
});

describe('buildSingleSentinelOverrides', () => {
	it('wraps non-empty overrides under the sentinel ID', () => {
		expect(
			buildSingleSentinelOverrides('fvf_rate_drop', { fvf_warning: 80 }),
		).toEqual({ fvf_rate_drop: { fvf_warning: 80 } });
	});

	it('preserves zero as a valid override (not treated as empty)', () => {
		expect(
			buildSingleSentinelOverrides('engineer_flagged_followup', { offset_days: 0 }),
		).toEqual({ engineer_flagged_followup: { offset_days: 0 } });
	});

	it('returns undefined for an empty collection', () => {
		expect(buildSingleSentinelOverrides('fvf_rate_drop', {})).toBeUndefined();
		expect(buildSingleSentinelOverrides('fvf_rate_drop', undefined)).toBeUndefined();
	});
});

describe('buildSentinelExclusions', () => {
	it('parses comma-separated site keys and numeric IDs', () => {
		expect(
			buildSentinelExclusions({
				excludedSiteKeys: 'site-001, site-002',
				excludedJobTypeIds: '10, 20 ,30',
				excludedContactIds: '5',
				excludedResourceIds: '999',
			}),
		).toEqual({
			excludedSiteKeys: ['site-001', 'site-002'],
			excludedJobTypeIds: [10, 20, 30],
			excludedContactIds: [5],
			excludedResourceIds: [999],
		});
	});

	it('omits empty fields and drops non-numeric IDs', () => {
		expect(
			buildSentinelExclusions({
				excludedSiteKeys: '',
				excludedJobTypeIds: 'abc, 7',
			}),
		).toEqual({ excludedJobTypeIds: [7] });
	});

	it('returns undefined when nothing is provided', () => {
		expect(buildSentinelExclusions({})).toBeUndefined();
		expect(buildSentinelExclusions(undefined)).toBeUndefined();
		expect(buildSentinelExclusions({ excludedSiteKeys: '   ' })).toBeUndefined();
	});
});

describe('parseSentinelOverridesJson', () => {
	const ctx = {
		getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
	} as unknown as IExecuteFunctions;

	it('parses a bare sentinel-to-thresholds map', () => {
		expect(
			parseSentinelOverridesJson(ctx, '{"fvf_rate_drop":{"fvf_warning":80}}'),
		).toEqual({ fvf_rate_drop: { fvf_warning: 80 } });
	});

	it('unwraps a full settings object with a paramOverrides key', () => {
		const blob = JSON.stringify({
			companyId: 'abc',
			paramOverrides: { site_deterioration: { min_sample: 20 } },
		});
		expect(parseSentinelOverridesJson(ctx, blob)).toEqual({
			site_deterioration: { min_sample: 20 },
		});
	});

	it('returns undefined for empty input', () => {
		expect(parseSentinelOverridesJson(ctx, '')).toBeUndefined();
		expect(parseSentinelOverridesJson(ctx, '{}')).toBeUndefined();
		expect(parseSentinelOverridesJson(ctx, undefined)).toBeUndefined();
	});

	it('throws on invalid JSON', () => {
		expect(() => parseSentinelOverridesJson(ctx, '{not json')).toThrow();
	});

	it('throws when the payload is not an object', () => {
		expect(() => parseSentinelOverridesJson(ctx, '[1,2,3]')).toThrow();
	});
});

describe('unwrapFsiList', () => {
	it('returns arrays unchanged', () => {
		expect(unwrapFsiList([{ id: 1 }] as unknown as JsonObject)).toEqual([{ id: 1 }]);
	});

	it('prefers a named key then items', () => {
		expect(unwrapFsiList({ teams: [{ id: 2 }], items: [{ id: 9 }] }, ['teams'])).toEqual([{ id: 2 }]);
		expect(unwrapFsiList({ items: [{ id: 3 }] })).toEqual([{ id: 3 }]);
	});

	it('unwraps result.items', () => {
		expect(unwrapFsiList({ result: { items: [{ id: 4 }] } })).toEqual([{ id: 4 }]);
	});

	it('falls back to the raw object', () => {
		expect(unwrapFsiList({ id: 5 })).toEqual([{ id: 5 }]);
	});
});

describe('parseJsonField', () => {
	it('parses JSON strings and passes objects through', () => {
		expect(parseJsonField('{"a":1}')).toEqual({ a: 1 });
		expect(parseJsonField({ a: 1 })).toEqual({ a: 1 });
	});

	it('returns undefined for empty values', () => {
		expect(parseJsonField('')).toBeUndefined();
		expect(parseJsonField('   ')).toBeUndefined();
		expect(parseJsonField(undefined)).toBeUndefined();
	});
});

describe('applyJobFeedTrueOnlyQuery', () => {
	it('omits has_follow_up and include_vh3_ai unless they are exactly true', () => {
		const qs: Record<string, string | number | boolean> = {};
		applyJobFeedTrueOnlyQuery(qs, {});
		expect(qs).toEqual({});

		applyJobFeedTrueOnlyQuery(qs, { hasFollowUp: false, includeVh3Ai: false });
		expect(qs).toEqual({});

		applyJobFeedTrueOnlyQuery(qs, { hasFollowUp: true, includeVh3Ai: true });
		expect(qs).toEqual({ has_follow_up: true, include_vh3_ai: true });
	});
});

describe('extractItems totalItemCount support', () => {
	it('extracts totalItemCount from Shape A (response.result)', () => {
		const raw: JsonObject = {
			response: {
				result: {
					items: [{ id: 1 }, { id: 2 }],
					totalItemCount: 25,
				},
			},
		};
		expect(extractItems(raw)).toEqual({
			items: [{ id: 1 }, { id: 2 }],
			pageItemCount: 2,
			totalItemCount: 25,
		});
	});

	it('extracts totalItemCount from Shape B (result)', () => {
		const raw: JsonObject = {
			result: {
				items: [{ id: 10 }],
				totalItemCount: 1,
			},
		};
		expect(extractItems(raw)).toEqual({
			items: [{ id: 10 }],
			pageItemCount: 1,
			totalItemCount: 1,
		});
	});

	it('extracts totalItemCount from Shape C (top-level)', () => {
		const raw: JsonObject = {
			items: [{ id: 1 }, { id: 2 }, { id: 3 }],
			totalItemCount: 3,
		};
		expect(extractItems(raw)).toEqual({
			items: [{ id: 1 }, { id: 2 }, { id: 3 }],
			pageItemCount: 3,
			totalItemCount: 3,
		});
	});
});

describe('totalItemCount pagination and vh3ListApiRequestWithLimit', () => {
	function createPagedContext(responses: JsonObject[]) {
		let calls = 0;
		const httpRequestWithAuthentication = jest.fn().mockImplementation(async () => {
			const res = responses[calls] ?? { items: [], pageItemCount: 0 };
			calls++;
			return res;
		});
		const ctx = {
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.test.io',
				companyId: 'test-company',
			}),
			helpers: { httpRequestWithAuthentication } as any,
			getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
		} as unknown as IExecuteFunctions;
		return { ctx, httpRequestWithAuthentication };
	}

	it('stops immediately on exact pageSize boundary when totalItemCount matches (1 request, not 2)', async () => {
		const page1Items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
		const { ctx, httpRequestWithAuthentication } = createPagedContext([
			{ result: { items: page1Items, totalItemCount: 100 } },
			{ result: { items: [], totalItemCount: 100 } },
		]);

		const result = await vh3ListApiRequestAllPages.call(ctx, '/flags/list', {}, 100);
		expect(result).toHaveLength(100);
		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
	});

	it('stops after multi-page totalItemCount exact multiple without trailing empty page request', async () => {
		const { ctx, httpRequestWithAuthentication } = createPagedContext([
			{ items: [{ id: 1 }, { id: 2 }], totalItemCount: 4 },
			{ items: [{ id: 3 }, { id: 4 }], totalItemCount: 4 },
			{ items: [], totalItemCount: 4 },
		]);

		const result = await vh3ListApiRequestAllPages.call(ctx, '/flags/list', {}, 2);
		expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(2);
	});

	it('fetches exact limit in a single call when limit <= maxPageSize', async () => {
		const { ctx, httpRequestWithAuthentication } = createPagedContext([
			{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], totalItemCount: 50 },
		]);

		const result = await vh3ListApiRequestWithLimit.call(ctx, '/flags/list', {}, 2);
		expect(result).toEqual([{ id: 1 }, { id: 2 }]);
		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
		const req = httpRequestWithAuthentication.mock.calls[0][1] as IHttpRequestOptions;
		expect(JSON.parse(req.body as string)).toEqual({ pageNumber: 1, pageSize: 2 });
	});

	it('paginates across pages when limit > maxPageSize and slices to exact limit', async () => {
		const { ctx, httpRequestWithAuthentication } = createPagedContext([
			{ items: [{ id: 1 }, { id: 2 }], totalItemCount: 10 },
			{ items: [{ id: 3 }, { id: 4 }], totalItemCount: 10 },
		]);

		const result = await vh3ListApiRequestWithLimit.call(ctx, '/flags/list', {}, 3, 2);
		expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(2);
	});
});

describe('BigChange upstream HTTP error propagation (429, 403, 404, 422)', () => {
	function createErrorContext(errorToThrow: unknown) {
		const httpRequestWithAuthentication = jest.fn().mockRejectedValue(errorToThrow);
		const ctx = {
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.vh3connect.io',
				companyId: 'test-company',
			}),
			helpers: { httpRequestWithAuthentication } as any,
			getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
		} as unknown as IExecuteFunctions;
		return { ctx, httpRequestWithAuthentication };
	}

	it('surfaces 429 Limit Exceeded through vh3ListApiRequest with httpCode, message, and description', async () => {
		const axios429 = {
			message: 'Request failed with status code 429',
			response: {
				status: 429,
				data: {
					code: 'ERROR_CODE_TOO_MANY_REQUESTS',
					message: 'Rate limit reached',
					payload: { error: { message: 'Limit Exceeded' } },
				},
			},
		};
		const { ctx } = createErrorContext(axios429);

		try {
			await vh3ListApiRequest.call(ctx, '/flags/list', {});
			fail('Expected vh3ListApiRequest to throw');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe('429');
			expect(apiErr.message).toContain('429');
			expect(apiErr.message).toContain('Limit Exceeded');
			expect(apiErr.description).toContain('429');
			expect(apiErr.description).toContain('Limit Exceeded');
		}
	});

	it('surfaces 429 Limit Exceeded through vh3ProxyGetRequest even when error is a pre-wrapped NodeApiError', async () => {
		const preWrapped = new NodeApiError(
			{ name: 'VH3 AI' } as any,
			{
				statusCode: 429,
				response: { status: 429, data: { title: 'Too Many Requests', detail: 'Limit Exceeded' } },
			},
			{ httpCode: '429', description: 'Limit Exceeded' },
		);
		const { ctx } = createErrorContext(preWrapped);

		try {
			await vh3ProxyGetRequest.call(ctx, '/jobs/line_item', { jobId: 1, lineItemId: 2 });
			fail('Expected vh3ProxyGetRequest to throw');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe('429');
			expect(apiErr.message).toContain('429');
			expect(apiErr.message).toContain('Limit Exceeded');
			expect(apiErr.description).toContain('GET /jobs/line_item');
			expect(apiErr.description).toContain('Limit Exceeded');
		}
	});

	it.each([
		{
			status: 403,
			data: { message: 'Access denied', payload: { detail: 'Missing scope flag:write' } },
			expectedText: 'Missing scope flag:write',
		},
		{
			status: 404,
			data: { title: 'Not Found', detail: 'Job 99999 was not found' },
			expectedText: 'Job 99999 was not found',
		},
		{
			status: 422,
			data: { title: 'Validation Error', detail: 'unitSellingPrice must be >= 0' },
			expectedText: 'unitSellingPrice must be >= 0',
		},
	])('propagates HTTP $status with payload details', async ({ status, data, expectedText }) => {
		const { ctx } = createErrorContext({
			message: `Request failed with status code ${status}`,
			response: { status, data },
		});

		try {
			await vh3ListApiRequest.call(ctx, '/jobs/line_item/create', { jobId: 1 });
			fail(`Expected HTTP ${status} to throw`);
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe(String(status));
			expect(apiErr.message).toContain(String(status));
			expect(apiErr.message).toContain(expectedText);
			expect(apiErr.description).toContain(expectedText);
		}
	});

	it('promotes upstream payload.status from Xano HTTP 400 wrapper for 403, 404, 422, and non-JSON 502', async () => {
		const cases: Array<{ upstreamStatus: number; payload: JsonObject; expectedText: string }> = [
			{
				upstreamStatus: 403,
				payload: { title: 'Forbidden', detail: 'Missing scope flags:read', status: 403 },
				expectedText: 'Forbidden: Missing scope flags:read',
			},
			{
				upstreamStatus: 404,
				payload: { title: 'The Flag For JobId with id 123 was not found.', status: 404 },
				expectedText: 'The Flag For JobId with id 123 was not found.',
			},
			{
				upstreamStatus: 422,
				payload: { title: 'Validation Error', detail: 'quantity must be > 0', status: 422 },
				expectedText: 'Validation Error: quantity must be > 0',
			},
			{
				upstreamStatus: 502,
				payload: { status: 502, result: 'Bad Gateway' },
				expectedText: 'Bad Gateway',
			},
		];

		for (const { upstreamStatus, payload, expectedText } of cases) {
			// Simulate n8n httpRequestWithAuthentication pre-wrapping Xano's HTTP 400 in NodeApiError
			const preWrapped = new NodeApiError(
				{ name: 'VH3 AI' } as any,
				{
					response: {
						status: 400,
						data: {
							code: 'ERROR_CODE_BAD_REQUEST',
							message: 'Something went wrong.',
							payload,
						},
					},
				},
				{ httpCode: '400' },
			);
			const { ctx } = createErrorContext(preWrapped);

			try {
				await vh3ListApiRequest.call(ctx, '/flags/job/get', { jobId: 123 });
				fail(`Expected ${upstreamStatus} to throw`);
			} catch (err) {
				expect(err).toBeInstanceOf(NodeApiError);
				const apiErr = err as NodeApiError;
				expect(apiErr.httpCode).toBe(String(upstreamStatus));
				expect(apiErr.message).toContain(String(upstreamStatus));
				expect(apiErr.message).toContain(expectedText);
				expect(apiErr.message).not.toContain('Something went wrong.');
				expect(apiErr.message).not.toContain('Bad request - please check your parameters');
			}
		}
	});

	it('deduplicates Xano 429 wrapper message while preserving Limit Exceeded and status 429', async () => {
		const xano429 = {
			response: {
				status: 429,
				data: {
					code: 'ERROR_CODE_TOO_MANY_REQUESTS',
					message: 'BigChange API rate/quota limit exceeded',
					payload: { message: 'Limit Exceeded', status: 429 },
				},
			},
		};
		const { ctx } = createErrorContext(xano429);

		try {
			await vh3ListApiRequest.call(ctx, '/flags/list', {});
			fail('Expected 429 to throw');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe('429');
			expect(apiErr.message).toBe('BigChange API rate/quota limit exceeded (429): Limit Exceeded');
			expect(apiErr.description).toBe('POST /flags/list failed with HTTP 429: Limit Exceeded');
		}
	});

	it('preserves Xano-native 401 unauthorized when no upstream payload.status is present', async () => {
		const xano401 = {
			response: {
				status: 401,
				data: {
					code: 'ERROR_CODE_UNAUTHORIZED',
					message: 'Invalid API key',
				},
			},
		};
		const { ctx } = createErrorContext(xano401);

		try {
			await vh3ListApiRequest.call(ctx, '/flags/list', {});
			fail('Expected 401 to throw');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe('401');
			expect(apiErr.message).toContain('401');
			expect(apiErr.message).toContain('Invalid API key');
		}
	});

	it('preserves NodeApiError with 429 in Vh3Ai.execute() when continueOnFail is false and emits error item when true', async () => {
		const error429 = {
			statusCode: 429,
			response: { status: 429, data: { error: { message: 'Limit Exceeded' } } },
		};

		const makeContext = (continueOnFail: boolean) =>
			({
				getInputData: jest.fn().mockReturnValue([{ json: {} }]),
				getNodeParameter: jest.fn((name: string, _idx: number, fallback?: unknown) => {
					const params: Record<string, unknown> = {
						resource: 'jobs',
						operation: 'getJob',
						jobId: 101,
						simplify: false,
						includeWorksheets: false,
					};
					return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : fallback;
				}),
				getCredentials: jest.fn().mockResolvedValue({
					apiKey: 'tenant-key',
					companyId: 'company-1',
					baseUrl: 'https://api.vh3connect.io',
					fsiBaseUrl: 'https://api.vh3connect.io/api:kP8T1CK7',
				}),
				getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
				continueOnFail: jest.fn().mockReturnValue(continueOnFail),
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockRejectedValue(error429),
					returnJsonArray: jest.fn((items: JsonObject[]) => items.map((json) => ({ json }))),
					constructExecutionMetaData: jest.fn((items: JsonObject[]) => items),
				},
			}) as unknown as IExecuteFunctions;

		// Continue On Fail = false -> throws NodeApiError with httpCode 429
		try {
			await new Vh3Ai().execute.call(makeContext(false));
			fail('Expected execute() to throw NodeApiError');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe('429');
			expect(apiErr.message).toContain('429');
			expect(apiErr.message).toContain('Limit Exceeded');
		}

		// Continue On Fail = true -> returns error item with 429 status & message intact
		const output = await new Vh3Ai().execute.call(makeContext(true));
		expect(output[0]).toHaveLength(1);
		expect(output[0][0].json.error).toContain('429');
		expect(output[0][0].json.error).toContain('Limit Exceeded');
		expect(output[0][0].json.httpCode).toBe('429');
		expect(output[0][0].json.description).toContain('Limit Exceeded');
	});
});
