// src/components/layout/EditorHeader.tsx
"use client"

import { FileText, Save } from "lucide-react"
import type { Document } from "@/types/document"
import type { SaveStatus } from "@/types/document"

interface Props {
  document: Document | null
  saveStatus: SaveStatus
  isSaving: boolean
  onTitleChange: (title: string) => void
  onTitleBlur: () => void
}

export function EditorHeader({
  document,
  saveStatus,
  isSaving,
  onTitleChange,
  onTitleBlur,
}: Props) {
  return (
    <header className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6 bg-[#191919] shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <FileText size={20} className="text-[#9aa6b2] shrink-0" />
        {document ? (
          <input
            type="text"
            value={document.title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur()
            }}
            className="text-lg font-semibold bg-transparent border-none outline-none
              text-[#e2e2e2] focus:bg-[#2a2a2a] focus:rounded px-2 -mx-2 truncate"
          />
        ) : (
          <span className="text-lg font-semibold text-[#6b7280]">No document</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-[#6b7280] shrink-0">
        <Save
          size={15}
          className={isSaving ? "animate-pulse text-[#9aa6b2]" : ""}
        />
        <span>
          {isSaving ? "Saving…" : saveStatus === "saved" ? "Saved" : "Unsaved changes"}
        </span>
      </div>
    </header>
  )
}