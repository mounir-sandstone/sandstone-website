<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Storyblok
const storyblokApi = useStoryblokApi()

const { data } = await useAsyncData('footer', () =>
    storyblokApi.get('cdn/stories/globals/footer', { version: 'published' })
)

const blok = computed(() => data.value?.data?.story?.content?.body?.[0] ?? {})

const wordmark = computed(() => blok.value.wordmark)
const email = computed(() => blok.value.email || '')
const copyright = computed(() => blok.value.copyright || `\u00A9 ${new Date().getFullYear()} \u00B7 All rights reserved for Sandstone Project Management Services L.L.C.`)
const quickLinks = computed(() => blok.value.quick_links || [])
const socialLinks = computed(() => blok.value.social_links || [])
const partners = computed(() => blok.value.partners || [])
const locations = computed(() => blok.value.locations || [])
const legalLinks = computed(() => blok.value.legal_links || [])
const newsletterLabel = computed(() => blok.value.newsletter_label || 'Subscribe to our newsletter')

// UI state
const openLocation = ref(0)
function toggleLocation(i) {
    openLocation.value = openLocation.value === i ? -1 : i
}

const newsletterEmail = ref('')
function subscribe() {
    if (!newsletterEmail.value) return
    newsletterEmail.value = ''
}

// Social icons map
const socialIcons = {
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    youtube: 'M23.495 2.205a3.003 3.003 0 00-2.114-2.114C19.456 0 12 0 12 0S4.544 0 2.619.09a3.003 3.003 0 00-2.114 2.115C0 4.13 0 8.26 0 8.26s0 4.13.505 6.056a3.003 3.003 0 002.114 2.114C4.544 16.52 12 16.52 12 16.52s7.456 0 9.381-.09a3.003 3.003 0 002.114-2.114C24 12.39 24 8.26 24 8.26s0-4.13-.505-6.055zM9.545 11.568V4.952l6.272 3.308-6.272 3.308z',
}

// Animation refs
const footerRef = ref(null)
const logoRef = ref(null)
const followUsLabelRef = ref(null)
const socialRowRef = ref(null)
const partnersLabelRef = ref(null)
const partnersRowRef = ref(null)
const locationAccordionRef = ref(null)
const newsletterLabelRef = ref(null)
const newsletterFormRef = ref(null)
const copyrightRef = ref(null)
const legalRef = ref(null)
const quickLinksLabelRef = ref(null)
const quickLinksItemsRef = ref([])
const convLabelRef = ref(null)
const convItemsRef = ref([])

// GSAP cleanup stores
const splits = []
const triggers = []

/** Split el into chars and tween from-bottom on tl at position. */
function animateChars(tl, el, position, vars = {}) {
    if (!el) return
    const split = new SplitText(el, { type: 'chars' })
    splits.push(split)
    tl.from(split.chars, {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power3.out',
        ...vars,
    }, position)
}

onMounted(() => {
    const contentItems = [
        followUsLabelRef.value,
        socialRowRef.value,
        partnersLabelRef.value,
        partnersRowRef.value,
        locationAccordionRef.value,
        newsletterLabelRef.value,
        newsletterFormRef.value,
        copyrightRef.value,
        legalRef.value,
    ].filter(Boolean)

    const qlItems = quickLinksItemsRef.value.filter(Boolean)
    const convItems = convItemsRef.value.filter(Boolean)

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: footerRef.value,
            start: 'top 85%',
            once: true,
        },
    })

    // Step 1 — Logo slides in from top
    tl.from(logoRef.value, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
    })

    // Step 2 — Secondary content fades up with stagger
    if (contentItems.length) {
        tl.from(contentItems, {
            y: 50,
            opacity: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power2.out',
        }, '-=0.5')
    }

    // Steps 3 & 5 — Both column headers char-split simultaneously
    animateChars(tl, quickLinksLabelRef.value, '-=0.3')
    animateChars(tl, convLabelRef.value, '<')

    // Steps 4 & 6 — Column link items as two parallel sub-timelines
    const qlTl = gsap.timeline()
    qlItems.forEach((item, i) => {
        const split = new SplitText(item, { type: 'chars' })
        splits.push(split)
        qlTl.from(split.chars, {
            y: 30,
            opacity: 0,
            duration: 0.4,
            stagger: 0.03,
            ease: 'power2.out',
        }, i === 0 ? 0 : '+=0.05')
    })

    const convTl = gsap.timeline()
    convItems.forEach((item, i) => {
        const split = new SplitText(item, { type: 'chars' })
        splits.push(split)
        convTl.from(split.chars, {
            y: 30,
            opacity: 0,
            duration: 0.4,
            stagger: 0.03,
            ease: 'power2.out',
        }, i === 0 ? 0 : '+=0.05')
    })

    tl.addLabel('colsStart', '-=0.2')
    if (qlItems.length) tl.add(qlTl, 'colsStart')
    if (convItems.length) tl.add(convTl, 'colsStart')

    const st = ScrollTrigger.getAll().slice(-1)[0]
    if (st) triggers.push(st)
})

