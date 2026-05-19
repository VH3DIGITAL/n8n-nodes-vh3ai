import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import {
	vh3ListApiRequest,
	vh3ListApiRequestAllPages,
	vh3ProxyGetRequest,
	vh3EnrichApiRequest,
	extractItems,
	requireCompanyId,
	toUtcDateTime,
	defaultCreatedAtRange,
	vh3FsiGetRequest,
	vh3FsiPostRequest,
	vh3FsiPatchRequest,
	vh3FsiDeleteRequest,
	vh3FsiPutRequest,
	vh3FsiGetAllPages,
	buildAttachments,
} from './GenericFunctions';

import { jobsOperations, jobsFields } from './descriptions/JobsDescription';
import { contactsOperations, contactsFields } from './descriptions/ContactsDescription';
import { resourcesOperations, resourcesFields } from './descriptions/ResourcesDescription';
import { jobTypesOperations, jobTypesFields } from './descriptions/JobTypesDescription';
import { vehiclesOperations, vehiclesFields } from './descriptions/VehiclesDescription';
import { worksheetsOperations, worksheetsFields } from './descriptions/WorksheetsDescription';
import { worksheetGroupsOperations, worksheetGroupsFields } from './descriptions/WorksheetGroupsDescription';
import { invoicesOperations, invoicesFields } from './descriptions/InvoicesDescription';
import { notesOperations, notesFields } from './descriptions/NotesDescription';
import { personsOperations, personsFields } from './descriptions/PersonsDescription';
import { jobGroupsOperations, jobGroupsFields } from './descriptions/JobGroupsDescription';
import { stockOperations, stockFields } from './descriptions/StockDescription';
import { referenceDataOperations, referenceDataFields } from './descriptions/ReferenceDataDescription';
import { quotesOperations, quotesFields } from './descriptions/QuotesDescription';
import { salesOpportunitiesOperations, salesOpportunitiesFields } from './descriptions/SalesOpportunitiesDescription';
import { purchaseOrdersOperations, purchaseOrdersFields } from './descriptions/PurchaseOrdersDescription';
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
import { fsiUsersOperations, fsiUsersFields } from './descriptions/FsiUsersDescription';

