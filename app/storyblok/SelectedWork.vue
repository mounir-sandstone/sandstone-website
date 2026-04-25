<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
gsap.registerPlugin(ScrollTrigger, SplitText)

const props = defineProps({ blok: Object })

// ── Animation refs ────────────────────────────────────────────────────────
const sectionRef = ref(null)
const sliderRef = ref(null)
const headingRef = ref(null)
const badgeRef = ref(null)
const categoriesRef = ref(null)
let splitInstance = null

// ── Swiper ────────────────────────────────────────────────────────────────
const swiperInstance = ref(null)
const activeIndex = ref(0)
let autoTimer = null
const modules = [Navigation]

function onSwiperInit(swiper) {
    swiperInstance.value = swiper
    swiper.on('slideChange', () => { activeIndex.value = swiper.realIndex })
}

function goTo(i) {
    activeIndex.value = i
    swiperInstance.value?.slideToLoop(i)
    resetTimer()
}

function resetTimer() {
    clearInterval(autoTimer)
    startTimer()
}

function startTimer() {
    autoTimer = setInterval(() => {
        const total = props.blok?.items?.length ?? 0
        if (total > 0) {
            const next = (activeIndex.value + 1) % total
            activeIndex.value = next
            swiperInstance.value?.slideToLoop(next)
        }
    }, 4000)
}

