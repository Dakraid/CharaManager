<script lang="ts" setup>
import '~/assets/css/style.css';
import { Toaster } from '~/components/ui/toast';

const applicationStore = useApplicationStore();
await applicationStore.updateLoadingState(true);
</script>

<template>
    <NuxtPwaAssets />
    <div>
        <Toaster />
        <div class="h-screen w-screen flex flex-col">
            <NavigationBar />
            <Separator />
            <Transition>
                <CommonLoadingOverlay v-if="applicationStore.loadingCharacters" />
            </Transition>
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
