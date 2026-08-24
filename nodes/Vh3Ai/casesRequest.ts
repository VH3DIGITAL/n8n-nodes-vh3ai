import type { JsonObject, JsonValue } from 'n8n-workflow';

export type CaseUpdateRequest = {
	method: 'PATCH';
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
