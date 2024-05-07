<script setup lang="ts">
import type {Statistics} from "~/models/Statistics";

const response: Statistics = await $fetch('/api/statistics', {
    method: 'POST',
});

const statistics = ref();
statistics.value = response
</script>

<template>
    <div class="flex-col h-full overflow-y-hidden py-6 lg:px-24 items-stretch">
        <div class="flex flex-col gap-4 mb-24">
            <Label>Characters per Author</Label>
            <BarChart
                :data="response.charAuthors.filter(x => x.count > 1).sort((a, b) => b.count - a.count)"
                index="name"
                :categories="['count']"
            />
        </div>
        <div class="flex flex-col gap-4">
            <Label>Characters per Date</Label>
            <LineChart
                :data="response.charDates"
                index="date"
                :categories="['count']"
            />
        </div>
    </div>
</template>

<style scoped></style>
