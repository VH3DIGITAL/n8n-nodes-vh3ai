/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['n8n-nodes-base'],
	ignorePatterns: ['.eslintrc.js', '.eslintrc.portal.js', 'dist/**', 'node_modules/**', 'gulpfile.js', 'scripts/**'],
	extends: ['plugin:n8n-nodes-base/community'],
	overrides: [
		{
			files: ['package.json'],
			rules: {
				'n8n-nodes-base/community-package-json-name-still-default': 'off',
			},
		},
	],
};
