# Wiki API

The Wiki API provides file and folder management operations with full CRUD functionality.

## Overview

- All operations require authentication via Bearer token
- Users can only access files in their directory (`users/{userId}/`)
- Supports files, folders, batch operations, and metadata queries
- Uses AWS S3 for storage backend

## File Operations

### Get File Content or List Directory

**GET** `/api/wiki/[...path]`

Retrieve file content or list directory contents.

**Parameters:**
- `path` (path) - File or directory path relative to S3 bucket

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
```

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

**Examples:**
```bash
# Get file content
curl -X GET "/api/wiki/users/john/notes.md" \
  -H "Authorization: Bearer your_secret_key"

# List directory
curl -X GET "/api/wiki/users/john/" \
  -H "Authorization: Bearer your_secret_key"
```

---

### Create or Update File

**PUT** `/api/wiki/[...path]`

Create a new file or update existing file content.

**Parameters:**
- `path` (path) - File path

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
```

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
  -H "Authorization: Bearer your_secret_key" \
  -d '{"content": "# My Notes\n\nThis is my first note."}'
```

---

### Delete File

**DELETE** `/api/wiki/[...path]`

Delete a file.

**Parameters:**
- `path` (path) - File path to delete

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
```

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
  -H "Authorization: Bearer your_secret_key"
```

## Directory Operations

### Create Folder

**POST** `/api/wiki/folder`

Create a new folder.

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
```

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
  -H "Authorization: Bearer your_secret_key" \
  -d '{"path": "users/john/projects"}'
```

---

### Delete Directory

**DELETE** `/api/wiki/directory/[...path]`

Delete a directory and all its contents.

**Parameters:**
- `path` (path) - Directory path to delete

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
```

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
  -H "Authorization: Bearer your_secret_key"
```

## File Management Operations

### Rename/Move Files and Folders

**POST** `/api/wiki/rename`

Rename or move files and folders.

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
```

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

**Examples:**
```bash
# Rename a file
curl -X POST "/api/wiki/rename" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key" \
  -d '{"oldPath": "users/john/notes.md", "newPath": "users/john/my-notes.md", "isDirectory": false}'

# Move a directory
curl -X POST "/api/wiki/rename" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key" \
  -d '{"oldPath": "users/john/old-folder", "newPath": "users/john/projects/old-folder", "isDirectory": true}'
```

---

### Copy Files and Folders

**POST** `/api/wiki/copy`

Copy files and folders to a new location.

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
```

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

**Examples:**
```bash
# Copy a file
curl -X POST "/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key" \
  -d '{"sourcePath": "users/john/notes.md", "destinationPath": "users/john/backup/notes.md", "isDirectory": false}'

# Copy a directory
curl -X POST "/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key" \
  -d '{"sourcePath": "users/john/projects", "destinationPath": "users/john/archive/projects", "isDirectory": true}'
```

## Metadata Operations

### Get File/Directory Metadata

**GET** `/api/wiki/metadata/[...path]`

Get metadata for files or directories without retrieving content.

**Parameters:**
- `path` (path) - File or directory path

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
```

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

**Examples:**
```bash
# File metadata
curl -X GET "/api/wiki/metadata/users/john/notes.md" \
  -H "Authorization: Bearer your_secret_key"

# Directory metadata
curl -X GET "/api/wiki/metadata/users/john/projects" \
  -H "Authorization: Bearer your_secret_key"
```

## Batch Operations

### Batch File Operations

**POST** `/api/wiki/batch`

Perform multiple operations in a single request.

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
```

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
- `delete` - Delete file or directory
- `copy` - Copy file or directory
- `move` - Move (copy + delete) file or directory

**Example:**
```bash
curl -X POST "/api/wiki/batch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_key" \
  -d '{
    "operations": [
      {"operation": "delete", "sourcePath": "users/john/temp.md", "isDirectory": false},
      {"operation": "copy", "sourcePath": "users/john/notes.md", "destinationPath": "users/john/backup/notes.md", "isDirectory": false}
    ]
  }'
```

## Additional Endpoints

### List Files (Alternative)

**GET** `/api/wiki/files`

Alternative endpoint for listing files using query parameters.

**Query Parameters:**
- `path` (optional) - Directory path to list

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
```

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
  -H "Authorization: Bearer your_secret_key"
```

---

### Initialize User Directory

**POST** `/api/wiki/init-user`

Initialize a user directory with a welcome file.

**Headers:**
```
Content-Type: application/json
```

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

## Error Handling

Common error responses:

- `400` - Bad Request (missing parameters, invalid input)
- `401` - Unauthorized (missing or invalid authentication token)
- `403` - Forbidden (access denied, trying to access other user's files)
- `404` - Not Found (file/directory doesn't exist)
- `500` - Internal Server Error (S3 errors, server issues)

## Complete Workflow Example

```bash
# 1. Create user and get secret key
RESPONSE=$(curl -s -X POST "/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice", "email": "alice@example.com"}')

# 2. Extract secret key
SECRET_KEY=$(echo $RESPONSE | jq -r '.user.secretKey')

# 3. Create a project folder
curl -X POST "/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"path": "users/alice/my-project"}'

# 4. Create a file
curl -X PUT "/api/wiki/users/alice/my-project/readme.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"content": "# My Project\n\nThis is my awesome project!"}'

# 5. Get file metadata
curl -X GET "/api/wiki/metadata/users/alice/my-project/readme.md" \
  -H "Authorization: Bearer $SECRET_KEY"

# 6. List directory contents
curl -X GET "/api/wiki/users/alice" \
  -H "Authorization: Bearer $SECRET_KEY"
```