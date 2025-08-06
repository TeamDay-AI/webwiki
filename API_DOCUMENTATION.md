# Wiki REST API Documentation

This document describes the complete REST API for file and folder CRUD operations in the WebWiki project.

## Base URL
All endpoints are prefixed with `/api/wiki` for wiki operations and `/api/auth` for authentication.

## 🔐 Authentication

**All wiki API endpoints require authentication using Bearer tokens.**

### How Authentication Works
1. Each user has a unique secret key that acts as their authentication token
2. Include the secret key in the `Authorization` header as a Bearer token
3. Users can only access files/folders in their own directory (`users/{userId}/`)

### Authentication Header Format
```
Authorization: Bearer YOUR_SECRET_KEY_HERE
```

### Getting Your Secret Key
Use the authentication endpoints below to create users and get secret keys.

---

## 🔐 **Authentication Endpoints**

### **POST** `/api/auth/users`
Create a new user and get a secret key.

**Request Body:**
```json
{
  "userId": "john",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "john",
    "email": "john@example.com",
    "secretKey": "a1b2c3d4e5f6789...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isActive": true
  },
  "message": "User created successfully"
}
```

**Example:**
```bash
curl -X POST "/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "john", "email": "john@example.com"}'
```

---

### **GET** `/api/auth/users/[userId]`
Get user information (including secret key).

**Parameters:**
- `userId` (string, required): User ID

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "john",
    "email": "john@example.com",
    "secretKey": "a1b2c3d4e5f6789...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastUsed": "2024-01-01T12:00:00.000Z",
    "isActive": true
  }
}
```

**Example:**
```bash
curl -X GET "/api/auth/users/john"
```

---

### **POST** `/api/auth/users/[userId]/regenerate-key`
Regenerate a user's secret key (requires authentication).

**Parameters:**
- `userId` (string, required): User ID

**Headers:**
```
Authorization: Bearer YOUR_CURRENT_SECRET_KEY
```

**Response:**
```json
{
  "success": true,
  "secretKey": "new_secret_key_here...",
  "message": "Secret key regenerated successfully"
}
```

**Example:**
```bash
curl -X POST "/api/auth/users/john/regenerate-key" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
```

---

### **GET** `/api/auth/verify`
Verify your authentication token.

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "john",
    "email": "john@example.com",
    "lastUsed": "2024-01-01T12:00:00.000Z",
    "isActive": true
  },
  "message": "Authentication successful"
}
```

**Example:**
```bash
curl -X GET "/api/auth/verify" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
```

---

## 📁 **File Operations**

**⚠️ All file operations require authentication via Bearer token.**

### **GET** `/api/wiki/[...path]`
Get file content or list directory contents.

**Parameters:**
- `path` (string, required): File or directory path

**Response for Files:**
```json
{
  "content": "file content here",
  "success": true,
  "type": "file",
  "lastModified": "2024-01-01T00:00:00.000Z",
  "path": "users/john/notes.md"
}
```

**Response for Directories:**
```json
{
  "files": [
    {
      "key": "users/john/folder1/",
      "name": "folder1",
      "isFile": false
    },
    {
      "key": "users/john/notes.md",
      "name": "notes.md",
      "lastModified": "2024-01-01T00:00:00.000Z",
      "size": 1024,
      "isFile": true
    }
  ],
  "success": true,
  "type": "directory"
}
```

**Example:**
```bash
curl -X GET "/api/wiki/users/john/notes.md" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
curl -X GET "/api/wiki/users/john/" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
```

---

### **PUT** `/api/wiki/[...path]`
Create or update a file.

**Parameters:**
- `path` (string, required): File path

**Request Body:**
```json
{
  "content": "File content here"
}
```

**Response:**
```json
{
  "success": true,
  "path": "users/john/notes.md",
  "message": "File saved successfully"
}
```

**Example:**
```bash
curl -X PUT "/api/wiki/users/john/notes.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..." \
  -d '{"content": "# My Notes\n\nThis is my first note."}'
```

---

### **DELETE** `/api/wiki/[...path]`
Delete a file.

**Parameters:**
- `path` (string, required): File path

**Response:**
```json
{
  "success": true,
  "path": "users/john/notes.md",
  "message": "File deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE "/api/wiki/users/john/notes.md" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
```

---

## 📂 **Directory Operations**

**⚠️ All directory operations require authentication via Bearer token.**

### **POST** `/api/wiki/folder`
Create a new folder.

**Request Body:**
```json
{
  "path": "users/john/new-folder"
}
```

**Response:**
```json
{
  "success": true,
  "path": "users/john/new-folder/",
  "message": "Folder created successfully"
}
```

**Example:**
```bash
curl -X POST "/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..." \
  -d '{"path": "users/john/projects"}'
```

---

### **DELETE** `/api/wiki/directory/[...path]`
Delete a directory and all its contents.

