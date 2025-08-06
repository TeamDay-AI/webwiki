# API Usage Examples

This document provides practical examples of using the WebWiki API for common tasks.

## Getting Started

### 1. Initial Setup

```bash
# Create a new user
curl -X POST "http://localhost:3000/api/auth/users" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "email": "alice@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "alice",
    "email": "alice@example.com",
    "secretKey": "a1b2c3d4e5f6789abcdef1234567890abcdef1234567890abcdef1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isActive": true
  },
  "message": "User created successfully"
}
```

**Save your secret key** - you'll need it for all subsequent requests!

### 2. Verify Authentication

```bash
# Test your authentication token
curl -X GET "http://localhost:3000/api/auth/verify" \
  -H "Authorization: Bearer a1b2c3d4e5f6789abcdef1234567890abcdef1234567890abcdef1234567890"
```

## Common Workflows

### Create a Personal Knowledge Base

```bash
# Set your secret key for reuse
SECRET_KEY="a1b2c3d4e5f6789abcdef1234567890abcdef1234567890abcdef1234567890"
BASE_URL="http://localhost:3000"

# 1. Create main folders
curl -X POST "$BASE_URL/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"path": "users/alice/notes"}'

curl -X POST "$BASE_URL/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"path": "users/alice/projects"}'

curl -X POST "$BASE_URL/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"path": "users/alice/archive"}'

# 2. Create a welcome note
curl -X PUT "$BASE_URL/api/wiki/users/alice/welcome.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "content": "# Welcome to My Wiki\n\nThis is my personal knowledge base.\n\n## Sections\n\n- [Notes](./notes/)\n- [Projects](./projects/)\n- [Archive](./archive/)\n"
  }'

# 3. Create some notes
curl -X PUT "$BASE_URL/api/wiki/users/alice/notes/ideas.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "content": "# Ideas\n\n## Project Ideas\n\n- [ ] Build a personal wiki\n- [ ] Learn more about APIs\n- [ ] Create a reading list\n\n## Random Thoughts\n\n- Documentation is really important\n- APIs should be intuitive\n"
  }'

# 4. List your files
curl -X GET "$BASE_URL/api/wiki/users/alice" \
  -H "Authorization: Bearer $SECRET_KEY"
```

### Project Documentation Workflow

```bash
# Create a project structure
SECRET_KEY="your_secret_key_here"
BASE_URL="http://localhost:3000"

# 1. Create project folder
curl -X POST "$BASE_URL/api/wiki/folder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"path": "users/alice/projects/awesome-app"}'

# 2. Create project documentation
curl -X PUT "$BASE_URL/api/wiki/users/alice/projects/awesome-app/README.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "content": "# Awesome App\n\nA revolutionary application that will change everything.\n\n## Features\n\n- Feature 1: Amazing functionality\n- Feature 2: Incredible performance\n- Feature 3: Beautiful design\n\n## Getting Started\n\nSee [setup instructions](./setup.md) for details.\n"
  }'

curl -X PUT "$BASE_URL/api/wiki/users/alice/projects/awesome-app/setup.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "content": "# Setup Instructions\n\n## Prerequisites\n\n- Node.js 18+\n- npm or yarn\n- Database (PostgreSQL recommended)\n\n## Installation\n\n1. Clone the repository\n2. Install dependencies: `npm install`\n3. Configure environment variables\n4. Run migrations: `npm run migrate`\n5. Start development server: `npm run dev`\n"
  }'

# 3. Create a changelog
curl -X PUT "$BASE_URL/api/wiki/users/alice/projects/awesome-app/CHANGELOG.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "content": "# Changelog\n\n## [Unreleased]\n\n### Added\n- Initial project setup\n- Basic documentation\n\n### Changed\n- Nothing yet\n\n### Fixed\n- Nothing yet\n"
  }'
```

### File Management Operations

```bash
SECRET_KEY="your_secret_key_here"
BASE_URL="http://localhost:3000"

# 1. Create a draft
curl -X PUT "$BASE_URL/api/wiki/users/alice/draft.md" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{"content": "# Draft Article\n\nThis is a work in progress..."}'

# 2. Copy draft to projects folder
curl -X POST "$BASE_URL/api/wiki/copy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "sourcePath": "users/alice/draft.md",
    "destinationPath": "users/alice/projects/article-draft.md",
    "isDirectory": false
  }'

# 3. Rename the original draft
curl -X POST "$BASE_URL/api/wiki/rename" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "oldPath": "users/alice/draft.md",
    "newPath": "users/alice/archive/old-draft.md",
    "isDirectory": false
  }'

# 4. Get metadata for the new file
curl -X GET "$BASE_URL/api/wiki/metadata/users/alice/projects/article-draft.md" \
  -H "Authorization: Bearer $SECRET_KEY"
```

### Batch Operations Example

```bash
SECRET_KEY="your_secret_key_here"
BASE_URL="http://localhost:3000"

# Clean up multiple files at once
curl -X POST "$BASE_URL/api/wiki/batch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET_KEY" \
  -d '{
    "operations": [
      {
        "operation": "copy",
        "sourcePath": "users/alice/important-note.md",
        "destinationPath": "users/alice/archive/important-note-backup.md",
        "isDirectory": false
      },
      {
        "operation": "move",
        "sourcePath": "users/alice/temp-folder",
        "destinationPath": "users/alice/archive/temp-folder",
        "isDirectory": true
      },
      {
        "operation": "delete",
        "sourcePath": "users/alice/old-file.md",
        "isDirectory": false
      }
    ]
  }'
```

