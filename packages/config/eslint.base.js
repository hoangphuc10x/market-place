/** Shared ESLint flat config base */
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', '.next', '.turbo', 'node_modules', 'coverage', '*.config.*'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },
);
