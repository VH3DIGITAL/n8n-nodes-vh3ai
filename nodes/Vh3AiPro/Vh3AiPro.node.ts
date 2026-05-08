import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import {
	vh3FsiGetRequest,
	vh3FsiPostRequest,
	vh3FsiPatchRequest,
	vh3FsiDeleteRequest,
	vh3FsiGetAllPages,
	requireCompanyId,
	buildAttachments,
} from './GenericFunctions';

import { fsiAccountReportOperations, fsiAccountReportFields } from './descriptions/FsiAccountReviewDescription';
import { fsiBriefingOperations, fsiBriefingFields } from './descriptions/FsiBriefingDescription';
import { fsiEmailOperations, fsiEmailFields } from './descriptions/FsiEmailDescription';
import { fsiJobsOperations, fsiJobsFields } from './descriptions/FsiJobsDescription';
import { fsiReportsOperations, fsiReportsFields } from './descriptions/FsiReportsDescription';
import { fsiSearchOperations, fsiSearchFields } from './descriptions/FsiSearchDescription';
import { fsiSentinelOperations, fsiSentinelFields } from './descriptions/FsiSentinelDescription';
import { fsiCasesOperations, fsiCasesFields } from './descriptions/FsiCasesDescription';
import { fsiPulseOperations, fsiPulseFields } from './descriptions/FsiPulseDescription';
import { fsiWeatherOperations, fsiWeatherFields } from './descriptions/FsiWeatherDescription';
import { fsiIntelligenceOperations, fsiIntelligenceFields } from './descriptions/FsiIntelligenceDescription';
import { fsiInvestigateOperations, fsiInvestigateFields } from './descriptions/FsiInvestigateDescription';
import { fsiConnieOperations, fsiConnieFields } from './descriptions/FsiConnieDescription';

