<script setup lang="ts">
import * as Cards from 'character-card-utils';
import { Button } from '~/components/ui/button';
import type ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';

const keyStore = useKeyStore();
const applicationStore = useApplicationStore();

const stringReplaceOriginal = ref('');
const stringReplaceReplace = ref('');
const regexReplaceOriginal = ref('');
const regexReplaceReplace = ref('');

const applyStringReplace = async () => {
    const definitions = [];
    for (const id of applicationStore.operationEnabledIds) {
        const response = await $fetch<ApiResponse>('/api/definition', {
            method: 'GET',
            headers: { 'x-api-key': keyStore.apiKey },
            query: { id: id },
        });

        if (response.Status === StatusCode.OK) {
            definitions.push(response.Content);
        }
    }

    for (const definition of definitions) {
        try {
            const parsed = JSON.parse(definition.json);
            const character = Cards.parseToV2(parsed);

            console.log(character.data.description.includes(stringReplaceOriginal.value));
        } catch (e) {
            console.error(e);
        }
    }
};

const applyRegexReplace = async () => {
    //
};
</script>

<template>
    <div class="flex flex-col md:order-2 w-full h-full max-w-sm gap-4">
        <Label class="text-1xl" for="string-replace">String Replace</Label>
        <Textarea id="string-replace" v-model="stringReplaceOriginal" class="min-h-9" type="url" placeholder="String to replace for..." />
        <Textarea id="string-replace" v-model="stringReplaceReplace" class="min-h-9" type="url" placeholder="String to replace with..." />
        <Button type="submit" variant="secondary" @click="applyStringReplace">
            <span class="text-accent-foreground">Apply Operation</span>
        </Button>
        <Separator />
        <Label class="text-1xl" for="regex-replace">Regex Replace</Label>
        <Textarea id="regex-replace" v-model="regexReplaceOriginal" class="min-h-9" type="url" placeholder="Regex to replace for..." />
        <Textarea id="regex-replace" v-model="regexReplaceReplace" class="min-h-9" type="url" placeholder="Regex to replace with..." />
        <Button type="submit" variant="secondary" @click="applyRegexReplace">
            <span class="text-accent-foreground">Apply Operation</span>
        </Button>
    </div>
</template>

<style scoped></style>
