import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsRegion || !config.s3BucketName) {
    return {
      success: false,
      message: 'Missing AWS configuration. Check your .env file.'
    }
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion
  })

  try {
    // Test bucket access by listing objects
    const command = new ListObjectsV2Command({
      Bucket: config.s3BucketName,
      MaxKeys: 1
    })
    
    await s3Client.send(command)

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