const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        LevelFormat, TableOfContents, PageBreak, VerticalAlign, ShadingType } = require('docx');
const fs = require('fs');

// Color palette - "Ink & Zen" (Wabi-Sabi Style)
const colors = {
  primary: "0B1220",      // Titles
  body: "0F172A",          // Body Text
  secondary: "2B2B2B",     // Subtitles
  accent: "9AA6B2",        // UI / Decor
  tableBg: "F1F5F9"        // Table Header / Background
};

// Table border configuration
const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

// Create the document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Times New Roman", size: 22 }, // 11pt for body
      },
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, color: colors.primary, font: "Times New Roman" }, // 18pt
        paragraph: { spacing: { before: 600, after: 300 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: colors.secondary, font: "Times New Roman" }, // 14pt
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbered-list-1",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbered-list-2",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // Cover Page Section
    {
      properties: {
        page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } },
      },
      children: [
        new Paragraph({
          spacing: { before: 2800 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "ODT WRITER",
              size: 72,
              bold: true,
              color: colors.primary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Comprehensive Design Specification",
              size: 32,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "High, Mid, and Low Level Design Documents",
              size: 28,
              color: colors.accent,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 600 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Version 1.0",
              size: 24,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 400 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Document ID: CEP_PS",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 1000 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Confidential - Internal Use Only",
              size: 20,
              italics: true,
              color: colors.accent,
              font: "Times New Roman",
            }),
          ],
        }),
      ],
    },
    // Table of Contents Section
    {
      properties: {
        page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "ODT Writer - Design Specification",
                  size: 20,
                  color: colors.accent,
                  font: "Times New Roman",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Page ",
                  size: 20,
                  color: colors.body,
                }),
                new TextRun({
                  children: [{ type: "currentPage" }],
                  size: 20,
                  color: colors.body,
                }),
                new TextRun({
                  text: " of ",
                  size: 20,
                  color: colors.body,
                }),
                new TextRun({
                  children: [{ type: "totalPages" }],
                  size: 20,
                  color: colors.body,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "Table of Contents",
              size: 36,
              bold: true,
              color: colors.primary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({ children: [new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" })] }),
        new Paragraph({
          spacing: { before: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.",
              size: 18,
              color: "999999",
              italics: true,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // High Level Design Section
    {
      properties: {
        page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "ODT Writer - High Level Design",
                  size: 20,
                  color: colors.accent,
                  font: "Times New Roman",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Page ",
                  size: 20,
                  color: colors.body,
                }),
                new TextRun({
                  children: [{ type: "currentPage" }],
                  size: 20,
                  color: colors.body,
                }),
                new TextRun({
                  text: " of ",
                  size: 20,
                  color: colors.body,
                }),
                new TextRun({
                  children: [{ type: "totalPages" }],
                  size: 20,
                  color: colors.body,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // High Level Design Content
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "1. High Level Design",
              size: 36,
              bold: true,
              color: colors.primary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "1.1 System Overview",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "ODT Writer is a minimalist, Notion-inspired online document editor designed for efficient document creation and management. The system features a dark-themed two-panel layout with a left sidebar for document navigation and a centered main editor for content creation. The application provides real-time auto-save functionality, rich text formatting, table management, and comprehensive document statistics.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The system is built using Express.js with MySQL database backend, implementing session-based authentication to ensure document privacy and security. Each user has access only to their own documents, with server-side ownership verification on all operations. The frontend utilizes vanilla JavaScript with HTML/CSS to deliver a responsive, lightweight user experience without framework dependencies.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "1.2 System Architecture",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "ODT Writer follows a classic client-server architecture with clear separation of concerns. The client-side handles user interface interactions, document rendering, and real-time status updates. The server-side manages authentication, document persistence, and business logic enforcement. MySQL serves as the persistent data store, managing users and documents with proper relational constraints.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The authentication layer uses bcrypt for password hashing and express-session for session management. Protected routes require valid session authentication, redirecting unauthorized users to the login page. Document ownership is validated server-side on all CRUD operations to prevent unauthorized access across user boundaries.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "1.3 Key Features",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250, before: 100 },
          numbering: { reference: "bullet-list", level: 0 },
          children: [
            new TextRun({
              text: "Rich Text Formatting: Bold, italic, underline, headings, lists, and inline code via floating toolbar",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          numbering: { reference: "bullet-list", level: 0 },
          children: [
            new TextRun({
              text: "Table Management: Grid-based table insertion with customizable dimensions, inline cell editing, and context menu operations",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          numbering: { reference: "bullet-list", level: 0 },
          children: [
            new TextRun({
              text: "Document Management: Create, rename, delete documents with auto-save every 2 seconds and live status indicators",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          numbering: { reference: "bullet-list", level: 0 },
          children: [
            new TextRun({
              text: "Document Statistics: Real-time word count, character count, and estimated reading time in the status bar",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          numbering: { reference: "bullet-list", level: 0 },
          children: [
            new TextRun({
              text: "User Authentication: Secure registration and login with bcrypt password hashing and session-based authorization",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "1.4 Design Principles",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The system design prioritizes simplicity, performance, and user experience. The dark theme reduces eye strain during extended writing sessions. The minimal Notion-inspired interface eliminates visual clutter while maintaining powerful editing capabilities. Auto-save functionality ensures data is never lost due to unexpected closures or network interruptions.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Security is implemented at multiple layers. Passwords are hashed with bcrypt before storage. Sessions are managed server-side with secure cookies. Document ownership verification prevents unauthorized access. Input validation and SQL parameterization protect against injection attacks. The system provides clear visual feedback for all operations, including saving status, selection states, and action confirmations.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "1.5 Technology Stack",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Table({
          columnWidths: [3000, 3000, 3000],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "Layer", bold: true, size: 22, color: colors.primary, font: "Times New Roman" }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "Technology", bold: true, size: 22, color: colors.primary, font: "Times New Roman" }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "Purpose", bold: true, size: 22, color: colors.primary, font: "Times New Roman" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Frontend", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Vanilla JS, HTML, CSS", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "User interface and interactions", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Backend", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Express.js", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "API server and routing", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Database", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "MySQL with mysql2", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Data persistence", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Authentication", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "bcrypt, express-session", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 3000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Password hashing and session management", size: 22, color: colors.body, font: "Times New Roman" })],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ children: [new TextRun({ text: " ", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "Table 1: Technology Stack Overview", size: 18, italics: true, color: colors.accent, font: "Times New Roman" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // Mid Level Design Section
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "2. Mid Level Design",
              size: 36,
              bold: true,
              color: colors.primary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "2.1 Database Schema",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The database schema consists of two primary tables: users and documents. The users table stores authentication credentials and user metadata. Each user has a unique identifier, username, email address, bcrypt-hashed password, and creation timestamp. The email field is enforced as unique to prevent duplicate registrations. Passwords are never stored in plaintext and are hashed with a minimum of 10 salt rounds for security.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The documents table stores document content with a foreign key relationship to users. Each document belongs to exactly one user, established through the user_id field. A CASCADE delete constraint ensures that when a user is deleted, all associated documents are automatically removed. The title field defaults to 'Untitled' for new documents. The content field uses LONGTEXT to accommodate extensive document content. The updated_at timestamp automatically updates on any modification, enabling last-modified sorting in the sidebar.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "2.2 API Architecture",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The API is organized into logical route groups: authentication routes and document routes. Authentication routes handle user registration, login, and logout. Registration validates input uniqueness, hashes passwords, creates user records, and establishes sessions. Login verifies credentials, compares hashed passwords, and initializes authenticated sessions. Logout terminates sessions and clears session data.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Document routes are protected by authentication middleware that validates session presence before allowing access. The GET /api/documents endpoint retrieves all documents for the authenticated user, ordered by updated_at in descending order. POST /api/documents creates new documents with default title and content. GET /api/documents/:id retrieves a specific document, validating ownership before returning data. PUT /api/documents/:id updates document content and title, also with ownership verification. DELETE /api/documents/:id permanently removes documents from the database.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "2.3 Client-Side Architecture",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The client-side application is organized into functional modules: authentication, document management, editor, and UI components. The authentication module handles login and registration form submissions, manages session state, and redirects users appropriately based on authentication status. The document management module loads and displays the document list, handles document selection, creation, and deletion, and manages document title editing.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The editor module implements the contenteditable area with rich text formatting capabilities. The floating toolbar appears on text selection and provides formatting buttons for bold, italic, underline, headings, lists, and inline code. Table insertion opens a grid picker allowing users to specify row and column dimensions up to 10x10. Context menus on table cells provide options to add or delete rows and columns. The auto-save feature uses debounced POST requests to save changes every 2 seconds of inactivity.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "2.4 Session Management",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Sessions are stored server-side using express-session with a secure configuration. Session cookies include HttpOnly, Secure, and SameSite attributes to prevent XSS and CSRF attacks. Session IDs are generated using cryptographically secure random values. The session store maintains user ID as the primary identifier for ownership verification. Sessions expire after a configurable timeout period, requiring re-authentication for continued access.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The requireAuth middleware intercepts requests to protected routes, checks for valid session data, and either allows request processing or redirects to the login page. This middleware is applied to all document-related API endpoints and serves as the primary authorization layer. User-specific data is always filtered by user_id in database queries to ensure data isolation even if session validation is somehow bypassed.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "2.5 Error Handling",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Error handling is implemented at multiple levels. Database connection errors are caught and logged with appropriate error messages returned to clients. Validation errors return 400 status codes with descriptive messages indicating which fields failed validation and why. Authentication errors return 401 status codes, redirecting unauthenticated users to login pages. Authorization errors return 403 status codes when users attempt to access resources they do not own.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Server errors return 500 status codes with generic error messages to avoid exposing internal implementation details. Client-side error handlers display user-friendly notifications for failed operations. Network errors during auto-save are retried with exponential backoff. Local storage may be used as a fallback for unsaved changes, allowing users to recover content after temporary disconnections.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // Low Level Design Section
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "3. Low Level Design",
              size: 36,
              bold: true,
              color: colors.primary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "3.1 Component Specifications",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The floating toolbar component is a positioned div element that appears above text selection. It uses the window.getSelection API to detect selected text ranges and calculates position based on the selection's bounding rectangle. The toolbar contains buttons for formatting operations: document.execCommand for bold, italic, and underline; custom heading insertion for H1, H2, H3; list toggling for ordered and unordered lists; and code span wrapping for inline code. The toolbar fades in with CSS transitions and disappears when the user clicks outside the selection or presses Escape.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The table grid picker component displays a 10x10 grid of cells on button hover. Users click and drag to select desired dimensions. Visual feedback highlights selected cells in real-time. On mouse release, the selected dimensions are captured and an HTML table structure is generated and inserted at the current cursor position. Each cell is contenteditable and receives a context menu event listener for row/column operations. Table borders use CSS for consistent styling.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The status bar component displays real-time statistics at the bottom of the editor. Word count is calculated by splitting content on whitespace and counting non-empty tokens. Character count includes all characters including spaces. Reading time is estimated at 200 words per minute, rounded to the nearest minute. The status bar also displays the auto-save indicator, showing 'Saving...' during pending saves and 'Saved' when complete. Timestamps are displayed with relative time formatting.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "3.2 Implementation Details",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The auto-save mechanism uses a debounce function that waits 2 seconds after the last edit before triggering a save operation. The debounce function is implemented with a timer variable that is cleared and reset on each input event. When the timer fires, the current document content is extracted via innerHTML, and a POST request is sent to /api/documents/:id with the updated content. The save indicator is updated before and after the request to provide visual feedback. Failed saves are logged and queued for retry.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Document title editing is implemented by making the title element contenteditable. On blur, the new title is sent via PUT request to update the document. The sidebar list is refreshed after successful updates to display the new title. Title changes do not trigger content auto-save to avoid unnecessary database writes. Empty titles are prevented by reverting to 'Untitled' or the previous valid value.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "The context menu for table cells is implemented using the HTML5 contextmenu event. Right-clicking a table cell opens a custom menu with options: 'Add Row Above', 'Add Row Below', 'Delete Row', 'Add Column Left', 'Add Column Right', 'Delete Column'. Each option maps to DOM manipulation functions that modify the table structure. Delete operations confirm with a dialog before proceeding. All modifications trigger the auto-save mechanism to persist changes.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "3.3 Security Implementation",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Password hashing uses bcrypt with 12 salt rounds by default. The bcrypt.hash function processes plaintext passwords before database insertion. Login verification uses bcrypt.compare to validate credentials against stored hashes. These operations are asynchronous to avoid blocking the event loop. Password complexity requirements are enforced during registration: minimum 8 characters, at least one uppercase, one lowercase, and one number.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "SQL injection prevention is achieved through parameterized queries using the mysql2 library's prepared statement syntax. User inputs are never concatenated into query strings. All database queries use placeholders (?) with parameters passed separately. This approach neutralizes SQL injection vectors while maintaining query performance. The requireAuth middleware validates session.user_id exists and matches the document's user_id in all document operations.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "3.4 Performance Considerations",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Database queries are optimized with appropriate indexes on user_id in the documents table for fast user-specific lookups. The updated_at index enables efficient sorting for the sidebar. Database connection pooling via mysql2 connection pool manages concurrent requests efficiently. Queries are limited to necessary columns to reduce data transfer. Large documents are paginated if they exceed size thresholds, though most use cases fit within LONGTEXT limits.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Client-side performance is optimized through event delegation for document list interactions rather than individual event listeners per item. DOM manipulation is minimized by batching updates. The auto-save debounce prevents excessive network requests. CSS transitions use GPU-accelerated properties for smooth animations. Images and large content blocks are lazy-loaded if present. The application uses minimal dependencies to keep the bundle size small and load times fast.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "3.5 Testing Strategy",
              size: 28,
              bold: true,
              color: colors.secondary,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Unit tests cover individual functions: password hashing and verification, session validation helpers, text formatting functions, and statistics calculations. Integration tests verify API endpoint behavior: authentication flows, document CRUD operations, and ownership enforcement. End-to-end tests simulate user workflows: registration, login, document creation, editing with various formats, table operations, and logout. Database tests verify schema integrity, constraints, and cascading deletes.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { line: 250 },
          children: [
            new TextRun({
              text: "Security testing includes SQL injection attempts, XSS payload testing in document content, session hijacking scenarios, and brute force login attempts. Performance testing measures response times under load, auto-save behavior with rapid edits, and database query performance with large document sets. Cross-browser testing ensures compatibility with modern browsers: Chrome, Firefox, Safari, and Edge. Mobile testing verifies responsive layout and touch interactions on various screen sizes.",
              size: 22,
              color: colors.body,
              font: "Times New Roman",
            }),
          ],
        }),
      ],
    },
  ],
});

// Generate and save the document
Packer.toBuffer(doc).then((buffer) => {
  const outputPath = '/home/z/my-project/upload/CEP_PS.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document created successfully at: ${outputPath}`);
  
  // Add TOC placeholders
  const { execSync } = require('child_process');
  try {
    const tocEntries = JSON.stringify([
      { level: 1, text: "1. High Level Design", page: "3" },
      { level: 2, text: "1.1 System Overview", page: "3" },
      { level: 2, text: "1.2 System Architecture", page: "3" },
      { level: 2, text: "1.3 Key Features", page: "4" },
      { level: 2, text: "1.4 Design Principles", page: "4" },
      { level: 2, text: "1.5 Technology Stack", page: "4" },
      { level: 1, text: "2. Mid Level Design", page: "5" },
      { level: 2, text: "2.1 Database Schema", page: "5" },
      { level: 2, text: "2.2 API Architecture", page: "5" },
      { level: 2, text: "2.3 Client-Side Architecture", page: "6" },
      { level: 2, text: "2.4 Session Management", page: "6" },
      { level: 2, text: "2.5 Error Handling", page: "6" },
      { level: 1, text: "3. Low Level Design", page: "7" },
      { level: 2, text: "3.1 Component Specifications", page: "7" },
      { level: 2, text: "3.2 Implementation Details", page: "7" },
      { level: 2, text: "3.3 Security Implementation", page: "8" },
      { level: 2, text: "3.4 Performance Considerations", page: "8" },
      { level: 2, text: "3.5 Testing Strategy", page: "8" }
    ]);
    
    execSync(`python skills/docx/scripts/add_toc_placeholders.py "${outputPath}" --entries '${tocEntries}'`, { stdio: 'inherit' });
    console.log('TOC placeholders added successfully');
  } catch (error) {
    console.error('Error adding TOC placeholders:', error.message);
  }
}).catch((error) => {
  console.error('Error creating document:', error);
});