**Parameters:**
- `path` (string, required): Directory path

**Response:**
```json
{
  "success": true,
  "message": "Directory deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE "/api/wiki/directory/users/john/old-folder" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
```

---

## 🔄 **File/Folder Management**

**⚠️ All management operations require authentication via Bearer token.**

### **POST** `/api/wiki/rename`
Rename or move files and folders.

**Request Body:**
```json
{
  "oldPath": "users/john/old-name.md",
  "newPath": "users/john/new-name.md",
  "isDirectory": false
}
```

**Response:**
```json
{
  "success": true,
  "oldPath": "users/john/old-name.md",
  "newPath": "users/john/new-name.md",
  "message": "File renamed successfully"
}
```

**Example:**
```bash
# Rename a file
curl -X POST "/api/wiki/rename" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..." \
  -d '{"oldPath": "users/john/notes.md", "newPath": "users/john/my-notes.md", "isDirectory": false}'

# Move a directory
curl -X POST "/api/wiki/rename" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..." \
  -d '{"oldPath": "users/john/old-folder", "newPath": "users/john/projects/old-folder", "isDirectory": true}'
```

---

### **POST** `/api/wiki/copy`
Copy files and folders.

**Request Body:**
```json
{
  "sourcePath": "users/john/notes.md",
  "destinationPath": "users/john/backup/notes.md",
  "isDirectory": false
}
```

**Response:**
```json
{
  "success": true,
  "sourcePath": "users/john/notes.md",
  "destinationPath": "users/john/backup/notes.md",
  "message": "File copied successfully"
}
```

**Example:**
```bash
# Copy a file
curl -X POST "/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..." \
  -d '{"sourcePath": "users/john/notes.md", "destinationPath": "users/john/backup/notes.md", "isDirectory": false}'

# Copy a directory
curl -X POST "/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..." \
  -d '{"sourcePath": "users/john/projects", "destinationPath": "users/john/archive/projects", "isDirectory": true}'
```

---

## 📊 **Metadata Operations**

**⚠️ All metadata operations require authentication via Bearer token.**

### **GET** `/api/wiki/metadata/[...path]`
Get metadata for files or directories without content.

**Parameters:**
- `path` (string, required): File or directory path

**Response for Files:**
```json
{
  "path": "users/john/notes.md",
  "type": "file",
  "isDirectory": false,
  "size": 1024,
  "lastModified": "2024-01-01T00:00:00.000Z",
  "contentType": "text/markdown",
  "etag": "\"abc123\"",
  "exists": true,
  "success": true
}
```

**Response for Directories:**
```json
{
  "path": "users/john/projects/",
  "type": "directory",
  "isDirectory": true,
  "fileCount": 5,
  "folderCount": 2,
  "totalItems": 7,
  "totalSize": 10240,
  "exists": true,
  "success": true
}
```

**Example:**
```bash
curl -X GET "/api/wiki/metadata/users/john/notes.md" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
curl -X GET "/api/wiki/metadata/users/john/projects" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
```

---

## 🔧 **Batch Operations**

**⚠️ All batch operations require authentication via Bearer token.**

### **POST** `/api/wiki/batch`
Perform multiple operations in a single request.

**Request Body:**
```json
{
  "operations": [
    {
      "operation": "delete",
      "sourcePath": "users/john/temp.md",
      "isDirectory": false
    },
    {
      "operation": "copy",
      "sourcePath": "users/john/notes.md",
      "destinationPath": "users/john/backup/notes.md",
      "isDirectory": false
    },
    {
      "operation": "move",
      "sourcePath": "users/john/old-folder",
      "destinationPath": "users/john/archive/old-folder",
      "isDirectory": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "totalOperations": 3,
  "successCount": 3,
  "failureCount": 0,
  "results": [
    {
      "operation": {
        "operation": "delete",
        "sourcePath": "users/john/temp.md",
        "isDirectory": false
      },
      "success": true
    },
    {
      "operation": {
        "operation": "copy",
        "sourcePath": "users/john/notes.md",
        "destinationPath": "users/john/backup/notes.md",
        "isDirectory": false
      },
      "success": true
    },
    {
      "operation": {
        "operation": "move",
        "sourcePath": "users/john/old-folder",
        "destinationPath": "users/john/archive/old-folder",
        "isDirectory": true
      },
      "success": true
    }
  ],
  "message": "Batch operation completed: 3 succeeded, 0 failed"
}
```

**Supported Operations:**
- `delete`: Delete file or directory
- `copy`: Copy file or directory
- `move`: Move (copy + delete) file or directory

**Example:**
```bash
curl -X POST "/api/wiki/batch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..." \
  -d '{
    "operations": [
      {"operation": "delete", "sourcePath": "users/john/temp.md", "isDirectory": false},
      {"operation": "copy", "sourcePath": "users/john/notes.md", "destinationPath": "users/john/backup/notes.md", "isDirectory": false}
    ]
  }'
```

