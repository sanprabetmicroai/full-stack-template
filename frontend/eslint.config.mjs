// @ts-check

import reactRefresh from 'eslint-plugin-react-refresh'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import * as importPlugin from 'eslint-plugin-import'
import * as reactPlugin from 'eslint-plugin-react'
import * as reactHooksPlugin from 'eslint-plugin-react-hooks'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default tseslint.config(
    [
        {
            ignores: [
                '**/build/',
                '**/node_modules/',
                '**/dist/',
                '**/.prettierrc.js',
                '**/.eslintrc.js',
                '**/env.d.ts',
                '**/eslint.config.mjs',
                '**/postcss.config.cjs',
                '**/tailwind.config.cjs',
            ],
        },
        js.configs.recommended,
        {
            plugins: {
                'react-refresh': reactRefresh,
                'import': importPlugin,
                'react': reactPlugin,
                'react-hooks': reactHooksPlugin,
            },
            settings: {
                react: {
                    version: 'detect',
                },
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts', '.tsx'],
                },
                'import/resolver': {
                    typescript: {
                        project: './tsconfig.eslint.json',
                        alwaysTryTypes: true,
                    },
                },
            },
            rules: {
                'react-refresh/only-export-components': [
                    'warn',
                    {
                        allowConstantExport: true,
                    },
                ],
                'react-hooks/rules-of-hooks': 'off',
                'react/react-in-jsx-scope': 'off',
                'import/first': 'warn',
                'import/default': 'off',
                'import/newline-after-import': 'warn',
                'import/no-named-as-default-member': 'off',
                'import/no-duplicates': 'error',
                'import/no-named-as-default': 0,
                'react/prop-types': 'off',
            },
        },
    ],
    tseslint.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['**/*.tsx', '**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
        },
    },
)
