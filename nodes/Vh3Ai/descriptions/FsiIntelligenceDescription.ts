import type { INodeProperties } from 'n8n-workflow';

export const fsiIntelligenceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['intelligence'] } },
		options: [
			{ name: 'Generate Profiles', value: 'generateProfiles', action: 'Generate intelligence profiles', description: 'Generate or regenerate intelligence profiles for a tenant' },
			{ name: 'Get Profile', value: 'getProfile', action: 'Get a job type profile', description: 'Get intelligence profile for a specific job type' },
			{ name: 'List Profiles', value: 'listProfiles', action: 'List intelligence profiles', description: 'List all intelligence profiles for a tenant' },
		],
		default: 'listProfiles',
	},
];

export const fsiIntelligenceFields: INodeProperties[] = [
	{
		displayName: 'Profiled Only',
		name: 'profiledOnly',
		type: 'boolean',
		default: true,
		description: 'Whether to return only types that have a generated profile (filters out items where profile is null)',
		displayOptions: { show: { resource: ['intelligence'], operation: ['listProfiles'] } },
	},
	{
		displayName: 'Type ID',
		name: 'typeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The job type ID to get the profile for',
		displayOptions: { show: { resource: ['intelligence'], operation: ['getProfile'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['intelligence'], operation: ['generateProfiles'] } },
		options: [
			{ displayName: 'Scope', name: 'scope', type: 'string', default: '', description: 'Generation scope' },
			{ displayName: 'Type IDs (JSON)', name: 'typeIds', type: 'json', default: '[]', description: 'Array of type IDs to generate profiles for' },
		],
	},
];
