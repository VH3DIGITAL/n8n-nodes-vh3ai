import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import {
	extractItems,
	omitEmptyWsParams,
	toWebServicesDateTime,
} from '../nodes/Vh3Ai/GenericFunctions';

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
