import type { INodeProperties } from 'n8n-workflow';

export const fsiAccountReportOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['accountReport'],
			},
		},
		options: [
			{
				name: 'Generate Account Report',
				value: 'generateAccountReport',
				action: 'Generate a monthly account report',
				description: 'Generate a structured monthly account report aggregating jobs across the full parent–child contact hierarchy',
			},
		],
		default: 'generateAccountReport',
	},
];

export const fsiAccountReportFields: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Customer contact ID (parent or child). The report resolves the full account hierarchy automatically.',
		displayOptions: {
			show: {
				resource: ['accountReport'],
				operation: ['generateAccountReport'],
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
				resource: ['accountReport'],
				operation: ['generateAccountReport'],
			},
		},
		options: [
			{
				displayName: 'Month',
				name: 'month',
				type: 'string',
				default: '',
				placeholder: '2026-02',
				description: 'Report month in YYYY-MM format. Defaults to the previous calendar month if omitted.',
			},
			{
				displayName: 'Include Narrative',
				name: 'includeNarrative',
				type: 'boolean',
				default: true,
				description: 'Whether to include an AI-generated narrative summary in the report',
			},
		],
	},
];
