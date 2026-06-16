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
				description: 'Quick fuzzy search across customers, engineers, jobs, persons, and sites',
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
		{
			name: 'Search Summary Sections',
			value: 'searchSummarySections',
			action: 'Search customer summary knowledge base',
			description: 'Semantic hybrid search across CustomerSummary knowledge base sections for one or all customers',
		},
		{
			name: 'Get Summary By Contact',
			value: 'getSummaryByContact',
			action: 'Get full customer summary for a contact',
			description: 'Retrieve all stored CustomerSummary sections for a single contact in one call',
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
		description: 'Max results to return per entity type (e.g. 10 returns up to 10 contacts, 10 persons, 10 jobs, etc.)',
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
			{ name: 'Person', value: 'person' },
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
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data. Removes null, empty string, and empty array fields.',
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

	// ── Search Summary Sections ──────────────────────────────────────────────
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
		description: 'Natural-language search query',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['searchSummarySections'],
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
				operation: ['searchSummarySections'],
			},
		},
		options: [
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Scope results to a single customer contact ID',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 10,
				description: 'Maximum number of results to return',
			},
			{
				displayName: 'Section Key',
				name: 'sectionKey',
				type: 'options',
				options: [
					{ name: 'Communication Summary', value: 'communication_summary' },
					{ name: 'Customer Overview', value: 'customer_overview' },
					{ name: 'Job History Patterns', value: 'job_history_patterns' },
					{ name: 'Key Analyses', value: 'key_analyses' },
					{ name: 'Operational Performance', value: 'operational_performance' },
					{ name: 'Risk & Opportunity', value: 'risk_opportunity' },
					{ name: 'Systems & Equipment', value: 'systems_equipment' },
				],
				default: '',
				description: 'Scope the search to a specific knowledge section. Leave unset to search across all sections.',
			},
		],
	},

	// ── Get Summary By Contact ───────────────────────────────────────────────
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'The contact ID whose stored CustomerSummary to retrieve',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['getSummaryByContact'],
			},
		},
	},
	{
		displayName: 'Full Report',
		name: 'fullReport',
		type: 'boolean',
		default: false,
		description: 'Whether to include an assembled fullReport markdown string in the response',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['getSummaryByContact'],
			},
		},
	},
];
