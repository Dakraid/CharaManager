<script setup lang="ts">
import { debounce } from 'perfect-debounce';
import { cn } from '~/lib/utils';

const nuxtApp = useNuxtApp();

const sortOptions = [
    { value: 'time_desc', label: 'DateTime ↓' },
    { value: 'alph_desc', label: 'Alphabetical ↓' },
    { value: 'id_desc', label: 'Identifier ↓' },
    { value: 'time_asc', label: 'DateTime ↑' },
    { value: 'alph_asc', label: 'Alphabetical ↑' },
    { value: 'id_asc', label: 'Identifier ↑' },
];

const settingStore = useSettingsStore();
const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

const openOrderBy = ref(false);
const openItemsPerPage = ref(false);

await characterStore.getCharacterCount();

const updatePage = async (page: number) => {
    applicationStore.currentPage = page;
    applicationStore.operationEnabledIds.clear();
    await nuxtApp.hooks.callHook('refresh:characters');
};

const clearSearch = async () => {
    if (applicationStore.searchValue.length > 0) {
        applicationStore.searchValue = '';
        await nuxtApp.hooks.callHook('refresh:characters');
    }
};
</script>

<template>
    <div class="grid control-grid w-full items-center justify-items-center gap-2 row-start-1">
        <div class="flex gap-1">
            <div class="relative w-[250px] max-w-sm items-center">
                <Input id="search" v-model="applicationStore.searchValue" type="text" placeholder="Search..." class="pl-10" @input="processSearch" />
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                    <Icon class="h-6 w-6 text-muted-foreground" name="radix-icons:magnifying-glass" />
                </span>
            </div>
            <Button variant="outline" size="icon" @click="clearSearch">
                <Icon class="w-4 h-4" name="radix-icons:cross-circled" />
            </Button>
        </div>

        <div class="flex flex-wrap gap-2 w-full items-center justify-center xl:justify-between row-start-3 2xl:row-start-1 2xl:col-start-2 2xl:col-span-1 2xl:justify-center">
            <Button class="w-[200px] justify-center" variant="outline"> Number of characters: {{ characterStore.characterCount }} </Button>

            <Pagination
                v-slot="{ page }"
                :total="characterStore.characterCount"
                :items-per-page="applicationStore.itemsPerPage"
                :sibling-count="0"
                show-edges
                :default-page="1"
                @update:page="updatePage">
                <PaginationList v-slot="{ items }" class="flex items-center gap-1">
                    <PaginationFirst />
                    <PaginationPrev />
                    <template v-for="(item, index) in items">
                        <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                            <Button class="w-10 h-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
                                {{ item.value }}
                            </Button>
                        </PaginationListItem>
                        <PaginationEllipsis v-else :key="item.type" :index="index" />
                    </template>
                    <PaginationNext />
                    <PaginationLast />
                </PaginationList>
            </Pagination>

            <Popover v-model:open="openItemsPerPage">
                <PopoverTrigger as-child>
                    <Button :aria-expanded="openItemsPerPage" class="w-[200px] justify-between" role="combobox" variant="outline">
                        {{
                            applicationStore.itemsPerPageOptions
                                ? applicationStore.itemsPerPageOptions.find((option) => option.value === applicationStore.itemsPerPage)?.label
                                : 'Select Items Per Page...'
                        }}
                        <Icon class="ml-2 h-4 w-4 shrink-0 opacity-50" name="radix-icons:caret-sort" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandGroup>
                                <CommandItem
                                    v-for="option in applicationStore.itemsPerPageOptions"
                                    :key="option.value"
                                    :value="option.value"
                                    @select="
                                        async (ev) => {
                                            if (typeof ev.detail.value === 'number') {
                                                applicationStore.itemsPerPage = ev.detail.value;
                                            }
                                            openItemsPerPage = false;
                                            await nuxtApp.hooks.callHook('refresh:characters');
                                        }
                                    ">
                                    {{ option.label }}
                                    <Icon :class="cn('ml-auto h-4 w-4', applicationStore.itemsPerPage === option.value ? 'opacity-100' : 'opacity-0')" name="radix-icons:check" />
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>

        <div class="flex gap-1 row-start-2 2xl:row-start-1">
            <Popover v-model:open="openOrderBy">
                <PopoverTrigger as-child>
                    <Button :aria-expanded="openOrderBy" class="w-[290px] justify-between" role="combobox" variant="outline">
                        {{ settingStore.orderByValue ? sortOptions.find((option) => option.value === settingStore.orderByValue)?.label : 'Select Order...' }}
                        <Icon class="ml-2 h-4 w-4 shrink-0 opacity-50" name="radix-icons:caret-sort" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-[290px] p-0">
                    <Command>
                        <CommandInput class="h-9" placeholder="Search Order..." />
                        <CommandList>
                            <CommandGroup>
                                <CommandItem
                                    v-for="option in sortOptions"
                                    :key="option.value"
                                    :value="option.value"
                                    @select="
                                        async (ev) => {
                                            if (typeof ev.detail.value === 'string') {
                                                settingStore.orderByValue = ev.detail.value;
                                            }
                                            openOrderBy = false;
                                            await nuxtApp.hooks.callHook('refresh:characters');
                                        }
                                    ">
                                    {{ option.label }}
                                    <Icon :class="cn('ml-auto h-4 w-4', settingStore.orderByValue === option.value ? 'opacity-100' : 'opacity-0')" name="radix-icons:check" />
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    </div>
</template>

<style scoped></style>
