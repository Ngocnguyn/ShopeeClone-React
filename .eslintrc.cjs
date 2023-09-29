const path = require('path')
module.exports = {
  extends: [
    'eslint: recommended',
    'plugin: react/recommended',
    'plugin: react-hooks/recommended',
    'plugin: import/recommended',
    'plugin: jsx-a11y/recommended',
    'plugin: @typescript-eslint/recommended',
    'eslint-config-prettier',
    'prettier'
  ],
  plugins: ['prettier'],
  settings: {
    react: {
      version: 'detect'
    },
    // Nói eslint xử lí các import
    'import/resolver': {
      node: {
        paths: [path.resolve(__dirname)],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    // Tắt yêu cầu import React trong file jsx
    'react/react-in-jsx-scope': 'off',
    // Cảnh báo khi thẻ <a target="_blank" /> không có rel="noreferrer
    'react/jsx-no-target-blank': 'warn',
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'always',
        semi: false,
        trailingComma: 'none',
        tabWidth: 2,
        endOfLine: 'auto',
        useTabs: false,
        singleQuote: true,
        printWidth: 120,
        jsxSingleQuote: true
      }
    ]
  }
}
