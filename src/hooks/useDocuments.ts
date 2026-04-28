// src/hooks/useDocuments.ts
// Manages documents list and current document state.

import { useState, useCallback } from "react"
import { documentService } from "@/services/documentService"
import type { Document } from "@/types/document"

const WELCOME_CONTENT = `
  <h1>Welcome to ODT Writer</h1>
  <p>This is your personal workspace. Start writing!</p>
  <h2>Features</h2>
  <ul>
    <li>Rich text formatting (bold, italic, underline)</li>
    <li>Headings (H1, H2, H3)</li>
    <li>Lists (ordered and unordered)</li>
    <li>Inline code</li>
    <li>Tables with grid picker</li>
    <li>Auto-save every 2 seconds</li>
  </ul>
  <p>Select any text to see the floating formatting toolbar appear.</p>
`.trim()

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await documentService.list()
      setDocuments(docs)
      if (docs.length > 0) {
        setCurrentDocument((prev) => prev ?? docs[0])
      }
    } catch (err) {
      console.error("[useDocuments] fetchDocuments:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createDocument = useCallback(async () => {
    try {
      const doc = await documentService.create({ title: "Untitled", content: "" })
      setDocuments((prev) => [doc, ...prev])
      setCurrentDocument(doc)
      return doc
    } catch (err) {
      console.error("[useDocuments] createDocument:", err)
    }
  }, [])

  const createWelcomeDocument = useCallback(async () => {
    try {
      const doc = await documentService.create({ title: "Welcome", content: WELCOME_CONTENT })
      setDocuments([doc])
      setCurrentDocument(doc)
    } catch (err) {
      console.error("[useDocuments] createWelcomeDocument:", err)
    }
  }, [])

  const saveDocument = useCallback(async (id: string, content: string) => {
    try {
      const updated = await documentService.update(id, { content })
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
      return true
    } catch (err) {
      console.error("[useDocuments] saveDocument:", err)
      return false
    }
  }, [])

  const updateTitle = useCallback(async (id: string, title: string) => {
    if (!title.trim()) return
    try {
      const updated = await documentService.update(id, { title })
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
      setCurrentDocument((prev) => (prev?.id === id ? { ...prev, title } : prev))
    } catch (err) {
      console.error("[useDocuments] updateTitle:", err)
    }
  }, [])

  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        await documentService.remove(id)
        const remaining = documents.filter((d) => d.id !== id)
        setDocuments(remaining)
        if (currentDocument?.id === id) {
          setCurrentDocument(remaining[0] ?? null)
        }
      } catch (err) {
        console.error("[useDocuments] deleteDocument:", err)
      }
    },
    [documents, currentDocument]
  )

  const selectDocument = useCallback((doc: Document) => {
    setCurrentDocument(doc)
  }, [])

  return {
    documents,
    currentDocument,
    isLoading,
    fetchDocuments,
    createDocument,
    createWelcomeDocument,
    saveDocument,
    updateTitle,
    deleteDocument,
    selectDocument,
  }
}