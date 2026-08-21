import type { INodeProperties } from 'n8n-workflow';

const actorTypeOptions = [
	{ name: 'Agent', value: 'agent' },
	{ name: 'System', value: 'system' },
	{ name: 'User', value: 'user' },
];

const teamMemberRoleOptions = [
	{ name: 'Lead', value: 'lead' },
	{ name: 'Member', value: 'member' },
	{ name: 'Observer', value: 'observer' },
	{ name: 'Owner', value: 'owner' },
];

const teamEntityTypeOptions = [
	{ name: 'Case', value: 'case' },
	{ name: 'Customer', value: 'customer' },
	{ name: 'Document', value: 'document' },
	{ name: 'Engineer', value: 'engineer' },
	{ name: 'Job', value: 'job' },
	{ name: 'Job Group', value: 'job_group' },
	{ name: 'Note', value: 'note' },
	{ name: 'Site', value: 'site' },
];

export const fsiTeamsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['teams'] } },
		options: [
			{
				name: 'Add Entity',
				value: 'addTeamEntity',
				action: 'Link an entity to a team',
				description: 'Link a job, customer, site, engineer, or other record to a team',
			},
			{
				name: 'Add Member',
				value: 'addTeamMember',
				action: 'Add a member to a team',
				description: 'Add a user to a team with a specified role',
			},
			{
				name: 'Create Team',
				value: 'createTeam',
				action: 'Create a team',
				description: 'Create a new team with name and optional purpose, description, and metadata',
			},
			{
				name: 'Get Team',
				value: 'getTeam',
				action: 'Get a team',
				description: 'Get a single team with its members and entity links',
			},
			{
				name: 'List Entities',
				value: 'listTeamEntities',
				action: 'List team entities',
				description: 'List records linked to a team, optionally filtered by entity type',
			},
			{
				name: 'List Members',
				value: 'listTeamMembers',
				action: 'List team members',
				description: 'List all members of a team',
			},
			{
				name: 'List Teams',
				value: 'listTeams',
				action: 'List teams',
				description: 'List teams for the company with optional purpose and name filters',
			},
			{
				name: 'List Teams for Entity',
				value: 'listTeamsForEntity',
				action: 'Find teams for an entity',
				description: 'Reverse lookup — find all teams that include a specific job, customer, site, or other entity',
			},
			{
				name: 'Remove Entity',
				value: 'removeTeamEntity',
				action: 'Unlink an entity from a team',
				description: 'Remove a linked entity from a team',
			},
			{
				name: 'Remove Member',
				value: 'removeTeamMember',
				action: 'Remove a member from a team',
				description: 'Remove a membership record from a team',
			},
			{
				name: 'Search Teams',
				value: 'searchTeams',
				action: 'Search teams',
				description: 'Full-text search across team names and descriptions',
			},
			{
				name: 'Update Team',
				value: 'updateTeam',
				action: 'Update a team',
				description: 'Update team fields — only provided fields are changed',
			},
		],
		default: 'listTeams',
	},
];

export const fsiTeamsFields: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Team name',
		displayOptions: { show: { resource: ['teams'], operation: ['createTeam'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['teams'], operation: ['createTeam'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: 'User ID of the actor (defaults to API key owner)' },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is creating the team' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Roles, responsibilities, and purpose' },
			{ displayName: 'Metadata (JSON)', name: 'metadata', type: 'json', default: '{}', description: 'Extensible team configuration' },
			{ displayName: 'Purpose', name: 'purpose', type: 'string', default: '', description: 'Primary function of the team' },
		],
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['teams'], operation: ['listTeams'] } },
		options: [
			{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number for pagination' },
			{ displayName: 'Per Page', name: 'perPage', type: 'number', default: 20, description: 'Items per page' },
			{ displayName: 'Purpose', name: 'purpose', type: 'string', default: '', description: 'Filter by team purpose' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search teams by name' },
		],
	},

	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		description: 'Search query to match against team name or description',
		displayOptions: { show: { resource: ['teams'], operation: ['searchTeams'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['teams'], operation: ['searchTeams'] } },
		options: [
			{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number' },
			{ displayName: 'Per Page', name: 'perPage', type: 'number', default: 20, description: 'Items per page' },
		],
	},

	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the team',
		displayOptions: {
			show: {
				resource: ['teams'],
				operation: [
					'getTeam',
					'updateTeam',
					'listTeamMembers',
					'addTeamMember',
					'removeTeamMember',
					'listTeamEntities',
					'addTeamEntity',
					'removeTeamEntity',
				],
			},
		},
	},

	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['teams'], operation: ['updateTeam'] } },
		options: [
			{ displayName: 'Active', name: 'isActive', type: 'boolean', default: true, description: 'Whether the team is active' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Updated team description' },
			{ displayName: 'Metadata (JSON)', name: 'metadata', type: 'json', default: '{}', description: 'Updated metadata object' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Updated team name' },
			{ displayName: 'Purpose', name: 'purpose', type: 'string', default: '', description: 'Updated team purpose' },
		],
	},

	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the user to add as a member',
		displayOptions: { show: { resource: ['teams'], operation: ['addTeamMember'] } },
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		required: true,
		options: teamMemberRoleOptions,
		default: 'member',
		description: 'Role of the member in the team',
		displayOptions: { show: { resource: ['teams'], operation: ['addTeamMember'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['teams'], operation: ['addTeamMember'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: 'User ID of the actor' },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is adding the member' },
			{ displayName: 'Default Team', name: 'isDefaultTeam', type: 'boolean', default: false, description: "Whether this is the member's default team" },
		],
	},

	{
		displayName: 'Membership ID',
		name: 'membershipId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the team membership record to remove',
		displayOptions: { show: { resource: ['teams'], operation: ['removeTeamMember'] } },
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['teams'], operation: ['listTeamEntities'] } },
		options: [
			{ displayName: 'Entity Type', name: 'entityType', type: 'string', default: '', description: 'Filter by entity type (job, customer, site, engineer, job_group, document, note, case)' },
		],
	},

	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'options',
		required: true,
		options: teamEntityTypeOptions,
		default: 'job',
		description: 'Type of record to link',
		displayOptions: { show: { resource: ['teams'], operation: ['addTeamEntity'] } },
	},
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the record to link',
		displayOptions: { show: { resource: ['teams'], operation: ['addTeamEntity'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['teams'], operation: ['addTeamEntity'] } },
		options: [
			{ displayName: 'Actor ID', name: 'actorId', type: 'number', default: 0, description: 'User ID of the actor' },
			{ displayName: 'Actor Type', name: 'actorType', type: 'options', options: actorTypeOptions, default: 'user', description: 'Who is linking the entity' },
			{ displayName: 'Context', name: 'context', type: 'string', default: '', description: 'Why this entity is being added' },
			{ displayName: 'Label', name: 'label', type: 'string', default: '', description: 'Human-readable name for display' },
			{ displayName: 'Metadata (JSON)', name: 'metadata', type: 'json', default: '{}', description: 'Type-specific extra data' },
		],
	},

	{
		displayName: 'Link ID',
		name: 'linkId',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the entity-link record to remove',
		displayOptions: { show: { resource: ['teams'], operation: ['removeTeamEntity'] } },
	},

	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'options',
		required: true,
		options: teamEntityTypeOptions,
		default: 'job',
		description: 'Type of entity to look up',
		displayOptions: { show: { resource: ['teams'], operation: ['listTeamsForEntity'] } },
	},
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the entity',
		displayOptions: { show: { resource: ['teams'], operation: ['listTeamsForEntity'] } },
	},
];
