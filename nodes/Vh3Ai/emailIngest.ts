import type { JsonObject, JsonValue } from 'n8n-workflow';

export class SourceEmailValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SourceEmailValidationError';
	}
}

export type PortalIngestInput = {
	emailText: string;
	emailSubject: string;
	emailFrom: string;
	attachments: JsonValue;
	additionalFields: JsonObject;
	sourceEmail?: unknown;
};

/**
 * Parse the optional sourceEmail JSON field.
 * Empty / absent / {} is omitted so the request matches 0.11.3.
 * Identifier strings are not trimmed, lowercased, or rewritten.
 */
export function normalizeSourceEmail(value: unknown): JsonObject | undefined {
	if (value == null || value === '') {
		return undefined;
	}

	let parsed: JsonValue;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed || trimmed === '{}') {
			return undefined;
		}
		try {
			parsed = JSON.parse(trimmed) as JsonValue;
		} catch (error) {
			throw new SourceEmailValidationError(
				`Source Email is not valid JSON: ${(error as Error).message}`,
			);
		}
	} else {
		parsed = value as JsonValue;
	}

	if (parsed == null) {
		return undefined;
	}
	if (typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new SourceEmailValidationError('Source Email must be a JSON object.');
	}

	const object = parsed as JsonObject;
	if (Object.keys(object).length === 0) {
		return undefined;
	}
	return object;
}

/**
 * Build the portal-ingest body for POST /ingest/email/portal.
 * company_id and api_key are injected later from the VH3 AI credential.
 */
export function buildPortalIngestBody(input: PortalIngestInput): JsonObject {
	const body: JsonObject = {
		email_text: input.emailText,
		email_subject: input.emailSubject,
		email_from: input.emailFrom,
		attachments: input.attachments as JsonObject,
		preferred_type_ids: [] as unknown as JsonObject,
	};

	if (input.additionalFields.emailHtml) {
		body.email_html = input.additionalFields.emailHtml;
	}
	if (input.additionalFields.emailDate) {
		body.email_date = input.additionalFields.emailDate;
	}

	const typeIdsRaw = (input.additionalFields.preferredTypeIds as string) || '';
	if (typeIdsRaw.trim()) {
		body.preferred_type_ids = typeIdsRaw
			.split(',')
			.map((s: string) => parseInt(s.trim(), 10))
			.filter((n: number) => !isNaN(n)) as unknown as JsonObject;
	}

	const sourceEmail = normalizeSourceEmail(input.sourceEmail);
	if (sourceEmail) {
		body.sourceEmail = sourceEmail;
	}

	return body;
}

/**
 * Surface the FSI portal-ingest envelope on the node output.
 * Passes sourceEmail through from the response. Does not rebuild it
 * from subject, sender, or date.
 */
export function portalIngestNodeOutput(raw: JsonObject): JsonObject {
	return raw;
}
