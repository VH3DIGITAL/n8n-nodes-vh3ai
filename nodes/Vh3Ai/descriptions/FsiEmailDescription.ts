import type { INodeProperties } from 'n8n-workflow';

export const fsiEmailOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['email'],
			},
		},
		options: [
			{
				name: 'Batch Classify Emails',
				value: 'batchClassifyEmail',
				action: 'Batch classify emails',
				description: 'Run up to 50 emails through the triage pipeline in a single call; portal/pre-filter hits are instant and only novel emails consume LLM tokens',
			},
			{
				name: 'Classify Email',
				value: 'classifyEmail',
				action: 'Classify an email',
				description: 'Classify an incoming email using the AI triage pipeline',
			},
			{
				name: 'Ingest Portal Email',
				value: 'ingestEmail',
				action: 'Ingest a portal email',
				description: 'Extract structured job data from an FM portal email via the /ingest/email/portal endpoint and resolve entities',
			},
			{
				name: 'List Triage Categories',
				value: 'listTriageCategories',
				action: 'List triage categories',
				description: 'Return the tenant\'s active triage categories with priority, destination, and prompt rules from the taxonomy database',
			},
			{
				name: 'List Triage Rules',
				value: 'listTaxonomyRules',
				action: 'List triage routing rules',
				description: 'Return the tenant\'s active email routing rules with full condition/action definitions; optionally filter by classification phase',
			},
		],
		default: 'classifyEmail',
	},
];

export const fsiEmailFields: INodeProperties[] = [
	// ══════════════════════════════════════════════════════════════════════
	// Batch Classify Emails — core fields
	// ══════════════════════════════════════════════════════════════════════
	{
		displayName: 'Emails',
		name: 'emails',
		type: 'json',
		required: true,
		default: '[]',
		description: 'Array of email objects to classify (max 50). Each object must include subject, email_body, and sender_address. Optional per-item fields: sender_name, timestamp, is_reply, is_forward, source_ref.',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['batchClassifyEmail'],
			},
		},
	},

	// ══════════════════════════════════════════════════════════════════════
	// Classify Email — core fields
	// ══════════════════════════════════════════════════════════════════════
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		default: '',
		description: 'The email subject line',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail'],
			},
		},
	},
	{
		displayName: 'Email Body',
		name: 'emailBody',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		description: 'The plain text body of the email',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail'],
			},
		},
	},
	{
		displayName: 'Sender Address',
		name: 'senderAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'The sender email address',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail'],
			},
		},
	},

	// ══════════════════════════════════════════════════════════════════════
	// Ingest Email — core fields
	// ══════════════════════════════════════════════════════════════════════
	{
		displayName: 'Email Text',
		name: 'emailText',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		description: 'The plain text body of the email',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['ingestEmail'],
			},
		},
	},
	{
		displayName: 'Email Subject',
		name: 'emailSubject',
		type: 'string',
		required: true,
		default: '',
		description: 'The email subject line',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['ingestEmail'],
			},
		},
	},
	{
		displayName: 'Email From',
		name: 'emailFrom',
		type: 'string',
		required: true,
		default: '',
		description: 'The sender email address or portal identifier',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['ingestEmail'],
			},
		},
	},
	{
		displayName: 'Source Email',
		name: 'sourceEmail',
		type: 'json',
		default: '{}',
		description:
			'Optional provider provenance object forwarded as sourceEmail. When set, include provider, mailboxLocator, and providerMessageId. Identifiers are sent unchanged. Leave empty to omit.',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['ingestEmail'],
			},
		},
	},

	// ══════════════════════════════════════════════════════════════════════
	// Shared attachment fields — both operations
	// ══════════════════════════════════════════════════════════════════════
	{
		displayName: 'Attachment Source',
		name: 'attachmentSource',
		type: 'options',
		default: 'none',
		description: 'How to provide an optional file attachment',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail', 'ingestEmail'],
			},
		},
		options: [
			{ name: 'None', value: 'none' },
			{ name: 'From URL', value: 'url' },
			{ name: 'From Binary Data', value: 'binary' },
		],
	},
	{
		displayName: 'File URL',
		name: 'attachmentUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'Public URL of the file to attach',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail', 'ingestEmail'],
				attachmentSource: ['url'],
			},
		},
	},
	{
		displayName: 'Filename',
		name: 'attachmentFilename',
		type: 'string',
		default: '',
		required: true,
		description: 'Name for the attached file (e.g. "report.pdf")',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail', 'ingestEmail'],
				attachmentSource: ['url'],
			},
		},
	},
	{
		displayName: 'MIME Type',
		name: 'attachmentMimeType',
		type: 'string',
		default: 'application/pdf',
		description: 'MIME type of the file (e.g. "application/pdf", "image/png")',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail', 'ingestEmail'],
				attachmentSource: ['url'],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'attachmentBinaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the file attachment',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail', 'ingestEmail'],
				attachmentSource: ['binary'],
			},
		},
	},

	// ══════════════════════════════════════════════════════════════════════
	// Classify Email — additional fields
	// ══════════════════════════════════════════════════════════════════════
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['classifyEmail'],
			},
		},
		options: [
			{
				displayName: 'Is Forward',
				name: 'isForward',
				type: 'boolean',
				default: false,
				description: 'Whether the email is a forward',
			},
			{
				displayName: 'Is Reply',
				name: 'isReply',
				type: 'boolean',
				default: false,
				description: 'Whether the email is a reply',
			},
			{
				displayName: 'Sender Name',
				name: 'senderName',
				type: 'string',
				default: '',
				description: 'The sender display name',
			},
			{
				displayName: 'Source Ref',
				name: 'sourceRef',
				type: 'string',
				default: '',
				description: 'Optional source reference identifier',
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'The email timestamp (ISO 8601)',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════════
	// Ingest Email — additional fields
	// ══════════════════════════════════════════════════════════════════════
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['ingestEmail'],
			},
		},
		options: [
			{
				displayName: 'Email Date',
				name: 'emailDate',
				type: 'dateTime',
				default: '',
				description: 'The email date (ISO 8601)',
			},
			{
				displayName: 'Email HTML',
				name: 'emailHtml',
				type: 'string',
				typeOptions: { rows: 6 },
				default: '',
				description: 'The HTML body of the email (optional, used for richer extraction)',
			},
			{
				displayName: 'Preferred Type IDs',
				name: 'preferredTypeIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of preferred job type IDs for extraction weighting (e.g. "12,34,56")',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════════
	// List Triage Rules — phase filter
	// ══════════════════════════════════════════════════════════════════════
	{
		displayName: 'Phase',
		name: 'phase',
		type: 'options',
		default: '',
		description: 'Filter rules by classification phase. Omit to return all rules.',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['listTaxonomyRules'],
			},
		},
		options: [
			{ name: 'All Phases', value: '' },
			{ name: 'Pre-Classify (Noise Filters)', value: 'pre_classify' },
			{ name: 'Post-Classify (Routing Decisions)', value: 'post_classify' },
		],
	},
];
