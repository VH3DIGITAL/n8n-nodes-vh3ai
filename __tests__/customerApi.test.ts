import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';

import { Vh3Ai } from '../nodes/Vh3Ai/Vh3Ai.node';

const CREDENTIALS = {
	apiKey: 'tenant-api-key',
	companyId: 'company-123',
	baseUrl: 'https://api.vh3connect.io',
	fsiBaseUrl: 'https://api.vh3connect.io/api:kP8T1CK7',
};

type ExecuteOptions = {
	httpResponse?: unknown;
	authResponse?: unknown;
	rejectHttp?: Error;
	rejectAuth?: Error;
	binary?: { fileName?: string; mimeType?: string };
	credentials?: Record<string, string>;
};

async function executeNode(parameters: Record<string, unknown>, options: ExecuteOptions = {}) {
	const httpRequest = options.rejectHttp
		? jest.fn().mockRejectedValue(options.rejectHttp)
		: jest.fn().mockResolvedValue(options.httpResponse ?? { ok: true });
	const httpRequestWithAuthentication = options.rejectAuth
		? jest.fn().mockRejectedValue(options.rejectAuth)
		: jest.fn().mockResolvedValue(options.authResponse ?? { id: 42 });
	const context = {
		getInputData: jest.fn().mockReturnValue([{ json: {} }]),
		getNodeParameter: jest.fn((name: string, _index: number, fallback?: unknown) =>
			Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : fallback,
		),
		getCredentials: jest.fn().mockResolvedValue(options.credentials ?? CREDENTIALS),
		getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
		continueOnFail: jest.fn().mockReturnValue(false),
		helpers: {
			httpRequest,
			httpRequestWithAuthentication,
			returnJsonArray: jest.fn((items: JsonObject[]) => items.map((json) => ({ json }))),
			constructExecutionMetaData: jest.fn((items: JsonObject[]) => items),
			assertBinaryData: jest.fn().mockReturnValue(
				options.binary ?? { fileName: 'manual.pdf', mimeType: 'application/pdf' },
			),
			getBinaryDataBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf-bytes')),
		},
	} as unknown as IExecuteFunctions;

	try {
		const output = await new Vh3Ai().execute.call(context);
		return { output, httpRequest, httpRequestWithAuthentication };
	} catch (error) {
		(error as Error & { httpRequest?: jest.Mock }).httpRequest = httpRequest;
		throw error;
	}
}

function authCall(mock: jest.Mock): IHttpRequestOptions {
	return mock.mock.calls[0][1] as IHttpRequestOptions;
}

function fsiCall(mock: jest.Mock): IHttpRequestOptions {
	return mock.mock.calls[0][0] as IHttpRequestOptions;
}

describe('plain BigChange job lookup', () => {
	it('requests the live job route and does not call the enrich path', async () => {
		const { output, httpRequest, httpRequestWithAuthentication } = await executeNode(
			{ resource: 'jobs', operation: 'getJob', jobId: 501, simplify: false, includeWorksheets: false },
			{ authResponse: { id: 501, reference: 'JOB-501' } },
		);

		expect(httpRequest).not.toHaveBeenCalled();
		const request = authCall(httpRequestWithAuthentication);
		expect(request.method).toBe('GET');
		expect(request.url).toMatch(/\/jobs\/job$/);
		expect(request.url).not.toContain('enrich');
		expect(request.qs).toEqual({ id: 501 });
		expect(request.qs).not.toHaveProperty('companyId');
		expect(request.qs).not.toHaveProperty('company_id');
		expect(output[0][0]?.json).toEqual({ id: 501, reference: 'JOB-501' });
	});

	it('sends compact and worksheets when Simplify and Include Worksheets are on', async () => {
		const { httpRequestWithAuthentication } = await executeNode({
			resource: 'jobs',
			operation: 'getJob',
			jobId: 501,
			simplify: true,
			includeWorksheets: true,
		});

		expect(authCall(httpRequestWithAuthentication).qs).toEqual({
			id: 501,
			compact: true,
			worksheets: true,
		});
	});

	it('keeps Get Job by ID on the same route', async () => {
		const { httpRequestWithAuthentication } = await executeNode({
			resource: 'jobs',
			operation: 'getJobById',
			jobId: 88,
			simplify: false,
			includeWorksheets: false,
		});

		const request = authCall(httpRequestWithAuthentication);
		expect(request.method).toBe('GET');
		expect(request.url).toMatch(/\/jobs\/job$/);
		expect(request.qs).toEqual({ id: 88 });
	});
});