onMounted(() => {
    startTimer()

    const slider = sliderRef.value
    const heading = headingRef.value
    const badge = badgeRef.value
    const categories = categoriesRef.value

    // Slider starts bottom-center: shifted right by 50% of its own width so it
    // sits in the horizontal center of the full container
    gsap.set(slider, { y: 180, xPercent: 50, opacity: 0 })
    gsap.set(heading, { y: 50, opacity: 0 })
    gsap.set(badge, { y: 50, opacity: 0 })
    gsap.set(categories, { x: 300, opacity: 0 })

    const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.value, start: 'top 75%', once: true },
    })

    // Step 1 — Slider rises from bottom center (stays centered, no X move yet)
    tl.to(slider, { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' })

    // Step 2 — Badge fades up while slider is still landing
    tl.to(badge, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.6')

    // Step 3 — Heading fades up
    tl.to(heading, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.5')

    // Step 4 — SplitText word-by-word
    tl.call(() => {
        splitInstance = new SplitText(heading, { type: 'words' })
        gsap.set(heading, { opacity: 1 })
        gsap.set(splitInstance.words, { y: 28, opacity: 0 })
        gsap.to(splitInstance.words, {
            y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.1,
        })
    }, [], '+=0.05')

    // Step 5 — Slider moves back to its left grid column first (xPercent 50 → 0)
    tl.to(slider, { xPercent: 0, duration: 1.1, ease: 'power3.inOut' }, '+=0.3')

    // Step 6 — Once slider is settled, categories slide in from the right
    tl.to(categories, { x: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, '-=0.15')
})

onUnmounted(() => {
    clearInterval(autoTimer)
    splitInstance?.revert()
    ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>

<template>
    <section ref="sectionRef" v-editable="blok" class="bg-white overflow-hidden">
        <div class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 pt-[280px] py-24">

            <!-- Top: badge + heading side by side -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-[64px]">
                <div>
                    <span ref="badgeRef"
                        class="inline-flex items-center px-[24px] py-[10px] rounded-full border border-primary text-primary text-ui font-regular mb-5">
                        {{ blok.tag }}
                    </span>
                </div>
                <div>
                    <h2 ref="headingRef" class="text-[32px] sm:text-h2  leading-[1.2] font-semibold text-primary">
                        {{ blok.heading }}
                    </h2>
                </div>
            </div>

            <!-- Main: project card (left) + category accordion (right) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-[64px] items-start">

                <!-- ── Left: Swiper image slider ───────────────────────── -->
                <div ref="sliderRef" class="sticky top-28">
                    <Swiper :modules="modules" :slides-per-view="1" :space-between="0" :loop="true" :navigation="false"
                        :allow-touch-move="true" class="rounded-[8px] h-[616px] w-full overflow-hidden select-none"
                        @swiper="onSwiperInit">
                        <SwiperSlide v-for="(item, i) in blok.items" :key="item._uid" class="relative w-full h-full">
                            <!-- Image -->
                            <img v-if="item.image?.filename" :src="item.image.filename + '/m/800x1000/smart'"
                                :alt="item.project_name" class="absolute inset-0 w-full h-full object-cover"
                                draggable="false" />
                            <div v-else class="absolute inset-0 w-full h-full bg-primary/30" />

                            <!-- Dark overlay -->
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                            <!-- Year badge — top right -->
                            <span
                                class="absolute text-ui top-[32px] right-[32px] px-[14px] py-[8px] rounded-full bg-white/10 backdrop-blur-sm border border-white/50 text-white font-regular">
                                {{ item.year }}
                            </span>

                            <!-- Bottom content -->
                            <div class="absolute inset-x-0 bottom-0 z-10">
                                <div class="p-[32px] pb-[24px] border-b border-white/50">
                                    <h3 class="text-white text-h3 font-semibold mb-[8px]">{{ item.project_name }}</h3>
                                    <p class="text-white text-ui font-light leading-snug">{{ item.services }}</p>
                                </div>
                                <!-- Metrics row -->
                                <div class="p-[32px]"
                                    style="background: linear-gradient(180deg, rgba(9,26,40,0.1) 0%, rgba(32,92,142,0.1) 100%);">
                                    <div class="flex items-center gap-[82px]">
                                        <div v-if="item.metric_1_value">
                                            <p class="text-white text-h3 font-semibold leading-none">{{
                                                item.metric_1_value }}</p>
                                            <p class="text-white text-ui mt-[5px]">{{ item.metric_1_label }}</p>
                                        </div>
                                        <div v-if="item.metric_2_value">
                                            <p class="text-white text-h3 font-semibold leading-none">{{
                                                item.metric_2_value }}</p>
                                            <p class="text-white text-ui mt-[5px]">{{ item.metric_2_label }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>

                <!-- ── Right: category accordion ──────────────────────── -->
                <div ref="categoriesRef" class="flex flex-col">
                    <div v-for="(item, i) in blok.items" :key="item._uid"
                        class="border-b border-primary/12 last:border-b-0">
                        <button class="w-full flex items-center justify-between py-6 text-left group" @click="goTo(i)">
                            <span class="text-h3 text-primary font-medium transition-colors duration-200">
                                {{ item.category }}
                            </span>

                            <!-- Arrow button -->
                            <span
                                class="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200"
                                :class="i === activeIndex
                                    ? 'bg-primary border-primary'
                                    : 'bg-transparent border-primary/20 group-hover:border-primary/40'">
                                <svg width="10" height="13" viewBox="0 0 10 13" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300"
                                    :class="i === activeIndex ? 'rotate-180' : ''">
                                    <path
                                        d="M0.500158 8.65378L4.35279 12.2917C4.47279 12.4054 4.66226 12.4054 4.78858 12.2917L8.66016 8.64746"
                                        :stroke="i === activeIndex ? '#FFFCF6' : '#22201F'" stroke-miterlimit="10"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M4.58008 12.5L4.58008 0.5"
                                        :stroke="i === activeIndex ? '#FFFCF6' : '#22201F'" stroke-miterlimit="10"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        </button>

                        <!-- Expandable description — CSS grid-rows animates height smoothly -->
                        <div class="grid transition-[grid-template-rows] duration-300 ease-out"
                            :class="i === activeIndex ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
                            <div class="overflow-hidden">
                                <p class="text-primary text-ui font-light leading-relaxed max-w-md pb-[32px]">{{
                                    item.description }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- CTA — bottom right -->
                    <div class="flex flex-col lg:flex-row lg:justify-end mt-10">
                        <AppButton variant="dark" :label="blok.cta_label || 'Explore all case studies'"
                            :href="blok.cta_link?.url || blok.cta_link?.cached_url || '/work'" :full="true" />
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>
