# ODT Writer - Minimal Document Editor

A dark-themed, Notion-inspired online document editor built with Next.js 16, TypeScript, Tailwind CSS 4, Prisma, and NextAuth.js.

## Features

✨ **Rich Text Editing**
- Floating toolbar with bold, italic, underline
- Headings (H1, H2, H3)
- Ordered and unordered lists
- Inline code
- Tables with grid picker and context menu operations

🔐 **Authentication**
- User registration and login
- Secure password hashing with bcrypt
- Session-based authentication
- User data isolation

📊 **Document Management**
- Create, rename, and delete documents
- Auto-save every 2 seconds (debounced)
- Real-time save status indicator
- Documents sorted by last modified

📈 **Live Statistics**
- Word count
- Character count
- Estimated reading time
- Relative timestamps

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js v4
- **Icons**: Lucide React

## Installation & Setup

### Prerequisites

- Node.js 18+ or Bun 1.3+
- npm, yarn, or bun package manager

### Step 1: Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Step 2: Initialize Database

```bash
# Push Prisma schema to database
bun run db:push

# Or generate Prisma client first
bun run db:generate
```

### Step 3: Start Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev

# Or using yarn
yarn dev
```

The application will be available at **http://localhost:3000**

## Usage

### 1. Register an Account
- Click "Sign up" on the login page
- Enter username, email, and password
- Password must be at least 8 characters

### 2. Sign In
- Use your registered email and password
- A welcome document will be auto-created on first login

### 3. Create Documents
- Click "New Document" in the sidebar
- Documents are titled "Untitled" by default

### 4. Edit Content
- Type in the editor area
- **Select text** to see the floating formatting toolbar
- Use toolbar buttons for formatting options

### 5. Work with Tables
- Select text or position cursor where you want a table
- Click the table icon in the floating toolbar
- Hover over the grid to select dimensions (max 10×10)
- Click to insert the table
- **Right-click** on any cell for table operations

### 6. Manage Documents
- **Rename**: Click on any document title
- **Delete**: Hover over a document and click the trash icon
- Documents are auto-saved every 2 seconds

## Project Structure

```
my-project/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   └── documents/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── providers/session-provider.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   └── hooks/
├── prisma/schema.prisma
├── .env
├── package.json
└── next.config.ts
```

## Database Schema

```prisma
model User {
  id           String     @id @default(cuid())
  username     String     @unique
  email        String     @unique
  passwordHash String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  documents    Document[]
}

model Document {
  id        String   @id @default(cuid())
  userId    String
  title     String   @default("Untitled")
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime   @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Available Scripts

```bash
# Development
bun run dev          # Start development server on port 3000

# Database
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run database migrations
bun run db:reset     # Reset database (WARNING: deletes data)

# Code Quality
bun run lint         # Run ESLint

# Production
bun run build        # Build for production
bun run start        # Start production server
```

## Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- Server-side session management
- Ownership verification on all document operations
- SQL injection protection via Prisma
- Session-based authentication with secure cookies

## Switching to MySQL (Optional)

The project currently uses SQLite. To switch to MySQL:

1. Install MySQL server and create a database:
```sql
CREATE DATABASE odt_writer;
```

2. Update `.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/odt_writer"
```

3. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

4. Run:
```bash
bun run db:push
```

## Theme Colors

- Background: `#191919`
- Sidebar: `#1a1a1a`
- Text: `#e2e2e2`
- Accent/White: `#ffffff`

## Troubleshooting

### Port 3000 Already in Use
Change the port in `package.json`:
```json
"dev": "next dev -p 3001"
```

### Database Errors
Run `bun run db:push` to sync the schema with your database.

### NextAuth Session Issues
Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are correctly set in `.env`.

## License

This project is provided as-is for educational and personal use.
