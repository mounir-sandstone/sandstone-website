<script setup>
import gsap from 'gsap'

const props = defineProps({ blok: Object })

// ── Entrance animation refs ────────────────────────────────────────────────
const heroSection = ref(null)
const auroraEl = ref(null)
const bgGlass = ref(null)
const bgDots = ref(null)
const heroH1 = ref(null)
const heroP = ref(null)
const heroActions = ref(null)
const heroScroll = ref(null)
const heroWaveGlow = ref(null)

const preloaderDone = useState('preloaderDone', () => false)
const mediaReduceMotion = ref(false)
let cleanupFns = []

onMounted(() => {
  mediaReduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Hide everything immediately so there's no flash before animation
  gsap.set(auroraEl.value, { y: 90, opacity: 0 })
  gsap.set(bgGlass.value, { opacity: 0 })
  gsap.set(bgDots.value, { opacity: 0 })
  gsap.set(heroH1.value, { y: 70, opacity: 0 })
  gsap.set(heroP.value, { y: 55, opacity: 0 })
  gsap.set(heroScroll.value, { y: 30, opacity: 0 })
  if (heroActions.value) gsap.set(heroActions.value, { y: 40, opacity: 0 })

  if (mediaReduceMotion.value || !auroraEl.value || !heroSection.value) return

  const navyLayer = auroraEl.value.querySelector('.g-navy')
  const sandLayer = auroraEl.value.querySelector('.g-sand')
  const coolLayer = auroraEl.value.querySelector('.g-cool')

  if (navyLayer) {
    gsap.to(navyLayer, {
      x: 110,
      y: -36,
      rotate: -1.2,
      scaleX: 1.08,
      scaleY: 1.1,
      duration: 6.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }

  if (sandLayer) {
    gsap.to(sandLayer, {
      x: -126,
      y: -28,
      rotate: 1.3,
      scaleX: 1.1,
      scaleY: 1.05,
      duration: 5.7,
      delay: 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }

  if (coolLayer) {
    gsap.to(coolLayer, {
      x: 90,
      y: -20,
      rotate: -0.8,
      scaleX: 0.96,
      scaleY: 1.08,
      duration: 7.2,
      delay: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }

  const heroBounds = () => heroSection.value?.getBoundingClientRect()
  const onPointerMove = (event) => {
    const bounds = heroBounds()
    if (!bounds) return
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5

    gsap.to(auroraEl.value, {
      x: x * 46,
      y: y * 24,
      duration: 1.6,
      ease: 'power3.out',
    })

    gsap.to(bgDots.value, {
      x: -x * 18,
      y: -y * 12,
      duration: 1.2,
      ease: 'power2.out',
    })

    if (heroWaveGlow.value) {
      gsap.to(heroWaveGlow.value, {
        x: x * 36,
        y: y * 24,
        duration: 1.3,
        ease: 'power3.out',
      })
    }
  }

  const onPointerLeave = () => {
    gsap.to([auroraEl.value, bgDots.value, heroWaveGlow.value], {
      x: 0,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
    })
  }

  heroSection.value.addEventListener('pointermove', onPointerMove)
  heroSection.value.addEventListener('pointerleave', onPointerLeave)
  cleanupFns.push(() => heroSection.value?.removeEventListener('pointermove', onPointerMove))
  cleanupFns.push(() => heroSection.value?.removeEventListener('pointerleave', onPointerLeave))
})

// Entrance from bottom — triggered once preloader finishes
watch(preloaderDone, (done) => {
  if (!done) return

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 1. Background layers fade in
  tl.to(bgGlass.value, { opacity: 1, duration: 1.0 }, 0)
  tl.to(bgDots.value, { opacity: 0.7, duration: 1.2 }, 0.1)

  // 2. Aurora / sand layers rise from bottom
  tl.to(auroraEl.value, { y: 0, opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.05)

  // 3. Hero text — staggered enter from below
  tl.to(heroH1.value, { y: 0, opacity: 1, duration: 0.85 }, 0.3)
  tl.to(heroP.value, { y: 0, opacity: 1, duration: 0.75 }, '-=0.55')
  if (heroActions.value)
    tl.to(heroActions.value, { y: 0, opacity: 1, duration: 0.65 }, '-=0.45')

  // 4. Scroll indicator last
  tl.to(heroScroll.value, { y: 0, opacity: 1, duration: 0.55 }, '-=0.25')
})

onUnmounted(() => {
  cleanupFns.forEach((fn) => fn())
  cleanupFns = []
})
</script>

<template>
  <section ref="heroSection" v-editable="blok"
    class="relative h-[820px] flex flex-col items-center justify-center px-6 overflow-hidden bg-[#0c0c0e]">

    <!-- Exact Figma SVG — 3 paths + built-in blur & noise filters -->
    <svg ref="auroraEl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMax slice"
      aria-hidden="true" class="aurora-svg"
      style="-webkit-mask-image: linear-gradient(to bottom, transparent 0%, transparent 40%, black 65%); mask-image: linear-gradient(to bottom, transparent 0%, transparent 40%, black 65%)">
      <defs>
        <filter id="filter0_n" x="-781" y="200" width="2998" height="619.5" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves="3" result="noise"
            seed="4102" />
          <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
          <feComponentTransfer in="alphaNoise" result="coloredNoise1">
            <feFuncA type="discrete"
              tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " />
          </feComponentTransfer>
          <feComposite operator="in" in2="shape" in="coloredNoise1" result="noise1Clipped" />
          <feFlood flood-color="rgba(0,0,0,0.25)" result="color1Flood" />
          <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
          <feMerge>
            <feMergeNode in="shape" />
            <feMergeNode in="color1" />
          </feMerge>
        </filter>
        <filter id="filter1_f" x="-376" y="0" width="2527" height="930.078" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="100" />
        </filter>
        <filter id="filter2_f" x="73" y="246.141" width="2344" height="773.359" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="100" />
        </filter>
        <filter id="filter3_f" x="-881" y="426.344" width="2234" height="461.812" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="50" />
        </filter>
      </defs>
      <g filter="url(#filter0_n)">
        <g class="g-navy" filter="url(#filter1_f)">
          <path
            d="M-176 602.999L-105.1 539.46C-34.2 475.92 107.6 348.841 249.4 306.547C391.2 263.46 533 307.143 674.8 380.611C816.6 454.078 958.4 561.301 1100.2 528.936C1242 497.762 1383.8 326.999 1525.6 253.532C1667.4 180.064 1809.2 199.92 1880.1 211.238L1951 221.762V730.078H1880.1C1809.2 730.078 1667.4 730.078 1525.6 730.078C1383.8 730.078 1242 730.078 1100.2 730.078C958.4 730.078 816.6 730.078 674.8 730.078C533 730.078 391.2 730.078 249.4 730.078C107.6 730.078 -34.2 730.078 -105.1 730.078H-176V602.999Z"
            fill="#173955" />
        </g>
        <g class="g-sand" filter="url(#filter2_f)">
          <path
            d="M273 744.962L337.8 707.694C402.6 670.425 532.2 595.887 661.8 533.695C791.4 472.434 921 421.19 1050.6 459.157C1180.2 495.727 1309.8 621.509 1439.4 658.079C1569 696.047 1698.6 644.802 1828.2 658.079C1957.8 670.425 2087.4 744.962 2152.2 782.231L2217 819.5H2152.2C2087.4 819.5 1957.8 819.5 1828.2 819.5C1698.6 819.5 1569 819.5 1439.4 819.5C1309.8 819.5 1180.2 819.5 1050.6 819.5C921 819.5 791.4 819.5 661.8 819.5C532.2 819.5 402.6 819.5 337.8 819.5H273V744.962Z"
            fill="#CCB395" />
        </g>
        <g class="g-cool" filter="url(#filter3_f)">
          <path
            d="M-781 735.888L-713.2 709.754C-645.4 683.62 -509.8 631.351 -374.2 587.74C-238.6 544.782 -103 508.847 32.6 535.471C168.2 561.116 303.8 649.318 439.4 674.963C575 701.587 710.6 665.652 846.2 674.963C981.8 683.62 1117.4 735.888 1185.2 762.022L1253 788.156H1185.2C1117.4 788.156 981.8 788.156 846.2 788.156C710.6 788.156 575 788.156 439.4 788.156C303.8 788.156 168.2 788.156 32.6 788.156C-103 788.156 -238.6 788.156 -374.2 788.156C-509.8 788.156 -645.4 788.156 -713.2 788.156H-781V735.888Z"
            fill="#D1DAD9" />
        </g>
      </g>
    </svg>


    <!-- Background: blue glass aurora (left) -->
    <img ref="bgGlass" src="../assets/imgs/background glass.svg" alt="" aria-hidden="true"
      class="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />
    <!-- Dots / star pattern overlay -->
    <img ref="bgDots" src="../assets/imgs/dots pattern.svg" alt="" aria-hidden="true"
      class="absolute inset-0 w-full h-full object-cover z-[2] pointer-events-none select-none opacity-70" />
    <div ref="heroWaveGlow" class="hero-wave-glow pointer-events-none" aria-hidden="true"></div>
    <div class="hero-fade-bottom pointer-events-none" aria-hidden="true"></div>

    <!-- Main content -->
    <div ref="heroContent" class="relative z-10 w-full max-w-3xl mx-auto text-left sm:text-center">
      <h1 ref="heroH1" class="sm:text-h1 text-[32px] font-semibold tracking-tight text-white mb-[20px] leading-[1.15]">
        {{ blok.Title }}
      </h1>

      <p ref="heroP" class="sm:text-body text-ui font-medium text-white mx-auto mb-[40px] leading-relaxed">
        {{ blok.Description }}
      </p>

      <!-- Buttons (field name is "actions" in Storyblok schema) -->
      <div ref="heroActions" v-if="blok.actions && blok.actions.length"
        class="flex flex-wrap gap-3 justify-center flex-col sm:flex-row">
        <StoryblokComponent v-for="button in blok.actions" :key="button._uid" :blok="button" />
      </div>
    </div>

    <!-- Scroll indicator — large pill sitting at the bottom edge -->
    <div>
      <div ref="heroScroll"
        class="absolute z-10 bottom-0 left-1/2 text-white text-sm font-medium flex items-center gap-2"
        style="transform: translate(-50%, 15%)">
        <svg width="155" height="155" viewBox="0 0 155 155" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M77.5 0C120.302 0 155 34.6979 155 77.5C155 120.302 120.302 155 77.5 155C34.6979 155 0 120.302 0 77.5C0 34.6979 34.6979 0 77.5 0ZM77.999 28C50.3854 28 28 50.3854 28 77.999C28 105.613 50.3854 127.998 77.999 127.998C105.613 127.998 127.998 105.613 127.998 77.999C127.998 50.3854 105.613 28 77.999 28Z"
            fill="#FFFBF5" fill-opacity="0.6" />
        </svg>
      </div>
      <svg
        class="absolute z-10 bottom-[70px] left-1/2 transform -translate-x-1/2 text-white text-sm font-medium flex items-center"
        width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.5 8.01677L4.35263 11.3704C4.47263 11.4753 4.66211 11.4753 4.78842 11.3704L8.66 8.01094M4.58 11.5625L4.58 0.5"
          stroke="#22201F" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span
        class="absolute bottom-[130px] left-1/2 transform -translate-x-1/2 z-10 text-primary text-[12px] font-extralight">Scroll</span>
    </div>

    <!-- Desktop / tablet notch SVG -->
    <svg class="hidden md:block w-full absolute bottom-0 z-[4]" width="1440" height="80" viewBox="0 0 1440 80"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1360 72C1360 76.4183 1363.58 80 1368 80H1552C1556.42 80 1560 83.5817 1560 88V152C1560 156.418 1556.42 160 1552 160H-112C-116.418 160 -120 156.418 -120 152V88C-120 83.5817 -116.418 80 -112 80H72C76.4183 80 80 76.4183 80 72V8C80 3.58172 83.5817 0 88 0H663.166C667.523 0 671.011 3.51135 671.773 7.80135C675.931 31.2183 696.389 49 721 49C745.611 49 766.069 31.2183 770.227 7.80135C770.989 3.51135 774.477 0 778.834 0H1352C1356.42 0 1360 3.58172 1360 8V72Z"
        fill="url(#paint0_linear_1223_4416)" />
      <defs>
        <linearGradient id="paint0_linear_1223_4416" x1="699.5" y1="80" x2="699.5" y2="-230"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFCF6" />
          <stop offset="1" stop-color="#FFFCF6" stop-opacity="0.4" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Mobile notch SVG -->
    <svg class="block md:hidden w-full absolute bottom-0 z-[4]" width="390" height="80" viewBox="0 0 390 80" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M370 32C370 36.4183 373.582 40 378 40H536C540.418 40 544 43.5817 544 48V72C544 76.4183 540.418 80 536 80H-146C-150.418 80 -154 76.4183 -154 72V48C-154 43.5817 -150.418 40 -146 40H12C16.4183 40 20 36.4183 20 32V8C20 3.58172 23.5817 0 28 0H139C143.418 0 146.93 3.60906 147.665 7.96573C151.499 30.6843 171.456 48 195.5 48C219.544 48 239.501 30.6843 243.335 7.96573C244.07 3.60906 247.582 0 252 0H362C366.418 0 370 3.58172 370 8V32Z"
        fill="url(#paint0_linear_2304_42379)" />
      <defs>
        <linearGradient id="paint0_linear_2304_42379" x1="174.5" y1="64" x2="174.5" y2="-70.4"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFCF6" />
          <stop offset="1" stop-color="#FFFCF6" stop-opacity="0.4" />
        </linearGradient>
      </defs>
    </svg>

  </section>
</template>
<style scoped>
/* Aurora SVG — anchored to bottom, fades out toward top */
.aurora-svg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  /* Smooth fade: fully transparent top 40%, fades in between 40–65% */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, transparent 40%, black 65%);
  mask-image: linear-gradient(to bottom, transparent 0%, transparent 40%, black 65%);
}

/* Base movement in CSS, refined further with GSAP for the wave-warp feel. */
.g-navy {
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: drift-navy 14s ease-in-out infinite;
  will-change: transform;
}

.g-sand {
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: drift-sand 11s ease-in-out 1.2s infinite;
  will-change: transform;
}

.g-cool {
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: drift-cool 12s ease-in-out 2.6s infinite;
  will-change: transform;
}

.hero-wave-glow {
  position: absolute;
  inset: 0;
  z-index: 3;
  background:
    radial-gradient(50% 40% at 18% 80%, rgba(17, 89, 173, 0.35), transparent 65%),
    radial-gradient(48% 38% at 82% 75%, rgba(204, 179, 149, 0.3), transparent 70%);
  mix-blend-mode: screen;
  animation: glow-wave 9.5s ease-in-out infinite;
  will-change: transform, opacity;
}

.hero-fade-bottom {
  position: absolute;
  inset: auto 0 0;
  height: 42%;
  z-index: 3;
  background: linear-gradient(to top, rgba(12, 12, 14, 0.65) 0%, rgba(12, 12, 14, 0) 70%);
}

@keyframes drift-navy {
  0% {
    transform: translate(0px, 0px) scaleX(1) scaleY(1);
  }

  30% {
    transform: translate(220px, -80px) scaleX(1.12) scaleY(1.16);
  }

  65% {
    transform: translate(-160px, -50px) scaleX(0.92) scaleY(1.1);
  }

  100% {
    transform: translate(0px, 0px) scaleX(1) scaleY(1);
  }
}

@keyframes drift-sand {
  0% {
    transform: translate(0px, 0px) scaleX(1) scaleY(1);
  }

  35% {
    transform: translate(-240px, -70px) scaleX(1.18) scaleY(1.1);
  }

  70% {
    transform: translate(180px, -40px) scaleX(0.9) scaleY(1.08);
  }

  100% {
    transform: translate(0px, 0px) scaleX(1) scaleY(1);
  }
}

@keyframes drift-cool {
  0% {
    transform: translate(0px, 0px) scaleX(1) scaleY(1);
  }

  40% {
    transform: translate(300px, -60px) scaleX(0.88) scaleY(1.18);
  }

  70% {
    transform: translate(-200px, -30px) scaleX(1.14) scaleY(0.92);
  }

  100% {
    transform: translate(0px, 0px) scaleX(1) scaleY(1);
  }
}

@keyframes glow-wave {
  0% {
    transform: translate3d(0px, 0px, 0) scale(1);
    opacity: 0.9;
  }

  35% {
    transform: translate3d(24px, -12px, 0) scale(1.03);
    opacity: 0.98;
  }

  70% {
    transform: translate3d(-22px, 10px, 0) scale(0.98);
    opacity: 0.82;
  }

  100% {
    transform: translate3d(0px, 0px, 0) scale(1);
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .g-navy,
  .g-sand,
  .g-cool,
  .hero-wave-glow {
    animation: none;
  }
}
</style>
