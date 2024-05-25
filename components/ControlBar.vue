<script setup lang="ts">
import { debounce } from 'perfect-debounce';
import { cn } from '~/lib/utils';

import { useCharacterStore } from '~/stores/characterStore';

const emit = defineEmits(['update-characters']);

const sortOptions = [
    { value: 'time_desc', label: 'DateTime ↓' },
    { value: 'alph_desc', label: 'Alphabetical ↓' },
    { value: 'id_desc', label: 'Identifier ↓' },
    { value: 'time_asc', label: 'DateTime ↑' },
    { value: 'alph_asc', label: 'Alphabetical ↑' },
    { value: 'id_asc', label: 'Identifier ↑' },
];

// This isn't a constant as it will be overwritten using custom options based on the width
let itemsPerPageOptions = [{ value: 5, label: '5' }];
const itemsPerPage = ref(5);

const applicationStore = useApplicationStore();

const updateApplication = async () => {
    itemsPerPage.value = applicationStore.itemsPerPage;
};

applicationStore.$subscribe(updateApplication);

const characterStore = useCharacterStore();
const characterCount = ref(0);

const updateCharacters = async () => {
    characterCount.value = characterStore.characterCount;
};

characterStore.$subscribe(updateCharacters);

const openOrderBy = ref(false);
const openItemsPerPage = ref(false);

const contentWidth = ref(0);

const updatePage = async (page: number) => {
    applicationStore.currentPage = page;
    applicationStore.operationEnabledIds.clear();
    emit('update-characters');
};

const onResize = async () => {
    if (document.getElementById('main_content')?.offsetWidth !== contentWidth.value) {
        contentWidth.value = document.getElementById('main_content')?.offsetWidth ?? 0;

        if (contentWidth.value !== 0) {
            const itemsPerRow = calculateItemsPerRow(contentWidth.value);
            applicationStore.itemsPerPage = itemsPerRow.maxItemsPerRow * 3;
            itemsPerPageOptions = itemsPerRow.newOptions;

            emit('update-characters');
        }
    }
};

const clearSearch = async () => {
    if (applicationStore.searchValue.length > 0) {
        applicationStore.searchValue = '';
        emit('update-characters');
    }
};

const processSearch = debounce(
    async () => {
        emit('update-characters');
    },
    500,
    { trailing: false }
);

const processResize = debounce(
    async () => {
        await onResize();
    },
    500,
    { trailing: false }
);

onMounted(async () => {
    await onResize();
    window.addEventListener('resize', processResize);
});
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
            <Button class="w-[200px] justify-center" variant="outline"> Number of characters: {{ characterCount }} </Button>

            <Pagination v-slot="{ page }" :total="characterCount" :items-per-page="itemsPerPage" :sibling-count="0" show-edges :default-page="1" @update:page="updatePage">
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
                        {{ itemsPerPageOptions ? itemsPerPageOptions.find((option) => option.value === applicationStore.itemsPerPage)?.label : 'Select Items Per Page...' }}
                        <Icon class="ml-2 h-4 w-4 shrink-0 opacity-50" name="radix-icons:caret-sort" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandGroup>
                                <CommandItem
                                    v-for="option in itemsPerPageOptions"
                                    :key="option.value"
                                    :value="option.value"
                                    @select="
                                        async (ev) => {
                                            if (typeof ev.detail.value === 'number') {
                                                applicationStore.itemsPerPage = ev.detail.value;
                                            }
                                            openItemsPerPage = false;
                                            $emit('update-characters');
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
                        {{ applicationStore.orderByValue ? sortOptions.find((option) => option.value === applicationStore.orderByValue)?.label : 'Select Order...' }}
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
                                                applicationStore.orderByValue = ev.detail.value;
                                            }
                                            openOrderBy = false;
                                            $emit('update-characters');
                                        }
                                    ">
                                    {{ option.label }}
                                    <Icon :class="cn('ml-auto h-4 w-4', applicationStore.orderByValue === option.value ? 'opacity-100' : 'opacity-0')" name="radix-icons:check" />
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
