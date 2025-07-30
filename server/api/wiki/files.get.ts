import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { ensureUserDirectory } from '../../utils/initUserDirectory'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const userPath = query.path as string || ''
  
  // Extract user ID from path to ensure their directory exists
  const userIdMatch = userPath.match(/^users\/([^\/]+)/)
  if (userIdMatch) {
    const userId = userIdMatch[1]
    // Temporarily disabled until IAM policy propagates
    // await ensureUserDirectory(userId, config)
  }
  
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion
  })

  try {
    // Ensure prefix ends with '/' for proper directory listing, unless it's empty
    const prefix = userPath ? (userPath.endsWith('/') ? userPath : `${userPath}/`) : ''
    
    console.log('Listing files with prefix:', prefix)
    
    const command = new ListObjectsV2Command({
      Bucket: config.s3BucketName,
      Prefix: prefix,
      Delimiter: '/'
    })
    
    const response = await s3Client.send(command)
    
    console.log('S3 response:', {
      Contents: response.Contents?.length || 0,
      CommonPrefixes: response.CommonPrefixes?.length || 0
    })

    const files = response.Contents?.map(item => {
      const fileName = item.Key?.split('/').pop() || ''
      // Skip .gitkeep files in the file listing since they're just directory markers
      if (fileName === '.gitkeep') return null
      
      return {
        key: item.Key,
        name: fileName,
        lastModified: item.LastModified,
        size: item.Size,
        isFile: true
      }
    }).filter(Boolean) || []

    const folders = response.CommonPrefixes?.map(prefix => {
      const prefixPath = prefix.Prefix || ''
      // Remove trailing slash and get folder name
      const folderName = prefixPath.replace(/\/$/, '').split('/').pop() || ''
      
      return {
        key: prefixPath,
        name: folderName,
        isFile: false
      }
    }) || []

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