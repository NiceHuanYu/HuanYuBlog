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
  // 正文里的一级标题也生成可点击的锚点，默认只给 h2~h4
  content: {
    renderer: {
      anchorLinks: { h1: true, h2: true, h3: true, h4: true }
    },
    build: {
      markdown: {
        // 目录收录到 h3。注意底层 @nuxtjs/mdc 把目录的标签列表写死成
        // ["h2"…"h6"]，所以 **h1 永远不会进目录**，改这个 depth 也没用
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          // 这些语言会**追加**到 @nuxt/content 的默认白名单后面
          // （默认只有 bash / html / mdc / vue / yml / scss / ts / typescript）。
          // 白名单外的语言不会报错，只是整块退化成纯文本、完全没有高亮，
          // java 之前就是这样，所以这里补上它和几个以后可能用到的。
          langs: [
            'java',
            'json',
            'yaml',
            'javascript',
            'css',
            'shell',
            'python',
            'xml',
            'properties',
            'diff'
          ]
        }
      }
    }
  },
  sitemap: {
    // 动态路由不会被自动发现，文章和分组详情页由这个接口提供
    sources: ['/api/__sitemap__/urls']
  },
  // 两篇 Java 笔记改过文件名，旧地址 301 到新地址，免得已有外链失效。
  // 大写写法来自历史 sitemap，小写写法来自被规范化过的分享链接。
  routeRules: {
    '/posts/learning-java-FOPJ': { redirect: { to: '/posts/java-basics-notes', statusCode: 301 } },
    '/posts/learning-java-fopj': { redirect: { to: '/posts/java-basics-notes', statusCode: 301 } },
    '/posts/learning-java-OOPJ': { redirect: { to: '/posts/java-oop-notes', statusCode: 301 } },
    '/posts/learning-java-oopj': { redirect: { to: '/posts/java-oop-notes', statusCode: 301 } }
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