---

## 🔍 **Additional Endpoints**

### **GET** `/api/wiki/files`
List files with query parameter (alternative to path-based listing).

**Query Parameters:**
- `path` (string, optional): Directory path to list

**Response:**
```json
{
  "files": [
    {
      "key": "users/john/notes.md",
      "name": "notes.md",
      "lastModified": "2024-01-01T00:00:00.000Z",
      "size": 1024,
      "isFile": true
    }
  ],
  "success": true
}
```

**Example:**
```bash
curl -X GET "/api/wiki/files?path=users/john" \
  -H "Authorization: Bearer a1b2c3d4e5f6789..."
```

---

### **POST** `/api/wiki/init-user`
Initialize a user directory with a welcome file.

**Request Body:**
```json
{
  "userId": "john"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User directory initialized successfully"
}
```

**Example:**
```bash
curl -X POST "/api/wiki/init-user" \
  -H "Content-Type: application/json" \
  -d '{"userId": "john"}'
```

---

## 🚨 **Error Responses**

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "statusMessage": "Error message here"
}
```

**Common Error Codes:**
- `400`: Bad Request (missing parameters, invalid input)
- `401`: Unauthorized (missing or invalid authentication token)
- `403`: Forbidden (access denied, trying to access other user's files)
- `404`: Not Found (file/directory doesn't exist)
- `409`: Conflict (user already exists)
- `500`: Internal Server Error (S3 errors, server issues)

**Authentication Error Examples:**
```json
{
  "statusCode": 401,
  "statusMessage": "Authentication required. Please provide a valid bearer token."
}
```

```json
{
  "statusCode": 403,
  "statusMessage": "Access denied. You can only access your own files."
}
```

---

## 💡 **Usage Examples**

### Complete File Management Workflow

```bash
# 1. Create a user and get secret key
curl -X POST "/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice", "email": "alice@example.com"}'

# Response will include: "secretKey": "your_secret_key_here"
# Use this secret key in all subsequent requests

# 2. Initialize user directory (optional, happens automatically)
curl -X POST "/api/wiki/init-user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key_here" \
  -d '{"userId": "alice"}'

# 3. Create a project folder
curl -X POST "/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key_here" \
  -d '{"path": "users/alice/my-project"}'

# 4. Create a file
curl -X PUT "/api/wiki/users/alice/my-project/readme.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key_here" \
  -d '{"content": "# My Project\n\nThis is my awesome project!"}'

# 5. Get file metadata
curl -X GET "/api/wiki/metadata/users/alice/my-project/readme.md" \
  -H "Authorization: Bearer your_secret_key_here"

# 6. Copy the project
curl -X POST "/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key_here" \
  -d '{"sourcePath": "users/alice/my-project", "destinationPath": "users/alice/my-project-backup", "isDirectory": true}'

# 7. List directory contents
curl -X GET "/api/wiki/users/alice" \
  -H "Authorization: Bearer your_secret_key_here"

# 8. Batch cleanup
curl -X POST "/api/wiki/batch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key_here" \
  -d '{
    "operations": [
      {"operation": "delete", "sourcePath": "users/alice/my-project-backup", "isDirectory": true}
    ]
  }'
```

---

## 🔧 **Configuration**

The API requires the following environment variables:

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `S3_BUCKET_NAME`: S3 bucket name

These are configured in your `nuxt.config.ts` runtime configuration.

## 🔒 **Security Features**

1. **Bearer Token Authentication**: All API endpoints require valid authentication
2. **Path-based Authorization**: Users can only access files in their own directory (`users/{userId}/`)
3. **Secure Secret Keys**: 64-character hexadecimal keys generated using crypto.randomBytes
4. **User Isolation**: Each user's files are completely isolated from others
5. **Token Validation**: All requests validate the bearer token before processing
6. **Activity Tracking**: User's last access time is tracked and updated

## 🚀 **Getting Started**

1. **Create a User**: Use `POST /api/auth/users` to create a user and get a secret key
2. **Save Your Secret Key**: Store the secret key securely - you'll need it for all API calls
3. **Test Authentication**: Use `GET /api/auth/verify` to verify your token works
4. **Start Using the API**: Include your secret key in the Authorization header for all requests

**Quick Start Example:**
```bash
# 1. Create user
RESPONSE=$(curl -s -X POST "/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "myuser", "email": "me@example.com"}')

# 2. Extract secret key (use jq or parse manually)
SECRET_KEY=$(echo $RESPONSE | jq -r '.user.secretKey')

# 3. Use the API
curl -X GET "/api/wiki/users/myuser" \
  -H "Authorization: Bearer $SECRET_KEY"
```