import type { INodeProperties } from 'n8n-workflow';

export const flagsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['flag'],
			},
		},
		options: [
			{
				name: 'Add Flag',
				value: 'addFlag',
				action: 'Add a flag to an entity',
				description:
					'Apply a flag definition to a single-active-flag BigChange entity (note, job, invoice, job group, purchase order, quote, or sales opportunity). Replaces the active flag and appends to flag history.',
			},
			{
				name: 'Add Person Flag',
				value: 'addPersonFlag',
				action: 'Add a flag to a person',
				description:
					'Add a contactUser flag tag to a person by person UUID and flag definition ID. Persons support multiple simultaneous flags and this operation is idempotent.',
			},
			{
				name: 'Apply Flag to Job Group Jobs',
				value: 'applyJobGroupJobFlag',
				action: 'Apply a flag to job group jobs',
				description:
					'Apply a job flag definition in bulk to every job belonging to the specified job group. Use a job flag definition ID from List Flag Definitions (entityType=job).',
			},
			{
				name: 'Delete Flag',
				value: 'deleteFlag',
				action: 'Delete a flag from an entity',
				description:
					'Delete a flag record from a single-active-flag BigChange entity using the flag history record ID (historyId), NOT the flag definition ID. Obtain historyId from Get Active Flag or List Flag History.',
			},
			{
				name: 'Get Active Flag',
				value: 'getActiveFlag',
				action: 'Get the active flag for an entity',
				description:
					'Retrieve the currently active flag for a single BigChange entity (note, job, invoice, job group, purchase order, quote, or sales opportunity)',
			},
			{
				name: 'List Flag Definitions',
				value: 'listDefinitions',
				action: 'List flag definitions',
				description:
					'List configured BigChange flag definitions (flag type IDs, names, colors, entity types). Use this first to discover valid flagId values before adding or applying flags.',
			},
			{
				name: 'List Flag History',
				value: 'listFlagHistory',
				action: 'List flag history for an entity',
				description:
					'List the full flag change history for a single BigChange entity. Returns history record IDs needed by Delete Flag.',
			},
			{
				name: 'List Job Group Job Flag History',
				value: 'listJobGroupJobFlagHistory',
				action: 'List job group job flag history',
				description: 'List the flag history across all jobs within a specified job group',
			},
			{
				name: 'List Job Group Job Flags',
				value: 'listJobGroupJobFlags',
				action: 'List job group job flags',
				description: 'List the currently active flags for all jobs within a specified job group',
			},
			{
				name: 'List Person Flags',
				value: 'listPersonFlags',
				action: 'List person flags',
				description:
					'List all flags currently applied to a person by person UUID. Persons use a multi-tag model rather than a single active flag.',
			},
			{
				name: 'Remove Person Flag',
				value: 'removePersonFlag',
				action: 'Remove a flag from a person',
				description:
					'Remove a flag tag from a person using the person UUID and the flag definition ID (flagId for contactUser), NOT a history record ID',
			},
		],
		default: 'listDefinitions',
	},
];

