import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // sitemap 需要把相对路径解析成绝对 URL，这里是实际部署的域名
  site: {
    url: 'https://blog.huanyu666.top'
  },
  modules: ['@nuxt/content', '@nuxtjs/color-mode', '@nuxtjs/sitemap'],
  css: ['~/assets/css/main.css'],
  sitemap: {
    // 动态路由不会被自动发现，文章和分组详情页由这个接口提供
    sources: ['/api/__sitemap__/urls']
  },
  // 开发机是 VMware 虚拟机，浏览器在宿主机上，所以要监听所有网卡，
  // 只绑 127.0.0.1 的话宿主机访问不到。局域网内其他机器同样能访问，介意时改回 'localhost'。
  devServer: {
    host: '0.0.0.0'
  },
  colorMode: {
    // Tailwind 的 `dark:` 变体匹配的是裸 `.dark` class，不能带后缀
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
