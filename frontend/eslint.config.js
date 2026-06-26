import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  prettierConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
