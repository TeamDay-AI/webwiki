import { createUser, initializeDemoUsers } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  // Initialize demo users if this is the first request
  initializeDemoUsers();

  try {
    const user = createUser(body.userId, body.email);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        secretKey: user.secretKey,
        createdAt: user.createdAt,
        isActive: user.isActive,
      },
      message: "User created successfully",
    };
  } catch (error: any) {
    if (error.message === "User already exists") {
      throw createError({
        statusCode: 409,
        statusMessage: "User already exists",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create user: ${
        error.message || "Unknown error"
      }`,
    });
  }
});
