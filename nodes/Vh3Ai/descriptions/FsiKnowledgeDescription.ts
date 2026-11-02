import type { INodeProperties } from 'n8n-workflow';

const knowledgeSourceOptions = [
	{ name: 'Account Summaries', value: 'account_summary' },
	{ name: 'Customer Summaries', value: 'customer_summary' },
	{ name: 'Library Documents', value: 'knowledge_document' },
];

export const fsiKnowledgeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['knowledge'] } },
		options: [
			{
				name: 'Delete Document',
				value: 'deleteDocument',
				action: 'Delete a library document',
				description: 'Remove one library document owned by the given member. A document that member does not own fails the item.',
			},
			{
				name: 'Search Knowledge',
				value: 'searchKnowledge',
				action: 'Search knowledge',
				description: 'Search library documents, customer summaries, and account summaries. Leave sources empty to search all three.',
			},
			{
				name: 'Search Library',
				value: 'searchLibrary',
				action: 'Search the library',
				description: 'Search library documents only. Customer and account summaries are not included.',
			},
			{
				name: 'Share Document',
				value: 'shareDocument',
				action: 'Share a library document',
				description: 'Publish or unpublish one library document. The member must be the owner, otherwise the item fails.',
			},
			{
				name: 'Upload Document',
				value: 'uploadDocument',
				action: 'Upload a library document',
				description: 'Upload a PDF into the library for a specific member. Turn Share on to put it in shared documents.',
			},
		],
		default: 'searchKnowledge',
	},
];

export const fsiKnowledgeFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to search for. An empty query is rejected.',
		displayOptions: {
			show: { resource: ['knowledge'], operation: ['searchKnowledge', 'searchLibrary'] },
		},
	},
	{
		displayName: 'Acting User ID',
		name: 'actingUserId',
		type: 'number',
		default: 0,
		description: 'Member whose private documents to include. Leave empty or 0 for shared documents only.',
		displayOptions: {
			show: { resource: ['knowledge'], operation: ['searchKnowledge', 'searchLibrary'] },
		},
	},
	{
		displayName: 'Sources',
		name: 'sources',
		type: 'multiOptions',
		options: knowledgeSourceOptions,
		default: [],
		description: 'Sources to search. Leave empty to search library documents, customer summaries, and account summaries.',
		displayOptions: { show: { resource: ['knowledge'], operation: ['searchKnowledge'] } },
	},
	{
		displayName: 'Sections',
		name: 'sections',
		type: 'string',
		default: '',
		description: 'Comma-separated section keys to search, such as systems_equipment. Leave empty to search every section.',
		displayOptions: { show: { resource: ['knowledge'], operation: ['searchKnowledge'] } },
	},
	{
		displayName: 'Result Limit',
		name: 'resultLimit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 20 },
		default: 10,
		description: 'Maximum number of matches to return. Values outside 1 to 20 are clamped to that range.',
		displayOptions: { show: { resource: ['knowledge'], operation: ['searchKnowledge'] } },
	},
	{
		displayName: 'Result Limit',
		name: 'resultLimit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 10 },
		default: 5,
		description: 'Maximum number of library matches to return. Values outside 1 to 10 are clamped to that range.',
		displayOptions: { show: { resource: ['knowledge'], operation: ['searchLibrary'] } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'Enter the name of the binary property that holds the PDF',
		displayOptions: { show: { resource: ['knowledge'], operation: ['uploadDocument'] } },
	},
	{
		displayName: 'Owner User ID',
		name: 'userId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Enter the member who owns the document',
		displayOptions: {
			show: { resource: ['knowledge'], operation: ['uploadDocument', 'shareDocument', 'deleteDocument'] },
		},
	},
	{
		displayName: 'Share',
		name: 'share',
		type: 'boolean',
		default: false,
		description: 'Whether to place the uploaded document in shared documents. Off leaves it private.',
		displayOptions: { show: { resource: ['knowledge'], operation: ['uploadDocument'] } },
	},
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		default: '',
		description: 'Enter the library document to share or delete',
		displayOptions: {
			show: { resource: ['knowledge'], operation: ['shareDocument', 'deleteDocument'] },
		},
	},
	{
		displayName: 'Share',
		name: 'share',
		type: 'boolean',
		default: false,
		description: 'Whether the document is published to shared documents. Off makes it private to the owner.',
		displayOptions: { show: { resource: ['knowledge'], operation: ['shareDocument'] } },
	},
];
