import type { INodeProperties, JsonObject } from 'n8n-workflow';

import { buildCaseUpdateRequest, CaseUpdateValidationError } from '../nodes/Vh3Ai/casesRequest';
import { fsiCasesFields, fsiCasesOperations, participantRoleOptions } from '../nodes/Vh3Ai/descriptions/FsiCasesDescription';

function findCollectionOption(
	fields: INodeProperties[],
	collectionName: string,
	optionName: string,
): INodeProperties | undefined {
	for (const field of fields) {
		if (field.name !== collectionName || !Array.isArray(field.options)) continue;
		return (field.options as INodeProperties[]).find((option) => option.name === optionName);
	}
	return undefined;
}

function findOperation(value: string) {
	const operation = fsiCasesOperations[0]?.options?.find(
		(option) => 'value' in option && option.value === value,
	);
	if (!operation || !('description' in operation)) {
		throw new Error(`Missing Cases operation ${value}`);
	}
	return operation;
}

describe('buildCaseUpdateRequest', () => {
	it('omits every unselected Update Field from the PATCH body', () => {
		const request = buildCaseUpdateRequest(42, {});

		expect(request).toEqual({
			method: 'PATCH',
			endpoint: '/cases/42',
			body: {},
		});
		expect(request.body).not.toHaveProperty('title');
		expect(request.body).not.toHaveProperty('description');
		expect(request.body).not.toHaveProperty('type');
		expect(request.body).not.toHaveProperty('priority');
		expect(request.body).not.toHaveProperty('tags');
		expect(request.body).not.toHaveProperty('metadata');
		expect(request.body).not.toHaveProperty('due_date');
		expect(request.body).not.toHaveProperty('resolution');
		expect(request.body).not.toHaveProperty('actor_id');
		expect(request.body).not.toHaveProperty('actor_type');
	});

	it('sends selected empty Description and Resolution as empty strings', () => {
		const request = buildCaseUpdateRequest(7, {
			description: '',
			resolution: '',
		});

		expect(request.body).toEqual({
			description: '',
			resolution: '',
		});
	});

	it('sends selected Tags [] and Metadata {} as explicit clears', () => {
		const request = buildCaseUpdateRequest(7, {
			tags: [],
			metadata: {},
		});

		expect(request.body.tags).toEqual([]);
		expect(request.body.metadata).toEqual({});
		expect(request.body).toHaveProperty('tags');
		expect(request.body).toHaveProperty('metadata');
	});

	it('parses selected Tags and Metadata JSON strings', () => {
		const request = buildCaseUpdateRequest(7, {
			tags: '["urgent","site-a"]',
			metadata: '{"source":"n8n"}',
		});

		expect(request.body.tags).toEqual(['urgent', 'site-a']);
		expect(request.body.metadata).toEqual({ source: 'n8n' });
	});

	it('treats selected empty JSON Tags/Metadata as collection clears', () => {
		const request = buildCaseUpdateRequest(7, {
			tags: '',
			metadata: '   ',
		});

		expect(request.body.tags).toEqual([]);
		expect(request.body.metadata).toEqual({});
	});

	it('rejects invalid Tags JSON instead of omitting the field', () => {
		expect(() => buildCaseUpdateRequest(7, { tags: '{not-json' })).toThrow(CaseUpdateValidationError);
		expect(() => buildCaseUpdateRequest(7, { tags: '{not-json' })).toThrow(/Tags is not valid JSON/);
	});

	it('sends Clear Due Date as due_date null and never sends an empty date string', () => {
		const cleared = buildCaseUpdateRequest(7, { clearDueDate: true });
		expect(cleared.body).toEqual({ due_date: null });

		const emptyDate = buildCaseUpdateRequest(7, { dueDate: '' });
		expect(emptyDate.body).not.toHaveProperty('due_date');
		expect(JSON.stringify(emptyDate.body)).not.toContain('""');
	});

	it('sends a selected non-empty Due Date and lets Clear Due Date win', () => {
		const dated = buildCaseUpdateRequest(7, { dueDate: '2026-09-01T09:00:00.000Z' });
		expect(dated.body).toEqual({ due_date: '2026-09-01T09:00:00.000Z' });

		const both = buildCaseUpdateRequest(7, {
			dueDate: '2026-09-01T09:00:00.000Z',
			clearDueDate: true,
		});
		expect(both.body).toEqual({ due_date: null });
	});

	it('maps selected non-empty values with field-name conversion only', () => {
		const request = buildCaseUpdateRequest(9, {
			title: 'Keep the pumps running',
			description: 'Site visit follow-up',
			type: 'investigation',
			priority: 'high',
			resolution: 'Replaced the valve',
			dueDate: '2026-10-01T12:00:00.000Z',
			actorType: 'user',
			actorId: 88,
		});

		expect(request.body).toEqual({
			title: 'Keep the pumps running',
			description: 'Site visit follow-up',
			type: 'investigation',
			priority: 'high',
			resolution: 'Replaced the valve',
			due_date: '2026-10-01T12:00:00.000Z',
			actor_type: 'user',
			actor_id: 88,
		});
	});

	it('omits zero or empty Actor ID so the API-key owner fallback applies', () => {
		expect(buildCaseUpdateRequest(7, { actorId: 0 }).body).not.toHaveProperty('actor_id');
		expect(buildCaseUpdateRequest(7, { actorId: '0' }).body).not.toHaveProperty('actor_id');
	});

	it('rejects a selected empty or whitespace-only Title instead of omitting it', () => {
		expect(() => buildCaseUpdateRequest(7, { title: '' })).toThrow(CaseUpdateValidationError);
		expect(() => buildCaseUpdateRequest(7, { title: '   ' })).toThrow('Title must be a non-empty string');
	});

	it('returns exactly one PATCH and never a GET or merge payload', () => {
		const request = buildCaseUpdateRequest(15, { title: 'Only title' } as JsonObject);

		expect(request.method).toBe('PATCH');
		expect(request.endpoint).toBe('/cases/15');
		expect(Object.keys(request)).toEqual(['method', 'endpoint', 'body']);
		expect(JSON.stringify(request)).not.toMatch(/GET|merge|getCase/i);
	});
});

describe('Cases Update Field copy', () => {
	it('exposes exactly the five supported participant roles', () => {
		expect(participantRoleOptions.map((option) => option.value)).toEqual([
			'contributor',
			'investigator',
			'observer',
			'owner',
			'reviewer',
		]);
	});

	it('documents Actor ID as a Connect user ID with API-key-owner fallback', () => {
		const actorId = findCollectionOption(fsiCasesFields, 'updateFields', 'actorId');
		expect(actorId?.description).toMatch(/Connect user ID/i);
		expect(actorId?.description).toMatch(/API-key owner/i);
	});

	it('documents Create Case as starting in draft', () => {
		expect(findOperation('createCase').description).toMatch(/draft/i);
	});

	it('documents that unselected fields are preserved and empty clearable fields clear', () => {
		expect(findOperation('updateCase').description).toMatch(/unselected fields are preserved/i);
		expect(findOperation('updateCase').description).toMatch(/clears/i);
		expect(findOperation('updateCase').description).toMatch(/Connect user ID/i);
		expect(findOperation('updateCase').description).toMatch(/API-key owner/i);
	});
});
