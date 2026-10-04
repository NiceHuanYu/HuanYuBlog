interface PageSeoInput {
  /** 完整页面标题，是否带站名由调用方决定 */
  title: string
  description?: string
  type?: 'website' | 'article'
  /** 社交分享图，可以是 public 下的相对路径 */
  image?: string
  /** 设为 true 表示不希望这个页面被搜索引擎收录（关于、联系这类页） */
  noindex?: boolean
}

/**
 * 统一设置 title / description / canonical / Open Graph。
 * 没传 description 时回落到站点描述，og:site_name 这类固定字段也在这里补齐，
 * 免得每个页面各写一遍。
 */
export function usePageSeo(input: PageSeoInput) {
  const appConfig = useAppConfig()
  const site = useSiteConfig()
  const requestURL = useRequestURL()

  const description = input.description ?? appConfig.site.description

  // og:image 必须是绝对地址，相对路径用当前请求的 origin 补全
  const image = input.image
    ? /^https?:\/\//.test(input.image)
      ? input.image
      : new URL(input.image, requestURL.origin).href
    : undefined

  // canonical 固定指向正式域名：Cloudflare Pages 每次部署都会生成一个
  // hash.project.pages.dev 预览域名，内容完全一样。声明 canonical 后，
  // 即使预览域名被抓到，权重也会归到正式站点。
  const canonical = site.url
    ? new URL(requestURL.pathname, site.url).href
    : requestURL.href

  useSeoMeta({
    title: input.title,
    description,
    ogTitle: input.title,
    ogDescription: description,
    ogType: input.type ?? 'website',
    ogSiteName: appConfig.site.name,
    ogUrl: canonical,
    ogLocale: 'zh_CN',
    ogImage: image,
    twitterCard: image ? 'summary_large_image' : 'summary',
    robots: input.noindex ? 'noindex, nofollow' : undefined
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }]
  })
}