export class Vh3Ai implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VH3 AI',
		name: 'vh3Ai',
		icon: 'file:vh3ai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + " (" + $parameter["resource"] + ")"}}',
		description:
			'Read and write BigChange field service data and access VH3 AI intelligence features — jobs, contacts, invoices, reports, search, cases, and more.',
		defaults: {
			name: 'VH3 AI',
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
					{ name: 'Account Report (VH3 AI)', value: 'accountReport', description: 'Generate monthly account review reports for a contact.' },
					{ name: 'Briefing (VH3 AI)', value: 'briefing', description: 'Generate pre-job intelligence briefings.' },
					{ name: 'Case (VH3 AI)', value: 'cases', description: 'Case management — create, update, transition, comment, link items and participants.' },
					{ name: 'Connie (VH3 AI)', value: 'connie', description: 'Conversational AI assistant — chat, sessions, and history search.' },
					{ name: 'Contact (BigChange)', value: 'contacts', description: 'Customers and sites — companies, addresses, locations.' },
					{ name: 'Email (VH3 AI)', value: 'email', description: 'Email triage — classify, ingest, and list triage categories.' },
					{ name: 'Intelligence (VH3 AI)', value: 'intelligence', description: 'Job type profiling — list, get, and generate intelligence profiles.' },
					{ name: 'Investigate (VH3 AI)', value: 'investigate', description: 'Run investigative queries against operational data.' },
					{ name: 'Invoice (BigChange)', value: 'invoices', description: 'Sales invoices and their line items — read, create, edit, mark sent/paid, cancel.' },
					{ name: 'Job (BigChange)', value: 'jobs', description: 'Field service jobs — CRUD, schedule, start, set result, cancel; manage constraints and stock.' },
					{ name: 'Job Feed (VH3 AI)', value: 'jobFeed', description: 'Enriched job feed with aggregation and analytics.' },
					{ name: 'Job Group (BigChange)', value: 'jobGroups', description: 'Linked sets of jobs (e.g. multi-visit projects) and their status history.' },
					{ name: 'Job Type (BigChange)', value: 'jobTypes', description: 'Job type definitions (templates) — schemas for installation/repair/maintenance.' },
					{ name: 'Note (BigChange)', value: 'notes', description: 'Notes, tasks, and progress updates attached to jobs/contacts/persons.' },
					{ name: 'Person (BigChange)', value: 'persons', description: 'Individual people attached to a contact (e.g. site contacts). Includes consent history.' },
					{ name: 'Pulse (VH3 AI)', value: 'pulse', description: 'Operational pulse dashboard for your company.' },
					{ name: 'Purchase Order (BigChange)', value: 'purchaseOrders', description: 'Purchase orders and their line items — read, create, edit; manage PO series (numbering).' },
					{ name: 'Quote (BigChange)', value: 'quotes', description: 'Sales quotes and their line items — read, create, edit, mark sent/accepted/rejected.' },
					{ name: 'Reference Data (BigChange)', value: 'referenceData', description: 'Lookup tables — department codes and nominal (accounting) codes.' },
					{ name: 'Report (VH3 AI)', value: 'reports', description: 'Generate operational reports (daily, weekly, monthly).' },
					{ name: 'Resource / Engineer (BigChange)', value: 'resources', description: 'Engineers/technicians (the field workforce) and their groups.' },
					{ name: 'Sales Opportunity (BigChange)', value: 'salesOpportunities', description: 'Sales opportunities (CRM pipeline) — read, edit, manage line items; list probabilities & stages.' },
					{ name: 'Search (VH3 AI)', value: 'search', description: 'Semantic and outcome search across operational data.' },
					{ name: 'Sentinel (VH3 AI)', value: 'sentinel', description: 'Proactive monitoring — run sentinels, view registry and results.' },
					{ name: 'Stock (BigChange)', value: 'stock', description: 'Inventory — product categories, stock details, items, movements, and suppliers.' },
					{ name: 'User (VH3 AI)', value: 'users', description: 'User management — list, invite, update role, and delete company users.' },
				{ name: 'Vehicle (BigChange)', value: 'vehicles', description: 'Fleet vehicles — read/create/update vehicle records and groups.' },
					{ name: 'Weather (VH3 AI)', value: 'weather', description: 'Weather data for jobs, sites, forecasts, and historical lookups.' },
					{ name: 'Worksheet (BigChange)', value: 'worksheets', description: 'Mobile-app worksheet/checklist definitions, questions, and submitted answers.' },
					{ name: 'Worksheet Group (BigChange)', value: 'worksheetGroups', description: 'Folders that organise worksheet definitions.' },
				],
				default: 'jobs',
			},
			...jobsOperations,
			...jobsFields,
			...contactsOperations,
			...contactsFields,
			...resourcesOperations,
			...resourcesFields,
			...jobTypesOperations,
			...jobTypesFields,
			...vehiclesOperations,
			...vehiclesFields,
			...worksheetsOperations,
			...worksheetsFields,
			...worksheetGroupsOperations,
			...worksheetGroupsFields,
			...invoicesOperations,
			...invoicesFields,
			...notesOperations,
			...notesFields,
			...personsOperations,
			...personsFields,
			...quotesOperations,
			...quotesFields,
			...salesOpportunitiesOperations,
			...salesOpportunitiesFields,
			...purchaseOrdersOperations,
			...purchaseOrdersFields,
			...jobGroupsOperations,
			...jobGroupsFields,
			...stockOperations,
			...stockFields,
			...referenceDataOperations,
			...referenceDataFields,
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
			...fsiUsersOperations,
			...fsiUsersFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const parseIds = (v: unknown) => String(v).split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
		const parseTexts = (v: unknown) => String(v).split(',').map((s) => s.trim()).filter((s) => s.length > 0);

		const fsiResources = new Set([
			'accountReport', 'briefing', 'cases', 'connie', 'email',
			'intelligence', 'investigate', 'jobFeed', 'pulse', 'reports',
			'search', 'sentinel', 'users', 'weather',
		]);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: JsonObject[] = [];

				if (fsiResources.has(resource)) {
					const credentials = await this.getCredentials('vh3AiApi');
					const companyId = credentials.companyId;
					requireCompanyId(this, companyId);
				}

				// ── JOBS ──────────────────────────────────────────────────
				if (resource === 'jobs') {
					if (operation === 'listJobs') {
						const direction = this.getNodeParameter('direction', i) as string;
						const createdAtFrom = this.getNodeParameter('createdAtFrom', i) as string;
						const createdAtTo = this.getNodeParameter('createdAtTo', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const simplify = this.getNodeParameter('simplify', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;

						const body: JsonObject = {
							sortBy: 'createdAt',
							direction,
							createdAtFrom: toUtcDateTime(createdAtFrom) ?? createdAtFrom,
							createdAtTo: toUtcDateTime(createdAtTo) ?? createdAtTo,
						};

						if (simplify) body.compact = true;

						if (additionalFields.status && (additionalFields.status as string[]).length > 0) {
							body.status = additionalFields.status;
						}
						if (additionalFields.typeId) body.typeId = parseIds(additionalFields.typeId);
						if (additionalFields.contactId) body.contactId = parseIds(additionalFields.contactId);
						if (additionalFields.resourceId) body.resourceId = parseIds(additionalFields.resourceId);
						if (additionalFields.vehicleId) body.vehicleId = parseIds(additionalFields.vehicleId);
						if (additionalFields.reference) body.reference = parseTexts(additionalFields.reference);

						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/jobs/list', body);
						} else {
							const pageSize = this.getNodeParameter('pageSize', i) as number;
							const pageNumber = this.getNodeParameter('pageNumber', i) as number;
							body.pageSize = pageSize;
							body.pageNumber = pageNumber;
							const raw = await vh3ListApiRequest.call(this, '/jobs/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getJob') {
						const credentials = await this.getCredentials('vh3AiApi');
						const companyId = credentials.companyId;
						requireCompanyId(this, companyId);
						const jobId = this.getNodeParameter('jobId', i) as number;
						const raw = await vh3EnrichApiRequest.call(this, '/enrichJob', {
							jobId,
							companyId: companyId as string,
						});
						responseData = [raw];
					} else if (operation === 'getJobById') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const simplify = this.getNodeParameter('simplify', i) as boolean;
						const includeWorksheets = this.getNodeParameter('includeWorksheets', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { id: jobId };
						if (simplify) qs.compact = true;
						if (includeWorksheets) qs.worksheets = true;
						const raw = await vh3ProxyGetRequest.call(this, '/jobs/job', qs);
						responseData = [raw];
					} else if (operation === 'createJob') {
						const typeId = this.getNodeParameter('typeId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { typeId, contactId };
						if (additionalFields.plannedDuration) body.plannedDuration = additionalFields.plannedDuration;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.description) body.description = additionalFields.description;
						if (additionalFields.personId) body.personId = additionalFields.personId;
						if (additionalFields.orderNumber) body.orderNumber = additionalFields.orderNumber;
						if (additionalFields.jobGroupId) body.jobGroupId = additionalFields.jobGroupId;
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as { values?: Array<{ definitionId: number; value: string }> };
						if (customFieldsData.values && customFieldsData.values.length > 0) {
							body.customFields = customFieldsData.values.map((cf) => ({
								definitionId: cf.definitionId,
								value: cf.value,
							})) as unknown as JsonObject;
						}
						const raw = await vh3ListApiRequest.call(this, '/jobs/create', body);
						responseData = [raw];
					} else if (operation === 'createJobDynamic') {
						const typeId = this.getNodeParameter('typeId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { typeId, contactId };
						if (additionalFields.plannedDuration) body.plannedDuration = additionalFields.plannedDuration;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.description) body.description = additionalFields.description;
						if (additionalFields.personId) body.personId = additionalFields.personId;
						if (additionalFields.orderNumber) body.orderNumber = additionalFields.orderNumber;
						if (additionalFields.jobGroupId) body.jobGroupId = additionalFields.jobGroupId;
						const rawCustomFields = this.getNodeParameter('customFieldsJson', i, '[]');
						const customFieldsArray: Array<{ definitionId: number; value: string }> = Array.isArray(rawCustomFields)
							? rawCustomFields
							: JSON.parse(typeof rawCustomFields === 'string' ? rawCustomFields : JSON.stringify(rawCustomFields));
						if (customFieldsArray.length > 0) {
							body.customFields = customFieldsArray as unknown as JsonObject;
						}
						const rawDynamic = await vh3ListApiRequest.call(this, '/jobs/create', body);
						responseData = [rawDynamic];
					} else if (operation === 'editJob') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId };
						if (additionalFields.plannedDuration) body.plannedDuration = additionalFields.plannedDuration;
						if (additionalFields.description) body.description = additionalFields.description;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.personId) body.personId = additionalFields.personId;
						if (additionalFields.orderNumber) body.orderNumber = additionalFields.orderNumber;
						if (additionalFields.jobGroupId) body.jobGroupId = additionalFields.jobGroupId;
						if (additionalFields.isFinanciallyComplete !== undefined) body.isFinanciallyComplete = additionalFields.isFinanciallyComplete;
						if (additionalFields.isActioned !== undefined) body.isActioned = additionalFields.isActioned;
						if (additionalFields.officeNotes) body.officeNotes = additionalFields.officeNotes;
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as { values?: Array<{ definitionId: number; value: string }> };
						if (customFieldsData.values && customFieldsData.values.length > 0) {
							body.customFields = customFieldsData.values.map((cf) => ({
								definitionId: cf.definitionId,
								value: cf.value,
							})) as unknown as JsonObject;
						}
						const raw = await vh3ListApiRequest.call(this, '/jobs/edit', body);
						responseData = [raw];
					} else if (operation === 'cancelJob') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId };
						if (additionalFields.reason) body.reason = additionalFields.reason;
						const raw = await vh3ListApiRequest.call(this, '/jobs/cancel', body);
						responseData = [raw];
					} else if (operation === 'setJobResult') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const status = this.getNodeParameter('status', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId, status };
						if (additionalFields.result) body.result = additionalFields.result;
						const statusModifiedAt = toUtcDateTime(additionalFields.statusModifiedAt);
						if (statusModifiedAt) body.statusModifiedAt = statusModifiedAt;
						const raw = await vh3ListApiRequest.call(this, '/jobs/result', body);
						responseData = [raw];
					} else if (operation === 'scheduleJob') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId };
						if (additionalFields.resourceId) body.resourceId = additionalFields.resourceId;
						if (additionalFields.vehicleId) body.vehicleId = additionalFields.vehicleId;
						const plannedStartAt = toUtcDateTime(additionalFields.plannedStartAt);
						if (plannedStartAt) body.plannedStartAt = plannedStartAt;
						const raw = await vh3ListApiRequest.call(this, '/jobs/scheduling', body);
						responseData = [raw];
					} else if (operation === 'startJob') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId };
						if (additionalFields.comment) body.comment = additionalFields.comment;
						const statusModifiedAt = toUtcDateTime(additionalFields.statusModifiedAt);
						if (statusModifiedAt) body.statusModifiedAt = statusModifiedAt;
						const raw = await vh3ListApiRequest.call(this, '/jobs/start', body);
						responseData = [raw];
					} else if (operation === 'listJobStatusHistory') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId, sortBy: 'createdAt' };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/jobs/status/history', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/jobs/status/history', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'createJobConstraint') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const type = this.getNodeParameter('type', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId, type };
						const constraintAt = toUtcDateTime(additionalFields.constraintAt);
						if (constraintAt) body.constraintAt = constraintAt;
						if (additionalFields.entityId) body.entityId = additionalFields.entityId;
						const raw = await vh3ListApiRequest.call(this, '/jobs/constraints/create', body);
						responseData = [raw];
					} else if (operation === 'deleteJobConstraint') {
						const constraintId = this.getNodeParameter('constraintId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/jobs/constraints/delete', { constraintId });
						responseData = [raw];
					} else if (operation === 'listJobConstraints') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { jobId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/jobs/constraints/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/jobs/constraints/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'createJobStock') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobId };
						if (additionalFields.stockDetailsId) body.stockDetailsId = additionalFields.stockDetailsId;
						if (additionalFields.stockItemId) body.stockItemId = additionalFields.stockItemId;
						if (additionalFields.action) body.action = additionalFields.action;
						if (additionalFields.quantityPlanned) body.quantityPlanned = additionalFields.quantityPlanned;
						const raw = await vh3ListApiRequest.call(this, '/jobs/stock/create', body);
						responseData = [raw];
					} else if (operation === 'listJobStock') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { jobId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/jobs/stock/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/jobs/stock/list', body);
							responseData = extractItems(raw).items;
						}
					}
				}

				// ── CONTACTS ──────────────────────────────────────────────
				else if (resource === 'contacts') {
				if (operation === 'getContact') {
					const contactId = this.getNodeParameter('contactId', i) as number;
						const simplify = this.getNodeParameter('simplify', i) as boolean;
						const qs: Record<string, string | number | boolean> = { contactId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/contacts/contact', qs);
						responseData = [raw];
					} else if (operation === 'listContacts') {
						const sortBy = this.getNodeParameter('sortBy', i) as string;
						const direction = this.getNodeParameter('direction', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const simplify = this.getNodeParameter('simplify', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { sortBy, direction };
						if (simplify) body.compact = true;
						const contactsCreatedAtFrom = toUtcDateTime(additionalFields.createdAtFrom);
						if (contactsCreatedAtFrom) body.createdAtFrom = contactsCreatedAtFrom;
						if (additionalFields.reference) body.reference = parseTexts(additionalFields.reference);
						if (additionalFields.name) body.name = additionalFields.name;
						if (additionalFields.id) body.id = parseIds(additionalFields.id);
						if (additionalFields.parentId) body.parentId = parseIds(additionalFields.parentId);
						if (additionalFields.groupId) body.groupId = parseIds(additionalFields.groupId);
						if (additionalFields.status) body.status = additionalFields.status;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/contacts/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/contacts/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listContactGroups') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/contact_groups/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/contact_groups/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'createContact') {
						const name = this.getNodeParameter('name', i) as string;
						const groupId = this.getNodeParameter('groupId', i) as number;
						const latitude = this.getNodeParameter('latitude', i) as number;
						const longitude = this.getNodeParameter('longitude', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {
							name, groupId,
							location: { latitude, longitude } as unknown as JsonObject,
						};
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.parentId) body.parentId = additionalFields.parentId;
						if (additionalFields.extraInformation) body.extraInformation = additionalFields.extraInformation;
						if (additionalFields.street) body.street = additionalFields.street;
						if (additionalFields.town) body.town = additionalFields.town;
						if (additionalFields.postalCode) body.postalCode = additionalFields.postalCode;
						if (additionalFields.country) body.country = additionalFields.country;
						const raw = await vh3ListApiRequest.call(this, '/contacts/create', body);
						responseData = [raw];
					} else if (operation === 'editContact') {
						const contactId = this.getNodeParameter('contactId', i) as number;
						const name = this.getNodeParameter('name', i) as string;
						const groupId = this.getNodeParameter('groupId', i) as number;
						const latitude = this.getNodeParameter('latitude', i) as number;
						const longitude = this.getNodeParameter('longitude', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {
							contactId, name, groupId,
							location: { latitude, longitude } as unknown as JsonObject,
						};
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.parentId) body.parentId = additionalFields.parentId;
						if (additionalFields.extraInformation) body.extraInformation = additionalFields.extraInformation;
						if (additionalFields.street) body.street = additionalFields.street;
						if (additionalFields.town) body.town = additionalFields.town;
						if (additionalFields.postalCode) body.postalCode = additionalFields.postalCode;
						if (additionalFields.country) body.country = additionalFields.country;
						const raw = await vh3ListApiRequest.call(this, '/contacts/edit', body);
						responseData = [raw];
					} else if (operation === 'stopContact') {
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { contactId };
						if (additionalFields.appliesTo) body.appliesTo = additionalFields.appliesTo;
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.stopReason) body.stopReason = additionalFields.stopReason;
						const raw = await vh3ListApiRequest.call(this, '/contacts/on_stop', body);
						responseData = [raw];
					} else if (operation === 'unstopContact') {
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { contactId };
						if (additionalFields.appliesTo) body.appliesTo = additionalFields.appliesTo;
						const raw = await vh3ListApiRequest.call(this, '/contacts/unstop', body);
						responseData = [raw];
					} else if (operation === 'getContactGroup') {
						const groupId = this.getNodeParameter('groupId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { contactGroupId: groupId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/contact_groups/contact_group', qs);
						responseData = [raw];
					} else if (operation === 'createContactGroup') {
						const name = this.getNodeParameter('name', i) as string;
						const raw = await vh3ListApiRequest.call(this, '/contact_groups/create', { name });
						responseData = [raw];
					} else if (operation === 'updateContactGroup') {
						const groupId = this.getNodeParameter('groupId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { groupId };
						if (additionalFields.name) body.name = additionalFields.name;
						const raw = await vh3ListApiRequest.call(this, '/contact_groups/update', body);
						responseData = [raw];
					}
				}

				// ── RESOURCES ─────────────────────────────────────────────
				else if (resource === 'resources') {
					if (operation === 'listResources') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/resources/resources_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/resources/resources_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listResourceGroups') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/resource_groups/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/resource_groups/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getResource') {
						const resourceId = this.getNodeParameter('resourceId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { resourceId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/resources/resource_get', qs);
						responseData = [raw];
					} else if (operation === 'createResource') {
						const name = this.getNodeParameter('name', i) as string;
						const groupId = this.getNodeParameter('groupId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { name, groupId };
						if (additionalFields.email) body.email = additionalFields.email;
						if (additionalFields.mobile) body.mobile = additionalFields.mobile;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						const raw = await vh3ListApiRequest.call(this, '/resources/resource_create', body);
						responseData = [raw];
					} else if (operation === 'updateResource') {
						const resourceId = this.getNodeParameter('resourceId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { resourceId };
						if (additionalFields.name) body.name = additionalFields.name;
						if (additionalFields.groupId) body.groupId = additionalFields.groupId;
						if (additionalFields.email) body.email = additionalFields.email;
						if (additionalFields.mobile) body.mobile = additionalFields.mobile;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						const raw = await vh3ListApiRequest.call(this, '/resources/update', body);
						responseData = [raw];
					} else if (operation === 'getResourceGroup') {
						const groupId = this.getNodeParameter('groupId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { resourceGroupId: groupId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/resource_groups/resource_group/get', qs);
						responseData = [raw];
					}
				}

				// ── JOB TYPES ─────────────────────────────────────────────
				else if (resource === 'jobTypes') {
					if (operation === 'listJobTypes') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.isTasksEnabled !== undefined) body.isTasksEnabled = additionalFields.isTasksEnabled;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/job_types/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/job_types/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getJobType') {
						const jobTypeId = this.getNodeParameter('jobTypeId', i) as number;
						const body: JsonObject = { jobTypeId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						const raw = await vh3ListApiRequest.call(this, '/job_types/job_types', body);
						responseData = [raw];
					}
				}

				// ── VEHICLES ──────────────────────────────────────────────
				else if (resource === 'vehicles') {
					if (operation === 'listVehicles') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/vehicles/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/vehicles/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getVehicle') {
						const vehicleId = this.getNodeParameter('vehicleId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { vehicleId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/vehicles/vehicle_get', qs);
						responseData = [raw];
					} else if (operation === 'createVehicle') {
						const groupId = this.getNodeParameter('groupId', i) as number;
						const vehicleType = this.getNodeParameter('vehicleType', i) as string;
						const registration = this.getNodeParameter('registration', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { groupId, vehicleType, registration };
						if (additionalFields.make) body.make = additionalFields.make;
						if (additionalFields.model) body.model = additionalFields.model;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.registrationYear) body.registrationYear = additionalFields.registrationYear;
						if (additionalFields.fixedResourceId) body.fixedResourceId = additionalFields.fixedResourceId;
						const raw = await vh3ListApiRequest.call(this, '/vehicles/create', body);
						responseData = [raw];
					} else if (operation === 'updateVehicle') {
						const vehicleId = this.getNodeParameter('vehicleId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { vehicleId };
						if (additionalFields.groupId) body.groupId = additionalFields.groupId;
						if (additionalFields.vehicleType) body.vehicleType = additionalFields.vehicleType;
						if (additionalFields.registration) body.registration = additionalFields.registration;
						if (additionalFields.make) body.make = additionalFields.make;
						if (additionalFields.model) body.model = additionalFields.model;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.registrationYear) body.registrationYear = additionalFields.registrationYear;
						if (additionalFields.fixedResourceId) body.fixedResourceId = additionalFields.fixedResourceId;
						const raw = await vh3ListApiRequest.call(this, '/vehicles/update', body);
						responseData = [raw];
					}
				}

				// ── WORKSHEETS ────────────────────────────────────────────
				else if (resource === 'worksheets') {
					if (operation === 'listWorksheetDefinitions') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/worksheet/worksheet_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/worksheet/worksheet_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listWorksheetAnswers') {
						const jobIdsRaw = this.getNodeParameter('jobIds', i) as string;
						const entityId = jobIdsRaw.split(',').map((v) => parseInt(v.trim(), 10)).filter((v) => !isNaN(v));
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { entityId, entityType: 'job' };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/worksheet/worksheet_answers_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/worksheet/worksheet_answers_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getWorksheet') {
						const worksheetId = this.getNodeParameter('worksheetId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { worksheetId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/worksheet/worksheet_get', qs);
						responseData = [raw];
					} else if (operation === 'getWorksheetQuestions') {
						const worksheetId = this.getNodeParameter('worksheetId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { worksheetId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/worksheet/worksheet_questions_get', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/worksheet/worksheet_questions_get', body);
							responseData = extractItems(raw).items;
						}
					}
				}

				// ── WORKSHEET GROUPS ──────────────────────────────────────
				else if (resource === 'worksheetGroups') {
					if (operation === 'listWorksheetGroups') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/worksheet_groups/worksheet_group_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/worksheet_groups/worksheet_group_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getWorksheetGroup') {
						const groupId = this.getNodeParameter('groupId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { worksheetGroupId: groupId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/worksheet_groups/worksheet_group_get', qs);
						responseData = [raw];
					}
				}

				// ── INVOICES ──────────────────────────────────────────────
				else if (resource === 'invoices') {
					if (operation === 'listInvoices') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (additionalFields.jobId) body.jobId = parseIds(additionalFields.jobId);
						if (additionalFields.contactId) body.contactId = parseIds(additionalFields.contactId);
						if (additionalFields.reference) body.reference = parseTexts(additionalFields.reference);
						const invoicesCreatedAtFrom = toUtcDateTime(additionalFields.createdAtFrom);
						if (invoicesCreatedAtFrom) body.createdAtFrom = invoicesCreatedAtFrom;
						const invoicesCreatedAtTo = toUtcDateTime(additionalFields.createdAtTo);
						if (invoicesCreatedAtTo) body.createdAtTo = invoicesCreatedAtTo;
						// BigChange requires at least one filter or date range. If caller
						// supplied neither, default to a 12-month window ending now.
						const hasInvoiceFilter =
							body.jobId !== undefined ||
							body.contactId !== undefined ||
							body.reference !== undefined ||
							additionalFields.id !== undefined ||
							additionalFields.jobGroupId !== undefined;
						const hasInvoiceDateRange = body.createdAtFrom || body.createdAtTo;
						if (!hasInvoiceFilter && !hasInvoiceDateRange) {
							const range = defaultCreatedAtRange(12);
							body.createdAtFrom = range.createdAtFrom;
							body.createdAtTo = range.createdAtTo;
						}
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/invoices/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/invoices/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getInvoice') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { invoiceId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/invoices/invoice', qs);
						responseData = [raw];
				} else if (operation === 'createInvoice') {
					const currencyCode = this.getNodeParameter('currencyCode', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
					const body: JsonObject = { currencyCode };
					if (additionalFields.jobId) body.jobId = additionalFields.jobId;
					if (additionalFields.jobGroupId) body.jobGroupId = additionalFields.jobGroupId;
					if (additionalFields.contactId) body.contactId = additionalFields.contactId;
					if (additionalFields.deliverySiteContactId) body.deliverySiteContactId = additionalFields.deliverySiteContactId;
					if (additionalFields.reference) body.reference = additionalFields.reference;
					const createdAt = toUtcDateTime(additionalFields.createdAt);
					if (createdAt) body.createdAt = createdAt;
					if (additionalFields.bankAccountId) body.bankAccountId = additionalFields.bankAccountId;
					if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
					if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
					if (additionalFields.clientNotes) body.clientNotes = additionalFields.clientNotes;
					if (additionalFields.internalNotes) body.internalNotes = additionalFields.internalNotes;
					const customFieldsData = this.getNodeParameter('customFields', i, {}) as { values?: Array<{ definitionId: number; value: string }> };
					if (customFieldsData.values && customFieldsData.values.length > 0) {
						body.customFields = customFieldsData.values.map((cf) => ({
							definitionId: cf.definitionId,
							value: cf.value,
						})) as unknown as JsonObject;
					}
					const raw = await vh3ListApiRequest.call(this, '/invoices/create', body);
					responseData = [raw];
					} else if (operation === 'editInvoice') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { invoiceId };
						if (additionalFields.clientNotes) body.clientNotes = additionalFields.clientNotes;
						if (additionalFields.internalNotes) body.internalNotes = additionalFields.internalNotes;
						const raw = await vh3ListApiRequest.call(this, '/invoices/edit', body);
						responseData = [raw];
					} else if (operation === 'cancelInvoice') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/invoices/cancel', { invoiceId });
						responseData = [raw];
					} else if (operation === 'markInvoicePaid') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { invoiceId };
						const paidAt = toUtcDateTime(additionalFields.paidAt);
						if (paidAt) body.paidAt = paidAt;
						const raw = await vh3ListApiRequest.call(this, '/invoices/mark_paid', body);
						responseData = [raw];
					} else if (operation === 'markInvoiceSent') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/invoices/mark_sent', { invoiceId });
						responseData = [raw];
					} else if (operation === 'listInvoiceLineItems') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { invoiceId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/invoices/line_item/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/invoices/line_item/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getInvoiceLineItem') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { invoiceId, lineItemId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/invoices/line_item', qs);
						responseData = [raw];
					} else if (operation === 'createInvoiceLineItem') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const description = this.getNodeParameter('description', i) as string;
						const quantity = this.getNodeParameter('quantity', i) as number;
						const unitCost = this.getNodeParameter('unitCost', i) as number;
						const unitSellingPrice = this.getNodeParameter('unitSellingPrice', i) as number;
						const taxId = this.getNodeParameter('taxId', i) as number;
						const nominalCodeId = this.getNodeParameter('nominalCodeId', i) as number;
						const departmentCodeId = this.getNodeParameter('departmentCodeId', i) as number;
						const body: JsonObject = {
							invoiceId, contactId, description, quantity,
							unitCost, unitSellingPrice, taxId, nominalCodeId, departmentCodeId,
						};
						const raw = await vh3ListApiRequest.call(this, '/invoices/line_item/create', body);
						responseData = [raw];
					} else if (operation === 'deleteInvoiceLineItem') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/invoices/line_item/delete', { invoiceId, lineItemId });
						responseData = [raw];
					}
				}

				// ── QUOTES ────────────────────────────────────────────────
				else if (resource === 'quotes') {
					if (operation === 'listQuotes') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (additionalFields.id) body.id = parseIds(additionalFields.id);
						if (additionalFields.jobId) body.jobId = parseIds(additionalFields.jobId);
						if (additionalFields.jobGroupId) body.jobGroupId = parseIds(additionalFields.jobGroupId);
						if (additionalFields.contactId) body.contactId = parseIds(additionalFields.contactId);
						if (additionalFields.reference) body.reference = parseTexts(additionalFields.reference);
						const quotesCreatedAtFrom = toUtcDateTime(additionalFields.createdAtFrom);
						if (quotesCreatedAtFrom) body.createdAtFrom = quotesCreatedAtFrom;
						const quotesCreatedAtTo = toUtcDateTime(additionalFields.createdAtTo);
						if (quotesCreatedAtTo) body.createdAtTo = quotesCreatedAtTo;
						// BigChange requires at least one filter or date range. If caller
						// supplied neither, default to a 12-month window ending now.
						const hasQuoteFilter =
							body.id !== undefined ||
							body.jobId !== undefined ||
							body.jobGroupId !== undefined ||
							body.contactId !== undefined ||
							body.reference !== undefined;
						const hasQuoteDateRange = body.createdAtFrom || body.createdAtTo;
						if (!hasQuoteFilter && !hasQuoteDateRange) {
							const range = defaultCreatedAtRange(12);
							body.createdAtFrom = range.createdAtFrom;
							body.createdAtTo = range.createdAtTo;
						}
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/quotes/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/quotes/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getQuote') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { quoteId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/quotes/quote', qs);
						responseData = [raw];
					} else if (operation === 'createQuote') {
						const currencyCode = this.getNodeParameter('currencyCode', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { currencyCode };
						if (additionalFields.jobId) body.jobId = additionalFields.jobId;
						if (additionalFields.jobGroupId) body.jobGroupId = additionalFields.jobGroupId;
						if (additionalFields.contactId) body.contactId = additionalFields.contactId;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.deliverySiteContactId) {
							body.deliverySiteContactId = additionalFields.deliverySiteContactId;
						}
						if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
						if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
						if (additionalFields.clientNotes) body.clientNotes = additionalFields.clientNotes;
						if (additionalFields.internalNotes) body.internalNotes = additionalFields.internalNotes;
						if (typeof additionalFields.daysValidFor === 'number') {
							body.daysValidFor = additionalFields.daysValidFor;
						}
						const quoteCreatedAt = toUtcDateTime(additionalFields.createdAt);
						if (quoteCreatedAt) body.createdAt = quoteCreatedAt;
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as {
							values?: Array<{ definitionId: number; value: string }>;
						};
						if (customFieldsData.values && customFieldsData.values.length > 0) {
							body.customFields = customFieldsData.values.map((cf) => ({
								definitionId: cf.definitionId,
								value: cf.value,
							})) as unknown as JsonObject;
						}
						const raw = await vh3ListApiRequest.call(this, '/quotes/create', body);
						responseData = [raw];
					} else if (operation === 'editQuote') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { quoteId };
						if (additionalFields.deliverySiteContactId) {
							body.deliverySiteContactId = additionalFields.deliverySiteContactId;
						}
						if (additionalFields.clientNotes) body.clientNotes = additionalFields.clientNotes;
						if (additionalFields.internalNotes) body.internalNotes = additionalFields.internalNotes;
						if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
						if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
						if (typeof additionalFields.daysValidFor === 'number') {
							body.daysValidFor = additionalFields.daysValidFor;
						}
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as {
							values?: Array<{ definitionId: number; value: string }>;
						};
						if (customFieldsData.values && customFieldsData.values.length > 0) {
							body.customFields = customFieldsData.values.map((cf) => ({
								definitionId: cf.definitionId,
								value: cf.value,
							})) as unknown as JsonObject;
						}
						const raw = await vh3ListApiRequest.call(this, '/quotes/edit', body);
						responseData = [raw];
					} else if (operation === 'listQuoteLineItems') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { quoteId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/quotes/line_item/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/quotes/line_item/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getQuoteLineItem') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { quoteId, lineItemId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/quotes/line_item', qs);
						responseData = [raw];
					} else if (operation === 'createQuoteLineItem') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const description = this.getNodeParameter('description', i) as string;
						const quantity = this.getNodeParameter('quantity', i) as number;
						const unitCost = this.getNodeParameter('unitCost', i) as number;
						const unitSellingPrice = this.getNodeParameter('unitSellingPrice', i) as number;
						const taxId = this.getNodeParameter('taxId', i) as number;
						const nominalCodeId = this.getNodeParameter('nominalCodeId', i) as number;
						const departmentCodeId = this.getNodeParameter('departmentCodeId', i) as number;
						const body: JsonObject = {
							quoteId,
							contactId,
							description,
							quantity,
							unitCost,
							unitSellingPrice,
							taxId,
							nominalCodeId,
							departmentCodeId,
						};
						const raw = await vh3ListApiRequest.call(this, '/quotes/line_item/create', body);
						responseData = [raw];
					} else if (operation === 'editQuoteLineItem') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const description = this.getNodeParameter('description', i) as string;
						const quantity = this.getNodeParameter('quantity', i) as number;
						const unitCost = this.getNodeParameter('unitCost', i) as number;
						const unitSellingPrice = this.getNodeParameter('unitSellingPrice', i) as number;
						const taxId = this.getNodeParameter('taxId', i) as number;
						const nominalCodeId = this.getNodeParameter('nominalCodeId', i) as number;
						const departmentCodeId = this.getNodeParameter('departmentCodeId', i) as number;
						const body: JsonObject = {
							quoteId,
							lineItemId,
							description,
							quantity,
							unitCost,
							unitSellingPrice,
							taxId,
							nominalCodeId,
							departmentCodeId,
						};
						const raw = await vh3ListApiRequest.call(this, '/quotes/line_item/edit', body);
						responseData = [raw];
					} else if (operation === 'deleteQuoteLineItem') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/quotes/line_item/delete', {
							quoteId,
							lineItemId,
						});
						responseData = [raw];
					} else if (operation === 'markQuoteSent') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { quoteId };
						const sentAt = toUtcDateTime(additionalFields.sentAt);
						if (sentAt) body.sentAt = sentAt;
						const raw = await vh3ListApiRequest.call(this, '/quotes/mark_sent', body);
						responseData = [raw];
					} else if (operation === 'markQuoteAccepted') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/quotes/mark_accepted', { quoteId });
						responseData = [raw];
					} else if (operation === 'markQuoteRejected') {
						const quoteId = this.getNodeParameter('quoteId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/quotes/mark_rejected', { quoteId });
						responseData = [raw];
					}
				}

				// ── SALES OPPORTUNITIES ───────────────────────────────────
				else if (resource === 'salesOpportunities') {
					if (operation === 'listSalesOpportunities') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (additionalFields.id) body.id = parseIds(additionalFields.id);
						if (additionalFields.status) body.status = parseTexts(additionalFields.status);
						if (typeof additionalFields.contactId === 'number' && additionalFields.contactId > 0) {
							body.contactId = additionalFields.contactId;
						}
						if (typeof additionalFields.ownerId === 'number' && additionalFields.ownerId > 0) {
							body.ownerId = additionalFields.ownerId;
						}
						if (additionalFields.reference) body.reference = parseTexts(additionalFields.reference);
						const soCreatedAtFrom = toUtcDateTime(additionalFields.createdAtFrom);
						if (soCreatedAtFrom) body.createdAtFrom = soCreatedAtFrom;
						const soCreatedAtTo = toUtcDateTime(additionalFields.createdAtTo);
						if (soCreatedAtTo) body.createdAtTo = soCreatedAtTo;
						const soDueDateFrom = toUtcDateTime(additionalFields.dueDateFrom);
						if (soDueDateFrom) body.dueDateFrom = soDueDateFrom;
						const soDueDateTo = toUtcDateTime(additionalFields.dueDateTo);
						if (soDueDateTo) body.dueDateTo = soDueDateTo;
						// BigChange requires at least one filter or date range. If caller
						// supplied neither, default to a 12-month createdAt window ending now.
						const hasSoFilter =
							body.id !== undefined ||
							body.status !== undefined ||
							body.contactId !== undefined ||
							body.ownerId !== undefined ||
							body.reference !== undefined;
						const hasSoDateRange =
							body.createdAtFrom || body.createdAtTo || body.dueDateFrom || body.dueDateTo;
						if (!hasSoFilter && !hasSoDateRange) {
							const range = defaultCreatedAtRange(12);
							body.createdAtFrom = range.createdAtFrom;
							body.createdAtTo = range.createdAtTo;
						}
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/sales_opportunities/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getSalesOpportunity') {
						const salesOpportunityId = this.getNodeParameter('salesOpportunityId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { salesOpportunityId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/sales_opportunities/sales_opportunity', qs);
						responseData = [raw];
					} else if (operation === 'editSalesOpportunity') {
						const salesOpportunityId = this.getNodeParameter('salesOpportunityId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { salesOpportunityId };
						if (additionalFields.contactId) body.contactId = additionalFields.contactId;
						if (additionalFields.ownerId) body.ownerId = additionalFields.ownerId;
						if (additionalFields.stageId) body.stageId = additionalFields.stageId;
						if (additionalFields.probabilityId) body.probabilityId = additionalFields.probabilityId;
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
						if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
						if (additionalFields.clientNotes) body.clientNotes = additionalFields.clientNotes;
						if (additionalFields.internalNotes) body.internalNotes = additionalFields.internalNotes;
						const soDueDate = toUtcDateTime(additionalFields.dueDate);
						if (soDueDate) body.dueDate = soDueDate;
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as {
							values?: Array<{ definitionId: number; value: string }>;
						};
						if (customFieldsData.values && customFieldsData.values.length > 0) {
							body.customFields = customFieldsData.values.map((cf) => ({
								definitionId: cf.definitionId,
								value: cf.value,
							})) as unknown as JsonObject;
						}
						const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/edit', body);
						responseData = [raw];
					} else if (operation === 'listSalesOpportunityProbabilities') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/sales_opportunities/probabilities/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/probabilities/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listSalesOpportunityStages') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/sales_opportunities/stages/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/stages/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listSalesOpportunityLineItems') {
						const salesOpportunityId = this.getNodeParameter('salesOpportunityId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { salesOpportunityId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/sales_opportunities/line_item/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/line_item/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getSalesOpportunityLineItem') {
						const salesOpportunityId = this.getNodeParameter('salesOpportunityId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { salesOpportunityId, lineItemId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/sales_opportunities/line_item', qs);
						responseData = [raw];
					} else if (operation === 'createSalesOpportunityLineItem') {
						const salesOpportunityId = this.getNodeParameter('salesOpportunityId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const description = this.getNodeParameter('description', i) as string;
						const quantity = this.getNodeParameter('quantity', i) as number;
						const unitCost = this.getNodeParameter('unitCost', i) as number;
						const unitSellingPrice = this.getNodeParameter('unitSellingPrice', i) as number;
						const taxId = this.getNodeParameter('taxId', i) as number;
						const nominalCodeId = this.getNodeParameter('nominalCodeId', i) as number;
						const departmentCodeId = this.getNodeParameter('departmentCodeId', i) as number;
						const body: JsonObject = {
							salesOpportunityId,
							contactId,
							description,
							quantity,
							unitCost,
							unitSellingPrice,
							taxId,
							nominalCodeId,
							departmentCodeId,
						};
						const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/line_item/create', body);
						responseData = [raw];
					} else if (operation === 'editSalesOpportunityLineItem') {
						const salesOpportunityId = this.getNodeParameter('salesOpportunityId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { salesOpportunityId, lineItemId };
						if (additionalFields.description) body.description = additionalFields.description;
						if (typeof additionalFields.quantity === 'number') body.quantity = additionalFields.quantity;
						if (typeof additionalFields.unitCost === 'number') body.unitCost = additionalFields.unitCost;
						if (typeof additionalFields.unitSellingPrice === 'number') {
							body.unitSellingPrice = additionalFields.unitSellingPrice;
						}
						if (additionalFields.taxId) body.taxId = additionalFields.taxId;
						if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
						if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
						const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/line_item/edit', body);
						responseData = [raw];
					} else if (operation === 'deleteSalesOpportunityLineItem') {
						const salesOpportunityId = this.getNodeParameter('salesOpportunityId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/sales_opportunities/line_item/delete', {
							salesOpportunityId,
							lineItemId,
						});
						responseData = [raw];
					}
				}

				// ── PURCHASE ORDERS ───────────────────────────────────────
				else if (resource === 'purchaseOrders') {
					if (operation === 'listPurchaseOrders') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (additionalFields.id) body.id = parseIds(additionalFields.id);
						if (additionalFields.jobId) body.jobId = parseIds(additionalFields.jobId);
						if (additionalFields.jobGroupId) body.jobGroupId = parseIds(additionalFields.jobGroupId);
						if (additionalFields.contactId) body.contactId = parseIds(additionalFields.contactId);
						if (additionalFields.reference) body.reference = parseTexts(additionalFields.reference);
						const poCreatedAtFrom = toUtcDateTime(additionalFields.createdAtFrom);
						if (poCreatedAtFrom) body.createdAtFrom = poCreatedAtFrom;
						const poCreatedAtTo = toUtcDateTime(additionalFields.createdAtTo);
						if (poCreatedAtTo) body.createdAtTo = poCreatedAtTo;
						// BigChange requires at least one filter or date range. If caller
						// supplied neither, default to a 12-month window ending now.
						const hasPoFilter =
							body.id !== undefined ||
							body.jobId !== undefined ||
							body.jobGroupId !== undefined ||
							body.contactId !== undefined ||
							body.reference !== undefined;
						const hasPoDateRange = body.createdAtFrom || body.createdAtTo;
						if (!hasPoFilter && !hasPoDateRange) {
							const range = defaultCreatedAtRange(12);
							body.createdAtFrom = range.createdAtFrom;
							body.createdAtTo = range.createdAtTo;
						}
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/purchase_orders/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/purchase_orders/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getPurchaseOrder') {
						const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { purchaseOrderId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/purchase_orders/purchase_order', qs);
						responseData = [raw];
					} else if (operation === 'createPurchaseOrder') {
						const supplierId = this.getNodeParameter('supplierId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { supplierId };
						if (additionalFields.currencyCode) body.currencyCode = additionalFields.currencyCode;
						if (additionalFields.jobId) body.jobId = additionalFields.jobId;
						if (additionalFields.jobGroupId) body.jobGroupId = additionalFields.jobGroupId;
						if (additionalFields.contactId) body.contactId = additionalFields.contactId;
						if (additionalFields.deliverySiteContactId) {
							body.deliverySiteContactId = additionalFields.deliverySiteContactId;
						}
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.seriesId) body.seriesId = additionalFields.seriesId;
						const poCreatedAt = toUtcDateTime(additionalFields.createdAt);
						if (poCreatedAt) body.createdAt = poCreatedAt;
						if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
						if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
						if (additionalFields.clientNotes) body.clientNotes = additionalFields.clientNotes;
						if (additionalFields.internalNotes) body.internalNotes = additionalFields.internalNotes;
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as {
							values?: Array<{ definitionId: number; value: string }>;
						};
						if (customFieldsData.values && customFieldsData.values.length > 0) {
							body.customFields = customFieldsData.values.map((cf) => ({
								definitionId: cf.definitionId,
								value: cf.value,
							})) as unknown as JsonObject;
						}
						const raw = await vh3ListApiRequest.call(this, '/purchase_orders/create', body);
						responseData = [raw];
					} else if (operation === 'editPurchaseOrder') {
						const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { purchaseOrderId };
						if (additionalFields.deliverySiteContactId) {
							body.deliverySiteContactId = additionalFields.deliverySiteContactId;
						}
						if (additionalFields.reference) body.reference = additionalFields.reference;
						if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
						if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
						if (additionalFields.clientNotes) body.clientNotes = additionalFields.clientNotes;
						if (additionalFields.internalNotes) body.internalNotes = additionalFields.internalNotes;
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as {
							values?: Array<{ definitionId: number; value: string }>;
						};
						if (customFieldsData.values && customFieldsData.values.length > 0) {
							body.customFields = customFieldsData.values.map((cf) => ({
								definitionId: cf.definitionId,
								value: cf.value,
							})) as unknown as JsonObject;
						}
						const raw = await vh3ListApiRequest.call(this, '/purchase_orders/edit', body);
						responseData = [raw];
					} else if (operation === 'listPurchaseOrderSeries') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/purchase_orders/series/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/purchase_orders/series/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getPurchaseOrderSeries') {
						const seriesId = this.getNodeParameter('seriesId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { seriesId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/purchase_orders/series', qs);
						responseData = [raw];
					} else if (operation === 'listPurchaseOrderLineItems') {
						const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { purchaseOrderId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/purchase_orders/line_item/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/purchase_orders/line_item/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getPurchaseOrderLineItem') {
						const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { purchaseOrderId, lineItemId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/purchase_orders/line_item', qs);
						responseData = [raw];
					} else if (operation === 'createPurchaseOrderLineItem') {
						const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const description = this.getNodeParameter('description', i) as string;
						const quantity = this.getNodeParameter('quantity', i) as number;
						const unitCost = this.getNodeParameter('unitCost', i) as number;
						const unitSellingPrice = this.getNodeParameter('unitSellingPrice', i) as number;
						const taxId = this.getNodeParameter('taxId', i) as number;
						const nominalCodeId = this.getNodeParameter('nominalCodeId', i) as number;
						const departmentCodeId = this.getNodeParameter('departmentCodeId', i) as number;
						const body: JsonObject = {
							purchaseOrderId,
							contactId,
							description,
							quantity,
							unitCost,
							unitSellingPrice,
							taxId,
							nominalCodeId,
							departmentCodeId,
						};
						const raw = await vh3ListApiRequest.call(this, '/purchase_orders/line_item/create', body);
						responseData = [raw];
					} else if (operation === 'editPurchaseOrderLineItem') {
						const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { purchaseOrderId, lineItemId };
						if (additionalFields.description) body.description = additionalFields.description;
						if (typeof additionalFields.quantity === 'number') body.quantity = additionalFields.quantity;
						if (typeof additionalFields.unitCost === 'number') body.unitCost = additionalFields.unitCost;
						if (typeof additionalFields.unitSellingPrice === 'number') {
							body.unitSellingPrice = additionalFields.unitSellingPrice;
						}
						if (additionalFields.taxId) body.taxId = additionalFields.taxId;
						if (additionalFields.nominalCodeId) body.nominalCodeId = additionalFields.nominalCodeId;
						if (additionalFields.departmentCodeId) body.departmentCodeId = additionalFields.departmentCodeId;
						const raw = await vh3ListApiRequest.call(this, '/purchase_orders/line_item/edit', body);
						responseData = [raw];
					} else if (operation === 'deletePurchaseOrderLineItem') {
						const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
						const lineItemId = this.getNodeParameter('lineItemId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/purchase_orders/line_item/delete', {
							purchaseOrderId,
							lineItemId,
						});
						responseData = [raw];
					}
				}

				// ── NOTES ─────────────────────────────────────────────────
				else if (resource === 'notes') {
					if (operation === 'listNotes') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (additionalFields.entityType) body.entityType = additionalFields.entityType;
						if (additionalFields.entityId) body.entityId = parseIds(additionalFields.entityId);
						if (additionalFields.typeId) body.typeId = parseIds(additionalFields.typeId);
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.contactId) body.contactId = parseIds(additionalFields.contactId);
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/notes/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/notes/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getNote') {
						const noteId = this.getNodeParameter('noteId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { id: noteId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/notes/note', qs);
						responseData = [raw];
					} else if (operation === 'createNote') {
						const entityType = this.getNodeParameter('entityType', i) as string;
						const entityId = this.getNodeParameter('entityId', i) as number;
						const typeId = this.getNodeParameter('typeId', i) as number;
						const subject = this.getNodeParameter('subject', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { entityType, entityId, typeId, subject };
						if (additionalFields.description) body.description = additionalFields.description;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						const createNoteDueAt = toUtcDateTime(additionalFields.dueAt);
						if (createNoteDueAt) body.dueAt = createNoteDueAt;
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.ownedByUserId) body.ownedByUserId = additionalFields.ownedByUserId;
						const raw = await vh3ListApiRequest.call(this, '/notes/create', body);
						responseData = [raw];
					} else if (operation === 'editNote') {
						const noteId = this.getNodeParameter('noteId', i) as number;
						const entityType = this.getNodeParameter('entityType', i) as string;
						const entityId = this.getNodeParameter('entityId', i) as number;
						const typeId = this.getNodeParameter('typeId', i) as number;
						const subject = this.getNodeParameter('subject', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { noteId, entityType, entityId, typeId, subject };
						if (additionalFields.description) body.description = additionalFields.description;
						if (additionalFields.reference) body.reference = additionalFields.reference;
						const editNoteDueAt = toUtcDateTime(additionalFields.dueAt);
						if (editNoteDueAt) body.dueAt = editNoteDueAt;
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.ownedByUserId) body.ownedByUserId = additionalFields.ownedByUserId;
						const raw = await vh3ListApiRequest.call(this, '/notes/edit', body);
						responseData = [raw];
					} else if (operation === 'createProgressUpdate') {
						const noteId = this.getNodeParameter('noteId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { noteId };
						if (additionalFields.comment) body.comment = additionalFields.comment;
						const raw = await vh3ListApiRequest.call(this, '/notes/progress_update', body);
						responseData = [raw];
					} else if (operation === 'listNoteTypes') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/note_types/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/note_types/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getNoteType') {
						const noteTypeId = this.getNodeParameter('noteTypeId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { noteTypeId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/note_types/note', qs);
						responseData = [raw];
					}
				}

				// ── PERSONS ───────────────────────────────────────────────
				else if (resource === 'persons') {
					if (operation === 'listPersons') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (additionalFields.contactId) body.contactId = parseIds(additionalFields.contactId);
						if (additionalFields.surname) body.surname = additionalFields.surname;
						if (additionalFields.email) body.email = additionalFields.email;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/persons/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/persons/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getPerson') {
						const personId = this.getNodeParameter('personId', i) as string;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { personId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/persons/person', qs);
						responseData = [raw];
					} else if (operation === 'createPerson') {
						const contactId = this.getNodeParameter('contactId', i) as number;
						const forename = this.getNodeParameter('forename', i) as string;
						const surname = this.getNodeParameter('surname', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { contactId, forename, surname };
						if (additionalFields.title) body.title = additionalFields.title;
						if (additionalFields.email) body.email = additionalFields.email;
						if (additionalFields.mobile) body.mobile = additionalFields.mobile;
						if (additionalFields.landline) body.landline = additionalFields.landline;
						if (additionalFields.position) body.position = additionalFields.position;
						if (additionalFields.department) body.department = additionalFields.department;
						if (additionalFields.isOptedOut !== undefined) body.isOptedOut = additionalFields.isOptedOut;
						const raw = await vh3ListApiRequest.call(this, '/persons/create', body);
						responseData = [raw];
					} else if (operation === 'listConsentHistory') {
						const personId = this.getNodeParameter('personId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { personId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/persons/consent/history', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/persons/consent/history', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'editPerson') {
						const personId = this.getNodeParameter('personId', i) as string;
						const forename = this.getNodeParameter('forename', i) as string;
						const surname = this.getNodeParameter('surname', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { personId, forename, surname };
						if (additionalFields.title) body.title = additionalFields.title;
						if (additionalFields.email) body.email = additionalFields.email;
						if (additionalFields.mobile) body.mobile = additionalFields.mobile;
						if (additionalFields.landline) body.landline = additionalFields.landline;
						if (additionalFields.position) body.position = additionalFields.position;
						if (additionalFields.department) body.department = additionalFields.department;
						if (additionalFields.isOptedOut !== undefined) body.isOptedOut = additionalFields.isOptedOut;
						const raw = await vh3ListApiRequest.call(this, '/persons/edit', body);
						responseData = [raw];
					}
				}

				// ── JOB GROUPS ────────────────────────────────────────────
				else if (resource === 'jobGroups') {
					if (operation === 'listJobGroups') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/job_groups/list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/job_groups/list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getJobGroup') {
						const jobGroupId = this.getNodeParameter('jobGroupId', i) as number;
						const body: JsonObject = { jobGroupId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						const raw = await vh3ListApiRequest.call(this, '/job_groups/job_group', body);
						responseData = [raw];
					} else if (operation === 'createJobGroup') {
						const contactId = this.getNodeParameter('contactId', i) as number;
						const isShownOnDevice = this.getNodeParameter('isShownOnDevice', i) as boolean;
						const areJobsLinked = this.getNodeParameter('areJobsLinked', i) as boolean;
						const plannedStartOption = this.getNodeParameter('plannedStartOption', i) as string;
						const plannedEndOption = this.getNodeParameter('plannedEndOption', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { contactId, isShownOnDevice, areJobsLinked, plannedStartOption, plannedEndOption };
						if (additionalFields.title) body.title = additionalFields.title;
						if (additionalFields.orderNumber) body.orderNumber = additionalFields.orderNumber;
						const createJobGroupStartAt = toUtcDateTime(additionalFields.plannedStartAt);
						if (createJobGroupStartAt) body.plannedStartAt = createJobGroupStartAt;
						const createJobGroupEndAt = toUtcDateTime(additionalFields.plannedEndAt);
						if (createJobGroupEndAt) body.plannedEndAt = createJobGroupEndAt;
						if (additionalFields.categoryId) body.categoryId = additionalFields.categoryId;
						const raw = await vh3ListApiRequest.call(this, '/job_groups/create', body);
						responseData = [raw];
					} else if (operation === 'editJobGroup') {
						const jobGroupId = this.getNodeParameter('jobGroupId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { jobGroupId };
						if (additionalFields.title) body.title = additionalFields.title;
						if (additionalFields.orderNumber) body.orderNumber = additionalFields.orderNumber;
						const editJobGroupStartAt = toUtcDateTime(additionalFields.plannedStartAt);
						if (editJobGroupStartAt) body.plannedStartAt = editJobGroupStartAt;
						const editJobGroupEndAt = toUtcDateTime(additionalFields.plannedEndAt);
						if (editJobGroupEndAt) body.plannedEndAt = editJobGroupEndAt;
						if (additionalFields.categoryId) body.categoryId = additionalFields.categoryId;
						const raw = await vh3ListApiRequest.call(this, '/job_groups/edit', body);
						responseData = [raw];
					} else if (operation === 'markJobGroupComplete') {
						const jobGroupId = this.getNodeParameter('jobGroupId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/job_groups/job_group_results_as_complete', { jobGroupId });
						responseData = [raw];
					} else if (operation === 'markJobGroupFinanciallyComplete') {
						const jobGroupId = this.getNodeParameter('jobGroupId', i) as number;
						const raw = await vh3ListApiRequest.call(this, '/job_groups/job_group_results_as_financially_complete', { jobGroupId });
						responseData = [raw];
					} else if (operation === 'listJobGroupStatusHistory') {
						const jobGroupId = this.getNodeParameter('jobGroupId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { jobGroupId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/job_groups/status_history', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/job_groups/status_history', body);
							responseData = extractItems(raw).items;
						}
					}
				}

				// ── STOCK ─────────────────────────────────────────────────
				else if (resource === 'stock') {
					if (operation === 'listProductCategories') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.name) body.name = additionalFields.name;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/stock/product_categories_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/stock/product_categories_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listStockDetails') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.productCategoryId) body.productCategoryId = parseIds(additionalFields.productCategoryId);
						if (additionalFields.isConsumable !== undefined) body.isConsumable = additionalFields.isConsumable;
						if (additionalFields.stockCode) body.stockCode = parseTexts(additionalFields.stockCode);
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/stock/stock_details_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/stock/stock_details_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getStockDetails') {
						const stockDetailsId = this.getNodeParameter('stockDetailsId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { stockDetailsId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/stock/stock_details', qs);
						responseData = [raw];
					} else if (operation === 'createStockDetails') {
						const model = this.getNodeParameter('model', i) as string;
						const productCategoryId = this.getNodeParameter('productCategoryId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { model, productCategoryId };
						if (additionalFields.make) body.make = additionalFields.make;
						if (additionalFields.stockCode) body.stockCode = additionalFields.stockCode;
						if (additionalFields.batchNumber) body.batchNumber = additionalFields.batchNumber;
						if (additionalFields.isConsumable !== undefined) body.isConsumable = additionalFields.isConsumable;
						const raw = await vh3ListApiRequest.call(this, '/stock/stock_details_create', body);
						responseData = [raw];
					} else if (operation === 'updateStockDetails') {
						const stockDetailsId = this.getNodeParameter('stockDetailsId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { stockDetailsId };
						if (additionalFields.model) body.model = additionalFields.model;
						if (additionalFields.productCategoryId) body.productCategoryId = additionalFields.productCategoryId;
						if (additionalFields.make) body.make = additionalFields.make;
						if (additionalFields.stockCode) body.stockCode = additionalFields.stockCode;
						if (additionalFields.batchNumber) body.batchNumber = additionalFields.batchNumber;
						if (additionalFields.isConsumable !== undefined) body.isConsumable = additionalFields.isConsumable;
						const raw = await vh3ListApiRequest.call(this, '/stock/stock_details_update', body);
						responseData = [raw];
					} else if (operation === 'listStockItems') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.stockDetailsId) body.stockDetailsId = parseIds(additionalFields.stockDetailsId);
						if (additionalFields.serialNumber) body.serialNumber = additionalFields.serialNumber;
						if (additionalFields.locationContactId) body.locationContactId = additionalFields.locationContactId;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/stock/stock_item_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/stock/stock_item_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getStockItem') {
						const stockItemId = this.getNodeParameter('stockItemId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { stockItemId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/stock/stock/item_get', qs);
						responseData = [raw];
					} else if (operation === 'createStockItem') {
						const stockDetailsId = this.getNodeParameter('stockDetailsId', i) as number;
						const model = this.getNodeParameter('model', i) as string;
						const productCategoryId = this.getNodeParameter('productCategoryId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { stockDetailsId, model, productCategoryId };
						if (additionalFields.serialNumber) body.serialNumber = additionalFields.serialNumber;
						if (additionalFields.make) body.make = additionalFields.make;
						if (additionalFields.notes) body.notes = additionalFields.notes;
						if (additionalFields.quantity) body.quantity = additionalFields.quantity;
						if (additionalFields.locationContactId) body.locationContactId = additionalFields.locationContactId;
						if (additionalFields.condition) body.condition = additionalFields.condition;
						const raw = await vh3ListApiRequest.call(this, '/stock/stock_item_create', body);
						responseData = [raw];
					} else if (operation === 'updateStockItem') {
						const stockItemId = this.getNodeParameter('stockItemId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { stockItemId };
						if (additionalFields.serialNumber) body.serialNumber = additionalFields.serialNumber;
						if (additionalFields.make) body.make = additionalFields.make;
						if (additionalFields.notes) body.notes = additionalFields.notes;
						if (additionalFields.quantity) body.quantity = additionalFields.quantity;
						if (additionalFields.locationContactId) body.locationContactId = additionalFields.locationContactId;
						if (additionalFields.condition) body.condition = additionalFields.condition;
						const raw = await vh3ListApiRequest.call(this, '/stock/stock_item_update', body);
						responseData = [raw];
					} else if (operation === 'listStockMovements') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						const pickUpAtFrom = toUtcDateTime(additionalFields.pickupAtFrom);
						if (pickUpAtFrom) body.pickUpAtFrom = pickUpAtFrom;
						const pickUpAtTo = toUtcDateTime(additionalFields.pickupAtTo);
						if (pickUpAtTo) body.pickUpAtTo = pickUpAtTo;
						const dropOffAtFrom = toUtcDateTime(additionalFields.dropOffAtFrom);
						if (dropOffAtFrom) body.dropOffAtFrom = dropOffAtFrom;
						const dropOffAtTo = toUtcDateTime(additionalFields.dropOffAtTo);
						if (dropOffAtTo) body.dropOffAtTo = dropOffAtTo;
						if (additionalFields.jobId) body.jobId = parseIds(additionalFields.jobId);
						if (additionalFields.stockDetailsId) body.stockDetailsId = parseIds(additionalFields.stockDetailsId);
						if (additionalFields.stockItemId) body.stockItemId = parseIds(additionalFields.stockItemId);
						if (additionalFields.vehicleId) body.vehicleId = parseIds(additionalFields.vehicleId);
						if (additionalFields.dropOffContactId) body.dropOffContactId = parseIds(additionalFields.dropOffContactId);
						if (additionalFields.dropOffVehicleId) body.dropOffVehicleId = parseIds(additionalFields.dropOffVehicleId);
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/stock/stock_movements_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/stock/stock_movements_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listStockSuppliers') {
						const stockDetailsId = this.getNodeParameter('stockDetailsId', i) as number;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const body: JsonObject = { stockDetailsId };
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/stock/stock_supplier_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/stock/stock_supplier_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getProductCategory') {
						const productCategoryId = this.getNodeParameter('productCategoryId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { productCategoryId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/stock/product_categories/get', qs);
						responseData = [raw];
					} else if (operation === 'getStockSupplier') {
						const stockDetailsId = this.getNodeParameter('stockDetailsId', i) as number;
						const stockSupplierId = this.getNodeParameter('stockSupplierId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { stockDetailsId, stockSupplierId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/stock/stock_supplier_get', qs);
						responseData = [raw];
					}
				}

				// ── REFERENCE DATA ────────────────────────────────────────
				else if (resource === 'referenceData') {
					if (operation === 'listDepartmentCodes') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/reference_data/department_codes_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/reference_data/department_codes_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'listNominalCodes') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = {};
						if (this.getNodeParameter('simplify', i, false) as boolean) body.compact = true;
						if (additionalFields.sortBy) body.sortBy = additionalFields.sortBy;
						if (additionalFields.direction) body.direction = additionalFields.direction;
						if (returnAll) {
							responseData = await vh3ListApiRequestAllPages.call(this, '/reference_data/normalt_codes_list', body);
						} else {
							body.pageSize = this.getNodeParameter('pageSize', i) as number;
							body.pageNumber = this.getNodeParameter('pageNumber', i) as number;
							const raw = await vh3ListApiRequest.call(this, '/reference_data/normalt_codes_list', body);
							responseData = extractItems(raw).items;
						}
					} else if (operation === 'getDepartmentCode') {
						const departmentCodeId = this.getNodeParameter('departmentCodeId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { departmentCodeId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/reference_data/retrieves_details', qs);
						responseData = [raw];
					} else if (operation === 'getNominalCode') {
						const nominalCodeId = this.getNodeParameter('nominalCodeId', i) as number;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = { nominalCodeId };
						if (simplify) qs.compact = true;
						const raw = await vh3ProxyGetRequest.call(this, '/reference_data/nominal_code_id', qs);
						responseData = [raw];
					}
				}

				// ── ACCOUNT REPORT (FSI) ─────────────────────────────────────
				else if (resource === 'accountReport') {
					if (operation === 'generateAccountReport') {
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { report_type: 'account_monthly', contact_id: contactId };
						if (additionalFields.month) body.month = additionalFields.month;
						if (additionalFields.includeNarrative !== undefined) body.include_narrative = additionalFields.includeNarrative;
						const raw = await vh3FsiPostRequest.call(this, '/reports/generate', body);
						responseData = [raw];
					}
				}

				// ── BRIEFING (FSI) ───────────────────────────────────────────
				else if (resource === 'briefing') {
					if (operation === 'generateBriefing') {
						const jobId = this.getNodeParameter('jobId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { job_id: jobId, contact_id: contactId };
						if (additionalFields.forceRegenerateSummary !== undefined) body.force_regenerate_summary = additionalFields.forceRegenerateSummary;
						if (additionalFields.jobPayload) {
							body.job_payload = typeof additionalFields.jobPayload === 'string'
								? JSON.parse(additionalFields.jobPayload as string)
								: additionalFields.jobPayload;
						}
						const raw = await vh3FsiPostRequest.call(this, '/briefing/generate', body);
						responseData = [raw];
					}
				}

				// ── EMAIL (FSI) ──────────────────────────────────────────────
				else if (resource === 'email') {
					const attachments = await buildAttachments(this, i);

				if (operation === 'classifyEmail') {
					const subject = this.getNodeParameter('subject', i) as string;
					const emailBody = this.getNodeParameter('emailBody', i) as string;
					const senderAddress = this.getNodeParameter('senderAddress', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
					const body: JsonObject = { subject, email_body: emailBody, sender_address: senderAddress, attachments: attachments as unknown as JsonObject };
					if (additionalFields.senderName) body.sender_name = additionalFields.senderName;
					if (additionalFields.timestamp) body.timestamp = additionalFields.timestamp;
					if (additionalFields.isReply !== undefined) body.is_reply = additionalFields.isReply;
					if (additionalFields.isForward !== undefined) body.is_forward = additionalFields.isForward;
					if (additionalFields.sourceRef) body.source_ref = additionalFields.sourceRef;
					const raw = await vh3FsiPostRequest.call(this, '/triage/classify', body);
					responseData = [raw];
				} else if (operation === 'batchClassifyEmail') {
					const emailsRaw = this.getNodeParameter('emails', i);
					const emails = typeof emailsRaw === 'string' ? JSON.parse(emailsRaw) : emailsRaw;
					const raw = await vh3FsiPostRequest.call(this, '/triage/batch', { emails } as unknown as JsonObject);
					responseData = Array.isArray(raw) ? raw : [raw];
				} else if (operation === 'listTriageCategories') {
					const raw = await vh3FsiGetRequest.call(this, '/triage/taxonomy/categories', {});
					responseData = Array.isArray(raw) ? raw : [raw];
				} else if (operation === 'listTaxonomyRules') {
					const phase = this.getNodeParameter('phase', i) as string;
					const qs: Record<string, string> = {};
					if (phase) qs.phase = phase;
					const raw = await vh3FsiGetRequest.call(this, '/triage/taxonomy/rules', qs);
					responseData = Array.isArray(raw) ? raw : [raw];
				} else if (operation === 'ingestEmail') {
						const emailText = this.getNodeParameter('emailText', i) as string;
						const emailSubject = this.getNodeParameter('emailSubject', i) as string;
						const emailFrom = this.getNodeParameter('emailFrom', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { email_text: emailText, email_subject: emailSubject, email_from: emailFrom, attachments: attachments as unknown as JsonObject, preferred_type_ids: [] as unknown as JsonObject };
						if (additionalFields.emailHtml) body.email_html = additionalFields.emailHtml;
						if (additionalFields.emailDate) body.email_date = additionalFields.emailDate;
						const typeIdsRaw = (additionalFields.preferredTypeIds as string) || '';
						if (typeIdsRaw.trim()) {
							body.preferred_type_ids = typeIdsRaw.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n)) as unknown as JsonObject;
						}
						const raw = await vh3FsiPostRequest.call(this, '/ingest/email/portal', body);
						responseData = [raw];
					}
				}

				// ── JOB FEED (FSI) ───────────────────────────────────────────
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
						if (Object.keys(filters).length > 0) body.filters = filters as unknown as JsonObject;
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
						const includeWorksheets = this.getNodeParameter('includeWorksheets', i, false) as boolean;
						const qs: Record<string, string | number | boolean> = {};
						if (simplify) qs.compact = true;
						if (includeWorksheets) qs.include_worksheets = true;
						const raw = await vh3FsiGetRequest.call(this, `/jobs/${jobId}`, qs);
						responseData = [raw];
					}
				}

				// ── REPORTS (FSI) ────────────────────────────────────────────
				else if (resource === 'reports') {
					if (operation === 'generateReport') {
						const reportType = this.getNodeParameter('reportType', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as JsonObject;
						const body: JsonObject = { report_type: reportType };
						if (additionalFields.date) {
							const d = new Date(additionalFields.date as string);
							body.date = d.toISOString().split('T')[0];
						}
						if (additionalFields.includeNarrative !== undefined) body.include_narrative = additionalFields.includeNarrative;
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

				// ── SEARCH (FSI) ─────────────────────────────────────────────
				else if (resource === 'search') {
					if (operation === 'autocomplete') {
						const q = this.getNodeParameter('query', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;
						const typeFilter = this.getNodeParameter('typeFilter', i, []) as string[];
						const simplify = this.getNodeParameter('simplify', i, true) as boolean;
						const qs: Record<string, string | number> = { q, limit };
						const raw = await vh3FsiGetRequest.call(this, '/search/autocomplete', qs);
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
						if (simplify) {
							const isEmpty = (v: unknown): boolean =>
								v === null || v === '' || (Array.isArray(v) && v.length === 0);
							results = results.map((item) => {
								const out: JsonObject = {};
								for (const [k, v] of Object.entries(item)) {
									if (isEmpty(v)) continue;
									if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
										const nested: JsonObject = {};
										for (const [nk, nv] of Object.entries(v as Record<string, unknown>)) {
											if (!isEmpty(nv)) nested[nk] = nv as JsonObject;
										}
										if (Object.keys(nested).length > 0) out[k] = nested;
									} else {
										out[k] = v as unknown as JsonObject;
									}
								}
								return out;
							});
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
							const extractTimestamp = (item: JsonObject): number | null => {
								const candidates: unknown[] = [
									item?.actualStartAt, item?.actualEndAt, item?.createdAt,
									item?.created_at, item?.plannedStartAt, item?.scheduledAt,
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
								if (ts == null) return true;
								if (fromMs != null && ts < fromMs) return false;
								if (toMs != null && ts > toMs) return false;
								return true;
							});
						}
						responseData = results;
					}
				}

				// ── SENTINEL (FSI) ───────────────────────────────────────────
				else if (resource === 'sentinel') {
					if (operation === 'runSentinels') {
						const sentinelId = this.getNodeParameter('sentinelId', i) as string;
						if (sentinelId === 'all') {
							const raw = await vh3FsiPostRequest.call(this, '/sentinels/run', { sentinel_ids: [] as unknown as JsonObject });
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

				// ── CASES (FSI) ──────────────────────────────────────────────
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

				// ── CONNIE (FSI) ─────────────────────────────────────────────
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

				// ── INVESTIGATE (FSI) ────────────────────────────────────────
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

				// ── PULSE (FSI) ──────────────────────────────────────────────
				else if (resource === 'pulse') {
					if (operation === 'getPulse') {
						const credentials = await this.getCredentials('vh3AiApi');
						const companyId = credentials.companyId;
						const raw = await vh3FsiGetRequest.call(this, `/pulse/${companyId}`, {});
						responseData = [raw];
					}
				}

				// ── WEATHER (FSI) ────────────────────────────────────────────
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

				// ── INTELLIGENCE (FSI) ───────────────────────────────────────
				else if (resource === 'intelligence') {
					const credentials = await this.getCredentials('vh3AiApi');
					const companyId = credentials.companyId;
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

				// ── USERS (FSI) ──────────────────────────────────────────────
				else if (resource === 'users') {
					if (operation === 'listUsers') {
						const raw = await vh3FsiGetRequest.call(this, '/users/list', {});
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'listInvites') {
						const raw = await vh3FsiGetRequest.call(this, '/users/invites', {});
						responseData = Array.isArray(raw) ? raw : [raw];
					} else if (operation === 'inviteUser') {
						const email = this.getNodeParameter('email', i) as string;
						const role = this.getNodeParameter('role', i) as string;
						const companyName = this.getNodeParameter('companyName', i) as string;
						const inviterName = this.getNodeParameter('inviterName', i) as string;
						const raw = await vh3FsiPostRequest.call(this, '/users/invite', {
							email,
							role,
							company_name: companyName,
							inviter_name: inviterName,
						});
						responseData = [raw];
					} else if (operation === 'updateUserRole') {
						const userId = this.getNodeParameter('userId', i) as string;
						const role = this.getNodeParameter('role', i) as string;
						const raw = await vh3FsiPutRequest.call(this, `/users/${userId}/role`, {
							user_id: userId,
							role,
						});
						responseData = [raw];
					} else if (operation === 'deleteUser') {
						const userId = this.getNodeParameter('userId', i) as string;
						const raw = await vh3FsiDeleteRequest.call(this, `/users/${userId}`, {
							user_id: userId,
						});
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
