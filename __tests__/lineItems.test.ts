import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { Vh3Ai } from '../nodes/Vh3Ai/Vh3Ai.node';

const CREDENTIALS = {
	apiKey: 'tenant-api-key',
	companyId: '',
	baseUrl: 'https://api.vh3connect.io',
	fsiBaseUrl: 'https://api.vh3connect.io/api:kP8T1CK7',
};

async function executeLineItems(
	parameters: Record<string, unknown>,
	options: { responses?: unknown[]; rejectAuth?: unknown } = {},
) {
	let idx = 0;
	const httpRequestWithAuthentication = options.rejectAuth
		? jest.fn().mockRejectedValue(options.rejectAuth)
		: jest.fn().mockImplementation(async () => {
				const list = options.responses ?? [{ id: 1 }];
				const res = list[idx] ?? { items: [], pageItemCount: 0 };
				idx++;
				return res;
		  });

	const context = {
		getInputData: jest.fn().mockReturnValue([{ json: {} }]),
		getNodeParameter: jest.fn((name: string, _index: number, fallback?: unknown) =>
			Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : fallback,
		),
		getCredentials: jest.fn().mockResolvedValue(CREDENTIALS),
		getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
		continueOnFail: jest.fn().mockReturnValue(false),
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

function getAuthOpts(mock: jest.Mock, callIdx = 0): IHttpRequestOptions {
	return mock.mock.calls[callIdx][1] as IHttpRequestOptions;
}

describe.each([
	{ resource: 'jobs', parentField: 'jobId', routePrefix: '/jobs/line_item', parentId: 1001 },
	{
		resource: 'jobGroups',
		parentField: 'jobGroupId',
		routePrefix: '/job_groups/line_item',
		parentId: 2002,
	},
])('$resource line items CRUD', ({ resource, parentField, routePrefix, parentId }) => {
	it('lists line items with Return All, Simplify, sortBy, and direction', async () => {
		const { output, httpRequestWithAuthentication } = await executeLineItems(
			{
				resource,
				operation: 'listLineItems',
				[parentField]: parentId,
				returnAll: true,
				simplify: true,
				additionalFields: { sortBy: 'createdAt', direction: 'ascending' },
			},
			{
				responses: [
					{
						result: {
							items: [
								{ id: 1, description: 'Labour', quantity: 2 },
								{ id: 2, description: 'Part', quantity: 1 },
							],
							pageItemCount: 2,
						},
					},
				],
			},
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('POST');
		expect(req.url).toBe(`https://api.vh3connect.io/api:YdihQNr3${routePrefix}/list`);
		expect(JSON.parse(req.body as string)).toEqual({
			[parentField]: parentId,
			compact: true,
			sortBy: 'createdAt',
			direction: 'ascending',
			pageNumber: 1,
			pageSize: 100,
		});
		expect(output[0]).toHaveLength(2);
	});

	it('respects Limit when Return All is false on listLineItems', async () => {
		const { output, httpRequestWithAuthentication } = await executeLineItems(
			{
				resource,
				operation: 'listLineItems',
				[parentField]: parentId,
				returnAll: false,
				limit: 1,
				simplify: false,
				additionalFields: {},
			},
			{
				responses: [{ items: [{ id: 1 }, { id: 2 }], pageItemCount: 2 }],
			},
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(JSON.parse(req.body as string)).toEqual({
			[parentField]: parentId,
			pageNumber: 1,
			pageSize: 1,
		});
		expect(output[0]).toHaveLength(1);
	});

	it('gets a single line item via GET with Simplify', async () => {
		const { output, httpRequestWithAuthentication } = await executeLineItems(
			{
				resource,
				operation: 'getLineItem',
				[parentField]: parentId,
				lineItemId: 55,
				simplify: true,
			},
			{ responses: [{ id: 55, description: 'Valve' }] },
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('GET');
		expect(req.url).toBe(`https://api.vh3connect.io/api:YdihQNr3${routePrefix}`);
		expect(req.qs).toEqual({ [parentField]: parentId, lineItemId: 55, compact: true });
		expect(output[0][0].json).toEqual({ id: 55, description: 'Valve' });
	});

	it('creates a line item preserving numeric 0 for unitSellingPrice and unitCost and omitting unset fields', async () => {
		const { httpRequestWithAuthentication } = await executeLineItems(
			{
				resource,
				operation: 'createLineItem',
				[parentField]: parentId,
				quantity: 3,
				additionalFields: {
					description: 'Internal cost-only line',
					unitCost: 0,
					unitSellingPrice: 0,
					nominalCodeId: 4000,
				},
			},
			{ responses: [{ id: 77 }] },
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('POST');
		expect(req.url).toBe(`https://api.vh3connect.io/api:YdihQNr3${routePrefix}/create`);
		expect(JSON.parse(req.body as string)).toEqual({
			[parentField]: parentId,
			quantity: 3,
			description: 'Internal cost-only line',
			unitCost: 0,
			unitSellingPrice: 0,
			nominalCodeId: 4000,
		});
	});

	it('edits a line item with presence-only PATCH and preserves numeric 0', async () => {
		const { httpRequestWithAuthentication } = await executeLineItems(
			{
				resource,
				operation: 'editLineItem',
				[parentField]: parentId,
				lineItemId: 55,
				updateFields: {
					unitSellingPrice: 0,
					description: 'Updated cost line',
				},
			},
			{ responses: [{ id: 55, unitSellingPrice: 0 }] },
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('POST');
		expect(req.url).toBe(`https://api.vh3connect.io/api:YdihQNr3${routePrefix}/edit`);
		expect(JSON.parse(req.body as string)).toEqual({
			[parentField]: parentId,
			lineItemId: 55,
			unitSellingPrice: 0,
			description: 'Updated cost line',
		});
	});

	it('deletes a line item via POST .../delete', async () => {
		const { httpRequestWithAuthentication } = await executeLineItems(
			{
				resource,
				operation: 'deleteLineItem',
				[parentField]: parentId,
				lineItemId: 55,
			},
			{ responses: [{ deleted: true }] },
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('POST');
		expect(req.url).toBe(`https://api.vh3connect.io/api:YdihQNr3${routePrefix}/delete`);
		expect(JSON.parse(req.body as string)).toEqual({
			[parentField]: parentId,
			lineItemId: 55,
		});
	});

	it('propagates 429 Limit Exceeded errors via NodeApiError', async () => {
		try {
			await executeLineItems(
				{
					resource,
					operation: 'getLineItem',
					[parentField]: parentId,
					lineItemId: 55,
					simplify: false,
				},
				{
					rejectAuth: {
						statusCode: 429,
						response: { status: 429, data: { error: { message: 'Limit Exceeded' } } },
					},
				},
			);
			fail('Expected 429 error');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			expect((err as NodeApiError).httpCode).toBe('429');
			expect((err as NodeApiError).message).toContain('Limit Exceeded');
		}
	});
});
