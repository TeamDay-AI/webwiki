import AWS from 'aws-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path')

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path is required'
    })
  }

  const s3 = new AWS.S3({
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
    region: config.awsRegion
  })

  try {
    // If it's a directory, list its contents
    if (path.endsWith('/') || !path.includes('.')) {
      const dirPath = path.endsWith('/') ? path : `${path}/`
      
      const response = await s3.listObjectsV2({
        Bucket: config.s3BucketName,
        Prefix: dirPath,
        Delimiter: '/'
      }).promise()

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
    const response = await s3.getObject({
      Bucket: config.s3BucketName,
      Key: path
    }).promise()

    const content = response.Body?.toString('utf-8') || ''

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