import type { INodeProperties } from 'n8n-workflow';

const userRoleOptions = [
	{ name: 'Admin', value: 'admin' },
	{ name: 'Manager', value: 'manager' },
	{ name: 'User', value: 'user' },
];

export const fsiUsersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['users'],
			},
		},
		options: [
			{
				name: 'Delete User',
				value: 'deleteUser',
				action: 'Archive a user',
				description: 'Soft-delete (archive) a user from the company',
			},
			{
				name: 'Invite User',
				value: 'inviteUser',
				action: 'Invite a user',
				description: 'Send an email invitation to join the company',
			},
			{
				name: 'List Invites',
				value: 'listInvites',
				action: 'List pending invites',
				description: 'Get all pending (unaccepted) invitations for the company',
			},
			{
				name: 'List Users',
				value: 'listUsers',
				action: 'List users',
				description: 'Get all active users for the company',
			},
			{
				name: 'Update User Role',
				value: 'updateUserRole',
				action: 'Update a user role',
				description: 'Change the role assigned to a user',
			},
		],
		default: 'listUsers',
	},
];

export const fsiUsersFields: INodeProperties[] = [
	// ── Invite User ──
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'name@example.com',
		description: 'Email address to send the invitation to',
		displayOptions: { show: { resource: ['users'], operation: ['inviteUser'] } },
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		required: true,
		options: userRoleOptions,
		default: 'user',
		description: 'Role to assign to the invited user',
		displayOptions: { show: { resource: ['users'], operation: ['inviteUser'] } },
	},
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		required: true,
		default: '',
		description: 'Display name of the company shown in the invite email',
		displayOptions: { show: { resource: ['users'], operation: ['inviteUser'] } },
	},
	{
		displayName: 'Inviter Name',
		name: 'inviterName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the person sending the invitation',
		displayOptions: { show: { resource: ['users'], operation: ['inviteUser'] } },
	},

	// ── Update User Role ──
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the user whose role to update',
		displayOptions: { show: { resource: ['users'], operation: ['updateUserRole'] } },
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		required: true,
		options: userRoleOptions,
		default: 'user',
		description: 'New role to assign',
		displayOptions: { show: { resource: ['users'], operation: ['updateUserRole'] } },
	},

	// ── Delete User ──
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the user to archive',
		displayOptions: { show: { resource: ['users'], operation: ['deleteUser'] } },
	},
];
