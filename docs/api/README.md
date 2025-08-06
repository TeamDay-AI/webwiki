# WebWiki API Documentation

This document provides a comprehensive reference for the WebWiki REST API.

## Base URLs

- **Authentication**: `/api/auth/*`
- **Wiki Operations**: `/api/wiki/*`
- **Testing**: `/api/test/*`

## Quick Start

1. **Create a user** to get an authentication token
2. **Use the token** in all subsequent requests
3. **Access your files** in the `users/{userId}/` directory

```bash
# 1. Create user
curl -X POST "/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "myuser", "email": "me@example.com"}'

# 2. Use the returned secretKey in all requests
curl -X GET "/api/wiki/users/myuser" \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

## Authentication

All wiki and most auth operations require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_SECRET_KEY_HERE
```

## API Sections

- [**Authentication**](./authentication.md) - User management and token operations
- [**Wiki Operations**](./wiki.md) - File and folder CRUD operations
- [**Testing**](./testing.md) - Development and configuration testing

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

## Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Rate Limiting

Currently, there are no rate limits implemented. This may change in future versions.

## API Versioning

The current API is version 1 and is considered stable. Breaking changes will result in a new version.

## Support

For issues and questions, please refer to the project repository or documentation.