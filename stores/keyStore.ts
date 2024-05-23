export const useKeyStore = defineStore('key', {
    state: () => {
        return {
            apiKey: '',
        };
    },
    persist: {
        storage: persistedState.cookiesWithOptions({
            sameSite: 'strict',
            expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            secure: true,
        }),
    },
});
