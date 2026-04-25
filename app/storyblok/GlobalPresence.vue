<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

defineProps({ blok: Object })

const modules = [Autoplay, EffectFade]

// Track active index for custom pagination
const activeIndex = ref(0)
function onSlideChange(swiper) {
    activeIndex.value = swiper.realIndex
}

// Animation refs
const sectionRef = ref(null)
const badgeRef = ref(null)
const headingRef = ref(null)
const paragraphRef = ref(null)
const ctaRef = ref(null)
const sliderRef = ref(null)

const splits = []
const triggers = []

onMounted(() => {
    const otherEls = [badgeRef.value, ctaRef.value, sliderRef.value].filter(Boolean)

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: sectionRef.value,
            start: 'top 75%',
            once: true,
        },
    })

    // Step 1 — all elements except heading + paragraph fade up
    if (otherEls.length) {
        tl.from(otherEls, {
            y: 100,
            opacity: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power2.out',
        })
    }

    // Step 2 — heading word by word
    if (headingRef.value) {
        const headingSplit = new SplitText(headingRef.value, { type: 'words' })
        splits.push(headingSplit)
        tl.from(headingSplit.words, {
            y: 80,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
        })
    }

    // Step 3 — paragraph word by word, 0.2s after heading starts
    if (paragraphRef.value) {
        const paraSplit = new SplitText(paragraphRef.value, { type: 'words' })
        splits.push(paraSplit)
        tl.from(paraSplit.words, {
            y: 60,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
        }, '-=0.4')
    }

    const st = ScrollTrigger.getAll().slice(-1)[0]
    if (st) triggers.push(st)
})

onUnmounted(() => {
    splits.forEach(s => s.revert())
    triggers.forEach(t => t.kill())
})
</script>

<template>
    <section ref="sectionRef" v-editable="blok" class="bg-white overflow-hidden">
        <div
            class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 pt-[80px] lg:pt-[200px] pb-16 lg:pb-0 flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 lg:items-center">

            <!-- ── Left col: transparent on mobile so children join flex order; real flex col on desktop ── -->
            <div class="contents lg:flex lg:flex-col lg:items-start lg:gap-6">

                <!-- Badge + Heading -->
                <div class="flex flex-col items-start gap-4 order-1">

                    <!-- Badge -->
                    <span ref="badgeRef"
                        class="inline-flex items-center px-[24px] py-[10px] rounded-full border border-primary text-primary text-ui font-regular">
                        {{ blok.tag }}
                    </span>

                    <!-- Heading -->
                    <h2 ref="headingRef"
                        class="text-[32px] sm:text-h2 leading-[1.15] font-semibold text-primary max-w-sm">
                        {{ blok.heading }}
                    </h2>
                </div>

                <!-- ── Description + CTA (mobile order 3, desktop inside left col) ── -->
                <div class="flex flex-col items-start gap-6 order-3">

                    <!-- Description -->
                    <p ref="paragraphRef" class="text-primary text-body font-medium leading-relaxed max-w-xs">
                        {{ blok.description }}
                    </p>

                    <!-- CTA -->
                    <div ref="ctaRef" class="w-full lg:w-auto">
                        <AppButton variant="dark" :label="blok.cta_label || 'Reach out'" :full="true"
                            :href="blok.cta_link?.url || blok.cta_link?.cached_url || '/contact'" />
                    </div>
                </div>

            </div>

            <!-- ── Slider (mobile order 2, desktop right col) ── -->
            <div ref="sliderRef" class="relative w-full order-2 lg:order-none">
                <ClientOnly>
                    <!-- Single card frame — slides fade inside it -->
                    <div class="relative rounded-[8px] h-[420px] lg:h-[616px] w-full overflow-hidden select-none">
                        <Swiper :modules="modules" :slides-per-view="1" :loop="true" effect="fade"
                            :fade-effect="{ crossFade: true }"
                            :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }"
                            class="w-full h-full" @slide-change="onSlideChange">
                            <SwiperSlide v-for="(loc) in blok.locations" :key="loc._uid">
                                <!-- Image -->
                                <img v-if="loc.image?.filename" :src="loc.image.filename + '/m/800x1000/smart'"
                                    :alt="loc.name" class="absolute inset-0 w-full h-full object-cover"
                                    draggable="false" />
                                <!-- Fallback placeholder -->
                                <div v-else
                                    class="absolute inset-0 w-full h-full bg-primary/20 flex items-center justify-center">
                                    <span class="text-primary/40 text-sm">No image</span>
                                </div>
                            </SwiperSlide>
                        </Swiper>

                        <!-- Pagination lines — top right (outside Swiper, always on top) -->
                        <div class="absolute top-5 right-5 flex items-center gap-1.5 z-20 pointer-events-none">
                            <span v-for="(_, j) in blok.locations" :key="j"
                                class="block h-[3px] rounded-full transition-all duration-400"
                                :class="j === activeIndex ? 'w-7 bg-white' : 'w-4 bg-white/40'" />
                        </div>

                        <!-- Bottom gradient + location name -->
                        <div
                            class="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />
                        <span
                            class="absolute bottom-[32px] left-[32px] z-20 text-white text-h3 font-semibold tracking-tight pointer-events-none">
                            {{ blok.locations?.[activeIndex]?.name }}
                        </span>
                    </div>

                    <!-- Fallback for SSR -->
                    <template #fallback>
                        <div class="rounded-[24px] overflow-hidden aspect-[3/4] bg-primary/10 animate-pulse" />
                    </template>
                </ClientOnly>
            </div>


        </div>
    </section>
</template>
