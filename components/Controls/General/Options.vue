<script setup lang="ts">
const settingsStore = useSettingsStore();
</script>

<template>
    <div class="flex items-center pl-6 gap-2 justify-start">
        <Checkbox id="censorChars" v-model:checked="settingsStore.censorChars" />
        <label for="censorChars" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Blur and Greyscale Character Images? </label>
    </div>
    <div class="flex items-center pl-6 gap-2 justify-start">
        <Checkbox id="censorNames" v-model:checked="settingsStore.censorNames" />
        <label for="censorNames" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Censor Character Names? </label>
    </div>
</template>

<style scoped></style>
