import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'

export async function initUserDirectory(userId: string, config: any): Promise<boolean> {
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion
  })

  try {
    // Check if user directory already has files (to avoid recreating)
    const listCommand = new ListObjectsV2Command({
      Bucket: config.s3BucketName,
      Prefix: `users/${userId}/`,
      MaxKeys: 1
    })
    
    const existingFiles = await s3Client.send(listCommand)

    // If directory already has files, don't recreate
    if (existingFiles.Contents && existingFiles.Contents.length > 0) {
      return true
    }

    // Create welcome file in user's directory
    const welcomeContent = `# Welcome to Your Wiki!

This is your personal wiki space. You can:

- Create new files and folders
- Write in Markdown
- Organize your knowledge

## Getting Started

Click the + button in the navigation panel to create your first file or folder.

Happy writing! 📝
`

    const putCommand = new PutObjectCommand({
      Bucket: config.s3BucketName,
      Key: `users/${userId}/welcome.md`,
      Body: welcomeContent,
      ContentType: 'text/markdown'
    })
    
    await s3Client.send(putCommand)

    return true
  } catch (error) {
    console.error('Failed to initialize user directory:', error)
    return false
  }
}

export async function ensureUserDirectory(userId: string, config: any): Promise<void> {
  try {
    await initUserDirectory(userId, config)
  } catch (error) {
    // Don't throw - this is a best-effort operation
    console.warn('Could not ensure user directory exists:', error)
  }
}