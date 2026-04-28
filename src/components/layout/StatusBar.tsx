// src/components/layout/StatusBar.tsx
"use client"

import { getRelativeTime } from "@/lib/utils"

interface Props {
  wordCount: number
  characterCount: number
  readingTime: number
  lastUpdated?: string
}

export function StatusBar({ wordCount, characterCount, readingTime, lastUpdated }: Props) {
  return (
    <footer className="h-10 border-t border-[#2a2a2a] bg-[#1a1a1a] flex items-center
      justify-between px-6 text-xs text-[#6b7280] shrink-0">
      <div className="flex items-center gap-4">
        <span>{wordCount} words</span>
        <span>{characterCount} characters</span>
        <span>~{readingTime} min read</span>
      </div>
      {lastUpdated && (
        <span>Last edited: {getRelativeTime(lastUpdated)}</span>
      )}
    </footer>
  )
}