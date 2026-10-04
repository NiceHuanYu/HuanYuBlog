interface NavItem {
  label: string
  to?: string
  children?: { label: string; to: string }[]
}

export default defineAppConfig({
  site: {
    name: 'HuanYu Blog',
    tagline: '记录技术，也记录思考',
    description: '一个记录技术笔记、工具用法与阅读心得的个人站点。'
  },
  // 顶部导航。「内容」是下拉，后续的分类、标签等入口都挂在这里
  nav: [
    { label: '首页', to: '/' },
    { label: '内容', children: [{ label: '文章', to: '/posts' }] },
    { label: '关于', to: '/about' },
    { label: '联系', to: '/contact' }
  ] satisfies NavItem[],
  // 可选：给指定系列配一张固定封面。不写的话，系列卡片会用该系列文章的
  // 封面自动拼成文件夹视图。例：{ 'Git 入门': '/images/git-series.png' }
  seriesCovers: {} as Record<string, string>
})
