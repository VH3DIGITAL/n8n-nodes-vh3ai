import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import { Vh3Ai } from '../nodes/Vh3Ai/Vh3Ai.node';

const CREDENTIALS = {
	apiKey: 'tenant-api-key',
	companyId: '',
	baseUrl: 'https://api.vh3connect.io',
	fsiBaseUrl: 'https://api.vh3connect.io/api:kP8T1CK7',
};

async function executeWorksheets(
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

describe('Worksheet (BigChange) job worksheet operations', () => {
	it('lists job worksheets, explicitly sending includeBranchedWorksheets: false and compact: true', async () => {
		const { output, httpRequestWithAuthentication } = await executeWorksheets(
			{
				resource: 'worksheets',
				operation: 'listJobWorksheets',
				jobId: 4001,
				returnAll: true,
				simplify: true,
				additionalFields: { includeBranchedWorksheets: false },
			},
			{
				responses: [
					{
						result: {
							items: [
								{ id: 12345, name: 'Safety Check', linkType: 'linkedToJob' },
								{ id: 67890, name: 'Sign Off', linkType: 'linkedToJob' },
							],
							pageItemCount: 2,
						},
					},
				],
			},
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('POST');
		expect(req.url).toBe('https://api.vh3connect.io/api:YdihQNr3/jobs/worksheets/list');
		expect(JSON.parse(req.body as string)).toEqual({
			jobId: 4001,
			compact: true,
			includeBranchedWorksheets: false,
			pageNumber: 1,
			pageSize: 100,
		});
		expect(output[0]).toHaveLength(2);
		expect(output[0][0].json).toEqual({
			id: 12345,
			name: 'Safety Check',
			linkType: 'linkedToJob',
		});
	});

	it('respects Limit when Return All is false on listJobWorksheets', async () => {
		const { output, httpRequestWithAuthentication } = await executeWorksheets(
			{
				resource: 'worksheets',
				operation: 'listJobWorksheets',
				jobId: 4001,
				returnAll: false,
				limit: 1,
				simplify: false,
				additionalFields: {},
			},
			{
				responses: [
					{
						items: [
							{ id: 12345, name: 'Safety Check', linkType: 'linkedToJob' },
							{ id: 67890, name: 'Sign Off', linkType: 'linkedToJob' },
						],
						pageItemCount: 2,
					},
				],
			},
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(JSON.parse(req.body as string)).toEqual({
			jobId: 4001,
			pageNumber: 1,
			pageSize: 1,
		});
		expect(output[0]).toHaveLength(1);
	});

	it('gets a single job worksheet via GET /jobs/worksheets/get with Simplify', async () => {
		const { output, httpRequestWithAuthentication } = await executeWorksheets(
			{
				resource: 'worksheets',
				operation: 'getJobWorksheet',
				jobId: 4001,
				worksheetId: 12345,
				simplify: true,
			},
			{
				responses: [{ id: 12345, name: 'Safety Check', linkType: 'linkedToJob' }],
			},
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('GET');
		expect(req.url).toBe('https://api.vh3connect.io/api:YdihQNr3/jobs/worksheets/get');
		expect(req.qs).toEqual({ jobId: 4001, worksheetId: 12345, compact: true });
		expect(output[0][0].json).toEqual({ id: 12345, name: 'Safety Check', linkType: 'linkedToJob' });
	});

	it('updates job worksheets from comma-separated IDs string', async () => {
		const { httpRequestWithAuthentication } = await executeWorksheets(
			{
				resource: 'worksheets',
				operation: 'updateJobWorksheets',
				jobId: 4001,
				worksheetIds: '12345, 67890',
			},
			{ responses: [{ updated: true }] },
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('POST');
		expect(req.url).toBe('https://api.vh3connect.io/api:YdihQNr3/jobs/worksheets/set');
		expect(JSON.parse(req.body as string)).toEqual({
			jobId: 4001,
			worksheetIds: [12345, 67890],
		});
	});

	it('updates job worksheets from JSON array string and native array expression', async () => {
		const jsonRes = await executeWorksheets(
			{
				resource: 'worksheets',
				operation: 'updateJobWorksheets',
				jobId: 4001,
				worksheetIds: '[111, 222]',
			},
			{ responses: [{ updated: true }] },
		);
		expect(JSON.parse(getAuthOpts(jsonRes.httpRequestWithAuthentication).body as string)).toEqual({
			jobId: 4001,
			worksheetIds: [111, 222],
		});

		const arrayRes = await executeWorksheets(
			{
				resource: 'worksheets',
				operation: 'updateJobWorksheets',
				jobId: 4001,
				worksheetIds: [333, 444],
			},
			{ responses: [{ updated: true }] },
		);
		expect(JSON.parse(getAuthOpts(arrayRes.httpRequestWithAuthentication).body as string)).toEqual({
			jobId: 4001,
			worksheetIds: [333, 444],
		});
	});

	it.each(['', '   ', '123, abc', '123abc', '[123, "bad"]', '{not-an-array}', '0', '-5', '12.5'])(
		'rejects invalid worksheetIds value %j with NodeOperationError without calling the API',
		async (badInput) => {
			await expect(
				executeWorksheets({
					resource: 'worksheets',
					operation: 'updateJobWorksheets',
					jobId: 4001,
					worksheetIds: badInput,
				}),
			).rejects.toThrow(NodeOperationError);
		},
	);

	it('propagates 429 Limit Exceeded errors via NodeApiError', async () => {
		try {
			await executeWorksheets(
				{
					resource: 'worksheets',
					operation: 'getJobWorksheet',
					jobId: 4001,
					worksheetId: 12345,
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
