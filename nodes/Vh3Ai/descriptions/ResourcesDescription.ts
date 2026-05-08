import type { INodeProperties } from 'n8n-workflow';

export const resourcesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['resources'],
			},
		},
		options: [
			{
				name: 'Create Resource',
				value: 'createResource',
				action: 'Create a resource (engineer)',
				description: 'Create a new engineer/technician/operative. Requires name and groupId (team). Optional email, mobile, reference. Returns the new resource ID for use in Schedule Job.',
			},
			{
				name: 'Get Resource',
				value: 'getResource',
				action: 'Get a resource (engineer)',
				description: 'Get one engineer by numeric ID — name, group/team, contact details, reference. Use to look up an engineer\'s profile.',
			},
			{
				name: 'Get Resource Group',
				value: 'getResourceGroup',
				action: 'Get a resource group',
				description: 'Get one resource group (team) by ID. Use to map a group ID to its name.',
			},
			{
				name: 'List Resource Groups',
				value: 'listResourceGroups',
				action: 'List resource groups (teams)',
				description: 'List the teams that engineers belong to (e.g. "North region", "Senior techs"). Use as a lookup before listing/creating resources.',
			},
			{
				name: 'List Resources',
				value: 'listResources',
				action: 'List resources (engineers)',
				description: 'List every engineer/technician/operative on the books. Use whenever an agent needs to find engineers, map names to IDs, or pick someone to assign a job to.',
			},
			{
				name: 'Update Resource',
				value: 'updateResource',
				action: 'Update a resource (engineer)',
				description: 'Update fields on an existing engineer record (name, group/team, email, mobile, reference). Only supplied fields are changed.',
			},
		],
		default: 'listResources',
	},
];

export const resourcesFields: INodeProperties[] = [
	// ── Get Resource fields ──
	{
		displayName: 'Resource ID',
		name: 'resourceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the resource to retrieve',
		displayOptions: {
			show: {
				resource: ['resources'],
				operation: ['getResource'],
			},
		},
	},

	// ── Create Resource fields ──
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the resource to create',
		displayOptions: {
			show: {
				resource: ['resources'],
				operation: ['createResource'],
			},
		},
	},
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The resource group to assign this resource to',
		displayOptions: {
			show: {
				resource: ['resources'],
				operation: ['createResource'],
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
				resource: ['resources'],
				operation: ['createResource'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address of the resource',
			},
			{
				displayName: 'Mobile',
				name: 'mobile',
				type: 'string',
				default: '',
				description: 'Mobile phone number of the resource',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference code for the resource',
			},
		],
	},

	// ── Update Resource fields ──
	{
		displayName: 'Resource ID',
		name: 'resourceId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the resource to update',
		displayOptions: {
			show: {
				resource: ['resources'],
				operation: ['updateResource'],
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
				resource: ['resources'],
				operation: ['updateResource'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Updated name of the resource',
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'number',
				default: 0,
				description: 'Updated resource group assignment',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Updated email address',
			},
			{
				displayName: 'Mobile',
				name: 'mobile',
				type: 'string',
				default: '',
				description: 'Updated mobile phone number',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Updated external reference code',
			},
		],
	},

	// ── Get Resource Group fields ──
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the resource group to retrieve',
		displayOptions: {
			show: {
				resource: ['resources'],
				operation: ['getResourceGroup'],
			},
		},
	},

	// ── List Resources fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['resources'],
				operation: ['listResources'],
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
				resource: ['resources'],
				operation: ['listResources'],
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
				resource: ['resources'],
				operation: ['listResources'],
				returnAll: [false],
			},
		},
	},

	// ── List Resource Groups fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['resources'],
				operation: ['listResourceGroups'],
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
				resource: ['resources'],
				operation: ['listResourceGroups'],
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
				resource: ['resources'],
				operation: ['listResourceGroups'],
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
				resource: ['resources'],
				operation: ['listResources', 'getResource', 'listResourceGroups', 'getResourceGroup'],
			},
		},
	},
];
