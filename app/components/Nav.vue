<script setup>
import gsap from 'gsap'

const storyblokApi = useStoryblokApi()

const { data: navStory } = await useAsyncData('nav-globals', async () => {
  const { data } = await storyblokApi.get('cdn/stories/globals/navigation', {
    version: 'draft',
  })
  return data.story
})

const navItems = computed(() => navStory.value?.content?.body?.[0]?.nav_items ?? [])

// ── Desktop language selector ──────────────────────────────────────────────
const langOpen = ref(false)
const activeLang = ref('EN')
const langs = ['EN', 'FR', 'AR']
const langRef = ref(null)

// ── Mobile menu ────────────────────────────────────────────────────────────
const mobileOpen = ref(false)
const mobileLangOpen = ref(false)

const langLabels = { EN: 'English', FR: 'Français', AR: 'العربية' }

// ── Scroll-aware background ───────────────────────────────────────────────
const scrolled = ref(false)
let scrollHandler

const navLogo = ref(null)
const navCta = ref(null)
const navLangBtn = ref(null)
const navItemRefs = ref([])     // filled by :ref callback on each nav item wrapper
const navHamburger = ref(null)

const preloaderDone = useState('preloaderDone', () => false)

// Collects per-item refs from v-for
function setNavItemRef(el, index) {
  if (el) navItemRefs.value[index] = el
}

function openMobile() {
  mobileOpen.value = true
  document.body.style.overflow = 'hidden'
}
function closeMobile() {
  mobileOpen.value = false
  mobileLangOpen.value = false
  document.body.style.overflow = ''
}
function setLang(l) {
  activeLang.value = l
  langOpen.value = false
  mobileLangOpen.value = false
}

// Unwraps a Vue component ref to its real DOM element (needed for RouterLink etc.)
const dom = (r) => r?.value?.$el instanceof Element ? r.value.$el : r?.value instanceof Element ? r.value : null

onMounted(() => {
  // Scroll listener — show bg once user scrolls past 10px
  scrollHandler = () => { scrolled.value = window.scrollY > 10 }
  window.addEventListener('scroll', scrollHandler, { passive: true })

  // Close desktop lang dropdown on outside click
  document.addEventListener('click', (e) => {
    if (langRef.value && !langRef.value.contains(e.target)) {
      langOpen.value = false
    }
  })
  // Close mobile menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobile()
  })

  // Hide all nav elements — resolve component refs to real DOM elements first
  const allEls = [
    dom(navCta),
    dom(navLangBtn),
    ...navItemRefs.value.filter((el) => el instanceof Element),
    dom(navLogo),
    dom(navHamburger),
  ].filter(Boolean)
  gsap.set(allEls, { y: -32, opacity: 0 })
})