describe('Get Enriched Job', () => {
	it('requests the enriched job with company credentials on the query', async () => {
		const { output, httpRequest } = await executeNode(
			{
				resource: 'jobFeed',
				operation: 'getEnrichedJob',
				jobId: 77,
				simplify: true,
				includeWorksheets: true,
			},
			{ httpResponse: { id: 77, reference: 'JOB-77', detail: 'note' } },
		);

		const request = fsiCall(httpRequest);
		expect(request.method).toBe('GET');
		expect(request.url).toBe(`${CREDENTIALS.fsiBaseUrl}/jobs/77`);
		expect(request.qs).toEqual({
			company_id: 'company-123',
			api_key: 'tenant-api-key',
			compact: true,
			include_worksheets: true,
		});
		expect(output[0][0]?.json).toEqual({ id: 77, reference: 'JOB-77', detail: 'note' });
	});

	it('requires a company id before calling the enriched job route', async () => {
		await expect(
			executeNode(
				{ resource: 'jobFeed', operation: 'getEnrichedJob', jobId: 1, simplify: false, includeWorksheets: false },
				{ credentials: { ...CREDENTIALS, companyId: '' } },
			),
		).rejects.toThrow(/Company ID is required/);
	});

	it('fails a detail-only body and returns a body that has a job identity', async () => {
		await expect(
			executeNode(
				{ resource: 'jobFeed', operation: 'getEnrichedJob', jobId: 1, simplify: false, includeWorksheets: false },
				{ httpResponse: { detail: 'Job not found' } },
			),
		).rejects.toThrow(/Job not found/);

		const { output } = await executeNode(
			{ resource: 'jobFeed', operation: 'getEnrichedJob', jobId: 1, simplify: false, includeWorksheets: false },
			{ httpResponse: { job_id: 9, detail: 'partial note' } },
		);
		expect(output[0][0]?.json).toEqual({ job_id: 9, detail: 'partial note' });
	});
});

describe('Connie Chat', () => {
	it('always posts to the stable chat route', async () => {
		const { httpRequest } = await executeNode({
			resource: 'connie',
			operation: 'connieChat',
			message: 'Hello',
			experimentalMode: true,
			additionalFields: {},
		});

		const request = fsiCall(httpRequest);
		expect(request.method).toBe('POST');
		expect(request.url).toBe(`${CREDENTIALS.fsiBaseUrl}/connie/chat`);
		expect(request.url).not.toContain('experimental');
		expect(JSON.parse(request.body as string)).toMatchObject({
			company_id: 'company-123',
			api_key: 'tenant-api-key',
			message: 'Hello',
		});
	});
});

