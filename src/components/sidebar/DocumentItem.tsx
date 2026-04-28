// src/components/sidebar/DocumentItem.tsx
"use client"

import { Trash2 } from "lucide-react"
import { getRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Document } from "@/types/document"

interface Props {
  document: Document
  isActive: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
  onTitleBlur: (title: string) => void
}

export function DocumentItem({ document, isActive, onSelect, onDelete, onTitleBlur }: Props) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group p-3 rounded-lg cursor-pointer transition-all mb-1 flex items-start justify-between gap-2",
        isActive
          ? "bg-[#2a2a2a] text-[#e2e2e2]"
          : "text-[#9aa6b2] hover:bg-[#252525] hover:text-[#e2e2e2]"
      )}
    >
      <div className="flex-1 min-w-0">
        <input
          type="text"
          defaultValue={document.title}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => onTitleBlur(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          className="w-full bg-transparent border-none outline-none text-sm font-medium truncate
            focus:bg-[#3a3a3a] focus:rounded px-1 -mx-1 cursor-text"
        />
        <p className="text-xs text-[#6b7280] mt-0.5">{getRelativeTime(document.updatedAt)}</p>
      </div>

      <button
        onClick={onDelete}
        title="Delete document"
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#3a3a3a]
          hover:text-red-400 transition-all text-[#6b7280] shrink-0 mt-0.5"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}