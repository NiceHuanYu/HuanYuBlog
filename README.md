# 寰宇Actor的技术博客

![博客截图](/screenshot.jpg)

## 项目简介

这是我的个人技术博客，基于 Nuxt4 构建，主要分享 Web 开发、前端技术和 Minecraft 相关的内容。

## 功能特点

- 🚀 基于 Nuxt4 的现代化前端架构
- ✨ 响应式设计，适配各种设备
- 📝 Markdown 文章支持
- 🔍 内置搜索功能
- 🏷️ 文章分类和标签系统
- 📊 阅读量统计
- 💬 评论系统（可选集成）
- 🎨 自定义主题风格

## 项目结构

```
my-blog/
├── assets/             # 静态资源
│   ├── css/            # 全局样式
│   └── images/         # 图片资源
├── components/         # 公共组件
│   ├── BlogHeader.vue  # 头部导航
│   └── BlogFooter.vue  # 底部信息
├── composables/        # 组合式函数
├── content/            # Markdown 文章
├── layouts/            # 布局组件
├── middleware/         # 中间件
├── pages/              # 页面路由
│   ├── about.vue       # 关于页面
│   ├── archive.vue     # 归档页面
│   ├── contact.vue     # 联系页面
│   ├── index.vue       # 首页
│   └── posts/          # 文章目录
├── plugins/            # 插件
├── public/             # 公共文件
├── server/             # 服务器API
├── utils/              # 工具函数
├── app.vue             # 主组件
└── nuxt.config.ts      # Nuxt 配置
```

## 技术栈

- [Nuxt4](https://nuxt.com/) - Vue 框架
- [Vue3](https://vuejs.org/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用工具优先的 CSS 框架
- [Iconify](https://iconify.design/) - 图标库
- [Content Module](https://content.nuxtjs.org/) - Markdown 内容管理

## 安装与运行

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/my-blog.git
cd my-blog
```

2. 安装依赖：

```bash
npm install
# 或
yarn install
```

3. 开发模式运行：

```bash
npm run dev
# 或
yarn dev
```

4. 构建生产版本：

```bash
npm run build
# 或
yarn build
```

5. 启动生产服务器：

```bash
npm run start
# 或
yarn start
```

## 部署

本项目支持多种部署方式：

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fmy-blog)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/my-blog)

### 静态部署

```bash
npm run generate
```

生成的静态文件在 `dist` 目录中。

## 写作指南

1. 在 `content/posts` 目录下创建 Markdown 文件
2. 使用以下 frontmatter 格式：

```markdown
---
title: 文章标题
date: 2023-05-15
category: 技术
tags:
  - Nuxt4
  - Vue3
excerpt: 文章摘要
---

# 文章内容
```

3. 保存后会自动在博客中显示

## 自定义配置

修改 `nuxt.config.ts` 文件中的配置项：

```typescript
export default defineNuxtConfig({
  // 应用元数据
  app: {
    head: {
      title: '寰宇Actor的技术博客',
      meta: [
        { name: 'description', content: '分享Web开发和Minecraft相关内容' }
      ]
    }
  },
  
  // 模块配置
  modules: [
    '@nuxt/content'
  ],
  
  // 其他配置...
})
```

## 贡献

欢迎提交 Pull Request 或 Issue。

## 许可证

MIT License