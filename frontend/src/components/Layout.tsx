import { NavLink, Link, useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-400'
  }`

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const business = auth.getBusiness()

  const handleLogout = () => {
    auth.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">
              ₦
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">FiEngine</span>
          </NavLink>

          {business && (
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/reports" className={navLinkClass}>Reports</NavLink>
              <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
              <NavLink to="/savings" className={navLinkClass}>Savings</NavLink>
              <NavLink to="/wema" className={navLinkClass}>Wema</NavLink>
              <NavLink to="/analytics" className={navLinkClass}>Analytics</NavLink>
            </nav>
          )}

          {!business && (
            <nav className="flex items-center gap-2">
              <Link to="/login" className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
                Sign in
              </Link>
              <Link to="/register" className="rounded-full bg-brand-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
                Get started
              </Link>
            </nav>
          )}

          {business && (
            <div className="flex items-center gap-3">
              <NavLink to="/settings" className="hidden text-sm text-slate-500 transition-colors hover:text-slate-900 sm:block">
                {business.name}
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>

      {/* Mobile bottom nav */}
      {business && (
        <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white px-2 py-1.5 md:hidden">
          <div className="flex justify-around">
            <NavLink to="/dashboard" className={mobileNavClass}>
              <span className="text-lg">📊</span>
              Home
            </NavLink>
            <NavLink to="/chat" className={mobileNavClass}>
              <span className="text-lg">💬</span>
              Chat
            </NavLink>
            <NavLink to="/savings" className={mobileNavClass}>
              <span className="text-lg">🎯</span>
              Goals
            </NavLink>
            <NavLink to="/wema" className={mobileNavClass}>
              <span className="text-lg">🏦</span>
              Wema
            </NavLink>
            <NavLink to="/settings" className={mobileNavClass}>
              <span className="text-lg">⚙️</span>
              More
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  )
}
