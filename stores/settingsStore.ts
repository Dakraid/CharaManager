export const useSettingsStore = defineStore('settings', {
    state: () => {
        return {
            apiKey: '',
            compressData: true,
            censorChars: false,
            censorNames: false,
            openMenu: false,
            orderByValue: 'time_desc',
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
