import { api } from '../lib/api'
import { useQuery } from '../components/hooks'
import { Badge, ErrorBox, PageTitle, Spinner, fmtDateTime } from '../components/ui'
import { CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HealthPage() {
  const { data: health, loading, error } = useQuery(() => api.health(), [])
  const { data: index } = useQuery(() => api.index(), [])

  if (loading) return <Spinner />
  if (error) return <ErrorBox msg={error} />

  const rows = Object.entries(health ?? {}).sort((a, b) => {
    const errDiff = (b[1].consecutive_errors || 0) - (a[1].consecutive_errors || 0)
    if (errDiff !== 0) return errDiff
    return (b[1].last_success || '').localeCompare(a[1].last_success || '')
  })

  const ok = rows.filter(([, h]) => (h.consecutive_errors || 0) === 0).length
  const degraded = rows.length - ok

  const deadDays = (h: { last_success: string | null }) => {
    if (!h.last_success) return null
    const days = Math.floor((Date.now() - new Date(h.last_success).getTime()) / 864e5)
    return days > 0 ? days : null
  }

  return (
    <div className="space-y-5">
      <PageTitle sub="доступность документов при последних проверках">статус</PageTitle>

      <div className="flex gap-2">
        <Badge color="green"><CheckCircle2 size={11} /> {ok} ок</Badge>
        {degraded > 0 && <Badge color="red"><XCircle size={11} /> {degraded} с ошибками</Badge>}
      </div>

      <div className="border border-[#21262d] rounded-xl overflow-hidden bg-[#11151c]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#161b22] text-gray-500 text-[11px] uppercase tracking-wider text-left">
              <th className="px-4 py-2.5 font-medium">документ</th>
              <th className="px-4 py-2.5 font-medium">последний успех</th>
              <th className="px-4 py-2.5 font-medium">ошибок</th>
              <th className="px-4 py-2.5 font-medium">причина</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, h], i) => {
              const bad = (h.consecutive_errors || 0) > 0
              const site = index?.sites.find((s) => s.site.id === key.split('/')[0])?.site
              return (
                <motion.tr
                  key={key}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="border-t border-[#21262d] hover:bg-[#161b22] transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <span className="text-gray-500">{site?.name ?? key.split('/')[0]}</span>
                    <span className="text-gray-700 mx-1.5">/</span>
                    <span className="text-gray-300">{key.split('/')[1]}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 tabular-nums text-xs">
                    {fmtDateTime(h.last_success)}
                  </td>
                  <td className="px-4 py-2.5">
                    {bad
                      ? <Badge color={deadDays(h) && deadDays(h)! >= 7 ? 'red' : 'yellow'}>
                          {deadDays(h)
                            ? `мёртв ${deadDays(h)} дн.`
                            : `${h.consecutive_errors} ошибок`}
                        </Badge>
                      : <Badge color="green">0</Badge>}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-red-400/70 max-w-72 truncate">
                    {h.last_error ?? ''}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
