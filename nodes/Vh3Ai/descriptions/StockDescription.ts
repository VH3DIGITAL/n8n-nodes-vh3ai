import type { INodeProperties } from 'n8n-workflow';

export const stockOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['stock'],
			},
		},
		options: [
			{
				name: 'Create Stock Details',
				value: 'createStockDetails',
				action: 'Create a stock product definition',
				description: 'Create a new stock product (SKU/template). Requires model and productCategoryId. Optional make, stockCode, batchNumber, isConsumable. This is the catalogue entry, NOT a physical unit — use Create Stock Item for those.',
			},
			{
				name: 'Create Stock Item',
				value: 'createStockItem',
				action: 'Create a stock item',
				description: 'Create a physical stock unit (instance of a product). Requires stockDetailsId, model, productCategoryId. Optional serial number, condition, location contact, quantity. Use to register newly received inventory.',
			},
			{
				name: 'Get Product Category',
				value: 'getProductCategory',
				action: 'Get a product category',
				description: 'Get one product category by numeric ID. Use to map a category ID to a name when displaying stock.',
			},
			{
				name: 'Get Stock Details',
				value: 'getStockDetails',
				action: 'Get a stock product (SKU)',
				description: 'Get one stock product definition by stockDetailsId — model, make, stock code, category, suppliers reference.',
			},
			{
				name: 'Get Stock Item',
				value: 'getStockItem',
				action: 'Get a stock item',
				description: 'Get one physical stock unit by stockItemId — serial number, condition, current location, quantity.',
			},
			{
				name: 'Get Stock Supplier',
				value: 'getStockSupplier',
				action: 'Get a stock supplier',
				description: 'Get one supplier link for a stock product. Needs both stockDetailsId and stockSupplierId.',
			},
			{
				name: 'List Product Categories',
				value: 'listProductCategories',
				action: 'List product categories',
				description: 'List stock product categories (the top-level taxonomy of inventory). Filter by name (starts-with).',
			},
			{
				name: 'List Stock Details',
				value: 'listStockDetails',
				action: 'List stock products (SKUs)',
				description: 'List stock product definitions. Filter by productCategoryId(s), stockCode(s), or isConsumable. Use to browse the SKU catalogue.',
			},
			{
				name: 'List Stock Items',
				value: 'listStockItems',
				action: 'List stock items',
				description: 'List physical stock units. Filter by stockDetailsId(s), serialNumber, or current locationContactId. Use to find what physical units exist of a given product or what\'s currently at a location.',
			},
			{
				name: 'List Stock Movements',
				value: 'listStockMovements',
				action: 'List stock movements',
				description: 'List stock movement history (pickups/drop-offs). Filter by date ranges (pickUpAtFrom/To, dropOffAtFrom/To), jobId, stockDetailsId, stockItemId, vehicleId, dropOffContactId, dropOffVehicleId. Use for inventory audits and "where did this part go?" queries.',
			},
			{
				name: 'List Stock Suppliers',
				value: 'listStockSuppliers',
				action: 'List stock suppliers',
				description: 'List suppliers linked to a specific stock product. Requires stockDetailsId.',
			},
			{
				name: 'Update Stock Details',
				value: 'updateStockDetails',
				action: 'Update a stock product (SKU)',
				description: 'Update fields on an existing stock product definition (model, category, make, stockCode, batchNumber, isConsumable).',
			},
			{
				name: 'Update Stock Item',
				value: 'updateStockItem',
				action: 'Update a stock item',
				description: 'Update fields on a physical stock unit (serial number, make, notes, quantity, location contact, condition).',
			},
		],
		default: 'listStockItems',
	},
];

