import type { INodeProperties } from 'n8n-workflow';

export const invoicesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['invoices'],
			},
		},
		options: [
			{
				name: 'Cancel Invoice',
				value: 'cancelInvoice',
				action: 'Cancel an invoice',
				description: 'Cancel an invoice by ID. Use only for invoices that should not be paid (e.g. raised in error). Cancellation is permanent.',
			},
		{
			name: 'Create Invoice',
			value: 'createInvoice',
			action: 'Create an invoice',
			description: 'Raise a new invoice. Requires currencyCode (ISO 4217, e.g. GBP, USD, EUR). Link to a job, job group, OR contact via additional fields. Optionally set invoice date (createdAt), notes, bank account, department, nominal code. After creation, add lines via Create Invoice Line Item, then Mark Invoice Sent.',
		},
			{
				name: 'Create Invoice Line Item',
				value: 'createInvoiceLineItem',
				action: 'Create an invoice line item',
				description: 'Add a billable line to an invoice. Requires invoiceId, contactId, description, quantity, unitCost, unitSellingPrice, taxId, nominalCodeId, departmentCodeId. Get tax/nominal/department code IDs from List Reference Data.',
			},
			{
				name: 'Delete Invoice Line Item',
				value: 'deleteInvoiceLineItem',
				action: 'Delete an invoice line item',
				description: 'Remove a line item from an invoice (only valid before the invoice is sent/paid). Needs both invoiceId and lineItemId.',
			},
			{
				name: 'Edit Invoice',
				value: 'editInvoice',
				action: 'Edit an invoice',
				description: 'Update notes on an existing invoice (clientNotes shown to customer; internalNotes private). Cannot change currency, totals, or links — recreate for those changes.',
			},
			{
				name: 'Get Invoice',
				value: 'getInvoice',
				action: 'Get an invoice',
				description: 'Get a single invoice by numeric ID — totals, status, customer, links, tax breakdown. Use List Invoice Line Items for the lines.',
			},
			{
				name: 'Get Invoice Line Item',
				value: 'getInvoiceLineItem',
				action: 'Get an invoice line item',
				description: 'Get one line on an invoice (description, qty, unit cost/price, tax, nominal, department). Needs both invoiceId and lineItemId.',
			},
			{
				name: 'List Invoice Line Items',
				value: 'listInvoiceLineItems',
				action: 'List invoice line items',
				description: 'List every line on an invoice (what was billed). Use to compute totals, audit a bill, or extract narrative for a customer email.',
			},
			{
				name: 'List Invoices',
				value: 'listInvoices',
				action: 'List or search invoices',
				description: 'List invoices. BigChange requires at least one filter or a date range — if you supply none, the node defaults to the last 12 months. Filter by job ID(s), contact ID(s), reference, or createdAt window. Use to find recent/unpaid invoices, customer history, etc.',
			},
			{
				name: 'Mark Invoice Paid',
				value: 'markInvoicePaid',
				action: 'Mark an invoice as paid',
				description: 'Record payment received on an invoice. Optional paidAt timestamp (UTC, defaults to now). Use after manual payment reconciliation.',
			},
			{
				name: 'Mark Invoice Sent',
				value: 'markInvoiceSent',
				action: 'Mark an invoice as sent',
				description: 'Mark an invoice as issued/sent to the customer. Required before payment can be recorded. No fields beyond invoiceId.',
			},
		],
		default: 'listInvoices',
	},
];

