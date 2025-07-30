import AWS from 'aws-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const s3 = new AWS.S3({
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
    region: config.awsRegion
  })

  try {
    const response = await s3.listObjectsV2({
      Bucket: config.s3BucketName,
      Delimiter: '/'
    }).promise()

    const files = response.Contents?.map(item => ({
      key: item.Key,
      name: item.Key?.split('/').pop(),
      lastModified: item.LastModified,
      size: item.Size,
      isFile: !item.Key?.endsWith('/')
    })) || []

    const folders = response.CommonPrefixes?.map(prefix => ({
      key: prefix.Prefix,
      name: prefix.Prefix?.replace('/', ''),
      isFile: false
    })) || []

    return {
      files: [...folders, ...files],
      success: true
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list files from S3'
    })
  }
})