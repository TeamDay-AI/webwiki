import crypto from "crypto";
import type { H3Event } from "h3";

export interface User {
  id: string;
  email?: string;
  secretKey: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

// In-memory user store (in production, use a database)
const users = new Map<string, User>();
const usersBySecretKey = new Map<string, User>();

/**
 * Generate a secure random secret key
 */
export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a new user with a secret key
 */
export function createUser(userId: string, email?: string): User {
  if (users.has(userId)) {
    throw new Error("User already exists");
  }

  const secretKey = generateSecretKey();
  const user: User = {
    id: userId,
    email,
    secretKey,
    createdAt: new Date(),
    isActive: true,
  };

  users.set(userId, user);
  usersBySecretKey.set(secretKey, user);

  return user;
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | undefined {
  return users.get(userId);
}

/**
 * Get user by secret key
 */
export function getUserBySecretKey(secretKey: string): User | undefined {
  return usersBySecretKey.get(secretKey);
}

/**
 * Update user's last used timestamp
 */
export function updateUserLastUsed(user: User): void {
  user.lastUsed = new Date();
}

/**
 * Regenerate user's secret key
 */
export function regenerateUserSecretKey(userId: string): string {
  const user = users.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Remove old secret key mapping
  usersBySecretKey.delete(user.secretKey);

  // Generate new secret key
  const newSecretKey = generateSecretKey();
  user.secretKey = newSecretKey;

  // Add new secret key mapping
  usersBySecretKey.set(newSecretKey, user);

  return newSecretKey;
}

/**
 * Deactivate user
 */
export function deactivateUser(userId: string): boolean {
  const user = users.get(userId);
  if (!user) {
    return false;
  }

  user.isActive = false;
  return true;
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(event: H3Event): string | null {
  const authorization = getHeader(event, "authorization");

  if (!authorization) {
    return null;
  }

  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Authenticate user from bearer token
 */
export function authenticateUser(event: H3Event): User | null {
  const token = extractBearerToken(event);

  if (!token) {
    return null;
  }

  const user = getUserBySecretKey(token);

  if (!user || !user.isActive) {
    return null;
  }

  // Update last used timestamp
  updateUserLastUsed(user);

  return user;
}

/**
 * Require authentication middleware
 */
export function requireAuth(event: H3Event): User {
  const user = authenticateUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage:
        "Authentication required. Please provide a valid bearer token.",
    });
  }

  return user;
}

/**
 * Check if user has access to a path (basic path-based authorization)
 */
export function checkPathAccess(user: User, path: string): boolean {
  // Users can only access their own directory under users/{userId}/
  if (path.startsWith("users/")) {
    const pathUserId = path.split("/")[1];
    return pathUserId === user.id;
  }

  // Allow access to public paths or admin users could have broader access
  return false;
}

/**
 * Require path access authorization
 */
export function requirePathAccess(user: User, path: string): void {
  if (!checkPathAccess(user, path)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied. You can only access your own files.",
    });
  }
}

/**
 * Get all users (admin function)
 */
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

/**
 * Initialize with some demo users for testing
 */
export function initializeDemoUsers(): void {
  if (users.size === 0) {
    createUser("demo", "demo@example.com");
    createUser("alice", "alice@example.com");
    createUser("bob", "bob@example.com");
  }
}
