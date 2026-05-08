import type { INodeProperties } from 'n8n-workflow';

export const fsiInvestigateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['investigate'] } },
		options: [
			{ name: 'Run Investigation', value: 'runInvestigation', action: 'Run an investigation', description: 'Multi-step hybrid investigation across vector and graph data' },
		],
		default: 'runInvestigation',
	},
];

export const fsiInvestigateFields: INodeProperties[] = [
	{
		displayName: 'Question',
		name: 'question',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		description: 'The investigation question',
		displayOptions: { show: { resource: ['investigate'], operation: ['runInvestigation'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['investigate'], operation: ['runInvestigation'] } },
		options: [
			{ displayName: 'Max Evidence Items', name: 'maxEvidenceItems', type: 'number', default: 10, description: 'Maximum number of evidence items to collect' },
		],
	},
];