describe('Knowledge', () => {
	it('omits an empty acting user and clamps the search limit', async () => {
		const { httpRequest } = await executeNode({
			resource: 'knowledge',
			operation: 'searchKnowledge',
			query: 'boiler',
			resultLimit: 99,
			options: {
				actingUserId: 0,
				sources: ['knowledge_document'],
				sections: 'systems_equipment, ',
			},
		});

		expect(JSON.parse(fsiCall(httpRequest).body as string)).toEqual({
			company_id: 'company-123',
			api_key: 'tenant-api-key',
			query: 'boiler',
			limit: 20,
			sources: ['knowledge_document'],
			sections: ['systems_equipment'],
		});
	});

	it('sends an acting user when one is set and clamps library search to 10', async () => {
		const { httpRequest } = await executeNode({
			resource: 'knowledge',
			operation: 'searchLibrary',
			query: 'manual',
			resultLimit: 0,
			options: {
				actingUserId: 15,
			},
		});

		const request = fsiCall(httpRequest);
		expect(request.url).toBe(`${CREDENTIALS.fsiBaseUrl}/knowledge/documents/search`);
		expect(JSON.parse(request.body as string)).toEqual({
			company_id: 'company-123',
			api_key: 'tenant-api-key',
			query: 'manual',
			acting_user_id: 15,
			limit: 1,
		});
	});

	it('rejects an empty knowledge query before calling the API', async () => {
		try {
			await executeNode({
				resource: 'knowledge',
				operation: 'searchKnowledge',
				query: '   ',
				resultLimit: 10,
				options: {},
			});
			throw new Error('expected an empty query to fail');
		} catch (error) {
			expect((error as Error).message).toMatch(/Query is required/);
			expect((error as Error & { httpRequest?: jest.Mock }).httpRequest).not.toHaveBeenCalled();
		}
	});

	it('uploads a PDF as native FormData with the owner and the file part', async () => {
		const { httpRequest } = await executeNode(
			{
				resource: 'knowledge',
				operation: 'uploadDocument',
				userId: 8,
				binaryPropertyName: 'data',
				options: { share: true },
			},
			{ httpResponse: { document_id: 'doc-1' } },
		);

		const request = fsiCall(httpRequest);
		expect(request.method).toBe('POST');
		expect(request.url).toBe(`${CREDENTIALS.fsiBaseUrl}/knowledge/documents/upload`);
		expect(request.headers).toBeUndefined();
		expect(request.body).toBeInstanceOf(FormData);
		const form = request.body as FormData;
		expect(form.get('company_id')).toBe('company-123');
		expect(form.get('api_key')).toBe('tenant-api-key');
		expect(form.get('user_id')).toBe('8');
		expect(form.get('share')).toBe('true');
		const filePart = form.get('file') as File;
		expect(filePart).toBeInstanceOf(Blob);
		expect(filePart.name).toBe('manual.pdf');
		expect(filePart.type).toBe('application/pdf');
		expect(Buffer.from(await filePart.arrayBuffer()).toString()).toBe('pdf-bytes');

		const serialized = new Response(form);
		expect(serialized.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);
		const rawMultipart = await serialized.text();
		expect(rawMultipart).toContain('name="file"; filename="manual.pdf"');
		expect(rawMultipart).toContain('Content-Type: application/pdf');
		expect(rawMultipart).toContain('pdf-bytes');
	});

	it('posts share and delete, and surfaces not found as an error', async () => {
		const shared = await executeNode(
			{
				resource: 'knowledge',
				operation: 'shareDocument',
				documentId: 'doc-1',
				userId: 8,
				share: false,
			},
			{ httpResponse: { document_id: 'doc-1', share: false } },
		);
		expect(fsiCall(shared.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/knowledge/documents/share`);
		expect(JSON.parse(fsiCall(shared.httpRequest).body as string)).toMatchObject({
			document_id: 'doc-1',
			user_id: 8,
			share: false,
		});

		const removed = await executeNode({
			resource: 'knowledge',
			operation: 'deleteDocument',
			documentId: 'doc-1',
			userId: 8,
		});
		expect(fsiCall(removed.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/knowledge/documents/delete`);

		await expect(
			executeNode(
				{
					resource: 'knowledge',
					operation: 'deleteDocument',
					documentId: 'missing',
					userId: 8,
				},
				{ rejectHttp: new Error('Not found') },
			),
		).rejects.toThrow(/POST \/knowledge\/documents\/delete/);
	});
});

describe('the other customer operations', () => {
	it('lists, gets, confirms, and rejects pending email extractions', async () => {
		const listed = await executeNode({ resource: 'email', operation: 'listPendingExtractions' });
		expect(fsiCall(listed.httpRequest).method).toBe('GET');
		expect(fsiCall(listed.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/ingest/email/pending`);

		const one = await executeNode({
			resource: 'email',
			operation: 'getPendingExtraction',
			extractionId: 'ext-1',
		});
		expect(fsiCall(one.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/ingest/email/pending/ext-1`);

		const confirmed = await executeNode({
			resource: 'email',
			operation: 'confirmPendingExtraction',
			extractionId: 'ext-1',
			additionalFields: { contactId: '44' },
		});
		expect(fsiCall(confirmed.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/ingest/email/confirm`);
		expect(JSON.parse(fsiCall(confirmed.httpRequest).body as string)).toMatchObject({
			extraction_id: 'ext-1',
			contact_id: '44',
			company_id: 'company-123',
			api_key: 'tenant-api-key',
		});

		const rejected = await executeNode({
			resource: 'email',
			operation: 'rejectPendingExtraction',
			extractionId: 'ext-1',
			additionalFields: { reason: 'Duplicate' },
		});
		expect(fsiCall(rejected.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/ingest/email/reject`);
		expect(JSON.parse(fsiCall(rejected.httpRequest).body as string)).toMatchObject({
			extraction_id: 'ext-1',
			reason: 'Duplicate',
		});
	});

	it('patches a quote document header and creates a revision', async () => {
		const patched = await executeNode({
			resource: 'quoteDocuments',
			operation: 'patchQuoteDocumentHeader',
			documentId: 'doc-1',
			expectedDraftRevision: 3,
			initiatedByUserId: 9,
			additionalFields: { title: 'Revised title' },
		});
		expect(fsiCall(patched.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/quoting/documents/patch_head`);
		expect(JSON.parse(fsiCall(patched.httpRequest).body as string)).toMatchObject({
			document_id: 'doc-1',
			expected_draft_revision: 3,
			initiated_by_user_id: 9,
			title: 'Revised title',
			company_id: 'company-123',
			api_key: 'tenant-api-key',
		});

		const revision = await executeNode({
			resource: 'quoteDocuments',
			operation: 'createQuoteRevision',
			documentId: 'doc-1',
			revisionVersion: 2,
			revisionStatus: 'issued',
			lines: '[{"sku":"part"}]',
			additionalFields: {},
		});
		expect(fsiCall(revision.httpRequest).url).toBe(`${CREDENTIALS.fsiBaseUrl}/quoting/revisions/create`);
		expect(JSON.parse(fsiCall(revision.httpRequest).body as string)).toMatchObject({
			document_id: 'doc-1',
			version: 2,
			status: 'issued',
			lines: [{ sku: 'part' }],
		});
	});

	it('gets and deletes job stock with the API key header', async () => {
		const got = await executeNode({
			resource: 'jobs',
			operation: 'getJobStock',
			jobId: 10,
			jobStockId: 20,
			simplify: false,
		});
		const getRequest = authCall(got.httpRequestWithAuthentication);
		expect(getRequest.method).toBe('POST');
		expect(getRequest.url).toMatch(/\/jobs\/stock\/get$/);
		expect(JSON.parse(getRequest.body as string)).toEqual({ jobId: 10, jobStockId: 20 });

		const removed = await executeNode({
			resource: 'jobs',
			operation: 'deleteJobStock',
			jobId: 10,
			jobStockId: 20,
		});
		expect(authCall(removed.httpRequestWithAuthentication).url).toMatch(/\/jobs\/stock\/delete$/);
	});

	it('sets consent, lists and updates site access hours, and creates an invoice document', async () => {
		const consent = await executeNode({
			resource: 'persons',
			operation: 'setPersonConsent',
			personId: 'person-1',
			consentStatus: 'granted',
			consentMedium: 'email',
			additionalFields: { comment: '  Confirmed by email  ' },
		});
		expect(authCall(consent.httpRequestWithAuthentication).url).toMatch(/\/persons\/consent\/set$/);
		expect(JSON.parse(authCall(consent.httpRequestWithAuthentication).body as string)).toEqual({
			personId: 'person-1',
			status: 'granted',
			medium: 'email',
			comment: 'Confirmed by email',
		});

		const consentWithoutComment = await executeNode({
			resource: 'persons',
			operation: 'setPersonConsent',
			personId: 'person-1',
			consentStatus: 'granted',
			consentMedium: 'email',
			additionalFields: { comment: '   ' },
		});
		expect(JSON.parse(authCall(consentWithoutComment.httpRequestWithAuthentication).body as string)).toEqual({
			personId: 'person-1',
			status: 'granted',
			medium: 'email',
		});

		const hours = await executeNode({
			resource: 'contacts',
			operation: 'listSiteAccessHours',
			contactId: 55,
			returnAll: false,
			limit: 25,
		});
		expect(authCall(hours.httpRequestWithAuthentication).url).toMatch(/\/contacts\/site_access_hours_list$/);
		expect(JSON.parse(authCall(hours.httpRequestWithAuthentication).body as string)).toEqual({
			contactId: 55,
			pageNumber: 1,
			pageSize: 25,
		});

		const allHours = await executeNode(
			{
				resource: 'contacts',
				operation: 'listSiteAccessHours',
				contactId: 55,
				returnAll: true,
			},
			{
				authResponse: {
					items: [{ dayOfWeek: 'monday', start: '09:00', stop: '17:00' }],
					pageItemCount: 1,
				},
			},
		);
		expect(JSON.parse(authCall(allHours.httpRequestWithAuthentication).body as string)).toEqual({
			contactId: 55,
			pageNumber: 1,
			pageSize: 100,
		});
		expect(allHours.output[0][0]?.json).toEqual({
			dayOfWeek: 'monday',
			start: '09:00',
			stop: '17:00',
		});

		const updated = await executeNode({
			resource: 'contacts',
			operation: 'updateSiteAccessHours',
			contactId: 55,
			accessHours: '[{"dayOfWeek":"monday","start":"09:00","stop":"17:00"}]',
		});
		expect(JSON.parse(authCall(updated.httpRequestWithAuthentication).body as string)).toEqual({
			contactId: 55,
			accessHours: [{ dayOfWeek: 'monday', start: '09:00', stop: '17:00' }],
		});

		const invoice = await executeNode({
			resource: 'invoices',
			operation: 'createInvoiceDocument',
			invoiceId: 77,
		});
		expect(authCall(invoice.httpRequestWithAuthentication).url).toMatch(/\/invoices\/document\/create$/);
		expect(JSON.parse(authCall(invoice.httpRequestWithAuthentication).body as string)).toEqual({
			invoiceId: 77,
		});
	});
});