export class Vh3AiPro implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VH3 AI PRO',
		name: 'vh3AiPro',
		icon: 'file:vh3ai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + " (" + $parameter["resource"] + ")"}}',
		description:
			'AI-powered field service intelligence — enriched job feeds, operational reports, and analytics via the VH3 FSI API',
		defaults: {
			name: 'VH3 AI PRO',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'vh3AiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
		options: [
			{ name: 'Account Report', value: 'accountReport' },
			{ name: 'Briefing', value: 'briefing' },
			{ name: 'Cases', value: 'cases' },
			{ name: 'Connie', value: 'connie' },
			{ name: 'Email', value: 'email' },
			{ name: 'Intelligence', value: 'intelligence' },
			{ name: 'Investigate', value: 'investigate' },
			{ name: 'Job Feed', value: 'jobFeed' },
			{ name: 'Pulse', value: 'pulse' },
			{ name: 'Report', value: 'reports' },
			{ name: 'Search', value: 'search' },
			{ name: 'Sentinel', value: 'sentinel' },
			{ name: 'Weather', value: 'weather' },
		],
		default: 'jobFeed',
	},
	...fsiAccountReportOperations,
	...fsiAccountReportFields,
	...fsiBriefingOperations,
	...fsiBriefingFields,
	...fsiEmailOperations,
	...fsiEmailFields,
	...fsiJobsOperations,
	...fsiJobsFields,
	...fsiReportsOperations,
	...fsiReportsFields,
	...fsiSearchOperations,
	...fsiSearchFields,
	...fsiSentinelOperations,
	...fsiSentinelFields,
	...fsiCasesOperations,
	...fsiCasesFields,
	...fsiPulseOperations,
	...fsiPulseFields,
	...fsiWeatherOperations,
	...fsiWeatherFields,
	...fsiIntelligenceOperations,
	...fsiIntelligenceFields,
	...fsiInvestigateOperations,
	...fsiInvestigateFields,
	...fsiConnieOperations,
	...fsiConnieFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: JsonObject[] = [];

				const credentials = await this.getCredentials('vh3AiApi');
				const companyId = credentials.companyId;
				requireCompanyId(this, companyId);

				if (resource === 'accountReport') {
					if (operation === 'generateAccountReport') {
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const body: JsonObject = {
							report_type: 'account_monthly',
							contact_id: contactId,
						};

						if (additionalFields.month) body.month = additionalFields.month;
						if (additionalFields.includeNarrative !== undefined) {
							body.include_narrative = additionalFields.includeNarrative;
						}

						const raw = await vh3FsiPostRequest.call(this, '/reports/generate', body);
						responseData = [raw];
					}
				}

				else if (resource === 'briefing') {
					if (operation === 'generateBriefing') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const body: JsonObject = {
							job_id: jobId,
							contact_id: contactId,
						};

						if (additionalFields.forceRegenerateSummary !== undefined) {
							body.force_regenerate_summary = additionalFields.forceRegenerateSummary;
						}
						if (additionalFields.jobPayload) {
							body.job_payload = typeof additionalFields.jobPayload === 'string'
								? JSON.parse(additionalFields.jobPayload as string)
								: additionalFields.jobPayload;
						}

						const raw = await vh3FsiPostRequest.call(this, '/briefing/generate', body);
						responseData = [raw];
					}
				}

				else if (resource === 'email') {
					const attachments = await buildAttachments(this, i);

					if (operation === 'classifyEmail') {
						const subject = this.getNodeParameter('subject', i) as string;
						const emailBody = this.getNodeParameter('emailBody', i) as string;
						const senderAddress = this.getNodeParameter('senderAddress', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const body: JsonObject = {
							subject,
							email_body: emailBody,
							sender_address: senderAddress,
							attachments: attachments as unknown as JsonObject,
						};

						if (additionalFields.senderName) body.sender_name = additionalFields.senderName;
						if (additionalFields.timestamp) body.timestamp = additionalFields.timestamp;
						if (additionalFields.isReply !== undefined) body.is_reply = additionalFields.isReply;
						if (additionalFields.isForward !== undefined) body.is_forward = additionalFields.isForward;
						if (additionalFields.sourceRef) body.source_ref = additionalFields.sourceRef;

						const raw = await vh3FsiPostRequest.call(this, '/triage/classify', body);
						responseData = [raw];
					} else if (operation === 'listTriageCategories') {
						const raw = await vh3FsiGetRequest.call(this, '/triage/categories', {});
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'ingestEmail') {
						const emailText = this.getNodeParameter('emailText', i) as string;
						const emailSubject = this.getNodeParameter('emailSubject', i) as string;
						const emailFrom = this.getNodeParameter('emailFrom', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const body: JsonObject = {
							email_text: emailText,
							email_subject: emailSubject,
							email_from: emailFrom,
							attachments: attachments as unknown as JsonObject,
							preferred_type_ids: [] as unknown as JsonObject,
						};

						if (additionalFields.emailHtml) body.email_html = additionalFields.emailHtml;
						if (additionalFields.emailDate) body.email_date = additionalFields.emailDate;

						const typeIdsRaw = (additionalFields.preferredTypeIds as string) || '';
						if (typeIdsRaw.trim()) {
							body.preferred_type_ids = typeIdsRaw
								.split(',')
								.map((s: string) => parseInt(s.trim(), 10))
								.filter((n: number) => !isNaN(n)) as unknown as JsonObject;
						}

						const raw = await vh3FsiPostRequest.call(this, '/ingest/email', body);
						responseData = [raw];
					}
				}

				else if (resource === 'jobFeed') {
					if (operation === 'aggregateJobs') {
						const metric = this.getNodeParameter('metric', i) as string;
						const period = this.getNodeParameter('period', i) as string;
						const timeAxis = this.getNodeParameter('timeAxis', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const body: JsonObject = { metric, period, time_axis: timeAxis };
						if (additionalFields.compareTo) body.compare_to = additionalFields.compareTo;
						if (additionalFields.groupBy) body.group_by = additionalFields.groupBy;
						if (additionalFields.limit) body.limit = additionalFields.limit;

						const filters: Record<string, unknown> = {};
						if (additionalFields.resourceId) filters.resourceId = additionalFields.resourceId;
						if (additionalFields.contactId) filters.contactId = additionalFields.contactId;
						if (additionalFields.siteKey) filters.siteKey = additionalFields.siteKey;
						if (additionalFields.typeId) filters.typeId = additionalFields.typeId;
						if (additionalFields.categoryId) filters.categoryId = additionalFields.categoryId;
						if (additionalFields.vertical) filters.vertical = additionalFields.vertical;
						if (additionalFields.status) filters.status = additionalFields.status;
						if (additionalFields.result) filters.result = additionalFields.result;
						if (additionalFields.startDate) filters.startDate = additionalFields.startDate;
						if (additionalFields.endDate) filters.endDate = additionalFields.endDate;

						if (Object.keys(filters).length > 0) {
							body.filters = filters as unknown as JsonObject;
						}

						const raw = await vh3FsiPostRequest.call(this, '/aggregate/jobs', body);
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'listJobFeed') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const simplify = this.getNodeParameter('simplify', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const qs: Record<string, string | number | boolean> = {};

						if (simplify) qs.compact = true;
						if (additionalFields.contactId) qs.contact_id = additionalFields.contactId as number;
						if (additionalFields.resourceId) qs.resource_id = additionalFields.resourceId as number;
						if (additionalFields.typeId) qs.type_id = additionalFields.typeId as number;
						if (additionalFields.categoryId) qs.category_id = additionalFields.categoryId as number;
						if (additionalFields.status) qs.status = additionalFields.status as string;
						if (additionalFields.result) qs.result = additionalFields.result as string;

						if (returnAll) {
							responseData = await vh3FsiGetAllPages.call(this, '/jobs/feed', qs, 'jobs');
						} else {
							const pageSize = this.getNodeParameter('pageSize', i) as number;
							const pageNumber = this.getNodeParameter('pageNumber', i) as number;
							qs.page_size = pageSize;
							qs.page_number = pageNumber;
							const raw = await vh3FsiGetRequest.call(this, '/jobs/feed', qs);
							responseData = (Array.isArray(raw.jobs) ? raw.jobs : []) as JsonObject[];
						}
					} else if (operation === 'getEnrichedJob') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const simplify = this.getNodeParameter('simplify', i) as boolean;
						const qs: Record<string, string | number | boolean> = {};
						if (simplify) qs.compact = true;
						const raw = await vh3FsiGetRequest.call(this, `/jobs/${jobId}`, qs);
						responseData = [raw];
					}
				}

				else if (resource === 'reports') {
					if (operation === 'generateReport') {
						const reportType = this.getNodeParameter('reportType', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const body: JsonObject = {
							report_type: reportType,
						};

						if (additionalFields.date) {
							const d = new Date(additionalFields.date as string);
							body.date = d.toISOString().split('T')[0];
						}
						if (additionalFields.includeNarrative !== undefined) {
							body.include_narrative = additionalFields.includeNarrative;
						}
						if (additionalFields.sections) {
							body.sections = (typeof additionalFields.sections === 'string'
								? JSON.parse(additionalFields.sections as string)
								: additionalFields.sections) as JsonObject;
						}
						const raw = await vh3FsiPostRequest.call(this, '/reports/generate', body);
						responseData = [raw];
					} else if (operation === 'listReportSections') {
						const raw = await vh3FsiGetRequest.call(this, '/reports/sections', {});
						responseData = [raw];
					}
				}

				else if (resource === 'search') {
					if (operation === 'autocomplete') {
						const q = this.getNodeParameter('query', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;
						const typeFilter = this.getNodeParameter('typeFilter', i, []) as string[];
						const qs: Record<string, string | number> = { q, limit };
						const raw = await vh3FsiGetRequest.call(this, '/search/autocomplete', qs);

						// Unwrap the autocomplete envelope: { results: [...], query, count }
						// so each result becomes its own n8n item.
						let results: JsonObject[];
						if (Array.isArray(raw)) {
							results = raw as JsonObject[];
						} else if (raw && Array.isArray((raw as JsonObject).results)) {
							results = ((raw as JsonObject).results as unknown) as JsonObject[];
						} else {
							results = [raw];
						}

						if (typeFilter.length > 0) {
							const allowed = new Set(typeFilter);
							results = results.filter((item) => allowed.has((item?.type as string) ?? ''));
						}

						responseData = results;
					} else {
						const endpoint = operation === 'searchOutcomes'
							? '/search/outcomes'
							: operation === 'searchIntakeBasic'
								? '/search/intake'
								: '/search/intake/enriched';
						const queryText = this.getNodeParameter('queryText', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { query_text: queryText };
						if (additionalFields.limit) body.limit = additionalFields.limit;
						if (additionalFields.typeId) body.type_id = additionalFields.typeId;
						if (additionalFields.categoryId) body.category_id = additionalFields.categoryId;
						if (additionalFields.resourceId) body.resource_id = additionalFields.resourceId;
						if (additionalFields.contactId) body.contact_id = additionalFields.contactId;
						if (additionalFields.siteKey) body.site_key = additionalFields.siteKey;
						const raw = await vh3FsiPostRequest.call(this, endpoint, body);

						// Unwrap the standard semantic-search envelope: { hits: [...], count: N }
						// so each hit becomes its own n8n item.
						let results: JsonObject[];
						if (Array.isArray(raw)) {
							results = raw as JsonObject[];
						} else if (raw && Array.isArray((raw as JsonObject).hits)) {
							results = ((raw as JsonObject).hits as unknown) as JsonObject[];
						} else {
							results = [raw];
						}

						const dateFrom = additionalFields.dateFrom as string | undefined;
						const dateTo = additionalFields.dateTo as string | undefined;
						const maxAgeMonths = additionalFields.maxAgeMonths as number | undefined;
						if (dateFrom || dateTo || maxAgeMonths) {
							let fromMs: number | null = dateFrom ? Date.parse(dateFrom) : null;
							const toMs = dateTo ? Date.parse(dateTo) : null;
							if (fromMs == null && maxAgeMonths) {
								const cutoff = new Date();
								cutoff.setMonth(cutoff.getMonth() - maxAgeMonths);
								fromMs = cutoff.getTime();
							}

							// Search hits don't carry createdAt; actualStartAt is the reliable
							// timestamp on every job-derived hit. Fall back through other
							// likely fields so we never silently drop items.
							const extractTimestamp = (item: JsonObject): number | null => {
								const candidates: unknown[] = [
									item?.actualStartAt,
									item?.actualEndAt,
									item?.createdAt,
									item?.created_at,
									item?.plannedStartAt,
									item?.scheduledAt,
									(item?.job as JsonObject | undefined)?.actualStartAt,
									(item?.job as JsonObject | undefined)?.createdAt,
								];
								for (const v of candidates) {
									if (v == null) continue;
									const ts = typeof v === 'number' ? v : Date.parse(String(v));
									if (!Number.isNaN(ts)) return ts;
								}
								return null;
							};

							results = results.filter((item) => {
								const ts = extractTimestamp(item);
								if (ts == null) return true; // keep items we can't date-stamp
								if (fromMs != null && ts < fromMs) return false;
								if (toMs != null && ts > toMs) return false;
								return true;
							});
						}

						responseData = results;
					}
				}

				else if (resource === 'sentinel') {
					if (operation === 'runSentinels') {
						const sentinelId = this.getNodeParameter('sentinelId', i) as string;
						if (sentinelId === 'all') {
							const raw = await vh3FsiPostRequest.call(this, '/sentinels/run', {
								sentinel_ids: [] as unknown as JsonObject,
							});
							responseData = [raw];
						} else {
							const raw = await vh3FsiPostRequest.call(this, `/sentinels/run/${sentinelId}`, {});
							responseData = [raw];
						}
					} else if (operation === 'listSentinelRegistry') {
						const raw = await vh3FsiGetRequest.call(this, '/sentinels/registry', {});
						responseData = [raw];
					} else if (operation === 'getSentinelResults') {
						const raw = await vh3FsiGetRequest.call(this, '/sentinels/results', {});
						responseData = [raw];
					}
				}

				else if (resource === 'cases') {
					if (operation === 'createCase') {
						const title = this.getNodeParameter('title', i) as string;
						const caseType = this.getNodeParameter('caseType', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { title, type: caseType };
						if (additionalFields.description) body.description = additionalFields.description;
						if (additionalFields.priority) body.priority = additionalFields.priority;
						if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
						if (additionalFields.actorId) body.actor_id = additionalFields.actorId;
						if (additionalFields.dueDate) body.due_date = additionalFields.dueDate;
						if (additionalFields.tags) body.tags = typeof additionalFields.tags === 'string' ? JSON.parse(additionalFields.tags as string) : additionalFields.tags;
						if (additionalFields.metadata) body.metadata = typeof additionalFields.metadata === 'string' ? JSON.parse(additionalFields.metadata as string) : additionalFields.metadata;
						const raw = await vh3FsiPostRequest.call(this, '/cases/create', body);
						responseData = [raw];
					} else if (operation === 'listCases') {
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = {};
						if (additionalFields.status) qs.status = additionalFields.status as string;
						if (additionalFields.type) qs.type = additionalFields.type as string;
						if (additionalFields.priority) qs.priority = additionalFields.priority as string;
						if (additionalFields.ownerId) qs.owner_id = additionalFields.ownerId as number;
						if (additionalFields.search) qs.search = additionalFields.search as string;
						if (additionalFields.page) qs.page = additionalFields.page as number;
						if (additionalFields.perPage) qs.per_page = additionalFields.perPage as number;
						const raw = await vh3FsiGetRequest.call(this, '/cases/list', qs);
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'searchCases') {
						const query = this.getNodeParameter('query', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = { q: query };
						if (additionalFields.status) qs.status = additionalFields.status as string;
						if (additionalFields.type) qs.type = additionalFields.type as string;
						if (additionalFields.priority) qs.priority = additionalFields.priority as string;
						if (additionalFields.page) qs.page = additionalFields.page as number;
						if (additionalFields.perPage) qs.per_page = additionalFields.perPage as number;
						const raw = await vh3FsiGetRequest.call(this, '/cases/search', qs);
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'getCase') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const raw = await vh3FsiGetRequest.call(this, `/cases/${caseId}`, {});
						responseData = [raw];
					} else if (operation === 'updateCase') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as JsonObject;
						const body: JsonObject = {};
						if (updateFields.title) body.title = updateFields.title;
						if (updateFields.description) body.description = updateFields.description;
						if (updateFields.type) body.type = updateFields.type;
						if (updateFields.priority) body.priority = updateFields.priority;
						if (updateFields.actorType) body.actor_type = updateFields.actorType;
						if (updateFields.actorId) body.actor_id = updateFields.actorId;
						if (updateFields.dueDate) body.due_date = updateFields.dueDate;
						if (updateFields.resolution) body.resolution = updateFields.resolution;
						if (updateFields.tags) body.tags = typeof updateFields.tags === 'string' ? JSON.parse(updateFields.tags as string) : updateFields.tags;
						if (updateFields.metadata) body.metadata = typeof updateFields.metadata === 'string' ? JSON.parse(updateFields.metadata as string) : updateFields.metadata;
						const raw = await vh3FsiPatchRequest.call(this, `/cases/${caseId}`, body);
						responseData = [raw];
					} else if (operation === 'transitionCase') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const targetStatus = this.getNodeParameter('targetStatus', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { status: targetStatus };
						if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
						if (additionalFields.actorId) body.actor_id = additionalFields.actorId;
						if (additionalFields.comment) body.comment = additionalFields.comment;
						const raw = await vh3FsiPostRequest.call(this, `/cases/${caseId}/transition`, body);
						responseData = [raw];
					} else if (operation === 'addComment') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const comment = this.getNodeParameter('comment', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { comment };
						if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
						if (additionalFields.actorId) body.actor_id = additionalFields.actorId;
						const raw = await vh3FsiPostRequest.call(this, `/cases/${caseId}/comments`, body);
						responseData = [raw];
					} else if (operation === 'listActivity') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = {};
						if (additionalFields.page) qs.page = additionalFields.page as number;
						if (additionalFields.perPage) qs.per_page = additionalFields.perPage as number;
						const raw = await vh3FsiGetRequest.call(this, `/cases/${caseId}/activity`, qs);
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'listCaseItems') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = {};
						if (additionalFields.itemType) qs.type = additionalFields.itemType as string;
						const raw = await vh3FsiGetRequest.call(this, `/cases/${caseId}/items`, qs);
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'addCaseItem') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const itemType = this.getNodeParameter('itemType', i) as string;
						const itemId = this.getNodeParameter('itemId', i) as string;
						const label = this.getNodeParameter('label', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { item_type: itemType, item_id: itemId, label };
						if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
						if (additionalFields.actorId) body.actor_id = additionalFields.actorId;
						if (additionalFields.context) body.context = additionalFields.context;
						if (additionalFields.metadata) body.metadata = typeof additionalFields.metadata === 'string' ? JSON.parse(additionalFields.metadata as string) : additionalFields.metadata;
						const raw = await vh3FsiPostRequest.call(this, `/cases/${caseId}/items`, body);
						responseData = [raw];
					} else if (operation === 'removeCaseItem') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const itemRecordId = this.getNodeParameter('itemRecordId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
						if (additionalFields.actorId) body.actor_id = additionalFields.actorId;
						const raw = await vh3FsiDeleteRequest.call(this, `/cases/${caseId}/items/${itemRecordId}`, body);
						responseData = [raw];
					} else if (operation === 'addParticipant') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const userId = this.getNodeParameter('userId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { user_id: userId };
						if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
						if (additionalFields.actorId) body.actor_id = additionalFields.actorId;
						if (additionalFields.role) body.role = additionalFields.role;
						const raw = await vh3FsiPostRequest.call(this, `/cases/${caseId}/participants`, body);
						responseData = [raw];
					} else if (operation === 'removeParticipant') {
						const caseId = this.getNodeParameter('caseId', i) as number;
						const participantRecordId = this.getNodeParameter('participantRecordId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
						if (additionalFields.actorId) body.actor_id = additionalFields.actorId;
						const raw = await vh3FsiDeleteRequest.call(this, `/cases/${caseId}/participants/${participantRecordId}`, body);
						responseData = [raw];
					} else if (operation === 'listCasesForItem') {
						const itemType = this.getNodeParameter('itemType', i) as string;
						const externalId = this.getNodeParameter('externalId', i) as string;
						const raw = await vh3FsiGetRequest.call(this, `/items/${itemType}/${externalId}/cases`, {});
						responseData = Array.isArray(raw) ? raw : [raw];
					}
				}

				else if (resource === 'connie') {
					if (operation === 'connieChat') {
						const message = this.getNodeParameter('message', i) as string;
						const experimental = this.getNodeParameter('experimentalMode', i, false) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { message };
						if (additionalFields.sessionId) body.session_id = additionalFields.sessionId;
						if (additionalFields.userId) body.user_id = additionalFields.userId;
						if (additionalFields.userName) body.user_name = additionalFields.userName;
						if (additionalFields.userCompanyName) body.user_company_name = additionalFields.userCompanyName;
						if (additionalFields.summary) body.summary = additionalFields.summary;
						if (additionalFields.contactId) body.contact_id = additionalFields.contactId;
						if (additionalFields.currentJobReference) body.current_job_reference = additionalFields.currentJobReference;
						const endpoint = experimental ? '/connie/experimental/chat' : '/connie/chat';
						const raw = await vh3FsiPostRequest.call(this, endpoint, body);
						responseData = [raw];
					} else if (operation === 'connieListSessions') {
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = {};
						if (additionalFields.userId) qs.user_id = additionalFields.userId as string;
						if (additionalFields.contactId) qs.contact_id = additionalFields.contactId as string;
						if (additionalFields.limit) qs.limit = additionalFields.limit as number;
						const raw = await vh3FsiGetRequest.call(this, '/connie/sessions', qs);
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'connieGetSessionMessages') {
						const sessionId = this.getNodeParameter('sessionId', i) as string;
						const raw = await vh3FsiGetRequest.call(this, `/connie/sessions/${sessionId}/messages`, {});
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'connieSearchHistory') {
						const query = this.getNodeParameter('query', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { query };
						if (additionalFields.userId) body.user_id = additionalFields.userId;
						if (additionalFields.contactId) body.contact_id = additionalFields.contactId;
						if (additionalFields.limit) body.limit = additionalFields.limit;
						const raw = await vh3FsiPostRequest.call(this, '/connie/history/search', body);
						responseData = Array.isArray(raw) ? raw : [raw];
					}
				}

				else if (resource === 'investigate') {
					if (operation === 'runInvestigation') {
						const question = this.getNodeParameter('question', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { question };
						if (additionalFields.maxEvidenceItems) body.max_evidence_items = additionalFields.maxEvidenceItems;
						const raw = await vh3FsiPostRequest.call(this, '/investigate', body);
						responseData = [raw];
					}
				}

				else if (resource === 'pulse') {
					if (operation === 'getPulse') {
						const raw = await vh3FsiGetRequest.call(this, `/pulse/${companyId}`, {});
						responseData = [raw];
					}
				}

				else if (resource === 'weather') {
					if (operation === 'getWeatherForJob') {
						const jobId = this.getNodeParameter('jobId', i) as string;
						const raw = await vh3FsiGetRequest.call(this, `/weather/for-job/${jobId}`, {});
						responseData = [raw];
					} else if (operation === 'getWeatherForSite') {
						const siteKey = this.getNodeParameter('siteKey', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = { site_key: siteKey };
						if (additionalFields.startDate) qs.start_date = additionalFields.startDate as string;
						if (additionalFields.endDate) qs.end_date = additionalFields.endDate as string;
						const raw = await vh3FsiGetRequest.call(this, '/weather/for-site', qs);
						responseData = [raw];
					} else if (operation === 'getForecast') {
						const latitude = this.getNodeParameter('latitude', i) as string;
						const longitude = this.getNodeParameter('longitude', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = { latitude, longitude };
						if (additionalFields.startHour) qs.start_hour = additionalFields.startHour as string;
						if (additionalFields.endHour) qs.end_hour = additionalFields.endHour as string;
						if (additionalFields.timezone) qs.timezone = additionalFields.timezone as string;
						const raw = await vh3FsiGetRequest.call(this, '/weather/forecast', qs);
						responseData = [raw];
					} else if (operation === 'getHistorical') {
						const latitude = this.getNodeParameter('latitude', i) as string;
						const longitude = this.getNodeParameter('longitude', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const qs: Record<string, string | number | boolean> = { latitude, longitude };
						if (additionalFields.startDate) qs.start_date = additionalFields.startDate as string;
						if (additionalFields.endDate) qs.end_date = additionalFields.endDate as string;
						if (additionalFields.timezone) qs.timezone = additionalFields.timezone as string;
						const raw = await vh3FsiGetRequest.call(this, '/weather/historical', qs);
						responseData = [raw];
					}
				}

				else if (resource === 'intelligence') {
					if (operation === 'listProfiles') {
						const profiledOnly = this.getNodeParameter('profiledOnly', i) as boolean;
						const qs: Record<string, string | number | boolean> = {};
						if (profiledOnly) qs.profiled_only = true;
						const raw = await vh3FsiGetRequest.call(this, `/intelligence/profiles/${companyId}`, qs);
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'getProfile') {
						const typeId = this.getNodeParameter('typeId', i) as string;
						const raw = await vh3FsiGetRequest.call(this, `/intelligence/profiles/${companyId}/types/${typeId}`, {});
						responseData = [raw];
					} else if (operation === 'generateProfiles') {
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (additionalFields.scope) body.scope = additionalFields.scope;
						if (additionalFields.typeIds) body.type_ids = typeof additionalFields.typeIds === 'string' ? JSON.parse(additionalFields.typeIds as string) : additionalFields.typeIds;
						const raw = await vh3FsiPostRequest.call(this, '/intelligence/generate-profiles', body);
						responseData = [raw];
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
