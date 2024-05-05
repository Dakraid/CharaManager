<script lang="ts" setup>
await $fetch('/api/database', {
    method: 'POST',
});
</script>

<template>
    <NuxtPage />
</template>
