import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeProperties,
	JsonObject,
	JsonValue,
} from 'n8n-workflow';

import { Vh3Ai } from '../nodes/Vh3Ai/Vh3Ai.node';
import {
	buildPortalIngestBody,
	normalizeSourceEmail,
	portalIngestNodeOutput,
	SourceEmailValidationError,
} from '../nodes/Vh3Ai/emailIngest';
import { fsiEmailFields, fsiEmailOperations } from '../nodes/Vh3Ai/descriptions/FsiEmailDescription';

const GRAPH_SOURCE_EMAIL = {
	provider: 'microsoft_graph',
	mailboxLocator: 'portal-capture@example.com',
	providerMessageId: 'AAMkAGI2TG93AAA=',
	providerMessageIdFormat: 'restImmutableEntryId',
	providerThreadId: 'AAQkAGI2Conversation',
	internetMessageId: '<CA+graph-msg-001@example.com>',
	providerConversationIndex: 'AQHSuB8X',
	webUrl: 'https://outlook.office.com/mail/inbox/id/AAMkAGI2TG93AAA%3D',
} as const;

const GMAIL_PARTIAL_SOURCE_EMAIL = {
	provider: 'gmail',
	mailboxLocator: 'portal-capture@example.com',
	providerMessageId: '18f2c9a0b1d3e4f5',
} as const;

const BASE_INPUT = {
	emailText: 'Please attend site A tomorrow',
	emailSubject: 'Job order 1001',
	emailFrom: 'portal@example.com',
	attachments: [] as JsonValue,
	additionalFields: {} as JsonObject,
};

async function executeIngest(operation: string, response: JsonObject) {
	const parameters: Record<string, unknown> = {
		resource: 'email',
		operation,
		attachmentSource: 'none',
		emailText: BASE_INPUT.emailText,
		emailSubject: BASE_INPUT.emailSubject,
		emailFrom: BASE_INPUT.emailFrom,
		additionalFields: BASE_INPUT.additionalFields,
		sourceEmail: GRAPH_SOURCE_EMAIL,
	};
	const httpRequest = jest.fn().mockResolvedValue(response);
	const context = {
		getInputData: jest.fn().mockReturnValue([{ json: {} }]),
		getNodeParameter: jest.fn((name: string) => parameters[name]),
		getCredentials: jest.fn().mockResolvedValue({
			apiKey: 'tenant-api-key',
			companyId: 'company-123',
			fsiBaseUrl: 'https://api.vh3connect.io/api:kP8T1CK7',
		}),
		getNode: jest.fn().mockReturnValue({ name: 'VH3 AI' }),
		continueOnFail: jest.fn().mockReturnValue(false),
		helpers: {
			httpRequest,
			returnJsonArray: jest.fn((items: JsonObject[]) =>
				items.map((json) => ({ json })),
			),
			constructExecutionMetaData: jest.fn((items) => items),
		},
	} as unknown as IExecuteFunctions;

	const output = await new Vh3Ai().execute.call(context);
	const request = httpRequest.mock.calls[0]?.[0] as IHttpRequestOptions | undefined;

	return { output, request };
}

function findIngestField(
	fieldName: string,
	operation = 'ingestEmail',
): INodeProperties | undefined {
	return fsiEmailFields.find((field) => {
		const operations = field.displayOptions?.show?.operation;
		return (
			field.name === fieldName &&
			Array.isArray(operations) &&
			operations.includes(operation)
		);
	});
}

function findOperation(value: string) {
	const operation = fsiEmailOperations[0]?.options?.find(
		(option) => 'value' in option && option.value === value,
	);
	if (!operation || !('description' in operation)) {
		throw new Error(`Missing Email operation ${value}`);
	}
	return operation;
}

describe('ingestEmail operation', () => {
	it('keeps ingestEmail and still documents portal ingest', () => {
		const operation = findOperation('ingestEmail');
		expect('value' in operation && operation.value).toBe('ingestEmail');
		expect(operation.description).toMatch(/\/ingest\/email\/portal/);
	});

	it('adds general email ingest with the same input fields as portal ingest', () => {
		const operation = findOperation('ingestGeneralEmail');
		expect('value' in operation && operation.value).toBe('ingestGeneralEmail');
		expect(operation.description).toMatch(/\/ingest\/email\/triage/);

		const portalFields = fsiEmailFields
			.filter((field) => field.displayOptions?.show?.operation?.includes('ingestEmail'))
			.map((field) => field.name);
		const generalFields = fsiEmailFields
			.filter((field) => field.displayOptions?.show?.operation?.includes('ingestGeneralEmail'))
			.map((field) => field.name);

		expect(generalFields).toEqual(portalFields);
	});

	it('exposes optional sourceEmail JSON without changing required envelope fields', () => {
		const sourceEmail = findIngestField('sourceEmail');
		expect(sourceEmail).toBeDefined();
		expect(sourceEmail?.type).toBe('json');
		expect(sourceEmail?.required).not.toBe(true);
		expect(sourceEmail?.default).toBe('{}');

		expect(findIngestField('emailText')?.required).toBe(true);
		expect(findIngestField('emailSubject')?.required).toBe(true);
		expect(findIngestField('emailFrom')?.required).toBe(true);
	});
});

