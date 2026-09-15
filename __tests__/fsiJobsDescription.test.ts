import type { INodeProperties } from 'n8n-workflow';

import { fsiJobsFields } from '../nodes/Vh3Ai/descriptions/FsiJobsDescription';

function findAdditionalFields(operation: string): INodeProperties {
	const collection = fsiJobsFields.find((field) => {
		const operations = field.displayOptions?.show?.operation;
		return (
			field.name === 'additionalFields' &&
			Array.isArray(operations) &&
			operations.includes(operation)
		);
	});
	if (!collection || !Array.isArray(collection.options)) {
		throw new Error(`Missing Additional Fields for ${operation}`);
	}
	return collection;
}

function findOption(operation: string, optionName: string): INodeProperties {
	const option = (findAdditionalFields(operation).options as INodeProperties[]).find(
		(item) => item.name === optionName,
	);
	if (!option) {
		throw new Error(`Missing ${optionName} on ${operation}`);
	}
	return option;
}

describe('Job Feed list filters', () => {
	it.each(['listJobFeed', 'listAccountJobFeed'] as const)(
		'exposes Has Follow Up and Include VH3 AI on %s',
		(operation) => {
			const hasFollowUp = findOption(operation, 'hasFollowUp');
			expect(hasFollowUp.displayName).toBe('Has Follow Up');
			expect(hasFollowUp.type).toBe('boolean');
			expect(hasFollowUp.default).toBe(false);
			expect(hasFollowUp.description).toMatch(/^Whether /);
			expect(hasFollowUp.description).toMatch(/not an inverse filter/i);

			const includeVh3Ai = findOption(operation, 'includeVh3Ai');
			expect(includeVh3Ai.displayName).toBe('Include VH3 AI');
			expect(includeVh3Ai.type).toBe('boolean');
			expect(includeVh3Ai.default).toBe(false);
			expect(includeVh3Ai.description).toMatch(/^Whether /);
		},
	);
});
