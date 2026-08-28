import ashNazg from 'eslint-config-ash-nazg';
import globals from 'globals';

export default [
  {
    ignores: [
    ]
  },
  ...ashNazg(['sauron', 'node']),
  {
    files: ['*.md/*.js'],
    rules: {
      strict: 'off',
      'no-unused-vars': ['error', {varsIgnorePattern: 'xhr'}]
    }
  },
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest'
    },
    rules: {
      semi: [2, 'always'],
      'comma-style': 0,
      quotes: 0,
      'one-var': 0,
      'space-before-function-paren': 0,
      'operator-linebreak': 0,
      'object-curly-spacing': ['error', 'never'],

      // Insisting on TS
      'sonarjs/public-static-readonly': 0,

      // Disable for now
      'unicorn/no-undeclared-class-members': 0,
      'unicorn/no-nonstandard-builtin-properties': 0,
      'unicorn/prefer-early-return': 0,
      'unicorn/prefer-private-class-fields': 0,
      'unicorn/no-this-outside-of-class': 0,
      'unicorn/no-top-level-assignment-in-function': 0
    }
  }
];
