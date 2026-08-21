import type { INodeProperties } from 'n8n-workflow';

export const fsiQuotientOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['quotient'] } },
		options: [
			{
				name: 'Get Quote',
				value: 'getQuotientQuote',
				action: 'Get a quotient quote',
				description: 'Get a single Quotient quotation by UUID or quote number',
			},
			{
				name: 'List Quotes',
				value: 'listQuotientQuotes',
				action: 'List quotient quotes',
				description: 'Paginated Quotient quotations with date-window and status filters',
			},
		],
		default: 'listQuotientQuotes',
	},
];

export const fsiQuotientFields: INodeProperties[] = [
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page number for pagination',
		displayOptions: { show: { resource: ['quotient'], operation: ['listQuotientQuotes'] } },
	},
	{
		displayName: 'Per Page',
		name: 'perPage',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 25,
		description: 'Number of quotes per page',
		displayOptions: { show: { resource: ['quotient'], operation: ['listQuotientQuotes'] } },
	},
	{
		displayName: 'Full Payload',
		name: 'full',
		type: 'boolean',
		default: false,
		description: 'Whether to return the full quote payload instead of the slim version',
		displayOptions: { show: { resource: ['quotient'], operation: ['listQuotientQuotes', 'getQuotientQuote'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['quotient'], operation: ['listQuotientQuotes'] } },
		options: [
			{
				displayName: 'Date Field',
				name: 'dateField',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'created_at' },
					{ name: 'Updated At', value: 'updated_at' },
				],
				default: 'created_at',
				description: 'Which timestamp the start/end window applies to. Use Updated At with status Accepted for quotes accepted in a period.',
			},
			{ displayName: 'Date From', name: 'createdAtStart', type: 'dateTime', default: '', description: 'Inclusive start of the date window' },
			{ displayName: 'Date To', name: 'createdAtEnd', type: 'dateTime', default: '', description: 'Inclusive end of the date window' },
			{
				displayName: 'Quote Status',
				name: 'quoteStatus',
				type: 'string',
				default: '',
				placeholder: 'Accepted',
				description: 'Optional status filter, e.g. Accepted, Awaiting Acceptance, Declined',
			},
			{
				displayName: 'Sort Field',
				name: 'sortField',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'created_at' },
					{ name: 'Updated At', value: 'updated_at' },
				],
				default: 'created_at',
				description: 'Which timestamp to sort by. Pair with Date Field when filtering on Updated At.',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
			},
		],
	},

	{
		displayName: 'Identifier',
		name: 'identifier',
		type: 'string',
		required: true,
		default: '',
		description: 'Quote UUID or integer quote number',
		displayOptions: { show: { resource: ['quotient'], operation: ['getQuotientQuote'] } },
	},
];
