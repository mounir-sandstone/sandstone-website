<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const props = defineProps({ blok: Object })

// ── Refs ───────────────────────────────────────────────────────────────────
const sectionRef = ref(null)
const headingRef = ref(null)
// slotRefs[i] = { cur: el, nxt: el } — two stacked elements per slot
const slotCurRefs = ref([])   // currently-visible logo el per slot
const slotNxtRefs = ref([])   // incoming logo el per slot (hidden above)

// ── Logos from blok ────────────────────────────────────────────────────────
const allLogos = computed(() => props.blok?.logos ?? [])

// ── GSAP cleanup ───────────────────────────────────────────────────────────
const splits = []
const triggers = []
let loopActive = false
let loopKill = null      // function to abort current cycle

// ── Helpers ────────────────────────────────────────────────────────────────
/**
 * Swap slot[slotIdx]: animate cur out (slide down) and nxt in (slide top).
 * yOffset controls the travel distance.
 * Returns a GSAP timeline.
 */
function swapSlot(slotIdx, yOff = 60) {
    const cur = slotCurRefs.value[slotIdx]
    const nxt = slotNxtRefs.value[slotIdx]
    if (!cur || !nxt) return gsap.timeline()

    const tl = gsap.timeline()
    tl.to(cur, { y: yOff, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
    tl.fromTo(nxt,
        { y: -yOff, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
        0
    )
    return tl
}

/**
 * Reverse-swap slot[slotIdx]: animate cur out (slide up) and put orig back.
 */
function unswapSlot(slotIdx, yOff = 60) {
    const cur = slotCurRefs.value[slotIdx]
    const nxt = slotNxtRefs.value[slotIdx]
    if (!cur || !nxt) return gsap.timeline()

    const tl = gsap.timeline()
    // cur is the "extra" logo we swapped in — slide it back up
    tl.to(cur, { y: -yOff, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
    // nxt is the original logo — bring it back from below
    tl.fromTo(nxt,
        { y: yOff, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
        0
    )
    return tl
}

/**
 * Run an infinite forward→reverse swap cycle on `visibleCount` slots,
 * using all logos beyond the first `visibleCount` as the "hidden queue".
 *
 * Each slot has two stacked <img>/<span> elements:
 *   slotCurRefs[i] = initially the logos[i] image
 *   slotNxtRefs[i] = initially the logos[visibleCount + i % extra] image (hidden)
 *
 * We cycle those pairs right→left, wait, then reverse.
 */
function startSwapLoop(visibleCount, yOff) {
    const total = allLogos.value.length
    if (total <= visibleCount) return   // nothing to swap
    loopActive = true

    // slotNxtRefs already holds the "extra" logos (set hidden in onMounted).
    // We'll track a queue of extra-logo indices assigned to each slot.
    // For simplicity: slot i shows logo[visibleCount + i] as its "next".
    // After each full forward pass we just reverse.

    function runCycle(forward) {
        if (!loopActive) return
        // Slots iterate right→left: visibleCount-1 → 0
        const indices = Array.from({ length: visibleCount }, (_, k) => visibleCount - 1 - k)
        const masterTl = gsap.timeline({
            onComplete: () => {
                if (!loopActive) return
                // 1.5s pause then flip direction
                const t = setTimeout(() => {
                    if (!loopActive) return
                    runCycle(!forward)
                }, 1500)
                loopKill = () => clearTimeout(t)
            },
        })

        indices.forEach((slotIdx, step) => {
            // build a mini tl at offset step * 0.3s
            const mini = forward
                ? swapSlot(slotIdx, yOff)
                : unswapSlot(slotIdx, yOff)
            masterTl.add(mini, step * 0.3)
        })
    }

    // Short initial delay so Phase 1 feels fully settled
    const t = setTimeout(() => {
        if (loopActive) runCycle(true)
    }, 800)
    loopKill = () => clearTimeout(t)
}

// ── onMounted ─────────────────────────────────────────────────────────────
onMounted(() => {
    // Pick visible slot count + y-offset based on current viewport width
    const w = window.innerWidth
    const visible = w >= 1024 ? 5 : w >= 768 ? 4 : 3
    const yOff = w < 768 ? 30 : 60

    // Hide all nxt-layer logos immediately (they sit hidden above each slot)
    const extras = slotNxtRefs.value.filter(Boolean)
    gsap.set(extras, { opacity: 0, y: -yOff })

    const logos = slotCurRefs.value.slice(0, visible).filter(Boolean)
    if (!logos.length) return

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: sectionRef.value,
            start: 'top 75%',
            once: true,
        },
        onComplete: () => {
            startSwapLoop(visible, yOff)
        },
    })

    // Phase 1 — Step 1: logos animate in right → left from above
    tl.from(logos, {
        y: -yOff,
        opacity: 0,
        duration: 0.6,
        stagger: { each: 0.15, from: 'end' },
        ease: 'power3.out',
        immediateRender: false,
    })

    // Phase 1 — Step 2: heading word by word
    if (headingRef.value) {
        const split = new SplitText(headingRef.value, { type: 'words' })
        splits.push(split)
        tl.from(split.words, {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            immediateRender: false,
        })
    }

    const st = ScrollTrigger.getAll().slice(-1)[0]
    if (st) triggers.push(st)
})

// ── onUnmounted ───────────────────────────────────────────────────────────
onUnmounted(() => {
    loopActive = false
    if (loopKill) loopKill()
    splits.forEach(s => s.revert())
    triggers.forEach(t => t.kill())
    gsap.killTweensOf([...slotCurRefs.value, ...slotNxtRefs.value])
})
</script>

<template>
    <section ref="sectionRef" v-editable="blok"
        class="bg-white pt-[120px] sm:pt-[200px] lg:pt-[280px] pb-0 overflow-x-hidden">
        <div class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0">

            <!-- Heading -->
            <p ref="headingRef"
                class="text-center text-primary text-body font-medium mb-[40px] sm:mb-[55px] tracking-wide">
                {{ blok.heading }}
            </p>

            <!-- Logo grid: 3 cols mobile / 4 cols tablet / 6 cols desktop -->
            <!--
                Each "slot" is a relative div with overflow:hidden.
                It holds TWO stacked absolute elements: cur (visible) + nxt (hidden above).
                slotCurRefs[i] = current logo element
                slotNxtRefs[i] = next/incoming logo element (opacity:0 initially)
                We always render min(logos, 6) slots regardless of breakpoint;
                CSS grid columns control how many are actually shown per row.
            -->
            <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10
                        items-center justify-items-center">

                <template v-for="(logo, i) in allLogos.slice(0, 5)" :key="logo._uid">
                    <!-- Slot wrapper — overflow:hidden clips the slide animation -->
                    <!-- slot 3: hidden on mobile, shown md+   -->
                    <!-- slot 4: hidden on mobile+tablet, shown lg+ -->
                    <div class="relative w-full flex items-center justify-center overflow-hidden"
                        :class="i === 3 ? 'hidden md:flex' : i === 4 ? 'hidden lg:flex' : 'flex'" style="height: 56px;">

                        <!-- CURRENT logo (visible) -->
                        <img v-if="logo.image?.filename" :ref="(el) => { if (el) slotCurRefs[i] = el }"
                            :src="logo.image.filename" :alt="logo.alt || logo.name"
                            class="absolute inset-0 m-auto max-h-full w-auto max-w-full object-contain select-none grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-[filter,opacity] duration-300"
                            draggable="false" />
                        <span v-else :ref="(el) => { if (el) slotCurRefs[i] = el }"
                            class="absolute text-primary text-sm font-semibold whitespace-nowrap">
                            {{ logo.name }}
                        </span>

                        <!-- NEXT logo (hidden, waiting above to swap in) -->
                        <template v-if="allLogos[5 + i]">
                            <img v-if="allLogos[5 + i].image?.filename" :ref="(el) => { if (el) slotNxtRefs[i] = el }"
                                :src="allLogos[5 + i].image.filename" :alt="allLogos[5 + i].alt || allLogos[5 + i].name"
                                class="absolute inset-0 m-auto max-h-full w-auto max-w-full object-contain select-none grayscale opacity-0"
                                draggable="false" style="opacity:0" />
                            <span v-else :ref="(el) => { if (el) slotNxtRefs[i] = el }"
                                class="absolute text-primary text-sm font-semibold whitespace-nowrap" style="opacity:0">
                                {{ allLogos[5 + i].name }}
                            </span>
                        </template>

                    </div>
                </template>

            </div>

        </div>
    </section>
</template>