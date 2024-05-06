// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    sourcemap: true,
    ssr: true,
    devtools: {
        enabled: true,
        timeline: {
            enabled: true,
        },
    },
    modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode', 'shadcn-nuxt', '@nuxt/image', 'dayjs-nuxt', 'nuxt-icon'],
    colorMode: {
        classSuffix: '',
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
});
