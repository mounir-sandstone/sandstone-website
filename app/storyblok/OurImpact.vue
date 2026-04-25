<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

defineProps({ blok: Object })

// ── Refs ───────────────────────────────────────────────────────────────────
const sectionRef = ref(null)
const badgeRef = ref(null)
const headingRef = ref(null)
const cardRefs = ref([])
const globeInnerRef = ref(null) // Card 0 — inner globe paths group
const chartRef = ref(null)   // Card 1 — bar chart SVG
const starRef = ref(null)   // Card 2 — star SVG
const filesBackRef = ref(null)   // Card 3 — back document <g>
const filesMidRef = ref(null)   // Card 3 — middle document <g>

function setCardRef(el, i) { if (el) cardRefs.value[i] = el }

// ── Loop state ────────────────────────────────────────────────────────────
const iconTweens = [null, null, null, null]  // active tween per card
const hovered = [false, false, false, false]
let loopCard = 0
let loopActive = false

// ── Per-card icon animation configs ──────────────────────────────────────
function playIcon(index, infinite = false) {
    const rep = infinite ? -1 : 3          // 3 repeats = 2 full yoyo cycles
    const onCom = infinite ? undefined : () => { advanceLoop() }

    stopIcon(index)  // kill existing before restarting

    switch (index) {
        case 0: // Globe inner — zoom + ±20° oscillation
            iconTweens[0] = gsap.to(globeInnerRef.value, {
                rotation: 20, scale: 1.12, yoyo: true, repeat: rep,
                duration: 1.8, ease: 'sine.inOut',
                transformOrigin: '50% 50%', onComplete: onCom,
            })
            break
        case 1: // Chart — bars grow from bottom (scaleY 0.4 → 1)
            iconTweens[1] = gsap.fromTo(
                chartRef.value,
                { scaleY: 0.4, transformOrigin: 'bottom center' },
                {
                    scaleY: 1, yoyo: true, repeat: rep,
                    duration: 1.4, ease: 'power1.inOut',
                    transformOrigin: 'bottom center', onComplete: onCom
                },
            )
            break
        case 2: // Star — counter-clockwise oscillation ±50°
            iconTweens[2] = gsap.to(starRef.value, {
                rotation: -50, yoyo: true, repeat: rep,
                duration: 1.5, ease: 'sine.inOut',
                transformOrigin: '50% 50%', onComplete: onCom,
            })
            break
        case 3: // Files — inner pages spread & close
            if (!filesBackRef.value || !filesMidRef.value) { onCom?.(); break }
            iconTweens[3] = gsap.to(filesBackRef.value, {
                y: -14, yoyo: true, repeat: rep,
                duration: 1.5, ease: 'power1.inOut', onComplete: onCom,
            })
            gsap.to(filesMidRef.value, {
                y: -7, yoyo: true, repeat: rep,
                duration: 1.5, ease: 'power1.inOut',
            })
            break
    }
}

function stopIcon(index) {
    if (iconTweens[index]) { iconTweens[index].kill(); iconTweens[index] = null }
    // Also kill any lingering mid-document tween for card 3
    if (index === 3 && filesMidRef.value) gsap.killTweensOf(filesMidRef.value)
    // Reset transforms
    const resets = [
        () => globeInnerRef.value && gsap.to(globeInnerRef.value, { rotation: 0, scale: 1, duration: 0.4, transformOrigin: '50% 50%' }),
        () => chartRef.value && gsap.to(chartRef.value, { scaleY: 1, duration: 0.4, transformOrigin: 'bottom center' }),
        () => starRef.value && gsap.to(starRef.value, { rotation: 0, duration: 0.4 }),
        () => {
            filesBackRef.value && gsap.to(filesBackRef.value, { y: 0, duration: 0.4 })
            filesMidRef.value && gsap.to(filesMidRef.value, { y: 0, duration: 0.4 })
        },
    ]
    resets[index]?.()
}

// ── Sequential card-by-card loop ──────────────────────────────────────────
function advanceLoop() {
    if (!loopActive) return
    loopCard = (loopCard + 1) % 4
    playIcon(loopCard, false)
}

function startLoop() {
    loopActive = true
    loopCard = 0
    playIcon(0, false)
}

// ── Hover handlers (called from template) ────────────────────────────────
function onCardEnter(index) {
    hovered[index] = true
    playIcon(index, true)   // infinite while hovering
}
function onCardLeave(index) {
    hovered[index] = false
    stopIcon(index)
    // Resume loop from this card so it continues naturally
    loopCard = index
    if (loopActive) playIcon(loopCard, false)
}

// ── Phase 1 — Scroll-triggered fade-up ───────────────────────────────────
onMounted(() => {
    const badge = badgeRef.value
    const heading = headingRef.value
    const cards = cardRefs.value.filter(Boolean)

    // Hide badge + cards initially (heading handled after SplitText below)
    gsap.set([badge, ...cards], { y: 40, opacity: 0 })

    const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.value, start: 'top 80%', once: true },
        onComplete: startLoop,
    })

    // 1. Badge
    tl.to(badge, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' })

    // 2. Heading — split into words, keep wrapper visible
    const split = new SplitText(heading, { type: 'words' })
    gsap.set(heading, { opacity: 1, y: 0 })   // wrapper visible; words are hidden
    gsap.set(split.words, { y: 40, opacity: 0 })
    tl.to(split.words, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 })

    // 3. Cards — staggered one by one
    tl.to(cards, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.15 })
})

onUnmounted(() => {
    loopActive = false
    ScrollTrigger.getAll().forEach((st) => st.kill())
})
</script>

