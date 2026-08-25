import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    setLoading(true)
    try {
      const res = await api.register({
        name: String(fd.get('name')),
        phone_number: String(fd.get('phone_number')),
        password: String(fd.get('password')),
        business_type: String(fd.get('business_type')) || undefined,
      })
      auth.setBusiness(res.business, res.access_token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-md rounded-lg border border-brand-100 bg-white p-8">
      <h1 className="text-2xl font-bold text-brand-900">Create your account</h1>
      <p className="mt-1 text-sm text-brand-500">Start tracking sales and expenses in minutes.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          name="name"
          required
          placeholder="Business name"
          className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <input
          name="business_type"
          placeholder="Business type (optional)"
          className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <input
          name="phone_number"
          required
          placeholder="Phone number"
          className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brand-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
