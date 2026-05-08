import type { INodeProperties } from 'n8n-workflow';

export const notesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['notes'],
			},
		},
		options: [
			{
				name: 'Create Note',
				value: 'createNote',
				action: 'Create a note',
				description: 'Attach a note/task/comment to an entity. Requires entityType (job, contact, person, etc.), entityId, typeId (from List Note Types), and a subject. Optional description, dueAt (UTC), status, owner. Use for follow-ups, customer comms log, internal flags.',
			},
			{
				name: 'Create Progress Update',
				value: 'createProgressUpdate',
				action: 'Create a progress update',
				description: 'Append a progress comment to an existing note (does not modify the original). Use for status updates on tasks/follow-ups.',
			},
			{
				name: 'Edit Note',
				value: 'editNote',
				action: 'Edit a note',
				description: 'Update an existing note. All core fields (entityType, entityId, typeId, subject) must be re-supplied. Use to change status, due date, ownership, or content.',
			},
			{
				name: 'Get Note',
				value: 'getNote',
				action: 'Get a note',
				description: 'Get a single note by numeric ID — entity link, subject, description, status, owner, due date.',
			},
			{
				name: 'Get Note Type',
				value: 'getNoteType',
				action: 'Get a note type',
				description: 'Get one note type by ID. Use to map a note type ID to its display name and configuration.',
			},
			{
				name: 'List Note Types',
				value: 'listNoteTypes',
				action: 'List note types',
				description: 'List the available note types (categories). Required reference data before creating notes — pick the right typeId from here.',
			},
			{
				name: 'List Notes',
				value: 'listNotes',
				action: 'List or search notes',
				description: 'List notes. Filter by entityType + entityId (e.g. all notes on job 123), typeId(s), status, contactId, sort. Use to surface follow-ups, callback queues, or audit trails.',
			},
		],
		default: 'listNotes',
	},
];

export const notesFields: INodeProperties[] = [
	// ── List Notes fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['listNotes'],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 1000 },
		default: 100,
		description: 'Number of results per page',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['listNotes'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page to retrieve (1-based)',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['listNotes'],
				returnAll: [false],
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
				resource: ['notes'],
				operation: ['listNotes'],
			},
		},
		options: [
			{
				displayName: 'Contact IDs',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter by contact IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'ascending' },
					{ name: 'Descending', value: 'descending' },
				],
				default: 'descending',
				description: 'Sort direction',
			},
			{
				displayName: 'Entity IDs',
				name: 'entityId',
				type: 'string',
				default: '',
				description: 'Filter by entity IDs (comma-separated for multiple, max 50)',
			},
			{
				displayName: 'Entity Type',
				name: 'entityType',
				type: 'options',
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'Job', value: 'job' },
					{ name: 'Resource', value: 'resource' },
					{ name: 'Stock Item', value: 'stockItem' },
					{ name: 'Vehicle', value: 'vehicle' },
				],
				default: 'job',
				description: 'Filter by entity type',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Due At', value: 'dueAt' },
					{ name: 'Status', value: 'status' },
				],
				default: 'createdAt',
				description: 'Field to sort results by',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Open', value: 'open' },
				],
				default: 'open',
				description: 'Filter by note status',
			},
			{
				displayName: 'Type IDs',
				name: 'typeId',
				type: 'string',
				default: '',
				description: 'Filter by note type IDs (comma-separated for multiple, max 50)',
			},
		],
	},

	// ── Get Note fields ──
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the note to retrieve',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['getNote'],
			},
		},
	},

	// ── Create Note fields ──
	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Contact', value: 'contact' },
			{ name: 'Job', value: 'job' },
			{ name: 'Resource', value: 'resource' },
			{ name: 'Stock Item', value: 'stockItem' },
			{ name: 'Vehicle', value: 'vehicle' },
		],
		default: 'job',
		description: 'The type of entity this note is attached to',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['createNote'],
			},
		},
	},
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the entity this note is attached to',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['createNote'],
			},
		},
	},
	{
		displayName: 'Type ID',
		name: 'typeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The note type ID',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['createNote'],
			},
		},
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		default: '',
		description: 'Subject line of the note',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['createNote'],
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
				resource: ['notes'],
				operation: ['createNote'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the note',
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
				description: 'Due date for the note',
			},
			{
				displayName: 'Owned By User ID',
				name: 'ownedByUserId',
				type: 'number',
				default: 0,
				description: 'User ID of the note owner',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference for the note',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Open', value: 'open' },
				],
				default: 'open',
				description: 'Status of the note',
			},
		],
	},

	// ── Edit Note fields ──
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the note to edit',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['editNote'],
			},
		},
	},
	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Contact', value: 'contact' },
			{ name: 'Job', value: 'job' },
			{ name: 'Resource', value: 'resource' },
			{ name: 'Stock Item', value: 'stockItem' },
			{ name: 'Vehicle', value: 'vehicle' },
		],
		default: 'job',
		description: 'The type of entity this note is attached to',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['editNote'],
			},
		},
	},
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the entity this note is attached to',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['editNote'],
			},
		},
	},
	{
		displayName: 'Type ID',
		name: 'typeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The note type ID',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['editNote'],
			},
		},
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		default: '',
		description: 'Subject line of the note',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['editNote'],
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
				resource: ['notes'],
				operation: ['editNote'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the note',
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
				description: 'Due date for the note',
			},
			{
				displayName: 'Owned By User ID',
				name: 'ownedByUserId',
				type: 'number',
				default: 0,
				description: 'User ID of the note owner',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference for the note',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Open', value: 'open' },
				],
				default: 'open',
				description: 'Status of the note',
			},
		],
	},

	// ── Create Progress Update fields ──
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the note to add a progress update to',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['createProgressUpdate'],
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
				resource: ['notes'],
				operation: ['createProgressUpdate'],
			},
		},
		options: [
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				default: '',
				description: 'Comment text for the progress update',
			},
		],
	},

	// ── List Note Types fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['listNoteTypes'],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 1000 },
		default: 100,
		description: 'Number of results per page',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['listNoteTypes'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page to retrieve (1-based)',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['listNoteTypes'],
				returnAll: [false],
			},
		},
	},
	// ── Get Note Type fields ──
	{
		displayName: 'Note Type ID',
		name: 'noteTypeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the note type to retrieve',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['getNoteType'],
			},
		},
	},
	// ── Simplify (compact response) toggle ──
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description: 'Whether to return a simplified (compact) version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['notes'],
				operation: ['listNotes', 'getNote', 'listNoteTypes', 'getNoteType'],
			},
		},
	},
];
