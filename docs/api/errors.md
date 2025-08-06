# Error Handling

This document describes error handling patterns and common error scenarios in the WebWiki API.

## Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "statusCode": 400,
  "statusMessage": "Descriptive error message"
}
```

## HTTP Status Codes

### 2xx Success
- `200` - OK: Request succeeded
- `201` - Created: Resource created successfully

### 4xx Client Errors
- `400` - Bad Request: Invalid request parameters or body
- `401` - Unauthorized: Missing or invalid authentication token
- `403` - Forbidden: Valid token but insufficient permissions
- `404` - Not Found: Requested resource doesn't exist
- `409` - Conflict: Resource already exists or operation conflicts

### 5xx Server Errors
- `500` - Internal Server Error: Unexpected server error
- `502` - Bad Gateway: External service (S3) error
- `503` - Service Unavailable: Temporary service issues

## Common Error Scenarios

### Authentication Errors

#### Missing Authorization Header
```json
{
  "statusCode": 401,
  "statusMessage": "Authentication required. Please provide a valid bearer token."
}
```

**Cause:** No `Authorization` header provided
**Solution:** Add `Authorization: Bearer YOUR_SECRET_KEY` header

#### Invalid Secret Key
```json
{
  "statusCode": 401,
  "statusMessage": "Invalid or missing authentication token"
}
```

**Cause:** Invalid secret key format or non-existent user
**Solution:** Verify secret key is correct and user exists

#### Access Denied
```json
{
  "statusCode": 403,
  "statusMessage": "Access denied. You can only access your own files."
}
```

**Cause:** Attempting to access another user's files
**Solution:** Only access files in your own `users/{userId}/` directory

### File Operation Errors

#### File Not Found
```json
{
  "statusCode": 404,
  "statusMessage": "File not found"
}
```

**Cause:** Requested file doesn't exist
**Solution:** Verify file path is correct or create the file first

#### Directory Not Found
```json
{
  "statusCode": 404,
  "statusMessage": "Directory not found"
}
```

**Cause:** Requested directory doesn't exist
**Solution:** Create the directory first using `/api/wiki/folder`

#### Invalid File Path
```json
{
  "statusCode": 400,
  "statusMessage": "File path is required"
}
```

**Cause:** Empty or missing path parameter
**Solution:** Provide a valid file path

### User Management Errors

#### User Already Exists
```json
{
  "statusCode": 409,
  "statusMessage": "User already exists"
}
```

**Cause:** Attempting to create a user with existing userId
**Solution:** Use a different userId or get existing user info

#### User Not Found
```json
{
  "statusCode": 404,
  "statusMessage": "User not found"
}
```

**Cause:** Requested user doesn't exist
**Solution:** Create the user first or verify userId is correct

#### Missing User ID
```json
{
  "statusCode": 400,
  "statusMessage": "User ID is required"
}
```

**Cause:** Missing `userId` in request body
**Solution:** Include `userId` field in request

### S3/Storage Errors

#### S3 Connection Failed
```json
{
  "statusCode": 500,
  "statusMessage": "S3 connection failed: Access Denied"
}
```

**Cause:** AWS credentials invalid or insufficient permissions
**Solution:** Verify AWS credentials and S3 bucket permissions

#### Bucket Not Found
```json
{
  "statusCode": 500,
  "statusMessage": "S3 connection failed: The specified bucket does not exist"
}
```

**Cause:** S3 bucket name incorrect or doesn't exist
**Solution:** Verify `S3_BUCKET_NAME` environment variable

#### Storage Quota Exceeded
```json
{
  "statusCode": 500,
  "statusMessage": "Storage quota exceeded"
}
```

**Cause:** S3 bucket storage limits reached
**Solution:** Clean up old files or increase storage quota

### Request Format Errors

#### Invalid JSON
```json
{
  "statusCode": 400,
  "statusMessage": "Invalid JSON in request body"
}
```

**Cause:** Malformed JSON in request body
**Solution:** Validate JSON syntax before sending

#### Missing Content-Type
```json
{
  "statusCode": 400,
  "statusMessage": "Content-Type must be application/json"
}
```

**Cause:** Missing or incorrect `Content-Type` header
**Solution:** Add `Content-Type: application/json` header

#### Missing Required Field
```json
{
  "statusCode": 400,
  "statusMessage": "Field 'content' is required"
}
```

**Cause:** Required field missing from request body
**Solution:** Include all required fields as per API documentation

## Error Handling Best Practices

### Client-Side Error Handling

```javascript
async function handleApiCall(apiFunction) {
  try {
    const response = await fetch(/* API call */);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`${data.statusCode}: ${data.statusMessage}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error types
    if (error.message.includes('401')) {
      // Redirect to login or refresh token
      handleAuthError();
    } else if (error.message.includes('403')) {
      // Show access denied message
      showAccessDeniedError();
    } else if (error.message.includes('404')) {
      // Show not found message
      showNotFoundError();
    } else {
      // Show generic error message
      showGenericError(error.message);
    }
    
    throw error;
  }
}
```

### Retry Logic

```javascript
async function retryApiCall(apiFunction, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      // Don't retry client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}
```

### Error Recovery Strategies

#### Authentication Recovery
```javascript
class ApiClient {
  constructor(baseUrl, secretKey) {
    this.baseUrl = baseUrl;
    this.secretKey = secretKey;
  }
  
  async request(method, path, data) {
    try {
      return await this.makeRequest(method, path, data);
    } catch (error) {
      if (error.status === 401) {
        // Try to refresh authentication
        await this.refreshAuth();
        return await this.makeRequest(method, path, data);
      }
      throw error;
    }
  }
  
  async refreshAuth() {
    // Verify current token or get new one
    const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${this.secretKey}` }
    });
    
    if (!response.ok) {
      throw new Error('Authentication refresh failed');
    }
  }
}
```

#### File Operation Recovery
```javascript
async function safeFileOperation(client, operation, fallback) {
  try {
    return await operation();
  } catch (error) {
    if (error.status === 404) {
      // File not found, try fallback
      console.warn('File not found, using fallback');
      return await fallback();
    }
    throw error;
  }
}

