import type { INodeProperties } from 'n8n-workflow';

// Keep in sync with backfill/sentinels/registry.py (SENTINELS) — last synced 2026-06.
// 19 sentinels + the synthetic "all" option. Display names mirror the registry
// `name` field; the `value` is the registry sentinel ID (snake_case).
const SENTINEL_OPTIONS: Array<{ name: string; value: string }> = [
	{ name: 'All Sentinels', value: 'all' },
	{ name: 'Carryover Accumulation', value: 'carryover_accumulation' },
	{ name: 'Customer Non-Complete Anomaly', value: 'customer_noncomplete_anomaly' },
	{ name: 'Customer Risk Escalation', value: 'customer_risk_escalation' },
	{ name: 'Data Quality Alert', value: 'data_quality_alert' },
	{ name: 'Dormant Customer Revival', value: 'dormant_customer_revival' },
	{ name: 'Engineer Performance Slip', value: 'engineer_performance_slip' },
	{ name: 'Engineer-Flagged Follow-Up', value: 'engineer_flagged_followup' },
	{ name: 'FVF Rate Drop', value: 'fvf_rate_drop' },
	{ name: 'Geographic Cluster Opportunity', value: 'geographic_cluster_opportunity' },
	{ name: 'New Problem Site', value: 'new_problem_site' },
	{ name: 'Repeat Failure Escalation', value: 'repeat_failure_escalation' },
	{ name: 'Scheduling Accuracy Drift', value: 'scheduling_accuracy_drift' },
	{ name: 'Seasonal Uplift Window', value: 'seasonal_uplift_window' },
	{ name: 'Service Interval Due', value: 'service_interval_due' },
	{ name: 'Single Service Customer', value: 'single_service_customer' },
	{ name: 'Site Deterioration', value: 'site_deterioration' },
	{ name: 'SLA Breach Cluster', value: 'sla_breach_cluster' },
	{ name: 'Timing Anomaly Detector', value: 'timing_anomaly_detector' },
	{ name: 'Workload Imbalance', value: 'workload_imbalance' },
];

// Per-sentinel tunable thresholds. Keys are the exact registry parameter names
// (snake_case) so the collected collection object can be sent straight through
// as paramOverrides[sentinelId]. Defaults mirror the registry defaults and are
// shown only so the user knows what they are overriding — they are NOT sent
// unless the user explicitly adds the field. Options are pre-sorted by display
// name to match the collection ordering convention.
interface ThresholdParam {
	name: string;
	displayName: string;
	default: number;
	description: string;
}

