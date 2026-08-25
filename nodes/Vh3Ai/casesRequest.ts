import type { JsonObject, JsonValue } from 'n8n-workflow';

export type CaseListRequest = {
	method: 'GET';
	endpoint: '/cases/list';
	qs: Record<string, string | number | boolean>;
};

export type CaseUpdateRequest = {
	method: 'PATCH';
	endpoint: string;
	body: JsonObject;
};

export type CaseDeleteRequest = {
	method: 'POST';
	endpoint: string;
	body: JsonObject;
};

export class CaseUpdateValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CaseUpdateValidationError';
	}
}

function hasOwn(obj: JsonObject, key: string): boolean {
	return Object.prototype.hasOwnProperty.call(obj, key);
}

function parsePresentJsonField(
	value: unknown,
	fieldLabel: string,
	emptyFallback: JsonValue,
): JsonValue {
	if (value == null || value === '') {
		return emptyFallback;
	}
	if (typeof value !== 'string') {
		return value as JsonValue;
	}
	const trimmed = value.trim();
	if (!trimmed) {
		return emptyFallback;
	}
	try {
		return JSON.parse(trimmed) as JsonValue;
	} catch (error) {
		throw new CaseUpdateValidationError(
			`${fieldLabel} is not valid JSON: ${(error as Error).message}`,
		);
	}
}

function assignPresentQueryValue(
	qs: Record<string, string | number | boolean>,
	fields: JsonObject,
	fieldName: string,
	queryName: string,
): void {
	if (!hasOwn(fields, fieldName)) {
		return;
	}
	const value = fields[fieldName];
	if (value === '' || value == null) {
		return;
	}
	qs[queryName] = value as string | number | boolean;
}

/**
 * Build the single FSI GET for List Cases. Selected filters map 1:1 to query params.
 * Unselected Scope, Sort, and Order are omitted so FSI keeps its defaults.
 * Never fetches extra pages, filters lifecycle locally, or reorders results.
 */
export function buildCaseListRequest(additionalFields: JsonObject): CaseListRequest {
	const qs: Record<string, string | number | boolean> = {};

	if (additionalFields.status) qs.status = additionalFields.status as string;
	if (additionalFields.type) qs.type = additionalFields.type as string;
	if (additionalFields.priority) qs.priority = additionalFields.priority as string;
	if (additionalFields.ownerId) qs.owner_id = additionalFields.ownerId as number;
	if (additionalFields.search) qs.search = additionalFields.search as string;
	if (additionalFields.page) qs.page = additionalFields.page as number;
	if (additionalFields.perPage) qs.per_page = additionalFields.perPage as number;

	assignPresentQueryValue(qs, additionalFields, 'scope', 'scope');
	assignPresentQueryValue(qs, additionalFields, 'sort', 'sort');
	assignPresentQueryValue(qs, additionalFields, 'order', 'order');

	return {
		method: 'GET',
		endpoint: '/cases/list',
		qs,
	};
}

/**
 * Build the single FSI PATCH for Update Case from collection property presence.
 * Unselected keys are omitted. Selected empty clearable fields are sent as clears.
 * Never issues a GET or merges with a fetched Case.
 */
export function buildCaseUpdateRequest(
	caseId: number,
	updateFields: JsonObject,
): CaseUpdateRequest {
	const body: JsonObject = {};

	if (hasOwn(updateFields, 'title')) {
		const title = updateFields.title;
		if (typeof title !== 'string' || !title.trim()) {
			throw new CaseUpdateValidationError('Title must be a non-empty string');
		}
		body.title = title;
	}

	if (hasOwn(updateFields, 'description')) {
		body.description = updateFields.description ?? '';
	}

	if (hasOwn(updateFields, 'type')) {
		body.type = updateFields.type;
	}

	if (hasOwn(updateFields, 'priority')) {
		body.priority = updateFields.priority;
	}

	if (hasOwn(updateFields, 'resolution')) {
		body.resolution = updateFields.resolution ?? '';
	}

	if (hasOwn(updateFields, 'tags')) {
		body.tags = parsePresentJsonField(updateFields.tags, 'Tags', []);
	}

	if (hasOwn(updateFields, 'metadata')) {
		body.metadata = parsePresentJsonField(updateFields.metadata, 'Metadata', {});
	}

	if (hasOwn(updateFields, 'actorType')) {
		body.actor_type = updateFields.actorType;
	}

	if (hasOwn(updateFields, 'actorId')) {
		const actorId = updateFields.actorId;
		if (actorId !== 0 && actorId !== '0' && actorId !== '' && actorId != null) {
			body.actor_id = actorId;
		}
	}

	const clearDueDate = hasOwn(updateFields, 'clearDueDate') && Boolean(updateFields.clearDueDate);
	if (clearDueDate) {
		body.due_date = null;
	} else if (hasOwn(updateFields, 'dueDate')) {
		const dueDate = updateFields.dueDate;
		if (dueDate != null && dueDate !== '') {
			body.due_date = dueDate;
		}
	}

	return {
		method: 'PATCH',
		endpoint: `/cases/${caseId}`,
		body,
	};
}

/**
 * Build the FSI POST that archives a case through the existing transition path.
 * Always targets status archived. Never issues a hard delete or restore.
 */
export function buildCaseDeleteRequest(
	caseId: number,
	additionalFields: JsonObject,
): CaseDeleteRequest {
	const body: JsonObject = { status: 'archived' };
	if (additionalFields.actorType) body.actor_type = additionalFields.actorType;
	if (additionalFields.actorId) body.actor_id = additionalFields.actorId;

	return {
		method: 'POST',
		endpoint: `/cases/${caseId}/transition`,
		body,
	};
}
