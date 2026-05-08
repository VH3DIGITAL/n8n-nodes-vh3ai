import type { INodeProperties } from 'n8n-workflow';

export const worksheetGroupsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['worksheetGroups'],
			},
		},
		options: [
			{
				name: 'Get Worksheet Group',
				value: 'getWorksheetGroup',
				action: 'Get a worksheet group',
				description: 'Get one worksheet group (folder) by numeric ID. Use to map a group ID to its name.',
			},
			{
				name: 'List Worksheet Groups',
				value: 'listWorksheetGroups',
				action: 'List worksheet groups',
				description: 'List the folders that organise worksheet templates. Use as a lookup before browsing worksheet definitions.',
			},
		],
		default: 'listWorksheetGroups',
	},
];

export const worksheetGroupsFields: INodeProperties[] = [
	// ── Get Worksheet Group fields ──
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the worksheet group to retrieve',
		displayOptions: {
			show: {
				resource: ['worksheetGroups'],
				operation: ['getWorksheetGroup'],
			},
		},
	},

	// ── List Worksheet Groups fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['worksheetGroups'],
				operation: ['listWorksheetGroups'],
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
				resource: ['worksheetGroups'],
				operation: ['listWorksheetGroups'],
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
				resource: ['worksheetGroups'],
				operation: ['listWorksheetGroups'],
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
				resource: ['worksheetGroups'],
				operation: ['listWorksheetGroups', 'getWorksheetGroup'],
			},
		},
	},
];
