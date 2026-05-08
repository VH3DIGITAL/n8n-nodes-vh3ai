import type { INodeProperties } from 'n8n-workflow';

export const fsiSentinelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sentinel'],
			},
		},
		options: [
			{
				name: 'Get Latest Results',
				value: 'getSentinelResults',
				action: 'Get latest sentinel results',
				description: 'Retrieve the cached results from the most recent sentinel run for your tenant',
			},
			{
				name: 'List Sentinel Registry',
				value: 'listSentinelRegistry',
				action: 'List sentinel definitions',
				description: 'List all available sentinel definitions with their thresholds and recommended schedules',
			},
			{
				name: 'Run Sentinels',
				value: 'runSentinels',
				action: 'Run sentinel checks',
				description: 'Run sentinel checks and return only triggered alerts',
			},
		],
		default: 'runSentinels',
	},
];

export const fsiSentinelFields: INodeProperties[] = [
	{
		displayName: 'Sentinel',
		name: 'sentinelId',
		type: 'options',
		required: true,
		options: [
			{ name: 'All Sentinels', value: 'all' },
			{ name: 'Carryover Accumulation', value: 'carryover_accumulation' },
			{ name: 'Customer Non-Complete Anomaly', value: 'customer_noncomplete_anomaly' },
			{ name: 'Customer Risk Escalation', value: 'customer_risk_escalation' },
			{ name: 'Data Quality Alert', value: 'data_quality_alert' },
			{ name: 'Engineer Performance Slip', value: 'engineer_performance_slip' },
			{ name: 'FVF Rate Drop', value: 'fvf_rate_drop' },
			{ name: 'New Problem Site', value: 'new_problem_site' },
			{ name: 'Repeat Failure Escalation', value: 'repeat_failure_escalation' },
			{ name: 'Scheduling Accuracy Drift', value: 'scheduling_accuracy_drift' },
			{ name: 'Site Deterioration', value: 'site_deterioration' },
			{ name: 'SLA Breach Cluster', value: 'sla_breach_cluster' },
			{ name: 'Workload Imbalance', value: 'workload_imbalance' },
		],
		default: 'all',
		description: 'Which sentinel check to run — select All to run every enabled sentinel',
		displayOptions: {
			show: {
				resource: ['sentinel'],
				operation: ['runSentinels'],
			},
		},
	},
];
