import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  if (!body.oldPath || !body.newPath) {
    throw createError({
      statusCode: 400,
      statusMessage: "Both oldPath and newPath are required",
    });
  }

  const { oldPath, newPath, isDirectory } = body;

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });

  try {
    if (isDirectory) {
      // For directories, we need to rename all files within the directory
      const oldDirPath = oldPath.endsWith("/") ? oldPath : `${oldPath}/`;
      const newDirPath = newPath.endsWith("/") ? newPath : `${newPath}/`;

      // List all objects in the old directory
      const listCommand = new ListObjectsV2Command({
        Bucket: config.s3BucketName,
        Prefix: oldDirPath,
      });

      const listResponse = await s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        return {
          success: true,
          message: "Directory was empty, nothing to rename",
        };
      }

      // Copy all objects to new location
      const copyPromises = listResponse.Contents.map(async (object) => {
        if (!object.Key) return;

        const relativePath = object.Key.replace(oldDirPath, "");
        const newKey = `${newDirPath}${relativePath}`;

        const copyCommand = new CopyObjectCommand({
          Bucket: config.s3BucketName,
          CopySource: `${config.s3BucketName}/${object.Key}`,
          Key: newKey,
        });

        await s3Client.send(copyCommand);
      });

      await Promise.all(copyPromises);

      // Delete all old objects
      const objectsToDelete = listResponse.Contents.map((object) => ({
        Key: object.Key!,
      }));

      const batchSize = 1000;
      for (let i = 0; i < objectsToDelete.length; i += batchSize) {
        const batch = objectsToDelete.slice(i, i + batchSize);

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: config.s3BucketName,
          Delete: {
            Objects: batch,
            Quiet: true,
          },
        });

        await s3Client.send(deleteCommand);
      }

      return {
        success: true,
        oldPath,
        newPath,
        message: "Directory renamed successfully",
      };
    } else {
      // For files, simple copy and delete
      const copyCommand = new CopyObjectCommand({
        Bucket: config.s3BucketName,
        CopySource: `${config.s3BucketName}/${oldPath}`,
        Key: newPath,
      });

      await s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.s3BucketName,
        Key: oldPath,
      });

      await s3Client.send(deleteCommand);

      return {
        success: true,
        oldPath,
        newPath,
        message: "File renamed successfully",
      };
    }
  } catch (error: any) {
    console.error("Rename error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to rename: ${error.message || "Unknown error"}`,
    });
  }
});
