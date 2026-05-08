import type { INodeProperties } from 'n8n-workflow';

export const jobsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['jobs'],
			},
		},
		options: [
			{
				name: 'Cancel Job',
				value: 'cancelJob',
				action: 'Cancel a job',
				description: 'Cancel a field service job. Requires the numeric job ID. Optional reason text. Use only when the job will not happen at all (otherwise prefer Set Job Result with completedWithIssues).',
			},
		{
			name: 'Create Job',
			value: 'createJob',
			action: 'Create a job',
			description: 'Create a new field service job. Requires a job type ID (from List Job Types) and a contact (customer/site) ID (from List Contacts). Returns the new job ID. Does not schedule it — call Schedule Job afterwards.',
		},
		{
			name: 'Create Job (Dynamic Fields)',
			value: 'createJobDynamic',
			action: 'Create a job with dynamic custom fields',
			description: 'Create a job where custom fields are supplied as a pre-built JSON array from a previous node (e.g. a Code node). Useful for automated pipelines where custom field values are resolved dynamically at runtime rather than configured manually.',
		},
		{
			name: 'Create Job Constraint',
				value: 'createJobConstraint',
				action: 'Create a job constraint',
				description: 'Add a scheduling rule to a job (e.g. must start before X, requires engineer Y or skill Z). Time-based types need constraintAt; resource/skill types need entityId. Used by the BigChange scheduler.',
			},
			{
				name: 'Create Job Stock',
				value: 'createJobStock',
				action: 'Create job stock entry',
				description: 'Plan or record stock/parts movement on a job (brought, used, taken back). Requires job ID; supply stockDetailsId or stockItemId plus an action and quantity.',
			},
			{
				name: 'Delete Job Constraint',
				value: 'deleteJobConstraint',
				action: 'Delete a job constraint',
				description: 'Remove a scheduling constraint by its constraint ID (get it first via List Job Constraints).',
			},
			{
				name: 'Edit Job',
				value: 'editJob',
				action: 'Edit a job',
				description: 'Update fields on an existing job (description, reference, planned duration, person, order number, custom fields, office notes, isActioned, isFinanciallyComplete). Does not change schedule or status — use Schedule Job / Start Job / Set Job Result for those.',
			},
			{
				name: 'Get Job',
				value: 'getJob',
				action: 'Get a job (enriched)',
				description: 'Get the FULL enriched view of one job (status history, assigned engineer, site address, custom fields, completed worksheet answers, attachments). Heavier payload — use this when an agent needs to summarise/answer questions about a specific job. For a quick lookup, use Get Job by ID instead.',
			},
			{
				name: 'Get Job by ID',
				value: 'getJobById',
				action: 'Get a job by ID (lightweight)',
				description: 'Lightweight single-job lookup by numeric ID via the proxy. Optionally include worksheets. Faster and cheaper than Get Job — prefer this when you only need core job fields. Set Simplify=true to strip the deep BigChange envelope.',
			},
			{
				name: 'List Job Constraints',
				value: 'listJobConstraints',
				action: 'List job constraints',
				description: 'List all scheduling constraints currently attached to a job (pre-existing rules the scheduler must respect).',
			},
			{
				name: 'List Job Status History',
				value: 'listJobStatusHistory',
				action: 'List job status history',
				description: 'Get the full audit trail of status transitions for a job (new → scheduled → started → completedOk, etc.) with timestamps and actors. Use to debug "why is this job in this state?" or build a timeline.',
			},
			{
				name: 'List Job Stock',
				value: 'listJobStock',
				action: 'List job stock',
				description: 'List every stock/parts line attached to a job — what was planned, brought, used, or taken back.',
			},
			{
				name: 'List Jobs',
				value: 'listJobs',
				action: 'List or search jobs',
				description: 'Primary search for jobs. REQUIRES a created-from / created-to UTC window. Filter by status (e.g. completedOk, scheduled, started), job type IDs, contact (customer/site) IDs, resource (engineer) IDs, vehicle IDs, or reference. Returns paginated job records. Default returnAll=false. Set Simplify=true to strip envelopes.',
			},
			{
				name: 'Schedule Job',
				value: 'scheduleJob',
				action: 'Schedule a job',
				description: 'Assign an engineer (resource), vehicle, and/or planned start time to a job. Use after Create Job or to reassign. plannedStartAt is UTC ISO-8601.',
			},
			{
				name: 'Set Job Result',
				value: 'setJobResult',
				action: 'Set job result',
				description: 'Close a job by writing its completion outcome. Status MUST be completedOk or completedWithIssues. Optional result text and an override timestamp. After this call the job is treated as done.',
			},
			{
				name: 'Start Job',
				value: 'startJob',
				action: 'Start a job',
				description: 'Mark a job as started (engineer en-route/on-site). Optional comment (max 250 chars) and override timestamp. Cannot start an already-completed or cancelled job.',
			},
		],
		default: 'listJobs',
	},
];

