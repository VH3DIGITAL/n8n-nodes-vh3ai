import type { INodeProperties } from 'n8n-workflow';

export const fsiSalmaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['salma'] } },
		options: [
			{
				name: 'Generate Estimate',
				value: 'generateEstimate',
				action: 'Generate a SALMA estimate',
				description: 'Run a Quote Run estimate for a job and send it to the supplied recipients',
			},
		],
		default: 'generateEstimate',
	},
];

export const fsiSalmaFields: INodeProperties[] = [
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'BigChange job ID to estimate',
		displayOptions: { show: { resource: ['salma'], operation: ['generateEstimate'] } },
	},
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'ops@example.com',
		description: 'One or more recipient email addresses. Never filled from the site contact.',
		displayOptions: { show: { resource: ['salma'], operation: ['generateEstimate'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['salma'], operation: ['generateEstimate'] } },
		options: [
			{ displayName: 'Additional Guidance', name: 'additionalGuidance', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Optional free-text guidance. Ignored if blank.' },
			{ displayName: 'Contact ID', name: 'contactId', type: 'number', default: 0, description: 'Optional customer contact ID (parity with briefing)' },
			{ displayName: 'Job Payload (JSON)', name: 'jobPayload', type: 'json', default: '{}', description: 'Optional poller-delay job payload fallback' },
			{ displayName: 'Rate Set Contact ID', name: 'rateSetContactId', type: 'number', default: 0, description: 'Optional explicit rate-set contact. Zero is ignored.' },
		],
	},
];
