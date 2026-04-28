// src/components/editor/FloatingToolbar.tsx
"use client"

import {
  Bold, Italic, Underline,
  List, ListOrdered,
  Heading1, Heading2, Heading3,
  Code, Table as TableIcon,
} from "lucide-react"
import { TablePicker } from "./TablePicker"

interface Props {
  position: { top: number; left: number }
  toolbarRef: React.RefObject<HTMLDivElement>
  showTablePicker: boolean
  tableSize: { rows: number; cols: number }
  onFormat: (command: string, value?: string) => void
  onToggleTablePicker: () => void
  onTableSizeChange: (size: { rows: number; cols: number }) => void
  onInsertTable: () => void
}

interface ToolbarButton {
  icon: React.ReactNode
  title: string
  command: string
  value?: string
}

const FORMAT_BUTTONS: ToolbarButton[] = [
  { icon: <Bold size={15} />, title: "Bold", command: "bold" },
  { icon: <Italic size={15} />, title: "Italic", command: "italic" },
  { icon: <Underline size={15} />, title: "Underline", command: "underline" },
]

const HEADING_BUTTONS: ToolbarButton[] = [
  { icon: <Heading1 size={15} />, title: "Heading 1", command: "formatBlock", value: "h1" },
  { icon: <Heading2 size={15} />, title: "Heading 2", command: "formatBlock", value: "h2" },
  { icon: <Heading3 size={15} />, title: "Heading 3", command: "formatBlock", value: "h3" },
]

const LIST_BUTTONS: ToolbarButton[] = [
  { icon: <List size={15} />, title: "Bullet List", command: "insertUnorderedList" },
  { icon: <ListOrdered size={15} />, title: "Numbered List", command: "insertOrderedList" },
]

function Divider() {
  return <div className="w-px h-5 bg-[#3a3a3a] mx-0.5" />
}

function ToolBtn({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
    >
      {icon}
    </button>
  )
}

export function FloatingToolbar({
  position,
  toolbarRef,
  showTablePicker,
  tableSize,
  onFormat,
  onToggleTablePicker,
  onTableSizeChange,
  onInsertTable,
}: Props) {
  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl flex items-center gap-0.5 p-1"
      style={{ top: position.top, left: position.left }}
    >
      {FORMAT_BUTTONS.map((btn) => (
        <ToolBtn
          key={btn.command}
          icon={btn.icon}
          title={btn.title}
          onClick={() => onFormat(btn.command, btn.value)}
        />
      ))}
      <Divider />
      {HEADING_BUTTONS.map((btn) => (
        <ToolBtn
          key={btn.value}
          icon={btn.icon}
          title={btn.title}
          onClick={() => onFormat(btn.command, btn.value)}
        />
      ))}
      <Divider />
      {LIST_BUTTONS.map((btn) => (
        <ToolBtn
          key={btn.command}
          icon={btn.icon}
          title={btn.title}
          onClick={() => onFormat(btn.command)}
        />
      ))}
      <Divider />
      <ToolBtn
        icon={<Code size={15} />}
        title="Inline Code"
        onClick={() => onFormat("insertHTML", "<code>&nbsp;</code>")}
      />
      <Divider />
      <div className="relative">
        <ToolBtn
          icon={<TableIcon size={15} />}
          title="Insert Table"
          onClick={onToggleTablePicker}
        />
        {showTablePicker && (
          <TablePicker
            tableSize={tableSize}
            onSizeChange={onTableSizeChange}
            onInsert={onInsertTable}
          />
        )}
      </div>
    </div>
  )
}