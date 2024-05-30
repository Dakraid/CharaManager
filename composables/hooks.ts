import type { HookResult } from '@nuxt/schema';

declare module '#app' {
    interface RuntimeNuxtHooks {
        'refresh:characters': () => HookResult;
        'action:menu': () => HookResult;
    }
}
