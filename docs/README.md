# WebWiki Documentation

Welcome to the WebWiki project documentation. This is a Nuxt.js-based wiki application with file management capabilities powered by AWS S3.

## Table of Contents

- [API Documentation](./api/README.md) - Complete REST API reference
- [Authentication](./api/authentication.md) - User authentication and authorization
- [Wiki Operations](./api/wiki.md) - File and folder management
- [Testing](./api/testing.md) - Development and testing endpoints

## Project Overview

WebWiki is a personal wiki application that allows users to:

- Create and manage markdown files
- Organize content in folders
- Access files through a web interface
- Use REST API for programmatic access
- Secure access with user-based authentication

## Architecture

- **Frontend**: Nuxt.js with Vue 3 and TypeScript
- **Backend**: Nuxt server API routes
- **Storage**: AWS S3 for file storage
- **Authentication**: Bearer token-based authentication
- **Database**: File-based user management (in-memory for demo)

## Getting Started

1. **Prerequisites**: Node.js, AWS S3 bucket, AWS credentials
2. **Installation**: `npm install`
3. **Configuration**: Set up AWS credentials in environment variables
4. **Development**: `npm run dev`

## Environment Variables

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name
```

## Key Features

- **User Isolation**: Each user has their own directory space
- **File Management**: Full CRUD operations for files and folders
- **Batch Operations**: Multiple file operations in a single request
- **Metadata Access**: Get file information without content
- **Security**: Path-based access control and authentication