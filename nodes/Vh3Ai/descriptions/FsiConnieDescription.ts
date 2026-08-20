import type { INodeProperties } from 'n8n-workflow';

export const fsiConnieOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['connie'] } },
		options: [
			{ name: 'Chat', value: 'connieChat', action: 'Chat with Connie', description: 'Send a message to the Connie AI assistant' },
			{ name: 'Generate Summary', value: 'connieGenerateSummary', action: 'Generate a contact summary', description: 'Generate a Connie AI summary for a contact' },
			{ name: 'Get Session Messages', value: 'connieGetSessionMessages', action: 'Get session messages', description: 'Get messages for a specific chat session' },
			{ name: 'List Sessions', value: 'connieListSessions', action: 'List chat sessions', description: 'List Connie chat sessions for a user or contact' },
			{ name: 'Search History', value: 'connieSearchHistory', action: 'Search chat history', description: 'Search across Connie conversation history' },
		],
		default: 'connieChat',
	},
];

export const fsiConnieFields: INodeProperties[] = [
	// ── Chat ──
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		description: 'The message to send to Connie',
		displayOptions: { show: { resource: ['connie'], operation: ['connieChat'] } },
	},
	{
		displayName: 'Experimental Mode',
		name: 'experimentalMode',
		type: 'boolean',
		default: false,
		description: 'Whether to use the experimental Connie pipeline (/connie/experimental/chat)',
		displayOptions: { show: { resource: ['connie'], operation: ['connieChat'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['connie'], operation: ['connieChat'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '', description: 'CRM contact ID for tenant-scoped lookups' },
			{ displayName: 'Current Job Reference', name: 'currentJobReference', type: 'string', default: '', description: 'Job reference for contextual queries' },
			{ displayName: 'Session ID', name: 'sessionId', type: 'string', default: '', description: 'Existing session ID to continue a conversation' },
			{ displayName: 'Summary', name: 'summary', type: 'string', typeOptions: { rows: 4 }, default: '', description: 'Pre-generated customer summary to seed a new session' },
			{ displayName: 'User Company Name', name: 'userCompanyName', type: 'string', default: '', description: 'Company name for agent context' },
			{ displayName: 'User ID', name: 'userId', type: 'string', default: '', description: 'VH3 user identifier' },
			{ displayName: 'User Name', name: 'userName', type: 'string', default: '', description: 'Display name shown to the agent' },
		],
	},

	// ── List Sessions ──
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['connie'], operation: ['connieListSessions'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '', description: 'Filter by contact ID' },
			{ displayName: 'Limit', name: 'limit', type: 'number', default: 25, description: 'Maximum number of sessions to return' },
			{ displayName: 'User ID', name: 'userId', type: 'string', default: '', description: 'Filter by user ID' },
		],
	},

	// ── Generate Summary ──
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'Contact identifier to generate a summary for',
		displayOptions: { show: { resource: ['connie'], operation: ['connieGenerateSummary'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['connie'], operation: ['connieGenerateSummary'] } },
		options: [
			{ displayName: 'Industry', name: 'industry', type: 'string', default: '', description: 'Industry context for summary generation' },
		],
	},

	// ── Get Session Messages ──
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The session ID to retrieve messages for',
		displayOptions: { show: { resource: ['connie'], operation: ['connieGetSessionMessages'] } },
	},

	// ── Search History ──
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		description: 'Search query to match across conversation history',
		displayOptions: { show: { resource: ['connie'], operation: ['connieSearchHistory'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['connie'], operation: ['connieSearchHistory'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '', description: 'Filter by contact ID' },
			{ displayName: 'Limit', name: 'limit', type: 'number', default: 25, description: 'Maximum number of results' },
			{ displayName: 'User ID', name: 'userId', type: 'string', default: '', description: 'Filter by user ID' },
		],
	},
];
