import type { INodeProperties } from 'n8n-workflow';

export const fsiReportsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['reports'],
			},
		},
		options: [
			{
				name: 'Generate Report',
				value: 'generateReport',
				action: 'Generate a report',
				description: 'Generate an AI-powered operational report (daily or weekly) with optional narrative summary',
			},
			{
				name: 'List Report Sections',
				value: 'listReportSections',
				action: 'List report sections',
				description: 'List all available report types and their sections',
			},
		],
		default: 'generateReport',
	},
];

export const fsiReportsFields: INodeProperties[] = [
	// ── Generate Report fields ──
	{
		displayName: 'Report Type',
		name: 'reportType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Start of Day', value: 'start_of_day' },
			{ name: 'Midday', value: 'midday' },
			{ name: 'Close of Business', value: 'close_of_business' },
			{ name: 'Day Review', value: 'day_review' },
			{ name: 'Start of Week', value: 'start_of_week' },
			{ name: 'Midweek', value: 'midweek' },
			{ name: 'End of Week', value: 'end_of_week' },
		],
		default: 'close_of_business',
		description: 'The type of operational report to generate',
		displayOptions: {
			show: {
				resource: ['reports'],
				operation: ['generateReport'],
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
				resource: ['reports'],
				operation: ['generateReport'],
			},
		},
		options: [
			{
				displayName: 'Date',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'Report date (YYYY-MM-DD). Defaults to today if omitted.',
			},
			{
				displayName: 'Include Narrative',
				name: 'includeNarrative',
				type: 'boolean',
				default: true,
				description: 'Whether to include an AI-generated narrative summary (adds 2-5s latency)',
			},
			{
				displayName: 'Sections (JSON)',
				name: 'sections',
				type: 'json',
				default: '[]',
				description: 'Array of section IDs to include in the report (omit to include all). Use List Report Sections to discover available IDs.',
			},
		],
	},
];
