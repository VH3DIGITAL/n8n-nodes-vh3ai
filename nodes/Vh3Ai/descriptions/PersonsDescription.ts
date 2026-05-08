import type { INodeProperties } from 'n8n-workflow';

export const personsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['persons'],
			},
		},
		options: [
			{
				name: 'Create Person',
				value: 'createPerson',
				action: 'Create a person',
				description: 'Create an individual contact at a customer/site (e.g. site manager, decision maker). Requires contactId (the parent customer/site), forename, surname. Optional title, email, mobile, landline, position, department, isOptedOut.',
			},
			{
				name: 'Edit Person',
				value: 'editPerson',
				action: 'Edit a person',
				description: 'Update an existing person. forename and surname must be re-supplied. Use to update contact details, role, marketing opt-out status.',
			},
			{
				name: 'Get Person',
				value: 'getPerson',
				action: 'Get a person',
				description: 'Get one person by their UUID (string) — name, role, contact details, parent contact, opt-out status.',
			},
			{
				name: 'List Consent History',
				value: 'listConsentHistory',
				action: 'List consent history',
				description: 'Audit trail of marketing-consent changes for a specific person (GDPR/CASL compliance). Requires personId (UUID).',
			},
			{
				name: 'List Persons',
				value: 'listPersons',
				action: 'List or search persons',
				description: 'List individual people. Filter by contactId(s) (find people at a customer/site), surname (starts-with), or email. Use to find the right person to contact at a customer.',
			},
		],
		default: 'listPersons',
	},
];

export const personsFields: INodeProperties[] = [
	// ── List Persons fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listPersons'],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 1000 },
		default: 100,
		description: 'Number of results per page',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listPersons'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page to retrieve (1-based)',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listPersons'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listPersons'],
			},
		},
		options: [
			{
				displayName: 'Contact IDs',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter by contact IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'ascending' },
					{ name: 'Descending', value: 'descending' },
				],
				default: 'descending',
				description: 'Sort direction',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Filter by email address',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Surname', value: 'surname' },
				],
				default: 'surname',
				description: 'Field to sort results by',
			},
			{
				displayName: 'Surname',
				name: 'surname',
				type: 'string',
				default: '',
				description: 'Filter by surname',
			},
		],
	},

	// ── Get Person fields ──
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the person to retrieve',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['getPerson'],
			},
		},
	},

	// ── Create Person fields ──
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The contact (site) this person belongs to',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'Forename',
		name: 'forename',
		type: 'string',
		required: true,
		default: '',
		description: 'First name of the person',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'Surname',
		name: 'surname',
		type: 'string',
		required: true,
		default: '',
		description: 'Last name of the person',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['createPerson'],
			},
		},
		options: [
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department the person works in',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address',
			},
			{
				displayName: 'Is Opted Out',
				name: 'isOptedOut',
				type: 'boolean',
				default: false,
				description: 'Whether the person has opted out of communications',
			},
			{
				displayName: 'Landline',
				name: 'landline',
				type: 'string',
				default: '',
				description: 'Landline phone number',
			},
			{
				displayName: 'Mobile',
				name: 'mobile',
				type: 'string',
				default: '',
				description: 'Mobile phone number',
			},
			{
				displayName: 'Position',
				name: 'position',
				type: 'string',
				default: '',
				description: 'Job title or position',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title (e.g. Mr, Mrs, Dr)',
			},
		],
	},

	// ── Edit Person fields ──
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the person to edit (e.g. f001060a-1bdf-4458-be7b-868e1f23ee51)',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['editPerson'],
			},
		},
	},
	{
		displayName: 'Forename',
		name: 'forename',
		type: 'string',
		required: true,
		default: '',
		description: 'First name of the person',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['editPerson'],
			},
		},
	},
	{
		displayName: 'Surname',
		name: 'surname',
		type: 'string',
		required: true,
		default: '',
		description: 'Last name of the person',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['editPerson'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['editPerson'],
			},
		},
		options: [
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department the person works in',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address',
			},
			{
				displayName: 'Is Opted Out',
				name: 'isOptedOut',
				type: 'boolean',
				default: false,
				description: 'Whether the person has opted out of communications',
			},
			{
				displayName: 'Landline',
				name: 'landline',
				type: 'string',
				default: '',
				description: 'Landline phone number',
			},
			{
				displayName: 'Mobile',
				name: 'mobile',
				type: 'string',
				default: '',
				description: 'Mobile phone number',
			},
			{
				displayName: 'Position',
				name: 'position',
				type: 'string',
				default: '',
				description: 'Job title or position',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title (e.g. Mr, Mrs, Dr)',
			},
		],
	},
	// ── List Consent History fields ──
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the person whose consent history to retrieve',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listConsentHistory'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listConsentHistory'],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 1000 },
		default: 100,
		description: 'Number of results per page',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listConsentHistory'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page to retrieve (1-based)',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listConsentHistory'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listConsentHistory'],
			},
		},
		options: [
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'ascending' },
					{ name: 'Descending', value: 'descending' },
				],
				default: 'descending',
				description: 'Sort direction',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
				],
				default: 'createdAt',
				description: 'Field to sort results by',
			},
		],
	},
	// ── Simplify (compact response) toggle ──
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description: 'Whether to return a simplified (compact) version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['persons'],
				operation: ['listPersons', 'getPerson', 'listConsentHistory'],
			},
		},
	},
];
