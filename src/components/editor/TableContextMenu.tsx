// src/components/editor/TableContextMenu.tsx
// Replaces the old prompt() native dialog with a proper context menu UI.
"use client"

import { useEffect, useRef } from "react"

interface Props {
  position: { x: number; y: number }
  cell: HTMLTableCellElement
  onAction: (action: string, cell: HTMLTableCellElement) => void
  onClose: () => void
}

const ACTIONS = [
  { label: "Add row above",    key: "row-above" },
  { label: "Add row below",    key: "row-below" },
  { label: "Delete row",       key: "row-delete", danger: true },
  { label: "─────────────",   key: "divider" },
  { label: "Add column left",  key: "col-left" },
  { label: "Add column right", key: "col-right" },
  { label: "Delete column",    key: "col-delete", danger: true },
]

export function TableContextMenu({ position, cell, onAction, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl py-1 min-w-[170px]"
      style={{ top: position.y, left: position.x }}
    >
      {ACTIONS.map((action) =>
        action.key === "divider" ? (
          <div key="divider" className="my-1 border-t border-[#3a3a3a]" />
        ) : (
          <button
            key={action.key}
            onClick={() => {
              onAction(action.key, cell)
              onClose()
            }}
            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-[#3a3a3a] ${
              action.danger ? "text-red-400 hover:text-red-300" : "text-[#e2e2e2]"
            }`}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}