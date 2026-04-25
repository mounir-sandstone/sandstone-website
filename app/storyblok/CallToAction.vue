<script setup>
defineProps({ blok: Object })
</script>

<template>
    <!-- Outer wrapper — relative so Gap mask can be positioned at section top -->
    <div v-editable="blok" class="relative bg-primary pb-0">

        <!-- Gap mask — notch transition at the very top edge -->
        <img src="~/assets/imgs/cta_bg.svg" alt="" aria-hidden="true"
            class="hidden sm:block absolute top-[-70px] left-1/2 -translate-x-1/2 w-full pointer-events-none select-none z-10"
            style="-webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 1%); mask-image: linear-gradient(to bottom, black 1%, transparent 100%);" />

        <img src="~/assets/imgs/cta-bg_mobile.svg" alt="" aria-hidden="true"
            class="block sm:hidden bg-primary absolute top-[-70px] left-1/2 -translate-x-1/2 w-full pointer-events-none select-none z-10"
            style="-webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 1%); mask-image: linear-gradient(to bottom, black 1%, transparent 100%);" />

        <!-- The dark "tray" -->
        <section
            class="relative max-w-[var(--width-container)] mx-auto overflow-hidden rounded-t-[48px] bg-primary min-h-[580px] flex items-center justify-center">
            <!-- Content -->
            <div
                class="relative z-10 text-left sm:text-center px-6 py-16 sm:py-28 max-w-[800px] mx-auto flex flex-col items-start sm:items-center gap-5 sm:gap-7">
                <h2 class="text-white text-[32px] sm:text-h2 lg:text-[3rem] font-semibold leading-[1.2]">
                    {{ blok.heading || 'Your next move starts here. Make it intentional.' }}
                </h2>
                <p class="text-white text-ui sm:text-body font-medium leading-relaxed max-w-2xl">
                    {{ blok.description || "Let's define the right direction." }}
                </p>

                <!-- Buttons -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 w-full sm:w-auto">
                    <!-- Primary: light pill -->
                    <AppButton :label="blok.primary_label || 'Reach out'"
                        :to="blok.primary_link?.cached_url || blok.primary_link?.url" variant="white" :full="true" />
                    <!-- Secondary: ghost pill on dark bg -->
                    <NuxtLink :to="blok.secondary_link?.cached_url || blok.secondary_link?.url || '#'"
                        class="inline-flex items-center justify-center gap-2 px-[24px] py-[12px] rounded-full text-ui font-semibold border border-white text-white hover:border-white/50 hover:bg-white/5 transition-all duration-200 backdrop-blur-sm"
                        style="background:rgb(250 242 229 / 0%);border-inline:none;">
                        {{ blok.secondary_label || 'Browse our work' }}
                    </NuxtLink>
                </div>
            </div>

        </section>
    </div>
</template>
