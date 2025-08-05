import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  if (!body.path) {
    throw createError({
      statusCode: 400,
      statusMessage: "Folder path is required",
    });
  }

  // Ensure path ends with / for folder creation
  const folderPath = body.path.endsWith("/") ? body.path : `${body.path}/`;

  // Add .gitkeep file to make the folder visible in S3
  const gitkeepPath = `${folderPath}.gitkeep`;

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });

  try {
    // Create .gitkeep file to represent the folder
    const command = new PutObjectCommand({
      Bucket: config.s3BucketName,
      Key: gitkeepPath,
      Body: "",
      ContentType: "text/plain",
    });

    await s3Client.send(command);

    return {
      success: true,
      path: folderPath,
      message: "Folder created successfully",
    };
  } catch (error: any) {
    console.error("Folder creation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create folder: ${
        error.message || "Unknown error"
      }`,
    });
  }
});