## JavaScript/Node.js Examples

### Basic API Client

```javascript
class WebWikiClient {
  constructor(baseUrl, secretKey) {
    this.baseUrl = baseUrl;
    this.secretKey = secretKey;
  }

  async request(method, path, data = null) {
    const headers = {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };

    const config = {
      method,
      headers
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${path}`, config);
    return response.json();
  }

  // File operations
  async getFile(path) {
    return this.request('GET', `/api/wiki/${path}`);
  }

  async saveFile(path, content) {
    return this.request('PUT', `/api/wiki/${path}`, { content });
  }

  async deleteFile(path) {
    return this.request('DELETE', `/api/wiki/${path}`);
  }

  // Directory operations
  async createFolder(path) {
    return this.request('POST', '/api/wiki/folder', { path });
  }

  async listDirectory(path) {
    return this.request('GET', `/api/wiki/${path}`);
  }

  // Management operations
  async renameFile(oldPath, newPath, isDirectory = false) {
    return this.request('POST', '/api/wiki/rename', {
      oldPath,
      newPath,
      isDirectory
    });
  }

  async copyFile(sourcePath, destinationPath, isDirectory = false) {
    return this.request('POST', '/api/wiki/copy', {
      sourcePath,
      destinationPath,
      isDirectory
    });
  }
}

// Usage example
const client = new WebWikiClient(
  'http://localhost:3000',
  'your_secret_key_here'
);

async function example() {
  // Create a note
  await client.saveFile(
    'users/alice/meeting-notes.md',
    '# Meeting Notes\n\n## Attendees\n- Alice\n- Bob\n\n## Action Items\n- [ ] Follow up on project\n'
  );

  // List files
  const files = await client.listDirectory('users/alice');
  console.log('Files:', files);

  // Get file content
  const note = await client.getFile('users/alice/meeting-notes.md');
  console.log('Note content:', note.content);
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useWikiFile(path, secretKey) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/wiki/${path}`, {
        headers: {
          'Authorization': `Bearer ${secretKey}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContent(data.content);
      } else {
        setError('Failed to load file');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async (newContent) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/wiki/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContent(newContent);
      } else {
        setError('Failed to save file');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (path) {
      loadFile();
    }
  }, [path]);

  return { content, loading, error, saveFile, reload: loadFile };
}

// Usage in component
function WikiEditor({ filePath, secretKey }) {
  const { content, loading, error, saveFile } = useWikiFile(filePath, secretKey);
  const [editContent, setEditContent] = useState(content);

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  const handleSave = () => {
    saveFile(editContent);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## Python Examples

### Simple Python Client

```python
import requests
import json

class WebWikiClient:
    def __init__(self, base_url, secret_key):
        self.base_url = base_url
        self.secret_key = secret_key
        self.headers = {
            'Authorization': f'Bearer {secret_key}',
            'Content-Type': 'application/json'
        }
    
    def get_file(self, path):
        response = requests.get(f'{self.base_url}/api/wiki/{path}', headers=self.headers)
        return response.json()
    
    def save_file(self, path, content):
        data = {'content': content}
        response = requests.put(f'{self.base_url}/api/wiki/{path}', 
                               headers=self.headers, json=data)
        return response.json()
    
    def create_folder(self, path):
        data = {'path': path}
        response = requests.post(f'{self.base_url}/api/wiki/folder',
                                headers=self.headers, json=data)
        return response.json()
    
    def list_directory(self, path):
        response = requests.get(f'{self.base_url}/api/wiki/{path}', headers=self.headers)
        return response.json()

# Usage
client = WebWikiClient('http://localhost:3000', 'your_secret_key_here')

# Create a daily journal entry
import datetime
today = datetime.date.today().isoformat()

journal_content = f"""# Journal Entry - {today}

## Today's Accomplishments
- Learned about WebWiki API
- Created some documentation
- Made progress on projects

## Tomorrow's Goals
- Continue API exploration
- Build something cool
"""

result = client.save_file(f'users/alice/journal/{today}.md', journal_content)
print(f'Journal saved: {result}')

# List all journal entries
journal_files = client.list_directory('users/alice/journal')
print(f'Journal entries: {journal_files}')
```

## Error Handling Examples

### Robust Error Handling

```javascript
async function robustFileOperation(client, operation) {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      return { 
        success: false, 
        error: 'Authentication failed. Please check your secret key.' 
      };
    } else if (error.status === 403) {
      return { 
        success: false, 
        error: 'Access denied. You can only access your own files.' 
      };
    } else if (error.status === 404) {
      return { 
        success: false, 
        error: 'File or directory not found.' 
      };
    } else {
      return { 
        success: false, 
        error: `Unexpected error: ${error.message}` 
      };
    }
  }
}

// Usage
const result = await robustFileOperation(client, () => 
  client.getFile('users/alice/nonexistent.md')
);

if (result.success) {
  console.log('File content:', result.data.content);
} else {
  console.error('Operation failed:', result.error);
}
```

## Performance Tips

1. **Batch Operations**: Use batch API for multiple operations
2. **Metadata First**: Use metadata endpoint to check file existence before reading content
3. **Caching**: Cache file content on client side when appropriate
4. **Pagination**: For large directories, consider implementing pagination

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use environment variables** for secret keys in server applications
3. **Implement proper error handling** to avoid information leakage
4. **Validate user input** before making API calls
5. **Use HTTPS** in production environments