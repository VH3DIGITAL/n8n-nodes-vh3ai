import type { INodeProperties } from 'n8n-workflow';

export const fsiContactFeedOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contactFeed'] } },
		options: [
			{
				name: 'Get Enriched Contact',
				value: 'getEnrichedContact',
				action: 'Get an enriched contact',
				description: 'Get a single contact with an operational snapshot and optional customer summary',
			},
			{
				name: 'List Contact Feed',
				value: 'listContactFeed',
				action: 'List contact feed',
				description: 'Paginated contact/customer feed with filters for search, group, reference, and account status',
			},
		],
		default: 'listContactFeed',
	},
];

export const fsiContactFeedFields: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: { show: { resource: ['contactFeed'], operation: ['listContactFeed'] } },
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 25,
		description: 'Number of contacts per page',
		displayOptions: { show: { resource: ['contactFeed'], operation: ['listContactFeed'], returnAll: [false] } },
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page to retrieve (1-based)',
		displayOptions: { show: { resource: ['contactFeed'], operation: ['listContactFeed'], returnAll: [false] } },
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description: 'Whether to return a compact operational payload',
		displayOptions: { show: { resource: ['contactFeed'], operation: ['listContactFeed', 'getEnrichedContact'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['contactFeed'], operation: ['listContactFeed'] } },
		options: [
			{ displayName: 'Account Status', name: 'accountStatus', type: 'string', default: '', description: 'Filter by account status' },
			{ displayName: 'Contact Group ID', name: 'contactGroupId', type: 'string', default: '', description: 'Filter by contact group ID' },
			{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '', description: 'Filter to a single contact ID' },
			{ displayName: 'Query', name: 'q', type: 'string', default: '', description: 'Free-text search across contact name and reference' },
			{ displayName: 'Reference', name: 'reference', type: 'string', default: '', description: 'Filter by contact reference' },
		],
	},

	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the contact to retrieve',
		displayOptions: { show: { resource: ['contactFeed'], operation: ['getEnrichedContact'] } },
	},
	{
		displayName: 'Include Summary',
		name: 'includeSummary',
		type: 'boolean',
		default: false,
		description: 'Whether to include the stored customer summary on the contact',
		displayOptions: { show: { resource: ['contactFeed'], operation: ['getEnrichedContact'] } },
	},
];
