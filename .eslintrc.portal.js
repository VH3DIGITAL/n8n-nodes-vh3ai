/**
 * Mirrors @n8n/scan-community-package@beta source-scan rules for nodes/credentials.
 * Used by `npm run lint:portal`. Do not weaken these overrides — they match the scanner.
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['n8n-nodes-base'],
	ignorePatterns: ['.eslintrc.js', '.eslintrc.portal.js', 'dist/**', 'node_modules/**', 'gulpfile.js', 'scripts/**'],
	overrides: [
		{
			files: ['package.json'],
			extends: ['plugin:n8n-nodes-base/community'],
			rules: {
				'n8n-nodes-base/community-package-json-name-still-default': 'off',
			},
		},
		{
			files: ['credentials/**/*.ts'],
			extends: ['plugin:n8n-nodes-base/credentials'],
			rules: {
				'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
				'n8n-nodes-base/cred-class-field-type-options-password-missing': 'off',
			},
		},
		{
			files: ['nodes/**/*.ts'],
			extends: ['plugin:n8n-nodes-base/nodes'],
			rules: {
				'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
				'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
				'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
			},
		},
	],
};
