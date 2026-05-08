import type { INodeProperties } from 'n8n-workflow';

export const jobGroupsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['jobGroups'],
			},
		},
		options: [
			{
				name: 'Create Job Group',
				value: 'createJobGroup',
				action: 'Create a job group',
				description: 'Create a job group (a folder/project that links multiple jobs together, e.g. a multi-day install). Requires contactId, isShownOnDevice, areJobsLinked, plannedStartOption, plannedEndOption. Optional title, planned start/end (UTC), category, order number.',
			},
			{
				name: 'Edit Job Group',
				value: 'editJobGroup',
				action: 'Edit a job group',
				description: 'Update fields on an existing job group (title, order number, planned start/end, category).',
			},
			{
				name: 'Get Job Group',
				value: 'getJobGroup',
				action: 'Get a job group',
				description: 'Get one job group by numeric ID — title, customer, planned dates, status, member jobs.',
			},
			{
				name: 'List Job Group Status History',
				value: 'listJobGroupStatusHistory',
				action: 'List job group status history',
				description: 'Audit trail of status changes on a job group. Use to debug why a multi-job project is stuck.',
			},
			{
				name: 'List Job Groups',
				value: 'listJobGroups',
				action: 'List or search job groups',
				description: 'List job groups (multi-job projects). Sort by created/title. Use for project pipeline views.',
			},
			{
				name: 'Mark Job Group Complete',
				value: 'markJobGroupComplete',
				action: 'Mark a job group as complete',
				description: 'Force every job in the group into a "completed" state. Use when an entire multi-job project is done in one go (not common — usually each job is closed individually).',
			},
			{
				name: 'Mark Job Group Financially Complete',
				value: 'markJobGroupFinanciallyComplete',
				action: 'Mark a job group as financially complete',
				description: 'Lock the job group for finance — signals invoicing is finished. After this, no further invoices can be raised against the group.',
			},
		],
		default: 'listJobGroups',
	},
];

export const jobGroupsFields: INodeProperties[] = [
	// ── List Job Groups fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['listJobGroups'],
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
				resource: ['jobGroups'],
				operation: ['listJobGroups'],
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
				resource: ['jobGroups'],
				operation: ['listJobGroups'],
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
				resource: ['jobGroups'],
				operation: ['listJobGroups'],
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
				default: 'descending',
				description: 'Sort direction',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Name', value: 'name' },
				],
				default: 'createdAt',
				description: 'Field to sort results by',
			},
		],
	},

	// ── Get Job Group fields ──
	{
		displayName: 'Job Group ID',
		name: 'jobGroupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job group to retrieve',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['getJobGroup'],
			},
		},
	},

	// ── Create Job Group fields ──
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The contact ID for the job group',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['createJobGroup'],
			},
		},
	},
	{
		displayName: 'Is Shown on Device',
		name: 'isShownOnDevice',
		type: 'boolean',
		required: true,
		default: true,
		description: 'Whether the job group is visible on mobile devices',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['createJobGroup'],
			},
		},
	},
	{
		displayName: 'Are Jobs Linked',
		name: 'areJobsLinked',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Whether jobs in the group are linked together',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['createJobGroup'],
			},
		},
	},
	{
		displayName: 'Planned Start Option',
		name: 'plannedStartOption',
		type: 'options',
		required: true,
		options: [
			{ name: 'Date of First Job', value: 'dateOfFirstJob' },
			{ name: 'On Set Date', value: 'onSetDate' },
		],
		default: 'onSetDate',
		description: 'How the planned start date is determined',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['createJobGroup'],
			},
		},
	},
	{
		displayName: 'Planned End Option',
		name: 'plannedEndOption',
		type: 'options',
		required: true,
		options: [
			{ name: 'Date of Last Job', value: 'dateOfLastJob' },
			{ name: 'On Set Date', value: 'onSetDate' },
		],
		default: 'onSetDate',
		description: 'How the planned end date is determined',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['createJobGroup'],
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
				resource: ['jobGroups'],
				operation: ['createJobGroup'],
			},
		},
		options: [
			{
				displayName: 'Category ID',
				name: 'categoryId',
				type: 'number',
				default: 0,
				description: 'Category ID for the job group',
			},
			{
				displayName: 'Order Number',
				name: 'orderNumber',
				type: 'string',
				default: '',
				description: 'Order number or purchase order reference',
			},
			{
				displayName: 'Planned End At',
				name: 'plannedEndAt',
				type: 'dateTime',
				default: '',
				description: 'Planned end date and time',
			},
			{
				displayName: 'Planned Start At',
				name: 'plannedStartAt',
				type: 'dateTime',
				default: '',
				description: 'Planned start date and time',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title for the job group',
			},
		],
	},

	// ── Edit Job Group fields ──
	{
		displayName: 'Job Group ID',
		name: 'jobGroupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job group to edit',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['editJobGroup'],
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
				resource: ['jobGroups'],
				operation: ['editJobGroup'],
			},
		},
		options: [
			{
				displayName: 'Category ID',
				name: 'categoryId',
				type: 'number',
				default: 0,
				description: 'Category ID for the job group',
			},
			{
				displayName: 'Order Number',
				name: 'orderNumber',
				type: 'string',
				default: '',
				description: 'Order number or purchase order reference',
			},
			{
				displayName: 'Planned End At',
				name: 'plannedEndAt',
				type: 'dateTime',
				default: '',
				description: 'Planned end date and time',
			},
			{
				displayName: 'Planned Start At',
				name: 'plannedStartAt',
				type: 'dateTime',
				default: '',
				description: 'Planned start date and time',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title for the job group',
			},
		],
	},

	// ── Mark Job Group Complete fields ──
	{
		displayName: 'Job Group ID',
		name: 'jobGroupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job group to mark as complete',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['markJobGroupComplete'],
			},
		},
	},

	// ── Mark Job Group Financially Complete fields ──
	{
		displayName: 'Job Group ID',
		name: 'jobGroupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job group to mark as financially complete',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['markJobGroupFinanciallyComplete'],
			},
		},
	},

	// ── List Job Group Status History fields ──
	{
		displayName: 'Job Group ID',
		name: 'jobGroupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job group to list status history for',
		displayOptions: {
			show: {
				resource: ['jobGroups'],
				operation: ['listJobGroupStatusHistory'],
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
				resource: ['jobGroups'],
				operation: ['listJobGroupStatusHistory'],
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
				resource: ['jobGroups'],
				operation: ['listJobGroupStatusHistory'],
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
				resource: ['jobGroups'],
				operation: ['listJobGroupStatusHistory'],
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
				resource: ['jobGroups'],
				operation: ['listJobGroups', 'getJobGroup', 'listJobGroupStatusHistory'],
			},
		},
	},
];
