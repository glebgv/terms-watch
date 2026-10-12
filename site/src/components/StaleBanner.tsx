import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../lib/api'
import { STALE_THRESHOLD_HOURS } from '../lib/constants'

function fmtAge(hours: number): string {
  if (hours < 1) return 'меньше часа'
  if (hours < 24) return `${Math.floor(hours)} ч`
  const d = Math.floor(hours / 24)
  const h = Math.floor(hours % 24)
  return h ? `${d} дн ${h} ч` : `${d} дн`
}

export default function StaleBanner() {
  const [ageHours, setAgeHours] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    const check = async () => {
      try {
        const idx = await api.index()
        const ts = new Date(idx.generated_at).getTime()
        if (alive && Number.isFinite(ts)) {
          setAgeHours((Date.now() - ts) / 36e5)
        }
      } catch {
        /* данные недоступны — не пугаем ложным баннером */
      }
    }
    check()
    const timer = setInterval(check, 60 * 60 * 1000) // пересчёт раз в час
    return () => { alive = false; clearInterval(timer) }
  }, [])

  const stale = ageHours !== null && ageHours > STALE_THRESHOLD_HOURS

  return (
    <AnimatePresence>
      {stale && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-amber-500/10 border-b border-amber-500/30"
          role="alert"
        >
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2.5 text-sm text-amber-200 flex-wrap">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>
              Данные не обновлялись <b className="tabular-nums">{fmtAge(ageHours!)}</b> —
              нет синхронизации с бэкендом
            </span>
            <Link
              to="/health"
              className="ml-auto text-xs text-amber-400/80 hover:text-amber-300 underline underline-offset-2"
            >
              подробнее →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
