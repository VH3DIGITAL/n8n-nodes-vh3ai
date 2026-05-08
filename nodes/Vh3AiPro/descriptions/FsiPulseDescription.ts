import type { INodeProperties } from 'n8n-workflow';

export const fsiPulseOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['pulse'] } },
		options: [
			{
				name: 'Get Pulse',
				value: 'getPulse',
				action: 'Get tenant pulse',
				description: 'Get a cached business-health dashboard snapshot with pipeline, performance, workforce, and asset metrics',
			},
		],
		default: 'getPulse',
	},
];

export const fsiPulseFields: INodeProperties[] = [];