const SENTINEL_THRESHOLDS: Array<{ id: string; params: ThresholdParam[] }> = [
	{
		id: 'engineer_performance_slip',
		params: [
			{ name: 'consecutive_critical', displayName: 'Consecutive Critical Periods', default: 5, description: 'Consecutive critical periods before a critical alert. Registry default: 5' },
			{ name: 'consecutive_poor', displayName: 'Consecutive Poor Periods', default: 3, description: 'Consecutive poor periods before a warning. Registry default: 3' },
			{ name: 'min_sample', displayName: 'Minimum Sample Size', default: 5, description: 'Minimum jobs per period before evaluating. Registry default: 5' },
		],
	},
	{
		id: 'fvf_rate_drop',
		params: [
			{ name: 'fvf_critical', displayName: 'FVF Critical Threshold', default: 50, description: 'First-visit-fix % at or below which a critical alert fires. Registry default: 50' },
			{ name: 'fvf_warning', displayName: 'FVF Warning Threshold', default: 70, description: 'First-visit-fix % at or below which a warning fires. Registry default: 70' },
			{ name: 'min_sample', displayName: 'Minimum Sample Size', default: 10, description: 'Minimum jobs per period before evaluating. Registry default: 10' },
		],
	},
	{
		id: 'workload_imbalance',
		params: [
			{ name: 'overload_pct', displayName: 'Overload Percentage', default: 150, description: 'Workload % of team average flagged as overloaded. Registry default: 150' },
			{ name: 'underload_pct', displayName: 'Underload Percentage', default: 50, description: 'Workload % of team average flagged as underloaded. Registry default: 50' },
		],
	},
	{
		id: 'site_deterioration',
		params: [
			{ name: 'issue_rate_delta_pp', displayName: 'Issue Rate Delta Percentage Points', default: 15, description: 'Percentage-point rise in issue rate vs prior period. Registry default: 15' },
			{ name: 'min_sample', displayName: 'Minimum Sample Size', default: 5, description: 'Minimum jobs per period before evaluating. Registry default: 5' },
		],
	},
	{
		id: 'repeat_failure_escalation',
		params: [
			{ name: 'failure_threshold', displayName: 'Failure Threshold', default: 3, description: 'Repeat failures at a site/asset before escalating. Registry default: 3' },
		],
	},
	{
		id: 'new_problem_site',
		params: [
			{ name: 'historical_ok_threshold', displayName: 'Historical OK Threshold', default: 90, description: 'Historical success % that defines a previously healthy site. Registry default: 90' },
			{ name: 'min_sample', displayName: 'Minimum Sample Size', default: 5, description: 'Minimum historical jobs before evaluating. Registry default: 5' },
			{ name: 'recent_issue_min', displayName: 'Recent Issue Minimum', default: 2, description: 'Recent issues required to flag a new problem site. Registry default: 2' },
		],
	},
	{
		id: 'sla_breach_cluster',
		params: [
			{ name: 'cluster_threshold', displayName: 'Cluster Threshold', default: 3, description: 'Late starts within the window to form a cluster. Registry default: 3' },
			{ name: 'late_start_mins', displayName: 'Late Start Minutes', default: 15, description: 'Minutes past planned start that counts as late. Registry default: 15' },
		],
	},
	{
		id: 'customer_risk_escalation',
		params: [
			{ name: 'min_sample', displayName: 'Minimum Sample Size', default: 10, description: 'Minimum jobs per period before evaluating. Registry default: 10' },
			{ name: 'risk_critical', displayName: 'Risk Critical Threshold', default: 80, description: 'Risk score at or above which a critical alert fires. Registry default: 80' },
			{ name: 'risk_warning', displayName: 'Risk Warning Threshold', default: 60, description: 'Risk score at or above which a warning fires. Registry default: 60' },
		],
	},
	{
		id: 'customer_noncomplete_anomaly',
		params: [
			{ name: 'delta_pp', displayName: 'Delta Percentage Points', default: 15, description: 'Percentage-point spike in non-complete rate vs prior period. Registry default: 15' },
			{ name: 'min_sample', displayName: 'Minimum Sample Size', default: 5, description: 'Minimum jobs per period before evaluating. Registry default: 5' },
		],
	},
	{
		id: 'scheduling_accuracy_drift',
		params: [
			{ name: 'drift_pct', displayName: 'Drift Percentage', default: 30, description: 'Scheduling-accuracy drift % that triggers an alert. Registry default: 30' },
			{ name: 'min_sample', displayName: 'Minimum Sample Size', default: 10, description: 'Minimum jobs per period before evaluating. Registry default: 10' },
		],
	},
	{
		id: 'carryover_accumulation',
		params: [
			{ name: 'consecutive_increase', displayName: 'Consecutive Increase Periods', default: 3, description: 'Consecutive periods of rising carryover before alerting. Registry default: 3' },
		],
	},
	{
		id: 'data_quality_alert',
		params: [
			{ name: 'ghost_pct', displayName: 'Ghost Percentage', default: 5, description: 'Percentage of ghost/empty records that triggers an alert. Registry default: 5' },
		],
	},
	{
		id: 'timing_anomaly_detector',
		params: [
			{ name: 'critical_count', displayName: 'Critical Count', default: 20, description: 'Anomaly count at or above which a critical alert fires. Registry default: 20' },
			{ name: 'extreme_overrun_multiplier', displayName: 'Extreme Overrun Multiplier', default: 3, description: 'Multiple of expected duration flagged as an extreme overrun. Registry default: 3' },
			{ name: 'implausible_threshold_mins', displayName: 'Implausible Threshold Minutes', default: 720, description: 'Duration in minutes treated as implausible. Registry default: 720' },
			{ name: 'mismatch_multiplier', displayName: 'Mismatch Multiplier', default: 2, description: 'Multiple of expected duration flagged as a mismatch. Registry default: 2' },
			{ name: 'overnight_threshold_mins', displayName: 'Overnight Threshold Minutes', default: 720, description: 'Duration in minutes treated as an overnight job. Registry default: 720' },
		],
	},
	{
		id: 'dormant_customer_revival',
		params: [
			{ name: 'dormant_months', displayName: 'Dormant Months', default: 6, description: 'Months of inactivity before a customer is dormant. Registry default: 6' },
			{ name: 'long_dormant_min_jobs', displayName: 'Long Dormant Minimum Jobs', default: 5, description: 'Minimum lifetime jobs to qualify a long-dormant customer. Registry default: 5' },
			{ name: 'long_dormant_months', displayName: 'Long Dormant Months', default: 9, description: 'Months of inactivity that count as long-dormant. Registry default: 9' },
			{ name: 'min_lifetime_jobs', displayName: 'Minimum Lifetime Jobs', default: 3, description: 'Minimum lifetime jobs to qualify for revival. Registry default: 3' },
			{ name: 'range_months', displayName: 'Range Months', default: 24, description: 'Lookback window in months for revival analysis. Registry default: 24' },
		],
	},
	{
		id: 'service_interval_due',
		params: [
			{ name: 'min_meaningful_gap_days', displayName: 'Minimum Meaningful Gap Days', default: 60, description: 'Minimum days between visits to count as a service interval. Registry default: 60' },
			{ name: 'min_visits', displayName: 'Minimum Visits', default: 3, description: 'Minimum prior visits before inferring a cadence. Registry default: 3' },
			{ name: 'overdue_multiplier', displayName: 'Overdue Multiplier', default: 1.25, description: 'Multiple of the typical interval treated as overdue. Registry default: 1.25' },
		],
	},
	{
		id: 'single_service_customer',
		params: [
			{ name: 'min_jobs', displayName: 'Minimum Jobs', default: 4, description: 'Minimum jobs in window to qualify as single-service. Registry default: 4' },
			{ name: 'window_months', displayName: 'Window Months', default: 12, description: 'Lookback window in months. Registry default: 12' },
		],
	},
	{
		id: 'engineer_flagged_followup',
		params: [
			{ name: 'evidence_limit', displayName: 'Evidence Limit', default: 50, description: 'Maximum evidence rows attached per alert. Registry default: 50' },
			{ name: 'offset_days', displayName: 'Offset Days', default: 0, description: 'Days to offset the lookback window. Registry default: 0' },
			{ name: 'result_limit', displayName: 'Result Limit', default: 100, description: 'Maximum follow-up results returned. Registry default: 100' },
			{ name: 'window_days', displayName: 'Window Days', default: 14, description: 'Lookback window in days. Registry default: 14' },
		],
	},
	{
		id: 'seasonal_uplift_window',
		params: [
			{ name: 'min_prior_years', displayName: 'Minimum Prior Years', default: 2, description: 'Minimum prior years of data to detect a seasonal pattern. Registry default: 2' },
		],
	},
	{
		id: 'geographic_cluster_opportunity',
		params: [
			{ name: 'min_nearby_sites', displayName: 'Minimum Nearby Sites', default: 1, description: 'Minimum nearby sites to form a geographic cluster. Registry default: 1' },
			{ name: 'window_months', displayName: 'Window Months', default: 6, description: 'Lookback window in months. Registry default: 6' },
		],
	},
];

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

