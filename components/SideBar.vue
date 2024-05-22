<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/toast';
import type ApiResponse from '~/models/ApiResponse';
import DatabaseRequest from '~/models/DatabaseRequest';
import type { FileUpload } from '~/models/OLD/FileUpload';
import { DatabaseAction } from '~/models/enums/DatabaseAction';
import StatusCode from '~/models/enums/StatusCode';
import { useApplicationStore } from '~/stores/applicationStore';

const emit = defineEmits(['update-characters']);

const { toast } = useToast();

const loading = ref(false);

const keyStore = useKeyStore();
const applicationStore = useApplicationStore();

const files = ref<FileUpload[]>([]);
const fileInput = ref<HTMLInputElement>();

const activeAction = ref(false);

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
    activeAction.value = true;
    if (files.value.length === 0) {
        toast({
            title: 'No images selected',
            description: 'Please select images before trying to upload.',
            variant: 'destructive',
        });
        return;
    }

    applicationStore.processing = true;

    files.value.sort(function (a, b) {
        return b.lastModified - a.lastModified;
    });

    const response = await $fetch<ApiResponse>('/api/characters', {
        method: 'PUT',
        headers: { 'x-api-key': keyStore.apiKey },
        body: {
            files: files.value,
        },
    });

    applicationStore.processing = false;

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

    files.value.length = 0;

    if (fileInput.value) {
        // TODO: Make file upload a form so it can be reset properly
        fileInput.value.value = '';
    }

    activeAction.value = false;
    emit('update-characters');
};

const renderImages = async () => {
    activeAction.value = true;
    const response = await $fetch<ApiResponse>('/api/images', {
        method: 'POST',
        headers: { 'x-api-key': keyStore.apiKey },
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
    activeAction.value = false;
};

const updateCharacters = async () => {
    activeAction.value = true;
    const response = await $fetch<ApiResponse>('/api/database', {
        method: 'POST',
        headers: { 'x-api-key': keyStore.apiKey },
        body: JSON.stringify(new DatabaseRequest(DatabaseAction.Update)),
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
    activeAction.value = false;
};

const synchronizeDefinitions = async () => {
    activeAction.value = true;
    const response = await $fetch<ApiResponse>('/api/database', {
        method: 'POST',
        headers: { 'x-api-key': keyStore.apiKey },
        body: JSON.stringify(new DatabaseRequest(DatabaseAction.Synchronize)),
    });

    if (response.Status === StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
        });
    }
    activeAction.value = false;
};

const synchronizeRelations = async () => {
    activeAction.value = true;
    const response = await $fetch<ApiResponse>('/api/relations', {
        method: 'PUT',
        headers: { 'x-api-key': keyStore.apiKey },
    });

    if (response.Status === StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
        });
    }
    activeAction.value = false;
};

const deleteCharacters = async () => {
    activeAction.value = true;
    const response = await $fetch<ApiResponse>('/api/database', {
        method: 'DELETE',
        headers: { 'x-api-key': keyStore.apiKey },
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

    activeAction.value = false;
    emit('update-characters');
};

const characterUrl = ref('');
const fetchedCharacter = ref();
const downloadChubAiCharacter = async () => {
    if (characterUrl.value.trim().length === 0) {
        return;
    }
    if (!characterUrl.value.includes('chub.ai/characters/') && !characterUrl.value.includes('characterhub.org/characters/')) {
        toast({
            title: 'Wrong URL',
            description: 'The URL you entered is not valid.',
            variant: 'destructive',
        });
        return;
    }

    loading.value = true;
    const response = await $fetch<ApiResponse>('/api/chubai', {
        method: 'POST',
        headers: { 'x-api-key': keyStore.apiKey },
        body: { characterUrl: characterUrl.value },
    });

    if (response.Status === StatusCode.OK) {
        fetchedCharacter.value = response.Content;
    } else {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });
    }
    loading.value = false;
};

const saveChubAiCharacter = async () => {
    if (fetchedCharacter.value) {
        files.value.length = 0;
        files.value.push(fetchedCharacter.value);
        await uploadFiles();
        characterUrl.value = '';
        fetchedCharacter.value = undefined;
    }
};

const clearChubAiCharacter = async () => {
    characterUrl.value = '';
    fetchedCharacter.value = undefined;
};
</script>

