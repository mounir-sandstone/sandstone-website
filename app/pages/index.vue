<script setup>
const storyblokApi = useStoryblokApi()

const { data: story } = await useAsyncData('story-home', async () => {
  try {
    const { data } = await storyblokApi.get('cdn/stories/home', { version: 'draft' })
    return data.story
  } catch {
    return null
  }
})

const hasStoryBody = computed(() => {
  return Array.isArray(story.value?.content?.body) && story.value.content.body.length > 0
})

const placeholder = (seed) => ({
  filename: `https://picsum.photos/seed/${seed}/1200/900`,
})

const fallbackHome = {
  hero: {
    _uid: 'fallback-hero',
    component: 'Hero',
    Eyebrow: '',
    Title: 'We don’t sell deliverables. We design creative systems that evolve, learn, and scale.',
    Description:
      'Sandstone brings together what growth pulls apart by connecting strategy, brand, technology, marketing and AI into one system built for clarity, speed and scalable performance.',
    actions: [
      {
        _uid: 'hero-action-primary',
        component: 'button',
        label: 'Reach out',
        style: 'Primary',
        link: { cached_url: '/contact', url: '/contact' },
      },
      {
        _uid: 'hero-action-secondary',
        component: 'button',
        label: 'Browse our work',
        style: 'Secondary',
        link: { cached_url: '/work', url: '/work' },
      },
    ],
  },
  globalPresence: {
    _uid: 'fallback-global',
    component: 'global_presence',
    tag: 'Global presence',
    heading: 'Operating as one. Across three strategic hubs.',
    description:
      'From Dubai to Europe and North America, we build close partnerships and execute with speed across markets.',
    cta_label: 'Reach out',
    cta_link: { cached_url: '/contact', url: '/contact' },
    locations: [
      { _uid: 'loc1', name: 'United Arab Emirates', image: placeholder('uae') },
      { _uid: 'loc2', name: 'Belgium', image: placeholder('belgium') },
      { _uid: 'loc3', name: 'United States', image: placeholder('usa') },
    ],
  },
  impact: {
    _uid: 'fallback-impact',
    component: 'our_impact',
    tag: 'Our impact',
    heading: 'Operating globally with measurable impact.',
    stats: [
      { _uid: 's1', value: '75+', label: 'Experts across strategy, product and technology' },
      { _uid: 's2', value: '120M+', label: 'Annual user interactions powered by our platforms' },
      { _uid: 's3', value: '17+', label: 'Markets served across EMEA and North America' },
      { _uid: 's4', value: '250+', label: 'Successful launches delivered to date' },
    ],
  },
  trustedBy: {
    _uid: 'fallback-trusted',
    component: 'trusted_by',
    heading: 'Trusted by brands that scale boldly',
    logos: [
      { _uid: 'l1', name: 'CheckIn', image: placeholder('logo1') },
      { _uid: 'l2', name: 'Interwell', image: placeholder('logo2') },
      { _uid: 'l3', name: 'Beta ETA', image: placeholder('logo3') },
      { _uid: 'l4', name: 'Evo', image: placeholder('logo4') },
      { _uid: 'l5', name: 'Apex', image: placeholder('logo5') },
      { _uid: 'l6', name: 'Hexa', image: placeholder('logo6') },
      { _uid: 'l7', name: 'Nova', image: placeholder('logo7') },
      { _uid: 'l8', name: 'Ridge', image: placeholder('logo8') },
      { _uid: 'l9', name: 'Shift', image: placeholder('logo9') },
      { _uid: 'l10', name: 'Orbit', image: placeholder('logo10') },
    ],
  },
  selectedWork: {
    _uid: 'fallback-work',
    component: 'selected_work',
    tag: 'Selected work',
    heading: 'Ideas brought to life through strategy, design, and technology.',
    cta_label: 'Explore all case studies',
    cta_link: { cached_url: '/work', url: '/work' },
    items: [
      {
        _uid: 'w1',
        category: 'AI',
        description: 'Built an AI workflow platform that reduced manual process time by 63%.',
        year: '2025',
        project_name: 'Operational Intelligence Platform',
        services: 'Strategy · UX/UI · Engineering',
        image: placeholder('work1'),
        metric_1_value: '63%',
        metric_1_label: 'Process time reduced',
        metric_2_value: '3.4x',
        metric_2_label: 'Faster decision cycles',
      },
      {
        _uid: 'w2',
        category: 'E-commerce',
        description: 'Replatformed commerce journeys with modern architecture and measurable conversion gains.',
        year: '2024',
        project_name: 'Omnichannel Commerce Suite',
        services: 'Product · Platform · Data',
        image: placeholder('work2'),
        metric_1_value: '+39%',
        metric_1_label: 'Conversion growth',
        metric_2_value: '2.1x',
        metric_2_label: 'Checkout speed',
      },
      {
        _uid: 'w3',
        category: 'Fintech',
        description: 'Designed and launched a secure mobile onboarding experience for a regional bank.',
        year: '2026',
        project_name: 'Digital Banking Onboarding',
        services: 'Research · UX · Compliance',
        image: placeholder('work3'),
        metric_1_value: '-42%',
        metric_1_label: 'Drop-off reduction',
        metric_2_value: '12d',
        metric_2_label: 'Time to launch',
      },
      {
        _uid: 'w4',
        category: 'Supply Chain',
        description: 'Unified fragmented systems into one visibility dashboard for logistics operations.',
        year: '2025',
        project_name: 'Control Tower Dashboard',
        services: 'Architecture · Data · Delivery',
        image: placeholder('work4'),
        metric_1_value: '99.8%',
        metric_1_label: 'Data accuracy',
        metric_2_value: '24/7',
        metric_2_label: 'Operational visibility',
      },
    ],
  },
  services: {
    _uid: 'fallback-services',
    component: 'our_services',
    tag: 'Services',
    heading: 'A single partner for everything your digital product needs',
    description: 'From strategy to launch and optimization, our multidisciplinary teams move as one.',
    services: [
      {
        _uid: 'srv1',
        title: 'AI Experiences & Automation',
        description: 'Designing real-world AI products and workflows that improve customer and team outcomes.',
      },
      {
        _uid: 'srv2',
        title: 'UI/UX',
        description: 'Human-centered interfaces crafted for clarity, trust, and conversion at scale.',
      },
      {
        _uid: 'srv3',
        title: 'Web Product Development',
        description: 'Modern, resilient engineering from MVP to enterprise-grade platforms.',
      },
    ],
  },
  approach: {
    _uid: 'fallback-approach',
    component: 'our_approach',
    tag: 'Our approach',
    heading: 'Our Structured Approach to Building Scalable Systems',
    cta_label: 'Let’s design your roadmap',
    cta_link: { cached_url: '/contact', url: '/contact' },
    steps: [
      { _uid: 'a1', label: '01', description: 'We identify your business context, the goals to serve, and what success looks like.' },
      { _uid: 'a2', label: '02', description: 'We shape priorities, roadmap, and systems architecture with all stakeholders.' },
      { _uid: 'a3', label: '03', description: 'We design and build your brand, workflows, and digital experience end to end.' },
      { _uid: 'a4', label: '04', description: 'We optimize, measure performance, and scale continuously with your team.' },
    ],
  },
  insights: {
    _uid: 'fallback-insights',
    component: 'our_insights',
    tag: 'Insights',
    heading: 'Thoughts in progress',
    description: 'Practical ideas, field notes, and frameworks from our cross-functional product work.',
    cta_label: 'Explore everything we publish',
    cta_link: { cached_url: '/insights', url: '/insights' },
    posts: [
      {
        _uid: 'p1',
        title: 'Why human judgment still defines AI product quality',
        date: 'Apr 12, 2026',
        read_time: '7 min read',
        tags: ['AI', 'Strategy'],
        image: placeholder('post1'),
        link: { cached_url: '/insights/human-judgment-ai', url: '/insights/human-judgment-ai' },
      },
      {
        _uid: 'p2',
        title: 'Designing digital experiences that scale in the real world',
        date: 'Mar 25, 2026',
        read_time: '5 min read',
        tags: ['Design', 'Tech'],
        image: placeholder('post2'),
        link: { cached_url: '/insights/experiences-at-scale', url: '/insights/experiences-at-scale' },
      },
      {
        _uid: 'p3',
        title: 'Automation that works: principles for enterprise workflows',
        date: 'Feb 28, 2026',
        read_time: '8 min read',
        tags: ['AI', 'Tech'],
        image: placeholder('post3'),
        link: { cached_url: '/insights/automation-principles', url: '/insights/automation-principles' },
      },
      {
        _uid: 'p4',
        title: 'From idea to launch: reducing risk in digital transformation',
        date: 'Jan 16, 2026',
        read_time: '6 min read',
        tags: ['Strategy'],
        image: placeholder('post4'),
        link: { cached_url: '/insights/reducing-risk-launch', url: '/insights/reducing-risk-launch' },
      },
    ],
  },
  cta: {
    _uid: 'fallback-cta',
    component: 'call_to_action',
    heading: 'Your next move starts here. Make it intentional.',
    description:
      'Let’s shape a digital strategy and product ecosystem that is ready for scale, resilience, and measurable growth.',
    primary_label: 'Reach out',
    primary_link: { cached_url: '/contact', url: '/contact' },
    secondary_label: 'Browse our work',
    secondary_link: { cached_url: '/work', url: '/work' },
  },
}
</script>

<template>
  <StoryblokComponent v-if="story && hasStoryBody" :blok="story.content" />

  <div v-else>
    <Hero :blok="fallbackHome.hero" />
    <GlobalPresence :blok="fallbackHome.globalPresence" />
    <OurImpact :blok="fallbackHome.impact" />
    <TrustedBy :blok="fallbackHome.trustedBy" />
    <SelectedWork :blok="fallbackHome.selectedWork" />
    <OurServices :blok="fallbackHome.services" />
    <OurApproach :blok="fallbackHome.approach" />
    <OurInsights :blok="fallbackHome.insights" />
    <CallToAction :blok="fallbackHome.cta" />
  </div>
</template>