const thresholdOverrideFields: INodeProperties[] = SENTINEL_THRESHOLDS.map(
	({ id, params }): INodeProperties => ({
		displayName: 'Threshold Overrides',
		name: `thresholdOverrides_${id}`,
		type: 'collection',
		placeholder: 'Add Threshold Override',
		default: {},
		description:
			'Optional threshold overrides for this run. Add only the values you want to change — anything you leave out uses the registry default.',
		displayOptions: {
			show: {
				resource: ['sentinel'],
				operation: ['runSentinels'],
				sentinelId: [id],
			},
		},
		options: params.map(
			(p): INodeProperties => ({
				displayName: p.displayName,
				name: p.name,
				type: 'number',
				default: p.default,
				description: p.description,
			}),
		),
	}),
);

export const fsiSentinelFields: INodeProperties[] = [
	{
		displayName: 'Sentinel',
		name: 'sentinelId',
		type: 'options',
		noDataExpression: true,
		required: true,
		options: SENTINEL_OPTIONS,
		default: 'all',
		description: 'Which sentinel check to run — select All to run every enabled sentinel',
		displayOptions: {
			show: {
				resource: ['sentinel'],
				operation: ['runSentinels'],
			},
		},
	},
	...thresholdOverrideFields,
	{
		displayName: 'Exclusions',
		name: 'exclusions',
		type: 'collection',
		placeholder: 'Add Exclusion',
		default: {},
		description:
			'Optionally exclude specific sites, job types, contacts, or engineers from this run. Applies to all sentinels in the run. Leave blank for no exclusions.',
		displayOptions: {
			show: {
				resource: ['sentinel'],
				operation: ['runSentinels'],
			},
		},
		options: [
			{
				displayName: 'Excluded Contact IDs',
				name: 'excludedContactIds',
				type: 'string',
				default: '',
				description: 'Comma-separated contact IDs to exclude (customer, site, and opportunity sentinels)',
			},
			{
				displayName: 'Excluded Job Type IDs',
				name: 'excludedJobTypeIds',
				type: 'string',
				default: '',
				description: 'Comma-separated job type IDs to exclude',
			},
			{
				displayName: 'Excluded Resource IDs',
				name: 'excludedResourceIds',
				type: 'string',
				default: '',
				description: 'Comma-separated engineer (resource) IDs to exclude (engineer sentinels)',
			},
			{
				displayName: 'Excluded Site Keys',
				name: 'excludedSiteKeys',
				type: 'string',
				default: '',
				description: 'Comma-separated site keys to exclude (site sentinels)',
			},
		],
	},
];
