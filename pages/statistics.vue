<script setup lang="ts">
import type { Statistics } from '~/models/OLD/Statistics';

const settingsStore = useSettingsStore();

const response: Statistics = await $fetch('/api/statistics', {
    method: 'POST',
    headers: { 'x-api-key': settingsStore.apiKey },
});

const statistics = ref();
statistics.value = response;
</script>

<template>
    <div class="flex-col h-full overflow-y-hidden py-6 lg:px-24 items-stretch">
        <ScrollArea class="w-full h-full overflow-y-hidden rounded-md border p-4 pr-6">
            <div class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Characters per Author (Count > 1)</Label>
                <BarChart :data="statistics.charAuthors.filter((x: any) => x.count > 1).sort((a: any, b: any) => b.count - a.count)" index="name" :categories="['count']" />
            </div>
            <div class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Character Downloads per Date (Count > 0)</Label>
                <LineChart :data="statistics.charDates" index="date" :categories="['count']" />
            </div>
            <div class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Tokens per Characters</Label>
                <BarChart :data="statistics.charTokens.filter((x: any) => x.count > 1).sort((a: any, b: any) => b.count - a.count)" index="name" :categories="['count']" />
            </div>
        </ScrollArea>
    </div>
</template>

<style scoped></style>
