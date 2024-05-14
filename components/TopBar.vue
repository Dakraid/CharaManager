<script setup lang="ts">
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Button } from '~/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

const colorMode = useColorMode();
</script>

<template>
    <div class="container flex flex-col gap-2 items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 lg:px-24 h-min max-w-full">
        <Icon class="h-10 w-10" name="radix-icons:avatar" />
        <h2 class="text-lg font-semibold">CharaManager</h2>
        <div class="flex flex-grow justify-center">
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NuxtLink to="/">
                            <NavigationMenuLink :class="cn(navigationMenuTriggerStyle(), 'flex gap-2')">
                                <Icon class="h-5 w-5" name="radix-icons:home" />
                                <span>Home</span>
                            </NavigationMenuLink>
                        </NuxtLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NuxtLink to="/statistics">
                            <NavigationMenuLink :class="cn(navigationMenuTriggerStyle(), 'flex gap-2')">
                                <Icon class="h-5 w-5" name="radix-icons:bar-chart" />
                                <span>Statistics</span>
                            </NavigationMenuLink>
                        </NuxtLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
        <div class="flex justify-end w-168">
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline">
                        <Icon class="size-1 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" name="radix-icons:moon" />
                        <Icon class="absolute size-1 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" name="radix-icons:sun" />
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