export const flagsFields: INodeProperties[] = [
	// ── List Flag Definitions optional filters ──
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['listDefinitions'],
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
				displayName: 'Entity Type',
				name: 'entityType',
				type: 'options',
				options: [
					{ name: 'App Payment', value: 'appPayment' },
					{ name: 'Asset Defect', value: 'assetDefect' },
					{ name: 'Contact Note', value: 'contactNote' },
					{ name: 'Contact Note Priority', value: 'contactNotePriority' },
					{ name: 'Contact User (Person)', value: 'contactUser' },
					{ name: 'Credit Note', value: 'creditNote' },
					{ name: 'Default Invoice Item', value: 'defInvoiceItem' },
					{ name: 'Delivery Note', value: 'deliveryNote' },
					{ name: 'Invoice', value: 'invoice' },
					{ name: 'Job', value: 'job' },
					{ name: 'Job Group', value: 'jobGroup' },
					{ name: 'Proforma', value: 'proforma' },
					{ name: 'Purchase Order', value: 'purchaseOrder' },
					{ name: 'Quote', value: 'quote' },
					{ name: 'Sales Opportunity', value: 'salesOpportunity' },
					{ name: 'Sales Order', value: 'salesOrder' },
				],
				default: 'job',
				description: 'Filter flag definitions to a specific BigChange entity type',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Name', value: 'name' },
				],
				default: 'name',
				description: 'Field to sort flag definitions by',
			},
		],
	},

	// ── Single-Active-Flag Entity Selector & Entity ID ──
	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Invoice', value: 'invoice' },
			{ name: 'Job', value: 'job' },
			{ name: 'Job Group', value: 'jobGroup' },
			{ name: 'Note', value: 'note' },
			{ name: 'Purchase Order', value: 'purchaseOrder' },
			{ name: 'Quote', value: 'quote' },
			{ name: 'Sales Opportunity', value: 'salesOpportunity' },
		],
		default: 'job',
		description: 'The BigChange entity type that owns the flag',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['getActiveFlag', 'listFlagHistory', 'addFlag', 'deleteFlag'],
			},
		},
	},
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'number',
		required: true,
		default: 0,
		description:
			'Numeric ID of the target entity (noteId, jobId, invoiceId, jobGroupId, purchaseOrderId, quoteId, or opportunityId)',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['getActiveFlag', 'listFlagHistory', 'addFlag', 'deleteFlag'],
			},
		},
	},

	// ── Job Group Bulk Job Flags Group ID ──
	{
		displayName: 'Job Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Numeric ID of the job group whose member jobs will be queried or flagged',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: [
					'listJobGroupJobFlags',
					'listJobGroupJobFlagHistory',
					'applyJobGroupJobFlag',
				],
			},
		},
	},

	// ── Person Flags Person UUID ──
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID of the person (contactUser) in BigChange',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['listPersonFlags', 'addPersonFlag', 'removePersonFlag'],
			},
		},
	},

	// ── Flag Definition ID (Add Flag / Apply to Job Group Jobs) ──
	{
		displayName: 'Flag Definition ID',
		name: 'flagId',
		type: 'number',
		required: true,
		default: 0,
		description:
			'Numeric ID of the flag definition to apply (obtain from List Flag Definitions for the matching entityType)',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['addFlag', 'applyJobGroupJobFlag'],
			},
		},
	},

	// ── Flag Definition ID (Person Flags — Multi-Tag Model) ──
	{
		displayName: 'Flag Definition ID',
		name: 'flagId',
		type: 'number',
		required: true,
		default: 0,
		description:
			'Numeric flag definition (type) ID for entityType=contactUser from List Flag Definitions — NOT a history record ID',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['addPersonFlag', 'removePersonFlag'],
			},
		},
	},

	// ── Flag History Record ID (Delete Entity Flag) ──
	{
		displayName: 'Flag History ID',
		name: 'historyId',
		type: 'number',
		required: true,
		default: 0,
		description:
			'Numeric flag history record ID to delete — NOT the flag definition ID. Obtain from Get Active Flag or List Flag History (sent as jobFlagId for jobs and flagId for other entities).',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['deleteFlag'],
			},
		},
	},

	// ── Optional Owner & Comments for Add Flag / Apply to Job Group Jobs ──
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: ['addFlag', 'applyJobGroupJobFlag'],
			},
		},
		options: [
			{
				displayName: 'Comments',
				name: 'comments',
				type: 'string',
				default: '',
				description: 'Optional comment explaining why the flag was applied',
			},
			{
				displayName: 'Owner',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'Optional owner identifier or name associated with the flag',
			},
		],
	},

	// ── Shared Pagination (Return All + Limit) ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: [
					'listDefinitions',
					'listFlagHistory',
					'listJobGroupJobFlags',
					'listJobGroupJobFlagHistory',
					'listPersonFlags',
				],
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
				resource: ['flag'],
				operation: [
					'listDefinitions',
					'listFlagHistory',
					'listJobGroupJobFlags',
					'listJobGroupJobFlagHistory',
					'listPersonFlags',
				],
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
		description:
			'Whether to return a simplified (compact) version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['flag'],
				operation: [
					'listDefinitions',
					'getActiveFlag',
					'listFlagHistory',
					'listJobGroupJobFlags',
					'listJobGroupJobFlagHistory',
					'listPersonFlags',
				],
			},
		},
	},
];
