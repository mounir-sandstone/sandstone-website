import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";

// Enable Storyblok Bridge only when explicitly requested via env var.
const useBridge = process.env.STORYBLOK_BRIDGE === 'true';

export default defineNuxtConfig({
  srcDir: 'app/',  // ← tells Nuxt to look in app/ for pages, components, layouts etc.

  compatibilityDate: "2026-02-15",
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],  // ~ now resolves to app/ automatically

  modules: ["@storyblok/nuxt"],

  storyblok: {
    accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
    bridge: useBridge,
    devtools: true,
    componentsDir: '~/storyblok',  // ~ resolves to app/storyblok
    apiOptions: {
      region: process.env.STORYBLOK_REGION || "eu",
      endpoint: process.env.STORYBLOK_API_BASE_URL
        ? `${new URL(process.env.STORYBLOK_API_BASE_URL).origin}/v2`
        : undefined,
    },
  },

  app: {
    head: {
      link: useBridge
        ? [
          {
            rel: "stylesheet",
            href: "https://a.storyblok.com/f/212319/x/e6ccda03b8/blueprint-blank.css",
          },
        ]
        : [],
    },
  },

  ssr: true,

  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  vite: {
    plugins: [
      mkcert(),
      tailwindcss(),
    ],
  },
});