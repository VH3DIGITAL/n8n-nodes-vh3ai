import type { INodeProperties } from 'n8n-workflow';

const caseStatusOptions = [
	{ name: 'Archived', value: 'archived' },
	{ name: 'Closed', value: 'closed' },
	{ name: 'Draft', value: 'draft' },
	{ name: 'In Progress', value: 'in_progress' },
	{ name: 'Open', value: 'open' },
	{ name: 'Resolved', value: 'resolved' },
	{ name: 'Under Review', value: 'under_review' },
];

const caseTypeOptions = [
	{ name: 'Audit', value: 'audit' },
	{ name: 'Case Study', value: 'case_study' },
	{ name: 'Compliance', value: 'compliance' },
	{ name: 'Incident', value: 'incident' },
	{ name: 'Investigation', value: 'investigation' },
	{ name: 'Project Review', value: 'project_review' },
];

const casePriorityOptions = [
	{ name: 'Critical', value: 'critical' },
	{ name: 'High', value: 'high' },
	{ name: 'Low', value: 'low' },
	{ name: 'Medium', value: 'medium' },
];

const actorTypeOptions = [
	{ name: 'Agent', value: 'agent' },
	{ name: 'System', value: 'system' },
	{ name: 'User', value: 'user' },
];

const itemTypeOptions = [
	{ name: 'Customer', value: 'customer' },
	{ name: 'Document', value: 'document' },
	{ name: 'Engineer', value: 'engineer' },
	{ name: 'Job', value: 'job' },
	{ name: 'Job Group', value: 'job_group' },
	{ name: 'Note', value: 'note' },
	{ name: 'Site', value: 'site' },
];

export const participantRoleOptions = [
	{ name: 'Contributor', value: 'contributor' },
	{ name: 'Investigator', value: 'investigator' },
	{ name: 'Observer', value: 'observer' },
	{ name: 'Owner', value: 'owner' },
	{ name: 'Reviewer', value: 'reviewer' },
];

const actorIdDescription =
	'Connect user ID when Actor Type is user. Omit or set to 0 to use the tenant API-key owner.';

export const fsiCasesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['cases'],
			},
		},
		options: [
			{
				name: 'Add Case Item',
				value: 'addCaseItem',
				action: 'Link an item to a case',
				description: 'Link a job, customer, site, engineer, or other record to a case',
			},
			{
				name: 'Add Comment',
				value: 'addComment',
				action: 'Add a comment to a case',
				description: 'Add a comment to a case activity timeline',
			},
			{
				name: 'Add Participant',
				value: 'addParticipant',
				action: 'Add a participant to a case',
				description: 'Add a user as a participant. Roles are owner, investigator, reviewer, observer, and contributor.',
			},
			{
				name: 'Assign Team',
				value: 'assignTeam',
				action: 'Assign a team to a case',
				description: 'Assign or clear the Case Assigned Team. Pass Team ID 0 to clear.',
			},
			{
				name: 'Create Case',
				value: 'createCase',
				action: 'Create a case',
				description: 'Create a new case in draft with title, type, and optional priority, tags, and metadata',
			},
			{
				name: 'Get Case',
				value: 'getCase',
				action: 'Get a case',
				description: 'Get a single case with participants, items, and latest activity',
			},
			{
				name: 'List Activity',
				value: 'listActivity',
				action: 'List case activity',
				description: 'Get the activity timeline for a case, paginated with newest first',
			},
			{
				name: 'List Case Items',
				value: 'listCaseItems',
				action: 'List case items',
				description: 'List all items linked to a case, optionally filtered by item type',
			},
			{
				name: 'List Cases',
				value: 'listCases',
				action: 'List cases',
				description: 'List cases for a company with filtering and pagination. Sorting is server-side. Omitted Scope, Sort, and Order use the FSI API defaults.',
			},
			{
				name: 'List Cases for Item',
				value: 'listCasesForItem',
				action: 'Find cases for an item',
				description: 'Reverse lookup — find all cases that reference a specific job, customer, site, or other item',
			},
			{
				name: 'Remove Case Item',
				value: 'removeCaseItem',
				action: 'Remove an item from a case',
				description: 'Unlink an item from a case',
			},
			{
				name: 'Remove Participant',
				value: 'removeParticipant',
				action: 'Remove a participant from a case',
				description: 'Remove a participant from a case',
			},
			{
				name: 'Search Cases',
				value: 'searchCases',
				action: 'Search cases',
				description: 'Full-text search across case titles and descriptions with optional filters',
			},
			{
				name: 'Transition Case',
				value: 'transitionCase',
				action: 'Transition case status',
				description: 'Transition a case to a new status with lifecycle validation',
			},
			{
				name: 'Update Case',
				value: 'updateCase',
				action: 'Update a case',
				description: 'Update selected case fields. Unselected fields are preserved. Adding an empty clearable field clears the current value. Actor ID is a Connect user ID; omit or 0 uses the API-key owner.',
			},
		],
		default: 'listCases',
	},
];

