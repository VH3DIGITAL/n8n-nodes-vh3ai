import type { INodeProperties } from 'n8n-workflow';

export const quotesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['quotes'],
			},
		},
		options: [
			{
				name: 'Create Quote',
				value: 'createQuote',
				action: 'Create a quote',
				description: 'Raise a new sales quote. Requires currencyCode (ISO 4217). Link to a job, job group, or contact via additional fields. Optional daysValidFor, custom fields, delivery site, and notes (clientNotes shown to customer; internalNotes private). Add lines via Create Quote Line Item, then Mark Quote Sent.',
			},
			{
				name: 'Create Quote Line Item',
				value: 'createQuoteLineItem',
				action: 'Create a quote line item',
				description: 'Add a priced line to a quote. Requires quoteId, contactId, description, quantity, unitCost, unitSellingPrice, taxId, nominalCodeId, departmentCodeId.',
			},
			{
				name: 'Delete Quote Line Item',
				value: 'deleteQuoteLineItem',
				action: 'Delete a quote line item',
				description: 'Remove a line from a quote. Needs both quoteId and lineItemId. Only valid before the quote is accepted.',
			},
			{
				name: 'Edit Quote',
				value: 'editQuote',
				action: 'Edit a quote',
				description: 'Update notes, daysValidFor, delivery site, nominal/department codes, or custom fields on an existing quote. Cannot change currency or convert to invoice.',
			},
			{
				name: 'Edit Quote Line Item',
				value: 'editQuoteLineItem',
				action: 'Edit a quote line item',
				description: 'Update an existing line on a quote. All pricing fields (qty, unitCost, unitSellingPrice, taxId, nominalCodeId, departmentCodeId) and description must be supplied.',
			},
			{
				name: 'Get Quote',
				value: 'getQuote',
				action: 'Get a quote',
				description: 'Get one quote by ID — totals, status, customer, validity, custom fields. Use List Quote Line Items for the priced lines.',
			},
			{
				name: 'Get Quote Line Item',
				value: 'getQuoteLineItem',
				action: 'Get a quote line item',
				description: 'Get one priced line on a quote (description, qty, unit cost/price, tax, nominal, department). Needs both quoteId and lineItemId.',
			},
			{
				name: 'List Quote Line Items',
				value: 'listQuoteLineItems',
				action: 'List quote line items',
				description: 'List every priced line on a quote. Use to compute totals, generate a customer-facing breakdown, or audit pricing.',
			},
			{
				name: 'List Quotes',
				value: 'listQuotes',
				action: 'List or search quotes',
				description: 'List quotes. BigChange requires at least one filter (id/jobId/jobGroupId/contactId/reference) or a createdAt window — if none supplied, the node defaults to the last 12 months. Use for pipeline/conversion analysis or finding a customer\'s outstanding quote.',
			},
			{
				name: 'Mark Quote Accepted',
				value: 'markQuoteAccepted',
				action: 'Mark a quote as accepted',
				description: 'Customer accepted the quote — locks pricing and unblocks job/invoice creation against it.',
			},
			{
				name: 'Mark Quote Rejected',
				value: 'markQuoteRejected',
				action: 'Mark a quote as rejected',
				description: 'Customer rejected the quote. Closes the quote out of the active pipeline.',
			},
			{
				name: 'Mark Quote Sent',
				value: 'markQuoteSent',
				action: 'Mark a quote as sent',
				description: 'Mark a quote as issued/sent to the customer. Optional sentAt timestamp (UTC, defaults to now).',
			},
		],
		default: 'listQuotes',
	},
];

