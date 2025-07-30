import AWS from 'aws-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path')
  const body = await readBody(event)

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path is required'
    })
  }

  if (!body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File content is required'
    })
  }

  const s3 = new AWS.S3({
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
    region: config.awsRegion
  })

  try {
    await s3.putObject({
      Bucket: config.s3BucketName,
      Key: path,
      Body: body.content,
      ContentType: 'text/markdown'
    }).promise()

    return {
      success: true,
      path,
      message: 'File saved successfully'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save file to S3'
    })
  }
})