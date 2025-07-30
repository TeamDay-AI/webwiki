import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path')

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path is required'
    })
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion
  })

  try {
    // If it's a directory, list its contents
    if (path.endsWith('/') || !path.includes('.')) {
      const dirPath = path.endsWith('/') ? path : `${path}/`
      
      const command = new ListObjectsV2Command({
        Bucket: config.s3BucketName,
        Prefix: dirPath,
        Delimiter: '/'
      })
      
      const response = await s3Client.send(command)

      const files = response.Contents?.map(item => ({
        key: item.Key,
        name: item.Key?.replace(dirPath, ''),
        lastModified: item.LastModified,
        size: item.Size,
        isFile: !item.Key?.endsWith('/')
      })).filter(item => item.name && item.name !== '') || []

      const folders = response.CommonPrefixes?.map(prefix => ({
        key: prefix.Prefix,
        name: prefix.Prefix?.replace(dirPath, '').replace('/', ''),
        isFile: false
      })) || []

      return {
        files: [...folders, ...files],
        success: true,
        type: 'directory'
      }
    }

    // If it's a file, get its content
    const command = new GetObjectCommand({
      Bucket: config.s3BucketName,
      Key: path
    })
    
    const response = await s3Client.send(command)
    const content = await response.Body?.transformToString('utf-8') || ''

    return {
      content,
      success: true,
      type: 'file',
      lastModified: response.LastModified,
      path
    }
  } catch (error: any) {
    if (error.code === 'NoSuchKey') {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve file from S3'
    })
  }
})