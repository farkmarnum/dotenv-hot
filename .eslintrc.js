module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb', 'airbnb-typescript', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',

    'no-console': 'off', // It's a CLI
    'import/prefer-default-export': 'off', // Annoying
    'react/function-component-definition': 'off', // Annoying
    'react/require-default-props': 'off', // Not needed w/ TypeScript

    /**
     * Don't warn about imported dependencies being in devDependencies for test files:
     */
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': [
          '**/*.test.ts',
          '**/*.test.tsx'
        ]
      }
    ]
  },
};
