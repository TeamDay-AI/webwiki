import { getUserById, initializeDemoUsers } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "userId");

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  // Initialize demo users if this is the first request
  initializeDemoUsers();

  const user = getUserById(userId);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      secretKey: user.secretKey,
      createdAt: user.createdAt,
      lastUsed: user.lastUsed,
      isActive: user.isActive,
    },
  };
});
