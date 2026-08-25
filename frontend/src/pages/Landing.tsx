import { Link } from 'react-router-dom'
import {
  ArrowUpRight, ArrowDownRight, MessageSquare, BarChart3,
  Flame, Target, Building2, TrendingUp, Package, CreditCard,
} from 'lucide-react'

const features = [
  {
    icon: <ArrowUpRight size={20} className="text-emerald-600" />,
    title: 'Track Income & Expenses',
    description: 'Log sales and spending in seconds — by hand or through chat.',
  },
  {
    icon: <MessageSquare size={20} className="text-brand-600" />,
    title: 'WhatsApp-style Chat',
    description: 'Type "sold 3 sachets, 500 naira" and watch it appear in your books instantly.',
  },
  {
    icon: <BarChart3 size={20} className="text-blue-600" />,
    title: 'Instant Reports',
    description: 'See your income, expenses, and net profit — with trends and smart advice.',
  },
  {
    icon: <ArrowDownRight size={20} className="text-rose-600" />,
    title: 'Know Where Money Goes',
    description: 'Top spending categories at a glance so you can cut what doesn\'t matter.',
  },
  {
    icon: <Flame size={20} className="text-orange-600" />,
    title: 'Sales Streak',
    description: 'Track consecutive profitable days — build momentum.',
  },
  {
    icon: <Target size={20} className="text-purple-600" />,
    title: 'Savings Goals',
    description: 'Set targets and auto-save a percentage of every sale.',
  },
  {
    icon: <Building2 size={20} className="text-brand-700" />,
    title: 'Wema Virtual Account',
    description: 'Get a unique bank account for your business — track real balances.',
  },
  {
    icon: <TrendingUp size={20} className="text-teal-600" />,
    title: 'Cash Flow Calendar',
    description: 'Visual heatmap of your daily income and expenses over time.',
  },
  {
    icon: <Package size={20} className="text-indigo-600" />,
    title: 'Restock Reminders',
    description: 'AI-powered suggestions when sales velocity increases.',
  },
  {
    icon: <CreditCard size={20} className="text-amber-600" />,
    title: 'Loan Readiness',
    description: 'See if you qualify for a Wema SME loan based on your data.',
  },
]

const howItWorks = [
  { step: '1', title: 'Chat or type', description: 'Log sales via WhatsApp-style chat or the web form — same data, two ways.' },
  { step: '2', title: 'Auto-track', description: 'Your data feeds into reports, savings goals, and financial insights automatically.' },
  { step: '3', title: 'Get smart advice', description: 'Plain-language tips on spending, restocking, and saving — based on YOUR numbers.' },
]

export default function Landing() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="py-12 text-center md:py-20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-700 text-3xl font-bold text-white shadow-lg shadow-brand-700/20">
          ₦
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Your business finances,
          <br />
          <span className="text-brand-700">in plain language.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-slate-500 sm:text-lg">
          Record sales, track expenses, save money, and get actionable insights — all
          through a simple chat or dashboard. Built for small businesses in Nigeria.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-700/20 transition-colors hover:bg-brand-800"
          >
            Get started free
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          How it works
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {howItWorks.map((h) => (
            <div key={h.step} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {h.step}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{h.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Everything you need, nothing you don't.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wema integration callout */}
      <section className="rounded-2xl bg-slate-900 px-6 py-12 text-center text-white shadow-lg sm:px-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-brand-700">
          ₦
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Powered by Wema Bank
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300 sm:text-base">
          Virtual accounts, instant payouts, savings pockets, and loan readiness — all
          connected through the ALAT by Wema API.
        </p>
        <Link
          to="/register"
          className="mt-6 inline-block rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-brand-600"
        >
          Start tracking your money
        </Link>
      </section>
    </div>
  )
}
