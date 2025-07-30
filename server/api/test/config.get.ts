export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    awsRegion: config.awsRegion || 'NOT SET',
    s3BucketName: config.s3BucketName || 'NOT SET',
    hasAwsAccessKey: !!config.awsAccessKeyId,
    hasAwsSecretKey: !!config.awsSecretAccessKey
  }
})