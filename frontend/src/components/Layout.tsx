import { NavLink, Link, useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'text-brand-800' : 'text-brand-400 hover:text-brand-700'
  }`

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors ${
    isActive ? 'text-brand-800' : 'text-brand-400'
  }`

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const business = auth.getBusiness()

  const handleLogout = () => {
    auth.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="sticky top-0 z-10 border-b border-brand-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-800 text-xs font-bold text-white">
              FE
            </span>
            <span className="text-base font-bold tracking-tight text-brand-900">FiEngine</span>
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
              <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-brand-500 transition-colors hover:text-brand-700">
                Sign in
              </Link>
              <Link to="/register" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-900">
                Get started
              </Link>
            </nav>
          )}

          {business && (
            <div className="flex items-center gap-3">
              <NavLink to="/settings" className="hidden text-sm font-medium text-brand-400 transition-colors hover:text-brand-700 sm:block">
                {business.name}
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>

      {/* Mobile bottom nav */}
      {business && (
        <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-brand-100 bg-white px-2 py-1.5 md:hidden">
          <div className="flex justify-around">
            <NavLink to="/dashboard" className={mobileNavClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Home
            </NavLink>
            <NavLink to="/chat" className={mobileNavClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A1.875 1.875 0 015.625 3h12.75A1.875 1.875 0 0120.25 4.875v10.5A1.875 1.875 0 0118.375 17.25H8.25l-4.5 2.855z" />
              </svg>
              Chat
            </NavLink>
            <NavLink to="/savings" className={mobileNavClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Goals
            </NavLink>
            <NavLink to="/wema" className={mobileNavClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
              Wema
            </NavLink>
            <NavLink to="/settings" className={mobileNavClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              More
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  )
}
