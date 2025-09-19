module.exports = {
  env: {
    node: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'public/',
    'prisma/generated/',
    'src/generated/'
  ],
  rules: {
    // Override or add rules here, for example:
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ]
  },
  settings: {
    'import/resolver': {
      typescript: {}
    }
  }
};
