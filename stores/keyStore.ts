export const useKeyStore = defineStore('key', {
    state: () => {
        return {
            apiKey: '',
        };
    },
    persist: true,
});
