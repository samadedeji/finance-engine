import { NavLink, useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const business = auth.getBusiness()

  const handleLogout = () => {
    auth.clear()
    navigate('/login')
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
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavLink to="/" className={navLinkClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/chat" className={navLinkClass}>
                Chat
              </NavLink>
            </nav>
          )}

          {business && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:block">{business.name}</span>
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
    </div>
  )
}