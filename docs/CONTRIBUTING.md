# Contributing to WebWiki

Thank you for your interest in contributing to WebWiki! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS S3 bucket for file storage
- AWS credentials with S3 access

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webwiki
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Test the setup**
   ```bash
   # Test configuration
   curl http://localhost:3000/api/test/config
   
   # Test S3 connection
   curl http://localhost:3000/api/test/s3
   ```

## Project Structure

```
webwiki/
├── app/                    # Nuxt.js application
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── pages/             # Application pages
│   └── assets/            # Static assets
├── server/                # Server-side code
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── wiki/          # Wiki/file management endpoints
│   │   └── test/          # Testing/debug endpoints
│   └── utils/             # Server utilities
├── docs/                  # Documentation
│   └── api/               # API documentation
├── public/                # Static public files
└── package.json           # Project dependencies
```

## API Development

### Creating New Endpoints

1. **Choose the appropriate directory**
   - Authentication: `server/api/auth/`
   - File operations: `server/api/wiki/`
   - Testing: `server/api/test/`

2. **Follow naming conventions**
   - Use kebab-case for file names
   - Use HTTP method suffixes: `.get.ts`, `.post.ts`, `.put.ts`, `.delete.ts`
   - Use `[...path].ts` for dynamic routes

3. **Implement the endpoint**
   ```typescript
   export default defineEventHandler(async (event) => {
     // Authentication (if required)
     const user = requireAuth(event);
     
     // Input validation
     const body = await readBody(event);
     if (!body.requiredField) {
       throw createError({
         statusCode: 400,
         statusMessage: "Required field is missing"
       });
     }
     
     // Business logic
     try {
       // Implementation here
       return {
         success: true,
         data: result
       };
     } catch (error) {
       throw createError({
         statusCode: 500,
         statusMessage: `Operation failed: ${error.message}`
       });
     }
   });
   ```

4. **Add authentication where needed**
   ```typescript
   import { requireAuth, requirePathAccess } from "../../utils/auth";
   
   // Require valid user
   const user = requireAuth(event);
   
   // Check path access for file operations
   requirePathAccess(user, filePath);
   ```

### API Guidelines

- **Always validate input** - Check required fields and data types
- **Use consistent error format** - Follow the established error response pattern
- **Implement proper authentication** - Use `requireAuth` for protected endpoints
- **Handle errors gracefully** - Provide meaningful error messages
- **Follow RESTful principles** - Use appropriate HTTP methods and status codes
- **Document your endpoints** - Update API documentation

## Frontend Development

### Component Development

1. **Use TypeScript** for all new components
2. **Follow Vue 3 Composition API** patterns
3. **Use Nuxt composables** where appropriate
4. **Implement proper error handling**

### Example Component Structure

```vue
<template>
  <div class="component-name">
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref, computed, onMounted } from 'vue'

// Props and emits
interface Props {
  // Define props
}

const props = defineProps<Props>()
const emit = defineEmits<{
  // Define emits
}>()

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const computedValue = computed(() => {
  // Computed logic
})

// Methods
const handleAction = async () => {
  // Method implementation
}

// Lifecycle
onMounted(() => {
  // Initialization
})
</script>

<style scoped>
.component-name {
  /* Component styles */
}
</style>
```

### Styling Guidelines

- Use **CSS custom properties** for theming
- Follow **mobile-first** responsive design
- Use **semantic HTML** elements
- Implement **dark mode** support
- Keep styles **scoped** to components

## Testing

### API Testing

Test API endpoints using curl or your preferred HTTP client:

```bash
# Test authentication
curl -X POST "http://localhost:3000/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "email": "test@example.com"}'

# Test file operations
curl -X PUT "http://localhost:3000/api/wiki/users/test/file.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRET_KEY" \
  -d '{"content": "Test content"}'
```

### Manual Testing Checklist

- [ ] User creation and authentication
- [ ] File CRUD operations
- [ ] Directory operations
- [ ] Batch operations
- [ ] Error handling
- [ ] Path access control
- [ ] S3 integration

### Testing Environment

Use the test endpoints to verify your setup:

```bash
# Check configuration
curl http://localhost:3000/api/test/config

# Test S3 connection
curl http://localhost:3000/api/test/s3
```

## Documentation

### API Documentation

When adding new endpoints:

1. **Update the appropriate documentation file** in `docs/api/`
2. **Include complete examples** with curl commands
3. **Document all parameters** and response formats
4. **Add error scenarios** and troubleshooting tips
5. **Update the main API overview** if needed

### Documentation Standards

- Use **clear, concise language**
- Provide **working examples**
- Include **error handling** information
- Keep **consistent formatting**
- **Update table of contents** when needed

## Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** as needed
3. **Check for linting errors**
4. **Verify API compatibility**
5. **Test with different scenarios**

### PR Requirements

- **Clear description** of changes
- **List of affected endpoints** (if applicable)
- **Testing instructions** for reviewers
- **Documentation updates** included
- **Breaking changes** clearly marked

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Testing
- [ ] Tested locally
- [ ] API endpoints work correctly
- [ ] Documentation updated
- [ ] No breaking changes

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Changes tested
```

## Code Style

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **async/await** over promises
- Implement **proper error handling**
- Add **JSDoc comments** for complex functions

### Vue Components

- Use **Composition API**
- Define **TypeScript interfaces** for props
- Use **ref/reactive** appropriately
- Implement **proper cleanup** in onUnmounted

### API Endpoints

- Use **consistent naming** conventions
- Implement **proper validation**
- Follow **RESTful** principles
- Add **comprehensive error handling**
- Use **meaningful HTTP status codes**

## Environment Variables

Required environment variables:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name
```

## Common Issues and Solutions

### S3 Connection Issues
- Verify AWS credentials
- Check bucket permissions
- Ensure bucket exists in correct region

### Authentication Issues
- Check secret key format
- Verify user exists
- Ensure proper Authorization header

### Development Server Issues
- Clear node_modules and reinstall
- Check port availability
- Verify environment variables

## Getting Help

- Check existing [documentation](./docs/)
- Review [API examples](./docs/api/examples.md)
- Look at existing code for patterns
- Test with [debugging endpoints](./docs/api/testing.md)

## License

By contributing to WebWiki, you agree that your contributions will be licensed under the same license as the project.