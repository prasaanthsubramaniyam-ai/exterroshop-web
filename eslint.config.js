// @ts-check
const coreWebVitals = require('eslint-config-next/core-web-vitals');
const typescript = require('eslint-config-next/typescript');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },
];
