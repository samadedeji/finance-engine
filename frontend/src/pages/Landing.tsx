import { Link } from 'react-router-dom'
import {
  ArrowUpRight, MessageSquare, BarChart3,
  TrendingUp, Target, Building2, Shield,
} from 'lucide-react'

const features = [
  {
    icon: <MessageSquare size={22} className="text-brand-700" />,
    title: 'WhatsApp-style input',
    description: 'Log a sale as easily as sending a text. No spreadsheets, no forms — just type what you sold.',
  },
  {
    icon: <BarChart3 size={22} className="text-brand-700" />,
    title: 'Real-time dashboards',
    description: 'See your income, expenses, and profit at a glance. Daily, weekly, or monthly views.',
  },
  {
    icon: <TrendingUp size={22} className="text-brand-700" />,
    title: 'Smart insights',
    description: 'Automated trend analysis and plain-language advice based on your actual numbers.',
  },
  {
    icon: <Target size={22} className="text-brand-700" />,
    title: 'Savings goals',
    description: 'Set targets and auto-save a percentage of every sale. Watch your progress grow.',
  },
  {
    icon: <Building2 size={22} className="text-brand-700" />,
    title: 'Wema Bank integration',
    description: 'Virtual accounts, bank reconciliation, and instant payouts through the ALAT API.',
  },
  {
    icon: <Shield size={22} className="text-brand-700" />,
    title: 'Loan readiness',
    description: 'Your transaction history builds a financial profile. Know if you qualify for SME financing.',
  },
]

const stats = [
  { value: '4', label: 'Input methods', detail: 'Chat, form, voice, bulk' },
  { value: '20+', label: 'Features', detail: 'Analytics, alerts, reports' },
  { value: '< 2 min', label: 'Setup time', detail: 'No bank connection needed' },
  { value: '100%', label: 'Free', detail: 'No hidden charges' },
]

const steps = [
  {
    number: '01',
    title: 'Start logging',
    description: 'Register in seconds. Then type your sales and expenses — however you prefer.',
  },
  {
    number: '02',
    title: 'See your numbers',
    description: 'Your data feeds into dashboards, reports, and trend analysis automatically.',
  },
  {
    number: '03',
    title: 'Act on insights',
    description: 'Get actionable advice on spending, restocking, and saving — based on your actual data.',
  },
]

export default function Landing() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Built for Hackaholics 7.0
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl md:text-6xl">
            Financial clarity
            <br />
            for small businesses.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-600">
            Track sales, monitor expenses, and understand your cash flow — all through a
            chat interface or dashboard. No accounting degree required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
            >
              Get started
              <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-brand-100 bg-white py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-brand-900 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-brand-700">{s.label}</p>
              <p className="text-xs text-brand-400">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-900">
              Three steps to financial visibility
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="relative">
                <span className="text-5xl font-bold text-brand-100">{s.number}</span>
                <h3 className="mt-2 text-lg font-semibold text-brand-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-500">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-brand-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">Features</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-900">
              Everything you need. Nothing you don't.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-brand-100 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-brand-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl md:flex md:items-center md:gap-12">
          <div className="md:flex-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">The problem</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-900">
              Small businesses can't track their own money.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-500">
              Each sale is too quick, too small, and too frequent for manual bookkeeping.
              Most business owners have no real insight into their finances — no trend data,
              no early warning on shrinking margins, no guidance on simple decisions that
              could improve their bottom line.
            </p>
          </div>
          <div className="my-8 h-px w-full bg-brand-100 md:my-0 md:h-auto md:w-px md:bg-brand-200" />
          <div className="md:flex-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">The solution</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-900">
              Meet them where they already are.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-500">
              FiEngine works through WhatsApp-style chat — logging a sale is as easy as
              texting a friend. The same data feeds into dashboards, reports, and financial
              advice. No new app to learn, no daily habit to build.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-900 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Start tracking your money today.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-brand-300">
            Free to use. Set up in under two minutes. No bank connection required.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            Create your account
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-800 text-xs font-bold text-white">
              FE
            </span>
            <span className="text-sm font-semibold text-brand-800">FiEngine</span>
          </div>
          <p className="text-xs text-brand-400">
            Built for Hackaholics 7.0. Powered by Wema Bank ALAT API.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-brand-500 hover:text-brand-700">Sign in</Link>
            <Link to="/register" className="text-xs text-brand-500 hover:text-brand-700">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
