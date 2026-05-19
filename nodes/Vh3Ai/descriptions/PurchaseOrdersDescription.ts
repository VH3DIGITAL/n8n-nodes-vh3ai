import type { INodeProperties } from 'n8n-workflow';

export const purchaseOrdersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
			},
		},
		options: [
			{
				name: 'Create Purchase Order',
				value: 'createPurchaseOrder',
				action: 'Create a purchase order',
				description: 'Create a new purchase order. supplierId is required. Optionally link to a job, job group, or contact via additional fields.',
			},
			{
				name: 'Create Purchase Order Line Item',
				value: 'createPurchaseOrderLineItem',
				action: 'Create a purchase order line item',
				description: 'Add a line to a purchase order. Requires purchaseOrderId, contactId, description, quantity, unitCost, unitSellingPrice, taxId, nominalCodeId, departmentCodeId.',
			},
			{
				name: 'Delete Purchase Order Line Item',
				value: 'deletePurchaseOrderLineItem',
				action: 'Delete a purchase order line item',
				description: 'Remove a line from a purchase order. Needs both purchaseOrderId and lineItemId.',
			},
			{
				name: 'Edit Purchase Order',
				value: 'editPurchaseOrder',
				action: 'Edit a purchase order',
				description: 'Update a purchase order (PATCH semantics — omit a field to keep its existing value).',
			},
			{
				name: 'Edit Purchase Order Line Item',
				value: 'editPurchaseOrderLineItem',
				action: 'Edit a purchase order line item',
				description: 'Update an existing line on a purchase order (PATCH semantics — omit a field to keep its existing value).',
			},
			{
				name: 'Get Purchase Order',
				value: 'getPurchaseOrder',
				action: 'Get a purchase order',
				description: 'Get one purchase order by ID — supplier, status, totals, links, custom fields. Use List Purchase Order Line Items for the lines.',
			},
			{
				name: 'Get Purchase Order Line Item',
				value: 'getPurchaseOrderLineItem',
				action: 'Get a purchase order line item',
				description: 'Get one line on a purchase order. Needs both purchaseOrderId and lineItemId.',
			},
			{
				name: 'Get Purchase Order Series',
				value: 'getPurchaseOrderSeries',
				action: 'Get a purchase order series',
				description: 'Get a single purchase order series (numbering sequence) by ID.',
			},
			{
				name: 'List Purchase Order Line Items',
				value: 'listPurchaseOrderLineItems',
				action: 'List purchase order line items',
				description: 'List every line on a purchase order. Use to compute totals or audit ordered goods.',
			},
			{
				name: 'List Purchase Order Series',
				value: 'listPurchaseOrderSeries',
				action: 'List purchase order series',
				description: 'List configured purchase order series (numbering sequences) — reference data.',
			},
			{
				name: 'List Purchase Orders',
				value: 'listPurchaseOrders',
				action: 'List or search purchase orders',
				description: 'List purchase orders. BigChange requires at least one filter (id/jobId/jobGroupId/contactId/reference) or a createdAt window — if none supplied, the node defaults to the last 12 months. Note: date-only filtering may return a BC 500 on some tenants — combine with id[]/jobId[]/contactId[] when possible.',
			},
		],
		default: 'listPurchaseOrders',
	},
];

