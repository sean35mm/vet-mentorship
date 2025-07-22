/** @type {import('prettier').Config} */
export default {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  
  // Line length and wrapping
  printWidth: 80,
  endOfLine: 'lf',
  
  // JSX specific
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Object and array formatting
  bracketSpacing: true,
  arrowParens: 'avoid',
  
  // Plugin configurations
  plugins: ['prettier-plugin-tailwindcss'],
  
  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
  ],
};