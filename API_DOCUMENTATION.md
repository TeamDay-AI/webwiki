# Wiki REST API Documentation

This document describes the complete REST API for file and folder CRUD operations in the WebWiki project.

## Base URL
All endpoints are prefixed with `/api/wiki`

## Authentication
The API uses S3 credentials configured in the runtime environment. No additional authentication is required for these endpoints.

---

## 📁 **File Operations**

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
curl -X GET "/api/wiki/users/john/notes.md"
curl -X GET "/api/wiki/users/john/"
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
curl -X DELETE "/api/wiki/users/john/notes.md"
```

---

## 📂 **Directory Operations**

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
curl -X DELETE "/api/wiki/directory/users/john/old-folder"
```

---

## 🔄 **File/Folder Management**

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
  -d '{"oldPath": "users/john/notes.md", "newPath": "users/john/my-notes.md", "isDirectory": false}'

# Move a directory
curl -X POST "/api/wiki/rename" \
  -H "Content-Type: application/json" \
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
  -d '{"sourcePath": "users/john/notes.md", "destinationPath": "users/john/backup/notes.md", "isDirectory": false}'

# Copy a directory
curl -X POST "/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -d '{"sourcePath": "users/john/projects", "destinationPath": "users/john/archive/projects", "isDirectory": true}'
```

---

## 📊 **Metadata Operations**

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
curl -X GET "/api/wiki/metadata/users/john/notes.md"
curl -X GET "/api/wiki/metadata/users/john/projects"
```

---

## 🔧 **Batch Operations**

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
curl -X GET "/api/wiki/files?path=users/john"
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
- `404`: Not Found (file/directory doesn't exist)
- `500`: Internal Server Error (S3 errors, server issues)

---

## 💡 **Usage Examples**

### Complete File Management Workflow

```bash
# 1. Initialize user directory
curl -X POST "/api/wiki/init-user" \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice"}'

# 2. Create a project folder
curl -X POST "/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -d '{"path": "users/alice/my-project"}'

# 3. Create a file
curl -X PUT "/api/wiki/users/alice/my-project/readme.md" \
  -H "Content-Type: application/json" \
  -d '{"content": "# My Project\n\nThis is my awesome project!"}'

# 4. Get file metadata
curl -X GET "/api/wiki/metadata/users/alice/my-project/readme.md"

# 5. Copy the project
curl -X POST "/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -d '{"sourcePath": "users/alice/my-project", "destinationPath": "users/alice/my-project-backup", "isDirectory": true}'

# 6. List directory contents
curl -X GET "/api/wiki/users/alice"

# 7. Batch cleanup
curl -X POST "/api/wiki/batch" \
  -H "Content-Type: application/json" \
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