onUnmounted(() => {
    splits.forEach(s => s.revert())
    triggers.forEach(t => t.kill())
})
</script>

<template>
    <footer ref="footerRef" class="relative bg-primary text-white">

        <!-- Glass stripe overlay -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <img src="~/assets/imgs/background glass.svg" alt=""
                class="absolute top-0 left-1/2 -translate-x-1/2 w-full min-w-[1440px] h-full object-cover object-top opacity-60" />
        </div>

        <!-- Wordmark -->
        <div ref="logoRef"
            class="overflow-hidden pt-[40] sm:pt-[130px] pb-[20px] sm:pb-[96px] leading-none select-none px-8 2xl:px-0 max-w-[var(--width-container)] mx-auto">
            <img v-if="wordmark?.filename" :src="wordmark.filename" :alt="wordmark.alt || 'sandstone'"
                class="w-full max-w-full h-auto object-contain object-left" draggable="false" />
            <div v-else class="font-black text-white" style="letter-spacing: -0.03em; line-height: 0.88;">
                sandstone.
            </div>
        </div>

        <!-- Main grid -->
        <div
            class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 pt-16 pb-[64px] grid grid-cols-1 lg:grid-cols-2 gap-16">

            <div class="flex flex-col gap-12">

                <!-- Quick links -->
                <div v-if="quickLinks.length">
                    <p ref="quickLinksLabelRef" class="text-white text-body font-medium tracking-widest mb-5">Quick
                        links</p>
                    <nav class="flex flex-col gap-[16px]">
                        <NuxtLink v-for="(link, i) in quickLinks" :key="link._uid"
                            :ref="(el) => { if (el) quickLinksItemsRef[i] = el?.$el ?? el }"
                            :to="link.link?.cached_url || link.link?.url || '/'"
                            class="text-[32px] sm:text-h2  font-medium text-white transition-colors duration-150 w-fit">
                            {{ link.label }}
                        </NuxtLink>
                    </nav>
                </div>

                <!-- Follow us -->
                <div v-if="socialLinks.length">
                    <p ref="followUsLabelRef" class="text-white text-body font-medium tracking-widest mb-4">Follow us
                    </p>
                    <div ref="socialRowRef" class="flex items-center gap-3">
                        <a v-for="social in socialLinks" :key="social._uid" :href="social.url" target="_blank"
                            rel="noopener"
                            class="w-[48px] h-[48px] rounded-full backdrop-blur-sm text-white border border-white flex items-center justify-center hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                            style="border-inline:none;">
                            <img v-if="social.icon?.filename" :src="social.icon.filename + '/m/30x30'"
                                :alt="social.platform" class="w-[16px] h-[16px] object-contain" />
                            <svg v-else-if="socialIcons[social.platform?.toLowerCase()]" width="15" height="15"
                                viewBox="0 0 24 24" fill="white" fill-opacity="0.75">
                                <path :d="socialIcons[social.platform.toLowerCase()]" />
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Partners -->
                <div v-if="partners.length" class="mt-[64px]">
                    <p ref="partnersLabelRef" class="text-white text-body font-medium tracking-widest mb-5">partners</p>
                    <div ref="partnersRowRef" class="flex items-center gap-[32px] flex-wrap">
                        <a v-for="partner in partners" :key="partner._uid" :href="partner.url || '#'" target="_blank"
                            rel="noopener">
                            <img v-if="partner.logo?.filename" :src="partner.logo.filename + '/m/200x60'"
                                :alt="partner.name" class="h-[40px] object-contain" />
                            <span v-else class="text-white text-sm font-semibold">{{ partner.name }}</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-10">

                <!-- Email CTA -->
                <div v-if="email">
                    <p ref="convLabelRef" class="text-white text-body font-medium tracking-widest mb-3">Let's start a
                        conversation</p>
                    <a :ref="(el) => { if (el) convItemsRef[0] = el }" :href="`mailto:${email}`"
                        class="text-[32px] sm:text-h2  font-medium text-white hover:text-white/75 transition-colors duration-150 break-all">{{
                            email }}</a>
                </div>

                <!-- Location accordion -->
                <div v-if="locations.length" ref="locationAccordionRef" class="flex flex-col gap-2">
                    <div v-for="(loc, i) in locations" :key="loc._uid"
                        class="rounded-[8px] border border-white backdrop-blur-sm overflow-hidden">
                        <button
                            class="w-full flex items-center justify-between p-[32px] text-left hover:bg-white/5 transition-colors duration-150"
                            @click="toggleLocation(i)">
                            <span class="flex items-center gap-2.5">
                                <img v-if="loc.flag?.filename" :src="loc.flag.filename" :alt="loc.code"
                                    class="w-5 h-5 object-contain" />
                                <span v-else class="text-xl leading-none">{{ loc.flag }}</span>
                                <span class="text-white/80 text-sm font-semibold tracking-wide">{{ loc.code }}</span>
                            </span>

                            <svg width="10" height="13" viewBox="0 0 10 13" fill="none"
                                class="transition-transform duration-300"
                                :class="openLocation === i ? 'rotate-180' : ''">
                                <path
                                    d="M0.500158 8.65378L4.35279 12.2917C4.47279 12.4054 4.66226 12.4054 4.78858 12.2917L8.66016 8.64746"
                                    stroke="white" stroke-miterlimit="10" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M4.58008 12.5L4.58008 0.5" stroke="white" stroke-miterlimit="10"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <Transition enter-active-class="transition-all duration-300 ease-out"
                            enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-40"
                            leave-active-class="transition-all duration-200 ease-in"
                            leave-from-class="opacity-100 max-h-40" leave-to-class="opacity-0 max-h-0">
                            <div v-if="openLocation === i && (loc.phone || loc.address)"
                                class="p-[32px] pb-5 pt-0 overflow-hidden">
                                <p v-if="loc.phone" class="text-white text-ui font-regular mb-1">{{ loc.phone }}</p>
                                <p class="text-white text-ui font-regular leading-relaxed whitespace-pre-line">{{
                                    loc.address }}</p>
                            </div>
                        </Transition>
                    </div>
                </div>

                <!-- Newsletter -->
                <div class="mt-[40px]">
                    <p ref="newsletterLabelRef" class="text-white text-body font-medium tracking-widest mb-4">{{
                        newsletterLabel }}</p>
                    <form ref="newsletterFormRef"
                        class="flex items-center rounded-full border border-white h-[48px] backdrop-blur-md overflow-hidden pl-5 py-2"
                        style="border-inline:none;" @submit.prevent="subscribe">
                        <input v-model="newsletterEmail" type="email"
                            :placeholder="blok.newsletter_placeholder || 'Email Address'"
                            class="flex-1 bg-transparent text-white font-regular text-ui placeholder:text-white outline-none min-w-0" />
                        <button type="submit"
                            class="flex-shrink-0 w-[48px] h-[48px] rounded-full bg-beige flex items-center justify-center hover:bg-[#d4bf9f] transition-colors duration-200">
                            <svg width="13" height="10" viewBox="0 0 13 10" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.65378 8.66L12.2917 4.80737C12.4054 4.68737 12.4054 4.49789 12.2917 4.37158L8.64746 0.5"
                                    stroke="#091A28" stroke-miterlimit="10" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M12.5 4.58008H0.5" stroke="#091A28" stroke-miterlimit="10"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    </form>
                </div>

            </div>
        </div>

        <!-- Bottom bar -->
        <div class="relative overflow-hidden">
            <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
                <img src="~/assets/imgs/footer_bottom.svg" alt=""
                    class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full min-w-[1440px] object-cover object-bottom"
                    style="-webkit-mask-image: linear-gradient(to top, black 40%, transparent 100%); mask-image: linear-gradient(to top, black 40%, transparent 100%);" />
            </div>
            <div
                class="relative z-10 max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 pt-[64px] pb-[80px] flex flex-col-reverse sm:flex-row items-left sm:items-center justify-between gap-3">
                <p ref="copyrightRef" class="text-white font-light text-ui">{{ copyright }}</p>
                <div ref="legalRef" class="flex items-left sm:items-center gap-4">
                    <NuxtLink v-for="l in legalLinks" :key="l._uid" :to="l.link?.cached_url || l.link?.url || '/'"
                        class="text-white text-ui font-light hover:text-white/60 transition-colors duration-150">{{
                            l.label }}
                    </NuxtLink>
                </div>
            </div>
        </div>

    </footer>
</template>