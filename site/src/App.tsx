import { Link, Outlet, useLocation } from 'react-router-dom'
import { Scale, Activity, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import StaleBanner from './components/StaleBanner'

const nav = [
  { to: '/', label: 'обзор', icon: Activity },
  { to: '/health', label: 'статус', icon: Scale },
]

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#21262d] sticky top-0 z-20 bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Scale size={22} strokeWidth={2.2} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              terms<span className="text-emerald-400">·</span>watch
            </span>
          </Link>
          <nav className="flex gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active ? 'text-emerald-300' : 'text-gray-400 hover:text-gray-100 hover:bg-[#161b22]'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-emerald-950/60 border border-emerald-900 rounded-md -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
          <span className="ml-auto text-xs text-gray-600 hidden md:flex items-center gap-1.5">
            <ShieldCheck size={13} />
            локальный монитор правовых документов
          </span>
        </div>
      </header>
      <StaleBanner />
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[#21262d] py-4 text-center text-xs text-gray-600">
        полные тексты хранятся локально · диффы цитируются в информационных целях
      </footer>
    </div>
  )
}
