import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
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
      statusMessage: "Directory path is required",
    });
  }

  // Decode the path since it was encoded in the frontend
  const decodedPath = decodeURIComponent(path);

  // Check path access authorization
  requirePathAccess(user, decodedPath);

  // Ensure path ends with / for directory operations
  const directoryPath = decodedPath.endsWith("/")
    ? decodedPath
    : `${decodedPath}/`;

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });

  try {
    console.log("Deleting directory:", directoryPath);

    // First, list all objects in the directory
    const listCommand = new ListObjectsV2Command({
      Bucket: config.s3BucketName,
      Prefix: directoryPath,
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return {
        success: true,
        message: "Directory was already empty or does not exist",
      };
    }

    // Prepare objects for deletion
    const objectsToDelete = listResponse.Contents.map((object) => ({
      Key: object.Key!,
    }));

    console.log(
      `Found ${objectsToDelete.length} objects to delete in directory`
    );

    // Delete all objects in batches (S3 allows max 1000 objects per request)
    const batchSize = 1000;
    for (let i = 0; i < objectsToDelete.length; i += batchSize) {
      const batch = objectsToDelete.slice(i, i + batchSize);

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: config.s3BucketName,
        Delete: {
          Objects: batch,
          Quiet: false,
        },
      });

      const deleteResponse = await s3Client.send(deleteCommand);

      if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
        console.error("Some objects failed to delete:", deleteResponse.Errors);
        throw new Error(
          `Failed to delete some objects: ${deleteResponse.Errors[0].Message}`
        );
      }

      console.log(`Successfully deleted batch of ${batch.length} objects`);
    }

    console.log("Directory deleted successfully:", directoryPath);
    return {
      success: true,
      path: directoryPath,
      message: `Directory and ${objectsToDelete.length} files deleted successfully`,
    };
  } catch (error: any) {
    console.error("Failed to delete directory:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete directory: ${
        error.message || "Unknown error"
      }`,
    });
  }
});
