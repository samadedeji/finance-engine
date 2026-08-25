import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, MessageSquare, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: <ArrowUpRight size={20} className="text-emerald-600" />,
    title: 'Track Income & Expenses',
    description: 'Log sales and spending in seconds — by hand or through chat.',
  },
  {
    icon: <MessageSquare size={20} className="text-brand-600" />,
    title: 'Chat to Log',
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
    description: "Top spending categories at a glance so you can cut what doesn't matter.",
  },
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
          Record sales, track expenses, and get actionable insights — all through a
          simple chat or dashboard. Built for small businesses in Nigeria.
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

      {/* Features */}
      <section className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Everything you need, nothing you don't.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {/* CTA */}
      <section className="rounded-2xl bg-brand-700 px-6 py-12 text-center text-white shadow-lg shadow-brand-700/20 sm:px-12">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Start tracking your money today.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-100 sm:text-base">
          Free to use. Set up in under 2 minutes. No bank connection needed.
        </p>
        <Link
          to="/register"
          className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow transition-colors hover:bg-brand-50"
        >
          Create your account
        </Link>
      </section>
    </div>
  )
}
