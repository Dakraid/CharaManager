// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
            },
            title: 'CharaManager',
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            meta: [{ name: 'description', content: 'An application to manage your TavernV2 cards.' }],
            link: [],
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    nitro: {
        compressPublicAssets: {
            gzip: true,
            brotli: true,
        },
        minify: true,
    },
    runtimeConfig: {
        apiKey: '',
    },
    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxtjs/color-mode',
        '@nuxtjs/critters',
        '@nuxtjs/robots',
        '@nuxtjs/tailwindcss',
        '@pinia-plugin-persistedstate/nuxt',
        '@pinia/nuxt',
        'dayjs-nuxt',
        'magic-regexp/nuxt',
        'nuxt-icon',
        'nuxt-monaco-editor',
        'nuxt-rating',
        'nuxt-security',
        'shadcn-nuxt',
        '@vite-pwa/nuxt',
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
    security: {
        enabled: true,
        headers: {
            crossOriginEmbedderPolicy: 'unsafe-none',
            contentSecurityPolicy: {
                'img-src': false,
                'script-src': ["'self'", 'https:', "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'", "'unsafe-eval'"],
            },
        },
        requestSizeLimiter: {
            maxRequestSizeInBytes: 100000000,
            maxUploadFileRequestInBytes: 500000000,
        },
        rateLimiter: {
            tokensPerInterval: 50,
            interval: 1000,
        },
    },
    pwa: {
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'maskable-icon-512x512.png'],
        manifest: {
            name: 'CharaManager',
            short_name: 'CharaManager',
            description: 'An application to manage your TavernV2 cards.',
            theme_color: '#ffffff',
            icons: [
                {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
        },
        devOptions: {
            enabled: true,
        },
    },
});