export const jobsFields: INodeProperties[] = [
	// ── List Jobs fields ──
	{
		displayName: 'Created From',
		name: 'createdAtFrom',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'REQUIRED. Lower bound on createdAt (job creation time, NOT scheduled time). UTC ISO-8601 (e.g. 2026-04-01T00:00:00Z). Combine with Created To to define the search window.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['listJobs'],
			},
		},
	},
	{
		displayName: 'Created To',
		name: 'createdAtTo',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'REQUIRED. Upper bound on createdAt (job creation time, NOT scheduled time). UTC ISO-8601 (e.g. 2026-04-30T23:59:59Z).',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['listJobs'],
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
				resource: ['jobs'],
				operation: ['listJobs'],
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
				resource: ['jobs'],
				operation: ['listJobs'],
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
				resource: ['jobs'],
				operation: ['listJobs'],
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
				resource: ['jobs'],
				operation: ['listJobs'],
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
				resource: ['jobs'],
				operation: ['listJobs'],
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
				resource: ['jobs'],
				operation: ['listJobs'],
			},
		},
		options: [
			{
				displayName: 'Contact IDs',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter to jobs at these customer/site contacts. Comma-separated numeric IDs (max 50). Get IDs from List Contacts.',
			},
			{
				displayName: 'References',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Filter by external job reference strings (the customer\'s PO/ticket number, not the job ID). Comma-separated, max 50.',
			},
			{
				displayName: 'Resource IDs',
				name: 'resourceId',
				type: 'string',
				default: '',
				description: 'Filter to jobs assigned to these engineers (resources). Comma-separated numeric IDs (max 50). Get IDs from List Resources.',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: [
					{ name: 'Accepted', value: 'accepted' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Completed OK', value: 'completedOk' },
					{ name: 'Completed With Issues', value: 'completedWithIssues' },
					{ name: 'Late Finish', value: 'lateFinish' },
					{ name: 'Late Start', value: 'lateStart' },
					{ name: 'New', value: 'new' },
					{ name: 'On The Way', value: 'onTheWay' },
					{ name: 'Read', value: 'read' },
					{ name: 'Rescheduled', value: 'rescheduled' },
					{ name: 'Refused', value: 'refused' },
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Started', value: 'started' },
					{ name: 'Suspended', value: 'suspended' },
					{ name: 'Unscheduled', value: 'unscheduled' },
				],
				default: [],
				description: 'Restrict to jobs in these states (multi-select). e.g. ["completedOk","completedWithIssues"] for finished jobs, ["scheduled","started"] for in-flight, ["new","unscheduled"] for backlog.',
			},
			{
				displayName: 'Type IDs',
				name: 'typeId',
				type: 'string',
				default: '',
				description: 'Filter to specific job types (e.g. install, service, breakdown). Comma-separated numeric IDs (max 50). Get IDs from List Job Types.',
			},
			{
				displayName: 'Vehicle IDs',
				name: 'vehicleId',
				type: 'string',
				default: '',
				description: 'Filter to jobs assigned to these vehicles. Comma-separated numeric IDs (max 50). Get IDs from List Vehicles.',
			},
		],
	},

	// ── Get Job fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Numeric BigChange job ID. Source from List Jobs (job.id) or any prior step that returned a job.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['getJob'],
			},
		},
	},

	// ── Get Job by ID fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Numeric BigChange job ID. Source from List Jobs (job.id).',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['getJobById'],
			},
		},
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description: 'Whether to return a simplified (compact) version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['getJobById'],
			},
		},
	},
	{
		displayName: 'Include Worksheets',
		name: 'includeWorksheets',
		type: 'boolean',
		default: false,
		description: 'Whether to fetch and append the job\'s submitted worksheet answers (mobile-app checklists). Adds a second API call — leave off for fastest response.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['getJobById'],
			},
		},
	},

	// ── Cancel Job fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job to cancel',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['cancelJob'],
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
				resource: ['jobs'],
				operation: ['cancelJob'],
			},
		},
		options: [
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				default: '',
				description: 'Reason for cancelling the job',
			},
		],
	},

	// ── Create Job fields ──
	{
		displayName: 'Type ID',
		name: 'typeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Job type ID (template). Determines workflow, custom field schema, and default duration. Source from List Job Types.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJob'],
			},
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Customer or site this job is for. Numeric contact ID (from List Contacts). The site address attached to this contact becomes the job address.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJob'],
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
				resource: ['jobs'],
				operation: ['createJob'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Job description',
			},
			{
				displayName: 'Job Group ID',
				name: 'jobGroupId',
				type: 'number',
				default: 0,
				description: 'Job group ID',
			},
			{
				displayName: 'Order Number',
				name: 'orderNumber',
				type: 'string',
				default: '',
				description: 'Purchase order number',
			},
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				default: '',
				description: 'Person UUID',
			},
			{
				displayName: 'Planned Duration',
				name: 'plannedDuration',
				type: 'number',
				default: 0,
				description: 'Planned duration in minutes',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Job reference',
			},
		],
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Custom Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJob'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Definition ID',
						name: 'definitionId',
						type: 'number',
						default: 0,
						description: 'The custom field definition ID from the job type',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The value to set for this custom field (empty string to clear)',
					},
				],
			},
		],
	},

	// ── Create Job (Dynamic Fields) ──
	{
		displayName: 'Type ID',
		name: 'typeId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Job type ID. Determines the custom field schema and default duration.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJobDynamic'],
			},
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Numeric contact ID of the customer or site this job is for.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJobDynamic'],
			},
		},
	},
	{
		displayName: 'Custom Fields (JSON)',
		name: 'customFieldsJson',
		type: 'json',
		required: false,
		default: '[]',
		description: 'Array of custom field objects resolved at runtime. Each item must have <code>definitionId</code> (number) and <code>value</code> (string). Pass the output of a Code node that builds this array dynamically from the job type schema.',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJobDynamic'],
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
				resource: ['jobs'],
				operation: ['createJobDynamic'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Job description',
			},
			{
				displayName: 'Job Group ID',
				name: 'jobGroupId',
				type: 'number',
				default: 0,
				description: 'Job group ID',
			},
			{
				displayName: 'Order Number',
				name: 'orderNumber',
				type: 'string',
				default: '',
				description: 'Purchase order number',
			},
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				default: '',
				description: 'Person UUID',
			},
			{
				displayName: 'Planned Duration',
				name: 'plannedDuration',
				type: 'number',
				default: 0,
				description: 'Planned duration in minutes',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Job reference',
			},
		],
	},

	// ── Edit Job fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job to edit',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['editJob'],
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
				resource: ['jobs'],
				operation: ['editJob'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Job description',
			},
			{
				displayName: 'Is Actioned',
				name: 'isActioned',
				type: 'boolean',
				default: false,
				description: 'Whether the job has been actioned',
			},
			{
				displayName: 'Is Financially Complete',
				name: 'isFinanciallyComplete',
				type: 'boolean',
				default: false,
				description: 'Whether the job is financially complete',
			},
			{
				displayName: 'Job Group ID',
				name: 'jobGroupId',
				type: 'number',
				default: 0,
				description: 'Job group ID',
			},
			{
				displayName: 'Office Notes',
				name: 'officeNotes',
				type: 'string',
				default: '',
				description: 'Office notes for the job',
			},
			{
				displayName: 'Order Number',
				name: 'orderNumber',
				type: 'string',
				default: '',
				description: 'Purchase order number',
			},
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				default: '',
				description: 'Person UUID',
			},
			{
				displayName: 'Planned Duration',
				name: 'plannedDuration',
				type: 'number',
				default: 0,
				description: 'Planned duration in minutes',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Job reference',
			},
		],
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Custom Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['editJob'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Definition ID',
						name: 'definitionId',
						type: 'number',
						default: 0,
						description: 'The custom field definition ID from the job type',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The value to set for this custom field (empty string to clear)',
					},
				],
			},
		],
	},

	// ── Schedule Job fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job to schedule',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['scheduleJob'],
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
				resource: ['jobs'],
				operation: ['scheduleJob'],
			},
		},
		options: [
			{
				displayName: 'Planned Start At',
				name: 'plannedStartAt',
				type: 'dateTime',
				default: '',
				description: 'Planned start date and time (UTC)',
			},
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'number',
				default: 0,
				description: 'Engineer/resource ID to assign',
			},
			{
				displayName: 'Vehicle ID',
				name: 'vehicleId',
				type: 'number',
				default: 0,
				description: 'Vehicle ID to assign',
			},
		],
	},

	// ── Start Job fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job to start',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['startJob'],
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
				resource: ['jobs'],
				operation: ['startJob'],
			},
		},
		options: [
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				default: '',
				description: 'Comment when starting the job (max 250 characters)',
				typeOptions: { maxLength: 250 },
			},
			{
				displayName: 'Status Modified At',
				name: 'statusModifiedAt',
				type: 'dateTime',
				default: '',
				description: 'Override timestamp for when the job was started (UTC)',
			},
		],
	},

	// ── Set Job Result fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['setJobResult'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		options: [
			{ name: 'Completed OK', value: 'completedOk' },
			{ name: 'Completed With Issues', value: 'completedWithIssues' },
		],
		default: 'completedOk',
		description: 'The completion result status',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['setJobResult'],
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
				resource: ['jobs'],
				operation: ['setJobResult'],
			},
		},
		options: [
			{
				displayName: 'Result',
				name: 'result',
				type: 'string',
				default: '',
				description: 'Result description text',
			},
			{
				displayName: 'Status Modified At',
				name: 'statusModifiedAt',
				type: 'dateTime',
				default: '',
				description: 'Override timestamp for when the result was set (UTC)',
			},
		],
	},

	// ── List Job Status History fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['listJobStatusHistory'],
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
				resource: ['jobs'],
				operation: ['listJobStatusHistory'],
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
				resource: ['jobs'],
				operation: ['listJobStatusHistory'],
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
				resource: ['jobs'],
				operation: ['listJobStatusHistory'],
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
				resource: ['jobs'],
				operation: ['listJobStatusHistory'],
			},
		},
		options: [
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'ascending' },
					{ name: 'Descending', value: 'descending' },
				],
				default: 'descending',
				description: 'Sort direction for status history entries',
			},
		],
	},

	// ── Create Job Constraint fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJobConstraint'],
			},
		},
	},
	{
		displayName: 'Constraint Type',
		name: 'type',
		type: 'options',
		required: true,
		options: [
			{ name: 'Job Must Complete Before', value: 'jobMustCompleteBefore' },
			{ name: 'Job Must Complete In Available Hours', value: 'jobMustCompleteInAvailableHours' },
			{ name: 'Job Must Start After', value: 'jobMustStartAfter' },
			{ name: 'Job Must Start Before', value: 'jobMustStartBefore' },
			{ name: 'Job Must Start In Available Hours', value: 'jobMustStartInAvailableHours' },
			{ name: 'Job Requires Resource Skill', value: 'jobRequiresResourceSkill' },
			{ name: 'Job Requires Vehicle Attribute', value: 'jobRequiresVehicleAttribute' },
			{ name: 'Job Resource', value: 'jobResource' },
			{ name: 'Job Resource Group', value: 'jobResourceGroup' },
			{ name: 'Job Vehicle', value: 'jobVehicle' },
			{ name: 'Job Vehicle Group', value: 'jobVehicleGroup' },
		],
		default: 'jobMustStartAfter',
		description: 'The type of scheduling constraint to add',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJobConstraint'],
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
				resource: ['jobs'],
				operation: ['createJobConstraint'],
			},
		},
		options: [
			{
				displayName: 'Constraint At',
				name: 'constraintAt',
				type: 'dateTime',
				default: '',
				description: 'Date/time value for time-based constraints (UTC)',
			},
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'number',
				default: 0,
				description: 'ID of the related entity (resource, vehicle, skill, etc.)',
			},
		],
	},

	// ── Delete Job Constraint fields ──
	{
		displayName: 'Constraint ID',
		name: 'constraintId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the constraint to delete',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['deleteJobConstraint'],
			},
		},
	},

	// ── List Job Constraints fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['listJobConstraints'],
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
				resource: ['jobs'],
				operation: ['listJobConstraints'],
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
				resource: ['jobs'],
				operation: ['listJobConstraints'],
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
				resource: ['jobs'],
				operation: ['listJobConstraints'],
				returnAll: [false],
			},
		},
	},

	// ── Create Job Stock fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['createJobStock'],
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
				resource: ['jobs'],
				operation: ['createJobStock'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{ name: 'Brought And Left', value: 'broughtAndLeft' },
					{ name: 'Brought And Taken Back', value: 'broughtAndTakenBack' },
					{ name: 'No Movement', value: 'noMovement' },
					{ name: 'On Site And Left', value: 'onSiteAndLeft' },
					{ name: 'On Site And Taken Back', value: 'onSiteAndTakenBack' },
					{ name: 'Used In Stock', value: 'usedInStock' },
				],
				default: 'noMovement',
				description: 'Stock movement action',
			},
			{
				displayName: 'Quantity Planned',
				name: 'quantityPlanned',
				type: 'number',
				default: 0,
				description: 'Planned quantity of stock',
			},
			{
				displayName: 'Stock Details ID',
				name: 'stockDetailsId',
				type: 'number',
				default: 0,
				description: 'Stock details ID',
			},
			{
				displayName: 'Stock Item ID',
				name: 'stockItemId',
				type: 'number',
				default: 0,
				description: 'Stock item ID',
			},
		],
	},

	// ── List Job Stock fields ──
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the job',
		displayOptions: {
			show: {
				resource: ['jobs'],
				operation: ['listJobStock'],
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
				resource: ['jobs'],
				operation: ['listJobStock'],
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
				resource: ['jobs'],
				operation: ['listJobStock'],
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
				resource: ['jobs'],
				operation: ['listJobStock'],
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
				resource: ['jobs'],
				operation: ['listJobStatusHistory', 'listJobConstraints', 'listJobStock'],
			},
		},
	},
];