describe('normalizeSourceEmail', () => {
	it('omits empty values so the request matches 0.11.3', () => {
		expect(normalizeSourceEmail(undefined)).toBeUndefined();
		expect(normalizeSourceEmail(null)).toBeUndefined();
		expect(normalizeSourceEmail('')).toBeUndefined();
		expect(normalizeSourceEmail('   ')).toBeUndefined();
		expect(normalizeSourceEmail('{}')).toBeUndefined();
		expect(normalizeSourceEmail({})).toBeUndefined();
	});

	it('preserves identifier strings exactly', () => {
		const raw = {
			provider: 'microsoft_graph',
			mailboxLocator: 'Portal-Capture@example.com',
			providerMessageId: 'AAMkAGI2TG93AAA=',
			internetMessageId: '<CA+graph-msg-001@example.com>',
		};
		expect(normalizeSourceEmail(raw)).toEqual(raw);
		expect(normalizeSourceEmail(JSON.stringify(raw))).toEqual(raw);
	});

	it('rejects invalid JSON and non-objects', () => {
		expect(() => normalizeSourceEmail('{')).toThrow(SourceEmailValidationError);
		expect(() => normalizeSourceEmail([])).toThrow(SourceEmailValidationError);
		expect(() => normalizeSourceEmail('[]')).toThrow(SourceEmailValidationError);
	});
});

describe('buildPortalIngestBody', () => {
	it('sends a full Microsoft Graph sourceEmail unchanged', () => {
		const body = buildPortalIngestBody({
			...BASE_INPUT,
			sourceEmail: GRAPH_SOURCE_EMAIL,
		});

		expect(body).toEqual({
			email_text: 'Please attend site A tomorrow',
			email_subject: 'Job order 1001',
			email_from: 'portal@example.com',
			attachments: [],
			preferred_type_ids: [],
			sourceEmail: GRAPH_SOURCE_EMAIL,
		});
		expect(body).not.toHaveProperty('company_id');
		expect(body).not.toHaveProperty('api_key');
		expect(body.sourceEmail).toEqual(GRAPH_SOURCE_EMAIL);
	});

	it('sends a partial Gmail sourceEmail unchanged', () => {
		const body = buildPortalIngestBody({
			...BASE_INPUT,
			additionalFields: {
				emailHtml: '<p>Job</p>',
				emailDate: '2026-08-29T09:00:00Z',
				preferredTypeIds: '12,34',
			},
			sourceEmail: GMAIL_PARTIAL_SOURCE_EMAIL,
		});

		expect(body).toEqual({
			email_text: 'Please attend site A tomorrow',
			email_subject: 'Job order 1001',
			email_from: 'portal@example.com',
			email_html: '<p>Job</p>',
			email_date: '2026-08-29T09:00:00Z',
			attachments: [],
			preferred_type_ids: [12, 34],
			sourceEmail: GMAIL_PARTIAL_SOURCE_EMAIL,
		});
		expect(Object.keys(body.sourceEmail as JsonObject)).toEqual([
			'provider',
			'mailboxLocator',
			'providerMessageId',
		]);
	});

	it('omits sourceEmail when the object is absent', () => {
		const body = buildPortalIngestBody({
			...BASE_INPUT,
			sourceEmail: '{}',
		});

		expect(body).toEqual({
			email_text: 'Please attend site A tomorrow',
			email_subject: 'Job order 1001',
			email_from: 'portal@example.com',
			attachments: [],
			preferred_type_ids: [],
		});
		expect(body).not.toHaveProperty('sourceEmail');
		expect(body).not.toHaveProperty('company_id');
		expect(body).not.toHaveProperty('api_key');
	});

	it('does not place sourceEmail identifiers on preferred_type_ids or email_text', () => {
		const body = buildPortalIngestBody({
			...BASE_INPUT,
			additionalFields: { preferredTypeIds: '99' },
			sourceEmail: GRAPH_SOURCE_EMAIL,
		});

		expect(body.preferred_type_ids).toEqual([99]);
		expect(body.email_text).toBe('Please attend site A tomorrow');
		expect(JSON.stringify(body.preferred_type_ids)).not.toContain('AAMkAGI2TG93AAA=');
		expect(body.email_text).not.toContain('AAMkAGI2TG93AAA=');
	});
});

