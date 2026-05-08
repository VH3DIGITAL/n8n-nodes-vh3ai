import type { INodeProperties } from 'n8n-workflow';

export const fsiBriefingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['briefing'],
			},
		},
		options: [
			{
				name: 'Generate Briefing',
				value: 'generateBriefing',
				action: 'Generate an engineer briefing',
				description: 'Generate a structured pre-visit briefing and AI call script for a field service engineer heading to a job',
			},
		],
		default: 'generateBriefing',
	},
];

export const fsiBriefingFields: INodeProperties[] = [
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the job to brief the engineer on',
		displayOptions: {
			show: {
				resource: ['briefing'],
				operation: ['generateBriefing'],
			},
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Customer contact ID associated with the job',
		displayOptions: {
			show: {
				resource: ['briefing'],
				operation: ['generateBriefing'],
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
				resource: ['briefing'],
				operation: ['generateBriefing'],
			},
		},
		options: [
			{
				displayName: 'Force Regenerate Summary',
				name: 'forceRegenerateSummary',
				type: 'boolean',
				default: false,
				description: 'Whether to bypass the cached Weaviate customer summary and generate a fresh one (adds latency)',
			},
			{
				displayName: 'Job Payload (JSON)',
				name: 'jobPayload',
				type: 'json',
				default: '',
				description: 'Optional raw job data fallback as JSON. Used when the job may not yet be in Neo4j (e.g. poller delay). Ignored if the job is found in Neo4j.',
			},
		],
	},
];
