import { clsx } from 'clsx'

export function Badge({ children, color = 'blue', className }: {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'
  className?: string
}) {
  const colors = {
    blue: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/10 text-red-300 border-red-500/30',
    yellow: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    gray: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
    purple: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  }
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-[11px] leading-4 rounded-full border px-2 py-0.5 font-medium',
      colors[color], className,
    )}>
      {children}
    </span>
  )
}

export function Card({ children, className, hover }: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={clsx(
      'border border-[#21262d] rounded-xl bg-[#11151c] shadow-sm',
      hover && 'hover:border-emerald-500/40 hover:shadow-emerald-500/5 transition-all duration-200',
      className,
    )}>
      {children}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
      <span className="size-4 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin" />
      загрузка…
    </div>
  )
}

export function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="text-red-300 border border-red-500/30 bg-red-500/5 rounded-xl p-4 my-4 text-sm">
      {msg}
    </div>
  )
}

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{children}</h1>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export function fmtDate(iso: string): string {
  return iso?.slice(0, 10) ?? ''
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return '—'
  return iso.slice(0, 16).replace('T', ' ')
}