describe('portalIngestNodeOutput', () => {
	it('echoes a full Microsoft Graph sourceEmail from the FSI response', () => {
		const raw: JsonObject = {
			status: 'Create',
			jobPreview: { title: 'Job order 1001' },
			reviewFlags: [],
			contactCreatePreview: null,
			caseId: 42,
			surface: 'portal',
			sourceEmail: GRAPH_SOURCE_EMAIL,
		};

		const output = portalIngestNodeOutput(raw);

		expect(output).toBe(raw);
		expect(output.sourceEmail).toBe(raw.sourceEmail);
		expect(output.sourceEmail).toEqual(GRAPH_SOURCE_EMAIL);
		expect(output.status).toBe('Create');
		expect(output.jobPreview).toEqual({ title: 'Job order 1001' });
		expect(output.reviewFlags).toEqual([]);
		expect(output.contactCreatePreview).toBeNull();
		expect(output.caseId).toBe(42);
		expect(output.surface).toBe('portal');
	});

	it('echoes a partial Gmail sourceEmail from the FSI response', () => {
		const raw: JsonObject = {
			status: 'Review',
			jobPreview: null,
			reviewFlags: ['missing_site'],
			contactCreatePreview: { name: 'Example' },
			caseId: null,
			surface: 'portal',
			sourceEmail: GMAIL_PARTIAL_SOURCE_EMAIL,
		};

		const output = portalIngestNodeOutput(raw);

		expect(output.sourceEmail).toBe(raw.sourceEmail);
		expect(output.sourceEmail).toEqual(GMAIL_PARTIAL_SOURCE_EMAIL);
		expect(output.status).toBe('Review');
	});

	it('echoes sourceEmail null when the object was omitted', () => {
		const raw: JsonObject = {
			status: 'Create',
			jobPreview: { title: 'Job order 1001' },
			reviewFlags: [],
			contactCreatePreview: null,
			caseId: 7,
			surface: 'portal',
			sourceEmail: null,
		};

		const output = portalIngestNodeOutput(raw);

		expect(output).toBe(raw);
		expect(output.sourceEmail).toBeNull();
		expect(output.status).toBe('Create');
		expect(output.jobPreview).toEqual({ title: 'Job order 1001' });
		expect(output.reviewFlags).toEqual([]);
		expect(output.contactCreatePreview).toBeNull();
		expect(output.caseId).toBe(7);
		expect(output.surface).toBe('portal');
	});
});

describe('email ingest routing', () => {
	it('calls portal ingest and returns its response unchanged', async () => {
		const raw: JsonObject = {
			surface: 'portal',
			sourceEmail: GRAPH_SOURCE_EMAIL,
			extraction: {
				location_detail_source: 'email_body',
			},
		};

		const { output, request } = await executeIngest('ingestEmail', raw);

		expect(request?.url).toBe(
			'https://api.vh3connect.io/api:kP8T1CK7/ingest/email/portal',
		);
		expect(JSON.parse(request?.body as string)).toEqual({
			company_id: 'company-123',
			api_key: 'tenant-api-key',
			email_text: BASE_INPUT.emailText,
			email_subject: BASE_INPUT.emailSubject,
			email_from: BASE_INPUT.emailFrom,
			attachments: [],
			preferred_type_ids: [],
			sourceEmail: GRAPH_SOURCE_EMAIL,
		});
		expect(output[0][0]?.json).toBe(raw);
		expect(output[0][0]?.json.surface).toBe('portal');
		expect(output[0][0]?.json.sourceEmail).toBe(GRAPH_SOURCE_EMAIL);
		expect(
			(output[0][0]?.json.extraction as JsonObject).location_detail_source,
		).toBe('email_body');
	});

	it('calls general triage ingest and returns its response unchanged', async () => {
		const raw: JsonObject = {
			surface: 'triage',
			sourceEmail: GRAPH_SOURCE_EMAIL,
			extraction: {
				location_detail_source: 'subject',
			},
		};

		const { output, request } = await executeIngest('ingestGeneralEmail', raw);

		expect(request?.url).toBe(
			'https://api.vh3connect.io/api:kP8T1CK7/ingest/email/triage',
		);
		expect(JSON.parse(request?.body as string)).toEqual({
			company_id: 'company-123',
			api_key: 'tenant-api-key',
			email_text: BASE_INPUT.emailText,
			email_subject: BASE_INPUT.emailSubject,
			email_from: BASE_INPUT.emailFrom,
			attachments: [],
			preferred_type_ids: [],
			sourceEmail: GRAPH_SOURCE_EMAIL,
		});
		expect(output[0][0]?.json).toBe(raw);
		expect(output[0][0]?.json.surface).toBe('triage');
		expect(output[0][0]?.json.sourceEmail).toBe(GRAPH_SOURCE_EMAIL);
		expect(
			(output[0][0]?.json.extraction as JsonObject).location_detail_source,
		).toBe('subject');
	});
});
