<script setup lang="ts">
import { cn } from '~/lib/utils';
import type ApiResponse from '~/models/ApiResponse';
import type CharacterRelations from '~/models/CharacterRelations';

const response = await $fetch<ApiResponse>('/api/relations', {
    method: 'GET',
});

const relations = ref<CharacterRelations[]>([]);
relations.value = response.Content.toSorted((a: CharacterRelations, b: CharacterRelations) => b.Parent - a.Parent);

const total = ref(0);
total.value = relations.value
    .map((x) => x.Children.length)
    .reduce((acc, curr) => {
        return acc + curr;
    }, 0);
</script>

<template>
    <div class="flex-col h-full overflow-y-hidden py-6 lg:px-24 items-stretch">
        <ScrollArea class="w-full h-full overflow-y-hidden rounded-md border p-4 pr-6">
            <h1 class="text-xl font-bold text-center">Total Count of Child Relations: {{ total }}</h1>
            <Separator class="my-4" />
            <div v-for="relation in relations" :key="relation.Parent" class="flex flex-col gap-4 mt-4">
                <div class="flex gap-8">
                    <Card class="flex flex-col items-center w-60">
                        <CardHeader class="flex flex-col w-full items-center gap-2 flex-1 p-2">
                            <CardTitle class="font-bold text-center"> Current: ID#{{ relation.Parent }} </CardTitle>
                        </CardHeader>
                        <CardContent class="w-full p-2 overflow-hidden">
                            <NuxtImg
                                :key="relation.Parent"
                                width="300"
                                height="222"
                                fit="inside"
                                loading="lazy"
                                :alt="relation.Parent.toString()"
                                :src="`/${relation.Parent}.png`"
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
                                <NuxtImg :key="child" width="300" height="222" fit="inside" loading="lazy" :alt="child.toString()" :src="`/${child}.png`" class="character-card rounded-2xl" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Separator class="my-4" />
            </div>
        </ScrollArea>
    </div>
</template>

<style scoped></style>
