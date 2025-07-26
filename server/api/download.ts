// /server/api/download.ts
import { minecraftResources } from '~/data/MinecraftResources'
import { sendStream } from 'h3'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  const resource = minecraftResources.find(r => r.id === Number(id))
  
  if (!resource) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found'
    })
  }
  
  // 注意：这里假设文件存放在public/downloads目录下
  const filePath = `public${resource.filePath}`
  
  if (!fs.existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found'
    })
  }
  
  // 更新下载计数（在实际应用中应该持久化到数据库）
  resource.downloads++
  
  // 返回文件流
  return sendStream(event, fs.createReadStream(filePath))
})