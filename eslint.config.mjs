// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({})
    .prepend(
        withNuxt({
            ignores: ['**/.github/*', '**/*.config.js', '**/*.d.ts', '**/utils/drizzle/*', '**/components/ui/*'],
        })
    )
    .append({
        rules: {
            semi: ['error', 'always'],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'vue/no-multiple-template-root': 'off',
            'vue/valid-v-for': 'off',
            'vue/no-parsing-error': 'off',
            'vue/html-self-closing': 'off'
        },
    });
