import type { INodeProperties } from 'n8n-workflow';

const documentTypeOptions = [
	{ name: 'Ad Hoc', value: 'ad_hoc' },
	{ name: 'Follow On', value: 'follow_on' },
	{ name: 'Site Survey', value: 'site_survey' },
];

export const fsiQuoteDocumentsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['quoteDocuments'] } },
		options: [
			{
				name: 'Create Document',
				value: 'createQuoteDocument',
				action: 'Create a quote document',
				description: 'Persist a VH3-owned Quote Document after a Quote Run',
			},
			{
				name: 'Get Document',
				value: 'getQuoteDocument',
				action: 'Get a quote document',
				description: 'Get one VH3-owned Quote Document by ID',
			},
			{
				name: 'Get Many Parts',
				value: 'getManyParts',
				action: 'Get catalog parts by ID',
				description: 'Hydrate Parts Catalog rows by catalog ID for quote-time pricing',
			},
			{
				name: 'Get Revision',
				value: 'getQuoteRevision',
				action: 'Get a quote revision',
				description: 'Get one immutable Quote Document revision',
			},
			{
				name: 'List Documents',
				value: 'listQuoteDocuments',
				action: 'List quote documents',
				description: 'List VH3-owned Quote Documents, optionally filtered by job reference or status',
			},
			{
				name: 'List Parts Catalog',
				value: 'listPartsCatalog',
				action: 'List parts catalog',
				description: 'Page Parts Catalog rows for the tenant, optionally filtered by vendor',
			},
			{
				name: 'List Rate Cards',
				value: 'listRateCards',
				action: 'List rate cards',
				description: 'List Quote Run rate cards, optionally filtered by contact',
			},
			{
				name: 'List Rate Defaults',
				value: 'listRateDefaults',
				action: 'List rate defaults',
				description: 'List quoting rate-default pointers for the tenant',
			},
			{
				name: 'List Revisions',
				value: 'listQuoteRevisions',
				action: 'List quote revisions',
				description: 'List immutable revisions for one Quote Document',
			},
			{
				name: 'Update Commercial',
				value: 'updateQuoteCommercial',
				action: 'Update quote commercial content',
				description: 'Patch structured SALMA commercial sections onto an existing Quote Document',
			},
			{
				name: 'Update Lifecycle',
				value: 'updateQuoteLifecycle',
				action: 'Update quote lifecycle',
				description: 'Patch Quote Document version, status, or accepted revision pointer',
			},
			{
				name: 'Update Revision Status',
				value: 'updateQuoteRevisionStatus',
				action: 'Update a revision status',
				description: 'Update a Quote Document revision status (for example superseded or accepted)',
			},
		],
		default: 'listQuoteDocuments',
	},
];

