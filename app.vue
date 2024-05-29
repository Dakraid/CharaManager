<script lang="ts" setup>
import '~/assets/css/style.css';
import { Toaster } from '~/components/ui/toast';

const nuxtApp = useNuxtApp();
const characters = useCharacterStore();

nuxtApp.hooks.hook('refresh:characters', async () => {
    await characters.getCharacters();
});
</script>

<template>
    <NuxtPwaAssets />
    <div>
        <Toaster />
        <div class="h-screen w-screen flex flex-col">
            <NavigationBar />
            <Separator />
            <NuxtPage />
        </div>
    </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
    transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}
</style>
