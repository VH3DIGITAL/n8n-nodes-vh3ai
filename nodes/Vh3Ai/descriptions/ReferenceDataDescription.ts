import type { INodeProperties } from 'n8n-workflow';

export const referenceDataOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['referenceData'],
			},
		},
		options: [
			{
				name: 'Get Department Code',
				value: 'getDepartmentCode',
				action: 'Get a department code',
				description: 'Get one department code by ID — code and description. Use to map a departmentCodeId on a quote/invoice line to a human-readable label.',
			},
			{
				name: 'Get Nominal Code',
				value: 'getNominalCode',
				action: 'Get a nominal code',
				description: 'Get one nominal (accounting) code by ID — code and description. Use to map a nominalCodeId on a quote/invoice line to its accounting label.',
			},
			{
				name: 'List Department Codes',
				value: 'listDepartmentCodes',
				action: 'List department codes',
				description: 'List department codes (cost-centre codes used on quotes and invoices). Required reference data before Create Quote Line Item / Create Invoice Line Item.',
			},
			{
				name: 'List Nominal Codes',
				value: 'listNominalCodes',
				action: 'List nominal codes',
				description: 'List nominal (accounting) codes used on quotes and invoices. Required reference data before Create Quote Line Item / Create Invoice Line Item.',
			},
		],
		default: 'listDepartmentCodes',
	},
];

export const referenceDataFields: INodeProperties[] = [
	// ── List Department Codes fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['referenceData'],
				operation: ['listDepartmentCodes'],
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
				resource: ['referenceData'],
				operation: ['listDepartmentCodes'],
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
				resource: ['referenceData'],
				operation: ['listDepartmentCodes'],
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
				resource: ['referenceData'],
				operation: ['listDepartmentCodes'],
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
				default: 'ascending',
				description: 'Sort direction',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Code', value: 'code' },
					{ name: 'Description', value: 'description' },
				],
				default: 'code',
				description: 'Field to sort results by (BigChange supports code or description)',
			},
		],
	},

	// ── List Nominal Codes fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['referenceData'],
				operation: ['listNominalCodes'],
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
				resource: ['referenceData'],
				operation: ['listNominalCodes'],
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
				resource: ['referenceData'],
				operation: ['listNominalCodes'],
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
				resource: ['referenceData'],
				operation: ['listNominalCodes'],
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
				default: 'ascending',
				description: 'Sort direction',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Code', value: 'code' },
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Description', value: 'description' },
					{ name: 'Name', value: 'name' },
				],
				default: 'name',
				description: 'Field to sort results by',
			},
		],
	},
	// ── Get Department Code fields ──
	{
		displayName: 'Department Code ID',
		name: 'departmentCodeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the department code to retrieve',
		displayOptions: {
			show: {
				resource: ['referenceData'],
				operation: ['getDepartmentCode'],
			},
		},
	},

	// ── Get Nominal Code fields ──
	{
		displayName: 'Nominal Code ID',
		name: 'nominalCodeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the nominal code to retrieve',
		displayOptions: {
			show: {
				resource: ['referenceData'],
				operation: ['getNominalCode'],
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
				resource: ['referenceData'],
				operation: ['listDepartmentCodes', 'listNominalCodes', 'getDepartmentCode', 'getNominalCode'],
			},
		},
	},
];
