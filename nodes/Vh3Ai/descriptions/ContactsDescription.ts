import type { INodeProperties } from 'n8n-workflow';

export const contactsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contacts'],
			},
		},
		options: [
			{
				name: 'Create Contact',
				value: 'createContact',
				action: 'Create a contact',
				description: 'Create a new customer or site. Requires name, group ID, and lat/lng (lat/lng can be 0 if unknown but must be supplied). Optional address fields and parent contact ID for child sites.',
			},
			{
				name: 'Create Contact Group',
				value: 'createContactGroup',
				action: 'Create a contact group',
				description: 'Create a new contact group (folder/category for customers and sites). Requires only a name.',
			},
			{
				name: 'Edit Contact',
				value: 'editContact',
				action: 'Edit a contact',
				description: 'Update an existing contact (customer or site). Name, group, and lat/lng must be re-supplied even if unchanged. Address fields are optional.',
			},
			{
				name: 'Get Contact',
				value: 'getContact',
				action: 'Get a contact',
				description: 'Get one contact by numeric ID. Returns address, location, custom fields, group, status, parent linkage. Use this when an agent asks "what address is customer X at?" or "tell me about site Y".',
			},
			{
				name: 'Get Contact Group',
				value: 'getContactGroup',
				action: 'Get a contact group',
				description: 'Get one contact group by ID. Use to look up a group\'s name/metadata.',
			},
			{
				name: 'List Contact Groups',
				value: 'listContactGroups',
				action: 'List contact groups',
				description: 'List all contact groups (the categories used to organise customers and sites). Useful for mapping group IDs to names.',
			},
			{
				name: 'List Contacts',
				value: 'listContacts',
				action: 'List or search contacts',
				description: 'Primary search for customers and sites. Filter by name (starts-with), reference, IDs, parent ID, group ID, or status (normal / contactOnStop / creditLimitOnStop). Supports paging. Use this whenever an agent needs to find a contact by name or list customers/sites.',
			},
			{
				name: 'Stop Contact',
				value: 'stopContact',
				action: 'Put contact on stop',
				description: 'Block a customer or site from new jobs/invoices. Choose contactOnStop (general hold) or creditLimitOnStop (account is over credit). Optional reason. Pick whether to cascade to child sites via Applies To.',
			},
			{
				name: 'Unstop Contact',
				value: 'unstopContact',
				action: 'Remove contact from stop',
				description: 'Lift a stop on a customer or site so new jobs/invoices can be raised again. Pick whether to cascade to children via Applies To.',
			},
			{
				name: 'Update Contact Group',
				value: 'updateContactGroup',
				action: 'Update a contact group',
				description: 'Rename an existing contact group. Provide the group ID and the new name.',
			},
		],
		default: 'listContacts',
	},
];

