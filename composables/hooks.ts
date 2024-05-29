import type { HookResult } from '@nuxt/schema';

declare module '#app' {
    interface RuntimeNuxtHooks {
        'refresh:characters': () => HookResult;
        'action:upload': () => HookResult;
        'action:menu': () => HookResult;
    }
}