export const stockFields: INodeProperties[] = [
	// ── List Product Categories fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['listProductCategories'],
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
				resource: ['stock'],
				operation: ['listProductCategories'],
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
				resource: ['stock'],
				operation: ['listProductCategories'],
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
				resource: ['stock'],
				operation: ['listProductCategories'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by category name',
			},
		],
	},

	// ── List Stock Details fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['listStockDetails'],
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
				resource: ['stock'],
				operation: ['listStockDetails'],
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
				resource: ['stock'],
				operation: ['listStockDetails'],
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
				resource: ['stock'],
				operation: ['listStockDetails'],
			},
		},
		options: [
			{
				displayName: 'Is Consumable',
				name: 'isConsumable',
				type: 'boolean',
				default: false,
				description: 'Filter by consumable flag',
			},
			{
				displayName: 'Product Category IDs',
				name: 'productCategoryId',
				type: 'string',
				default: '',
				description: 'Filter by product category IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Stock Codes',
				name: 'stockCode',
				type: 'string',
				default: '',
				description: 'Filter by stock codes (comma-separated for multiple, max 50)',
			},
		],
	},

	// ── Get Stock Details fields ──
	{
		displayName: 'Stock Details ID',
		name: 'stockDetailsId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the stock product definition',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['getStockDetails'],
			},
		},
	},

	// ── Create Stock Details fields ──
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		required: true,
		default: '',
		description: 'Model name of the stock product',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['createStockDetails'],
			},
		},
	},
	{
		displayName: 'Product Category ID',
		name: 'productCategoryId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Product category ID for the stock product',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['createStockDetails'],
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
				resource: ['stock'],
				operation: ['createStockDetails'],
			},
		},
		options: [
			{
				displayName: 'Batch Number',
				name: 'batchNumber',
				type: 'string',
				default: '',
				description: 'Batch number for the stock product',
			},
			{
				displayName: 'Is Consumable',
				name: 'isConsumable',
				type: 'boolean',
				default: false,
				description: 'Whether this product is a consumable',
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				description: 'Manufacturer or make',
			},
			{
				displayName: 'Stock Code',
				name: 'stockCode',
				type: 'string',
				default: '',
				description: 'Unique stock code identifier',
			},
		],
	},

	// ── Update Stock Details fields ──
	{
		displayName: 'Stock Details ID',
		name: 'stockDetailsId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the stock product definition to update',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['updateStockDetails'],
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
				resource: ['stock'],
				operation: ['updateStockDetails'],
			},
		},
		options: [
			{
				displayName: 'Batch Number',
				name: 'batchNumber',
				type: 'string',
				default: '',
				description: 'Batch number for the stock product',
			},
			{
				displayName: 'Is Consumable',
				name: 'isConsumable',
				type: 'boolean',
				default: false,
				description: 'Whether this product is a consumable',
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				description: 'Manufacturer or make',
			},
			{
				displayName: 'Stock Code',
				name: 'stockCode',
				type: 'string',
				default: '',
				description: 'Unique stock code identifier',
			},
		],
	},

	// ── List Stock Items fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['listStockItems'],
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
				resource: ['stock'],
				operation: ['listStockItems'],
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
				resource: ['stock'],
				operation: ['listStockItems'],
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
				resource: ['stock'],
				operation: ['listStockItems'],
			},
		},
		options: [
			{
				displayName: 'Location Contact ID',
				name: 'locationContactId',
				type: 'number',
				default: 0,
				description: 'Filter by location contact ID',
			},
			{
				displayName: 'Serial Number',
				name: 'serialNumber',
				type: 'string',
				default: '',
				description: 'Filter by serial number',
			},
			{
				displayName: 'Stock Details IDs',
				name: 'stockDetailsId',
				type: 'string',
				default: '',
				description: 'Filter by stock product definition IDs (comma-separated for multiple, max 50)',
			},
		],
	},

	// ── Get Stock Item fields ──
	{
		displayName: 'Stock Item ID',
		name: 'stockItemId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the stock item',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['getStockItem'],
			},
		},
	},

	// ── Create Stock Item fields ──
	{
		displayName: 'Stock Details ID',
		name: 'stockDetailsId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The stock product definition ID',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['createStockItem'],
			},
		},
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		required: true,
		default: '',
		description: 'Model name of the stock item',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['createStockItem'],
			},
		},
	},
	{
		displayName: 'Product Category ID',
		name: 'productCategoryId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Product category ID',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['createStockItem'],
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
				resource: ['stock'],
				operation: ['createStockItem'],
			},
		},
		options: [
			{
				displayName: 'Condition',
				name: 'condition',
				type: 'options',
				options: [
					{ name: 'New', value: 'new' },
					{ name: 'Refurbished', value: 'refurbished' },
					{ name: 'Used', value: 'used' },
				],
				default: 'new',
				description: 'Condition of the stock item',
			},
			{
				displayName: 'Location Contact ID',
				name: 'locationContactId',
				type: 'number',
				default: 0,
				description: 'Contact ID of the current location',
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				description: 'Manufacturer or make',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes about the stock item',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
				description: 'Quantity of the stock item',
			},
			{
				displayName: 'Serial Number',
				name: 'serialNumber',
				type: 'string',
				default: '',
				description: 'Serial number of the stock item',
			},
		],
	},

	// ── Update Stock Item fields ──
	{
		displayName: 'Stock Item ID',
		name: 'stockItemId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the stock item to update',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['updateStockItem'],
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
				resource: ['stock'],
				operation: ['updateStockItem'],
			},
		},
		options: [
			{
				displayName: 'Condition',
				name: 'condition',
				type: 'options',
				options: [
					{ name: 'New', value: 'new' },
					{ name: 'Refurbished', value: 'refurbished' },
					{ name: 'Used', value: 'used' },
				],
				default: 'new',
				description: 'Condition of the stock item',
			},
			{
				displayName: 'Location Contact ID',
				name: 'locationContactId',
				type: 'number',
				default: 0,
				description: 'Contact ID of the current location',
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				description: 'Manufacturer or make',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes about the stock item',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
				description: 'Quantity of the stock item',
			},
			{
				displayName: 'Serial Number',
				name: 'serialNumber',
				type: 'string',
				default: '',
				description: 'Serial number of the stock item',
			},
		],
	},

	// ── List Stock Movements fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['listStockMovements'],
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
				resource: ['stock'],
				operation: ['listStockMovements'],
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
				resource: ['stock'],
				operation: ['listStockMovements'],
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
				resource: ['stock'],
				operation: ['listStockMovements'],
			},
		},
		options: [
			{
				displayName: 'Drop-Off From',
				name: 'dropOffAtFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return movements where drop-off date is on or after this UTC date',
			},
			{
				displayName: 'Drop-Off To',
				name: 'dropOffAtTo',
				type: 'dateTime',
				default: '',
				description: 'Only return movements where drop-off date is on or before this UTC date',
			},
			{
				displayName: 'Drop-Off Contact IDs',
				name: 'dropOffContactId',
				type: 'string',
				default: '',
				description: 'Filter by drop-off contact IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Drop-Off Vehicle IDs',
				name: 'dropOffVehicleId',
				type: 'string',
				default: '',
				description: 'Filter by drop-off vehicle IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Job IDs',
				name: 'jobId',
				type: 'string',
				default: '',
				description: 'Filter by job IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Pickup From',
				name: 'pickupAtFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return movements where pickup date is on or after this UTC date',
			},
			{
				displayName: 'Pickup To',
				name: 'pickupAtTo',
				type: 'dateTime',
				default: '',
				description: 'Only return movements where pickup date is on or before this UTC date',
			},
			{
				displayName: 'Stock Details IDs',
				name: 'stockDetailsId',
				type: 'string',
				default: '',
				description: 'Filter by stock product definition IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Stock Item IDs',
				name: 'stockItemId',
				type: 'string',
				default: '',
				description: 'Filter by stock item IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Vehicle IDs',
				name: 'vehicleId',
				type: 'string',
				default: '',
				description: 'Filter by vehicle IDs (comma-separated for multiple, max 50)',
			},
		],
	},

	// ── List Stock Suppliers fields ──
	{
		displayName: 'Stock Details ID',
		name: 'stockDetailsId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The stock product definition ID to list suppliers for',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['listStockSuppliers'],
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
				resource: ['stock'],
				operation: ['listStockSuppliers'],
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
				resource: ['stock'],
				operation: ['listStockSuppliers'],
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
				resource: ['stock'],
				operation: ['listStockSuppliers'],
				returnAll: [false],
			},
		},
	},
	// ── Get Product Category fields ──
	{
		displayName: 'Product Category ID',
		name: 'productCategoryId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the product category to retrieve',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['getProductCategory'],
			},
		},
	},

	// ── Get Stock Supplier fields ──
	{
		displayName: 'Stock Details ID',
		name: 'stockDetailsId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The stock product the supplier is associated with',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['getStockSupplier'],
			},
		},
	},
	{
		displayName: 'Stock Supplier ID',
		name: 'stockSupplierId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the stock supplier to retrieve',
		displayOptions: {
			show: {
				resource: ['stock'],
				operation: ['getStockSupplier'],
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
				resource: ['stock'],
				operation: ['listProductCategories', 'listStockDetails', 'getStockDetails', 'listStockItems', 'getStockItem', 'listStockMovements', 'listStockSuppliers', 'getProductCategory', 'getStockSupplier'],
			},
		},
	},
];
