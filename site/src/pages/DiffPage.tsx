import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useQuery } from '../components/hooks'
import { Badge, Card, ErrorBox, PageTitle, Spinner } from '../components/ui'
import DiffView from '../components/DiffView'
import { ArrowLeft, ExternalLink, Sparkles, AlertTriangle } from 'lucide-react'

export default function DiffPage() {
  const { siteId, docId, date } = useParams()
  const { data: diff, loading, error } = useQuery(
    () => api.diff(siteId!, docId!, date!), [siteId, docId, date])

  if (loading) return <Spinner />
  if (error) return (
    <div className="space-y-4">
      <Back siteId={siteId!} />
      <ErrorBox msg={`дифф недоступен (${error}). Возможно, документ переписан полностью (is_major) — см. первоисточник.`} />
    </div>
  )

  const d = diff!

  return (
    <div className="space-y-5">
      <Back siteId={d.site} />

      <div className="flex flex-wrap items-center gap-3">
        <PageTitle sub={<span className="font-mono text-xs text-gray-600">
          {d.from_hash.slice(0, 12)}… → {d.to_hash.slice(0, 12)}…
        </span> as unknown as string}>
          {d.doc_title}
        </PageTitle>
        {d.is_major && (
          <Badge color="yellow" className="mb-6"><AlertTriangle size={11} /> is_major</Badge>
        )}
      </div>

      <Card className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="tabular-nums">
            <span className="text-red-400">{d.from_date}</span>
            <span className="text-gray-600 mx-2">→</span>
            <span className="text-emerald-400">{d.to_date}</span>
          </div>
          <span className="text-gray-700">|</span>
          <div className="flex gap-3 tabular-nums text-xs">
            <span className="text-emerald-400">+{d.stats.lines_added}</span>
            <span className="text-red-400">−{d.stats.lines_removed}</span>
            <span className="text-amber-400">~{d.stats.lines_changed}</span>
          </div>
          <span className="text-gray-700">|</span>
          <span className="text-xs text-gray-500">
            ratio <span className={d.stats.change_ratio > 0.3 ? 'text-amber-400' : 'text-gray-300'}>
              {(d.stats.change_ratio * 100).toFixed(1)}%
            </span>
          </span>
          <a href={d.url} target="_blank" rel="noreferrer"
             className="ml-auto flex items-center gap-1 text-xs text-blue-400/80 hover:text-blue-300">
            <ExternalLink size={13} /> первоисточник
          </a>
        </div>
      </Card>

      {d.keywords.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {d.keywords.map((k) => <Badge key={k} color="purple">{k}</Badge>)}
        </div>
      )}

      {d.ai_summary && (
        <div className="border border-sky-500/25 bg-sky-500/5 rounded-xl p-4 text-sm text-sky-200/90 leading-relaxed flex gap-2.5">
          <Sparkles size={16} className="shrink-0 mt-0.5 text-sky-400" />
          <div><span className="text-sky-400 font-semibold">саммари: </span>{d.ai_summary}</div>
        </div>
      )}

      <DiffView changes={d.changes} />
    </div>
  )
}

function Back({ siteId }: { siteId: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Link to="/" className="text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
        <ArrowLeft size={13} /> обзор
      </Link>
      <span className="text-gray-700">/</span>
      <Link to={`/site/${siteId}`} className="text-gray-500 hover:text-gray-300 transition-colors">
        {siteId}
      </Link>
    </div>
  )
}
