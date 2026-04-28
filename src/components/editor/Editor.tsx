// src/components/editor/Editor.tsx
"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"
import { FloatingToolbar } from "./FloatingToolbar"
import { TableContextMenu } from "./TableContextMenu"
import type { Document } from "@/types/document"

interface Props {
  document: Document | null
  editorRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
  showFloatingToolbar: boolean
  toolbarPosition: { top: number; left: number }
  showTablePicker: boolean
  tableSize: { rows: number; cols: number }
  onContentChange: () => void
  onCreateDocument: () => void
  onFormat: (command: string, value?: string) => void
  onToggleTablePicker: () => void
  onTableSizeChange: (size: { rows: number; cols: number }) => void
  onInsertTable: () => void
  onTableAction: (action: string, cell: HTMLTableCellElement) => void
}

export function Editor({
  document,
  editorRef,
  toolbarRef,
  showFloatingToolbar,
  toolbarPosition,
  showTablePicker,
  tableSize,
  onContentChange,
  onCreateDocument,
  onFormat,
  onToggleTablePicker,
  onTableSizeChange,
  onInsertTable,
  onTableAction,
}: Props) {
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number }
    cell: HTMLTableCellElement
  } | null>(null)

  // Reset editor HTML when active document changes
  useEffect(() => {
    if (editorRef.current && document) {
      // Only update if the content actually differs (avoids cursor jump)
      if (editorRef.current.innerHTML !== document.content) {
        editorRef.current.innerHTML = document.content
      }
    }
  }, [document?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "TD" || target.tagName === "TH") {
      e.preventDefault()
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        cell: target as HTMLTableCellElement,
      })
    }
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#191919]">
        <div className="text-center text-[#6b7280]">
          <FileText size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg mb-4">No document selected</p>
          <button
            onClick={onCreateDocument}
            className="px-4 py-2 bg-white text-[#191919] rounded-lg hover:bg-[#e5e5e5] transition-colors font-medium text-sm"
          >
            Create New Document
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#191919] relative">
      <div className="max-w-3xl mx-auto py-12 px-8">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={onContentChange}
          onContextMenu={handleContextMenu}
          className="min-h-[500px] outline-none text-[#e2e2e2] prose prose-invert max-w-none
            prose-headings:text-[#e2e2e2] prose-p:text-[#e2e2e2]
            prose-strong:text-[#e2e2e2] prose-code:text-[#a8d0f0]
            prose-ul:text-[#e2e2e2] prose-ol:text-[#e2e2e2] prose-li:text-[#e2e2e2]
            prose-table:border-collapse prose-td:border prose-td:border-[#3a3a3a] prose-td:p-2"
          style={{ lineHeight: "1.75", fontSize: "16px" }}
        />
      </div>

      {showFloatingToolbar && (
        <FloatingToolbar
          position={toolbarPosition}
          toolbarRef={toolbarRef}
          showTablePicker={showTablePicker}
          tableSize={tableSize}
          onFormat={onFormat}
          onToggleTablePicker={onToggleTablePicker}
          onTableSizeChange={onTableSizeChange}
          onInsertTable={onInsertTable}
        />
      )}

      {contextMenu && (
        <TableContextMenu
          position={contextMenu.position}
          cell={contextMenu.cell}
          onAction={onTableAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}