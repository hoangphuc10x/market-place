/**
 * Conventional Commits standard.
 * Format: <type>(<scope>): <subject>
 * e.g. "feat(web): add product filter", "fix(api): handle null cart"
 *
 * Allowed types — see https://www.conventionalcommits.org
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation only
        'style', // formatting, no code change
        'refactor', // code change that neither fixes a bug nor adds a feature
        'perf', // performance improvement
        'test', // adding or fixing tests
        'build', // build system or dependencies
        'ci', // CI configuration
        'chore', // other changes that don't modify src or test
        'revert', // revert a previous commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      // workspace areas — keep in sync with apps/ and packages/
      ['web', 'api', 'db', 'types', 'themes', 'config', 'ci', 'deps', 'repo'],
    ],
    'scope-empty': [0], // scope is optional
    'subject-case': [0], // allow any case in subject
  },
};
