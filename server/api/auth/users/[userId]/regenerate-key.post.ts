import { regenerateUserSecretKey, requireAuth } from "../../../../utils/auth";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "userId");

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  // Require authentication - users can only regenerate their own keys
  const currentUser = requireAuth(event);

  if (currentUser.id !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: "You can only regenerate your own secret key",
    });
  }

  try {
    const newSecretKey = regenerateUserSecretKey(userId);

    return {
      success: true,
      secretKey: newSecretKey,
      message: "Secret key regenerated successfully",
    };
  } catch (error: any) {
    if (error.message === "User not found") {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to regenerate secret key: ${
        error.message || "Unknown error"
      }`,
    });
  }
});
