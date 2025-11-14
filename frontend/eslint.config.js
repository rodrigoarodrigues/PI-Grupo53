// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    root: true,
    extends: [
      'universe/native', // Or your base Expo config
      'plugin:import/typescript',
    ],
    plugins: ['import'],
    settings: {
      'import/resolver': {
        // This tells ESLint to use the paths from tsconfig.json
        typescript: {
          alwaysTryTypes: true, // E.g., @/types
          project: './tsconfig.json', // Path to your tsconfig.json
        },

        // You can also add a manual alias as a fallback
        // This is often not needed if 'typescript' block works
        alias: {
          map: [
            ['@', './src'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/ignore': [
        'node_modules',
        '\\.(json|css|scss|less|hbs|svg|jpg|png)$',
      ],
    },
    rules: {
      // This rule is provided by eslint-plugin-import
      'import/no-unresolved': 'error',
      // Other rules...
    },
  };
]);
