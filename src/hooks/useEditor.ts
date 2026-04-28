// src/hooks/useEditor.ts
// Manages the contentEditable editor: text formatting, table insertion,
// floating toolbar positioning, and document statistics.

import { useRef, useState, useEffect, useCallback } from "react"
import { computeStats, stripHtml } from "@/lib/utils"

export function useEditor(onContentChange: (content: string) => void) {
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [tableSize, setTableSize] = useState({ rows: 1, cols: 1 })
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)

  /** Apply an execCommand format and notify parent of content change */
  const formatText = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value)
      editorRef.current?.focus()
      if (editorRef.current) {
        onContentChange(editorRef.current.innerHTML)
      }
    },
    [onContentChange]
  )

  /** Build and insert an HTML table at the cursor position */
  const insertTable = useCallback(() => {
    if (!editorRef.current) return

    const cellStyle =
      'border: 1px solid #3a3a3a; padding: 8px; min-width: 50px;'

    let html = '<table border="1" style="border-collapse: collapse; width: 100%;">'
    for (let r = 0; r < tableSize.rows; r++) {
      html += "<tr>"
      for (let c = 0; c < tableSize.cols; c++) {
        html += `<td style="${cellStyle}" contenteditable="true">&nbsp;</td>`
      }
      html += "</tr>"
    }
    html += "</table><p><br></p>"

    document.execCommand("insertHTML", false, html)
    setShowTablePicker(false)
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML)
    }
  }, [tableSize, onContentChange])

  /** Table row/column operations — replaces the old prompt() dialog */
  const handleTableAction = useCallback(
    (action: string, cell: HTMLTableCellElement) => {
      const table = cell.closest("table")
      if (!table) return

      const rows = table.querySelectorAll("tr")
      const cellIndex = cell.cellIndex
      const rowIndex = (cell.parentElement as HTMLTableRowElement)?.rowIndex ?? 0

      const makeCell = (row: HTMLTableRowElement, at: number) => {
        const td = row.insertCell(at)
        td.contentEditable = "true"
        td.style.border = "1px solid #3a3a3a"
        td.style.padding = "8px"
        td.style.minWidth = "50px"
        td.innerHTML = "&nbsp;"
      }

      switch (action) {
        case "row-above": {
          const row = table.insertRow(rowIndex)
          for (let i = 0; i < rows[rowIndex].cells.length; i++) makeCell(row, i)
          break
        }
        case "row-below": {
          const row = table.insertRow(rowIndex + 1)
          for (let i = 0; i < rows[rowIndex].cells.length; i++) makeCell(row, i)
          break
        }
        case "row-delete":
          if (rows.length > 1) table.deleteRow(rowIndex)
          break
        case "col-left":
          rows.forEach((row) => makeCell(row as HTMLTableRowElement, cellIndex))
          break
        case "col-right":
          rows.forEach((row) =>
            makeCell(row as HTMLTableRowElement, cellIndex + 1)
          )
          break
        case "col-delete":
          if (rows[0]?.cells.length > 1) {
            rows.forEach((row) => (row as HTMLTableRowElement).deleteCell(cellIndex))
          }
          break
      }

      if (editorRef.current) {
        onContentChange(editorRef.current.innerHTML)
      }
    },
    [onContentChange]
  )

  /** Update word/char/reading stats from current editor content */
  const updateStats = useCallback((html: string) => {
    const text = stripHtml(html)
    const stats = computeStats(text)
    setWordCount(stats.wordCount)
    setCharacterCount(stats.characterCount)
    setReadingTime(stats.readingTime)
  }, [])

  /** Load document content into the editor (on document switch) */
  const loadContent = useCallback((html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html
      updateStats(html)
    }
  }, [updateStats])

  // Floating toolbar on text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (
        selection &&
        selection.toString().trim().length > 0 &&
        editorRef.current?.contains(selection.anchorNode)
      ) {
        const rect = selection.getRangeAt(0).getBoundingClientRect()
        setToolbarPosition({
          top: rect.top - 54,
          left: rect.left + rect.width / 2 - 160,
        })
        setShowFloatingToolbar(true)
      } else {
        setShowFloatingToolbar(false)
        setShowTablePicker(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowTablePicker(false)
      }
    }

    document.addEventListener("selectionchange", handleSelection)
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("selectionchange", handleSelection)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  return {
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
    loadContent,
    formatText,
    insertTable,
    handleTableAction,
  }
}