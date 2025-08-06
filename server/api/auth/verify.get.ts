import { authenticateUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = authenticateUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid or missing authentication token",
    });
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      lastUsed: user.lastUsed,
      isActive: user.isActive,
    },
    message: "Authentication successful",
  };
});
