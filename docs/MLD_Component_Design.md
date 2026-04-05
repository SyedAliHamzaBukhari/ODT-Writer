# ODT Writer - Middle-Level Design (MLD)
## Component and Module Design

**Version:** 1.0  
**Date:** April 2025  
**Author:** ODT Writer Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Diagram](#component-diagram)
4. [Module Descriptions](#module-descriptions)
5. [API Design](#api-design)
6. [State Management](#state-management)
7. [Data Flow](#data-flow)
8. [Security Implementation](#security-implementation)
9. [Error Handling](#error-handling)
10. [Performance Optimization](#performance-optimization)

---

## Overview

This document provides the middle-level design for ODT Writer, focusing on component architecture, module interactions, API design, and data flow. It bridges the gap between high-level architecture and low-level database design.

### Design Principles

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
- **Single Responsibility**: Each component/module has one well-defined purpose
- **DRY (Don't Repeat Yourself)**: Reusable components and utilities
- **Type Safety**: Full TypeScript implementation
- **Testability**: Dependency injection and pure functions where possible

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │  Register    │  │   Editor     │      │
│  │   Page       │  │   Page       │  │   Page       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │  Document    │  │  Session     │      │
│  │  Services    │  │  Services    │  │  Management  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Password    │  │  Document    │  │  Validation  │      │
│  │   Handler    │  │   Manager    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Prisma     │  │  Database    │  │  Cache       │      │
│  │   Client     │  │  Queries     │  │  Layer       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Users      │  │  Documents   │                         │
│  │   Table      │  │   Table      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Diagram

### Frontend Component Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                         App                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    AuthProvider                         │ │
│  │              (Session Management)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    RootLayout                           │ │
│  │  ┌────────────────────────────────────────────────────┐│ │
│  │  │                    Toaster                          ││ │
│  │  └────────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   LoginPage     │  │  RegisterPage   │  │  EditorPage  │ │
│  │                 │  │                 │  │              │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌──────────┐ │ │
│  │ │ LoginForm   │ │  │ │ RegisterForm│ │  │ │ Sidebar  │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ │          │ │ │
│  └─────────────────┘  └─────────────────┘  │ │ ┌──────┐ │ │
│                                               │ │ │ DocList│ │ │
│                                               │ │ └──────┘ │ │
│                                               │ │          │ │
│                                               │ │ ┌──────┐ │ │
│                                               │ │ │Editor│ │ │
│                                               │ │ │      │ │ │
│                                               │ │ └──────┘ │ │
│                                               │ │          │ │
│                                               │ │ ┌──────┐ │ │
│                                               │ │ │Toolbar│ │ │
│                                               │ │ └──────┘ │ │
│                                               │ │          │ │
│                                               │ │ ┌──────┐ │ │
│                                               │ │ │Status│ │ │
│                                               │ │ │  Bar │ │ │
│                                               │ │ └──────┘ │ │
│                                               │ └──────────┘ │ │
│                                               └──────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Backend Component Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    API Routes Layer                           │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              /api/auth/[...nextauth]                      ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  ││
│  │  │  GET     │  │  POST    │  │  Credentials Provider │  ││
│  │  │(Session) │  │(Sign In) │  │   (Authorize)        │  ││
│  │  └──────────┘  └──────────┘  └──────────────────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │                  /api/auth/register                       ││
│  │  ┌────────────────────────────────────────────────────┐ ││
│  │  │              POST (Register User)                   │ ││
│  │  └────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │                  /api/documents                           ││
│  │  ┌──────────┐  ┌──────────────────────────────────────┐ ││
│  │  │  GET     │  │  POST (Create Document)               │ ││
│  │  │(List)    │  │                                        │ ││
│  │  └──────────┘  └──────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │                /api/documents/[id]                       ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ ││
│  │  │  GET     │  │  PUT     │  │    DELETE             │ ││
│  │  │(Get)     │  │(Update)  │  │   (Delete)            │ ││
│  │  └──────────┘  └──────────┘  └──────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## Module Descriptions

### Frontend Modules

#### 1. Authentication Module (`src/app/login/`, `src/app/register/`)

**Purpose**: Handle user authentication and registration

**Components**:
```typescript
// LoginForm Component
interface LoginFormProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

// RegisterForm Component
interface RegisterFormProps {
  onRegisterSuccess?: () => void;
  onRegisterError?: (error: string) => void;
}
```

**Responsibilities**:
- Capture user input
- Validate form data
- Communicate with authentication API
- Handle success/error states
- Redirect on successful authentication

**Dependencies**:
- `next-auth/react` - Session management
- `next/navigation` - Routing
- Custom hooks for validation

---

#### 2. Document Editor Module (`src/app/page.tsx`)

**Purpose**: Main editor interface with document management

**Sub-Components**:

```typescript
// Sidebar Component
interface SidebarProps {
  documents: Document[];
  currentDocument: Document | null;
  onSelectDocument: (doc: Document) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

// Editor Component
interface EditorProps {
  document: Document;
  onChange: (content: string) => void;
  onSave: () => void;
}

// FloatingToolbar Component
interface FloatingToolbarProps {
  position: { top: number; left: number };
  onFormat: (command: string, value?: string) => void;
  onInsertTable: (rows: number, cols: number) => void;
  visible: boolean;
}

// StatusBar Component
interface StatusBarProps {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  lastEdited: string;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}
```

**State Management**:

```typescript
interface EditorState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  isSaving: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  wordCount: number;
  characterCount: number;
  readingTime: number;
}
```

**Hooks Used**:

```typescript
// Custom hook for document operations
function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchDocuments = useCallback(async () => { ... }, []);
  const createDocument = useCallback(async (data) => { ... }, []);
  const updateDocument = useCallback(async (id, data) => { ... }, []);
  const deleteDocument = useCallback(async (id) => { ... }, []);
  
  return { documents, loading, fetchDocuments, createDocument, updateDocument, deleteDocument };
}

// Custom hook for auto-save
function useAutoSave(document: Document | null, onSave: () => void, delay: number = 2000) {
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(onSave, delay);
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [document, onSave, delay]);
}
```

---

#### 3. Rich Text Module

**Purpose**: Handle text formatting and content editing

**Text Formatting Commands**:

```typescript
type FormatCommand = 
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'formatBlock:h1'
  | 'formatBlock:h2'
  | 'formatBlock:h3'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'insertHTML';

interface FormatOptions {
  command: FormatCommand;
  value?: string;
}

function executeFormat(command: FormatCommand, value?: string): void {
  document.execCommand(command, false, value);
}
```

**Table Management**:

```typescript
interface TableConfig {
  rows: number;
  cols: number;
}

interface TableCell {
  content: string;
  row: number;
  col: number;
}

interface TableAction {
  type: 'addRowAbove' | 'addRowBelow' | 'deleteRow' | 'addColLeft' | 'addColRight' | 'deleteCol';
  position: { row: number; col: number };
}

function createTable(config: TableConfig): string {
  let html = '<table style="border-collapse: collapse; width: 100%;">';
  for (let i = 0; i < config.rows; i++) {
    html += '<tr>';
    for (let j = 0; j < config.cols; j++) {
      html += '<td style="border: 1px solid #3a3a3a; padding: 8px; min-width: 50px;" contenteditable="true"> </td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

function modifyTable(table: HTMLTableElement, action: TableAction): void {
  // Implementation for table modifications
}
```

---

### Backend Modules

#### 1. Authentication Module (`src/lib/auth.ts`, `src/app/api/auth/`)

**Purpose**: Handle user authentication and session management

**NextAuth Configuration**:

```typescript
interface AuthConfig {
  providers: Provider[];
  session: {
    strategy: 'jwt';
  };
  callbacks: {
    jwt: (params: { token: JWT; user?: User }) => Promise<JWT>;
    session: (params: { session: Session; token: JWT }) => Promise<Session>;
  };
  secret: string;
  pages: {
    signIn: string;
  };
}
```

**Auth Flow Sequence Diagram**:

```
┌──────────┐         ┌────────────┐         ┌────────────┐         ┌──────────┐
│  Client  │         │  NextAuth  │         │  Database  │         │  Session  │
└────┬─────┘         └─────┬──────┘         └─────┬──────┘         └────┬─────┘
     │                     │                      │                      │
     │ POST /auth/signin  │                      │                      │
     ├────────────────────>│                      │                      │
     │ {email, password}   │                      │                      │
     │                     │                      │                      │
     │                     │ SELECT * FROM users   │                      │
     │                     │ WHERE email = ?      │                      │
     │                     ├─────────────────────>│                      │
     │                     │                      │                      │
     │                     │     user data       │                      │
     │                     │<─────────────────────┤                      │
     │                     │                      │                      │
     │                     │  bcrypt.compare()   │                      │
     │                     │                      │                      │
     │     200 OK          │                      │                      │
     │     session token   │                      │                      │
     │<────────────────────┤                      │                      │
     │                     │                      │                      │
     │     Set-Cookie      │                      │                      │
     │     (session)       │                      │                      │
     │<──────────────────────────────────────────────────────────────>│
     │                     │                      │                      │
     │                     │                      │                      │
```

**Password Hashing**:

```typescript
class PasswordService {
  private static readonly SALT_ROUNDS = 12;
  
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  static validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

---

#### 2. Document Service Module

**Purpose**: Business logic for document operations

**Document Service Class**:

```typescript
class DocumentService {
  constructor(private db: PrismaClient) {}
  
  async createDocument(userId: string, data: CreateDocumentDto): Promise<Document> {
    const document = await this.db.document.create({
      data: {
        userId,
        title: data.title || 'Untitled',
        content: data.content || '',
      }
    });
    
    return document;
  }
  
  async getDocument(id: string, userId: string): Promise<Document | null> {
    const document = await this.db.document.findUnique({
      where: { id }
    });
    
    if (!document) {
      return null;
    }
    
    // Ownership check
    if (document.userId !== userId) {
      throw new ForbiddenError('You do not have access to this document');
    }
    
    return document;
  }
  
  async updateDocument(id: string, userId: string, data: UpdateDocumentDto): Promise<Document> {
    // Verify ownership before update
    const existing = await this.getDocument(id, userId);
    if (!existing) {
      throw new NotFoundError('Document not found');
    }
    
    const document = await this.db.document.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
      }
    });
    
    return document;
  }
  
  async deleteDocument(id: string, userId: string): Promise<void> {
    // Verify ownership before delete
    const existing = await this.getDocument(id, userId);
    if (!existing) {
      throw new NotFoundError('Document not found');
    }
    
    await this.db.document.delete({
      where: { id }
    });
  }
  
  async listDocuments(userId: string): Promise<Document[]> {
    return this.db.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
```

---

#### 3. Validation Module

**Purpose**: Input validation and sanitization

**Validation Schemas**:

```typescript
import { z } from 'zod';

// User registration schema
export const RegisterUserSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must be less than 100 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email is too short')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Document schema
export const CreateDocumentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title is too long')
    .optional(),
  content: z.string().max(10000000, 'Content is too large').optional(),
});

export const UpdateDocumentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title is too long')
    .optional(),
  content: z.string().max(10000000, 'Content is too large').optional(),
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
type CreateDocumentDto = z.infer<typeof CreateDocumentSchema>;
type UpdateDocumentDto = z.infer<typeof UpdateDocumentSchema>;
type LoginDto = z.infer<typeof LoginSchema>;
```

**Validation Middleware**:

```typescript
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: Request): Promise<{ success: true; data: T } | { success: false; error: string }> => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);
      
      if (!result.success) {
        const errors = result.error.errors.map(e => e.message).join(', ');
        return { success: false, error: errors };
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: 'Invalid JSON' };
    }
  };
}
```

---

## API Design

### RESTful API Endpoints

#### Authentication Endpoints

```
POST /api/auth/register
Description: Register a new user
Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
Response (201):
{
  "user": {
    "id": "clm1n2o3p4q5r6s7t8u9v0w1x",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
Error (400):
{
  "error": "User with this email already exists"
}
```

#### Document Endpoints

```
GET /api/documents
Description: List all documents for authenticated user
Response (200):
{
  "documents": [
    {
      "id": "doc123",
      "title": "My Document",
      "content": "<p>Hello world</p>",
      "createdAt": "2025-04-05T10:00:00Z",
      "updatedAt": "2025-04-05T11:30:00Z"
    }
  ]
}
```

```
POST /api/documents
Description: Create a new document
Request Body:
{
  "title": "New Document",
  "content": ""
}
Response (201):
{
  "document": {
    "id": "doc456",
    "title": "New Document",
    "content": "",
    "createdAt": "2025-04-05T12:00:00Z",
    "updatedAt": "2025-04-05T12:00:00Z"
  }
}
```

```
GET /api/documents/:id
Description: Get a specific document
Response (200):
{
  "document": {
    "id": "doc456",
    "title": "New Document",
    "content": "<p>Hello world</p>",
    "createdAt": "2025-04-05T12:00:00Z",
    "updatedAt": "2025-04-05T12:15:00Z"
  }
}
Error (404): { "error": "Document not found" }
Error (403): { "error": "Forbidden" }
```

```
PUT /api/documents/:id
Description: Update a document
Request Body:
{
  "title": "Updated Title",
  "content": "<p>Updated content</p>"
}
Response (200):
{
  "document": { /* updated document */ }
}
```

```
DELETE /api/documents/:id
Description: Delete a document
Response (200):
{
  "success": true
}
```

### API Response Format

**Success Response**:
```typescript
interface ApiResponse<T> {
  data?: T;
  document?: T;
  documents?: T[];
  user?: T;
  success?: boolean;
}
```

**Error Response**:
```typescript
interface ApiError {
  error: string;
  code?: string;
  details?: any;
}
```

### HTTP Status Codes

| Status | Usage |
|--------|-------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## State Management

### Client-Side State

**React State Pattern**:

```typescript
// Document editor state
interface EditorState {
  // Document data
  documents: Document[];
  currentDocument: Document | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Editor state
  saveStatus: 'saved' | 'saving' | 'unsaved';
  
  // Statistics
  wordCount: number;
  characterCount: number;
  readingTime: number;
  
  // UI state
  showTablePicker: boolean;
  tableSize: { rows: number; cols: number };
  showFloatingToolbar: boolean;
  toolbarPosition: { top: number; left: number };
}

// State reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload, saveStatus: 'saved' };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'UPDATE_STATS':
      return { 
        ...state, 
        wordCount: action.payload.words,
        characterCount: action.payload.characters,
        readingTime: action.payload.readingTime
      };
    case 'TOGGLE_TABLE_PICKER':
      return { ...state, showTablePicker: !state.showTablePicker };
    default:
      return state;
  }
}
```

### Server-Side Session State

**NextAuth Session Structure**:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  expires: string;
}

interface JWT {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}
```

---

## Data Flow

### Document Creation Flow

```
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Client │   │  Editor  │   │   API    │   │  Service │   │ Database │
└────┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │             │             │             │             │
     │ Click "New" │             │             │             │
     ├─────────────>│             │             │             │
     │             │             │             │             │
     │             │ POST /api/documents            │             │
     │             │ {title: "Untitled"}            │             │
     │             ├────────────>│             │             │
     │             │             │             │             │
     │             │             │ Validate   │             │
     │             │             │ Auth Token │             │
     │             │             ├────────────>│             │
     │             │             │             │             │
     │             │             │             │             │
     │             │             │ Valid user │             │
     │             │             │<────────────┤             │
     │             │             │             │             │
     │             │             │ Create Document          │
     │             │             ├────────────────────────────>│
     │             │             │             │             │
     │             │             │             │ INSERT INTO documents
     │             │             │             │             │
     │             │             │             │             │
     │             │             │             │ New Document
     │             │             │<────────────────────────────┤
     │             │             │             │             │
     │             │             │ 201 Created│             │
     │             │             │ {document} │             │
     │             │<────────────┤             │             │
     │             │             │             │             │
     │             │ Update State│             │             │
     │             │ (add to list)            │             │
     │             │             │             │             │
     │ Update UI   │             │             │             │
     │ (show doc)  │             │             │             │
     │<─────────────┤             │             │             │
     │             │             │             │             │
```

### Auto-Save Flow

```
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Editor │   │  Debounce│   │   API    │   │ Database │
└────┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │             │             │             │
     │ User types   │             │             │
     │ content     │             │             │
     ├─────────────>│             │             │
     │             │             │             │
     │             │ Clear timer │             │
     │             │ Start 2s    │             │
     │             │ timer       │             │
     │             │             │             │
     │ More typing │             │             │
     ├─────────────>│             │             │
     │             │             │             │
     │             │ Reset timer │             │
     │             │             │             │
     │             │             │             │
     │ Timer fires  │             │             │
     │             │ GET content│             │
     │             │<────────────┤             │
     │             │             │             │
     │             │ PUT /api/documents/:id  │
     │             │ {content}  │             │
     │             ├────────────>│             │
     │             │             │             │
     │             │             │ UPDATE documents SET content
     │             │             ├────────────────────>│
     │             │             │             │
     │             │             │             │
     │             │             │ 200 OK     │
     │             │<────────────┤             │
     │             │             │             │
     │             │ "Saved"    │             │
     │<─────────────┤             │             │
     │             │             │             │
```

---

## Security Implementation

### Authentication Middleware

```typescript
export async function requireAuth(request: Request): Promise<{ userId: string } | Response> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in again." },
      { status: 401 }
    );
  }
  
  return { userId: session.user.id };
}

// Usage in API routes
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  
  if (auth instanceof Response) {
    return auth; // 401 response
  }
  
  const { userId } = auth;
  // Continue with authenticated request...
}
```

### Ownership Verification

```typescript
async function verifyOwnership(documentId: string, userId: string): Promise<Document> {
  const document = await db.document.findUnique({
    where: { id: documentId }
  });
  
  if (!document) {
    throw new NotFoundError('Document not found');
  }
  
  if (document.userId !== userId) {
    throw new ForbiddenError('You do not have access to this document');
  }
  
  return document;
}
```

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 's', 'code', 'pre',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'br', 'hr'
    ],
    ALLOWED_ATTR: ['style', 'contenteditable'],
    ALLOW_DATA_ATTR: false
  });
}
```

---

## Error Handling

### Error Types

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}
```

