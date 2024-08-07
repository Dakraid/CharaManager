<script setup lang="ts">
import json from 'json-keys-sort';
import { toast } from '~/components/ui/toast';
import type ApiResponse from '~/models/ApiResponse';
import type CharacterDetails from '~/models/CharacterDetails';
import type CharacterRelations from '~/models/CharacterRelations';
import StatusCode from '~/models/enums/StatusCode';

const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

const { data: response } = await useFetch<ApiResponse>('/api/relations', {
    method: 'GET',
    headers: { 'x-api-key': settingsStore.apiKey },
});

const relations = ref<CharacterRelations[]>([]);
relations.value = response.value?.Content.toSorted((a: CharacterRelations, b: CharacterRelations) => b.Parent - a.Parent);

if (relations.value.length == 0) {
    toast({
        title: 'No relations available',
        description: 'If you recently imported a card, please wait and refresh again',
        variant: 'destructive',
    });
}

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

const parentJsonString = ref('');
const childJsonString = ref('');
const characters = ref([] as CharacterDetails[]);

const getCharacters = async () => {
    const response = await $fetch<ApiResponse>('/api/characters', {
        method: 'GET',
        headers: { 'x-api-key': settingsStore.apiKey },
        query: { ids: ids },
    });

    if (response.Status !== StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });

        return;
    }

    characters.value = response.Content;
};

const showCharacter = async (parentId: number) => {
    const response = await $fetch<ApiResponse>('/api/character', {
        method: 'GET',
        headers: { 'x-api-key': settingsStore.apiKey },
        query: { id: parentId },
    });

    if (response.Status !== StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });

        return;
    }

    applicationStore.characterInstance = response.Content;
    applicationStore.showCharacterWindow = true;
};

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

await getCharacters();

applicationStore.showDiffWindow = false;
applicationStore.showCharacterWindow = false;
</script>

<template>
    <div v-if="relations.length == 0" class="flex-col h-full overflow-y-hidden py-6 lg:px-24 items-stretch">
        <div class="w-full h-full py-16 flex flex-1 flex-col gap-2 justify-center items-center">
            <h1 class="font-bold text-2xl">No relations found</h1>
            <Icon class="w-16 h-16" name="radix-icons:question-mark-circled" />
            <h2 class="font-bold text-xl">Either no relations exists, or you imported a card so relations will have to build. If latter, wait and refresh again.</h2>
        </div>
    </div>
    <div class="flex-col h-full overflow-y-hidden py-6 lg:px-24 items-stretch">
        <Transition>
            <div v-if="applicationStore.showCharacterWindow" class="absolute backdrop-blur bg-background/50 transition-all w-full h-full inset-0 z-20 p-12 rounded-md overflow-hidden">
                <CharacterWindow />
            </div>
        </Transition>
        <Transition>
            <div v-if="applicationStore.showDiffWindow" class="absolute backdrop-blur bg-background/50 transition-all w-full h-full inset-0 z-20 p-12 rounded-md">
                <CharacterDiff :curr-json="parentJsonString" :old-json="childJsonString" />
            </div>
        </Transition>
        <ScrollArea class="w-full h-full overflow-y-hidden rounded-md border p-4 pr-6 transition-all">
            <h1 class="text-xl font-bold text-center">Total Count of Child Relations: {{ total }}</h1>
            <h2 class="text-xl text-center text-muted-foreground">Click on a child to see the differences</h2>
            <Separator class="my-4" />
            <div v-for="relation in relations" :key="relation.Parent" class="flex flex-col gap-4">
                <h1 class="font-bold">Character Filename: {{ characters.find((x) => x.id === relation.Parent)?.file_name }}</h1>
                <div class="flex gap-8 p-6">
                    <Card
                        class="flex flex-col items-center w-60 transition-all hover:border-accent-foreground hover:shadow-[0_0_20px_-5px] hover:shadow-accent-foreground hover:scale-105 hover:transition-all">
                        <CardHeader class="flex flex-col w-full items-center gap-2 flex-1 p-2">
                            <CardTitle class="flex flex-col gap-2 text-center items-center">
                                <span class="text-muted-foreground">Current:</span>
                                <span class="font-bold">ID#{{ relation.Parent }}</span>
                                <span class="text-muted-foreground">{{ characters.find((x) => x.id === relation.Parent)?.formatted_timestamp }}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent class="w-full p-2 overflow-hidden">
                            <img
                                :key="relation.Parent"
                                loading="lazy"
                                :alt="relation.Parent.toString()"
                                :src="characterStore.characterImages.find((x) => x.id === (relation.Parent as number))?.content_small ?? ''"
                                class="character-card rounded-2xl"
                                @click="showCharacter(relation.Parent)" />
                        </CardContent>
                    </Card>
                    <Icon class="h-8 w-8 my-auto" name="radix-icons:double-arrow-right" />
                    <div class="flex gap-6">
                        <Card
                            v-for="child in relation.Children"
                            class="flex flex-col items-center w-60 transition-all hover:border-accent-foreground hover:shadow-[0_0_20px_-5px] hover:shadow-accent-foreground hover:scale-105 hover:transition-all">
                            <CardHeader class="flex flex-col w-full items-center gap-2 flex-1 p-2">
                                <CardTitle class="flex flex-col gap-2 text-center items-center">
                                    <span class="text-muted-foreground">Previous:</span>
                                    <span class="font-bold">ID#{{ child }}</span>
                                    <span class="text-muted-foreground">{{ characters.find((x) => x.id === child)?.formatted_timestamp }}</span>
                                </CardTitle>
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
