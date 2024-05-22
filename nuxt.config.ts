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
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    nitro: {
        compressPublicAssets: {
            brotli: true,
        },
    },
    runtimeConfig: {
        apiKey: '',
    },
    modules: [
        '@nuxt/eslint',
        '@pinia/nuxt',
        '@pinia-plugin-persistedstate/nuxt',
        '@nuxtjs/tailwindcss',
        '@nuxtjs/color-mode',
        'shadcn-nuxt',
        '@nuxt/image',
        'dayjs-nuxt',
        'nuxt-icon',
        'nuxt-rating',
        '@nuxtjs/robots',
        'nuxt-monaco-editor',
        'nuxt-security',
        '@nuxtjs/critters',
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
    image: {
        provider: 'ipx',
        ipx: {
            maxAge: 1,
            http: {
                maxAge: 1,
                ignoreCacheControl: true,
            },
            fs: {
                maxAge: 1,
            },
        },
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
});
