import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { Vh3Ai } from '../nodes/Vh3Ai/Vh3Ai.node';

const CREDENTIALS = {
	apiKey: 'tenant-api-key',
	companyId: '',
	baseUrl: 'https://api.vh3connect.io',
	fsiBaseUrl: 'https://api.vh3connect.io/api:kP8T1CK7',
};

async function executeNotes(
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

describe('Note (BigChange) comments operations', () => {
	it('lists note comments with Return All auto-pagination, Simplify, sortBy, and direction', async () => {
		const page1 = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, text: `Comment ${i + 1}` }));
		const { output, httpRequestWithAuthentication } = await executeNotes(
			{
				resource: 'notes',
				operation: 'listComments',
				noteId: 500,
				returnAll: true,
				simplify: true,
				additionalFields: { sortBy: 'createdAt', direction: 'ascending' },
			},
			{
				responses: [
					{ result: { items: page1, pageItemCount: 100 } },
					{ result: { items: [{ id: 101, text: 'Last' }], pageItemCount: 1 } },
				],
			},
		);

		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(2);
		const req1 = getAuthOpts(httpRequestWithAuthentication, 0);
		expect(req1.method).toBe('POST');
		expect(req1.url).toBe('https://api.vh3connect.io/api:YdihQNr3/notes/comments/list');
		expect(JSON.parse(req1.body as string)).toEqual({
			noteId: 500,
			compact: true,
			sortBy: 'createdAt',
			direction: 'ascending',
			pageNumber: 1,
			pageSize: 100,
		});
		expect(output[0]).toHaveLength(101);
		expect(output[0][100].json).toEqual({ id: 101, text: 'Last' });
	});

	it('respects Limit when Return All is false on listComments', async () => {
		const { output, httpRequestWithAuthentication } = await executeNotes(
			{
				resource: 'notes',
				operation: 'listComments',
				noteId: 500,
				returnAll: false,
				limit: 5,
				simplify: false,
				additionalFields: {},
			},
			{
				responses: [{ items: [{ id: 1 }, { id: 2 }], pageItemCount: 2 }],
			},
		);

		expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(JSON.parse(req.body as string)).toEqual({
			noteId: 500,
			pageNumber: 1,
			pageSize: 5,
		});
		expect(output[0].map((item) => item.json)).toEqual([{ id: 1 }, { id: 2 }]);
	});

	it('creates a note comment, defaulting entityId to noteId and omitting unset optional fields', async () => {
		const { output, httpRequestWithAuthentication } = await executeNotes(
			{
				resource: 'notes',
				operation: 'createComment',
				noteId: 777,
				noteComment: 'Called customer back',
				commentEntityType: 'note',
				additionalFields: {},
			},
			{
				responses: [{ id: 90, noteId: 777, text: 'Called customer back', createdAt: '2026-11-23T10:00:00Z' }],
			},
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(req.method).toBe('POST');
		expect(req.url).toBe('https://api.vh3connect.io/api:YdihQNr3/notes/comments/create');
		expect(JSON.parse(req.body as string)).toEqual({
			noteId: 777,
			noteComment: 'Called customer back',
			commentEntityType: 'note',
			entityId: 777,
		});
		expect(output[0][0].json).toMatchObject({ id: 90, noteId: 777 });
	});

	it('creates a note comment with explicit entityId, userIds array, mentions booleans, and reaction', async () => {
		const { httpRequestWithAuthentication } = await executeNotes(
			{
				resource: 'notes',
				operation: 'createComment',
				noteId: 777,
				noteComment: 'Defect logged',
				commentEntityType: 'assetDefect',
				additionalFields: {
					entityId: 888,
					userIds: '12, 34, 56',
					isMentions: true,
					isPreviousMentions: false,
					reaction: 'like',
				},
			},
			{ responses: [{ id: 91 }] },
		);

		const req = getAuthOpts(httpRequestWithAuthentication);
		expect(JSON.parse(req.body as string)).toEqual({
			noteId: 777,
			noteComment: 'Defect logged',
			commentEntityType: 'assetDefect',
			entityId: 888,
			userIds: [12, 34, 56],
			isMentions: true,
			isPreviousMentions: false,
			reaction: 'like',
		});
	});

	it('propagates 429 Limit Exceeded errors via NodeApiError', async () => {
		try {
			await executeNotes(
				{
					resource: 'notes',
					operation: 'listComments',
					noteId: 500,
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
			fail('Expected 429 error');
		} catch (err) {
			expect(err).toBeInstanceOf(NodeApiError);
			expect((err as NodeApiError).httpCode).toBe('429');
			expect((err as NodeApiError).message).toContain('Limit Exceeded');
		}
	});
});
