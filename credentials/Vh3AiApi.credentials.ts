import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Vh3AiApi implements ICredentialType {
	name = 'vh3AiApi';

	displayName = 'VH3 AI API';

	documentationUrl = 'https://vh3.ai/docs';

	icon = 'file:vh3ai.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your VH3 AI API key',
		},
		{
			displayName: 'Company ID',
			name: 'companyId',
			type: 'string',
			default: '',
			description:
				'Your tenant/company ID — required for operations that retrieve a single record (e.g. Get Job)',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.vh3connect.io',
			required: true,
			description: 'Base URL of the VH3 Connect API gateway',
		},
		{
			displayName: 'FSI Base URL',
			name: 'fsiBaseUrl',
			type: 'string',
			default: 'https://api.vh3connect.io/api:kP8T1CK7',
			required: true,
			description: 'Base URL of the VH3 Field Service Intelligence API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api:YdihQNr3/resource_groups/list',
			method: 'POST',
			body: JSON.stringify({ pageNumber: 1, pageSize: 1 }),
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};
}
