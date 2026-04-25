<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({ blok: Object })

const activeIndex = ref(0)
let timer = null

function setActive(i) {
    activeIndex.value = i
    restartTimer()
}

function restartTimer() {
    clearInterval(timer)
    timer = setInterval(advance, 4000)
}

function advance() {
    const len = props.blok?.steps?.length ?? 4
    activeIndex.value = (activeIndex.value + 1) % len
}

onMounted(() => { timer = setInterval(advance, 4000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
    <section v-editable="blok" class="bg-white relative">
        <div class="max-w-[var(--width-container)] mx-auto px-4 md:px-8 2xl:px-0 py-12 md:py-24">

            <!-- Two-column body -->
            <div class="flex flex-col lg:flex-row items-start gap-12 lg:gap-[162px]">

                <!-- LEFT — illustration circle (desktop only) -->
                <div class="hidden lg:block sticky top-24 flex-shrink-0">
                    <!-- Badge — top left -->
                    <span
                        class="inline-flex items-center px-[24px] py-[10px] rounded-full border border-primary text-primary text-ui font-regular mb-[79px]">
                        {{ blok.tag || 'Our Approach' }}
                    </span>
                    <div class="flex items-center justify-center lg:justify-start">
                        <div class="relative w-[416px] h-[416px] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                            style="background: linear-gradient(180deg, #232120 66.96%, #0C0C0C 100%);">
                            <!-- subtle inner ring -->
                            <div class="absolute rounded-full border border-white w-[333px] h-[333px]"
                                style="border-inline: none;" />
                            <!-- Clipboard SVG illustration -->
                            <svg v-if="!blok.illustration?.filename" viewBox="0 0 220 240" fill="none"
                                class="w-[190px] h-[210px]">
                                <!-- clipboard board -->
                                <rect x="30" y="30" width="160" height="180" rx="10" stroke="white" stroke-width="1.2"
                                    fill="none" stroke-opacity="0.6" />
                                <!-- clip at top -->
                                <rect x="78" y="22" width="64" height="20" rx="6" stroke="#CCB395" stroke-width="1.2"
                                    fill="none" stroke-opacity="0.8" />
                                <!-- divider below clip -->
                                <line x1="30" y1="62" x2="190" y2="62" stroke="white" stroke-width="0.8"
                                    stroke-opacity="0.25" />
                                <!-- Chart bars -->
                                <rect x="52" y="130" width="20" height="50" rx="3" stroke="white" stroke-width="1.1"
                                    fill="none" stroke-opacity="0.5" />
                                <rect x="82" y="105" width="20" height="75" rx="3" stroke="white" stroke-width="1.1"
                                    fill="none" stroke-opacity="0.5" />
                                <rect x="112" y="118" width="20" height="62" rx="3" stroke="white" stroke-width="1.1"
                                    fill="none" stroke-opacity="0.5" />
                                <rect x="142" y="90" width="20" height="90" rx="3" stroke="#CCB395" stroke-width="1.1"
                                    fill="none" stroke-opacity="0.7" />
                                <!-- Trend line -->
                                <polyline points="62,138 92,115 122,126 152,100" stroke="#CCB395" stroke-width="1.2"
                                    fill="none" stroke-opacity="0.6" stroke-dasharray="4 2" />
                                <!-- axis lines -->
                                <line x1="44" y1="182" x2="172" y2="182" stroke="white" stroke-width="0.8"
                                    stroke-opacity="0.25" />
                                <line x1="44" y1="182" x2="44" y2="88" stroke="white" stroke-width="0.8"
                                    stroke-opacity="0.25" />
                                <!-- checklist rows -->
                                <circle cx="50" cy="82" r="3" stroke="white" stroke-width="1" stroke-opacity="0.4" />
                                <line x1="62" y1="82" x2="120" y2="82" stroke="white" stroke-width="0.8"
                                    stroke-opacity="0.3" />
                            </svg>
                            <img v-else :src="blok.illustration.filename + '/m/600x600'" alt="approach illustration"
                                class="w-[190px] h-[210px] object-contain" />
                        </div>
                    </div>
                </div>

                <!-- RIGHT — heading + steps -->
                <div class="flex flex-col gap-6 lg:gap-8 w-full">
                    <!-- Badge — mobile only -->
                    <span
                        class="lg:hidden inline-flex self-start items-center px-[24px] py-[10px] rounded-full border border-primary text-primary text-ui font-regular">
                        {{ blok.tag || 'Our Approach' }}
                    </span>
                    <h2 class="text-[32px] sm:text-h2  leading-[1.25] font-semibold text-primary max-w-xl">
                        {{ blok.heading || 'Our Structured Approach to Building Scalable Systems' }}
                    </h2>

                    <!-- Steps list -->
                    <div class="flex flex-col">
                        <div v-for="(step, i) in blok.steps" :key="step._uid"
                            class="cursor-pointer select-none transition-all duration-300"
                            :class="i < (blok.steps.length - 1) ? 'mb-[20px]' : ''" @click="setActive(i)">
                            <!-- Active card -->
                            <div v-if="activeIndex === i" class="rounded-[14px] px-5 py-6 md:px-[80px] md:py-[72px]"
                                style="background: linear-gradient(12.2deg, #071A29 11.52%, #0E2A40 54.95%),
linear-gradient(180deg, #232120 66.96%, #0C0C0C 100%),
linear-gradient(269.25deg, #071A29 65.6%, #10304A 103.76%);
">
                                <div class="flex gap-5 md:gap-[40px]">
                                    <span class="text-white text-[32px] sm:text-h2  font-bold leading-none">{{ String(i
                                        + 1).padStart(2, '0') }}</span>
                                    <div>
                                        <span class="text-beige text-ui font-regular tracking-wide">{{ step.label
                                        }}</span>

                                        <p
                                            class="text-white text-body font-regular sm:text-h3 sm:font-semibold leading-relaxed">
                                            {{
                                                step.description }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Inactive row -->
                            <div v-else
                                class="flex items-start gap-5 md:gap-[40px] px-5 py-6 md:px-[80px] md:py-[72px] hover:bg-primary/5 rounded-[8px] transition-colors shadow-[inset_0px_4px_6px_0px_rgba(0,_0,_0,_0.1)]">
                                <span
                                    class="text-primary/40 text-[32px] sm:text-h2  font-semibold leading-none flex-shrink-0">{{
                                        String(i + 1).padStart(2, '0') }}</span>
                                <div>
                                    <p class="text-[#22201F] text-ui font-regular mb-1">{{ step.label }}</p>
                                    <p
                                        class="text-[#22201F] text-body font-regular sm:text-h3 sm:font-semibold leading-relaxed">
                                        {{ step.description
                                        }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CTA — bottom right -->
            <div class="flex flex-col lg:flex-row lg:justify-end  mt-10 md:mt-16">
                <AppButton :label="blok.cta_label || 'Let\'s design your roadmap'"
                    :to="blok.cta_link?.cached_url || blok.cta_link?.url" variant="dark" :full="true" />
            </div>

        </div>
    </section>
</template>