<template>
    <section ref="sectionRef" v-editable="blok" class="bg-white overflow-hidden">
        <div class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 pt-[160px]">

            <!-- Header -->
            <div class="mb-[64px]">
                <span ref="badgeRef"
                    class="inline-flex items-center px-[24px] py-[10px] rounded-full border border-primary text-primary text-ui font-regular mb-5">
                    {{ blok.tag }}
                </span>
                <h2 ref="headingRef" class="text-[32px] sm:text-h2  leading-[1.2] font-semibold text-primary max-w-lg">
                    {{ blok.heading }}
                </h2>
            </div>

            <!-- Bento grid — 3 cols, 2 rows, fixed 616px tall, 16px gap -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:h-[616px]">

                <!-- Card 0 — Left, full height -->
                <div v-if="blok.stats?.[0]" v-editable="blok.stats[0]" :ref="(el) => setCardRef(el, 0)"
                    class="relative rounded-[8px] overflow-hidden flex flex-col p-6 sm:p-8 h-[160px] sm:h-auto sm:min-h-0 sm:row-span-2"
                    style="background: linear-gradient(182.77deg, #071A29 15.26%, #10304A 82.45%);"
                    @mouseenter="onCardEnter(0)" @mouseleave="onCardLeave(0)">
                    <!-- Stat top-left -->
                    <div class="flex-shrink-0">
                        <span class="text-[48px] sm:text-[80px] font-semibold text-[#D1DAD9] leading-none mb-[16px]">{{
                            blok.stats[0].value
                        }}</span>
                        <p class="text-white text-[14px] sm:text-ui font-light">{{ blok.stats[0].label }}</p>
                    </div>
                    <!-- Globe — centered bottom (desktop) / right side (mobile) -->
                    <div
                        class="absolute right-0 bottom-0 sm:relative sm:flex-1 sm:flex sm:items-end sm:justify-center sm:pb-2 pointer-events-none">

                        <svg class="w-[160px] h-[150px] sm:w-[353px] sm:h-[333px]" width="353" height="333"
                            viewBox="0 0 353 333" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="176.5" cy="166.5" r="166.5" fill="black" fill-opacity="0.01" />
                            <circle cx="176.5" cy="166.5" r="166" stroke="#FFFCF6" stroke-opacity="0.2" />
                            <g ref="globeInnerRef">
                                <path d="M177.213 281.247C118.178 289.735 69.7493 245.471 68.9131 182.094"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path
                                    d="M229.537 195.192C230.376 258.791 207.226 297.277 177.833 281.156C177.626 281.186 177.42 281.216 177.213 281.247"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M123.418 273.556C138.254 281.694 174.55 284.653 204.487 280.167"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M84.3428 238.017C109.722 251.936 171.819 257 223.036 249.327" stroke="#FFFCF6"
                                    stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M177.834 281.159C141.453 296.969 111.279 258.232 110.439 194.632"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M177.834 281.159C173.276 299.563 168.903 262.93 168.063 199.331"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M283.717 149.909C284.556 213.509 237.146 272.269 177.831 281.156"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M296.193 165.021C296.473 159.89 292.478 154.714 283.717 149.909"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path
                                    d="M177.834 281.159C207.227 297.28 230.377 258.794 229.538 195.195C271.176 188.958 295.537 177.109 296.193 165.024"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M204.487 280.167C234.425 275.681 246.667 265.448 231.834 257.313"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M280.485 224.235C281.312 219.494 277.93 214.676 269.82 210.23" stroke="#FFFCF6"
                                    stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M223.036 249.327C257.887 244.105 278.723 234.331 280.484 224.232"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M177.834 281.159C233.15 290.592 277.319 246.687 276.48 183.088"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M177.834 281.159C243.885 281.621 296.756 230.442 295.917 166.843"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M283.716 149.909C254.323 133.788 182.41 127.925 123.092 136.811"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M123.095 136.811C123.934 200.41 148.44 265.035 177.833 281.156"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M231.833 257.313C216.997 249.175 180.701 246.216 150.764 250.702"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M269.82 210.23C244.441 196.311 182.343 191.247 131.126 198.92" stroke="#FFFCF6"
                                    stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M177.833 281.159C214.214 265.348 243.029 200.976 242.193 137.377"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M177.833 281.158C182.391 262.753 185.408 196.274 184.569 132.678"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10"
                                    stroke-dasharray="11.14 11.14" />
                                <path d="M56.4664 166.581C55.9495 171.845 59.9208 177.164 68.9127 182.097"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path
                                    d="M177.834 281.159C148.441 265.038 123.934 200.414 123.095 136.814C81.9219 142.982 57.6406 154.635 56.4668 166.581"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M150.763 250.702C120.826 255.187 108.584 265.421 123.417 273.556"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M74.5898 229.432C76.1072 232.367 79.3153 235.262 84.3419 238.017"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M131.126 198.917C90.0496 205.073 68.4443 217.55 74.5899 229.429"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M177.834 281.159C123.326 271.47 79.2672 211.809 76.1533 148.921"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M177.833 281.159C111.78 280.693 57.5521 228.763 56.7158 165.164"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10"
                                    stroke-dasharray="11.14 11.14" />
                                <path
                                    d="M68.913 182.094C68.4903 117.838 115.773 59.2745 174.799 50.8445C204.192 66.9655 228.698 131.596 229.537 195.195C170.222 204.081 98.3059 198.218 68.913 182.097V182.094Z"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M82.8125 121.776C108.192 135.695 170.289 140.759 221.506 133.086"
                                    stroke="#CCB395" stroke-width="0.57" stroke-miterlimit="10"
                                    stroke-dasharray="11.14 11.14" />
                                <path d="M120.799 74.687C135.635 82.8251 171.931 85.7841 201.868 81.2984"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M110.439 194.629C109.599 131.03 138.418 66.6524 174.799 50.8416"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M168.063 199.328C167.224 135.729 170.24 69.2465 174.799 50.8416"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M174.799 50.8446C234.114 41.9584 282.88 86.3133 283.719 149.913"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M277.58 101.765C275.92 99.1074 272.851 96.4889 268.287 93.9861"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M221.504 133.086C263.51 126.791 285.155 113.884 277.577 101.765"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M201.865 81.2984C231.803 76.8128 244.045 66.5794 229.212 58.4443"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M276.479 183.085C275.64 119.486 230.115 60.2781 174.799 50.8445"
                                    stroke="#CCB395" stroke-width="0.57" stroke-miterlimit="10"
                                    stroke-dasharray="11.14 11.14" />
                                <path d="M295.916 166.839C295.077 103.24 240.849 51.3068 174.799 50.8416"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M174.799 50.8447C145.406 34.7236 122.256 73.2152 123.095 136.814"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M268.287 93.986C242.908 80.0668 180.811 75.0033 129.594 82.6761"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M229.212 58.4444C214.376 50.3063 178.08 47.3473 148.143 51.833"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M242.193 137.374C241.354 73.7746 211.18 35.0336 174.799 50.8414"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M184.569 132.675C183.73 69.0762 179.357 32.4367 174.799 50.8446"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M74.837 102.474C69.4486 108.839 71.6502 115.654 82.8101 121.776"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M129.594 82.676C100.897 86.9762 81.7032 94.3631 74.8369 102.474"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M148.142 51.833C118.205 56.3187 105.963 66.5521 120.796 74.6871"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path d="M76.1534 148.918C75.3141 85.3189 119.48 41.408 174.799 50.8446"
                                    stroke="#FFFCF6" stroke-width="0.17" stroke-miterlimit="10" />
                                <path d="M56.7159 165.164C55.8766 101.565 108.745 50.3794 174.799 50.8447"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path
                                    d="M118.75 271.171C135.806 280.526 156.113 284.41 177.834 281.156M118.75 271.171C115.475 269.295 111.09 266.789 108.046 264.551C105.482 262.665 102.062 260.144 99.5984 258.128C97.5763 256.474 94.9429 254.184 93.1123 252.32C90.9441 250.109 88.0401 247.168 85.9875 244.847C84.1995 242.825 81.9401 240.015 80.3194 237.856C78.4857 235.408 76.1838 232.035 74.5539 229.45C73.0852 227.121 71.2059 223.955 69.9896 221.482C68.6394 218.739 66.8484 215.075 65.6594 212.259C64.5677 209.674 63.2936 206.149 62.3905 203.491C60.7423 198.65 59.0668 192.008 58.2397 186.96C57.297 181.203 56.4821 173.436 56.4243 167.603C56.3939 164.4 56.5246 160.128 56.7527 156.934C56.9564 154.048 57.5007 150.226 57.8596 147.355C58.2458 144.244 59.1854 140.157 59.9274 137.109C60.5933 134.369 61.6576 130.756 62.5486 128.077C63.5338 125.115 65.0421 121.229 66.2706 118.358C67.3562 115.815 69.0591 112.543 70.2602 110.055C71.6377 107.197 73.9032 103.608 75.6121 100.935C77.0687 98.6542 79.2368 95.7651 80.7937 93.5542C82.7095 90.8385 85.6591 87.5146 87.8911 85.0543C89.6518 83.114 92.0875 80.6051 94.0154 78.8352C96.7248 76.3506 100.468 73.1847 103.339 70.8887C105.245 69.3651 107.924 67.5039 109.956 66.1506C111.984 64.8003 114.775 63.1368 116.861 61.8839C120.395 59.7581 125.342 57.3009 129.165 55.7469C131.655 54.7342 134.988 53.4113 137.53 52.5446C140.121 51.6627 143.624 50.6195 146.273 49.9292C148.757 49.2845 152.099 48.5151 154.626 48.065C155.812 47.8521 157.393 47.5663 158.585 47.399C160.416 47.1405 162.861 46.8455 164.697 46.6448C164.834 46.6296 168.112 46.2738 172.841 46.1308C173.622 46.1065 174.662 46.0822 175.441 46.0852C177.001 46.0913 179.084 46.1156 180.643 46.1612C182.365 46.2129 186.345 46.4562 189.039 46.7604C190.821 46.9611 192.966 47.2479 195.474 47.621C196.508 47.773 197.873 48.0437 198.901 48.2262C200.205 48.4573 201.926 48.8405 203.216 49.1355C204.453 49.4183 206.092 49.841 207.324 50.1573C209.133 50.6226 211.523 51.3251 213.29 51.9242C215.781 52.7696 219.08 53.9617 221.522 54.938C223.404 55.6891 225.882 56.7809 227.704 57.6689C230.337 58.9522 233.801 60.7648 236.346 62.2184C238.468 63.4288 241.248 65.1379 243.249 66.5368C245.277 67.957 247.992 69.8425 249.936 71.3783C252.377 73.3125 255.57 75.9795 257.854 78.1022C259.794 79.9056 262.312 82.3872 264.106 84.3366C266.192 86.6022 268.895 89.7011 270.778 92.1401C273.925 96.2122 277.388 100.972 281.39 108.179C284.091 113.042 286.998 119.897 289.056 125.063C290.203 127.94 291.343 131.918 292.155 134.908C292.903 137.666 293.621 141.413 294.247 144.198C294.937 147.276 295.445 151.467 295.691 154.611C295.971 158.187 296.367 162.971 296.224 166.557C296.108 169.482 296.047 173.393 295.786 176.313C295.506 179.472 295.071 183.696 294.42 186.801C293.837 189.587 293.137 193.325 292.41 196.077C291.608 199.13 290.385 203.163 289.327 206.137C288.393 208.758 287.028 212.216 285.882 214.752C284.556 217.681 282.692 221.552 281.08 224.338C278.365 229.027 274.308 235.028 271.109 239.404C269.142 242.098 266.089 245.355 263.893 247.867C262.175 249.835 259.666 252.262 257.72 254.004C254.959 256.48 251.122 259.603 248.227 261.923C245.976 263.73 242.774 265.889 240.308 267.388C236.769 269.541 231.928 272.221 228.227 274.088C225.606 275.408 221.984 276.91 219.247 277.965C216.678 278.957 213.199 280.143 210.556 280.906C204.773 282.576 202.516 283.047 197.985 283.938C195.735 284.379 191.25 285.048 187.929 285.355C185.573 285.574 183.718 285.711 182.422 285.763C178.542 285.924 178.32 285.921 174.598 285.906C174.09 285.906 169.477 285.863 163.596 285.243C160.112 284.875 157.192 284.385 157.162 284.382C156.034 284.194 154.532 283.935 153.41 283.716C152.208 283.482 150.615 283.123 149.417 282.868C147.875 282.539 145.844 281.998 144.323 281.578C142.818 281.162 140.829 280.547 139.342 280.079C136.834 279.291 133.525 278.111 131.111 277.065C127.34 275.435 122.408 273.045 118.75 271.175V271.171Z"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path
                                    d="M118.306 271.035C114.718 269.073 111.257 266.914 108.046 264.551C105.482 262.665 102.062 260.144 99.5984 258.128C97.5763 256.474 94.9429 254.184 93.1123 252.32C90.9441 250.109 88.0401 247.168 85.9875 244.847C84.1995 242.825 81.9401 240.015 80.3194 237.856C78.4857 235.408 76.1838 232.035 74.5539 229.45C73.0852 227.121 71.2059 223.955 69.9896 221.482C68.6394 218.739 66.8484 215.075 65.6594 212.259C64.5677 209.674 63.2936 206.149 62.3905 203.491C60.7423 198.65 59.0668 192.008 58.2397 186.96C57.297 181.203 56.4821 173.436 56.4243 167.603C56.3939 164.4 56.5246 160.128 56.7527 156.934C56.9564 154.048 57.5007 150.226 57.8596 147.355C58.2458 144.244 59.1854 140.157 59.9274 137.109C60.5933 134.369 61.6576 130.756 62.5486 128.077C63.5338 125.115 65.0421 121.229 66.2706 118.358C67.3562 115.815 69.0591 112.543 70.2602 110.055C71.6377 107.197 73.9032 103.608 75.6121 100.935C77.0687 98.6542 79.2368 95.7651 80.7937 93.5542C82.7095 90.8385 85.6591 87.5146 87.8911 85.0543C89.6518 83.114 92.0875 80.6051 94.0154 78.8352C96.7248 76.3506 100.468 73.1847 103.339 70.8887C105.245 69.3651 107.924 67.5039 109.956 66.1506C111.984 64.8003 114.775 63.1368 116.861 61.8839C120.395 59.7581 125.342 57.3009 129.165 55.7469C131.655 54.7342 134.988 53.4113 137.53 52.5446C140.121 51.6627 143.624 50.6195 146.273 49.9292C148.757 49.2845 152.099 48.5151 154.626 48.065C155.812 47.8521 157.393 47.5663 158.585 47.399C160.416 47.1405 162.861 46.8455 164.697 46.6448C164.834 46.6296 168.112 46.2738 172.841 46.1308C173.622 46.1065 174.662 46.0822 175.441 46.0852C177.001 46.0913 179.084 46.1156 180.643 46.1612C182.365 46.2129 186.345 46.4562 189.039 46.7604C190.821 46.9611 192.966 47.2479 195.474 47.621C196.508 47.773 197.873 48.0437 198.901 48.2262C200.205 48.4573 201.926 48.8405 203.216 49.1355C204.453 49.4183 206.092 49.841 207.324 50.1573C209.133 50.6226 211.523 51.3251 213.29 51.9242C215.781 52.7696 219.08 53.9617 221.522 54.938C223.404 55.6891 225.882 56.7809 227.704 57.6689C230.337 58.9522 233.801 60.7648 236.346 62.2184C238.468 63.4288 241.248 65.1379 243.249 66.5368C245.277 67.957 247.992 69.8425 249.936 71.3783C252.377 73.3125 255.57 75.9795 257.854 78.1022C259.794 79.9056 262.312 82.3872 264.106 84.3366C266.192 86.6022 268.895 89.7011 270.778 92.1401C273.925 96.2122 277.388 100.972 281.39 108.179C284.091 113.042 286.998 119.897 289.056 125.063C290.203 127.94 291.343 131.918 292.155 134.908C292.903 137.666 293.621 141.413 294.247 144.198C294.937 147.276 295.445 151.467 295.691 154.611C295.971 158.187 296.367 162.971 296.224 166.557C296.108 169.482 296.047 173.393 295.786 176.313C295.506 179.472 295.071 183.696 294.42 186.801C293.837 189.587 293.137 193.325 292.41 196.077C291.608 199.13 290.385 203.163 289.327 206.137C288.393 208.758 287.028 212.216 285.882 214.752C284.556 217.681 282.692 221.552 281.08 224.338C278.365 229.027 274.308 235.028 271.109 239.404C269.142 242.098 266.089 245.355 263.893 247.867C262.175 249.835 259.666 252.262 257.72 254.004C254.959 256.48 251.122 259.603 248.227 261.923C245.976 263.73 242.774 265.889 240.308 267.388C236.769 269.541 231.928 272.221 228.227 274.088C225.606 275.408 221.984 276.91 219.247 277.965C216.678 278.957 213.199 280.143 210.556 280.906C204.773 282.576 202.516 283.047 197.985 283.938C195.735 284.379 191.25 285.048 187.929 285.355C185.573 285.574 183.718 285.711 182.422 285.763C178.542 285.924 178.32 285.921 174.598 285.906C174.09 285.906 169.477 285.863 163.596 285.243C160.112 284.875 157.192 284.385 157.162 284.382C156.034 284.194 154.532 283.935 153.41 283.716C152.208 283.482 150.615 283.123 149.417 282.868C147.875 282.539 145.844 281.998 144.323 281.578C142.818 281.162 140.829 280.547 139.342 280.079C137.244 279.422 135.167 278.689 133.118 277.889C128.152 275.949 123.116 273.671 118.306 271.041V271.035Z"
                                    stroke="#FFFCF6" stroke-width="0.57" stroke-miterlimit="10" />
                                <path
                                    d="M221.702 136.012C219.841 135.862 218.454 134.231 218.604 132.37C218.754 130.509 220.385 129.122 222.246 129.272C224.107 129.422 225.494 131.052 225.344 132.913C225.194 134.774 223.564 136.162 221.702 136.012Z"
                                    fill="#CCB395" />
                                <path
                                    d="M262.702 243.012C260.841 242.862 259.454 241.231 259.604 239.37C259.754 237.509 261.385 236.122 263.246 236.272C265.107 236.422 266.494 238.052 266.344 239.913C266.194 241.774 264.564 243.162 262.702 243.012Z"
                                    fill="#CCB395" />
                                <path
                                    d="M68.7025 114.012C66.8413 113.862 65.4543 112.231 65.6043 110.37C65.7544 108.509 67.3845 107.122 69.2457 107.272C71.1071 107.422 72.4943 109.052 72.3443 110.913C72.1943 112.774 70.5639 114.162 68.7025 114.012Z"
                                    fill="#CCB395" />
                                <path
                                    d="M109.702 199.012C107.841 198.862 106.454 197.231 106.604 195.37C106.754 193.509 108.385 192.122 110.246 192.272C112.107 192.422 113.494 194.052 113.344 195.913C113.194 197.774 111.564 199.162 109.702 199.012Z"
                                    fill="#CCB395" />
                                <path
                                    d="M114.702 66.0117C112.841 65.8617 111.454 64.2312 111.604 62.3702C111.754 60.509 113.385 59.1216 115.246 59.2716C117.107 59.4216 118.494 61.0522 118.344 62.9134C118.194 64.7744 116.564 66.1618 114.702 66.0117Z"
                                    fill="#CCB395" />
                            </g>
                        </svg>

                    </div>
                </div>

                <!-- Middle column — 2 stacked cards via sub-grid -->
                <div class="sm:col-span-1 grid grid-rows-2 gap-4 sm:gap-4 sm:h-[616px]">

                    <!-- Card 1 — Top middle -->
                    <div v-if="blok.stats?.[1]" v-editable="blok.stats[1]" :ref="(el) => setCardRef(el, 1)"
                        class="relative rounded-[8px] overflow-hidden flex flex-col p-6 sm:p-8 h-[160px] sm:h-auto sm:min-h-0"
                        style="background: linear-gradient(182.77deg, #071A29 15.26%, #10304A 82.45%);"
                        @mouseenter="onCardEnter(1)" @mouseleave="onCardLeave(1)">
                        <!-- Stat top-left -->
                        <div class="flex-shrink-0 flex flex-col items-end sm:block">
                            <span
                                class="text-[48px] sm:text-[80px] font-semibold text-[#D1DAD9] leading-none mb-[16px]">{{
                                    blok.stats[1].value }}
                            </span>
                            <p class="text-white text-[14px] w-[137px] sm:w-full sm:text-ui font-light">{{
                                blok.stats[1].label }}</p>
                        </div>
                        <!-- Bar chart — bottom right -->
                        <div
                            class="absolute left-1/4 sm:left-1/2 top-1/2 -translate-x-1/2 translate-y-[5%] pointer-events-none select-none">

                            <svg ref="chartRef" class="w-[160px] sm:w-[284px] h-auto" width="284" height="147"
                                viewBox="0 0 284 147" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M284 6.92067V300.215C284 307.679 275.693 307.126 273.592 307.126H228.362C226.262 307.126 217.954 307.678 217.954 300.215V6.92067C217.954 -0.543915 226.262 0.00956618 228.362 0.00956618L273.592 0.00956618C275.693 0.00842725 284 -0.543915 284 6.92067Z"
                                    fill="#D1DAD9" />
                                <path
                                    d="M200.941 33.533C202.028 33.5324 204.53 33.4001 206.772 34.1619C207.883 34.5392 208.895 35.1263 209.63 36.03C210.36 36.9271 210.849 38.1768 210.849 39.9441V300.215C210.849 301.982 210.36 303.232 209.63 304.129C208.895 305.032 207.883 305.619 206.772 305.996C204.53 306.757 202.029 306.626 200.941 306.626H155.711C154.624 306.626 152.122 306.758 149.879 305.996C148.769 305.618 147.756 305.031 147.021 304.128C146.291 303.231 145.802 301.982 145.802 300.215V39.9441C145.802 38.1768 146.291 36.927 147.021 36.03C147.756 35.1266 148.769 34.5401 149.879 34.1628C152.122 33.4011 154.624 33.533 155.711 33.533H200.941Z"
                                    stroke="#FFFCF6" />
                                <path
                                    d="M100.021 66.0562V66.5562H111.329V66.0562H122.636V66.5562H128.29C129.005 66.5558 130.324 66.4964 131.803 66.6772L131.862 66.1821C134.079 66.453 136.626 67.247 137.894 69.5161L137.458 69.7603C137.913 70.5743 138.198 71.6186 138.198 72.9673V79.2798H138.698V91.9048H138.198V104.529H138.698V117.154H138.198V129.779H138.698V142.404H138.198V155.029H138.698V167.654H138.198V180.279H138.698V192.903H138.198V205.528H138.698V218.153H138.198V230.778H138.698V243.403H138.198V256.028H138.698V268.653H138.198V281.278H138.698V293.902H138.198V300.214C138.198 301.563 137.913 302.607 137.458 303.421L137.894 303.665C136.626 305.934 134.08 306.728 131.862 306.999L131.803 306.503C130.693 306.639 129.675 306.64 128.933 306.632L128.29 306.625H122.636V307.125H111.329V306.625H100.021V307.125H88.7139V306.625H83.0605C82.3454 306.625 81.0262 306.684 79.5469 306.503L79.4863 306.998C77.2692 306.726 74.7222 305.933 73.4551 303.665L73.8916 303.421C73.4369 302.607 73.1514 301.563 73.1514 300.214V293.902H72.6514V281.277H73.1514V268.653H72.6514V256.028H73.1514V243.403H72.6514V230.778H73.1514V218.153H72.6514V205.528H73.1514V192.903H72.6514V180.279H73.1514V167.654H72.6514V155.029H73.1514V142.404H72.6514V129.779H73.1514V117.154H72.6514V104.529H73.1514V91.9048H72.6514V79.2798H73.1514V72.9673C73.1514 71.6186 73.437 70.5743 73.8916 69.7603L73.4551 69.5161C74.7223 67.2475 77.2693 66.4542 79.4863 66.1831L79.5469 66.6782C81.0262 66.4974 82.3454 66.5562 83.0605 66.5562H88.7139V66.0562H100.021Z"
                                    stroke="#FFFCF6" stroke-dasharray="12 12" />
                                <path
                                    d="M27.3701 99.0793V99.5793H38.6777V99.0793H49.9844V99.5793H55.6387C56.3536 99.579 57.6723 99.5196 59.1514 99.7004L59.2109 99.2053C61.428 99.4762 63.9748 100.27 65.2422 102.539L64.8066 102.783C65.2612 103.598 65.5469 104.642 65.5469 105.99V112.06H66.0469V124.198H65.5469V136.338H66.0469V148.477H65.5469V160.615H66.0469V172.755H65.5469V184.894H66.0469V197.032H65.5469V209.172H66.0469V221.311H65.5469V233.45H66.0469V245.589H65.5469V257.728H66.0469V269.867H65.5469V282.006H66.0469V294.145H65.5469V300.214C65.5469 301.563 65.2611 302.607 64.8066 303.421L65.2422 303.664C63.9749 305.934 61.4283 306.727 59.2109 306.998L59.1514 306.503C58.0421 306.639 57.0232 306.64 56.2813 306.632L55.6387 306.625H49.9844V307.125H38.6777V306.625H27.3701V307.125H16.0625V306.625H10.4092C9.69408 306.625 8.3748 306.684 6.89551 306.503L6.83496 306.997C4.6178 306.726 2.07084 305.933 0.803711 303.664L1.24023 303.421C0.785526 302.607 0.5 301.563 0.5 300.214L0.5 294.145H0L0 282.006H0.5L0.5 269.867H0L0 257.728H0.5L0.5 245.589H0L0 233.45H0.5L0.5 221.311H0L0 209.172H0.5L0.5 197.032H0L0 184.894H0.5L0.5 172.755H0L0 160.615H0.5L0.5 148.477H0L0 136.338H0.5L0.5 124.198H0L0 112.06H0.5L0.5 105.99C0.5 104.642 0.785606 103.597 1.24023 102.783L0.803711 102.539C2.07098 100.271 4.61797 99.4774 6.83496 99.2063L6.89551 99.7014C8.37486 99.5205 9.694 99.5793 10.4092 99.5793H16.0625V99.0793H27.3701Z"
                                    stroke="#CCB395" stroke-dasharray="11.69 11.69" />
                            </svg>

                        </div>
                    </div>

                    <!-- Card 2 — Bottom middle -->
                    <div v-if="blok.stats?.[2]" v-editable="blok.stats[2]" :ref="(el) => setCardRef(el, 2)"
                        class="relative rounded-[8px] overflow-hidden flex flex-col p-6 sm:p-8 h-[160px] sm:h-auto sm:min-h-0"
                        style="background: linear-gradient(182.77deg, #071A29 15.26%, #10304A 82.45%);"
                        @mouseenter="onCardEnter(2)" @mouseleave="onCardLeave(2)">
                        <!-- Star — top right -->
                        <div class="absolute top-0 right-[10px] pointer-events-none">

                            <svg ref="starRef" class="w-[130px] sm:w-[210px] h-auto" width="210" height="200"
                                viewBox="0 0 210 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0.101562 76.1636L105.602 107.553L105.603 107.554L105.753 107.604L105.829 107.629L105.783 107.696L105.693 107.826H105.692L40.1426 199.396L40.0449 199.327L105.24 107.828L0.0664062 76.2788L0.101562 76.1636Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M0.113281 76.1694L75.834 118.949H75.833L75.9307 118.998L75.9844 119.024L75.958 119.078L75.9082 119.174L75.9092 119.175L40.1484 199.385L40.0391 199.336L75.5039 119.183L0.0546875 76.2729L0.113281 76.1694Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M0.125977 76.1782L52.5859 127.138V127.139L52.6367 127.189L52.6582 127.21L52.6436 127.301L40.1533 199.372L40.0352 199.351L52.2588 127.332L0.0419922 76.2642L0.125977 76.1782Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.894 0.111084L105.644 107.951V108.194L105.565 108.168L105.417 108.118V108.119L0.0664062 76.2781L0.0839844 76.2214L0.101562 76.1638L105.272 107.702L104.774 0.111084H104.894Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.893 0.123779L87.0322 84.9412L87.0127 85.0515L87.002 85.1111L86.9434 85.1003L86.8379 85.0808L0.078125 76.281L0.0898438 76.1619V76.1609L86.708 84.7048L104.775 0.0983887L104.893 0.123779Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.888 0.137451L72.6377 65.7878L72.6074 65.8484L72.5908 65.8806H72.4922L0.0927734 76.28L0.0839844 76.2214L0.0751953 76.1619L72.3428 65.5359L104.78 0.0847168L104.888 0.137451Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M209.611 76.2788L105.833 108.097L169.633 199.327L169.535 199.396H169.534L105.385 108.095L105.294 107.965L105.249 107.9L105.475 107.825L105.477 107.824L209.576 76.1636L209.611 76.2788Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M209.594 76.2212L209.624 76.2729L134.173 119.183L169.639 199.336L169.529 199.385L133.77 119.178L133.72 119.078L133.694 119.024L133.748 118.998L133.844 118.949L209.564 76.1694L209.594 76.2212Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M209.636 76.2642L157.41 127.34L169.644 199.351L169.524 199.372L157.035 127.301L157.024 127.241L157.021 127.214L157.037 127.194L157.077 127.144L157.082 127.138L209.552 76.1782L209.636 76.2642Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.744 0.000976562L105.641 107.375L209.426 76.0537L209.461 76.1689L105.512 107.787L105.363 107.838L105.284 107.864V107.621L104.624 0.000976562H104.744Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.893 0.0983887L122.97 84.7048L209.588 76.1609V76.1619L209.6 76.281L122.832 85.0798L122.735 85.1003L122.676 85.1121L122.665 85.0515L122.645 84.9421V84.9412L104.775 0.123779L104.893 0.0983887Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.888 0.0847168L137.334 65.5359L209.603 76.1619L209.594 76.2214L209.585 76.28L137.186 65.8806H137.087L137.07 65.8484L137.04 65.7878L104.78 0.137451L104.888 0.0847168Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M105.531 107.445L105.632 107.575L105.633 107.577L169.633 199.327L169.584 199.361L169.534 199.395L105.487 107.999L39.9326 199.396L39.835 199.326L105.345 107.576L105.435 107.447L105.481 107.38L105.531 107.445Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.876 140.029L104.956 140.108H104.955L169.624 199.317L169.584 199.361L169.543 199.405L104.838 140.49L39.9238 199.405L39.8438 199.317V199.316L104.719 140.111L104.789 140.032L104.831 139.983L104.876 140.029Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M104.921 165.168H104.922L169.611 199.308L169.584 199.361L169.556 199.415L104.838 165.537L39.9111 199.415L39.8555 199.308L104.756 165.168L104.803 165.139L104.831 165.123L104.921 165.168Z"
                                    fill="#D1DAD9" stroke="#D1DAD9" stroke-width="0.12" />
                                <path
                                    d="M86.454 87.1228C84.5928 86.9728 83.2058 85.3422 83.3558 83.4812C83.5058 81.62 85.136 80.2327 86.9972 80.3827C88.8586 80.5327 90.2457 82.1633 90.0957 84.0245C89.9457 85.8855 88.3154 87.2728 86.454 87.1228Z"
                                    fill="#CCB395" />
                                <path
                                    d="M156.793 128.667C155.849 128.591 155.146 127.764 155.222 126.82C155.298 125.876 156.124 125.173 157.068 125.249C158.012 125.325 158.716 126.152 158.64 127.096C158.564 128.039 157.737 128.743 156.793 128.667Z"
                                    fill="#CCB395" />
                                <path
                                    d="M138.533 68.1472C137.21 68.0406 136.225 66.8821 136.331 65.5598C136.438 64.2374 137.596 63.2517 138.919 63.3583C140.241 63.4649 141.227 64.6234 141.12 65.9458C141.014 67.2681 139.855 68.2538 138.533 68.1472Z"
                                    fill="#CCB395" />
                                <path
                                    d="M51.7048 129.484C50.8096 129.412 50.1424 128.627 50.2146 127.732C50.2867 126.837 51.0709 126.17 51.9662 126.242C52.8615 126.314 53.5288 127.098 53.4566 127.994C53.3845 128.889 52.6002 129.556 51.7048 129.484Z"
                                    fill="#CCB395" />
                                <path
                                    d="M104.318 167.76C103.084 167.66 102.165 166.579 102.264 165.345C102.364 164.112 103.445 163.192 104.678 163.291C105.913 163.391 106.832 164.472 106.733 165.706C106.633 166.939 105.552 167.859 104.318 167.76Z"
                                    fill="#CCB395" />
                            </svg>

                        </div>
                        <!-- Stat bottom-left -->
                        <div class="relative z-10 mt-auto">
                            <span
                                class="text-[48px] sm:text-[80px] font-semibold text-[#D1DAD9] leading-none mb-[16px]">{{
                                    blok.stats[2].value }}
                            </span>
                            <p class="text-white text-[14px] w-[200px] sm:w-full sm:text-ui font-light">{{
                                blok.stats[2].label }}</p>
                        </div>
                    </div>

                </div>

                <!-- Card 3 — Right, full height -->
                <div v-if="blok.stats?.[3]" v-editable="blok.stats[3]" :ref="(el) => setCardRef(el, 3)"
                    class="relative rounded-[8px] overflow-hidden flex flex-col p-6 sm:p-8 h-[160px] sm:h-auto sm:min-h-0 sm:row-span-2"
                    style="background: linear-gradient(182.77deg, #071A29 15.26%, #10304A 82.45%);"
                    @mouseenter="onCardEnter(3)" @mouseleave="onCardLeave(3)">
                    <!-- Document illustration — centered (desktop) / left side (mobile) -->
                    <div
                        class="absolute left-0 top-0 bottom-0 sm:relative sm:flex-1 sm:flex sm:items-center sm:justify-center pointer-events-none">

                        <svg class="w-[160px] h-full sm:w-[353px] sm:h-[333px]" width="353" height="333"
                            viewBox="0 0 353 333" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="176.5" cy="166.5" r="166.5" fill="black" fill-opacity="0.01" />
                            <circle cx="176.5" cy="166.5" r="166" stroke="#FFFCF6" stroke-opacity="0.2" />
                            <path
                                d="M277.518 250.4L272.596 251.068L272.485 250.246L277.407 249.578L277.518 250.4ZM267.674 251.736L262.751 252.404L262.64 251.582L267.563 250.914L267.674 251.736ZM257.828 253.072L252.906 253.74L252.795 252.918L257.717 252.25L257.828 253.072ZM247.983 254.408L243.061 255.076L242.949 254.254L247.871 253.586L247.983 254.408ZM238.138 255.744L233.216 256.412L233.104 255.59L238.026 254.922L238.138 255.744ZM228.293 257.08L223.371 257.748L223.259 256.927L228.181 256.259L228.293 257.08ZM218.448 258.417L213.526 259.085L213.415 258.263L218.337 257.595L218.448 258.417ZM208.602 259.753L203.68 260.421L203.569 259.599L208.491 258.931L208.602 259.753ZM198.758 261.089L193.835 261.757L193.723 260.935L198.646 260.267L198.758 261.089ZM188.913 262.425L183.99 263.093L183.878 262.271L188.801 261.603L188.913 262.425ZM179.068 263.761L174.145 264.429L174.033 263.607L178.956 262.939L179.068 263.761ZM169.223 265.097L164.3 265.765L164.188 264.944L169.111 264.275L169.223 265.097ZM159.377 266.433L154.454 267.102L154.343 266.28L159.266 265.612L159.377 266.433ZM149.532 267.77L144.609 268.438L144.498 267.616L149.421 266.948L149.532 267.77ZM139.687 269.106L134.765 269.774L134.654 268.952L139.576 268.284L139.687 269.106ZM282.482 249.604L282.245 248.81C283.767 248.356 285.153 247.509 286.256 246.36L286.853 246.933C285.651 248.186 284.139 249.109 282.482 249.604ZM129.673 269.49C128.024 268.966 126.528 268.017 125.346 266.748L125.952 266.184C127.037 267.35 128.411 268.22 129.924 268.701L129.673 269.49ZM289.347 242.457L288.544 242.253C288.841 241.099 288.908 239.911 288.747 238.72L288.579 237.485L289.399 237.373L289.567 238.609C289.742 239.906 289.669 241.202 289.347 242.457ZM122.927 262.233C122.851 261.911 122.789 261.58 122.744 261.249L122.205 257.279L123.026 257.167L123.565 261.138C123.606 261.443 123.663 261.747 123.733 262.042L122.927 262.233ZM288.73 232.451L287.91 232.562L287.242 227.64L288.062 227.529L288.73 232.451ZM122.358 252.245L121.537 252.357L120.869 247.435L121.69 247.323L122.358 252.245ZM287.394 222.605L286.574 222.716L285.906 217.794L286.726 217.683L287.394 222.605ZM121.022 242.4L120.201 242.512L119.533 237.589L120.353 237.478L121.022 242.4ZM286.058 212.761L285.238 212.872L284.57 207.949L285.39 207.838L286.058 212.761ZM119.685 232.555L118.865 232.666L118.197 227.744L119.017 227.633L119.685 232.555ZM284.722 202.915L283.902 203.027L283.234 198.104L284.054 197.993L284.722 202.915ZM118.349 222.709L117.529 222.82L116.861 217.898L117.681 217.787L118.349 222.709ZM283.386 193.07L282.566 193.181L281.898 188.259L282.718 188.147L283.386 193.07ZM117.013 212.865L116.193 212.976L115.525 208.053L116.345 207.942L117.013 212.865ZM282.05 183.225L281.229 183.336L280.561 178.414L281.382 178.303L282.05 183.225ZM115.677 203.019L114.857 203.131L114.189 198.209L115.009 198.097L115.677 203.019ZM280.713 173.38L279.893 173.491L279.225 168.569L280.045 168.458L280.713 173.38ZM114.341 193.174L113.521 193.286L112.852 188.363L113.673 188.251L114.341 193.174ZM279.377 163.535L278.557 163.646L277.889 158.724L278.709 158.613L279.377 163.535ZM113.005 183.329L112.184 183.441L111.516 178.518L112.337 178.407L113.005 183.329ZM278.041 153.69L277.221 153.801L276.553 148.878L277.373 148.767L278.041 153.69ZM111.669 173.485L110.848 173.596L110.18 168.673L111 168.562L111.669 173.485ZM276.705 143.845L275.885 143.956L275.217 139.034L276.037 138.923L276.705 143.845ZM110.332 163.64L109.512 163.751L108.844 158.828L109.664 158.717L110.332 163.64ZM275.369 133.999L274.549 134.111L273.881 129.188L274.701 129.076L275.369 133.999ZM108.996 153.794L108.176 153.905L107.508 148.982L108.328 148.871L108.996 153.794ZM274.033 124.154L273.213 124.266L272.544 119.343L273.365 119.231L274.033 124.154ZM107.66 143.949L106.84 144.06L106.172 139.137L106.992 139.026L107.66 143.949ZM272.697 114.309L271.876 114.421L271.208 109.499L272.029 109.387L272.697 114.309ZM106.324 134.104L105.504 134.215L104.836 129.293L105.656 129.181L106.324 134.104ZM271.361 104.465L270.54 104.576L269.872 99.653L270.692 99.5417L271.361 104.465ZM104.988 124.259L104.168 124.371L103.499 119.448L104.32 119.336L104.988 124.259ZM270.024 94.6188L269.204 94.7302L268.536 89.8073L269.356 89.696L270.024 94.6188ZM103.652 114.414L102.831 114.525L102.163 109.602L102.983 109.491L103.652 114.414ZM268.688 84.7739L267.868 84.8853L267.2 79.9624L268.02 79.8511L268.688 84.7739ZM102.315 104.569L101.495 104.68L100.827 99.7571L101.647 99.6458L102.315 104.569ZM267.352 74.929L266.532 75.0404L265.864 70.1175L266.684 70.0062L267.352 74.929ZM100.979 94.7237L100.159 94.835L99.491 89.9122L100.311 89.8009L100.979 94.7237ZM266.016 65.0841L265.196 65.1955L264.528 60.2734L265.348 60.1621L266.016 65.0841ZM99.6432 84.8788L98.823 84.9901L98.1549 80.0673L98.9751 79.9559L99.6432 84.8788ZM264.68 55.2384L263.859 55.3497L263.191 50.4269L264.012 50.3156L264.68 55.2384ZM98.307 75.0331L97.4868 75.1444L96.8187 70.2216L97.6389 70.1102L98.307 75.0331ZM263.344 45.3935L262.523 45.5048L261.855 40.582C261.773 39.9729 261.63 39.3728 261.43 38.7968L262.213 38.5264C262.43 39.1543 262.585 39.8076 262.675 40.4716L263.343 45.3936L263.344 45.3935ZM96.9709 65.1882L96.1507 65.2995L95.8537 63.1112C95.7239 62.1548 95.7308 61.1906 95.874 60.2439L96.6933 60.3682C96.5617 61.2362 96.5555 62.1216 96.6747 62.9998L96.9717 65.1881L96.9709 65.1882ZM258.81 34.8954C257.613 33.8417 256.16 33.1126 254.608 32.7858L254.778 31.9757C256.47 32.332 258.053 33.1273 259.357 34.2747L258.81 34.8954ZM98.5622 56.0554L97.9111 55.5439C98.9843 54.1773 100.397 53.1076 101.994 52.451L102.309 53.2165C100.843 53.8192 99.5465 54.8009 98.5622 56.0554ZM249.815 32.8972L244.893 33.5652L244.781 32.745L249.703 32.077L249.815 32.8972ZM239.97 34.2333L235.048 34.9013L234.936 34.0811L239.858 33.4131L239.97 34.2333ZM230.125 35.5694L225.203 36.2374L225.091 35.4172L230.013 34.7492L230.125 35.5694ZM220.28 36.9055L215.358 37.5735L215.246 36.7533L220.169 36.0853L220.28 36.9055ZM210.434 38.2418L205.512 38.9098L205.401 38.0896L210.323 37.4216L210.434 38.2418ZM200.589 39.5779L195.667 40.2459L195.556 39.4257L200.478 38.7577L200.589 39.5779ZM190.744 40.914L185.822 41.582L185.711 40.7618L190.633 40.0938L190.744 40.914ZM180.899 42.2501L175.977 42.9181L175.866 42.0979L180.788 41.4299L180.899 42.2501ZM171.055 43.5863L166.132 44.2544L166.02 43.4342L170.943 42.766L171.055 43.5863ZM161.209 44.9225L156.287 45.5905L156.176 44.7703L161.098 44.1023L161.209 44.9225ZM151.364 46.2586L146.442 46.9266L146.331 46.1064L151.253 45.4384L151.364 46.2586ZM141.519 47.5947L136.596 48.2628L136.485 47.4426L141.408 46.7745L141.519 47.5947ZM131.674 48.9308L126.752 49.5988L126.641 48.7786L131.563 48.1106L131.674 48.9308ZM121.829 50.267L116.906 50.9351L116.795 50.1149L121.718 49.4468L121.829 50.267ZM111.984 51.6032L107.061 52.2713L106.949 51.4511L111.872 50.783L111.984 51.6032Z"
                                fill="#CCB395" />
                            <g ref="filesBackRef">
                                <path
                                    d="M94.1185 61.1496L240.999 41.2155C246.048 40.5294 250.696 44.0684 251.381 49.1186L278.272 247.255C278.957 252.305 275.421 256.954 270.371 257.64L123.491 277.574C118.442 278.259 113.792 274.72 113.106 269.671L86.2157 71.5343C85.5304 66.4844 89.0693 61.8349 94.1185 61.1496Z"
                                    stroke="#FFFCF6" stroke-width="0.842866" />
                            </g>
                            <g ref="filesMidRef">
                                <path
                                    d="M76.4261 71.967L223.306 52.0329C228.356 51.3468 233.003 54.8858 233.689 59.9359L260.579 258.073C261.265 263.123 257.728 267.772 252.679 268.457L105.799 288.391C100.749 289.076 96.0991 285.538 95.4139 280.488L68.5234 82.3517C67.838 77.3018 71.3769 72.6523 76.4261 71.967Z"
                                    fill="#0B2132" stroke="#FFFCF6" stroke-width="0.842866" />
                            </g>
                            <path
                                d="M117.392 205.046C119.514 205.459 121.738 205.547 124.002 205.27C130.859 204.428 136.547 200.399 139.76 194.85C141.989 191.002 143.027 186.425 142.443 181.674C142.385 181.202 142.312 180.732 142.225 180.272C141.827 178.18 141.127 176.213 140.18 174.408C136.205 166.834 127.841 162.13 118.848 163.232C114.003 163.825 109.744 166.011 106.527 169.202C102.032 173.657 99.575 180.066 100.406 186.83C101.551 196.174 108.621 203.347 117.392 205.046ZM105.663 186.184C105.046 181.149 106.859 176.376 110.183 173.041C112.604 170.609 115.824 168.942 119.491 168.492C126.232 167.665 132.504 171.193 135.485 176.872L135.49 176.879C136.199 178.23 136.72 179.703 137.02 181.269C137.085 181.614 137.139 181.965 137.184 182.321C137.62 185.883 136.839 189.313 135.17 192.196C132.762 196.359 128.498 199.381 123.357 200.011C121.659 200.22 119.991 200.152 118.399 199.843C111.826 198.57 106.524 193.193 105.663 186.184Z"
                                fill="#F5F5F5" />
                            <path
                                d="M135.171 192.196L139.76 194.849C136.546 200.399 130.858 204.429 124.002 205.27C121.738 205.548 119.515 205.457 117.391 205.046L118.401 199.842C119.993 200.151 121.66 200.219 123.357 200.01C128.497 199.38 132.761 196.358 135.171 192.196Z"
                                fill="#B3BCBB" />
                            <path
                                d="M137.018 181.268L142.223 180.271C142.311 180.731 142.384 181.201 142.442 181.673C143.025 186.425 141.986 191.002 139.759 194.848L135.17 192.195C136.84 189.313 137.619 185.881 137.181 182.319C137.139 181.964 137.084 181.614 137.018 181.268Z"
                                fill="#D1DAD9" />
                            <path
                                d="M137.019 181.268C136.721 179.702 136.198 178.229 135.49 176.878L135.485 176.87L140.179 174.406C141.127 176.211 141.826 178.179 142.224 180.27L137.019 181.268Z"
                                fill="#ADBDBB" />
                            <path
                                d="M106.526 169.201C109.743 166.01 114.002 163.825 118.847 163.231C127.839 162.129 136.203 166.834 140.179 174.407L135.49 176.878L135.485 176.87C132.503 171.191 126.232 167.663 119.491 168.49C115.823 168.941 112.604 170.608 110.183 173.04L106.526 169.201Z"
                                fill="#D1DAD9" />
                            <g opacity="0.82">
                                <path
                                    d="M178.535 142.402L100.382 153.008C96.4763 153.539 92.8682 150.793 92.3381 146.887L85.0452 93.1503C84.5151 89.245 87.2609 85.637 91.1669 85.1068L169.319 74.5002C173.225 73.9702 176.834 76.7158 177.364 80.6211L184.656 134.358C185.187 138.264 182.44 141.872 178.535 142.402ZM91.2337 85.5991C87.5992 86.0924 85.0444 89.4505 85.5376 93.0843L92.8305 146.821C93.3237 150.454 96.6811 153.01 100.316 152.517L178.468 141.91C182.102 141.417 184.658 138.06 184.164 134.425L176.871 80.6887C176.378 77.055 173.02 74.4994 169.386 74.9925L91.2337 85.5991Z"
                                    fill="#FFFCF6" />
                            </g>
                            <path
                                d="M209.625 90.5624L200.886 91.7484C198.973 92.008 197.205 90.6634 196.946 88.7507L195.76 80.012C195.5 78.0993 196.846 76.3322 198.758 76.0726L207.497 74.8866C209.41 74.627 211.178 75.9716 211.437 77.8843L212.623 86.623C212.883 88.5357 211.538 90.3027 209.625 90.5624ZM198.847 76.7203C197.291 76.9314 196.198 78.3681 196.409 79.9239L197.595 88.6626C197.806 90.2176 199.243 91.3116 200.799 91.1005L209.537 89.9145C211.093 89.7034 212.187 88.2667 211.975 86.7109L210.789 77.9722C210.578 76.4172 209.142 75.3231 207.586 75.5343L198.847 76.7203Z"
                                fill="#CCB395" />
                            <path
                                d="M212.448 111.369L203.71 112.555C201.797 112.815 200.029 111.47 199.77 109.557L198.584 100.819C198.324 98.9059 199.669 97.1388 201.582 96.8792L210.321 95.6933C212.234 95.4337 214.001 96.7782 214.261 98.691L215.447 107.43C215.706 109.342 214.362 111.109 212.448 111.369ZM201.671 97.5269C200.115 97.7381 199.022 99.1747 199.233 100.731L200.419 109.469C200.63 111.024 202.067 112.118 203.622 111.907L212.361 110.721C213.917 110.51 215.01 109.073 214.799 107.518L213.613 98.7789C213.402 97.2239 211.965 96.1298 210.41 96.3409L201.671 97.5269Z"
                                fill="#CCB395" />
                            <path
                                d="M215.228 131.851L206.489 133.037C204.753 133.273 203.153 132.056 202.917 130.319L201.731 121.58C201.496 119.843 202.713 118.245 204.449 118.009L213.188 116.823C214.925 116.587 216.524 117.805 216.759 119.541L217.945 128.28C218.182 130.017 216.965 131.615 215.228 131.851Z"
                                fill="#CCB395" />
                            <path
                                d="M209.813 128.305L205.564 125.508C205.216 125.279 205.119 124.811 205.348 124.462C205.578 124.113 206.046 124.017 206.395 124.246L209.399 126.224L212.65 121.43C212.885 121.085 213.354 120.995 213.699 121.229C214.044 121.463 214.135 121.933 213.901 122.278L209.813 128.305Z"
                                fill="#F3F3F3" />
                            <path
                                d="M151.952 159.814L218.017 150.848C219.409 150.659 220.691 151.635 220.88 153.027L221.232 155.614C221.42 157.006 220.445 158.288 219.053 158.477L152.988 167.444C151.596 167.633 150.314 166.657 150.125 165.265L149.773 162.677C149.585 161.285 150.56 160.003 151.952 159.814Z"
                                stroke="#CCB395" stroke-width="0.842866" />
                            <path
                                d="M221.164 174.045L155.099 183.011C153.252 183.262 151.547 181.964 151.296 180.117L150.945 177.529C150.694 175.682 151.992 173.977 153.839 173.726L219.904 164.76C221.751 164.509 223.456 165.807 223.707 167.654L224.058 170.242C224.31 172.088 223.011 173.794 221.164 174.045ZM153.95 174.545C152.556 174.735 151.576 176.023 151.765 177.418L152.116 180.006C152.305 181.399 153.594 182.38 154.988 182.191L221.053 173.225C222.447 173.035 223.427 171.747 223.238 170.353L222.887 167.765C222.698 166.371 221.41 165.39 220.015 165.579L153.95 174.545Z"
                                fill="#D1DAD9" />
                            <path
                                d="M223.319 189.921L157.254 198.887C155.407 199.138 153.701 197.84 153.451 195.994L153.1 193.406C152.849 191.56 154.147 189.853 155.994 189.602L222.059 180.636C223.906 180.386 225.611 181.684 225.862 183.531L226.213 186.119C226.464 187.965 225.166 189.671 223.319 189.921ZM156.105 190.423C154.711 190.613 153.731 191.901 153.92 193.296L154.271 195.884C154.46 197.277 155.749 198.258 157.143 198.069L223.208 189.103C224.602 188.913 225.582 187.625 225.393 186.231L225.042 183.643C224.853 182.249 223.565 181.268 222.17 181.457L156.105 190.423Z"
                                fill="#D1DAD9" />
                            <path
                                d="M226.174 202.239L160.109 211.205C158.262 211.456 156.556 210.158 156.306 208.312L155.955 205.724C155.704 203.877 157.002 202.171 158.849 201.92L224.914 192.954C226.76 192.703 228.466 194.002 228.717 195.849L229.068 198.437C229.319 200.283 228.021 201.988 226.174 202.239ZM158.96 202.741C157.566 202.93 156.586 204.219 156.775 205.614L157.126 208.201C157.315 209.595 158.604 210.576 159.998 210.387L226.063 201.42C227.457 201.231 228.437 199.943 228.248 198.549L227.897 195.961C227.708 194.567 226.42 193.586 225.025 193.775L158.96 202.741Z"
                                fill="#D1DAD9" />
                            <path
                                d="M228.041 214.553L161.976 223.519C160.129 223.77 158.423 222.472 158.173 220.626L157.822 218.038C157.571 216.191 158.869 214.485 160.716 214.234L226.781 205.268C228.628 205.017 230.333 206.316 230.584 208.163L230.935 210.751C231.187 212.597 229.888 214.302 228.041 214.553ZM160.827 215.055C159.433 215.244 158.453 216.533 158.642 217.928L158.993 220.515C159.182 221.909 160.471 222.89 161.865 222.701L227.93 213.734C229.324 213.545 230.304 212.257 230.115 210.863L229.764 208.275C229.575 206.881 228.287 205.9 226.892 206.089L160.827 215.055Z"
                                fill="#D1DAD9" />
                            <path
                                d="M229.909 226.867L163.843 235.833C161.997 236.084 160.291 234.786 160.041 232.94L159.689 230.352C159.439 228.506 160.737 226.799 162.583 226.548L228.649 217.582C230.495 217.332 232.201 218.63 232.452 220.477L232.803 223.065C233.054 224.911 231.755 226.617 229.909 226.867ZM162.695 227.369C161.301 227.559 160.32 228.847 160.51 230.242L160.861 232.83C161.05 234.223 162.339 235.204 163.732 235.015L229.798 226.049C231.192 225.859 232.172 224.571 231.983 223.177L231.632 220.589C231.442 219.195 230.155 218.214 228.76 218.403L162.695 227.369Z"
                                fill="#D1DAD9" />
                            <path
                                d="M231.776 239.181L165.711 248.147C163.864 248.398 162.158 247.1 161.908 245.254L161.557 242.666C161.306 240.82 162.604 239.113 164.451 238.862L230.516 229.896C232.363 229.646 234.068 230.944 234.319 232.791L234.67 235.379C234.921 237.225 233.623 238.931 231.776 239.181ZM164.562 239.683C163.168 239.873 162.188 241.161 162.377 242.556L162.728 245.144C162.917 246.537 164.206 247.518 165.6 247.329L231.665 238.363C233.059 238.173 234.039 236.885 233.85 235.491L233.499 232.903C233.31 231.509 232.022 230.528 230.627 230.717L164.562 239.683Z"
                                fill="#D1DAD9" />
                        </svg>

                    </div>
                    <!-- Stat bottom-left -->
                    <div class="flex-shrink-0 flex flex-col items-end sm:block">
                        <span class="text-[48px] sm:text-[80px] font-semibold text-[#D1DAD9] leading-none mb-[16px]">{{
                            blok.stats[3].value
                        }}</span>
                        <p class="text-white text-[14px] sm:w-full w-[173px] sm:text-ui font-light">{{
                            blok.stats[3].label }}</p>
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>
