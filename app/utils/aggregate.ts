import type { PostGroup, PostSummary } from '~/types/content'

/**
 * 按发布月份分组，用于精选文章视图。月份从新到旧排。
 * 注意返回的 name 是展示用的中文月份，不是可用于 URL 的标识。
 */
export function groupByMonth(posts: PostSummary[]): PostGroup[] {
  const groups = new Map<string, PostSummary[]>()

  for (const post of posts) {
    // date 是 "YYYY-MM-DD"，前 7 位就是月份
    const month = post.date.slice(0, 7)
    const list = groups.get(month)
    if (list) {
      list.push(post)
    } else {
      groups.set(month, [post])
    }
  }

  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, monthPosts]) => {
      const [year, monthNumber] = month.split('-')
      return {
        name: `${year} 年 ${Number(monthNumber)} 月`,
        posts: monthPosts
      }
    })
}

/**
 * 把文章按某个字段分成若干组，用于 /posts 的分类 / 标签 / 系列视图，
 * 以及首页的系列卡片。
 * pick 返回数组，所以一篇文章可以同时落进多个组（标签就是这种情况）；
 * 返回空数组表示这篇不参与分组（没写标签或系列）。
 * 组按名称排序（中文按拼音），组内保持传入顺序——也就是调用方排好的时间倒序。
 */
export function groupPosts(
  posts: PostSummary[],
  pick: (post: PostSummary) => string[]
): PostGroup[] {
  const groups = new Map<string, PostSummary[]>()

  for (const post of posts) {
    for (const name of pick(post)) {
      if (!name) {
        continue
      }
      const list = groups.get(name)
      if (list) {
        list.push(post)
      } else {
        groups.set(name, [post])
      }
    }
  }

  return [...groups.entries()]
    .map(([name, groupPosts]) => ({ name, posts: groupPosts }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
}