// Usage
const fileContent = await safeFileOperation(
  client,
  () => client.getFile('users/alice/config.md'),
  () => ({ content: '# Default Config\n\nDefault configuration...' })
);
```

### Error Logging and Monitoring

```javascript
class ErrorLogger {
  static log(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        status: error.status,
        stack: error.stack
      },
      context
    };
    
    // Log to console (development)
    console.error('API Error:', errorInfo);
    
    // Send to monitoring service (production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorInfo);
    }
  }
  
  static sendToMonitoring(errorInfo) {
    // Send to error tracking service
    // e.g., Sentry, LogRocket, etc.
  }
}

// Usage
try {
  await apiOperation();
} catch (error) {
  ErrorLogger.log(error, {
    operation: 'file_save',
    userId: 'alice',
    filePath: 'users/alice/document.md'
  });
  throw error;
}
```

## Debugging Tips

### Enable Request Logging
```javascript
// Add request/response logging
const originalFetch = fetch;
window.fetch = function(...args) {
  console.log('Request:', args);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Response:', response.status, response.statusText);
      return response;
    });
};
```

### Test Configuration
```bash
# Check if your configuration is correct
curl -X GET "http://localhost:3000/api/test/config"

# Test S3 connection
curl -X GET "http://localhost:3000/api/test/s3"
```

### Validate Authentication
```bash
# Test your secret key
curl -X GET "http://localhost:3000/api/auth/verify" \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

## Common Troubleshooting Steps

1. **Check Environment Variables**: Ensure all required variables are set
2. **Verify Network Connectivity**: Test if API endpoint is reachable
3. **Validate Request Format**: Check JSON syntax and required fields
4. **Test Authentication**: Use `/api/auth/verify` to test token
5. **Check File Paths**: Ensure paths follow the correct format
6. **Monitor Server Logs**: Check server console for additional error details
7. **Test with Simple Operations**: Start with basic operations before complex ones

## Error Prevention

### Input Validation
```javascript
function validateFilePath(path) {
  if (!path) {
    throw new Error('File path is required');
  }
  
  if (!path.startsWith('users/')) {
    throw new Error('File path must start with users/');
  }
  
  if (path.includes('..')) {
    throw new Error('Path traversal not allowed');
  }
  
  return path;
}
```

### Request Validation
```javascript
function validateRequest(method, path, data) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
    throw new Error('Invalid HTTP method');
  }
  
  if (method === 'PUT' && !data?.content) {
    throw new Error('Content is required for file updates');
  }
  
  validateFilePath(path);
}
```

By following these error handling patterns and best practices, you can build robust applications that gracefully handle API errors and provide good user experiences even when things go wrong.