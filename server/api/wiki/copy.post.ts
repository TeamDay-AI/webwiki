import {
  S3Client,
  CopyObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { requireAuth, requirePathAccess } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = requireAuth(event);

  const config = useRuntimeConfig();
  const body = await readBody(event);

  if (!body.sourcePath || !body.destinationPath) {
    throw createError({
      statusCode: 400,
      statusMessage: "Both sourcePath and destinationPath are required",
    });
  }

  // Check path access authorization for both source and destination
  requirePathAccess(user, body.sourcePath);
  requirePathAccess(user, body.destinationPath);

  const { sourcePath, destinationPath, isDirectory } = body;

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });

  try {
    if (isDirectory) {
      // For directories, copy all files within the directory
      const sourceDirPath = sourcePath.endsWith("/")
        ? sourcePath
        : `${sourcePath}/`;
      const destDirPath = destinationPath.endsWith("/")
        ? destinationPath
        : `${destinationPath}/`;

      // List all objects in the source directory
      const listCommand = new ListObjectsV2Command({
        Bucket: config.s3BucketName,
        Prefix: sourceDirPath,
      });

      const listResponse = await s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        return {
          success: true,
          message: "Directory was empty, nothing to copy",
        };
      }

      // Copy all objects to destination
      const copyPromises = listResponse.Contents.map(async (object) => {
        if (!object.Key) return;

        const relativePath = object.Key.replace(sourceDirPath, "");
        const newKey = `${destDirPath}${relativePath}`;

        const copyCommand = new CopyObjectCommand({
          Bucket: config.s3BucketName,
          CopySource: `${config.s3BucketName}/${object.Key}`,
          Key: newKey,
        });

        await s3Client.send(copyCommand);
      });

      await Promise.all(copyPromises);

      return {
        success: true,
        sourcePath,
        destinationPath,
        message: "Directory copied successfully",
      };
    } else {
      // For files, simple copy operation
      const copyCommand = new CopyObjectCommand({
        Bucket: config.s3BucketName,
        CopySource: `${config.s3BucketName}/${sourcePath}`,
        Key: destinationPath,
      });

      await s3Client.send(copyCommand);

      return {
        success: true,
        sourcePath,
        destinationPath,
        message: "File copied successfully",
      };
    }
  } catch (error: any) {
    console.error("Copy error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to copy: ${error.message || "Unknown error"}`,
    });
  }
});
