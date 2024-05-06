<script setup lang="ts">
const response = await $fetch('/api/statistics', {
    method: 'POST',
});

console.log(response);
</script>

<template>
    <div class="grid h-full overflow-y-hidden py-6 lg:px-24 items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_300px]" />
</template>

<style scoped></style>
