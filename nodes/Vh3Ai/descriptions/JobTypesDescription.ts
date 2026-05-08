import type { INodeProperties } from 'n8n-workflow';

export const jobTypesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['jobTypes'],
			},
		},
		options: [
			{
				name: 'Get Job Type',
				value: 'getJobType',
				action: 'Get a job type',
				description: 'Get one job type definition by numeric ID — name, default duration, custom field schema, configuration. Use to discover what custom fields a job of this type accepts.',
			},
			{
				name: 'List Job Types',
				value: 'listJobTypes',
				action: 'List job types',
				description: 'List every job type/template (e.g. installation, repair, maintenance, callout). Required reference data before Create Job — use this to find the right typeId.',
			},
		],
		default: 'listJobTypes',
	},
];

export const jobTypesFields: INodeProperties[] = [
	// ── Get Job Type fields ──
	{
		displayName: 'Job Type ID',
		name: 'jobTypeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the job type to retrieve',
		displayOptions: {
			show: {
				resource: ['jobTypes'],
				operation: ['getJobType'],
			},
		},
	},

	// ── List Job Types fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['jobTypes'],
				operation: ['listJobTypes'],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 100,
		description: 'Number of results per page',
		displayOptions: {
			show: {
				resource: ['jobTypes'],
				operation: ['listJobTypes'],
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
				resource: ['jobTypes'],
				operation: ['listJobTypes'],
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
				resource: ['jobTypes'],
				operation: ['listJobTypes'],
			},
		},
		options: [
			{
				displayName: 'Is Tasks Enabled',
				name: 'isTasksEnabled',
				type: 'boolean',
				default: false,
				description: 'Filter by whether the job type has tasks enabled',
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
				resource: ['jobTypes'],
				operation: ['listJobTypes', 'getJobType'],
			},
		},
	},
];