export const invoicesFields: INodeProperties[] = [
	// ── List Invoices fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['listInvoices'],
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
				resource: ['invoices'],
				operation: ['listInvoices'],
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
				resource: ['invoices'],
				operation: ['listInvoices'],
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
				resource: ['invoices'],
				operation: ['listInvoices'],
			},
		},
		options: [
			{
				displayName: 'Contact IDs',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter by contact IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Created At From',
				name: 'createdAtFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return invoices created on or after this date',
			},
			{
				displayName: 'Created At To',
				name: 'createdAtTo',
				type: 'dateTime',
				default: '',
				description: 'Only return invoices created on or before this date',
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
				displayName: 'Job IDs',
				name: 'jobId',
				type: 'string',
				default: '',
				description: 'Filter by job IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'References',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Filter by invoice references (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
				],
				default: 'createdAt',
				description: 'Field to sort results by',
			},
		],
	},

	// ── Get Invoice fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice to retrieve',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['getInvoice'],
			},
		},
	},

	// ── Create Invoice fields ──
	{
		displayName: 'Currency Code',
		name: 'currencyCode',
		type: 'options',
		required: true,
		options: [
			{ name: 'AED', value: 'AED' },
			{ name: 'AUD', value: 'AUD' },
			{ name: 'BGN', value: 'BGN' },
			{ name: 'CAD', value: 'CAD' },
			{ name: 'CHF', value: 'CHF' },
			{ name: 'CZK', value: 'CZK' },
			{ name: 'DKK', value: 'DKK' },
			{ name: 'EUR', value: 'EUR' },
			{ name: 'GBP', value: 'GBP' },
			{ name: 'HUF', value: 'HUF' },
			{ name: 'ILS', value: 'ILS' },
			{ name: 'LTL', value: 'LTL' },
			{ name: 'LVL', value: 'LVL' },
			{ name: 'MXN', value: 'MXN' },
			{ name: 'NOK', value: 'NOK' },
			{ name: 'NZD', value: 'NZD' },
			{ name: 'PLN', value: 'PLN' },
			{ name: 'RON', value: 'RON' },
			{ name: 'RUB', value: 'RUB' },
			{ name: 'SEK', value: 'SEK' },
			{ name: 'USD', value: 'USD' },
			{ name: 'ZAR', value: 'ZAR' },
		],
		default: 'GBP',
		description: 'Currency for the invoice (ISO 4217)',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['createInvoice'],
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
				resource: ['invoices'],
				operation: ['createInvoice'],
			},
		},
		options: [
			{
				displayName: 'Bank Account ID',
				name: 'bankAccountId',
				type: 'number',
				default: 0,
				description: 'Bank account ID to associate with the invoice',
			},
			{
				displayName: 'Client Notes',
				name: 'clientNotes',
				type: 'string',
				default: '',
				description: 'Notes visible to the client (e.g. payment terms)',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'number',
				default: 0,
				description: 'Contact ID to associate with the invoice (defaults to contact linked to the job/job group)',
			},
			{
				displayName: 'Created At',
				name: 'createdAt',
				type: 'dateTime',
				default: '',
				description: 'Invoice date. Defaults to the current date/time if not provided. Must be in UTC.',
			},
			{
				displayName: 'Department Code ID',
				name: 'departmentCodeId',
				type: 'number',
				default: 0,
				description: 'Department code ID to associate with the invoice',
			},
			{
				displayName: 'Delivery Site Contact ID',
				name: 'deliverySiteContactId',
				type: 'number',
				default: 0,
				description: 'Delivery site contact ID to associate with the invoice',
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
				description: 'Job group ID to associate with the invoice',
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'number',
				default: 0,
				description: 'Job ID to associate with the invoice',
			},
			{
				displayName: 'Nominal Code ID',
				name: 'nominalCodeId',
				type: 'number',
				default: 0,
				description: 'Nominal (accounting) code ID to associate with the invoice',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference for the invoice (auto-generated if not provided)',
			},
		],
	},

	// ── Create Invoice — Custom Fields ──
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Custom Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['createInvoice'],
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
						description: 'The custom field definition ID',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The value to set for this custom field (empty string to clear)',
					},
				],
			},
		],
	},

	// ── Edit Invoice fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice to edit',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['editInvoice'],
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
				resource: ['invoices'],
				operation: ['editInvoice'],
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
				displayName: 'Internal Notes',
				name: 'internalNotes',
				type: 'string',
				default: '',
				description: 'Internal notes not visible to the client',
			},
		],
	},

	// ── Cancel Invoice fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice to cancel',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['cancelInvoice'],
			},
		},
	},

	// ── Mark Invoice Paid fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice to mark as paid',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['markInvoicePaid'],
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
				resource: ['invoices'],
				operation: ['markInvoicePaid'],
			},
		},
		options: [
			{
				displayName: 'Paid At',
				name: 'paidAt',
				type: 'dateTime',
				default: '',
				description: 'Date and time the invoice was paid',
			},
		],
	},

	// ── Mark Invoice Sent fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice to mark as sent',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['markInvoiceSent'],
			},
		},
	},

	// ── List Invoice Line Items fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice to list line items for',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['listInvoiceLineItems'],
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
				resource: ['invoices'],
				operation: ['listInvoiceLineItems'],
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
				resource: ['invoices'],
				operation: ['listInvoiceLineItems'],
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
				resource: ['invoices'],
				operation: ['listInvoiceLineItems'],
				returnAll: [false],
			},
		},
	},

	// ── Create Invoice Line Item fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice to add a line item to',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['createInvoiceLineItem'],
			},
		},
	},

	// ── Delete Invoice Line Item fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['deleteInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['deleteInvoiceLineItem'],
			},
		},
	},
	// ── Get Invoice Line Item fields ──
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the invoice the line item belongs to',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['getInvoiceLineItem'],
			},
		},
	},
	{
		displayName: 'Line Item ID',
		name: 'lineItemId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the line item to retrieve',
		displayOptions: {
			show: {
				resource: ['invoices'],
				operation: ['getInvoiceLineItem'],
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
				resource: ['invoices'],
				operation: ['listInvoices', 'getInvoice', 'listInvoiceLineItems', 'getInvoiceLineItem'],
			},
		},
	},
];
