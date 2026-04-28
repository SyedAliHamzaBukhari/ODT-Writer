// src/services/documentService.ts
// All document-related API calls live here. Components never call fetch() directly.

import type { Document, CreateDocumentPayload, UpdateDocumentPayload } from "@/types/document"

const BASE = "/api/documents"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const documentService = {
  /** Fetch all documents for the current user */
  async list(): Promise<Document[]> {
    const res = await fetch(BASE)
    const data = await handleResponse<{ documents: Document[] }>(res)
    return data.documents
  },

  /** Create a new document */
  async create(payload: CreateDocumentPayload): Promise<Document> {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await handleResponse<{ document: Document }>(res)
    return data.document
  },

  /** Update a document's title and/or content */
  async update(id: string, payload: UpdateDocumentPayload): Promise<Document> {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await handleResponse<{ document: Document }>(res)
    return data.document
  },

  /** Delete a document by id */
  async remove(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: "DELETE" })
    await handleResponse<void>(res)
  },
}