export const fsiCasesFields: INodeProperties[] = [
	// ── Create Case ──
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		description: 'Short descriptive case title',
		displayOptions: { show: { resource: ['cases'], operation: ['createCase'] } },
	},
	{
		displayName: 'Type',
		name: 'caseType',
		type: 'options',
		required: true,
		options: caseTypeOptions,
		default: 'incident',
		description: 'Case classification type',
		displayOptions: { show: { resource: ['cases'], operation: ['createCase'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['createCase'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is creating the case' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Detailed case narrative' },
			{ displayName: 'Due Date', name: 'dueDate', type: 'dateTime', default: '', description: 'Optional case deadline' },
			{ displayName: 'Metadata (JSON)', name: 'metadata', type: 'json', default: '{}', description: 'Extensible key-value store for custom data' },
			{ displayName: 'Priority', name: 'priority', type: 'options', options: casePriorityOptions, default: 'medium', description: 'Case priority level' },
			{ displayName: 'Tags (JSON)', name: 'tags', type: 'json', default: '[]', description: 'Array of strings for flexible categorisation' },
		],
	},

	// ── List Cases ──
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['listCases'] } },
		options: [
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				description: 'Server-side sort direction. Omitted uses the FSI API default of desc.',
			},
			{ displayName: 'Owner ID', name: 'ownerId', type: 'number', default: 0, description: 'Filter by case owner user ID' },
			{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number for pagination' },
			{ displayName: 'Per Page', name: 'perPage', type: 'number', default: 25, description: 'Items per page' },
			{ displayName: 'Priority', name: 'priority', type: 'options', options: casePriorityOptions, default: '', description: 'Filter by priority' },
			{
				displayName: 'Scope',
				name: 'scope',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'All', value: 'all' },
					{ name: 'Closed', value: 'closed' },
				],
				default: 'all',
				description: 'Lifecycle set requested from FSI. Omitted uses the FSI API default of all statuses. Exact Status still overrides Scope.',
			},
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search term to match against title and description' },
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'created_at' },
					{ name: 'ID', value: 'id' },
					{ name: 'Last Activity At', value: 'last_activity_at' },
					{ name: 'Updated At', value: 'updated_at' },
				],
				default: 'updated_at',
				description: 'Server-side sort field. Omitted uses the FSI API default of updated_at.',
			},
			{ displayName: 'Status', name: 'status', type: 'options', options: caseStatusOptions, default: '', description: 'Filter by case status' },
			{ displayName: 'Type', name: 'type', type: 'options', options: caseTypeOptions, default: '', description: 'Filter by case type' },
		],
	},

	// ── Search Cases ──
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		description: 'Search query to match against case titles and descriptions',
		displayOptions: { show: { resource: ['cases'], operation: ['searchCases'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['searchCases'] } },
		options: [
			{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number' },
			{ displayName: 'Per Page', name: 'perPage', type: 'number', default: 25, description: 'Items per page' },
			{ displayName: 'Priority', name: 'priority', type: 'options', options: casePriorityOptions, default: '', description: 'Filter by priority' },
			{ displayName: 'Status', name: 'status', type: 'options', options: caseStatusOptions, default: '', description: 'Filter by status' },
			{ displayName: 'Type', name: 'type', type: 'options', options: caseTypeOptions, default: '', description: 'Filter by type' },
		],
	},

	// ── Get Case ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case to retrieve',
		displayOptions: { show: { resource: ['cases'], operation: ['getCase'] } },
	},

	// ── Update Case ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case to update',
		displayOptions: { show: { resource: ['cases'], operation: ['updateCase'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['updateCase'] } },
		description: 'Fields to change. Unselected fields are preserved. An added empty Description, Resolution, Tags, or Metadata, or Clear Due Date, clears the current value.',
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is performing the update' },
			{ displayName: 'Clear Due Date', name: 'clearDueDate', type: 'boolean', default: false, description: 'Whether to clear the case deadline by sending due_date as null. Takes precedence over Due Date.' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Updated case description. An empty value clears the current description.' },
			{ displayName: 'Due Date', name: 'dueDate', type: 'dateTime', default: '', description: 'Updated deadline. Use Clear Due Date to remove it; an empty value is not sent.' },
			{ displayName: 'Metadata (JSON)', name: 'metadata', type: 'json', default: '{}', description: 'Updated metadata object. An empty object clears current metadata.' },
			{ displayName: 'Priority', name: 'priority', type: 'options', options: casePriorityOptions, default: 'medium', description: 'Updated priority' },
			{ displayName: 'Resolution', name: 'resolution', type: 'string', default: '', description: 'Resolution summary. An empty value clears the current resolution.' },
			{ displayName: 'Tags (JSON)', name: 'tags', type: 'json', default: '[]', description: 'Updated tags array. An empty array clears all tags.' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Updated case title. Empty or whitespace-only titles are rejected.' },
			{ displayName: 'Type', name: 'type', type: 'options', options: caseTypeOptions, default: 'incident', description: 'Updated case type' },
		],
	},

	// ── Transition Case ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case to transition',
		displayOptions: { show: { resource: ['cases'], operation: ['transitionCase'] } },
	},
	{
		displayName: 'Target Status',
		name: 'targetStatus',
		type: 'options',
		required: true,
		options: caseStatusOptions,
		default: 'open',
		description: 'The target status to transition to',
		displayOptions: { show: { resource: ['cases'], operation: ['transitionCase'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['transitionCase'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is performing the transition' },
			{ displayName: 'Comment', name: 'comment', type: 'string', default: '', description: 'Optional comment explaining the transition' },
		],
	},

	// ── Add Comment ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['addComment'] } },
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		required: true,
		default: '',
		description: 'The comment text',
		displayOptions: { show: { resource: ['cases'], operation: ['addComment'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['addComment'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is adding the comment' },
		],
	},

	// ── List Activity ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['listActivity'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['listActivity'] } },
		options: [
			{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number' },
			{ displayName: 'Per Page', name: 'perPage', type: 'number', default: 25, description: 'Items per page' },
		],
	},

	// ── List Case Items ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['listCaseItems'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['listCaseItems'] } },
		options: [
			{ displayName: 'Item Type', name: 'itemType', type: 'options', options: itemTypeOptions, default: '', description: 'Filter by item type' },
		],
	},

	// ── Add Case Item ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['addCaseItem'] } },
	},
	{
		displayName: 'Item Type',
		name: 'itemType',
		type: 'options',
		required: true,
		options: itemTypeOptions,
		default: 'job',
		description: 'Type of record to link',
		displayOptions: { show: { resource: ['cases'], operation: ['addCaseItem'] } },
	},
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		required: true,
		default: '',
		description: 'External ID of the record',
		displayOptions: { show: { resource: ['cases'], operation: ['addCaseItem'] } },
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		default: '',
		description: 'Human-readable name for display',
		displayOptions: { show: { resource: ['cases'], operation: ['addCaseItem'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['addCaseItem'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is linking the item' },
			{ displayName: 'Context', name: 'context', type: 'string', default: '', description: 'Why this item is being added' },
			{ displayName: 'Metadata (JSON)', name: 'metadata', type: 'json', default: '{}', description: 'Type-specific extra data' },
		],
	},

	// ── Remove Case Item ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['removeCaseItem'] } },
	},
	{
		displayName: 'Item Record ID',
		name: 'itemRecordId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case_item record to remove',
		displayOptions: { show: { resource: ['cases'], operation: ['removeCaseItem'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['removeCaseItem'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is removing the item' },
		],
	},

	// ── Add Participant ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['addParticipant'] } },
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the user to add as participant',
		displayOptions: { show: { resource: ['cases'], operation: ['addParticipant'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['addParticipant'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is adding the participant' },
			{ displayName: 'Role', name: 'role', type: 'options', options: participantRoleOptions, default: 'contributor', description: 'Role of the participant. Exactly owner, investigator, reviewer, observer, or contributor.' },
		],
	},

	// ── Remove Participant ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['removeParticipant'] } },
	},
	{
		displayName: 'Participant Record ID',
		name: 'participantRecordId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case_participant record to remove',
		displayOptions: { show: { resource: ['cases'], operation: ['removeParticipant'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['removeParticipant'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is removing the participant' },
		],
	},

	// ── Assign Team ──
	{
		displayName: 'Case ID',
		name: 'caseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the case',
		displayOptions: { show: { resource: ['cases'], operation: ['assignTeam'] } },
	},
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'number',
		default: 0,
		description: 'Team to assign. Set to 0 or leave blank to clear the Assigned Team.',
		displayOptions: { show: { resource: ['cases'], operation: ['assignTeam'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['cases'], operation: ['assignTeam'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: actorIdDescription },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is assigning the team' },
		],
	},

	// ── List Cases for Item ──
	{
		displayName: 'Item Type',
		name: 'itemType',
		type: 'options',
		required: true,
		options: itemTypeOptions,
		default: 'job',
		description: 'Type of item to look up',
		displayOptions: { show: { resource: ['cases'], operation: ['listCasesForItem'] } },
	},
	{
		displayName: 'External ID',
		name: 'externalId',
		type: 'string',
		required: true,
		default: '',
		description: 'External ID of the item',
		displayOptions: { show: { resource: ['cases'], operation: ['listCasesForItem'] } },
	},
];
