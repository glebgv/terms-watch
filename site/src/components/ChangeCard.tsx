import { Link } from 'react-router-dom'
import { AlertTriangle, ExternalLink, GitCompareArrows } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ChangelogEntry } from '../lib/types'
import { Badge, Card, fmtDate } from './ui'

export default function ChangeCard({ e, index = 0 }: { e: ChangelogEntry; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.25 }}
    >
      <Card hover className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <Link to={`/site/${e.site_id}`} className="font-semibold hover:text-emerald-300 transition-colors">
              {e.site_name}
            </Link>
            <span className="text-gray-600 mx-1.5">/</span>
            <Link
              to={`/diff/${e.site_id}/${e.doc_id}/${e.date}`}
              className="text-gray-300 hover:text-emerald-300 transition-colors"
            >
              {e.doc_title}
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {e.is_major && (
              <Badge color="yellow"><AlertTriangle size={11} /> переписан</Badge>
            )}
            {e.retrospective && (
              <Badge color="blue">из архива</Badge>
            )}
            <time className="text-xs text-gray-500 tabular-nums">{fmtDate(e.date)}</time>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-2.5 leading-relaxed">{e.summary}</p>

        {e.keywords.length > 0 && (
          <div className="mt-3 flex gap-1.5 flex-wrap">
            {e.keywords.map((k) => (
              <Badge key={k} color="purple">{k}</Badge>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-4 text-xs">
          {e.diff_path && (
            <Link
              to={`/diff/${e.site_id}/${e.doc_id}/${e.date}`}
              className="flex items-center gap-1 text-emerald-400/80 hover:text-emerald-300 transition-colors"
            >
              <GitCompareArrows size={13} /> дифф
            </Link>
          )}
          {e.retrospective && e.wayback_url ? (
            <a href={e.wayback_url} target="_blank" rel="noreferrer"
               className="flex items-center gap-1 text-amber-400/80 hover:text-amber-300 transition-colors">
              <ExternalLink size={13} /> снимок в архиве
            </a>
          ) : (
            <a href={e.url} target="_blank" rel="noreferrer"
               className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
              <ExternalLink size={13} /> первоисточник
            </a>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
