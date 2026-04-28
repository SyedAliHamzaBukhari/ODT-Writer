-- Create database
CREATE DATABASE IF NOT EXISTS odt_writer;
USE odt_writer;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  username      VARCHAR(255) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)  NOT NULL
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(36)  NOT NULL,
  title      VARCHAR(255) NOT NULL DEFAULT 'Untitled',
  content    LONGTEXT     NOT NULL,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)  NOT NULL,

  CONSTRAINT fk_documents_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_documents_user_id  ON documents(user_id);
CREATE INDEX idx_documents_updated  ON documents(updated_at);