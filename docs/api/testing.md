# Testing API

The Testing API provides endpoints for development and configuration validation.

## Overview

These endpoints are designed for development, debugging, and system health checks. They help verify that the application is properly configured and can connect to required services.

## Endpoints

### Check Configuration

**GET** `/api/test/config`

Check the current runtime configuration and verify environment variables are set.

**Response:**
```json
{
  "awsRegion": "us-east-1",
  "s3BucketName": "my-wiki-bucket",
  "hasAwsAccessKey": true,
  "hasAwsSecretKey": true
}
```

**Response Fields:**
- `awsRegion` - AWS region setting (or "NOT SET")
- `s3BucketName` - S3 bucket name (or "NOT SET")
- `hasAwsAccessKey` - Boolean indicating if AWS access key is configured
- `hasAwsSecretKey` - Boolean indicating if AWS secret key is configured

**Example:**
```bash
curl -X GET "/api/test/config"
```

**Use Cases:**
- Verify environment variables are loaded correctly
- Debug configuration issues during deployment
- Check which settings are missing

---

### Test S3 Connection

**GET** `/api/test/s3`

Test the connection to AWS S3 and verify bucket access.

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully connected to S3 bucket 'my-wiki-bucket' in region 'us-east-1'"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "S3 connection failed: The specified bucket does not exist"
}
```

**Example:**
```bash
curl -X GET "/api/test/s3"
```

**Common Error Messages:**
- `"Missing AWS configuration. Check your .env file."` - Environment variables not set
- `"The specified bucket does not exist"` - S3 bucket name is incorrect
- `"Access Denied"` - AWS credentials don't have permission to access the bucket
- `"Invalid security token"` - AWS credentials are invalid or expired

**Use Cases:**
- Verify S3 connectivity during setup
- Debug AWS credential issues
- Confirm bucket permissions are correct

## Development Workflow

### Setup Verification Checklist

Use these endpoints to verify your development environment is properly configured:

```bash
# 1. Check configuration
echo "=== Configuration Check ==="
curl -X GET "/api/test/config"

# 2. Test S3 connection
echo -e "\n=== S3 Connection Test ==="
curl -X GET "/api/test/s3"

# 3. If both pass, test basic API functionality
echo -e "\n=== API Functionality Test ==="
curl -X POST "/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "email": "test@example.com"}'
```

### Troubleshooting Guide

#### Configuration Issues

If `/api/test/config` shows missing values:

1. **Check `.env` file exists** in project root
2. **Verify environment variable names** match exactly:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`
3. **Restart the development server** after changing `.env`

#### S3 Connection Issues

If `/api/test/s3` fails:

1. **Verify AWS credentials** are valid and not expired
2. **Check bucket exists** in the specified region
3. **Verify IAM permissions** include:
   - `s3:ListBucket`
   - `s3:GetObject`
   - `s3:PutObject`
   - `s3:DeleteObject`
4. **Check region matches** between bucket and configuration

### Example Environment Setup

```env
# .env file
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=my-webwiki-bucket
```

### Automated Health Check Script

```bash
#!/bin/bash
# health-check.sh

echo "WebWiki Health Check"
echo "==================="

# Test configuration
CONFIG_RESULT=$(curl -s "/api/test/config")
echo "Configuration: $CONFIG_RESULT"

# Test S3 connection
S3_RESULT=$(curl -s "/api/test/s3")
echo "S3 Connection: $S3_RESULT"

# Check if S3 test passed
if echo "$S3_RESULT" | grep -q '"success":true'; then
    echo "✅ All systems operational"
    exit 0
else
    echo "❌ System issues detected"
    exit 1
fi
```

## Security Considerations

- **No Authentication Required**: These endpoints don't require authentication for easier debugging
- **Information Disclosure**: Configuration endpoint reveals some system information
- **Production Use**: Consider disabling or securing these endpoints in production
- **Rate Limiting**: No rate limiting is applied to these endpoints

## Production Recommendations

For production deployments:

1. **Disable Test Endpoints**: Remove or secure test endpoints
2. **Monitor S3 Connectivity**: Implement proper health checks
3. **Log Configuration**: Log configuration issues for debugging
4. **Environment Validation**: Validate environment on startup

```javascript
// Example: Disable test routes in production
if (process.env.NODE_ENV === 'production') {
  // Remove test routes or add authentication
}
```