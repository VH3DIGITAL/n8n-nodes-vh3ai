import type { INodeProperties } from 'n8n-workflow';

import { fsiTeamsOperations } from '../nodes/Vh3Ai/descriptions/FsiTeamsDescription';

function findOperation(value: string) {
	const operation = fsiTeamsOperations[0]?.options?.find(
		(option) => 'value' in option && option.value === value,
	);
	if (!operation || !('description' in operation)) {
		throw new Error(`Missing Teams operation ${value}`);
	}
	return operation as INodeProperties;
}

describe('Teams operation copy', () => {
	it('documents Create Team and Search Teams as live tenant-key operations', () => {
		expect(findOperation('createTeam').description).toMatch(/tenant API key/i);
		expect(findOperation('createTeam').description).toMatch(/team-lead or manager/i);
		expect(findOperation('searchTeams').description).toMatch(/tenant-key/i);
		expect(findOperation('searchTeams').description).toMatch(/not Connect-UI-only/i);
		expect(findOperation('listTeams').description).toMatch(/Search/i);
		expect(findOperation('listTeams').description).toMatch(/tenant-key/i);
	});
});
