module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn', // Downgrade from error to warning
    '@next/next/no-img-element': 'warn', // Downgrade from error to warning
    '@typescript-eslint/ban-ts-comment': 'off', // Allow ts-ignore comments
    '@typescript-eslint/no-explicit-any': 'off', // Allow any type
  }
}; 