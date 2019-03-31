module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "consistent-return": "off",
    "no-console": "off",
    "array-callback-return": "off",
    "no-restricted-globals": "off",
    "max-len": ["error", { "code": 120 }]
  },
};
