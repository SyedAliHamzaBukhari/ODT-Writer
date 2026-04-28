// src/components/sidebar/UserSection.tsx
"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface Props {
  username: string
}

export function UserSection({ username }: Props) {
  const initial = username?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#3a3a3a] rounded-full flex items-center justify-center
          text-[#e2e2e2] font-semibold text-sm shrink-0">
          {initial}
        </div>
        <span className="text-sm font-medium text-[#e2e2e2] truncate">{username}</span>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Sign out"
        className="p-2 rounded-lg text-[#9aa6b2] hover:bg-[#2a2a2a] hover:text-[#e2e2e2] transition-colors"
      >
        <LogOut size={17} />
      </button>
    </div>
  )
}