import type { INodeProperties } from 'n8n-workflow';

export const fsiWeatherOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['weather'] } },
		options: [
			{ name: 'Get Forecast', value: 'getForecast', action: 'Get weather forecast', description: 'Get a weather forecast for a latitude/longitude' },
			{ name: 'Get Historical', value: 'getHistorical', action: 'Get historical weather', description: 'Get historical weather data for a latitude/longitude' },
			{ name: 'Get Weather for Job', value: 'getWeatherForJob', action: 'Get weather for job', description: 'Get weather data for a specific job by ID' },
			{ name: 'Get Weather for Site', value: 'getWeatherForSite', action: 'Get weather for site', description: 'Get weather data for a specific site by site key' },
		],
		default: 'getWeatherForJob',
	},
];

export const fsiWeatherFields: INodeProperties[] = [
	{ displayName: 'Job ID', name: 'jobId', type: 'string', required: true, default: '', description: 'The job ID to get weather for', displayOptions: { show: { resource: ['weather'], operation: ['getWeatherForJob'] } } },

	{ displayName: 'Site Key', name: 'siteKey', type: 'string', required: true, default: '', description: 'The site key to get weather for', displayOptions: { show: { resource: ['weather'], operation: ['getWeatherForSite'] } } },
	{
		displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
		displayOptions: { show: { resource: ['weather'], operation: ['getWeatherForSite'] } },
		options: [
			{ displayName: 'End Date', name: 'endDate', type: 'string', default: '', description: 'End date (ISO format)' },
			{ displayName: 'Start Date', name: 'startDate', type: 'string', default: '', description: 'Start date (ISO format)' },
		],
	},

	{ displayName: 'Latitude', name: 'latitude', type: 'string', required: true, default: '', description: 'Location latitude', displayOptions: { show: { resource: ['weather'], operation: ['getForecast', 'getHistorical'] } } },
	{ displayName: 'Longitude', name: 'longitude', type: 'string', required: true, default: '', description: 'Location longitude', displayOptions: { show: { resource: ['weather'], operation: ['getForecast', 'getHistorical'] } } },
	{
		displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
		displayOptions: { show: { resource: ['weather'], operation: ['getForecast'] } },
		options: [
			{ displayName: 'End Hour', name: 'endHour', type: 'string', default: '', description: 'End hour' },
			{ displayName: 'Start Hour', name: 'startHour', type: 'string', default: '', description: 'Start hour' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'Timezone (e.g. Europe/London)' },
		],
	},
	{
		displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
		displayOptions: { show: { resource: ['weather'], operation: ['getHistorical'] } },
		options: [
			{ displayName: 'End Date', name: 'endDate', type: 'string', default: '', description: 'End date (ISO format)' },
			{ displayName: 'Start Date', name: 'startDate', type: 'string', default: '', description: 'Start date (ISO format)' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'Timezone (e.g. Europe/London)' },
		],
	},
];
