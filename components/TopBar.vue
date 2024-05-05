<script setup lang="ts">
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
const colorMode = useColorMode();
</script>

<template>
    <div class="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 lg:px-24 h-min max-w-full">
        <Icon class="mr-2" height="5em" name="radix-icons:avatar" width="5em" />
        <h2 class="text-lg font-semibold w-full">CharaManager</h2>
        <div class="ml-auto flex w-full space-x-2 sm:justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline">
                        <Icon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" name="radix-icons:moon" />
                        <Icon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" name="radix-icons:sun" />
                        <span class="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="colorMode.preference = 'light'"> Light </DropdownMenuItem>
                    <DropdownMenuItem @click="colorMode.preference = 'dark'"> Dark </DropdownMenuItem>
                    <DropdownMenuItem @click="colorMode.preference = 'system'"> System </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
</template>

<style scoped></style>
