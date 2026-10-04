/**
 * 封面解析：文章自己带了 cover 就用它，没带就从默认封面里稳定地挑一张。
 *
 * 默认封面是 public/covers/ 下的一组 SVG，新增封面文件时同步扩下面的数组即可。
 */

const DEFAULT_COVERS = [
  '/covers/default-01.svg',
  '/covers/default-02.svg',
  '/covers/default-03.svg',
  '/covers/default-04.svg'
]

/**
 * 解析封面地址。seed 传文章 slug，保证同一篇文章每次都拿到同一张默认封面，
 * 不会因为刷新或者构建顺序变化而换图。
 */
export function resolveCover(cover: string | undefined, seed: string): string {
  if (cover) {
    return cover
  }

  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return DEFAULT_COVERS[hash % DEFAULT_COVERS.length] ?? DEFAULT_COVERS[0]!
}
