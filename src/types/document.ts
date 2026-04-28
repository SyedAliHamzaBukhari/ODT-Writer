// src/types/document.ts

export interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

export interface CreateDocumentPayload {
  title: string
  content: string
}

export interface UpdateDocumentPayload {
  title?: string
  content?: string
}