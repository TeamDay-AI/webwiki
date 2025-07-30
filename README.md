# Wiki - Simple Markdown Wiki System

A clean, simple wiki system built with Nuxt 4, featuring S3 storage, Supabase authentication, and a three-panel interface for editing markdown files.

## Features

- **Authentication** - User registration and login with Supabase
- **S3 Storage** - Files stored as markdown in AWS S3 bucket
- **Three-Panel Layout** - Navigation | Editor | Table of Contents
- **Markdown Editor** - Live preview and keyboard shortcuts (Ctrl/Cmd+S to save)
- **File Management** - Create, edit, and delete markdown files
- **Directory Structure** - Organized file navigation
- **Table of Contents** - Auto-generated from markdown headings

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `S3_BUCKET_NAME` - S3 bucket name for storing files

### 2. Supabase Setup

1. Create a new Supabase project
2. Enable email authentication in Authentication > Settings
3. Copy the URL and anon key to your `.env` file

### 3. AWS S3 Setup

1. Create an S3 bucket
2. Set up IAM user with permissions for:
   - `s3:GetObject`
   - `s3:PutObject` 
   - `s3:DeleteObject`
   - `s3:ListBucket`
3. Add credentials to `.env` file

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## Usage

1. Navigate to the application
2. Sign up or sign in with your email
3. Use the left panel to navigate and create files
4. Edit files in the center panel with markdown
5. View the table of contents in the right panel
6. Save with Ctrl/Cmd+S or the Save button

## File Structure

```
app/
├── components/
│   ├── MarkdownEditor.vue     # Main editor component
│   ├── TableOfContents.vue    # TOC navigation
│   └── WikiNavigation.vue     # File navigation
├── composables/
│   └── useAuth.ts            # Authentication composable
├── pages/
│   ├── index.vue             # Landing page
│   └── wiki.vue              # Main wiki interface
├── plugins/
│   └── supabase.client.ts    # Supabase client setup
└── server/api/wiki/
    ├── files.get.ts          # List files
    ├── [...path].get.ts      # Get file content
    ├── [...path].put.ts      # Save file
    └── [...path].delete.ts   # Delete file
```

## API Endpoints

- `GET /api/wiki/files` - List all files in root
- `GET /api/wiki/[path]` - Get file content or directory listing
- `PUT /api/wiki/[path]` - Save file content
- `DELETE /api/wiki/[path]` - Delete file

## Tech Stack

- **Nuxt 4** - Vue.js framework
- **Nuxt UI** - Component library
- **Supabase** - Authentication and user management
- **AWS S3** - File storage
- **Marked** - Markdown parser
- **TypeScript** - Type safety
