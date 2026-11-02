import type { INodeProperties } from 'n8n-workflow';

export const fsiGraphOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['graph'] } },
		options: [
			{
				name: 'List Presets',
				value: 'listGraphPresets',
				action: 'List graph presets',
				description: 'List the named graph queries you can run, including the filters each one accepts',
			},
			{
				name: 'Run Query',
				value: 'runGraphQuery',
				action: 'Run a graph query',
				description: 'Run one named graph query. Pass a preset from List Presets and optional filters.',
			},
		],
		default: 'listGraphPresets',
	},
];

export const fsiGraphFields: INodeProperties[] = [
	{
		displayName: 'Preset',
		name: 'preset',
		type: 'string',
		required: true,
		default: '',
		description: 'Named graph query to run. Use List Presets to see the available names.',
		displayOptions: { show: { resource: ['graph'], operation: ['runGraphQuery'] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'json',
		default: '{}',
		description: 'Optional filters for the preset. Leave empty to run the preset without filters.',
		displayOptions: { show: { resource: ['graph'], operation: ['runGraphQuery'] } },
	},
];
