// src/components/sidebar/Sidebar.tsx
"use client"

import { Plus } from "lucide-react"
import { DocumentItem } from "./DocumentItem"
import { UserSection } from "./UserSection"
import type { Document } from "@/types/document"

interface Props {
  documents: Document[]
  currentDocumentId: string | undefined
  username: string
  onSelectDocument: (doc: Document) => void
  onCreateDocument: () => void
  onDeleteDocument: (e: React.MouseEvent, id: string) => void
  onUpdateTitle: (id: string, title: string) => void
}

export function Sidebar({
  documents,
  currentDocumentId,
  username,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onUpdateTitle,
}: Props) {
  return (
    <aside className="w-72 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold text-[#e2e2e2] mb-4">ODT Writer</h1>
        <button
          onClick={onCreateDocument}
          className="w-full py-2 px-4 bg-white text-[#191919] rounded-lg hover:bg-[#e5e5e5]
            transition-colors flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Plus size={16} />
          New Document
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs font-medium text-[#6b7280] px-2 py-2 uppercase tracking-wider">
          Documents
        </p>

        {documents.length === 0 ? (
          <p className="text-xs text-[#6b7280] px-2 py-4 text-center">
            No documents yet.
          </p>
        ) : (
          documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              isActive={doc.id === currentDocumentId}
              onSelect={() => onSelectDocument(doc)}
              onDelete={(e) => onDeleteDocument(e, doc.id)}
              onTitleBlur={(title) => onUpdateTitle(doc.id, title)}
            />
          ))
        )}
      </div>

      {/* User */}
      <UserSection username={username} />
    </aside>
  )
}