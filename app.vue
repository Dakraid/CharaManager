<script lang="ts" setup>
import '~/assets/css/style.css';
import { Toaster } from '~/components/ui/toast';
</script>

<template>
    <div class="h-full w-full">
        <Toaster />
        <div class="h-screen flex flex-col overflow-y-hidden">
            <TopBar />
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