export const quotesFields: INodeProperties[] = [
	// ── List Quotes ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['listQuotes'],
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
				resource: ['quotes'],
				operation: ['listQuotes'],
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
				resource: ['quotes'],
				operation: ['listQuotes'],
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
				resource: ['quotes'],
				operation: ['listQuotes'],
			},
		},
		options: [
			{
				displayName: 'Contact IDs',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter by contact IDs (comma-separated)',
			},
			{
				displayName: 'Created At From',
				name: 'createdAtFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return quotes created on or after this time',
			},
			{
				displayName: 'Created At To',
				name: 'createdAtTo',
				type: 'dateTime',
				default: '',
				description: 'Only return quotes created on or before this time',
			},
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
				displayName: 'Quote IDs',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by quote IDs (comma-separated)',
			},
			{
				displayName: 'Job Group IDs',
				name: 'jobGroupId',
				type: 'string',
				default: '',
				description: 'Filter by job group IDs (comma-separated)',
			},
			{
				displayName: 'Job IDs',
				name: 'jobId',
				type: 'string',
				default: '',
				description: 'Filter by job IDs (comma-separated)',
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
		],
	},

	// ── Get Quote ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote to retrieve',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['getQuote'],
			},
		},
	},

	// ── Create Quote ──
	{
		displayName: 'Currency Code',
		name: 'currencyCode',
		type: 'options',
		required: true,
		options: [
			{ name: 'AUD', value: 'AUD' },
			{ name: 'EUR', value: 'EUR' },
			{ name: 'GBP', value: 'GBP' },
			{ name: 'USD', value: 'USD' },
		],
		default: 'GBP',
		description: 'Currency for the quote',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['createQuote'],
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
				resource: ['quotes'],
				operation: ['createQuote'],
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
				description: 'Contact to associate with the quote',
			},
			{
				displayName: 'Created At',
				name: 'createdAt',
				type: 'dateTime',
				default: '',
				description: 'Quote creation timestamp (if supported by the API)',
			},
			{
				displayName: 'Days Valid For',
				name: 'daysValidFor',
				type: 'number',
				default: 0,
				description: 'Number of days the quote remains valid',
			},
			{
				displayName: 'Delivery Site Contact ID',
				name: 'deliverySiteContactId',
				type: 'number',
				default: 0,
				description: 'Delivery site contact ID',
			},
			{
				displayName: 'Department Code ID',
				name: 'departmentCodeId',
				type: 'number',
				default: 0,
				description: 'Department code ID',
			},
			{
				displayName: 'Internal Notes',
				name: 'internalNotes',
				type: 'string',
				default: '',
				description: 'Internal notes not visible to the client',
			},
			{
				displayName: 'Job Group ID',
				name: 'jobGroupId',
				type: 'number',
				default: 0,
				description: 'Job group to associate with the quote',
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'number',
				default: 0,
				description: 'Job to associate with the quote',
			},
			{
				displayName: 'Nominal Code ID',
				name: 'nominalCodeId',
				type: 'number',
				default: 0,
				description: 'Nominal (accounting) code ID',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference for the quote',
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
				resource: ['quotes'],
				operation: ['createQuote'],
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

	// ── Edit Quote ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote to edit',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['editQuote'],
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
				resource: ['quotes'],
				operation: ['editQuote'],
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
				displayName: 'Days Valid For',
				name: 'daysValidFor',
				type: 'number',
				default: 0,
				description: 'Number of days the quote remains valid',
			},
			{
				displayName: 'Delivery Site Contact ID',
				name: 'deliverySiteContactId',
				type: 'number',
				default: 0,
				description: 'Delivery site contact ID',
			},
			{
				displayName: 'Department Code ID',
				name: 'departmentCodeId',
				type: 'number',
				default: 0,
				description: 'Department code ID',
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
				resource: ['quotes'],
				operation: ['editQuote'],
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

	// ── List Quote Line Items ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote to list line items for',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['listQuoteLineItems'],
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
				resource: ['quotes'],
				operation: ['listQuoteLineItems'],
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
				resource: ['quotes'],
				operation: ['listQuoteLineItems'],
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
				resource: ['quotes'],
				operation: ['listQuoteLineItems'],
				returnAll: [false],
			},
		},
	},

	// ── Get Quote Line Item ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['getQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['getQuoteLineItem'],
			},
		},
	},

	// ── Create Quote Line Item ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['createQuoteLineItem'],
			},
		},
	},

	// ── Edit Quote Line Item ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['editQuoteLineItem'],
			},
		},
	},

	// ── Delete Quote Line Item ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['deleteQuoteLineItem'],
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
				resource: ['quotes'],
				operation: ['deleteQuoteLineItem'],
			},
		},
	},

	// ── Mark Quote Sent / Accepted / Rejected ──
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the quote',
		displayOptions: {
			show: {
				resource: ['quotes'],
				operation: ['markQuoteSent', 'markQuoteAccepted', 'markQuoteRejected'],
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
				resource: ['quotes'],
				operation: ['markQuoteSent'],
			},
		},
		options: [
			{
				displayName: 'Sent At',
				name: 'sentAt',
				type: 'dateTime',
				default: '',
				description: 'Date and time the quote was sent',
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
				resource: ['quotes'],
				operation: ['listQuotes', 'getQuote', 'listQuoteLineItems', 'getQuoteLineItem'],
			},
		},
	},
];
