import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      const business = await api.register({
        name: String(fd.get('name')),
        phone_number: String(fd.get('phone_number')),
        password: String(fd.get('password')),
        business_type: String(fd.get('business_type')) || undefined,
      })
      auth.setBusiness(business)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Create your business account</h1>
      <p className="mt-1 text-sm text-slate-500">Start tracking sales and expenses in minutes.</p>

      {error && (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          name="name"
          required
          placeholder="Business name"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="business_type"
          placeholder="Business type (optional, e.g. retail)"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="phone_number"
          required
          placeholder="Phone number (e.g. 08010000000)"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button className="w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
          Create account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}