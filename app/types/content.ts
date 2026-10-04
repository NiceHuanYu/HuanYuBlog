/** 列表和卡片里用到的文章字段（不含正文），与 content.config.ts 里的 schema 对应 */
export interface PostSummary {
  path: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  series?: string
  seriesOrder?: number
  cover?: string
  featured?: boolean
}

/** 分组视图（按分类 / 标签 / 系列）里的一组 */
export interface PostGroup {
  name: string
  posts: PostSummary[]
}

/** 分类 / 标签 / 系列的计数结果 */
export interface Counted {
  name: string
  count: number
}

/** 带图标的条目（我的日常 / 兴趣爱好） */
export interface IconItem {
  text: string
  icon: string
}

export interface ContactItem {
  label: string
  value: string
  href: string
  icon: string
  action?: string
  accent: string
}

/** content/ 根目录下独立页面（about.md 是主页面，contact.md 只放联系方式） */
export interface PageProfile {
  title: string
  name?: string
  avatar?: string
  role?: string
  tagline?: string
  location?: string
  skills: string[]
  daily: IconItem[]
  interests: IconItem[]
  contacts: ContactItem[]
}

/** 文章正文里的目录项，对应 body.toc.links */
export interface TocLink {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}
