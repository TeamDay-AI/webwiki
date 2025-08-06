import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth, requirePathAccess } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = requireAuth(event);

  const config = useRuntimeConfig();
  const path = getRouterParam(event, "path");

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "File path is required",
    });
  }

  // Check path access authorization
  requirePathAccess(user, path);

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.s3BucketName,
      Key: path,
    });

    await s3Client.send(command);

    return {
      success: true,
      path,
      message: "File deleted successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete file from S3",
    });
  }
});
