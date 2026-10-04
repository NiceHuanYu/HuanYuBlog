import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/** 带图标的条目标（我的日常 / 兴趣爱好），icon 名字对应 AppIcon 里的图标 */
const iconItem = z.object({
  text: z.string(),
  icon: z.string().default('code')
})

export default defineContentConfig({
  collections: {
    // 文章：content/posts/ 下的 Markdown
    posts: defineCollection({
      type: 'page',
      source: 'posts/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        // 没写分类的文章统一落到「未分类」，保证分类视图里不会漏掉文章
        category: z.string().default('未分类'),
        tags: z.array(z.string()).default([]),
        // 系列名 + 系列内的顺序（从 1 开始），两个一起写才生效
        series: z.string().optional(),
        seriesOrder: z.number().optional(),
        cover: z.string().optional(),
        featured: z.boolean().default(false)
      })
    }),

    // 独立页面：content/ 根目录下的 Markdown（about.md、contact.md）
    pages: defineCollection({
      type: 'page',
      source: '*.md',
      schema: z.object({
        title: z.string(),
        name: z.string().optional(),
        // 头像图片地址，放在 public/ 下；留空则回退到名字首字
        avatar: z.string().optional(),
        role: z.string().optional(),
        tagline: z.string().optional(),
        location: z.string().optional(),
        skills: z.array(z.string()).default([]),
        daily: z.array(iconItem).default([]),
        interests: z.array(iconItem).default([]),
        contacts: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              href: z.string(),
              icon: z.string().default('mail'),
              // 卡片按钮上的文字，如「发送邮件」
              action: z.string().optional(),
              // 图标底色，取值见 ContactCard.vue 里的 ACCENTS
              accent: z.string().default('slate')
            })
          )
          .default([])
      })
    })
  }
})
