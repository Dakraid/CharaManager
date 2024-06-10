import { debounce } from 'perfect-debounce';

// noinspection JSUnusedGlobalSymbols
export const processCharacters = debounce(
    async () => {
        const characters = useCharacterStore();
        await characters.getCharacters();
    },
    500,
    { leading: true, trailing: false }
);

// noinspection JSUnusedGlobalSymbols
export const processSearch = debounce(
    async () => {
        const nuxtApp = useNuxtApp();
        await nuxtApp.hooks.callHook('refresh:characters');
    },
    500,
    { trailing: false }
);
