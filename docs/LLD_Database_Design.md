# ODT Writer - Low-Level Design (LLD)
## Database Design

**Version:** 1.0  
**Date:** April 2025  
**Author:** ODT Writer Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Entity-Relationship Diagram](#entity-relationship-diagram)
4. [Table Definitions](#table-definitions)
5. [Index Strategy](#index-strategy)
6. [Relationships](#relationships)
7. [Data Types](#data-types)
8. [Constraints](#constraints)
9. [Migration Strategy](#migration-strategy)

---

## Overview

This document provides the low-level database design for ODT Writer, focusing on the physical schema, data types, constraints, indexes, and relationships. The database is implemented using **Prisma ORM** with **SQLite** (configurable for MySQL).

### Database Choice

- **Development:** SQLite (file-based, no setup required)
- **Production:** MySQL (recommended for scalability)
- **ORM:** Prisma 6.5.0

---

## Database Schema

### ER Diagram (UML Notation)

```
┌─────────────────────────────────────────────────────────────┐
│                          User                                │
├─────────────────────────────────────────────────────────────┤
│ + id: String (PK, CUID)                                     │
│ + username: String (UNIQUE)                                 │
│ + email: String (UNIQUE)                                    │
│ + passwordHash: String                                      │
│ + createdAt: DateTime                                       │
│ + updatedAt: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│                         1                                 │
│                         │                                   │
│                         | has                               │
│                         |                                   │
│                         N                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                       Document                               │
├─────────────────────────────────────────────────────────────┤
│ + id: String (PK, CUID)                                     │
│ + userId: String (FK)                                       │
│ + title: String (DEFAULT: "Untitled")                       │
│ + content: String (LONGTEXT)                                │
│ + createdAt: DateTime                                       │
│ + updatedAt: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│            FK: user_id → User.id (ON DELETE CASCADE)        │
│            Indexes: (userId), (updatedAt)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### 1. Users Table

```sql
CREATE TABLE users (
  id           VARCHAR(25)  PRIMARY KEY,
  username     VARCHAR(100) NOT NULL UNIQUE,
  email        VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Specifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(25) | PRIMARY KEY | Unique identifier using CUID |
| `username` | VARCHAR(100) | NOT NULL, UNIQUE | User's display name |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | User's email address |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `created_at` | DATETIME | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | DATETIME | AUTO UPDATE | Last update timestamp |

#### Security Considerations

- Passwords are hashed using **bcrypt** with 12 salt rounds
- `password_hash` field stores only the hash, never plaintext
- Email and username are indexed for fast lookup during authentication

---

### 2. Documents Table

```sql
CREATE TABLE documents (
  id         VARCHAR(25)  PRIMARY KEY,
  user_id    VARCHAR(25)  NOT NULL,
  title      VARCHAR(255) DEFAULT 'Untitled',
  content    TEXT         NOT NULL DEFAULT '',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at)
);
```

#### Column Specifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(25) | PRIMARY KEY | Unique document identifier |
| `user_id` | VARCHAR(25) | NOT NULL, FK | Owner's user ID |
| `title` | VARCHAR(255) | DEFAULT "Untitled" | Document title |
| `content` | TEXT | NOT NULL, DEFAULT "" | HTML content of document |
| `created_at` | DATETIME | DEFAULT NOW() | Creation timestamp |
| `updated_at` | DATETIME | AUTO UPDATE | Last modification timestamp |

#### MySQL Variant (for production)

```sql
CREATE TABLE documents (
  id         VARCHAR(25)  PRIMARY KEY,
  user_id    VARCHAR(25)  NOT NULL,
  title      VARCHAR(255) DEFAULT 'Untitled',
  content    LONGTEXT     NOT NULL DEFAULT '',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Index Strategy

### Indexes on Users Table

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `PRIMARY` | `id` | Primary Key | Fast record lookup |
| `users_username_unique` | `username` | Unique | Login via username |
| `users_email_unique` | `email` | Unique | Login via email |

### Indexes on Documents Table

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `PRIMARY` | `id` | Primary Key | Fast document lookup |
| `idx_user_id` | `user_id` | B-Tree | Query user's documents |
| `idx_updated_at` | `updated_at` | B-Tree | Sort by last modified |

### Index Usage Scenarios

```
Query 1: Get all documents for a user
─────────────────────────────────────────
SELECT * FROM documents 
WHERE user_id = ? 
ORDER BY updated_at DESC;
              ↓
         Uses: idx_user_id (filter)
              idx_updated_at (sort)

Query 2: Authenticate user by email
─────────────────────────────────────────
SELECT * FROM users 
WHERE email = ?;
              ↓
         Uses: users_email_unique

Query 3: Get single document
─────────────────────────────────────────
SELECT * FROM documents 
WHERE id = ? AND user_id = ?;
              ↓
         Uses: PRIMARY (id lookup)
              idx_user_id (ownership check)
```

---

## Relationships

### Relationship Cardinality

```
User ─────── Document
 │              │
 │ 1            │ N
 │              │
 │ has          │ belongs to
 │              │
 ↓              ↓
one           many
```

### Relationship Rules

| Rule | Description |
|------|-------------|
| **Cardinality** | One-to-Many (1:N) |
| **Participation** | Total participation (Document must have a User) |
| **Delete Rule** | CASCADE (deleting User deletes all Documents) |
| **Update Rule** | RESTRICT (cannot change user_id if user doesn't exist) |

### Foreign Key Constraint

```
Foreign Key: documents.user_id → users.id
ON DELETE: CASCADE
ON UPDATE: RESTRICT

Cascade Delete Flow:
User(id: "user123") deleted
         ↓
All documents WHERE user_id = "user123" automatically deleted
         ↓
Data integrity maintained
```

---

## Data Types

### Type Mapping (Prisma → Database)

| Prisma Type | SQLite | MySQL | Description |
|-------------|--------|-------|-------------|
| `String` | `TEXT` | `VARCHAR(255)` | Variable-length text |
| `String @id` | `TEXT` (25 chars) | `VARCHAR(25)` | CUID identifier |
| `DateTime` | `TEXT` (ISO-8601) | `DATETIME` | Timestamp |
| `Int` | `INTEGER` | `INT` | Integer values |
| `Boolean` | `INTEGER` (0/1) | `BOOLEAN/TINYINT` | True/False |

### CUID Identifier Format

```
Format: abc123xyz456...
Length: 25 characters
Encoding: Base36 (0-9, a-z)
Uniqueness: Collision-resistant, sortable

Example:
- User ID: "cm2k3j4n5o6p7q8r9s0t1u2v"
- Document ID: "clm1n2o3p4q5r6s7t8u9v0w1x"
```

### DateTime Storage Format

```
Format: ISO-8601
SQLite: TEXT (e.g., "2025-04-05T16:30:45.123Z")
MySQL: DATETIME (e.g., "2025-04-05 16:30:45")

Timezone: UTC (Coordinated Universal Time)
```

---

## Constraints

### Primary Key Constraints

```sql
-- Users Table
ALTER TABLE users 
ADD CONSTRAINT pk_users PRIMARY KEY (id);

-- Documents Table
ALTER TABLE documents 
ADD CONSTRAINT pk_documents PRIMARY KEY (id);
```

### Unique Constraints

```sql
-- Users Table
ALTER TABLE users 
ADD CONSTRAINT uq_users_username UNIQUE (username);

ALTER TABLE users 
ADD CONSTRAINT uq_users_email UNIQUE (email);
```

### Foreign Key Constraints

```sql
-- Documents Table
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_user_id 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE RESTRICT;
```

### Check Constraints

```sql
-- Password hash length (bcrypt minimum)
ALTER TABLE users 
ADD CONSTRAINT chk_password_hash_length 
CHECK (LENGTH(password_hash) >= 60);

-- Username length
ALTER TABLE users 
ADD CONSTRAINT chk_username_length 
CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 100);

-- Email format (basic validation)
ALTER TABLE users 
ADD CONSTRAINT chk_email_format 
CHECK (email LIKE '%_@__%.__%');
```

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String     @id @default(cuid())
  username     String     @unique
  email        String     @unique
  passwordHash String     @map("password_hash")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  documents    Document[]

  @@map("users")
}

model Document {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  title     String   @default("Untitled")
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([updatedAt])
  @@map("documents")
}
```

---

## Migration Strategy

### Version Control for Schema

```
migrations/
├── 20250405_000001_init.sql
├── 20250405_000002_add_indexes.sql
├── 20250405_000003_add_constraints.sql
└── ...
```

### Rollback Strategy

```sql
-- Rollback to previous version
BEGIN TRANSACTION;

-- Drop foreign keys
ALTER TABLE documents DROP FOREIGN KEY fk_documents_user_id;

-- Drop tables
DROP TABLE documents;
DROP TABLE users;

COMMIT;
```

### Data Migration Example

```sql
-- Scenario: Add document metadata field
BEGIN TRANSACTION;

-- Add new column
ALTER TABLE documents ADD COLUMN metadata TEXT;

-- Migrate existing data (if needed)
UPDATE documents SET metadata = '{}' WHERE metadata IS NULL;

COMMIT;
```

---

## Query Patterns

### Common Queries

#### 1. User Authentication

```sql
-- Get user by email for authentication
SELECT id, username, email, password_hash 
FROM users 
WHERE email = 'user@example.com';
```

#### 2. List User's Documents

```sql
-- Get all documents for a user, sorted by recent
SELECT id, title, updated_at 
FROM documents 
WHERE user_id = ? 
ORDER BY updated_at DESC 
LIMIT 50;
```

#### 3. Get Single Document

```sql
-- Get a specific document with ownership check
SELECT * 
FROM documents 
WHERE id = ? AND user_id = ?;
```

#### 4. Create Document

```sql
-- Insert new document
INSERT INTO documents (id, user_id, title, content, created_at, updated_at)
VALUES (?, ?, 'Untitled', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

#### 5. Update Document

```sql
-- Update document content
UPDATE documents 
SET content = ?, updated_at = CURRENT_TIMESTAMP 
WHERE id = ? AND user_id = ?;
```

#### 6. Delete Document

```sql
-- Delete document with ownership check
DELETE FROM documents 
WHERE id = ? AND user_id = ?;
```

#### 7. Delete User and All Documents

```sql
-- Cascade delete handled by foreign key
DELETE FROM users WHERE id = ?;
-- This automatically deletes all related documents
```

---

## Performance Considerations

### Query Optimization

```
Optimized Query Flow:
┌─────────────┐
│ Application │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ Prisma Client   │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│   Query Plan    │
│  (Index Usage)  │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  Database       │
│  (SQLite/MySQL) │
└─────────────────┘

Index Hit Ratio Target: > 95%
Average Query Time: < 10ms (single document), < 50ms (list)
```

### Connection Pooling

```javascript
// Prisma Client Singleton Pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

### Caching Strategy

```
Application Cache Layers:
┌─────────────────────────────────────┐
│   React Query (Client Side)         │  ← 5 min TTL
│   - Document lists                 │
│   - User session                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   In-Memory Cache (Optional)       │  ← 1 min TTL
│   - Hot documents                  │
│   - User profiles                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Database (Source of Truth)        │
│   - SQLite / MySQL                 │
└─────────────────────────────────────┘
```

---

## Security Measures

### Data Protection

| Measure | Implementation |
|---------|----------------|
| **Password Hashing** | bcrypt with 12 salt rounds |
| **SQL Injection Prevention** | Prisma parameterized queries |
| **Data Isolation** | User-specific queries with user_id filter |
| **Cascade Delete** | Automatic cleanup on user deletion |
| **Input Validation** | Application-level validation before DB operations |

### Access Control Flow

```
Authentication Flow:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │ →  │ NextAuth │ →  │ Database │ →  │  Session │
│ Request  │    │ Verify   │    │  Query   │    │ Created  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │
                                     ↓
                            ┌────────────────┐
                            │ Ownership Check│
                            │ (WHERE user_id)│
                            └────────────────┘
```

---

## Backup and Recovery

### SQLite Backup

```bash
# Online backup (no downtime)
cp odt_writer.db odt_writer_backup_$(date +%Y%m%d).db

# SQLite backup command
sqlite3 odt_writer.db ".backup 'odt_writer_backup.db'"
```

### MySQL Backup

```bash
# Full database dump
mysqldump -u root -p odt_writer > odt_writer_backup_$(date +%Y%m%d).sql

# Restore
mysql -u root -p odt_writer < odt_writer_backup.sql
```

---

## Monitoring and Maintenance

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Query Response Time | < 50ms | > 200ms |
| Index Hit Ratio | > 95% | < 80% |
| Connection Pool Usage | < 80% | > 90% |
| Database Size | Monitor | > 1GB |

### Maintenance Tasks

```
Weekly:
- Analyze query performance
- Check index usage
- Review slow queries

Monthly:
- Vacuum database (SQLite)
- Optimize tables (MySQL)
- Update statistics

Quarterly:
- Review index strategy
- Archive old documents
- Capacity planning
```

---

## Conclusion

This low-level database design provides a robust foundation for the ODT Writer application. The schema is optimized for:

- **Performance**: Proper indexing on frequently queried columns
- **Security**: Password hashing, input validation, data isolation
- **Integrity**: Foreign key constraints with CASCADE delete
- **Scalability**: Easy migration from SQLite to MySQL
- **Maintainability**: Clear naming conventions and documentation

The design follows database normalization principles while maintaining practical performance characteristics for a document editor application.
