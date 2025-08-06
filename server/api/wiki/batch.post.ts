import {
  S3Client,
  DeleteObjectsCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { requireAuth, requirePathAccess } from "../../utils/auth";

interface BatchOperation {
  operation: "delete" | "copy" | "move";
  sourcePath: string;
  destinationPath?: string; // Required for copy/move
  isDirectory?: boolean;
}

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = requireAuth(event);

  const config = useRuntimeConfig();
  const body = await readBody(event);

  if (!body.operations || !Array.isArray(body.operations)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Operations array is required",
    });
  }

  const operations: BatchOperation[] = body.operations;

  // Validate path access for all operations
  for (const operation of operations) {
    requirePathAccess(user, operation.sourcePath);
    if (operation.destinationPath) {
      requirePathAccess(user, operation.destinationPath);
    }
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });

  const results: Array<{
    operation: BatchOperation;
    success: boolean;
    error?: string;
  }> = [];

  try {
    // Process operations sequentially to avoid conflicts
    for (const operation of operations) {
      try {
        switch (operation.operation) {
          case "delete":
            await handleDelete(s3Client, config, operation);
            results.push({ operation, success: true });
            break;

          case "copy":
            if (!operation.destinationPath) {
              throw new Error("destinationPath is required for copy operation");
            }
            await handleCopy(s3Client, config, operation);
            results.push({ operation, success: true });
            break;

          case "move":
            if (!operation.destinationPath) {
              throw new Error("destinationPath is required for move operation");
            }
            await handleMove(s3Client, config, operation);
            results.push({ operation, success: true });
            break;

          default:
            throw new Error(`Unknown operation: ${operation.operation}`);
        }
      } catch (error: any) {
        results.push({
          operation,
          success: false,
          error: error.message || "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return {
      success: failureCount === 0,
      totalOperations: operations.length,
      successCount,
      failureCount,
      results,
      message: `Batch operation completed: ${successCount} succeeded, ${failureCount} failed`,
    };
  } catch (error: any) {
    console.error("Batch operation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to execute batch operations: ${
        error.message || "Unknown error"
      }`,
    });
  }
});

async function handleDelete(
  s3Client: S3Client,
  config: any,
  operation: BatchOperation
) {
  if (operation.isDirectory) {
    const dirPath = operation.sourcePath.endsWith("/")
      ? operation.sourcePath
      : `${operation.sourcePath}/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: config.s3BucketName,
      Prefix: dirPath,
    });

    const listResponse = await s3Client.send(listCommand);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const objectsToDelete = listResponse.Contents.map((object) => ({
        Key: object.Key!,
      }));

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: config.s3BucketName,
        Delete: {
          Objects: objectsToDelete,
          Quiet: true,
        },
      });

      await s3Client.send(deleteCommand);
    }
  } else {
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: config.s3BucketName,
      Delete: {
        Objects: [{ Key: operation.sourcePath }],
        Quiet: true,
      },
    });

    await s3Client.send(deleteCommand);
  }
}

async function handleCopy(
  s3Client: S3Client,
  config: any,
  operation: BatchOperation
) {
  if (operation.isDirectory) {
    const sourceDirPath = operation.sourcePath.endsWith("/")
      ? operation.sourcePath
      : `${operation.sourcePath}/`;
    const destDirPath = operation.destinationPath!.endsWith("/")
      ? operation.destinationPath!
      : `${operation.destinationPath!}/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: config.s3BucketName,
      Prefix: sourceDirPath,
    });

    const listResponse = await s3Client.send(listCommand);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
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
    }
  } else {
    const copyCommand = new CopyObjectCommand({
      Bucket: config.s3BucketName,
      CopySource: `${config.s3BucketName}/${operation.sourcePath}`,
      Key: operation.destinationPath!,
    });

    await s3Client.send(copyCommand);
  }
}

async function handleMove(
  s3Client: S3Client,
  config: any,
  operation: BatchOperation
) {
  // Move is copy + delete
  await handleCopy(s3Client, config, operation);
  await handleDelete(s3Client, config, operation);
}
