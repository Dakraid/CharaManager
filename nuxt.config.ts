// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode', 'shadcn-nuxt', '@nuxt/image', 'dayjs-nuxt', 'nuxt-icon'],
    ssr: true,
    devtools: {
        enabled: true,
        timeline: {
            enabled: true,
        },
    },
    sourcemap: true,
    experimental: {
        asyncEntry: true,
        asyncContext: true,
    },
    colorMode: {
        classSuffix: '',
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
});
