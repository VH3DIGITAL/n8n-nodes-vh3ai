import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { Vh3Ai } from '../nodes/Vh3Ai/Vh3Ai.node';

const CREDENTIALS = {
	apiKey: 'tenant-api-key',
	companyId: '',
	baseUrl: 'https://api.vh3connect.io',
	fsiBaseUrl: 'https://api.vh3connect.io/api:kP8T1CK7',
};

async function executeFlags(
	parameters: Record<string, unknown>,
	options: {
		responses?: unknown[];
		rejectAuth?: unknown;
		continueOnFail?: boolean;
	} = {},
) {
	let callIndex = 0;
	const httpRequestWithAuthentication = options.rejectAuth
		? jest.fn().mockRejectedValue(options.rejectAuth)
		: jest.fn().mockImplementation(async () => {
				const list = options.responses ?? [{ id: 1 }];
				const res = list[callIndex] ?? { items: [], pageItemCount: 0 };
				callIndex++;
				return res;
		  });

	const context = {
		getInputData: jest.fn().mockReturnValue([{ json: {} }]),
		getNodeParameter: jest.fn((name: string, _index: number, fallback?: unknown) =>
			Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : fallback,
		),
		getCredentials: jest.fn().mockResolvedValue(CREDENTIALS),
		getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
		continueOnFail: jest.fn().mockReturnValue(Boolean(options.continueOnFail)),
		helpers: {
			httpRequest: jest.fn(),
			httpRequestWithAuthentication,
			returnJsonArray: jest.fn((items: JsonObject[]) => items.map((json) => ({ json }))),
			constructExecutionMetaData: jest.fn((items: JsonObject[]) => items),
		},
	} as unknown as IExecuteFunctions;

	const output = await new Vh3Ai().execute.call(context);
	return { output, httpRequestWithAuthentication };
}

function getAuthRequest(mock: jest.Mock, callIdx = 0): { credName: string; opts: IHttpRequestOptions } {
	return {
		credName: mock.mock.calls[callIdx][0] as string,
		opts: mock.mock.calls[callIdx][1] as IHttpRequestOptions,
	};
}

