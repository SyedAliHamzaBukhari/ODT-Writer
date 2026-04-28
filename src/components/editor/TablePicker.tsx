// src/components/editor/TablePicker.tsx
"use client"

const MAX = 10

interface Props {
  tableSize: { rows: number; cols: number }
  onSizeChange: (size: { rows: number; cols: number }) => void
  onInsert: () => void
}

export function TablePicker({ tableSize, onSizeChange, onInsert }: Props) {
  return (
    <div className="absolute top-full left-0 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl p-2 z-50">
      <div className="mb-1.5 text-xs text-[#6b7280]">
        {tableSize.rows} × {tableSize.cols}
      </div>
      <div className="flex flex-col gap-0.5">
        {Array.from({ length: MAX }).map((_, r) => (
          <div key={r} className="flex gap-0.5">
            {Array.from({ length: MAX }).map((_, c) => (
              <button
                key={c}
                onMouseEnter={() => onSizeChange({ rows: r + 1, cols: c + 1 })}
                onClick={onInsert}
                className={`w-5 h-5 rounded transition-colors ${
                  r < tableSize.rows && c < tableSize.cols
                    ? "bg-white"
                    : "bg-[#3a3a3a] hover:bg-[#4a4a4a]"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}