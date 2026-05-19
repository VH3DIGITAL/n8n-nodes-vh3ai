import type { INodeProperties } from 'n8n-workflow';

export const salesOpportunitiesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
			},
		},
		options: [
			{
				name: 'Create Sales Opportunity Line Item',
				value: 'createSalesOpportunityLineItem',
				action: 'Create a sales opportunity line item',
				description: 'Add a priced line to a sales opportunity. Requires salesOpportunityId, contactId, description, quantity, unitCost, unitSellingPrice, taxId, nominalCodeId, departmentCodeId.',
			},
			{
				name: 'Delete Sales Opportunity Line Item',
				value: 'deleteSalesOpportunityLineItem',
				action: 'Delete a sales opportunity line item',
				description: 'Remove a line from a sales opportunity. Needs both salesOpportunityId and lineItemId.',
			},
			{
				name: 'Edit Sales Opportunity',
				value: 'editSalesOpportunity',
				action: 'Edit a sales opportunity',
				description: 'Update a sales opportunity (PATCH semantics — omit a field to keep its existing value).',
			},
			{
				name: 'Edit Sales Opportunity Line Item',
				value: 'editSalesOpportunityLineItem',
				action: 'Edit a sales opportunity line item',
				description: 'Update an existing line on a sales opportunity (PATCH semantics — omit a field to keep its existing value).',
			},
			{
				name: 'Get Sales Opportunity',
				value: 'getSalesOpportunity',
				action: 'Get a sales opportunity',
				description: 'Get one sales opportunity by ID — status, stage, probability, owner, contact, totals, custom fields. Use List Sales Opportunity Line Items for the priced lines.',
			},
			{
				name: 'Get Sales Opportunity Line Item',
				value: 'getSalesOpportunityLineItem',
				action: 'Get a sales opportunity line item',
				description: 'Get one priced line on a sales opportunity. Needs both salesOpportunityId and lineItemId.',
			},
			{
				name: 'List Probabilities',
				value: 'listSalesOpportunityProbabilities',
				action: 'List sales opportunity probabilities',
				description: 'List configured sales opportunity probabilities (reference data — e.g. 25%, 50%, 75%).',
			},
			{
				name: 'List Sales Opportunities',
				value: 'listSalesOpportunities',
				action: 'List or search sales opportunities',
				description: 'List sales opportunities. BigChange requires at least one filter (id/status/contactId/ownerId/reference) or a date window (createdAt or dueDate) — if none supplied, the node defaults to the last 12 months.',
			},
			{
				name: 'List Sales Opportunity Line Items',
				value: 'listSalesOpportunityLineItems',
				action: 'List sales opportunity line items',
				description: 'List every priced line on a sales opportunity. Use to compute weighted/forecast totals or audit pricing.',
			},
			{
				name: 'List Stages',
				value: 'listSalesOpportunityStages',
				action: 'List sales opportunity stages',
				description: 'List configured sales opportunity pipeline stages (reference data — e.g. Qualified, Proposal, Negotiation, Closed Won).',
			},
		],
		default: 'listSalesOpportunities',
	},
];

