<script setup lang="ts">
import * as Cards from 'character-card-utils';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/toast';
import type ApiResponse from '~/models/ApiResponse';
import PutDefinitionRequest from '~/models/PutDefinitionRequest';
import StatusCode from '~/models/enums/StatusCode';

const { toast } = useToast();

const settingsStore = useSettingsStore();
const applicationStore = useApplicationStore();

const selectedProps = ref(['description']);

const stringReplaceOriginal = ref('');
const stringReplaceReplace = ref('');
const regexReplaceOriginal = ref('');
const regexReplaceReplace = ref('');

const applyStringReplace = async () => {
    if (selectedProps.value.length === 0) {
        toast({
            title: 'Please select the fields to operate on.',
        });

        return;
    }

    const definitions = [];

    for (const id of applicationStore.operationEnabledIds) {
        const response = await $fetch<ApiResponse>('/api/definition', {
            method: 'GET',
            headers: { 'x-api-key': settingsStore.apiKey },
            query: { id: id },
        });

        if (response.Status === StatusCode.OK) {
            definitions.push(response.Content);
        } else {
            return;
        }
    }

    for (const definition of definitions) {
        try {
            const parsed = JSON.parse(definition.json);
            const character = Cards.parseToV2(parsed);

            for (const prop of selectedProps.value) {
                if (prop === 'alternate_greetings') {
                    if (character.data[prop] && (character.data[prop] as string[]).length > 0) {
                        for (let greeting of character.data[prop] as string[]) {
                            if (greeting.includes(stringReplaceOriginal.value)) {
                                greeting = greeting.replaceAll(stringReplaceOriginal.value, stringReplaceReplace.value);
                            }
                        }
                    }
                    continue;
                }

                if (character.data[prop]) {
                    if ((character.data[prop] as string).includes(stringReplaceOriginal.value)) {
                        (character.data[prop] as string) = (character.data[prop] as string).replaceAll(stringReplaceOriginal.value, stringReplaceReplace.value);
                    }
                }
            }

            const response = await $fetch<ApiResponse>('/api/definition', {
                method: 'PUT',
                headers: { 'x-api-key': settingsStore.apiKey },
                body: JSON.stringify(new PutDefinitionRequest(definition.id as number, JSON.stringify(character))),
            });

            if (response.Status === StatusCode.OK) {
                toast({
                    title: response.Message,
                    description: response.Content,
                });
            } else {
                toast({
                    title: response.Message,
                    description: response.Content,
                    variant: 'destructive',
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
};

const applyRegexReplace = async () => {
    if (selectedProps.value.length === 0) {
        toast({
            title: 'Please select the fields to operate on.',
        });

        return;
    }

    const definitions = [];

    for (const id of applicationStore.operationEnabledIds) {
        const response = await $fetch<ApiResponse>('/api/definition', {
            method: 'GET',
            headers: { 'x-api-key': settingsStore.apiKey },
            query: { id: id },
        });

        if (response.Status === StatusCode.OK) {
            definitions.push(response.Content);
        } else {
            return;
        }
    }

    const regex = new RegExp(regexReplaceOriginal.value, 'gm');

    for (const definition of definitions) {
        try {
            const parsed = JSON.parse(definition.json);
            const character = Cards.parseToV2(parsed);

            for (const prop of selectedProps.value) {
                if (prop === 'alternate_greetings') {
                    if (character.data[prop] && (character.data[prop] as string[]).length > 0) {
                        for (let greeting of character.data[prop] as string[]) {
                            if (greeting.match(regex)?.length) {
                                greeting = greeting.replaceAll(regex, regexReplaceReplace.value);
                            }
                        }
                    }
                    continue;
                }

                if (character.data[prop]) {
                    if ((character.data[prop] as string).match(regex)?.length) {
                        (character.data[prop] as string) = (character.data[prop] as string).replaceAll(regex, regexReplaceReplace.value);
                    }
                }
            }

            const response = await $fetch<ApiResponse>('/api/definition', {
                method: 'PUT',
                headers: { 'x-api-key': settingsStore.apiKey },
                body: JSON.stringify(new PutDefinitionRequest(definition.id as number, JSON.stringify(character))),
            });

            if (response.Status === StatusCode.OK) {
                toast({
                    title: response.Message,
                    description: response.Content,
                });
            } else {
                toast({
                    title: response.Message,
                    description: response.Content,
                    variant: 'destructive',
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
};
</script>

<template>
    <div class="flex flex-col md:order-2 w-full h-full max-w-sm gap-4">
        <Label class="text-1xl">Operate on:</Label>
        <ToggleGroup v-model="selectedProps" type="multiple" variant="outline" class="grid grid-cols-2">
            <ToggleGroupItem value="name"> Name </ToggleGroupItem>
            <ToggleGroupItem value="description"> Description </ToggleGroupItem>
            <ToggleGroupItem value="personality"> Personality </ToggleGroupItem>
            <ToggleGroupItem value="scenario"> Scenario </ToggleGroupItem>
            <ToggleGroupItem value="first_mes"> First Message </ToggleGroupItem>
            <ToggleGroupItem value="alternate_greetings"> Alternative Greetings </ToggleGroupItem>
            <ToggleGroupItem value="message_examples"> Message Examples </ToggleGroupItem>
            <ToggleGroupItem value="system_prompt"> System Prompt </ToggleGroupItem>
        </ToggleGroup>
        <Separator />
        <Label class="text-sm text-center font-bold text-red-500">These operations cannot be undone!</Label>
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