export const purchaseOrdersFields: INodeProperties[] = [
	// ── List Purchase Orders ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrders'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrders'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrders'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrders'],
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
				description: 'Only return purchase orders created on or after this time',
			},
			{
				displayName: 'Created At To',
				name: 'createdAtTo',
				type: 'dateTime',
				default: '',
				description: 'Only return purchase orders created on or before this time',
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
				displayName: 'Purchase Order IDs',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by purchase order IDs (comma-separated)',
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

	// ── Get Purchase Order ──
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order to retrieve',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['getPurchaseOrder'],
			},
		},
	},

	// ── Create Purchase Order ──
	{
		displayName: 'Supplier ID',
		name: 'supplierId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the supplier (contact)',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrder'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrder'],
			},
		},
		options: [
			{
				displayName: 'Client Notes',
				name: 'clientNotes',
				type: 'string',
				default: '',
				description: 'Notes visible to the supplier',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'number',
				default: 0,
				description: 'Contact (customer) to associate with the purchase order',
			},
			{
				displayName: 'Created At',
				name: 'createdAt',
				type: 'dateTime',
				default: '',
				description: 'Purchase order date. Defaults to now if not provided. Must be UTC.',
			},
			{
				displayName: 'Currency Code',
				name: 'currencyCode',
				type: 'options',
				options: [
					{ name: 'AED', value: 'AED' },
					{ name: 'AUD', value: 'AUD' },
					{ name: 'CAD', value: 'CAD' },
					{ name: 'CHF', value: 'CHF' },
					{ name: 'EUR', value: 'EUR' },
					{ name: 'GBP', value: 'GBP' },
					{ name: 'NZD', value: 'NZD' },
					{ name: 'USD', value: 'USD' },
					{ name: 'ZAR', value: 'ZAR' },
				],
				default: 'GBP',
				description: 'Currency for the purchase order (ISO 4217)',
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
				description: 'Internal notes not visible to the supplier',
			},
			{
				displayName: 'Job Group ID',
				name: 'jobGroupId',
				type: 'number',
				default: 0,
				description: 'Job group to associate with the purchase order',
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'number',
				default: 0,
				description: 'Job to associate with the purchase order',
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
				description: 'External reference for the purchase order',
			},
			{
				displayName: 'Series ID',
				name: 'seriesId',
				type: 'number',
				default: 0,
				description: 'Purchase order series (numbering) ID — see List Purchase Order Series',
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrder'],
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

	// ── Edit Purchase Order (PATCH) ──
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order to edit',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['editPurchaseOrder'],
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
				resource: ['purchaseOrders'],
				operation: ['editPurchaseOrder'],
			},
		},
		options: [
			{
				displayName: 'Client Notes',
				name: 'clientNotes',
				type: 'string',
				default: '',
				description: 'Notes visible to the supplier',
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
				description: 'Internal notes not visible to the supplier',
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
				description: 'External reference for the purchase order',
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
				resource: ['purchaseOrders'],
				operation: ['editPurchaseOrder'],
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

	// ── List Purchase Order Series (pagination) ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrderSeries'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrderSeries'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrderSeries'],
				returnAll: [false],
			},
		},
	},

	// ── Get Purchase Order Series ──
	{
		displayName: 'Series ID',
		name: 'seriesId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order series to retrieve',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['getPurchaseOrderSeries'],
			},
		},
	},

	// ── List Purchase Order Line Items ──
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order to list line items for',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrderLineItems'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrderLineItems'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrderLineItems'],
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
				resource: ['purchaseOrders'],
				operation: ['listPurchaseOrderLineItems'],
				returnAll: [false],
			},
		},
	},

	// ── Get Purchase Order Line Item ──
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['getPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['getPurchaseOrderLineItem'],
			},
		},
	},

	// ── Create Purchase Order Line Item ──
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['createPurchaseOrderLineItem'],
			},
		},
	},

	// ── Edit Purchase Order Line Item (PATCH) ──
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['editPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['editPurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['editPurchaseOrderLineItem'],
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

	// ── Delete Purchase Order Line Item ──
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the purchase order',
		displayOptions: {
			show: {
				resource: ['purchaseOrders'],
				operation: ['deletePurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: ['deletePurchaseOrderLineItem'],
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
				resource: ['purchaseOrders'],
				operation: [
					'listPurchaseOrders',
					'getPurchaseOrder',
					'listPurchaseOrderSeries',
					'getPurchaseOrderSeries',
					'listPurchaseOrderLineItems',
					'getPurchaseOrderLineItem',
				],
			},
		},
	},
];