// Stair-step entrance from top — order: CTA → lang → nav items (L→R) → logo
watch(preloaderDone, (done) => {
  if (!done) return

  const STEP = 0.1   // gap between each stair
  const DUR = 0.55  // duration per item
  const ease = 'power3.out'
  const tl = gsap.timeline()
  let t = 0

  const go = (el) => { tl.to(el, { y: 0, opacity: 1, duration: DUR, ease }, t); t += STEP }

  // 1. CTA button
  const ctaEl = dom(navCta)
  if (ctaEl) go(ctaEl)

  // 2. Language switcher
  const langEl = dom(navLangBtn)
  if (langEl) go(langEl)

  // 3. Nav items one by one (left → right)
  navItemRefs.value.forEach((el) => {
    if (el instanceof Element) go(el)
    else t += STEP
  })

  // 4. Logo last
  const logoEl = dom(navLogo)
  if (logoEl) tl.to(logoEl, { y: 0, opacity: 1, duration: DUR, ease }, t)

  // Mobile hamburger mirrors logo timing
  const hamEl = dom(navHamburger)
  if (hamEl) tl.to(hamEl, { y: 0, opacity: 1, duration: DUR, ease }, t)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-50  transition-[background-color,backdrop-filter] duration-500 ease-in-out rounded-b-2xl"
    :class="scrolled ? 'bg-primary shadow-[0_4px_40px_rgba(0,0,0,0.35)]' : 'bg-transparent'">
    <div class="max-w-[var(--width-container)] mx-auto flex items-center justify-between px-[20px] 2xl:px-0 py-[20px]">
      <!-- Logo -->
      <RouterLink ref="navLogo" to="/" class="text-[#FFFCF6] text-xl font-bold tracking-tight flex-shrink-0">
        <img src="../assets/imgs/sandstone_logo.svg" alt="Sandstone logo" class="w-auto h-[40px]" />
      </RouterLink>

      <!-- Desktop nav links — each item individually wrapped for stagger animation -->
      <nav class="hidden md:flex items-center px-2">
        <span v-for="(item, i) in navItems" :key="item._uid" :ref="(el) => setNavItemRef(el, i)" class="inline-block">
          <StoryblokComponent :blok="item" />
        </span>
      </nav>

      <!-- Desktop right: language selector + CTA -->
      <div class="hidden md:flex items-center gap-3 flex-shrink-0">

        <!-- Language selector -->
        <div ref="langRef" class="relative">
          <button ref="navLangBtn"
            class="flex items-center gap-1 px-[24px] py-[12px] rounded-full backdrop-blur-sm bg-opacity-30 text-white border border-white backdrop-blur-md hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-200 text-sm font-semibold backdrop-filter"
            style="border-inline:none" @click="langOpen = !langOpen">
            {{ activeLang }}
            <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="langOpen ? 'rotate-180' : ''" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Transition enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-1 scale-95">
            <div v-if="langOpen"
              class="absolute right-0 top-full mt-2 w-24 rounded-xl border border-white/10 bg-[#111] overflow-hidden shadow-xl">
              <button v-for="l in langs" :key="l"
                class="w-full text-left px-[24px] py-[12px] text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors"
                :class="l === activeLang ? '!text-white' : ''" @click="setLang(l)">
                {{ l }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- CTA -->
        <span ref="navCta" class="inline-block">
          <AppButton label="Reach out" to="/contact" />
        </span>
      </div>

      <!-- Mobile hamburger -->
      <button ref="navHamburger"
        class="md:hidden w-[43px] h-[43px] rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition-colors hover:bg-white/20"
        aria-label="Open menu" @click="openMobile">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1H17M1 7H17M1 13H17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </header>

  <!-- ── Mobile full-screen menu ──────────────────────────────────────── -->
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="mobileOpen"
        class="fixed inset-0 z-[100] flex flex-col bg-[#0c0c0e]/95 backdrop-blur-xl px-6 pt-6 pb-10 overflow-y-auto"
        role="dialog" aria-modal="true" aria-label="Navigation menu">
        <!-- Top bar -->
        <div class="flex items-center justify-between mb-12 flex-shrink-0">
          <RouterLink to="/" @click="closeMobile">
            <img src="../assets/imgs/sandstone_logo.svg" alt="Sandstone logo" class="h-[36px] w-auto" />
          </RouterLink>
          <button
            class="w-[43px] h-[43px] rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close menu" @click="closeMobile">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- Nav links -->
        <nav class="flex flex-col gap-1 flex-1">
          <NuxtLink v-for="item in navItems" :key="item._uid"
            :to="'/' + (item.link?.cached_url ?? item.Link?.url ?? '').replace(/^\//, '')"
            class="text-[2rem] font-semibold text-white/80 hover:text-white py-2 transition-colors duration-150"
            active-class="!text-white" @click="closeMobile">
            {{ item.Label }}
          </NuxtLink>
        </nav>

        <!-- Bottom actions -->
        <div class="flex flex-col gap-3 mt-10 flex-shrink-0">

          <!-- Reach out — full width -->
          <AppButton label="Reach out" to="/contact" :full="true" @click="closeMobile" />

          <!-- Language selector — full width -->
          <div class="relative">
            <button
              class="w-full flex items-center justify-between px-6 py-[14px] rounded-full border border-white/15 bg-white/5 text-white text-sm font-semibold"
              @click="mobileLangOpen = !mobileLangOpen">
              {{ langLabels[activeLang] }}
              <svg class="w-4 h-4 transition-transform duration-200" :class="mobileLangOpen ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <div v-if="mobileLangOpen"
                class="absolute bottom-full mb-2 left-0 right-0 rounded-2xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-xl">
                <button v-for="l in langs" :key="l"
                  class="w-full text-left px-6 py-[14px] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors"
                  :class="l === activeLang ? '!text-white' : ''" @click="setLang(l)">
                  {{ langLabels[l] }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Social + email -->
          <div class="flex items-center gap-3 mt-2">
            <!-- LinkedIn -->
            <a href="https://linkedin.com" target="_blank" rel="noopener"
              class="w-[43px] h-[43px] rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <!-- Instagram -->
            <a href="https://instagram.com" target="_blank" rel="noopener"
              class="w-[43px] h-[43px] rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <!-- YouTube -->
            <a href="https://youtube.com" target="_blank" rel="noopener"
              class="w-[43px] h-[43px] rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0c0c0e" />
              </svg>
            </a>
          </div>

          <a href="mailto:info@sandstone.cx"
            class="text-white/50 text-sm font-medium hover:text-white transition-colors mt-1">
            info@sandstone.cx
          </a>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>