export const contactsFields: INodeProperties[] = [
	// ── Get Contact fields ──
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Numeric BigChange contact ID. Source from List Contacts (contact.id) or any prior step that returned a contact.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getContact'],
			},
		},
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getContact'],
			},
		},
	},

	// ── List Contacts fields ──
	{
		displayName: 'Sort By',
		name: 'sortBy',
		type: 'options',
		options: [
			{ name: 'Created At', value: 'createdAt' },
			{ name: 'Name', value: 'name' },
		],
		default: 'createdAt',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listContacts'],
			},
		},
	},
	{
		displayName: 'Sort Direction',
		name: 'direction',
		type: 'options',
		options: [
			{ name: 'Descending', value: 'descending' },
			{ name: 'Ascending', value: 'ascending' },
		],
		default: 'descending',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listContacts'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listContacts'],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 100,
		description: 'Number of results per page',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listContacts'],
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
				resource: ['contacts'],
				operation: ['listContacts'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listContacts'],
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
				resource: ['contacts'],
				operation: ['listContacts'],
			},
		},
		options: [
			{
				displayName: 'Created From',
				name: 'createdAtFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return contacts created on or after this date',
			},
			{
				displayName: 'Group IDs',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'Filter by contact group IDs (comma-separated, max 50)',
			},
			{
				displayName: 'IDs',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by contact IDs (comma-separated, max 50)',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by contact name (starts-with match)',
			},
			{
				displayName: 'Parent IDs',
				name: 'parentId',
				type: 'string',
				default: '',
				description: 'Filter by parent contact IDs (comma-separated, max 50)',
			},
			{
				displayName: 'References',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Filter by contact references (comma-separated, max 50). E.g. "JobSite/510"',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Normal', value: 'normal' },
					{ name: 'Contact on Stop', value: 'contactOnStop' },
					{ name: 'Credit Limit on Stop', value: 'creditLimitOnStop' },
				],
				default: 'normal',
				description: 'Filter by contact status',
			},
		],
	},

	// ── List Contact Groups fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listContactGroups'],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 100,
		description: 'Number of results per page',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listContactGroups'],
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
				resource: ['contacts'],
				operation: ['listContactGroups'],
				returnAll: [false],
			},
		},
	},

	// ── Create Contact fields ──
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Contact or site name',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['createContact'],
			},
		},
	},
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The contact group ID this contact belongs to',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['createContact'],
			},
		},
	},
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { numberPrecision: 8 },
		description: 'Location latitude',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['createContact'],
			},
		},
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { numberPrecision: 8 },
		description: 'Location longitude',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['createContact'],
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
				resource: ['contacts'],
				operation: ['createContact'],
			},
		},
		options: [
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'Country of the contact address',
			},
			{
				displayName: 'Extra Information',
				name: 'extraInformation',
				type: 'string',
				default: '',
				description: 'Additional notes or information for the contact',
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'number',
				default: 0,
				description: 'Parent contact ID (e.g. link a site to a customer)',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal or ZIP code',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference code for the contact',
			},
			{
				displayName: 'Street',
				name: 'street',
				type: 'string',
				default: '',
				description: 'Street address',
			},
			{
				displayName: 'Town',
				name: 'town',
				type: 'string',
				default: '',
				description: 'Town or city',
			},
		],
	},

	// ── Edit Contact fields ──
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the contact to edit',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['editContact'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Contact or site name',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['editContact'],
			},
		},
	},
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The contact group ID this contact belongs to',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['editContact'],
			},
		},
	},
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { numberPrecision: 8 },
		description: 'Location latitude',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['editContact'],
			},
		},
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { numberPrecision: 8 },
		description: 'Location longitude',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['editContact'],
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
				resource: ['contacts'],
				operation: ['editContact'],
			},
		},
		options: [
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'Country of the contact address',
			},
			{
				displayName: 'Extra Information',
				name: 'extraInformation',
				type: 'string',
				default: '',
				description: 'Additional notes or information for the contact',
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'number',
				default: 0,
				description: 'Parent contact ID (e.g. link a site to a customer)',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal or ZIP code',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference code for the contact',
			},
			{
				displayName: 'Street',
				name: 'street',
				type: 'string',
				default: '',
				description: 'Street address',
			},
			{
				displayName: 'Town',
				name: 'town',
				type: 'string',
				default: '',
				description: 'Town or city',
			},
		],
	},

	// ── Stop Contact fields ──
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the contact to put on stop',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['stopContact'],
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
				resource: ['contacts'],
				operation: ['stopContact'],
			},
		},
		options: [
			{
				displayName: 'Applies To',
				name: 'appliesTo',
				type: 'options',
				options: [
					{ name: 'Contact Only', value: 'contactOnly' },
					{ name: 'Contact and Children', value: 'contactAndChildren' },
				],
				default: 'contactOnly',
				description: 'Whether the stop applies to this contact only or also its children',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Contact on Stop', value: 'contactOnStop' },
					{ name: 'Credit Limit on Stop', value: 'creditLimitOnStop' },
				],
				default: 'contactOnStop',
				description: 'The type of stop to apply',
			},
			{
				displayName: 'Stop Reason',
				name: 'stopReason',
				type: 'string',
				default: '',
				description: 'Reason for putting the contact on stop',
			},
		],
	},

	// ── Unstop Contact fields ──
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the contact to remove from stop',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['unstopContact'],
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
				resource: ['contacts'],
				operation: ['unstopContact'],
			},
		},
		options: [
			{
				displayName: 'Applies To',
				name: 'appliesTo',
				type: 'options',
				options: [
					{ name: 'Contact Only', value: 'contactOnly' },
					{ name: 'Contact and Children', value: 'contactAndChildren' },
				],
				default: 'contactOnly',
				description: 'Whether the unstop applies to this contact only or also its children',
			},
		],
	},

	// ── Get Contact Group fields ──
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the contact group to retrieve',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getContactGroup'],
			},
		},
	},

	// ── Create Contact Group fields ──
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name for the new contact group',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['createContactGroup'],
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
				resource: ['contacts'],
				operation: ['createContactGroup'],
			},
		},
		options: [],
	},

	// ── Update Contact Group fields ──
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the contact group to update',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateContactGroup'],
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
				resource: ['contacts'],
				operation: ['updateContactGroup'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the contact group',
			},
		],
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
				resource: ['contacts'],
				operation: ['getContactGroup', 'listContactGroups'],
			},
		},
	},
];
