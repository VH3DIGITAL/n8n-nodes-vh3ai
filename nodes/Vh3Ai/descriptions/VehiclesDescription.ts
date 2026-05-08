import type { INodeProperties } from 'n8n-workflow';

export const vehiclesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vehicles'],
			},
		},
		options: [
			{
				name: 'Create Vehicle',
				value: 'createVehicle',
				action: 'Create a vehicle',
				description: 'Add a new vehicle to the fleet. Requires groupId, vehicleType (e.g. van, car, truck), registration. Optional make, model, registrationYear, reference, fixedResourceId (driver).',
			},
			{
				name: 'Get Vehicle',
				value: 'getVehicle',
				action: 'Get a vehicle',
				description: 'Get one vehicle by numeric ID — registration, make, model, year, group, fixed driver. Use to look up a vehicle from a job.',
			},
			{
				name: 'List Vehicles',
				value: 'listVehicles',
				action: 'List vehicles',
				description: 'List all fleet vehicles. Use as a lookup before scheduling jobs to a vehicle, or to find the registration/make of an asset.',
			},
			{
				name: 'Update Vehicle',
				value: 'updateVehicle',
				action: 'Update a vehicle',
				description: 'Update fields on a vehicle (group, type, registration, make, model, year, reference, fixed driver). Only supplied fields change.',
			},
		],
		default: 'listVehicles',
	},
];

export const vehiclesFields: INodeProperties[] = [
	// ── Get Vehicle fields ──
	{
		displayName: 'Vehicle ID',
		name: 'vehicleId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the vehicle to retrieve',
		displayOptions: {
			show: {
				resource: ['vehicles'],
				operation: ['getVehicle'],
			},
		},
	},

	// ── Create Vehicle fields ──
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The vehicle group to assign this vehicle to',
		displayOptions: {
			show: {
				resource: ['vehicles'],
				operation: ['createVehicle'],
			},
		},
	},
	{
		displayName: 'Vehicle Type',
		name: 'vehicleType',
		type: 'options',
		required: true,
		default: 'car',
		description: 'The type of vehicle',
		displayOptions: {
			show: {
				resource: ['vehicles'],
				operation: ['createVehicle'],
			},
		},
		options: [
			{ name: 'Motorcycle', value: 'motorcycle' },
			{ name: 'Car', value: 'car' },
			{ name: 'Trailer', value: 'trailer' },
			{ name: 'Bus', value: 'bus' },
			{ name: 'Emergency', value: 'emergency' },
			{ name: 'Goods Less 7.5T', value: 'goodsLess7_5T' },
			{ name: 'Goods More 7.5T', value: 'goodsMore7_5T' },
			{ name: 'Bus Less 12', value: 'busLess12' },
		],
	},
	{
		displayName: 'Registration',
		name: 'registration',
		type: 'string',
		required: true,
		default: '',
		description: 'The registration plate of the vehicle',
		displayOptions: {
			show: {
				resource: ['vehicles'],
				operation: ['createVehicle'],
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
				resource: ['vehicles'],
				operation: ['createVehicle'],
			},
		},
		options: [
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				description: 'The make of the vehicle',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				description: 'The model of the vehicle',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference code for the vehicle',
			},
			{
				displayName: 'Registration Year',
				name: 'registrationYear',
				type: 'number',
				default: 0,
				description: 'The year the vehicle was registered',
			},
			{
				displayName: 'Fixed Resource ID',
				name: 'fixedResourceId',
				type: 'number',
				default: 0,
				description: 'The ID of the resource permanently assigned to this vehicle',
			},
		],
	},

	// ── Update Vehicle fields ──
	{
		displayName: 'Vehicle ID',
		name: 'vehicleId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the vehicle to update',
		displayOptions: {
			show: {
				resource: ['vehicles'],
				operation: ['updateVehicle'],
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
				resource: ['vehicles'],
				operation: ['updateVehicle'],
			},
		},
		options: [
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'number',
				default: 0,
				description: 'Updated vehicle group assignment',
			},
			{
				displayName: 'Vehicle Type',
				name: 'vehicleType',
				type: 'options',
				default: 'car',
				description: 'Updated vehicle type',
				options: [
					{ name: 'Motorcycle', value: 'motorcycle' },
					{ name: 'Car', value: 'car' },
					{ name: 'Trailer', value: 'trailer' },
					{ name: 'Bus', value: 'bus' },
					{ name: 'Emergency', value: 'emergency' },
					{ name: 'Goods Less 7.5T', value: 'goodsLess7_5T' },
					{ name: 'Goods More 7.5T', value: 'goodsMore7_5T' },
					{ name: 'Bus Less 12', value: 'busLess12' },
				],
			},
			{
				displayName: 'Registration',
				name: 'registration',
				type: 'string',
				default: '',
				description: 'Updated registration plate',
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				description: 'Updated make of the vehicle',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				description: 'Updated model of the vehicle',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Updated external reference code',
			},
			{
				displayName: 'Registration Year',
				name: 'registrationYear',
				type: 'number',
				default: 0,
				description: 'Updated registration year',
			},
			{
				displayName: 'Fixed Resource ID',
				name: 'fixedResourceId',
				type: 'number',
				default: 0,
				description: 'Updated fixed resource assignment',
			},
		],
	},

	// ── List Vehicles fields ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given page size',
		displayOptions: {
			show: {
				resource: ['vehicles'],
				operation: ['listVehicles'],
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
				resource: ['vehicles'],
				operation: ['listVehicles'],
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
				resource: ['vehicles'],
				operation: ['listVehicles'],
				returnAll: [false],
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
				resource: ['vehicles'],
				operation: ['listVehicles', 'getVehicle'],
			},
		},
	},
];
