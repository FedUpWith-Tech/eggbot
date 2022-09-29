module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.eslintrc.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 'off',
    'prefer-destructuring': 'off',
  },
};