export const salesOpportunitiesFields: INodeProperties[] = [
	// ── List Sales Opportunities ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunities'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunities'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunities'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunities'],
			},
		},
		options: [
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'number',
				default: 0,
				description: 'Filter by a single contact ID (omit to ignore — BC rejects contactId=0)',
			},
			{
				displayName: 'Created At From',
				name: 'createdAtFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return sales opportunities created on or after this time',
			},
			{
				displayName: 'Created At To',
				name: 'createdAtTo',
				type: 'dateTime',
				default: '',
				description: 'Only return sales opportunities created on or before this time',
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
				displayName: 'Due Date From',
				name: 'dueDateFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return sales opportunities due on or after this date',
			},
			{
				displayName: 'Due Date To',
				name: 'dueDateTo',
				type: 'dateTime',
				default: '',
				description: 'Only return sales opportunities due on or before this date',
			},
			{
				displayName: 'Sales Opportunity IDs',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by sales opportunity IDs (comma-separated)',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Filter by owner (user) ID (omit to ignore — BC rejects ownerId=0)',
			},
			{
				displayName: 'References',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Filter by references (comma-separated)',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [{ name: 'Created At', value: 'createdAt' }],
				default: 'createdAt',
				description: 'Field to sort results by',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				description: 'Filter by status (comma-separated for multiple)',
			},
		],
	},

	// ── Get Sales Opportunity ──
	{
		displayName: 'Sales Opportunity ID',
		name: 'salesOpportunityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the sales opportunity to retrieve',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['getSalesOpportunity'],
			},
		},
	},

	// ── Edit Sales Opportunity ──
	{
		displayName: 'Sales Opportunity ID',
		name: 'salesOpportunityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the sales opportunity to edit',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['editSalesOpportunity'],
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
				resource: ['salesOpportunities'],
				operation: ['editSalesOpportunity'],
			},
		},
		options: [
			{
				displayName: 'Client Notes',
				name: 'clientNotes',
				type: 'string',
				default: '',
				description: 'Notes visible to the client',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'number',
				default: 0,
				description: 'Contact to associate with the sales opportunity',
			},
			{
				displayName: 'Department Code ID',
				name: 'departmentCodeId',
				type: 'number',
				default: 0,
				description: 'Department code ID',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'Expected close date for the sales opportunity (UTC)',
			},
			{
				displayName: 'Internal Notes',
				name: 'internalNotes',
				type: 'string',
				default: '',
				description: 'Internal notes not visible to the client',
			},
			{
				displayName: 'Nominal Code ID',
				name: 'nominalCodeId',
				type: 'number',
				default: 0,
				description: 'Nominal (accounting) code ID',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Owner (user) ID',
			},
			{
				displayName: 'Probability ID',
				name: 'probabilityId',
				type: 'number',
				default: 0,
				description: 'Probability reference ID (see List Probabilities)',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference for the sales opportunity',
			},
			{
				displayName: 'Stage ID',
				name: 'stageId',
				type: 'number',
				default: 0,
				description: 'Pipeline stage reference ID (see List Stages)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				description: 'Status of the sales opportunity',
			},
		],
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Custom Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['editSalesOpportunity'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Definition ID',
						name: 'definitionId',
						type: 'number',
						default: 0,
						description: 'Custom field definition ID',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value for this custom field',
					},
				],
			},
		],
	},

	// ── List Probabilities / List Stages (pagination + simplify) ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunityProbabilities', 'listSalesOpportunityStages'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunityProbabilities', 'listSalesOpportunityStages'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunityProbabilities', 'listSalesOpportunityStages'],
				returnAll: [false],
			},
		},
	},

	// ── List Sales Opportunity Line Items ──
	{
		displayName: 'Sales Opportunity ID',
		name: 'salesOpportunityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the sales opportunity to list line items for',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunityLineItems'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunityLineItems'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunityLineItems'],
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
				resource: ['salesOpportunities'],
				operation: ['listSalesOpportunityLineItems'],
				returnAll: [false],
			},
		},
	},

	// ── Get Sales Opportunity Line Item ──
	{
		displayName: 'Sales Opportunity ID',
		name: 'salesOpportunityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the sales opportunity',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['getSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Line Item ID',
		name: 'lineItemId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the line item',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['getSalesOpportunityLineItem'],
			},
		},
	},

	// ── Create Sales Opportunity Line Item ──
	{
		displayName: 'Sales Opportunity ID',
		name: 'salesOpportunityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the sales opportunity',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Contact ID for the line item',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		default: '',
		description: 'Description of the line item',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		required: true,
		default: 1,
		description: 'Quantity of the line item',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Unit Cost',
		name: 'unitCost',
		type: 'number',
		required: true,
		default: 0,
		description: 'Cost per unit',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Unit Selling Price',
		name: 'unitSellingPrice',
		type: 'number',
		required: true,
		default: 0,
		description: 'Selling price per unit',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Tax ID',
		name: 'taxId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Tax rate ID to apply',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Nominal Code ID',
		name: 'nominalCodeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Nominal (accounting) code ID',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Department Code ID',
		name: 'departmentCodeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Department code ID',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['createSalesOpportunityLineItem'],
			},
		},
	},

	// ── Edit Sales Opportunity Line Item (PATCH semantics) ──
	{
		displayName: 'Sales Opportunity ID',
		name: 'salesOpportunityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the sales opportunity',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['editSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Line Item ID',
		name: 'lineItemId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the line item to update',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['editSalesOpportunityLineItem'],
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
				resource: ['salesOpportunities'],
				operation: ['editSalesOpportunityLineItem'],
			},
		},
		options: [
			{
				displayName: 'Department Code ID',
				name: 'departmentCodeId',
				type: 'number',
				default: 0,
				description: 'Department code ID',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the line item',
			},
			{
				displayName: 'Nominal Code ID',
				name: 'nominalCodeId',
				type: 'number',
				default: 0,
				description: 'Nominal (accounting) code ID',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 0,
				description: 'Quantity of the line item',
			},
			{
				displayName: 'Tax ID',
				name: 'taxId',
				type: 'number',
				default: 0,
				description: 'Tax rate ID to apply',
			},
			{
				displayName: 'Unit Cost',
				name: 'unitCost',
				type: 'number',
				default: 0,
				description: 'Cost per unit',
			},
			{
				displayName: 'Unit Selling Price',
				name: 'unitSellingPrice',
				type: 'number',
				default: 0,
				description: 'Selling price per unit',
			},
		],
	},

	// ── Delete Sales Opportunity Line Item ──
	{
		displayName: 'Sales Opportunity ID',
		name: 'salesOpportunityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the sales opportunity',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['deleteSalesOpportunityLineItem'],
			},
		},
	},
	{
		displayName: 'Line Item ID',
		name: 'lineItemId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the line item to delete',
		displayOptions: {
			show: {
				resource: ['salesOpportunities'],
				operation: ['deleteSalesOpportunityLineItem'],
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
				resource: ['salesOpportunities'],
				operation: [
					'listSalesOpportunities',
					'getSalesOpportunity',
					'listSalesOpportunityProbabilities',
					'listSalesOpportunityStages',
					'listSalesOpportunityLineItems',
					'getSalesOpportunityLineItem',
				],
			},
		},
	},
];
