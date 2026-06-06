import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Vh3AiApi implements ICredentialType {
	name = 'vh3AiApi';

	displayName = 'VH3 AI API';

	documentationUrl = 'https://docs.vh3.ai';

	icon = 'file:vh3ai.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'New to VH3 AI? <a href="https://vh3.ai/signup/register" target="_blank">Sign up here</a> to create your account and get an API key. Documentation available at <a href="https://docs.vh3.ai" target="_blank">docs.vh3.ai</a>.',
			name: 'signupNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your VH3 AI API key. Find this in your VH3 dashboard under Settings > API Keys, or <a href="https://vh3.ai/signup/register" target="_blank">sign up</a> to get one.',
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
			description: 'Leave as default unless instructed otherwise by VH3 support.',
		},
		{
			displayName: 'FSI Base URL',
			name: 'fsiBaseUrl',
			type: 'string',
			default: 'https://api.vh3connect.io/api:kP8T1CK7',
			required: true,
			description: 'Leave as default unless instructed otherwise by VH3 support.',
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
