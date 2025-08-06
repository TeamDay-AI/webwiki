# WebWiki API Reference

Complete reference documentation for the WebWiki REST API.

## Quick Navigation

### 🚀 Getting Started
- [API Overview](./README.md) - Introduction and quick start guide
- [Examples](./examples.md) - Practical usage examples and code samples

### 🔐 Authentication
- [Authentication API](./authentication.md) - User management and token operations

### 📁 Core Operations  
- [Wiki API](./wiki.md) - File and folder management operations

### 🧪 Development
- [Testing API](./testing.md) - Configuration and health check endpoints
- [Error Handling](./errors.md) - Comprehensive error reference

## API Endpoints Summary

### Authentication (`/api/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create new user |
| GET | `/users/[userId]` | Get user information |
| POST | `/users/[userId]/regenerate-key` | Regenerate secret key |
| GET | `/verify` | Verify authentication token |

### Wiki Operations (`/api/wiki/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/[...path]` | Get file content or list directory |
| PUT | `/[...path]` | Create or update file |
| DELETE | `/[...path]` | Delete file |
| POST | `/folder` | Create folder |
| DELETE | `/directory/[...path]` | Delete directory |
| POST | `/rename` | Rename/move files and folders |
| POST | `/copy` | Copy files and folders |
| GET | `/metadata/[...path]` | Get file/directory metadata |
| POST | `/batch` | Perform multiple operations |
| GET | `/files` | List files (alternative endpoint) |
| POST | `/init-user` | Initialize user directory |

### Testing (`/api/test/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Check configuration |
| GET | `/s3` | Test S3 connection |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response  
```json
{
  "statusCode": 400,
  "statusMessage": "Error description"
}
```

## Authentication

All wiki operations require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
  "http://localhost:3000/api/wiki/users/alice"
```

## Quick Start

```bash
# 1. Create user
curl -X POST "http://localhost:3000/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice", "email": "alice@example.com"}'

# 2. Use returned secret key for all requests
SECRET_KEY="your_secret_key_from_step_1"

# 3. Create a file
curl -X PUT "http://localhost:3000/api/wiki/users/alice/hello.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"content": "# Hello World\n\nThis is my first file!"}'

# 4. Read the file
curl -X GET "http://localhost:3000/api/wiki/users/alice/hello.md" \
  -H "Authorization: Bearer $SECRET_KEY"
```

## Common Use Cases

- **Personal Wiki**: Store and organize markdown documents
- **Note Taking**: Create and manage personal notes
- **Documentation**: Build project documentation systems
- **Content Management**: Programmatic content creation and updates
- **File Synchronization**: Sync files between applications

## SDKs and Clients

See [Examples](./examples.md) for:
- JavaScript/Node.js client
- React hooks
- Python client
- Error handling patterns

## Rate Limits

Currently no rate limits are implemented. This may change in future versions.

## Versioning

This is API version 1. Breaking changes will result in a new version.

## Support

- [Contributing Guide](../CONTRIBUTING.md)
- [Project Documentation](../README.md)
- [Error Reference](./errors.md)