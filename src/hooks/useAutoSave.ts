// src/hooks/useAutoSave.ts
// Provides a debounced auto-save mechanism with save status tracking.

import { useState, useRef, useCallback, useEffect } from "react"
import type { SaveStatus } from "@/types/document"

const DEBOUNCE_MS = 2000

interface UseAutoSaveOptions {
  onSave: () => Promise<boolean>
}

export function useAutoSave({ onSave }: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const triggerSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    setSaveStatus("saving")
    timerRef.current = setTimeout(async () => {
      const success = await onSave()
      setSaveStatus(success ? "saved" : "unsaved")
    }, DEBOUNCE_MS)
  }, [onSave])

  const markUnsaved = useCallback(() => {
    setSaveStatus("unsaved")
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { saveStatus, setSaveStatus, triggerSave, markUnsaved }
}