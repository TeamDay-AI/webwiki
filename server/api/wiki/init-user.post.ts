import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  if (!body.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
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
    // Create a welcome file in the user's directory
    const welcomeContent = `# Welcome to Your Wiki!

This is your personal wiki space. You can:

- Create new files and folders
- Write in Markdown
- Organize your knowledge

## Getting Started

Click the + button in the navigation panel to create your first file or folder.

Happy writing! 📝
`

    const command = new PutObjectCommand({
      Bucket: config.s3BucketName,
      Key: `users/${body.userId}/welcome.md`,
      Body: welcomeContent,
      ContentType: 'text/markdown'
    })
    
    await s3Client.send(command)

    return {
      success: true,
      message: 'User directory initialized successfully'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to initialize user directory'
    })
  }
})