<template>
    <Tabs default-value="general" class="flex flex-col h-full w-full max-w-sm py-1px">
        <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="general"> General </TabsTrigger>
            <TabsTrigger value="download"> Download </TabsTrigger>
        </TabsList>
        <TabsContent value="general" class="flex-grow">
            <div class="flex flex-col md:order-2 w-full h-full max-w-sm gap-4">
                <Label class="text-1xl" for="file-input">Upload</Label>
                <Input id="file-input" ref="fileInput" class="min-h-9" accept="image/png" multiple name="files[]" type="file" @change="onFileChange" />
                <Button type="submit" variant="secondary" @click="uploadFiles">
                    <span class="sr-only">Upload File(s)</span>
                    <Icon class="h-6 w-6" name="radix-icons:upload" />
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
                <div class="h-full" />
                <div v-if="activeAction" class="h-full flex items-center justify-center">
                    <Icon class="h-16 w-16" name="line-md:loading-loop" />
                </div>
                <div class="h-full" />
                <Separator />
                <Label class="text-1xl">Reload Characters from Database</Label>
                <Button type="submit" variant="outline" @click="$emit('update-characters')">
                    <span class="sr-only">Reload Character List</span>
                    <Icon class="h-6 w-6" name="radix-icons:symbol" />
                </Button>
                <Label class="text-1xl">Render Images</Label>
                <Button type="submit" variant="outline" @click="renderImages">
                    <span class="sr-only">Render Images</span>
                    <Icon class="h-6 w-6" name="radix-icons:image" />
                </Button>
                <Label class="text-1xl" for="update-database">Update all v1 to v2</Label>
                <Button id="update-database" type="submit" variant="outline" @click="updateCharacters">
                    <span class="sr-only">Update all v1 to v2</span>
                    <Icon class="h-6 w-6" name="radix-icons:timer" />
                </Button>
                <Label class="text-1xl" for="sync-definitions">Synchronize Definitions</Label>
                <Button id="sync-definitions" type="submit" variant="outline" @click="synchronizeDefinitions">
                    <span class="sr-only">Synchronize Definitions</span>
                    <Icon class="h-6 w-6" name="radix-icons:symbol" />
                </Button>
                <Label class="text-1xl" for="sync-relations">Synchronize Relations</Label>
                <Button id="sync-relations" type="submit" variant="outline" @click="synchronizeRelations">
                    <span class="sr-only">Synchronize Relations</span>
                    <Icon class="h-6 w-6" name="radix-icons:symbol" />
                </Button>
                <Separator />
                <Label class="text-1xl" for="delete-files">Delete All Files</Label>
                <AlertDialog>
                    <AlertDialogTrigger as-child>
                        <Button id="delete-files" type="submit" variant="destructive">
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
                            <AlertDialogAction @click="deleteCharacters">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TabsContent>
        <TabsContent value="download">
            <ScrollArea class="h-full w-full">
                <div class="flex flex-col md:order-2 w-full h-full max-w-sm gap-4">
                    <Label class="text-1xl" for="char-url">Character Download</Label>
                    <Input id="char-url" v-model="characterUrl" class="min-h-9" type="url" placeholder="https://..." />
                    <Button type="submit" variant="secondary" @click="downloadChubAiCharacter">
                        <span class="sr-only">Download Character</span>
                        <Icon class="h-6 w-6" name="radix-icons:download" />
                    </Button>
                    <div v-if="loading" class="flex flex-col items-center gap-4">
                        <Skeleton class="w-[332px] h-[48px] rounded-2xl" />
                        <Skeleton class="w-[332px] h-[516px] rounded-2xl" />
                    </div>
                    <div v-else-if="fetchedCharacter" class="flex flex-col items-center gap-4">
                        <span>{{ fetchedCharacter.name }}</span>
                        <img :src="fetchedCharacter.content" :alt="fetchedCharacter.name" class="character-card-chub rounded-2xl" />
                        <div class="flex w-full gap-4">
                            <Button type="submit" variant="secondary" class="w-full" @click="saveChubAiCharacter">
                                <span>Save</span>
                            </Button>
                            <Button type="submit" variant="destructive" class="w-full" @click="clearChubAiCharacter">
                                <span>Clear</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </TabsContent>
    </Tabs>
</template>

<style scoped></style>
