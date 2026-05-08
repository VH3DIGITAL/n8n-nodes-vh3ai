import type { INodeProperties } from 'n8n-workflow';

export const fsiSearchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				name: 'Autocomplete',
				value: 'autocomplete',
				action: 'Fuzzy autocomplete search',
				description: 'Quick fuzzy search across customers, engineers, jobs, and sites',
			},
			{
				name: 'Search Intake',
				value: 'searchIntake',
				action: 'Search intake descriptions',
				description: 'Search intake descriptions with enriched job context from the knowledge graph',
			},
			{
				name: 'Search Intake (Basic)',
				value: 'searchIntakeBasic',
				action: 'Search intake descriptions (basic)',
				description: 'Search intake descriptions without graph enrichment',
			},
			{
				name: 'Search Outcomes',
				value: 'searchOutcomes',
				action: 'Search job outcomes',
				description: 'Search job outcome and diagnostic summaries',
			},
		],
		default: 'autocomplete',
	},
];

export const fsiSearchFields: INodeProperties[] = [
	// ── Autocomplete fields ──────────────────────────────────────────
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		description: 'The search term to autocomplete against',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['autocomplete'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 10,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['autocomplete'],
			},
		},
	},
	{
		displayName: 'Filter by Type',
		name: 'typeFilter',
		type: 'multiOptions',
		options: [
			{ name: 'Customer', value: 'customer' },
			{ name: 'Engineer', value: 'engineer' },
			{ name: 'Job', value: 'job' },
			{ name: 'Site', value: 'site' },
		],
		default: [],
		description: 'Only return autocomplete results whose type matches one of the selected values. Leave empty to return all types.',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['autocomplete'],
			},
		},
	},

	// ── Shared semantic search fields (Outcomes + Intake) ────────────
	{
		displayName: 'Query Text',
		name: 'queryText',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
		description: 'Natural-language search query',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['searchOutcomes', 'searchIntake', 'searchIntakeBasic'],
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
				resource: ['search'],
				operation: ['searchOutcomes', 'searchIntake', 'searchIntakeBasic'],
			},
		},
		options: [
			{
				displayName: 'Category ID',
				name: 'categoryId',
				type: 'string',
				default: '',
				description: 'Filter by job category ID',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter by customer/contact ID',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return hits where actualStartAt is on or after this date (client-side filter applied after the API response)',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'Only return hits where actualStartAt is on or before this date (client-side filter applied after the API response)',
			},
			{
				displayName: 'Max Age (Months)',
				name: 'maxAgeMonths',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 240 },
				default: 6,
				description: 'Only return hits with actualStartAt within the last N months (client-side filter). Ignored if Date From is also set.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 10,
				description: 'Max number of results to return from the API (date range is applied after this)',
			},
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'string',
				default: '',
				description: 'Filter by engineer/resource ID',
			},
			{
				displayName: 'Site Key',
				name: 'siteKey',
				type: 'string',
				default: '',
				description: 'Filter by site key',
			},
			{
				displayName: 'Type ID',
				name: 'typeId',
				type: 'string',
				default: '',
				description: 'Filter by job type ID',
			},
		],
	},
];
