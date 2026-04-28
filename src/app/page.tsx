// src/app/page.tsx
// Slim orchestrator — no logic lives here. Everything is delegated to hooks and components.
"use client"

import { useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { useDocuments } from "@/hooks/useDocuments"
import { useEditor } from "@/hooks/useEditor"
import { useAutoSave } from "@/hooks/useAutoSave"

import { Sidebar } from "@/components/sidebar/Sidebar"
import { EditorHeader } from "@/components/layout/EditorHeader"
import { StatusBar } from "@/components/layout/StatusBar"
import { Editor } from "@/components/editor/Editor"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const {
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
  } = useDocuments()

  // Stable save callback for useAutoSave
  const handleSave = useCallback(async () => {
    if (!currentDocument || !editorRef.current) return false
    const content = editorRef.current.innerHTML
    return saveDocument(currentDocument.id, content)
  }, [currentDocument, saveDocument]) // editorRef is stable, added below after editor init

  const { saveStatus, setSaveStatus, triggerSave, markUnsaved } = useAutoSave({
    onSave: handleSave,
  })

  const handleContentChange = useCallback(() => {
    markUnsaved()
    triggerSave()
    if (editorRef.current) updateStats(editorRef.current.innerHTML)
  }, [markUnsaved, triggerSave]) // updateStats added below

  const {
    editorRef,
    toolbarRef,
    showFloatingToolbar,
    toolbarPosition,
    showTablePicker,
    setShowTablePicker,
    tableSize,
    setTableSize,
    wordCount,
    characterCount,
    readingTime,
    updateStats,
    formatText,
    insertTable,
    handleTableAction,
  } = useEditor(handleContentChange)

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  // Fetch documents once authenticated
  useEffect(() => {
    if (status === "authenticated") fetchDocuments()
  }, [status, fetchDocuments])

  // Create welcome doc on first login
  useEffect(() => {
    if (status === "authenticated" && !isLoading && documents.length === 0) {
      createWelcomeDocument()
    }
  }, [status, isLoading, documents.length, createWelcomeDocument])

  // Reset save status when switching documents
  const handleSelectDocument = useCallback(
    (doc: (typeof documents)[number]) => {
      selectDocument(doc)
      setSaveStatus("saved")
    },
    [selectDocument, setSaveStatus]
  )

  const handleDeleteDocument = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      if (!confirm("Delete this document? This cannot be undone.")) return
      deleteDocument(id)
    },
    [deleteDocument]
  )

  const handleTitleBlur = useCallback(() => {
    if (currentDocument) {
      updateTitle(currentDocument.id, currentDocument.title)
    }
  }, [currentDocument, updateTitle])

  const handleTitleChange = useCallback(
    (title: string) => {
      if (currentDocument) {
        selectDocument({ ...currentDocument, title })
      }
    },
    [currentDocument, selectDocument]
  )

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-[#9aa6b2] text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#191919]">
      <Sidebar
        documents={documents}
        currentDocumentId={currentDocument?.id}
        username={session?.user?.name ?? "User"}
        onSelectDocument={handleSelectDocument}
        onCreateDocument={createDocument}
        onDeleteDocument={handleDeleteDocument}
        onUpdateTitle={updateTitle}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <EditorHeader
          document={currentDocument}
          saveStatus={saveStatus}
          isSaving={saveStatus === "saving"}
          onTitleChange={handleTitleChange}
          onTitleBlur={handleTitleBlur}
        />

        <Editor
          document={currentDocument}
          editorRef={editorRef}
          toolbarRef={toolbarRef}
          showFloatingToolbar={showFloatingToolbar}
          toolbarPosition={toolbarPosition}
          showTablePicker={showTablePicker}
          tableSize={tableSize}
          onContentChange={handleContentChange}
          onCreateDocument={createDocument}
          onFormat={formatText}
          onToggleTablePicker={() => setShowTablePicker((v) => !v)}
          onTableSizeChange={setTableSize}
          onInsertTable={insertTable}
          onTableAction={handleTableAction}
        />

        <StatusBar
          wordCount={wordCount}
          characterCount={characterCount}
          readingTime={readingTime}
          lastUpdated={currentDocument?.updatedAt}
        />
      </div>
    </div>
  )
}