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
				name: 'Get Job Worksheet',
				value: 'getJobWorksheet',
				action: 'Get a job worksheet',
				description:
					'Get one worksheet attached to a specific job by job ID and worksheet ID (returns ID, name, and linkType)',
			},
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
				name: 'List Job Worksheets',
				value: 'listJobWorksheets',
				action: 'List job worksheets',
				description:
					'List worksheets currently attached to a specific job (returns ID, name, and linkType). Set Include Branched Worksheets to false to inspect only directly linked (linkedToJob) worksheets before calling Update Job Worksheets.',
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
			{
				name: 'Update Job Worksheets',
				value: 'updateJobWorksheets',
				action: 'Update job worksheets',
				description:
					'Replace the entire set of worksheets linked to a job via BigChange PUT. WARNING: this overwrites all existing linked worksheets — to append a worksheet, call List Job Worksheets first and pass all existing linkedToJob IDs plus the new ID.',
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
		description: 'Whether to return all results or only up to a given limit',
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
		description: 'Whether to return all results or only up to a given limit',
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
		description: 'Whether to return all results or only up to a given limit',
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
	// ── List Job Worksheets fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['listJobWorksheets', 'getJobWorksheet', 'updateJobWorksheets'],
			},
		},
	},
	{
		displayName: 'Worksheet ID',
		name: 'worksheetId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the worksheet attached to the job',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['getJobWorksheet'],
			},
		},
	},
	{
		displayName: 'Worksheet IDs',
		name: 'worksheetIds',
		type: 'string',
		required: true,
		default: '',
		description:
			'Comma-separated numeric worksheet IDs (e.g. "12345, 67890") or a JSON array of numbers (e.g. [12345, 67890]). WARNING: BigChange PUT replaces the job\'s entire linked worksheet set — to append a worksheet, call List Job Worksheets first and include all existing linkedToJob IDs plus the new ID.',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['updateJobWorksheets'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['listJobWorksheets'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['worksheets'],
				operation: ['listJobWorksheets'],
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
				resource: ['worksheets'],
				operation: ['listJobWorksheets'],
			},
		},
		options: [
			{
				displayName: 'Include Branched Worksheets',
				name: 'includeBranchedWorksheets',
				type: 'boolean',
				default: true,
				description:
					'Whether to include branched worksheets in the list. Set to false to return only directly linked (linkedToJob) worksheets — false is sent explicitly.',
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
				resource: ['worksheets'],
				operation: [
					'getJobWorksheet',
					'getWorksheet',
					'getWorksheetQuestions',
					'listJobWorksheets',
					'listWorksheetAnswers',
					'listWorksheetDefinitions',
				],
			},
		},
	},
];
