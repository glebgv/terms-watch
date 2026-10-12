import { useState } from 'react'
import { Plus, Minus, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import type { DiffChange } from '../lib/types'

export default function DiffView({ changes }: { changes: DiffChange[] }) {
  const [filterType, setFilterType] = useState<'all' | 'add' | 'remove' | 'modify'>('all')
  const shown = changes.filter((c) => filterType === 'all' || c.type === filterType)
  const counts = {
    add: changes.filter((c) => c.type === 'add').length,
    remove: changes.filter((c) => c.type === 'remove').length,
    modify: changes.filter((c) => c.type === 'modify').length,
  }

  const tabs: ['all' | 'add' | 'remove' | 'modify', string, any, number][] = [
    ['all', 'все', null, changes.length],
    ['add', 'добавлено', Plus, counts.add],
    ['remove', 'удалено', Minus, counts.remove],
    ['modify', 'изменено', Pencil, counts.modify],
  ]

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap items-center">
        {tabs.map(([t, label, Icon, n]) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs transition-all ${
              filterType === t
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-[#21262d] text-gray-500 hover:text-gray-200 hover:border-[#30363d]'
            }`}
          >
            {Icon && <Icon size={12} />}
            {label}
            <span className="tabular-nums opacity-70">{n}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="text-gray-600 text-sm py-8 text-center border border-dashed border-[#21262d] rounded-xl">
          изменений нет или полный дифф скрыт (is_major)
        </p>
      )}

      <div className="border border-[#21262d] rounded-xl overflow-hidden bg-[#0b0e14] overflow-x-auto">
        {shown.slice(0, 500).map((c, i) => (
          <Row key={i} c={c} />
        ))}
        {shown.length > 500 && (
          <div className="px-4 py-2 text-xs text-gray-600 border-t border-[#21262d]">
            … показано 500 из {shown.length} строк
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ c }: { c: DiffChange }) {
  if (c.type === 'add') {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
        className="flex bg-emerald-500/8 hover:bg-emerald-500/15 border-l-2 border-emerald-500/60"
      >
        <Pos n={c.position} />
        <span className="text-emerald-500 select-none w-5 shrink-0 leading-6">+</span>
        <code className="flex-1 px-2 py-0.5 text-emerald-200/90 text-[13px] leading-6 whitespace-pre-wrap break-words">
          {c.text}
        </code>
      </motion.div>
    )
  }
  if (c.type === 'remove') {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
        className="flex bg-red-500/8 hover:bg-red-500/15 border-l-2 border-red-500/60"
      >
        <Pos n={c.position} />
        <span className="text-red-500 select-none w-5 shrink-0 leading-6">−</span>
        <code className="flex-1 px-2 py-0.5 text-red-300/80 text-[13px] leading-6 line-through decoration-red-800 whitespace-pre-wrap break-words">
          {c.text}
        </code>
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
      className="bg-amber-500/6 hover:bg-amber-500/12 border-l-2 border-amber-500/60"
    >
      <div className="flex">
        <Pos n={c.position} />
        <span className="text-amber-500 select-none w-5 shrink-0 leading-6">~</span>
        <code className="flex-1 px-2 py-0.5 text-[13px] leading-6 whitespace-pre-wrap break-words">
          {(c.word_diff ?? []).map((w, j) => (
            <span
              key={j}
              className={
                w.type === 'remove'
                  ? 'text-red-300/80 line-through decoration-red-700 bg-red-500/15 rounded-sm px-0.5'
                  : w.type === 'add'
                    ? 'text-emerald-200 bg-emerald-500/20 rounded-sm px-0.5'
                    : 'text-gray-400'
              }
            >
              {w.text}{' '}
            </span>
          ))}
        </code>
      </div>
    </motion.div>
  )
}

function Pos({ n }: { n: number }) {
  return (
    <span className="text-gray-700 select-none w-12 text-right pr-2 text-[11px] leading-6 shrink-0 tabular-nums">
      {n}
    </span>
  )
}
