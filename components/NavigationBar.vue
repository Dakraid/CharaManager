<script setup lang="ts">
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Button } from '~/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

const nuxtApp = useNuxtApp();

const colorMode = useColorMode();
const settingsStore = useSettingsStore();

const toggleMenu = async () => {
    settingsStore.openMenu = !settingsStore.openMenu;
    await sleep(500);
    await nuxtApp.hooks.callHook('action:menu');
};
</script>

<template>
    <div class="container h-min max-w-full flex flex-col gap-2 space-y-0 items-center justify-between py-4 lg:h-16 lg:flex-row lg:space-y-2 lg:px-24 z-20">
        <div class="flex items-center justify-center gap-2 w-[220px] lg:justify-start">
            <img class="h-10 w-10" src="/CharaManager.svg" alt="CharaManagerLogo" />
            <h2 class="text-xl font-semibold font-mono" style="color: #13fea2">CharaManager</h2>
        </div>
        <div class="flex flex-grow justify-center">
            <ClientOnly>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NuxtLink to="/">
                                <NavigationMenuLink :class="cn(navigationMenuTriggerStyle(), 'flex gap-2', $route.path === '/' ? 'bg-accent' : '')">
                                    <Icon class="h-5 w-5" name="radix-icons:home" />
                                    <span>Home</span>
                                </NavigationMenuLink>
                            </NuxtLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NuxtLink to="/relations">
                                <NavigationMenuLink :class="cn(navigationMenuTriggerStyle(), 'flex gap-2', $route.path === '/relations' ? 'bg-accent' : '')">
                                    <Icon class="h-5 w-5" name="radix-icons:share-1" />
                                    <span>Relations</span>
                                </NavigationMenuLink>
                            </NuxtLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NuxtLink to="/statistics">
                                <NavigationMenuLink :class="cn(navigationMenuTriggerStyle(), 'flex gap-2', $route.path === '/statistics' ? 'bg-accent' : '')">
                                    <Icon class="h-5 w-5" name="radix-icons:bar-chart" />
                                    <span>Statistics</span>
                                </NavigationMenuLink>
                            </NuxtLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NuxtLink to="/logs">
                                <NavigationMenuLink :class="cn(navigationMenuTriggerStyle(), 'flex gap-2', $route.path === '/logs' ? 'bg-accent' : '')">
                                    <Icon class="h-5 w-5" name="radix-icons:reader" />
                                    <span>Logs</span>
                                </NavigationMenuLink>
                            </NuxtLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </ClientOnly>
        </div>
        <div class="flex justify-center gap-4 w-[220px] lg:justify-end">
            <Popover>
                <PopoverTrigger as-child>
                    <Button variant="outline">
                        <span class="sr-only">Set API Key</span>
                        <Icon class="h-6 w-6" name="radix-icons:lock-open-1" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-80">
                    <div class="flex flex-col gap-2">
                        <h4 class="font-medium leading-none">Set the API Key.</h4>
                        <p class="text-sm text-red-500">Refresh the page afterwards.</p>
                        <Input id="apiKey" v-model="settingsStore.apiKey" type="password" />
                    </div>
                </PopoverContent>
            </Popover>
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
            <Button variant="outline" @click="toggleMenu">
                <span class="sr-only">Open Menu</span>
                <Icon class="h-6 w-6" name="radix-icons:hamburger-menu" />
            </Button>
        </div>
    </div>
</template>

<style scoped></style>
