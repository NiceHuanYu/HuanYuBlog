// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css:[
    'prismjs/themes/prism-tomorrow.css',
    '@/assets/css/code.css',
    '@/assets/css/main.css'
  ],
})