### Error Handler

```typescript
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof z.ZodError) {
    const errors = error.errors.map(e => e.message).join(', ');
    return NextResponse.json(
      { error: errors, code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists', code: 'DUPLICATE' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  }
  
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

---

## Performance Optimization

### Debouncing Strategy

```typescript
function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage
const debouncedSave = createDebouncedFunction(saveDocument, 2000);
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

function DocumentList({ documents }: { documents: Document[] }) {
  // Memoize sorted list
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [documents]);
  
  // Memoize event handlers
  const handleSelect = useCallback((id: string) => {
    onSelectDocument(id);
  }, [onSelectDocument]);
  
  return (
    <div>
      {sortedDocuments.map(doc => (
        <DocumentItem 
          key={doc.id} 
          document={doc} 
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

### Lazy Loading

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
});

const TablePicker = dynamic(() => import('@/components/TablePicker'), {
  ssr: false
});
```

---

## Conclusion

This middle-level design provides a comprehensive blueprint for implementing ODT Writer with:

- **Clear component architecture** with defined responsibilities
- **Well-structured API** with proper error handling
- **Type-safe implementation** using TypeScript
- **Secure authentication** with proper session management
- **Optimized performance** through debouncing, memoization, and caching
- **Maintainable codebase** following best practices

The design enables independent development and testing of components while ensuring seamless integration.
