import { defineSitemapEventHandler } from '#imports'

/**
 * 给 sitemap 提供动态路由的 URL。
 *
 * 静态页面（/、/posts、/about、/contact）会被 nuxt:pages 自动发现，
 * 但 /posts/<slug> 和三个分组详情页是动态路由，必须在这里显式列出。
 *
 * 另外注意：Content 的内容默认**不会**自动进 sitemap
 *（v8 之后需要给 collection 挂 sitemap schema），所以文章也一并在这里给。
 */
export default defineSitemapEventHandler(async (event) => {
  const posts = await queryCollection(event, 'posts')
    .select('path', 'date', 'category', 'tags', 'series')
    .all()

  const urls: { loc: string; lastmod?: string; _encoded?: boolean }[] = []

  for (const post of posts) {
    urls.push({ loc: post.path, lastmod: post.date })
  }

  const categories = new Set(posts.map((post) => post.category))
  const tags = new Set(posts.flatMap((post) => post.tags))
  const series = new Set(
    posts.map((post) => post.series).filter((name): name is string => !!name)
  )

  // 分组名可能是中文，需要编码；_encoded 告诉模块不要再编码一次
  const groupUrls: [string, Set<string>][] = [
    ['categories', categories],
    ['tags', tags],
    ['series', series]
  ]

  for (const [segment, names] of groupUrls) {
    for (const name of names) {
      urls.push({
        loc: `/${segment}/${encodeURIComponent(name)}`,
        _encoded: true
      })
    }
  }

  return urls
})
