<script lang="ts" setup>
import { Toaster } from '~/components/ui/toast';

const applicationStore = useApplicationStore();

if (!applicationStore.provisioned) {
    await $fetch('/api/database-provision', {
        method: 'POST',
    });

    applicationStore.provisioned = true;
}
</script>

<template>
    <Toaster />
    <div class="h-screen flex flex-col overflow-y-hidden">
        <TopBar />
        <Separator />
        <NuxtPage />
    </div>
</template>
