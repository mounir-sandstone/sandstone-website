<script setup>
import { reactive } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import SvgsAiBrain from '~/components/svgs/aiBrain.vue'
import SvgsPentoolUi from '~/components/svgs/pentoolUi.vue'
import SvgsWebCode from '~/components/svgs/webCode.vue'
gsap.registerPlugin(ScrollTrigger, SplitText)

defineProps({ blok: Object })
const modules = [Autoplay]

const svgMap = [SvgsAiBrain, SvgsPentoolUi, SvgsWebCode]

const sectionRef = ref(null)
const sliderRef = ref(null)
const badgeRef = ref(null)
const headingRef = ref(null)
const descRef = ref(null)

const svgCompRefs = reactive([])
const h3Refs = reactive([])
const pRefs = reactive([])
const cardRefs = reactive([])

let splitInstance = null
let swiperInst = null
const hoverCleanups = []

// ── Deep per-SVG animations ───────────────────────────────────────────

function deepAnimateBrain(svgEl) {
    if (!svgEl) return
    const nodes = gsap.utils.toArray(svgEl.querySelectorAll('[fill="#CCB395"]'))
    const circuits = gsap.utils.toArray(svgEl.querySelectorAll('[fill="#FFFCF6"]'))
    gsap.fromTo(circuits,
        { scale: 0.2, opacity: 0, transformOrigin: '50% 50%' },
        { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.008 })
    gsap.fromTo(nodes,
        { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
        {
            scale: 1, opacity: 1, duration: 0.45, delay: 0.25,
            stagger: { each: 0.012, from: 'random' }, ease: 'back.out(3)'
        })
}

function deepAnimatePentool(comp) {
    const { arcsEl, penBodyEl, ticksEl, dotsEl } = comp
    if (!arcsEl) return
    gsap.fromTo(arcsEl,
        { scale: 0, rotation: -180, opacity: 0, transformOrigin: '50% 50%' },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.7)' })
    gsap.fromTo(penBodyEl,
        { y: 50, scale: 0.3, opacity: 0, transformOrigin: '50% 80%' },
        { y: 0, scale: 1, opacity: 1, duration: 0.85, delay: 0.55, ease: 'back.out(2.2)' })
    gsap.fromTo(ticksEl,
        { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.7, stagger: 0.08, ease: 'back.out(3)' })
    gsap.fromTo(dotsEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.9, delay: 0.9, ease: 'power2.out' })
}

