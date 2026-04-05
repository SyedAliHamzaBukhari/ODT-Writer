# ODT Writer - High-Level Design (HLD)
## Back-End Architecture

**Version:** 1.0  
**Date:** April 2025  
**Author:** ODT Writer Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Architecture Diagrams](#architecture-diagrams)
4. [Component Architecture](#component-architecture)
5. [Technology Stack](#technology-stack)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Security Architecture](#security-architecture)
8. [Scalability Considerations](#scalability-considerations)
9. [Deployment Architecture](#deployment-architecture)
10. [Monitoring & Observability](#monitoring--observability)

---

## Overview

This document provides the high-level design for ODT Writer's back-end architecture, focusing on system-level decisions, technology choices, component interactions, and non-functional requirements.

### System Purpose

ODT Writer is a cloud-based document editor that provides:
- Multi-user document creation and editing
- Real-time collaboration capabilities
- Secure user authentication and authorization
- Persistent document storage
- Rich text formatting and table support

### Key Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Availability** | 99.9% uptime |
| **Response Time** | < 100ms for API calls |
| **Throughput** | 1000+ concurrent users |
| **Security** | Encrypted data in transit and at rest |
| **Scalability** | Horizontal scaling capability |
| **Data Durability** | 99.999% data persistence |

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │   Web      │  │  Mobile    │  │   Future   │               │
│  │  Browser   │  │   App      │  │  Clients   │               │
│  │  (Next.js) │  │  (React)   │  │            │               │
│  └─────┬──────┘  └─────┬──────┘  └────────────┘               │
└────────┼─────────────────┼────────────────────────────────────┘
         │                 │
         └────────┬────────┘
                  │ HTTPS/WSS
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js Server (Port 3000)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   App Router │  │  API Routes  │  │  Middleware  │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Application Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  NextAuth    │  │  Document    │  │  Business    │       │
│  │  Service     │  │  Service     │  │  Logic       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Prisma ORM  │  │  Query       │  │  Cache       │       │
│  │  (Client)    │  │  Builder    │  │  (Redis)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Data Storage Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   SQLite     │  │    MySQL     │  │   File       │       │
│  │ (Development)│  │ (Production) │  │   Storage    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Diagrams

### 1. Deployment Architecture Diagram

```
                    ┌─────────────────┐
                    │     Users       │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │     CDN         │
                    │   (Static)      │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼──────┐  ┌──────▼──────┐
            │   Region 1   │  │  Region 2   │
            │   (Primary)  │  │  (Backup)   │
            └───────┬──────┘  └──────┬──────┘
                    │                 │
        ┌───────────┼─────────────────┼───────────┐
        │           │                 │           │
   ┌────▼────┐ ┌──▼────┐      ┌────▼───┐ ┌──▼────┐
   │  Load   │ │  App  │      │  Load  │ │  App  │
   │Balancer │ │Server │      │Balancer│ │Server │
   └────┬────┘ └───┬───┘      └────┬───┘ └───┬───┘
        │           │                │         │
        └───────────┼────────────────┼─────────┘
                    │                │
            ┌───────▼────────────────▼───────┐
            │     Shared Database Cluster    │
            │  ┌─────────┐  ┌─────────────┐  │
            │  │  Master │  │   Read      │  │
            │  │ (Write) │  │  Replicas   │  │
            │  └─────────┘  └─────────────┘  │
            └────────────────────────────────┘
```

### 2. Authentication Flow Diagram

```
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│  Client  │    │  NextAuth  │    │  Database  │    │   Session   │    │  Browser  │
└────┬─────┘    └─────┬──────┘    └─────┬──────┘    └─────┬──────┘    └────┬─────┘
     │                │                  │                  │                │
     │ 1. POST /register                  │                  │                │
     │    {credentials}                   │                  │                │
     ├───────────────>│                  │                  │                │
     │                │                  │                  │                │
     │                │ 2. Check email uniqueness              │                │
     │                ├─────────────────>│                  │                │
     │                │                  │                  │                │
     │                │ 3. Email available                  │                │
     │                │<─────────────────┤                  │                │
     │                │                  │                  │                │
     │                │ 4. Hash password (bcrypt)            │                │
     │                │                  │                  │                │
     │                │ 5. INSERT user                       │                │
     │                ├──────────────────────────────────────>│                │
     │                │                  │                  │                │
     │                │ 6. User created                     │                │
     │                │<──────────────────────────────────────┤                │
     │                │                  │                  │                │
     │ 7. 201 Created  │                  │                  │                │
     │    {user}       │                  │                  │                │
     │<───────────────┤                  │                  │                │
     │                │                  │                  │                │
     │ 8. POST /login                     │                  │                │
     │    {email, password}               │                  │                │
     ├───────────────>│                  │                  │                │
     │                │                  │                  │                │
     │                │ 9. SELECT user by email             │                │
     │                ├─────────────────>│                  │                │
     │                │                  │                  │                │
     │                │ 10. User data                       │                │
     │                │<─────────────────┤                  │                │
     │                │                  │                  │                │
     │                │ 11. Verify password                │                │
     │                │                  │                  │                │
     │                │ 12. Generate JWT token              │                │
     │                │                  │                  │                │
     │ 13. 200 OK      │                  │                  │                │
     │     Set-Cookie  │                  │                  │                │
     │     (session)   │                  │                  │                │
     │<───────────────┤                  │                  │                │
     │                │                  │                  │                │
     │                │                  │ 14. Store session                 │
     │                │                  │<──────────────────────────────>│
     │                │                  │                  │                │
```

### 3. Document Operations Sequence Diagram

```
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│  Client  │    │  API Route │    │  Document  │    │  Prisma    │    │ Database │
└────┬─────┘    └─────┬──────┘    └─────┬──────┘    └─────┬──────┘    └────┬─────┘
     │                │                  │                  │                │
     │ GET /api/documents                │                  │                │
     ├───────────────>│                  │                  │                │
     │                │                  │                  │                │
     │                │ Verify session   │                  │                │
     │                │ (getServerSession)                │                │
     │                │                  │                  │                │
     │                │ Call service    │                  │                │
     │                ├─────────────────>│                  │                │
     │                │                  │                  │                │
     │                │                  │ Prisma query    │                │
     │                │                  ├─────────────────>│                │
     │                │                  │                  │                │
     │                │                  │                  │ SELECT * FROM
     │                │                  │                  │ documents
     │                │                  │                  │ WHERE user_id = ?
     │                │                  │                  │                │
     │                │                  │                  │                │
     │                │                  │                  │ Result set     │
     │                │                  │<─────────────────┤                │
     │                │                  │                  │                │
     │                │  Return docs     │                  │                │
     │                │<─────────────────┤                  │                │
     │                │                  │                  │                │
     │ 200 OK          │                  │                  │                │
     │ {documents: []}│                  │                  │                │
     │<───────────────┤                  │                  │                │
     │                │                  │                  │                │
     │                │                  │                  │                │
```

### 4. Auto-Save Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Frontend (Browser)                             │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Editor Component                             │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │                  ContentEditable Area                     │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              │ onInput                                 │
│                              ↓                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                   Debounce Function (2s)                        │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Timer Management                                         │  │   │
│  │  │  - Clear existing timer on new input                     │  │   │
│  │  │  - Start new 2s timer                                     │  │   │
│  │  │  - Execute save on timer expiry                         │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              │ Timer expires                           │
│                              ↓                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                   Save Function                                  │   │
│  │  - Get content from editor                                    │   │
│  │  - PUT /api/documents/:id                                      │   │
│  │  - Update save status indicator                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│                         Backend (Server)                              │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                   API Route Handler                             │   │
│  │  - Verify authentication                                     │   │
│  │  - Validate ownership                                        │   │
│  │  - Update document in database                               │   │
│  │  - Return 200 OK                                             │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Back-End Component Structure

```
Backend Components:
│
├── API Layer (src/app/api/)
│   ├── Authentication
│   │   ├── [...nextauth]/route.ts
│   │   │   ├── NextAuth configuration
│   │   │   ├── Credentials provider
│   │   │   ├── JWT callbacks
│   │   │   └── Session management
│   │   └── register/route.ts
│   │       ├── User registration
│   │       ├── Input validation
│   │       ├── Password hashing
│   │       └── Error handling
│   │
│   └── Documents
│       ├── route.ts
│       │   ├── GET: List documents
│       │   └── POST: Create document
│       └── [id]/route.ts
│           ├── GET: Get single document
│           ├── PUT: Update document
│           └── DELETE: Delete document
│
├── Business Logic Layer (src/lib/)
│   ├── auth.ts
│   │   ├── NextAuth options
│   │   ├── Provider configuration
│   │   └── Callback functions
│   │
│   └── db.ts
│       ├── Prisma client singleton
│       ├── Connection management
│       └── Query logging
│
├── Data Access Layer (Prisma ORM)
│   ├── Schema definition (prisma/schema.prisma)
│   ├── Migrations
│   └── Type generation
│
└── Infrastructure
    ├── Environment configuration (.env)
    ├── Session storage (JWT)
    └── Error handling middleware
```

### Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                          Client Request                            │
└──────────────────────────────────────┬─────────────────────────────┘
                                       │
                                       ↓
┌────────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                     Middleware Stack                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │  CORS    │  │  Security│  │  Logging │  │  Error   │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ↓                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    API Route Handler                           │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │              Session Verification                         │ │ │
│  │  │  - getServerSession(authOptions)                      │ │ │
│  │  │  - Extract user ID from JWT                            │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                              │                                     │
│  │                              ↓                                     │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │                 Input Validation                          │ │ │
│  │  │  - Zod schema validation                               │ │ │
│  │  │  - Type checking                                       │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                              │                                     │
│  │                              ↓                                     │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │                  Business Logic                             │ │ │
│  │  │  - Ownership verification                              │ │ │
│  │  │  - Data transformation                                 │ │ │
│  │  │  - Business rules                                     │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                              │                                     │
│  │                              ↓                                     │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │                  Data Access                                │ │ │
│  │  │  - Prisma Client operations                           │ │ │
│  │  │  - Query building                                      │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────┬─────────────────────────────┘
                                       │
                                       ↓
┌────────────────────────────────────────────────────────────────────┐
│                        Database (SQLite/MySQL)                       │
└────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Technology Stack                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │   Frontend          │  │   Backend           │                  │
│  ├─────────────────────┤  ├─────────────────────┤                  │
│  │ • Next.js 16        │  │ • Next.js 16        │                  │
│  │ • React 19          │  │ • Node.js/Bun      │                  │
│  │ • TypeScript 5      │  │ • TypeScript 5      │                  │
│  │ • Tailwind CSS 4    │  │ • Prisma ORM        │                  │
│  │ • shadcn/ui         │  │ • NextAuth.js v4    │                  │
│  │ • Lucide Icons      │  │ • bcrypt            │                  │
│  └─────────────────────┘  │ • Zod (validation)  │                  │
│                           └─────────────────────┘                  │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │   Database          │  │   Infrastructure    │                  │
│  ├─────────────────────┤  ├─────────────────────┤                  │
│  │ • SQLite (Dev)      │  │ • Git               │                  │
│  │ • MySQL (Prod)      │  │ • Docker (Optional) │                  │
│  │ • Prisma Migrations │  │ • CI/CD Pipeline    │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Rationale

| Technology | Reason for Choice |
|-------------|-------------------|
| **Next.js 16** | Full-stack framework, API routes, SSR/SSG, excellent performance |
| **TypeScript** | Type safety, better developer experience, reduced bugs |
| **Prisma ORM** | Type-safe database access, excellent migrations, multi-db support |
| **NextAuth.js** | Industry standard for Next.js authentication, flexible providers |
| **bcrypt** | Secure password hashing, widely adopted, battle-tested |
| **Zod** | Runtime type validation, TypeScript integration, schema-first |
| **Tailwind CSS 4** | Utility-first, highly customizable, small bundle size |

---

## Data Flow Architecture

### Request-Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HTTP Request Flow                                │
│                                                                     │
│  1. Client Request                                                 │
│     ↓                                                              │
│  2. CDN/Edge (Static assets)                                      │
│     ↓                                                              │
│  3. Load Balancer (Optional)                                       │
│     ↓                                                              │
│  4. Next.js Server                                                 │
│     ├→ Middleware (CORS, Security, Logging)                        │
│     ├→ Route Matching                                              │
│     ├→ API Route Handler                                          │
│     │   ├→ Authentication Check (NextAuth)                         │
│     │   ├→ Input Validation (Zod)                                  │
│     │   ├→ Business Logic                                          │
│     │   ├→ Database Operation (Prisma)                            │
│     │   └→ Response Formatting                                     │
│     ↓                                                              │
│  5. Response                                                      │
│     ├→ Headers (CORS, Security)                                    │
│     ├→ Status Code                                                 │
│     └→ Body (JSON/HTML)                                            │
│     ↓                                                              │
│  6. Client Receives Response                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Multi-Layer Caching                              │
│                                                                     │
│  Level 1: Browser Cache (CDN)                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • Static assets (CSS, JS, images)                            │ │
│  │ • Cache-Control headers                                        │ │
│  │ • Long TTL (1 year with hash)                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Level 2: React Query (Client)                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • Document lists                                              │ │
│  │ • User session data                                          │ │
│  │ • Stale-while-revalidate strategy                             │ │
│  │ • 5-15 min TTL                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Level 3: In-Memory Cache (Server - Optional)                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • Hot documents                                              │ │
│  │ • User authentication tokens                                   │ │
│  │ • Session data                                               │ │
│  │ • 1-5 min TTL                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Level 4: Database (Source of Truth)                             │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • Persistent storage                                          │ │
│  │ • Query results                                               │ │
│  │ • No TTL                                                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Security Architecture                            │
│                                                                     │
│  Layer 1: Network Security                                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • HTTPS/TLS 1.3 (All traffic encrypted)                      │ │
│  │ • DDoS Protection (CDN/WAF)                                   │ │
│  │ • Rate Limiting (IP-based)                                    │ │
│  │ • CORS Policy (Restricted origins)                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Layer 2: Application Security                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • Authentication (NextAuth.js)                                │ │
│  │   - JWT Session tokens                                        │ │
│  │   - Secure HTTP-only cookies                                 │ │
│  │   - CSRF protection                                           │ │
│  │                                                                │ │
│  │ • Authorization                                                │ │
│  │   - Role-based access control                                 │ │
│  │   - Resource ownership verification                            │ │
│  │   - Route protection middleware                               │ │
│  │                                                                │ │
│  │ • Input Validation                                             │ │
│  │   - Zod schema validation                                    │ │
│  │   - Type checking                                             │ │
│  │   - Length limits                                             │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Layer 3: Data Security                                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • Password Security                                            │ │
│  │   - bcrypt hashing (12 rounds)                               │ │
│  │   - Minimum 8 characters                                      │ │
│  │   - Complexity requirements                                   │ │
│  │                                                                │ │
│  │ • Data Sanitization                                           │ │
│  │   - HTML sanitization (DOMPurify)                             │ │
│  │   - SQL injection prevention (Prisma)                         │ │
│  │   - XSS prevention                                            │ │
│  │                                                                │ │
│  │ • Encryption at Rest (Future)                                  │ │
│  │   - Document content encryption                               │ │
│  │   - Database encryption                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Layer 4: Infrastructure Security                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ • Environment Variables                                        │
│  │   - Secrets in .env (never in git)                            │ │
│  │   - NEXTAUTH_SECRET rotation                                   │ │
│  │   - Database credentials                                      │ │
│  │                                                                │ │
│  │ • Logging & Monitoring                                        │
│  │   - Audit logs for sensitive operations                        │ │
│  │   - Error tracking (Sentry)                                   │
│  │   - Security event logging                                    │ │
│  │                                                                │ │
│  │ • Backup & Recovery                                            │
│  │   - Automated database backups                                 │
│  │   - Disaster recovery plan                                    │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                 Authentication & Authorization Flow                   │
│                                                                     │
│  Registration Flow:                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │  Client  │───>│   API    │───>│  Validate│───>│   DB     │    │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    │
│       │              │              │              │              │
│       │              │              │              │              │
│       │              │              │   Hash PW     │              │
│       │              │              │<─────────────┤              │
│       │              │              │              │              │
│       │              │              │ Create User   │              │
│       │              │              ├─────────────>│              │
│       │              │              │              │              │
│       │              │   201 Created│              │              │
│       │<─────────────┤              │              │              │
│       │              │              │              │              │
│                                                                     │
│  Login Flow:                                                        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │  Client  │───>│  NextAuth│───>│   DB     │───>│   JWT    │    │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    │
│       │              │              │              │              │
│       │              │              │              │              │
│       │              │   Get User   │              │              │
│       │              ├─────────────>│              │              │
│       │              │              │              │              │
│       │              │   Verify PW  │              │              │
│       │              │<─────────────┤              │              │
│       │              │              │              │              │
│       │              │  Generate Token             │              │
│       │              ├────────────────────────────>│              │
│       │              │              │              │              │
│       │              │   Set Cookie                 │              │
│       │<─────────────┤              │              │              │
│       │              │              │              │              │
│                                                                     │
│  Protected Request Flow:                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │  Client  │───>│  API     │───>│ Validate │───>│   DB     │    │
│  │  +Cookie │    │  Route   │    │  Token   │    │  Query   │    │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    │
│       │              │              │              │              │
│       │              │   Verify JWT                │              │
│       │              ├─────────────>│              │              │
│       │              │              │              │              │
│       │              │   Extract userId             │              │
│       │              │<─────────────┤              │              │
│       │              │              │              │              │
│       │              │  Execute with userId        │              │
│       │              ├────────────────────────────>│              │
│       │              │              │              │              │
│       │   Response   │              │              │              │
│       │<─────────────┤              │              │              │
│       │              │              │              │              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Scalability Architecture                         │
│                                                                     │
│  Current Scale (Single Instance):                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Next.js Server (Port 3000)                                 │ │
│  │  • SQLite Database (file-based)                               │ │
│  │  • In-memory sessions (JWT)                                    │ │
│  │  • Supports: 100-500 concurrent users                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Production Scale (Multi-Instance):                                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Load Balancer (NGINX/Cloud LB)                            │ │
│  │  • Multiple Next.js instances (horizontal scaling)            │ │
│  │  • MySQL Database (read replicas)                             │ │
│  │  • Redis (session storage & caching)                         │ │
│  │  • CDN (static assets)                                        │ │
│  │  • Supports: 10,000+ concurrent users                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Large Scale (Distributed):                                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Global CDN (multi-region)                                 │ │
│  │  • Microservices architecture (future)                        │ │
│  │  • Event-driven communication (Kafka/RabbitMQ)                 │ │
│  │  • Distributed caching (Redis Cluster)                       │ │
│  │  • Database sharding (user-based)                             │ │
│  │  • Supports: 100,000+ concurrent users                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Optimization

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Performance Optimization                         │
│                                                                     │
│  Database Optimization:                                             │
│  • Proper indexing on foreign keys and timestamps                  │
│  • Connection pooling (Prisma)                                     │
│  • Query optimization (N+1 prevention)                             │
│  • Read replicas (MySQL)                                           │
│                                                                     │
│  API Optimization:                                                  │
│  • Response compression (gzip)                                     │
│  • Rate limiting (prevent abuse)                                   │
│  • Efficient JSON serialization                                    │
│  • Edge caching (CDN)                                              │
│                                                                     │
│  Caching Strategy:                                                 │
│  • Client-side caching (React Query)                               │
│  • Server-side caching (Redis)                                     │
│  • CDN caching (static assets)                                    │
│  • Database query caching                                          │
│                                                                     │
│  Code Optimization:                                                 │
│  • Code splitting (dynamic imports)                               │
│  • Tree shaking (unused code elimination)                         │
│  • Lazy loading (components, images)                              │
│  • Memoization (React.memo, useMemo)                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Development Deployment                             │
│                                                                     │
│  Local Machine:                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Next.js Dev Server (bun run dev)                          │ │
│  │  • SQLite Database (local file)                               │ │
│  │  • Hot Module Replacement (HMR)                                │ │
│  │  • TypeScript compilation on-the-fly                           │ │
│  │  • Environment variables from .env                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Access: http://localhost:3000                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Production Deployment                              │
│                                                                     │
│  Infrastructure:                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │              Load Balancer (NGINX)                      │ │ │
│  │  │  • SSL termination                                         │ │ │
│  │  │  • Static file serving                                     │ │ │
│  │  │  • Reverse proxy to app servers                         │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                          │                                     │ │
│  │  ┌─────────────────────┼─────────────────────┐               │ │
│  │  │                     │                     │               │ │
│  │  ↓                     ↓                     ↓               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │ │
│  │  │  Next.js    │  │  Next.js    │  │  Next.js    │      │ │
│  │  │  Server 1   │  │  Server 2   │  │  Server 3   │      │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │ │
│  │         │               │               │                │ │
│  │         └───────────────┼───────────────┘                │ │
│  │                         ↓                                │ │
│  │  ┌──────────────────────────────────────┐               │ │
│  │  │         Redis (Session Store)        │               │ │
│  │  └──────────────────────────────────────┘               │ │
│  │                         │                                │ │
│  │                         ↓                                │ │
│  │  ┌──────────────────────────────────────┐               │ │
│  │  │       MySQL Database Cluster         │               │ │
│  │  │  ┌─────────┐  ┌─────────────────┐     │               │ │
│  │  │  │ Master  │  │   Read Replicas │     │               │ │
│  │  │  │(Write)  │  │     (3x)         │     │               │ │
│  │  │  └─────────┘  └─────────────────┘     │               │ │
│  │  └──────────────────────────────────────┘               │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Deployment:                                                        │
│  • CI/CD Pipeline (GitHub Actions)                               │
│  • Automated testing (unit, integration, E2E)                   │
│  • Blue-green deployment (zero downtime)                         │
│  • Health checks and auto-scaling                                │
│  • Automated backups (daily)                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

### Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Monitoring Architecture                           │
│                                                                     │
│  Application Monitoring:                                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Next.js Analytics                                         │ │
│  │  • Custom error tracking                                     │ │
│  │  • Performance metrics                                        │ │
│  │  • API response times                                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Logging:                                                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Structured logs (JSON)                                     │ │
│  │  • Request/Response logging                                   │ │
│  │  • Error stack traces                                         │ │
│  │  • Audit trails for sensitive operations                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Metrics:                                                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Request rate (RPS)                                         │ │
│  │  • Error rate (%)                                             │ │
│  │  • Response time percentiles (p50, p95, p99)                  │ │
│  │  • Database query performance                                 │ │
│  │  • Memory and CPU usage                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  Alerting:                                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • High error rate threshold                                  │ │
│  │  • Slow response time alerts                                  │ │
│  │  • Database connection failures                               │ │
│  │  • Server resource exhaustion                                  │ │
│  │  • Security event alerts                                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Performance Indicators (KPIs)

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| **Availability** | Uptime percentage | 99.9% | < 99.5% |
| **Response Time** | API call duration | < 100ms | > 500ms |
| **Error Rate** | Failed requests / total | < 0.1% | > 1% |
| **Throughput** | Requests per second | > 1000 | < 100 |
| **DB Query Time** | Average query duration | < 10ms | > 50ms |
| **Session Duration** | Average user session | > 5 min | < 1 min |

---

## Conclusion

This high-level design provides a comprehensive architectural blueprint for ODT Writer's back-end, ensuring:

- **Scalability**: From single instance to distributed architecture
- **Security**: Multi-layered security with defense in depth
- **Performance**: Optimized for low latency and high throughput
- **Reliability**: High availability with redundancy and failover
- **Maintainability**: Clean architecture with clear separation of concerns
- **Observability**: Comprehensive monitoring and alerting

The architecture is designed to evolve from a simple MVP to a production-ready system serving thousands of users while maintaining security, performance, and reliability.
