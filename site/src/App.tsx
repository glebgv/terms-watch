import { Link, Outlet, useLocation } from 'react-router-dom'
import { Scale, Activity, ShieldCheck, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { createContext, useContext, useState } from 'react'
import StaleBanner from './components/StaleBanner'

export const SearchCtx = createContext<{ q: string; setQ: (v: string) => void }>(
  { q: '', setQ: () => {} })
export const useGlobalSearch = () => useContext(SearchCtx)

const nav = [
  { to: '/', label: 'обзор', icon: Activity },
  { to: '/health', label: 'статус', icon: Scale },
]

export default function App() {
  const { pathname } = useLocation()
  const [q, setQ] = useState('')
  return (
    <SearchCtx.Provider value={{ q, setQ }}>
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#21262d] sticky top-0 z-20 bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Scale size={24} strokeWidth={2.2} />
            </span>
            <span className="text-xl font-bold tracking-tight silver-text">
              terms·watch
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
          <label className="relative ml-auto hidden md:block w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="search"
              placeholder="поиск по изменениям…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-[#11151c] border border-[#21262d] rounded-full pl-9 pr-3 py-1.5 text-sm
                         focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30
                         placeholder:text-gray-600 transition-all"
            />
          </label>
          <span className="hidden lg:block text-sm font-medium text-gray-300 border border-[#21262d] bg-[#11151c] rounded-full px-3.5 py-1.5">
            <ShieldCheck size={14} className="inline mr-1.5 -mt-0.5 text-emerald-400" />
            открытый монитор правовых документов
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
    </SearchCtx.Provider>
  )
}
