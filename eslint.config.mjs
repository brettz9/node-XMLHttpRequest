import ashNazg from 'eslint-config-ash-nazg';
import globals from 'globals';

export default [
  {
    ignores: [
      // Todo: How to test??
      'tests'
    ]
  },
  ...ashNazg([]),
  {
    files: ['*.md/*.js'],
    rules: {
      strict: 'off',
      'no-unused-vars': ['error', {varsIgnorePattern: 'xhr'}]
    }
  },
  {
    languageOptions: {
      globals: globals.node
    },
    rules: {
      semi: [2, 'always'],
      'comma-style': 0,
      quotes: 0,
      'one-var': 0,
      'space-before-function-paren': 0,
      'operator-linebreak': 0,
      'object-curly-spacing': ['error', 'never']
    }
  }
];
