<script lang="ts" setup>
import '~/assets/css/style.css';
import { Toaster } from '~/components/ui/toast';
</script>

<template>
    <Toaster />
    <div class="h-screen flex flex-col overflow-y-hidden">
        <TopBar />
        <Separator />
        <NuxtPage />
    </div>
</template>
