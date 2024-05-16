// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
            },
            title: 'CharaManager - A Manager for TavernV2 cards',
            charset: 'utf-8',
            meta: [],
            link: [],
        },
    },
    vite: {
        build: {
            rollupOptions: {
                external: ['odiff-bin'],
            },
        },
    },
    modules: [
        '@nuxt/eslint',
        '@pinia/nuxt',
        '@nuxtjs/tailwindcss',
        '@nuxtjs/color-mode',
        'shadcn-nuxt',
        '@nuxt/image',
        'dayjs-nuxt',
        'nuxt-icon',
        'nuxt-rating',
        '@nuxtjs/robots',
        'nuxt-monaco-editor',
    ],
    ssr: true,
    devtools: {
        enabled: true,
        timeline: {
            enabled: true,
        },
    },
    sourcemap: true,
    colorMode: {
        classSuffix: '',
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
});