describe('Flag (BigChange) resource', () => {
	it('lists flag definitions with filters, Simplify, and totalItemCount auto-pagination', async () => {
		const page1 = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Flag ${i + 1}` }));
		const { output, httpRequestWithAuthentication } = await executeFlags(
			{
				resource: 'flag',
				operation: 'listDefinitions',
				returnAll: true,
				simplify: true,
				additionalFields: {
					entityType: 'job',
					sortBy: 'name',
					direction: 'ascending',
				},
			},
			{
				responses: [
					{ result: { items: page1, totalItemCount: 100 } },
					{ result: { items: [], totalItemCount: 100 } },
				],
			},
		);

		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
		const { credName, opts } = getAuthRequest(httpRequestWithAuthentication);
		expect(credName).toBe('vh3AiApi');
		expect(opts.method).toBe('POST');
		expect(opts.url).toBe('https://api.vh3connect.io/api:YdihQNr3/flags/list');
		expect(JSON.parse(opts.body as string)).toEqual({
			compact: true,
			entityType: 'job',
			sortBy: 'name',
			direction: 'ascending',
			pageNumber: 1,
			pageSize: 100,
		});
		expect(output[0]).toHaveLength(100);
		expect(output[0][0].json).toEqual({ id: 1, name: 'Flag 1' });
	});

	it('respects Limit when returnAll is false on listDefinitions', async () => {
		const { output, httpRequestWithAuthentication } = await executeFlags(
			{
				resource: 'flag',
				operation: 'listDefinitions',
				returnAll: false,
				limit: 2,
				simplify: false,
				additionalFields: {},
			},
			{
				responses: [{ items: [{ id: 10 }, { id: 11 }, { id: 12 }], totalItemCount: 30 }],
			},
		);

		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
		const { opts } = getAuthRequest(httpRequestWithAuthentication);
		expect(JSON.parse(opts.body as string)).toEqual({ pageNumber: 1, pageSize: 2 });
		expect(output[0].map((i) => i.json)).toEqual([{ id: 10 }, { id: 11 }]);
	});

	describe.each([
		{ entityType: 'note', slug: 'note', idField: 'noteId', deleteIdField: 'flagId' },
		{ entityType: 'job', slug: 'job', idField: 'jobId', deleteIdField: 'jobFlagId' },
		{ entityType: 'invoice', slug: 'invoice', idField: 'invoiceId', deleteIdField: 'flagId' },
		{ entityType: 'jobGroup', slug: 'job_group', idField: 'jobGroupId', deleteIdField: 'flagId' },
		{
			entityType: 'purchaseOrder',
			slug: 'purchase_order',
			idField: 'purchaseOrderId',
			deleteIdField: 'flagId',
		},
		{ entityType: 'quote', slug: 'quote', idField: 'quoteId', deleteIdField: 'flagId' },
		{
			entityType: 'salesOpportunity',
			slug: 'sales_opportunity',
			idField: 'opportunityId',
			deleteIdField: 'flagId',
		},
	])('single-active-flag routes for $entityType', ({ entityType, slug, idField, deleteIdField }) => {
		it('getActiveFlag calls POST /flags/<slug>/get with entity ID and compact and marks hasActiveFlag: true', async () => {
			const { output, httpRequestWithAuthentication } = await executeFlags(
				{
					resource: 'flag',
					operation: 'getActiveFlag',
					entityType,
					entityId: 42,
					simplify: true,
				},
				{ responses: [{ result: { id: 900, flagId: 7 }, status: 200 }] },
			);

			const { opts } = getAuthRequest(httpRequestWithAuthentication);
			expect(opts.method).toBe('POST');
			expect(opts.url).toBe(`https://api.vh3connect.io/api:YdihQNr3/flags/${slug}/get`);
			expect(JSON.parse(opts.body as string)).toEqual({ [idField]: 42, compact: true });
			expect(output[0][0].json).toEqual({
				result: { id: 900, flagId: 7 },
				status: 200,
				hasActiveFlag: true,
			});
		});

		it('getActiveFlag treats gateway HTTP 400 with payload.status 404 as no active flag set', async () => {
			const xanoWrapped404 = {
				statusCode: 400,
				response: {
					status: 400,
					data: {
						code: 'ERROR_CODE_BAD_REQUEST',
						message: 'Something went wrong.',
						payload: {
							title: `The Flag For ${idField} with id 42 was not found.`,
							status: 404,
						},
					},
				},
			};
			const { output } = await executeFlags(
				{
					resource: 'flag',
					operation: 'getActiveFlag',
					entityType,
					entityId: 42,
					simplify: false,
				},
				{ rejectAuth: xanoWrapped404 },
			);

			expect(output[0]).toHaveLength(1);
			expect(output[0][0].json).toEqual({
				hasActiveFlag: false,
				result: null,
				status: 404,
				entityType,
				[idField]: 42,
			});
		});

		it('listFlagHistory calls POST /flags/<slug>/history and emits one item per record', async () => {
			const { output, httpRequestWithAuthentication } = await executeFlags(
				{
					resource: 'flag',
					operation: 'listFlagHistory',
					entityType,
					entityId: 42,
					returnAll: false,
					limit: 10,
					simplify: false,
				},
				{ responses: [{ result: { items: [{ id: 1 }, { id: 2 }], pageItemCount: 2 } }] },
			);

			const { opts } = getAuthRequest(httpRequestWithAuthentication);
			expect(opts.url).toBe(`https://api.vh3connect.io/api:YdihQNr3/flags/${slug}/history`);
			expect(JSON.parse(opts.body as string)).toEqual({
				[idField]: 42,
				pageNumber: 1,
				pageSize: 10,
			});
			expect(output[0].map((item) => item.json)).toEqual([{ id: 1 }, { id: 2 }]);
		});

		it('addFlag calls POST /flags/<slug>/create and omits empty owner/comments', async () => {
			const { httpRequestWithAuthentication } = await executeFlags(
				{
					resource: 'flag',
					operation: 'addFlag',
					entityType,
					entityId: 42,
					flagId: 7,
					additionalFields: { owner: '  ', comments: 'Escalated' },
				},
				{ responses: [{ id: 901 }] },
			);

			const { opts } = getAuthRequest(httpRequestWithAuthentication);
			expect(opts.url).toBe(`https://api.vh3connect.io/api:YdihQNr3/flags/${slug}/create`);
			expect(JSON.parse(opts.body as string)).toEqual({
				[idField]: 42,
				flagId: 7,
				comments: 'Escalated',
			});
		});

		it('deleteFlag calls POST /flags/<slug>/delete using historyId mapped to the correct delete field', async () => {
			const { httpRequestWithAuthentication } = await executeFlags(
				{
					resource: 'flag',
					operation: 'deleteFlag',
					entityType,
					entityId: 42,
					historyId: 555,
				},
				{ responses: [{ deleted: true }] },
			);

			const { opts } = getAuthRequest(httpRequestWithAuthentication);
			expect(opts.url).toBe(`https://api.vh3connect.io/api:YdihQNr3/flags/${slug}/delete`);
			expect(JSON.parse(opts.body as string)).toEqual({
				[idField]: 42,
				[deleteIdField]: 555,
			});
		});
	});

	it('covers all 3 job-group bulk job-flag operations', async () => {
		const listRes = await executeFlags(
			{
				resource: 'flag',
				operation: 'listJobGroupJobFlags',
				groupId: 77,
				returnAll: true,
				simplify: true,
			},
			{ responses: [{ items: [{ jobId: 1, flagId: 3 }], pageItemCount: 1 }] },
		);
		expect(getAuthRequest(listRes.httpRequestWithAuthentication).opts.url).toBe(
			'https://api.vh3connect.io/api:YdihQNr3/flags/job_group_jobs/list',
		);
		expect(JSON.parse(getAuthRequest(listRes.httpRequestWithAuthentication).opts.body as string)).toEqual({
			groupId: 77,
			compact: true,
			pageNumber: 1,
			pageSize: 100,
		});
		expect(listRes.output[0]).toHaveLength(1);

		const historyRes = await executeFlags(
			{
				resource: 'flag',
				operation: 'listJobGroupJobFlagHistory',
				groupId: 77,
				returnAll: false,
				limit: 25,
				simplify: false,
			},
			{ responses: [{ items: [{ id: 10 }, { id: 11 }], pageItemCount: 2 }] },
		);
		expect(getAuthRequest(historyRes.httpRequestWithAuthentication).opts.url).toBe(
			'https://api.vh3connect.io/api:YdihQNr3/flags/job_group_jobs/history',
		);
		expect(historyRes.output[0]).toHaveLength(2);

		const applyRes = await executeFlags(
			{
				resource: 'flag',
				operation: 'applyJobGroupJobFlag',
				groupId: 77,
				flagId: 9,
				additionalFields: { owner: 'Ops', comments: 'Batch flag' },
			},
			{ responses: [{ applied: 4 }] },
		);
		expect(getAuthRequest(applyRes.httpRequestWithAuthentication).opts.url).toBe(
			'https://api.vh3connect.io/api:YdihQNr3/flags/job_group_jobs/create',
		);
		expect(JSON.parse(getAuthRequest(applyRes.httpRequestWithAuthentication).opts.body as string)).toEqual({
			groupId: 77,
			flagId: 9,
			owner: 'Ops',
			comments: 'Batch flag',
		});
	});

	it('covers all 3 person multi-tag flag operations', async () => {
		const uuid = '11111111-2222-3333-4444-555555555555';

		const listRes = await executeFlags(
			{
				resource: 'flag',
				operation: 'listPersonFlags',
				personId: uuid,
				returnAll: true,
				simplify: true,
			},
			{
				responses: [
					{ items: [{ flagId: 12 }, { flagId: 13 }], totalItemCount: 2 },
					{ items: [], totalItemCount: 2 },
				],
			},
		);
		expect(listRes.httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
		expect(getAuthRequest(listRes.httpRequestWithAuthentication).opts.url).toBe(
			'https://api.vh3connect.io/api:YdihQNr3/flags/person/list',
		);
		expect(JSON.parse(getAuthRequest(listRes.httpRequestWithAuthentication).opts.body as string)).toEqual({
			personId: uuid,
			compact: true,
			pageNumber: 1,
			pageSize: 100,
		});
		expect(listRes.output[0]).toHaveLength(2);

		const addRes = await executeFlags(
			{ resource: 'flag', operation: 'addPersonFlag', personId: uuid, flagId: 12 },
			{ responses: [{ ok: true }] },
		);
		expect(getAuthRequest(addRes.httpRequestWithAuthentication).opts.url).toBe(
			'https://api.vh3connect.io/api:YdihQNr3/flags/person/create',
		);
		expect(JSON.parse(getAuthRequest(addRes.httpRequestWithAuthentication).opts.body as string)).toEqual({
			personId: uuid,
			flagId: 12,
		});

		const removeRes = await executeFlags(
			{ resource: 'flag', operation: 'removePersonFlag', personId: uuid, flagId: 12 },
			{ responses: [{ ok: true }] },
		);
		expect(getAuthRequest(removeRes.httpRequestWithAuthentication).opts.url).toBe(
			'https://api.vh3connect.io/api:YdihQNr3/flags/person/delete',
		);
		expect(JSON.parse(getAuthRequest(removeRes.httpRequestWithAuthentication).opts.body as string)).toEqual({
			personId: uuid,
			flagId: 12,
		});
	});

	it('still throws NodeApiError with httpCode 403 on getActiveFlag when tenant lacks scope', async () => {
		try {
			await executeFlags(
				{
					resource: 'flag',
					operation: 'getActiveFlag',
					entityType: 'job',
					entityId: 42,
					simplify: false,
				},
				{
					rejectAuth: {
						statusCode: 400,
						response: {
							status: 400,
							data: {
								code: 'ERROR_CODE_BAD_REQUEST',
								message: 'Something went wrong.',
								payload: { title: 'Forbidden', detail: 'Missing scope jobs:read', status: 403 },
							},
						},
					},
				},
			);
			fail('Expected 403 to throw');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe('403');
			expect(apiErr.message).toContain('Missing scope jobs:read');
		}
	});

	it('propagates 429 Limit Exceeded errors via NodeApiError on Flag operations', async () => {
		try {
			await executeFlags(
				{
					resource: 'flag',
					operation: 'listDefinitions',
					returnAll: false,
					limit: 50,
					simplify: false,
					additionalFields: {},
				},
				{
					rejectAuth: {
						statusCode: 429,
						response: { status: 429, data: { error: { message: 'Limit Exceeded' } } },
					},
				},
			);
			fail('Expected 429 to throw');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			const apiErr = err as NodeApiError;
			expect(apiErr.httpCode).toBe('429');
			expect(apiErr.message).toContain('429');
			expect(apiErr.message).toContain('Limit Exceeded');
		}
	});
});