export const fsiQuoteDocumentsFields: INodeProperties[] = [
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		default: '',
		description: 'Quote Document UUID',
		displayOptions: {
			show: {
				resource: ['quoteDocuments'],
				operation: [
					'getQuoteDocument',
					'updateQuoteCommercial',
					'updateQuoteLifecycle',
					'listQuoteRevisions',
				],
			},
		},
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['listQuoteDocuments'] } },
		options: [
			{ displayName: 'Job Reference', name: 'jobRef', type: 'string', default: '', description: 'Optional job reference filter' },
			{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number (1-based)' },
			{ displayName: 'Per Page', name: 'perPage', type: 'number', default: 25, description: 'Items per page (max 100)' },
			{ displayName: 'Status', name: 'status', type: 'string', default: '', description: 'Optional document lifecycle status filter' },
		],
	},

	{
		displayName: 'Run ID',
		name: 'runId',
		type: 'string',
		required: true,
		default: '',
		description: 'FSI Quote Run UUID',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['createQuoteDocument'] } },
	},
	{
		displayName: 'Document Type',
		name: 'documentType',
		type: 'options',
		required: true,
		options: documentTypeOptions,
		default: 'follow_on',
		description: 'Quote Document type',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['createQuoteDocument'] } },
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'string',
		required: true,
		default: 'draft',
		description: 'Quote Document lifecycle status',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['createQuoteDocument'] } },
	},
	{
		displayName: 'Lines (JSON)',
		name: 'lines',
		type: 'json',
		required: true,
		default: '[]',
		description: 'Typed Quote Line Shape array',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['createQuoteDocument'] } },
	},
	{
		displayName: 'Provenance (JSON)',
		name: 'provenance',
		type: 'json',
		required: true,
		default: '{}',
		description: 'Source and trigger audit metadata',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['createQuoteDocument'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['createQuoteDocument'] } },
		options: [
			{ displayName: 'Currency', name: 'currency', type: 'string', default: 'GBP', description: 'ISO 4217 currency code' },
			{ displayName: 'Customer Reference', name: 'customerRef', type: 'string', default: '', description: 'Source-system customer reference' },
			{ displayName: 'Document Group ID', name: 'documentGroupId', type: 'string', default: '', description: 'VH3 revision family ID; defaults to document ID when omitted' },
			{ displayName: 'Job Group ID', name: 'jobGroupId', type: 'string', default: '', description: 'FMS Job Group ID' },
			{ displayName: 'Job Reference', name: 'jobRef', type: 'string', default: '', description: 'Source-system job reference' },
			{ displayName: 'Last Run ID', name: 'lastRunId', type: 'string', default: '', description: 'Most recent Quote Run that updated the head' },
			{ displayName: 'NTE Amount', name: 'nteAmount', type: 'number', default: 0, description: 'Authorised not-to-exceed spend limit' },
			{ displayName: 'Origin Resource Email', name: 'originResourceEmail', type: 'string', default: '', description: 'Originating engineer email' },
			{ displayName: 'Origin Resource ID', name: 'originResourceId', type: 'string', default: '', description: 'BigChange Resource ID of the originating engineer' },
			{ displayName: 'Origin Resource Name', name: 'originResourceName', type: 'string', default: '', description: 'Originating engineer display name' },
			{ displayName: 'Site Reference', name: 'siteRef', type: 'string', default: '', description: 'Source-system site reference' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Human-readable title' },
			{ displayName: 'Valid Until', name: 'validUntil', type: 'dateTime', default: '', description: 'Optional validity deadline' },
			{ displayName: 'VAT Percentage', name: 'vatPercentage', type: 'number', default: 20, description: 'VAT percentage' },
			{ displayName: 'Version', name: 'version', type: 'number', default: 0, description: 'Head working/issued version; 0 means unissued draft' },
		],
	},

	{
		displayName: 'Commercial Content (JSON)',
		name: 'commercialContent',
		type: 'json',
		required: true,
		default: '{}',
		description: 'Structured commercial sections (QuotationDraft shape), not HTML',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['updateQuoteCommercial'] } },
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['updateQuoteLifecycle'] } },
		options: [
			{ displayName: 'Accepted Version ID', name: 'acceptedVersionId', type: 'string', default: '', description: 'Accepted revision UUID' },
			{ displayName: 'Status', name: 'status', type: 'string', default: '', description: 'Updated lifecycle status' },
			{ displayName: 'Version', name: 'version', type: 'number', default: 0, description: 'Updated head version' },
		],
	},

	{
		displayName: 'Revision ID',
		name: 'revisionId',
		type: 'string',
		required: true,
		default: '',
		description: 'Quote Document revision UUID',
		displayOptions: {
			show: {
				resource: ['quoteDocuments'],
				operation: ['getQuoteRevision', 'updateQuoteRevisionStatus'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'revisionStatus',
		type: 'string',
		required: true,
		default: '',
		description: 'Updated revision status (for example superseded or accepted)',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['updateQuoteRevisionStatus'] } },
	},

	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		default: 0,
		description: 'Optional BigChange contact/account filter. Leave 0 to return all rate cards.',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['listRateCards'] } },
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['listPartsCatalog'] } },
		options: [
			{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number' },
			{ displayName: 'Per Page', name: 'perPage', type: 'number', default: 100, description: 'Items per page' },
			{ displayName: 'Vendor', name: 'vendor', type: 'string', default: '', description: 'Optional vendor filter' },
		],
	},

	{
		displayName: 'Catalog IDs',
		name: 'catalogIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated Parts Catalog UUIDs to hydrate',
		displayOptions: { show: { resource: ['quoteDocuments'], operation: ['getManyParts'] } },
	},
];
