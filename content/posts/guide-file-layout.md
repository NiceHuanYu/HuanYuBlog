---
title: 文件都放在哪
description: 文章、图片、封面分别放在仓库的什么位置，哪些目录可以放手改、哪些碰了会出问题。
date: 2026-10-08
category: 指南
tags:
  - 写作
  - 目录结构
series: 博客使用指南
seriesOrder: 1
---

写文章之前，先弄清文件该放在哪。这个仓库看着目录不少，但**真正需要你手动改的只有
`content/` 和 `public/` 两个**，其余都是代码，平时不用碰。

## 整体结构

```
HuanYuBlog/
├── content/            ← 你写的东西都在这里
│   ├── posts/          ← 文章
│   ├── about.md        ← 「关于」页
│   └── contact.md      ← 「联系」页
├── public/             ← 原样发布的静态文件
│   ├── images/         ← 文章插图、头像
│   └── covers/         ← 默认封面
├── app/                ← 页面和组件的代码
├── server/             ← 服务端接口
├── nuxt.config.ts      ← 站点配置
└── content.config.ts   ← 内容字段的定义
```

## content/posts/ —— 文章放这里

**在 `content/posts/` 下新建一个 `.md` 文件，就是一篇文章。**

文件名会成为网址的一部分：

```
content/posts/git-install-and-basics.md
        ↓
https://blog.huanyu666.top/posts/git-install-and-basics
```

所以文件名建议用**英文小写加连字符**，别用中文或空格——它会原样出现在链接里。标题写
在文件内部的 `title` 字段，和文件名无关。

文章不需要注册或登记，新建文件后重新构建就会自动出现在文章列表、首页和 sitemap 里。

## content/ 根目录下的两个页面

`about.md` 和 `contact.md` 不是文章，是独立页面，对应 `/about` 和 `/contact`。它们的
字段和文章不太一样（用 `name`、`role`、`skills` 这些），具体可以打开文件看——照着现有
的格式改即可。

## public/images/ —— 图片放这里

需要被文章引用的图片，放在 `public/images/` 下，然后在 Markdown 里用**以 `/` 开头的
绝对路径**引用：

```markdown
![图片说明](/images/git-branches.png)
```

`public/` 下的文件会被原样复制到网站根目录，所以 `/images/xxx.png` 对应的是
`public/images/xxx.png`。

### 图片的两种放法

**放在仓库里**（推荐）：图片文件跟着文章一起提交，自己完全掌控。缺点是仓库会变大。

**直接引用外部地址**：

```markdown
![Git 标志](https://git-scm.com/images/logos/downloads/Git-Logo-2Color.png)
```

省事，但对方一旦改链接或者挂掉，你的图就没了。而且**图是别人服务器上的**，如果是有
版权的素材，这样引用并不等于你有使用权。

### 建议的命名方式

图片名也建议用英文小写加连字符，最好和文章对应上，比如写《Git 安装与基本使用》时用
`git-install-1.png`、`git-install-2.png`。文章多了以后，一看文件名就知道是哪篇在用。

## public/covers/ —— 默认封面

这里放的是**没有指定封面的文章**自动使用的封面。现在有四张，系统会按文章路径算一个
哈希值来分配，所以同一篇文章每次都是同一张，不会乱跳。

想换默认封面：把新的 SVG 放进这个目录，同时要改一下代码里的封面清单。这部分属于
「改代码」，不是日常写作会碰的。

有自己的封面图时，在文章里写 `cover` 字段就行，见下一篇文章。

## 不建议手动改的目录

| 目录 | 为什么 |
| --- | --- |
| `app/` | 页面和组件的代码，改错会让整站报错 |
| `server/` | 服务端接口 |
| `.nuxt/`、`.output/`、`dist/` | 构建产物，每次构建都会重新生成 |
| `.data/` | 本地预览时生成的缓存数据库 |

`.nuxt/`、`.output/`、`.data/` 这些已经在 `.gitignore` 里，不会被提交。

## 小结

日常写作只需要记两条：

1. **文章** → `content/posts/` 下新建 `.md`
2. **图片** → 丢进 `public/images/`，用 `/images/文件名` 引用

下一篇讲文章开头那段 `---` 包起来的字段（frontmatter）每个都是干什么的。
