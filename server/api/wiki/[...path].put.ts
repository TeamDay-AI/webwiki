import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ensureUserDirectory } from "../../utils/initUserDirectory";
import { requireAuth, requirePathAccess } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = requireAuth(event);

  const config = useRuntimeConfig();
  const path = getRouterParam(event, "path");
  const body = await readBody(event);

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "File path is required",
    });
  }

  // Check path access authorization
  requirePathAccess(user, path);

  if (!body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: "File content is required",
    });
  }

  // Validate S3 configuration
  if (
    !config.s3BucketName ||
    !config.awsAccessKeyId ||
    !config.awsSecretAccessKey ||
    !config.awsRegion
  ) {
    console.error("Missing S3 configuration:", {
      hasBucket: !!config.s3BucketName,
      hasAccessKey: !!config.awsAccessKeyId,
      hasSecretKey: !!config.awsSecretAccessKey,
      hasRegion: !!config.awsRegion,
    });
    throw createError({
      statusCode: 500,
      statusMessage: "S3 configuration is incomplete",
    });
  }

  // Extract user ID from path to ensure their directory exists
  const userIdMatch = path.match(/^users\/([^\/]+)/);
  if (userIdMatch) {
    const userId = userIdMatch[1];
    // Temporarily disabled until IAM policy propagates
    // await ensureUserDirectory(userId, config)
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });

  try {
    console.log("Attempting to save file:", {
      bucket: config.s3BucketName,
      key: path,
      contentLength: body.content?.length || 0,
    });

    const command = new PutObjectCommand({
      Bucket: config.s3BucketName,
      Key: path,
      Body: body.content,
      ContentType: "text/markdown",
    });

    await s3Client.send(command);

    console.log("File saved successfully:", path);
    return {
      success: true,
      path,
      message: "File saved successfully",
    };
  } catch (error) {
    console.error("S3 Error details:", {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      bucket: config.s3BucketName,
      key: path,
      region: config.awsRegion,
    });

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to save file to S3: ${
        error.message || "Unknown error"
      }`,
    });
  }
});
