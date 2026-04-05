'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Plus,
  Trash2,
  LogOut,
  FileText,
  Table as TableIcon,
  Save
} from 'lucide-react'

interface Document {
  id: string
  title: string
  content: string
  updatedAt: string
}

interface SessionUser {
  id: string
  name: string
  email: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [tableSize, setTableSize] = useState({ rows: 1, cols: 1 })
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch documents on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchDocuments()
    }
  }, [status, router])

  // Create welcome document on first login
  useEffect(() => {
    if (status === 'authenticated' && documents.length === 0 && !isLoading) {
      createWelcomeDocument()
    }
  }, [status, documents, isLoading])

  // Calculate statistics
  useEffect(() => {
    if (currentDocument?.content) {
      const text = editorRef.current?.innerText || currentDocument.content
      const words = text.trim().split(/\s+/).filter(w => w.length > 0)
      setWordCount(words.length)
      setCharacterCount(text.length)
      setReadingTime(Math.ceil(words.length / 200))
    } else {
      setWordCount(0)
      setCharacterCount(0)
      setReadingTime(0)
    }
  }, [currentDocument?.content])

  // Auto-save with debouncing
  const debouncedSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    setSaveStatus('saving')
    autoSaveTimerRef.current = setTimeout(() => {
      saveDocument()
    }, 2000)
  }, [currentDocument])

  // Handle editor content changes
  const handleContentChange = () => {
    if (currentDocument && editorRef.current) {
      const content = editorRef.current.innerHTML
      setCurrentDocument({ ...currentDocument, content })
      setSaveStatus('unsaved')
      debouncedSave()
    }
  }

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?session=expired')
          return
        }
        throw new Error(data.error || 'Failed to fetch documents')
      }

      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents)
        if (!currentDocument) {
          setCurrentDocument(data.documents[0])
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new document
  const createDocument = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled', content: '' })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired or invalid, redirect to login
          router.push('/login?session=expired')
          return
        }
        throw new Error(data.error || 'Failed to create document')
      }

      if (data.document) {
        setDocuments([data.document, ...documents])
        setCurrentDocument(data.document)
      }
    } catch (error) {
      console.error('Error creating document:', error)
      alert(error instanceof Error ? error.message : 'Failed to create document. Please try again.')
    }
  }

  // Create welcome document
  const createWelcomeDocument = async () => {
    try {
      const welcomeContent = `
        <h1>Welcome to ODT Writer</h1>
        <p>This is your personal workspace. Start writing!</p>
        <h2>Features</h2>
        <ul>
          <li>Rich text formatting (bold, italic, underline)</li>
          <li>Headings (H1, H2, H3)</li>
          <li>Lists (ordered and unordered)</li>
          <li>Inline code</li>
          <li>Tables</li>
          <li>Auto-save every 2 seconds</li>
        </ul>
        <p>Select some text to see the formatting toolbar appear.</p>
      `

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Welcome', content: welcomeContent })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?session=expired')
          return
        }
        throw new Error(data.error || 'Failed to create welcome document')
      }

      if (data.document) {
        setDocuments([data.document])
        setCurrentDocument(data.document)
      }
    } catch (error) {
      console.error('Error creating welcome document:', error)
    }
  }

  // Save current document
  const saveDocument = async () => {
    if (!currentDocument || !editorRef.current) return

    setIsSaving(true)
    try {
      const content = editorRef.current.innerHTML
      const response = await fetch(`/api/documents/${currentDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        setSaveStatus('saved')
        // Refresh documents list to get updated timestamps
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error saving document:', error)
      setSaveStatus('unsaved')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete document
  const deleteDocument = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updatedDocuments = documents.filter(d => d.id !== id)
        setDocuments(updatedDocuments)

        if (currentDocument?.id === id) {
          setCurrentDocument(updatedDocuments[0] || null)
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  // Update document title
  const updateTitle = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })

      if (response.ok) {
        setDocuments(documents.map(d =>
          d.id === id ? { ...d, title: newTitle } : d
        ))
        if (currentDocument?.id === id) {
          setCurrentDocument({ ...currentDocument, title: newTitle })
        }
      }
    } catch (error) {
      console.error('Error updating title:', error)
    }
  }

  // Format text
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentChange()
  }

  // Handle text selection for floating toolbar
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim().length > 0 && editorRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setToolbarPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2 - 150
        })
        setShowFloatingToolbar(true)
      } else {
        setShowFloatingToolbar(false)
        setShowTablePicker(false)
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    document.addEventListener('click', (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowTablePicker(false)
      }
    })

    return () => {
      document.removeEventListener('selectionchange', handleSelection)
    }
  }, [])

  // Insert table
  const insertTable = () => {
    if (!editorRef.current) return

    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">'
    for (let i = 0; i < tableSize.rows; i++) {
      tableHTML += '<tr>'
      for (let j = 0; j < tableSize.cols; j++) {
        tableHTML += '<td style="border: 1px solid #3a3a3a; padding: 8px; min-width: 50px;" contenteditable="true"> </td>'
      }
      tableHTML += '</tr>'
    }
    tableHTML += '</table>'

    document.execCommand('insertHTML', false, tableHTML)
    setShowTablePicker(false)
    handleContentChange()
  }

  // Handle table context menu
  const handleTableContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const cell = e.target as HTMLTableCellElement
    const table = cell.closest('table')
    if (!table) return

    const action = prompt('Table action:\n1. Add row above\n2. Add row below\n3. Delete row\n4. Add column left\n5. Add column right\n6. Delete column\n\nEnter number (1-6):')

    if (!action) return

    const rows = table.querySelectorAll('tr')
    const cellIndex = cell.cellIndex
    const rowIndex = cell.parentElement?.rowIndex || 0

    switch (action) {
      case '1': // Add row above
        const newRowAbove = table.insertRow(rowIndex)
        for (let i = 0; i < rows[rowIndex].cells.length; i++) {
          const newCell = newRowAbove.insertCell(i)
          newCell.contentEditable = 'true'
          newCell.style.border = '1px solid #3a3a3a'
          newCell.style.padding = '8px'
          newCell.style.minWidth = '50px'
        }
        break
      case '2': // Add row below
        const newRowBelow = table.insertRow(rowIndex + 1)
        for (let i = 0; i < rows[rowIndex].cells.length; i++) {
          const newCell = newRowBelow.insertCell(i)
          newCell.contentEditable = 'true'
          newCell.style.border = '1px solid #3a3a3a'
          newCell.style.padding = '8px'
          newCell.style.minWidth = '50px'
        }
        break
      case '3': // Delete row
        table.deleteRow(rowIndex)
        break
      case '4': // Add column left
        for (const row of rows) {
          const newCell = row.insertCell(cellIndex)
          newCell.contentEditable = 'true'
          newCell.style.border = '1px solid #3a3a3a'
          newCell.style.padding = '8px'
          newCell.style.minWidth = '50px'
        }
        break
      case '5': // Add column right
        for (const row of rows) {
          const newCell = row.insertCell(cellIndex + 1)
          newCell.contentEditable = 'true'
          newCell.style.border = '1px solid #3a3a3a'
          newCell.style.padding = '8px'
          newCell.style.minWidth = '50px'
        }
        break
      case '6': // Delete column
        for (const row of rows) {
          row.deleteCell(cellIndex)
        }
        break
    }

    handleContentChange()
  }

  // Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-[#e2e2e2]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#191919]">
      {/* Sidebar */}
      <div className="w-72 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col h-screen">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <h1 className="text-xl font-bold text-[#e2e2e2] mb-4">ODT Writer</h1>
          <button
            onClick={createDocument}
            className="w-full py-2 px-4 bg-[#ffffff] text-[#191919] rounded-lg hover:bg-[#e5e5e5] transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} />
            New Document
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-medium text-[#6b7280] px-2 py-2 uppercase tracking-wider">
            Documents
          </div>
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setCurrentDocument(doc)
                setSaveStatus('saved')
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all mb-1 ${
                currentDocument?.id === doc.id
                  ? 'bg-[#2a2a2a] text-[#e2e2e2]'
                  : 'text-[#9aa6b2] hover:bg-[#252525] hover:text-[#e2e2e2]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={doc.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateTitle(doc.id, e.target.value)}
                    onBlur={(e) => updateTitle(doc.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        ;(e.target as HTMLInputElement).blur()
                      }
                    }}
                    className="w-full bg-transparent border-none outline-none text-sm font-medium truncate focus:bg-[#3a3a3a] focus:rounded px-1 -mx-1"
                  />
                  <div className="text-xs text-[#6b7280] mt-1">
                    {getRelativeTime(doc.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteDocument(e, doc.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 hover:bg-[#3a3a3a] rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#3a3a3a] rounded-full flex items-center justify-center text-[#e2e2e2] font-medium">
                {(session?.user as SessionUser)?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#e2e2e2] truncate">
                  {(session?.user as SessionUser)?.name}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors text-[#9aa6b2] hover:text-[#e2e2e2]"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6 bg-[#191919]">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-[#9aa6b2]" />
            {currentDocument && (
              <input
                type="text"
                value={currentDocument.title}
                onChange={(e) => setCurrentDocument({ ...currentDocument, title: e.target.value })}
                onBlur={() => currentDocument && updateTitle(currentDocument.id, currentDocument.title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                className="text-lg font-semibold bg-transparent border-none outline-none text-[#e2e2e2] focus:bg-[#2a2a2a] focus:rounded px-2 -mx-2"
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6b7280]">
            {isSaving ? (
              <>
                <Save size={16} className="animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {saveStatus === 'saved' ? 'Saved' : 'Unsaved'}
              </>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-[#191919]">
          <div className="max-w-3xl mx-auto py-12 px-8">
            {currentDocument ? (
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                onContextMenu={(e) => {
                  const target = e.target as HTMLElement
                  if (target.tagName === 'TD' || target.tagName === 'TH') {
                    handleTableContextMenu(e)
                  }
                }}
                dangerouslySetInnerHTML={{ __html: currentDocument.content }}
                className="min-h-[500px] outline-none text-[#e2e2e2] prose prose-invert prose-headings:text-[#e2e2e2] prose-p:text-[#e2e2e2] prose-strong:text-[#e2e2e2] prose-code:text-[#e2e2e2] prose-pre:text-[#e2e2e2] prose-ul:text-[#e2e2e2] prose-ol:text-[#e2e2e2] prose-li:text-[#e2e2e2]"
                style={{
                  lineHeight: '1.7',
                  fontSize: '16px'
                }}
              />
            ) : (
              <div className="text-center text-[#6b7280] py-20">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-4">No document selected</p>
                <button
                  onClick={createDocument}
                  className="px-4 py-2 bg-[#ffffff] text-[#191919] rounded-lg hover:bg-[#e5e5e5] transition-colors font-medium"
                >
                  Create New Document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-10 border-t border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-6 text-xs text-[#6b7280]">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
            <span>~{readingTime} min read</span>
          </div>
          <div>
            {currentDocument && `Last edited: ${getRelativeTime(currentDocument.updatedAt)}`}
          </div>
        </div>
      </div>

      {/* Floating Toolbar */}
      {showFloatingToolbar && (
        <div
          ref={toolbarRef}
          className="fixed bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl flex items-center gap-1 p-1 z-50"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`
          }}
        >
          <button
            onClick={() => formatText('bold')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => formatText('italic')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => formatText('underline')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Underline"
          >
            <Underline size={16} />
          </button>
          <div className="w-px h-6 bg-[#3a3a3a] mx-1" />
          <button
            onClick={() => formatText('formatBlock', 'h1')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => formatText('formatBlock', 'h2')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() => formatText('formatBlock', 'h3')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Heading 3"
          >
            <Heading3 size={16} />
          </button>
          <div className="w-px h-6 bg-[#3a3a3a] mx-1" />
          <button
            onClick={() => formatText('insertUnorderedList')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => formatText('insertOrderedList')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <div className="w-px h-6 bg-[#3a3a3a] mx-1" />
          <button
            onClick={() => formatText('insertHTML', '<code>')}
            className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
            title="Inline Code"
          >
            <Code size={16} />
          </button>
          <div className="w-px h-6 bg-[#3a3a3a] mx-1" />
          <div className="relative">
            <button
              onClick={() => setShowTablePicker(!showTablePicker)}
              className="p-2 hover:bg-[#3a3a3a] rounded transition-colors text-[#e2e2e2]"
              title="Insert Table"
            >
              <TableIcon size={16} />
            </button>
            {showTablePicker && (
              <div className="absolute top-full left-0 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl p-2 z-50">
                <div className="mb-2 text-xs text-[#6b7280]">
                  {tableSize.rows} × {tableSize.cols}
                </div>
                <div className="grid gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <button
                          key={j}
                          onMouseEnter={() => setTableSize({ rows: i + 1, cols: j + 1 })}
                          onClick={insertTable}
                          className={`w-5 h-5 rounded transition-colors ${
                            i < tableSize.rows && j < tableSize.cols
                              ? 'bg-[#ffffff]'
                              : 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
