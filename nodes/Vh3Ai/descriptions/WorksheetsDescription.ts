import type { INodeProperties } from 'n8n-workflow';

export const worksheetsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['worksheets'],
			},
		},
		options: [
			{
				name: 'Get Worksheet',
				value: 'getWorksheet',
				action: 'Get a worksheet definition',
				description: 'Get one worksheet form template (the schema/blueprint) by numeric ID — title, group, version metadata. For the questions inside it, use Get Worksheet Questions.',
			},
			{
				name: 'Get Worksheet Questions',
				value: 'getWorksheetQuestions',
				action: 'Get worksheet questions',
				description: 'List the questions/fields defined inside a worksheet template (text, multiple choice, photo, signature). Use to map a question ID to its label when interpreting answers.',
			},
			{
				name: 'List Worksheet Answers',
				value: 'listWorksheetAnswers',
				action: 'List worksheet answers',
				description: 'Get completed worksheet submissions for one or more jobs — answers, photos, signatures, parts captured. Requires a comma-separated list of job IDs. Use when an agent needs to summarise what an engineer did or extract specific captured values.',
			},
			{
				name: 'List Worksheet Definitions',
				value: 'listWorksheetDefinitions',
				action: 'List worksheet definitions',
				description: 'List every worksheet form template (the blueprints engineers fill in on the mobile app). Use to discover available worksheets or map worksheet IDs to titles.',
			},
		],
		default: 'listWorksheetDefinitions',
	},
];

export const worksheetsFields: INodeProperties[] = [
	// ── Get Worksheet fields ──
	{
		displayName: 'Worksheet ID',
		name: 'worksheetId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the worksheet to retrieve',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['getWorksheet'],
			},
		},
	},

	// ── Get Worksheet Questions fields ──
	{
		displayName: 'Worksheet ID',
		name: 'worksheetId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the worksheet to retrieve questions for',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['getWorksheetQuestions'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['getWorksheetQuestions'],
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
				resource: ['worksheets'],
				operation: ['getWorksheetQuestions'],
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
				resource: ['worksheets'],
				operation: ['getWorksheetQuestions'],
				returnAll: [false],
			},
		},
	},

	// ── List Worksheet Definitions fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['listWorksheetDefinitions'],
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
				resource: ['worksheets'],
				operation: ['listWorksheetDefinitions'],
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
				resource: ['worksheets'],
				operation: ['listWorksheetDefinitions'],
				returnAll: [false],
			},
		},
	},

	// ── List Worksheet Answers fields ──
	{
		displayName: 'Job IDs',
		name: 'jobIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of job IDs to retrieve worksheet answers for (sent as entityId with entityType=job)',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['listWorksheetAnswers'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['listWorksheetAnswers'],
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
				resource: ['worksheets'],
				operation: ['listWorksheetAnswers'],
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
				resource: ['worksheets'],
				operation: ['listWorksheetAnswers'],
				returnAll: [false],
			},
		},
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
				resource: ['worksheets'],
				operation: ['getWorksheet', 'listWorksheetAnswers', 'getWorksheetQuestions', 'listWorksheetDefinitions'],
			},
		},
	},
];
