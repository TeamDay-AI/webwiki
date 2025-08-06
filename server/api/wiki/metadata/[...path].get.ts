import {
  S3Client,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { requireAuth, requirePathAccess } from "../../../utils/auth";

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
    // Check if it's a directory by looking for objects with this prefix
    if (path.endsWith("/") || !path.includes(".")) {
      const dirPath = path.endsWith("/") ? path : `${path}/`;

      const listCommand = new ListObjectsV2Command({
        Bucket: config.s3BucketName,
        Prefix: dirPath,
        MaxKeys: 1, // We just need to know if it exists
      });

      const listResponse = await s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Directory not found",
        });
      }

      // Get directory metadata
      const countCommand = new ListObjectsV2Command({
        Bucket: config.s3BucketName,
        Prefix: dirPath,
        Delimiter: "/",
      });

      const countResponse = await s3Client.send(countCommand);

      const fileCount = countResponse.Contents?.length || 0;
      const folderCount = countResponse.CommonPrefixes?.length || 0;

      // Calculate total size
      const totalSize =
        countResponse.Contents?.reduce(
          (sum, item) => sum + (item.Size || 0),
          0
        ) || 0;

      return {
        path: dirPath,
        type: "directory",
        isDirectory: true,
        fileCount,
        folderCount,
        totalItems: fileCount + folderCount,
        totalSize,
        exists: true,
        success: true,
      };
    }

    // For files, get detailed metadata
    const headCommand = new HeadObjectCommand({
      Bucket: config.s3BucketName,
      Key: path,
    });

    const response = await s3Client.send(headCommand);

    return {
      path,
      type: "file",
      isDirectory: false,
      size: response.ContentLength || 0,
      lastModified: response.LastModified,
      contentType: response.ContentType,
      etag: response.ETag,
      exists: true,
      success: true,
    };
  } catch (error: any) {
    if (error.code === "NoSuchKey" || error.name === "NotFound") {
      throw createError({
        statusCode: 404,
        statusMessage: "File or directory not found",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve metadata from S3",
    });
  }
});
