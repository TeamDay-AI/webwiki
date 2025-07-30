import AWS from 'aws-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsRegion || !config.s3BucketName) {
    return {
      success: false,
      message: 'Missing AWS configuration. Check your .env file.'
    }
  }

  const s3 = new AWS.S3({
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
    region: config.awsRegion
  })

  try {
    // Test bucket access by listing objects
    await s3.listObjectsV2({
      Bucket: config.s3BucketName,
      MaxKeys: 1
    }).promise()

    return {
      success: true,
      message: `Successfully connected to S3 bucket '${config.s3BucketName}' in region '${config.awsRegion}'`
    }
  } catch (error: any) {
    return {
      success: false,
      message: `S3 connection failed: ${error.message}`
    }
  }
})