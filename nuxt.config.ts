// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2024-08-07',
    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
            },
            title: 'CharaManager',
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            meta: [{ name: 'description', content: 'An application to manage your TavernV2 cards.' }],
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    nitro: {
        esbuild: {
            options: {
                target: 'esnext',
            },
        },
        compressPublicAssets: {
            gzip: true,
            brotli: true,
        },
        minify: true,
    },
    future: {
        typescriptBundlerResolution: true,
    },
    experimental: {
        watcher: 'parcel',
    },
    imports: {
        autoImport: true,
    },
    runtimeConfig: {
        apiKey: '',
        captchaSolverKey: '',
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
      '@nuxtjs/device',
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
        enabled: false,
        headers: {
            crossOriginEmbedderPolicy: 'unsafe-none',
            contentSecurityPolicy: {
                'img-src': false,
                'script-src': false,
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
        registerType: 'autoUpdate',
        manifest: {
            name: 'CharaManager',
            short_name: 'CharaManager',
            description: 'An application to manage your TavernV2 cards.',
            theme_color: '#000000',
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
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                },
            ],
        },
        client: {
            installPrompt: true,
            periodicSyncForUpdates: 3600,
        },
        devOptions: {
            enabled: false,
            suppressWarnings: true,
            navigateFallback: '/',
            navigateFallbackAllowlist: [/^\/$/],
            type: 'module',
        },
    },
});