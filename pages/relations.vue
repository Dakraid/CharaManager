<script setup lang="ts">
import json from 'json-keys-sort';
import type ApiResponse from '~/models/ApiResponse';
import type CharacterRelations from '~/models/CharacterRelations';
import { useCharacterStore } from '~/stores/characterStore';

const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

const { data: response } = await useFetch<ApiResponse>('/api/relations', {
    method: 'GET',
    headers: { 'x-api-key': settingsStore.apiKey },
});

const relations = ref<CharacterRelations[]>([]);
relations.value = response.value?.Content.toSorted((a: CharacterRelations, b: CharacterRelations) => b.Parent - a.Parent);

const total = ref(0);
total.value = relations.value
    .map((x) => x.Children.length)
    .reduce((acc, curr) => {
        return acc + curr;
    }, 0);

let ids: number[] = [];
ids = ids.concat(relations.value.map((x) => x.Parent));
for (const relation of relations.value) {
    relation.Children.forEach((child) => {
        ids.push(child);
    });
}
await characterStore.getCharacterImages(ids);

const showDiffWindow = ref(false);
const parentJsonString = ref('');
const childJsonString = ref('');

const showDiff = async (parentId: number, childId: number) => {
    applicationStore.showDiffWindow = false;

    const parent = await $fetch<ApiResponse>('/api/definition', {
        method: 'GET',
        headers: { 'x-api-key': settingsStore.apiKey },
        query: { id: parentId },
    });
    const child = await $fetch<ApiResponse>('/api/definition', {
        method: 'GET',
        headers: { 'x-api-key': settingsStore.apiKey },
        query: { id: childId },
    });

    const parentJson = JSON.parse(parent.Content.json);
    const childJson = JSON.parse(child.Content.json);
    parentJson.data = await json.sortAsync(parentJson.data);
    childJson.data = await json.sortAsync(childJson.data);

    parentJsonString.value = JSON.stringify(parentJson, null, 4);
    childJsonString.value = JSON.stringify(childJson, null, 4);

    applicationStore.showDiffWindow = true;
};

onMounted(async () => {
    const updateApplication = async () => {
        showDiffWindow.value = applicationStore.showDiffWindow;
    };

    applicationStore.$subscribe(updateApplication);

    await updateApplication();
});
</script>

<template>
    <div class="flex-col h-full overflow-y-hidden py-6 lg:px-24 items-stretch">
        <div v-if="showDiffWindow" class="w-full h-full rounded-md border p-4">
            <CharacterDiff :curr-json="parentJsonString" :old-json="childJsonString" />
        </div>
        <ScrollArea v-else class="w-full h-full overflow-y-hidden rounded-md border p-4 pr-6 transition-all">
            <h1 class="text-xl font-bold text-center">Total Count of Child Relations: {{ total }}</h1>
            <Separator class="my-4" />
            <div v-for="relation in relations" :key="relation.Parent" class="flex flex-col gap-4 mt-4">
                <div class="flex gap-8">
                    <Card class="flex flex-col items-center w-60">
                        <CardHeader class="flex flex-col w-full items-center gap-2 flex-1 p-2">
                            <CardTitle class="font-bold text-center"> Current: ID#{{ relation.Parent }} </CardTitle>
                        </CardHeader>
                        <CardContent class="w-full p-2 overflow-hidden">
                            <img
                                :key="relation.Parent"
                                loading="lazy"
                                :alt="relation.Parent.toString()"
                                :src="characterStore.characterImages.find((x) => x.id === (relation.Parent as number))?.content_small ?? ''"
                                class="character-card rounded-2xl" />
                        </CardContent>
                    </Card>
                    <Icon class="h-8 w-8 my-auto" name="radix-icons:double-arrow-right" />
                    <div class="flex gap-2">
                        <Card v-for="child in relation.Children" class="flex flex-col items-center w-60">
                            <CardHeader class="flex flex-col w-full items-center gap-2 flex-1 p-2">
                                <CardTitle class="font-bold text-center"> Previous: ID#{{ child }} </CardTitle>
                            </CardHeader>
                            <CardContent class="w-full p-2 overflow-hidden">
                                <img
                                    :key="child"
                                    loading="lazy"
                                    :alt="child.toString()"
                                    :src="characterStore.characterImages.find((x) => x.id === (child as number))?.content_small ?? ''"
                                    class="character-card rounded-2xl"
                                    @click="showDiff(relation.Parent, child)" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Separator class="my-4" />
            </div>
        </ScrollArea>
    </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
