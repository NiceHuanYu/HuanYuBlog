# HuanYu Blog

个人博客，记录技术笔记、工具用法与阅读心得。

线上地址：<https://blog.huanyu666.top>

## 技术栈

- **Nuxt 4** + **Nuxt Content**（Markdown 存 SQLite）
- **Tailwind CSS v4**
- 部署在 **Cloudflare Pages**

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
```

## 写文章

在 `content/posts/` 下新建 Markdown 文件即可，会自动出现在文章列表和首页。

```yaml
---
title: 文章标题
description: 一句话摘要，会用在列表和搜索结果里
date: 2026-10-06
category: 工具
tags: [Git, 入门]
---
```

可选字段：

| 字段 | 说明 |
| --- | --- |
| `series` + `seriesOrder` | 系列名和阅读顺序，两个要一起写 |
| `cover` | 自定义封面；不写会按文件路径自动分配一张默认封面 |
| `featured` | 设为 `true` 才会出现在首页的「精选文章」 |

`category` 不写会归到「未分类」；`tags` 和 `series` 不写则不参与对应的分组视图。

## 构建与部署

```bash
npm run generate   # 生成静态站点到 .output/public
```

Cloudflare Pages 配置：构建命令 `npm run generate`，输出目录 `.output/public`。

> 不要用 `npm run build` —— 它产出的是需要 Node 服务的 SSR 版本，静态托管会 404。

## 图片来源

`public/images/git-branches.png` 来自 [Pro Git](https://git-scm.com/book)（CC BY 3.0）。
