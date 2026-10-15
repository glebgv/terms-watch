import { useState } from 'react'
import { useQuery } from '../components/hooks'
import { api } from '../lib/api'
import ChangeCard from '../components/ChangeCard'
import { Badge, Card, ErrorBox, Spinner } from '../components/ui'
import { motion } from 'framer-motion'
import { Globe, FileText, GitCommitHorizontal, Clock, History } from 'lucide-react'
import type { ChangelogEntry } from '../lib/types'
import { STALE_THRESHOLD_HOURS } from '../lib/constants'
import { useGlobalSearch } from '../App'

const PAGE_SIZE = 50
const RECENT_WINDOW_MS = 90 * 24 * 3600 * 1000 // 3 месяца

const SITE_ICONS: Record<string, string> = {
  hh: 'hh.png',
  superjob: 'superjob.png',
  selectel: 'selectel.png',
  vk: 'vk.png',
  timeweb: 'timeweb.png',
  profi: 'profi.png',
  habr: 'habr.png',
  cloudru: 'cloudru.png',
  yandex: 'yandex.png',
  fl: 'fl.png',
  avito: 'avito.png',
  ok: 'ok.png',
  beget: 'beget.png',
  vkcloud: 'vkcloud.png',
  rutube: 'rutube.png',
}

export default function Dashboard() {
  const { data, loading, error } = useQuery(() => api.index(), [])
  const { q } = useGlobalSearch()
  const [site, setSite] = useState('')
  const [kw, setKw] = useState('')
  const [year, setYear] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  if (loading) return <Spinner />
  if (error) return <ErrorBox msg={error} />

  const sites = data!.sites.filter((s) => s.site.active)
  const totalDocs = sites.reduce((n: number, s: any) => n + s.docs.length, 0)
  const totalChanges = sites.reduce((n: number, s: any) => n + s.changes_count, 0)
  const lastGen = data!.generated_at.slice(0, 16).replace('T', ' ')
  const ageHours = (Date.now() - new Date(data!.generated_at).getTime()) / 36e5
  const isStale = ageHours > STALE_THRESHOLD_HOURS

  // последнее изменение каждого документа, не старше 3 месяцев
  const recentCutoff = Date.now() - RECENT_WINDOW_MS
  const latest = new Map<string, ChangelogEntry>()
  for (const e of data!.changelog) {
    const k = `${e.site_id}/${e.doc_id}`
    if (latest.has(k)) continue // changelog отсортирован по убыванию даты
    const ts = new Date(e.date.slice(0, 10)).getTime()
    if (ts >= recentCutoff) latest.set(k, e)
  }
  let entries = Array.from(latest.values())

  if (site) entries = entries.filter((e) => e.site_id === site)
  if (kw) entries = entries.filter((e) => e.keywords.includes(kw))
  if (year) entries = entries.filter((e) => e.date.startsWith(year))
  if (q) {
    const ql = q.toLowerCase()
    entries = entries.filter((e) => JSON.stringify(e).toLowerCase().includes(ql))
  }

  const allKeywords = [...new Set<string>(data!.changelog.flatMap((e) => e.keywords))]
  const allYears = [...new Set<string>(data!.changelog.map((e) => e.date.slice(0, 4)))].sort().reverse()

  return (
    <div className="space-y-6">
      <section className="silver-bar border border-[#21262d] rounded-2xl bg-gradient-to-b from-[#141a24] to-[#11151c] px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="silver-text">terms·watch</span>
          <span className="text-gray-600 font-normal mx-2">—</span>
          обзор
        </h1>
        <p className="text-sm text-gray-200 font-medium mt-1.5 max-w-3xl leading-relaxed">
          мониторинг изменений пользовательских соглашений, оферт
          и политик конфиденциальности
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={<Globe size={16} />} label="сайтов" value={sites.length} />
        <Stat icon={<FileText size={16} />} label="документов" value={totalDocs} />
        <Stat icon={<GitCommitHorizontal size={16} />} label="изменений" value={totalChanges} />
        <Stat icon={<Clock size={16} />} label="обновлено (UTC)" value={lastGen} small
              stale={isStale} />
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">сайты</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {sites.map(({ site: s, changes_count, last_change }: any, i: number) => (
            <motion.a
              key={s.id}
              href={`#/site/${s.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Card hover className="p-3.5 block">
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0 size-9 rounded-lg overflow-hidden bg-white/10 border border-[#21262d] flex items-center justify-center">
                    {SITE_ICONS[s.id] ? (
                      <img
                        src={`${import.meta.env.BASE_URL}icons/${SITE_ICONS[s.id]}`}
                        alt={s.name}
                        className="size-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div className="font-semibold text-sm truncate">{s.name}</div>
                </div>
                <div className="text-xs text-gray-500 mt-2.5 space-y-0.5">
                  <div><span className="text-gray-400 tabular-nums">{s.docs.length}</span> док. · <span className="text-gray-400 tabular-nums">{changes_count}</span> изм.</div>
                  {last_change && <div className="text-gray-600">посл. {last_change.date.slice(0, 10)}</div>}
                </div>
              </Card>
            </motion.a>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap gap-2 mb-4 items-center justify-end">
          <Select value={site} onChange={setSite} placeholder="все сайты"
                  options={sites.map(({ site: s }: any) => [s.id, s.name])} />
          <Select value={kw} onChange={setKw} placeholder="все темы"
                  options={allKeywords.map((k) => [k, k])} />
          <Select value={year} onChange={setYear} placeholder="все годы"
                  options={allYears.map((y) => [y, y])} />
        </div>

        <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
          последние изменения по документам <Badge color="gray">{entries.length}</Badge>
        </h2>
        <div className="space-y-3">
          {entries.length === 0 && (
            <p className="text-gray-600 text-sm py-8 text-center border border-dashed border-[#21262d] rounded-xl">
              ничего не найдено
            </p>
          )}
          {entries.slice(0, visible).map((e: any, i: number) => (
            <ChangeCard key={`${e.site_id}-${e.doc_id}-${e.date}-${i}`} e={e} index={i} />
          ))}
          {entries.length > visible && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="w-full py-2.5 text-sm text-emerald-400/80 hover:text-emerald-300
                         border border-dashed border-[#21262d] hover:border-emerald-500/40
                         rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <History size={14} /> показать ещё ({entries.length - visible})
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function Stat({ icon, label, value, small, stale }: {
  icon: React.ReactNode; label: string; value: string | number; small?: boolean
  stale?: boolean
}) {
  return (
    <Card className={`p-4 ${stale ? 'border-amber-500/40' : ''}`}>
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${stale ? 'text-amber-400' : 'text-gray-500'}`}>
        {icon}{label}
      </div>
      <div className={small
        ? `text-sm font-semibold mt-2 tabular-nums ${stale ? 'text-amber-300' : 'text-gray-300'}`
        : 'text-3xl font-bold mt-1 tabular-nums text-emerald-400'}>
        {value}
      </div>
    </Card>
  )
}

function Select({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string
  options: [string, string][]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#11151c] border border-[#21262d] rounded-lg px-3 py-2 text-sm
                 focus:outline-none focus:border-emerald-500/50 hover:border-[#30363d]
                 transition-colors cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}
