<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/toast';
import type { FileUpload } from '~/models/FileUpload';
import { useCharacterStore } from '~/stores/characterStore';
import { useApplicationStore } from '~/stores/applicationStore';
import { cn } from '~/lib/utils';
import type { ChubAiGetRequest } from '~/models/ChubAiGetRequest';
import type { StatusResponse } from '~/models/StatusResponse';

const emit = defineEmits(['update-characters']);

const { toast } = useToast();

const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

const files = ref<FileUpload[]>([]);
const fileInput = ref(null);

const onFileChange = async (e: any) => {
    const fileList = e.target.files || e.dataTransfer.files;
    if (!fileList.length) return;

    const serializeFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            files.value.push({
                name: file.name,
                lastModified: file.lastModified,
                content: e.target.result,
            });
        };
        reader.readAsDataURL(file);
    };

    for (const file of fileList) {
        serializeFile(file);
    }
};

const uploadFiles = async () => {
    if (files.value.length === 0) {
        toast({
            title: 'No images selected.',
            description: 'Please select images before trying to upload.',
            variant: 'destructive',
        });
        return;
    }

    applicationStore.processing = true;

    files.value.sort(function (a, b) {
        return b.lastModified - a.lastModified;
    });

    const response = await $fetch('/api/characters', {
        method: 'PUT',
        body: {
            files: files.value,
        },
    });

    applicationStore.processing = false;

    if (response?.status) {
        toast({
            title: 'Files have been uploaded.',
            description: response?.message,
        });
    }

    files.value.length = 0;

    if (fileInput.value) {
        // TODO: Make file upload a form so it can be reset properly
        fileInput.value.value = '';
    }

    emit('update-characters');
};

const deleteCharacter = async () => {
    applicationStore.deleteOptions = { id: -1, purge: true };
    const response = await characterStore.deleteCharacter();

    if (response?.status === 200) {
        toast({
            title: 'Character(s) have been deleted',
            description: response.message,
        });
    } else {
        toast({
            title: "Character(s) couldn't be deleted",
            description: response?.message,
            variant: 'destructive',
        });
    }

    emit('update-characters');
};

const chubAiCharacterUrl = ref('');
const chubAiCharacter = ref();
const downloadChubAiCharacter = async () => {
    if (!chubAiCharacterUrl.value.startsWith('https://www.chub.ai/characters/')) {
        toast({
            title: 'Wrong Chub.ai URL',
            description: 'The URL you entered is not valid.',
            variant: 'destructive',
        });
        return;
    }

    const response: StatusResponse = await $fetch('/api/chubai', {
        method: 'POST',
        body: { characterUrl: chubAiCharacterUrl.value },
    });

    if (response) {
        chubAiCharacter.value = response.content;
    }
};

const saveChubAiCharacter = async () => {
    if (chubAiCharacter.value) {
        files.value.length = 0;
        files.value.push(chubAiCharacter.value);
        await uploadFiles();
        chubAiCharacterUrl.value = '';
        chubAiCharacter.value = undefined;
    }
};

const clearChubAiCharacter = async () => {
    chubAiCharacterUrl.value = '';
    chubAiCharacter.value = undefined;
};
</script>

<template>
    <div class="flex flex-col md:order-2 w-full max-w-sm gap-4">
        <Label class="text-1xl" for="file-input">Upload</Label>
        <Input id="file-input" ref="fileInput" class="min-h-9" accept="image/png" multiple name="files[]" type="file" @change="onFileChange" />
        <Button type="submit" variant="secondary" @click="uploadFiles">
            <span class="sr-only">Upload File(s)</span>
            <Icon class="h-6 w-6" name="radix-icons:upload" />
        </Button>
        <Separator />
        <Label class="text-1xl" for="file-input">Reload Character List</Label>
        <Button type="submit" variant="secondary" @click="$emit('update-characters')">
            <span class="sr-only">Reload Character List</span>
            <Icon class="h-6 w-6" name="radix-icons:symbol" />
        </Button>
        <Separator />
        <div class="flex items-center pl-6 gap-2 justify-start">
            <Checkbox id="censorChars" v-model:checked="applicationStore.censorChars" />
            <label for="censorChars" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Blur and Greyscale Character Images? </label>
        </div>
        <div class="flex items-center pl-6 gap-2 justify-start">
            <Checkbox id="censorNames" v-model:checked="applicationStore.censorNames" />
            <label for="censorNames" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Censor Character Names? </label>
        </div>
        <Separator />
        <Label class="text-1xl" for="chubai-url">Chub.ai Download</Label>
        <Input id="chubai-url" v-model="chubAiCharacterUrl" class="min-h-9" type="url" placeholder="https://www.chub.ai/characters/..." />
        <Button type="submit" variant="secondary" @click="downloadChubAiCharacter">
            <span class="sr-only">Download Character</span>
            <Icon class="h-6 w-6" name="radix-icons:download" />
        </Button>
        <div v-if="chubAiCharacter" class="flex flex-col items-center gap-4">
            <span>{{ chubAiCharacter.name }}</span>
            <img :src="chubAiCharacter.content" :alt="chubAiCharacter.name" class="character-card-chub rounded-2xl" />
            <div class="flex w-full gap-4">
                <Button type="submit" variant="secondary" class="w-full" @click="saveChubAiCharacter">
                    <span>Save</span>
                </Button>
                <Button type="submit" variant="destructive" class="w-full" @click="clearChubAiCharacter">
                    <span>Clear</span>
                </Button>
            </div>
        </div>
        <Separator />
        <div class="flex-grow h-full" />
        <Separator />
        <Label class="text-1xl" for="file-input">Delete All Files</Label>
        <AlertDialog>
            <AlertDialogTrigger as-child>
                <Button type="submit" variant="destructive">
                    <span class="sr-only">Delete All File(s)</span>
                    <Icon class="h-6 w-6" name="radix-icons:trash" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your characters and remove your data from the database.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction @click="deleteCharacter">Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</template>

<style scoped></style>