function deepAnimateWebCode(comp) {
    const { frameEl, headerEl, leftRailEl, sidesEl, dotsEl } = comp
    if (!frameEl) return
    gsap.fromTo(frameEl,
        { y: 30, scale: 0.75, opacity: 0, transformOrigin: '50% 100%' },
        { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.5)' })
    gsap.fromTo(sidesEl,
        { opacity: 0, scaleY: 0, transformOrigin: 'top center' },
        { opacity: 1, scaleY: 1, duration: 0.7, delay: 0.35, ease: 'power3.out' })
    gsap.fromTo(headerEl,
        { scaleX: 0, opacity: 0, transformOrigin: 'left center' },
        { scaleX: 1, opacity: 1, duration: 0.75, delay: 0.5, ease: 'power3.out' })
    gsap.fromTo(leftRailEl,
        { scaleY: 0, opacity: 0, transformOrigin: 'top center' },
        { scaleY: 1, opacity: 1, duration: 0.8, delay: 0.6, ease: 'power2.out' })
    const dotKids = dotsEl?.children ? Array.from(dotsEl.children) : [dotsEl]
    gsap.fromTo(dotKids,
        { scale: 0, opacity: 0 },
        {
            scale: 1, opacity: 1, duration: 0.35, delay: 0.8,
            stagger: { each: 0.05, from: 'center' }, ease: 'back.out(3)'
        })
}

function runDeepSvgAnim(i, comp) {
    if (i === 0) deepAnimateBrain(comp?.svgRef)
    else if (i === 1) deepAnimatePentool(comp)
    else if (i === 2) deepAnimateWebCode(comp)
}

function animateCardText(h3El, pEl, delayBase = 0) {
    if (h3El) gsap.fromTo(h3El,
        { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, delay: delayBase, ease: 'power2.out' })
    if (pEl) gsap.fromTo(pEl,
        { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, delay: delayBase + 0.1, ease: 'power2.out' })
}

function onSwiperReady(swiper) {
    swiperInst = swiper
    // Stop autoplay until the GSAP entrance animation finishes; prevents
    // Swiper measuring slide positions while the container is off-screen.
    swiper.autoplay.stop()
    swiper.on('slideChange', () => {
        const idx = swiper.realIndex % (svgMap.length)
        runDeepSvgAnim(idx, svgCompRefs[idx])
        animateCardText(h3Refs[idx], pRefs[idx])
    })
}

onMounted(async () => {
    await nextTick()
    await nextTick()

    const slider = sliderRef.value
    const badge = badgeRef.value
    const heading = headingRef.value
    const desc = descRef.value

    gsap.set(slider, { x: '105vw', opacity: 0 })
    gsap.set(badge, { y: 48, opacity: 0 })
    gsap.set(heading, { opacity: 0 })
    gsap.set(desc, { y: 32, opacity: 0 })

    if (h3Refs[0]) gsap.set(h3Refs[0], { y: 30, opacity: 0 })
    if (pRefs[0]) gsap.set(pRefs[0], { y: 24, opacity: 0 })
    if (svgCompRefs[0]) gsap.set(svgCompRefs[0].svgRef, { opacity: 0 })

    const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.value, start: 'top 75%', once: true },
    })

    tl.to(slider, {
        x: 0, opacity: 1, duration: 1.3, ease: 'power3.out',
        onComplete() {
            // Slider is now fully on-screen — safe to let Swiper start scrolling
            swiperInst?.autoplay.start()
            gsap.set(svgCompRefs[0]?.svgRef, { opacity: 1 })
            runDeepSvgAnim(0, svgCompRefs[0])
            animateCardText(h3Refs[0], pRefs[0], 0.35)
        },
    })

    tl.to(badge, { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' }, 0.2)

    tl.call(() => {
        splitInstance = new SplitText(heading, { type: 'words' })
        gsap.set(heading, { opacity: 1 })
        gsap.set(splitInstance.words, { y: 44, opacity: 0 })
        gsap.to(splitInstance.words, {
            y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.1
        })
    }, [], 0.75)

    tl.to(desc, { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out' }, 1.0)

    svgCompRefs.forEach((comp, i) => {
        const card = cardRefs[i]
        const svgEl = comp?.svgRef
        if (!card || !svgEl) return
        const enter = () => gsap.to(svgEl, { scale: 1.12, rotation: 6, duration: 0.45, ease: 'power1.out', transformOrigin: 'center center' })
        const leave = () => gsap.to(svgEl, { scale: 1, rotation: 0, duration: 0.45, ease: 'power1.inOut', transformOrigin: 'center center' })
        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', leave)
        hoverCleanups.push({ card, enter, leave })
    })
})

onUnmounted(() => {
    hoverCleanups.forEach(({ card, enter, leave }) => {
        card.removeEventListener('mouseenter', enter)
        card.removeEventListener('mouseleave', leave)
    })
    splitInstance?.revert()
    ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>

<template>
    <section ref="sectionRef" v-editable="blok" class="bg-white overflow-hidden">

        <!-- Header constrained -->
        <div class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 pt-24 pb-14">
            <span ref="badgeRef"
                class="inline-flex items-center px-[24px] py-[10px] rounded-full border border-primary text-primary text-ui font-regular mb-6">
                {{ blok.tag }}
            </span>
            <div>
                <h2 ref="headingRef"
                    class="text-[32px] sm:text-h2  leading-[1.2] font-semibold text-primary max-w-lg mb-[16px]">
                    {{ blok.heading }}
                </h2>
                <!-- overflow-hidden clips the y-slide so desc does not overlap heading -->
                <div class="overflow-hidden">
                    <p ref="descRef" class="text-primary text-ui leading-relaxed max-w-lg">
                        {{ blok.description }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Full-bleed slider -->
        <div ref="sliderRef" class="w-full pb-24">
            <ClientOnly>
                <Swiper :modules="modules" slides-per-view="auto" :space-between="12" :speed="700"
                    :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }" :loop="true"
                    :looped-slides="(blok.services?.length ?? 3) * 2" :grab-cursor="true"
                    class="!overflow-visible services-swiper" @swiper="onSwiperReady">

                    <SwiperSlide v-for="(service, i) in blok.services" :key="service._uid"
                        class="w-[300px] sm:!w-[416px]">

                        <div :ref="el => { if (el) cardRefs[i] = el }"
                            class="group relative flex flex-col rounded-[8px] overflow-hidden h-[616px] cursor-pointer"
                            style="background: linear-gradient(180deg, #232120 66.96%, #0C0C0C 100%);">

                            <!-- Arrow -->
                            <div class="absolute top-5 border border-white backdrop-blur-md right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors duration-200"
                                style="border-inline: none;">
                                <svg width="42" height="42" viewBox="0 0 42 42" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <rect width="42" height="42" rx="21" fill="black" fill-opacity="0.01" />
                                    <rect x="0.5" y="0.5" width="41" height="41" rx="20.5" stroke="#D1DAD9"
                                        stroke-opacity="0.4" />
                                    <path
                                        d="M25.4073 22.3622L25.2554 17.0656C25.251 16.9004 25.117 16.7664 24.9473 16.7575L19.6328 16.5967"
                                        stroke="#FFFCF6" stroke-miterlimit="10" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                    <path d="M25.2421 16.7574L16.7568 25.2427" stroke="#FFFCF6" stroke-miterlimit="10"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>

                            <!-- SVG illustration -->
                            <div class="flex-1 flex items-center justify-center px-8 pt-10 pb-4 relative">
                                <!-- Decorative outer circle — shown on every card -->
                                <div class="absolute pointer-events-none rounded-full backdrop-blur-md sm:w-[333px] sm:h-[333px] w-[244px] h-[244px]"
                                    style="border-inline: none;border:1px solid #FFFCF633;box-shadow:0 0 0 1px rgba(255,252,246,0.04),inset 0 0 0 1px rgba(255,252,246,0.04);" />
                                <component :is="svgMap[i]" v-if="svgMap[i]" :ref="el => { if (el) svgCompRefs[i] = el }"
                                    class="w-auto h-[160px] max-w-[220px] relative z-10" />
                                <img v-else-if="service.illustration?.filename"
                                    :src="service.illustration.filename + '/m/400x400'" :alt="service.title"
                                    class="w-full max-w-[200px] h-[200px] object-contain select-none pointer-events-none relative z-10"
                                    draggable="false" />
                                <svg v-else width="320" height="320" viewBox="0 0 320 320" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" class="opacity-30 relative z-10">
                                    <circle cx="160" cy="160" r="144" stroke="#CCB395" stroke-width="1.5"
                                        stroke-dasharray="6 4" />
                                    <circle cx="160" cy="160" r="96" stroke="#CCB395" stroke-width="1"
                                        stroke-dasharray="4 6" />
                                    <circle cx="160" cy="160" r="20" fill="#CCB395" />
                                </svg>
                            </div>

                            <!-- Text -->
                            <div class="p-[32px]">
                                <h3 :ref="el => { if (el) h3Refs[i] = el }"
                                    class="text-[#D1DAD9] max-w-xs text-body sm:text-h3 font-semibold leading-snug mb-[16px]">
                                    {{ service.title }}
                                </h3>
                                <p :ref="el => { if (el) pRefs[i] = el }"
                                    class="text-white text-[14px] sm:text-ui font-light">
                                    {{ service.description }}
                                </p>
                            </div>

                            <!-- Full-card link overlay -->
                            <NuxtLink :to="service.link?.cached_url || service.link?.url || '#'"
                                class="absolute inset-0 z-20" :aria-label="service.title" />
                        </div>
                    </SwiperSlide>
                </Swiper>

                <template #fallback>
                    <div class="flex gap-3 px-8">
                        <div v-for="k in 4" :key="k"
                            class="w-[280px] h-[420px] rounded-[20px] bg-[#18181B] flex-shrink-0 animate-pulse" />
                    </div>
                </template>
            </ClientOnly>
        </div>
    </section>
</template>

<style scoped>
.services-swiper {
    padding-left: max(2rem, calc((100vw - var(--width-container, 1280px)) / 2 + 2rem));
    padding-right: 2rem;
}
</style>
