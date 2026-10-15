import { useParams, Link } from 'react-router-dom'
import { versionsAll } from '../lib/api'
import { useQuery } from '../components/hooks'
import { Badge, Card, ErrorBox, PageTitle, Spinner, fmtDateTime } from '../components/ui'
import { ArrowLeft, FileText, GitCommitHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SitePage() {
  const { siteId } = useParams()
  const { data, loading, error } = useQuery(() => versionsAll(siteId!), [siteId])

  if (loading) return <Spinner />
  if (error) return <ErrorBox msg={error} />

  const { agg, versions, changelog } = data!

  return (
    <div className="space-y-7">
      <div>
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
          <ArrowLeft size={13} /> обзор
        </Link>
        <div className="mt-2">
          <PageTitle sub={agg.site.url}>
            {agg.site.name}
          </PageTitle>
        </div>
        <div className="flex gap-2 flex-wrap -mt-4">
          <Badge color="gray"><FileText size={11} /> {agg.site.docs.length} документов</Badge>
          <Badge color="gray"><GitCommitHorizontal size={11} /> {agg.changes_count} изменений</Badge>
          <Badge color="gray">с {agg.site.added}</Badge>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-gray-500">документы</h2>
        {agg.docs.map((meta: any, i: number) => (
          <motion.div
            key={meta.doc_id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.25 }}
          >
            <Card hover className="p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold">{meta.doc_title}</h3>
                  <a href={meta.url} target="_blank" rel="noreferrer"
                     className="text-xs text-gray-600 hover:text-blue-400/80 transition-colors truncate block max-w-xl">
                    {meta.url}
                  </a>
                </div>
                <div className="text-xs text-gray-500 text-right shrink-0 space-y-0.5">
                  <div>версий: <span className="text-gray-300 tabular-nums">{meta.total_versions}</span></div>
                  <div>проверка: {fmtDateTime(meta.last_check)}</div>
                </div>
              </div>

              <div className="mt-3.5 flex items-center gap-1 flex-wrap">
                {(versions[meta.doc_id] ?? []).map((v) => {
                  const change = changelog.find(
                    (c: any) => c.doc_id === meta.doc_id && c.date === v.date)
                  const tip = `${v.date} · ${v.hash.slice(0, 12)} · ${v.text_length} симв.${v.notes ? ' · ' + v.notes : ''}`
                  return change ? (
                    <Link
                      key={v.date + v.hash.slice(0, 6)}
                      to={`/diff/${siteId}/${meta.doc_id}/${v.date}`}
                      title={tip}
                      className="size-3.5 rounded-full bg-emerald-500 hover:scale-150 transition-transform border-2 border-[#11151c] shadow-[0_0_0_1px] shadow-emerald-500/60"
                    />
                  ) : (
                    <span
                      key={v.date + v.hash.slice(0, 6)}
                      title={tip}
                      className="size-3.5 rounded-full bg-[#30363d] border-2 border-[#11151c]"
                    />
                  )
                })}
                <span className="text-[11px] text-gray-600 ml-2 tabular-nums">
                  {(versions[meta.doc_id] ?? []).length} снапшотов
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">изменения</h2>
        {changelog.length === 0 && (
          <p className="text-gray-600 text-sm py-6 text-center border border-dashed border-[#21262d] rounded-xl">
            пока без изменений
          </p>
        )}
        <div className="space-y-2">
          {changelog.map((e: any, i: number) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}>
              <Link
                to={`/diff/${siteId}/${e.doc_id}/${e.date}`}
                className="block border border-[#21262d] rounded-xl px-4 py-2.5 hover:border-emerald-500/40 bg-[#11151c] text-sm transition-all group"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-600 tabular-nums text-xs">{e.date}</span>
                  <span className="font-semibold group-hover:text-emerald-300 transition-colors">{e.doc_title}</span>
                  {e.is_major && <Badge color="yellow">major</Badge>}
                </div>
                <span className="text-gray-500 block text-xs mt-1">{e.summary}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
