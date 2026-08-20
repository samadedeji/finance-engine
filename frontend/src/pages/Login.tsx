import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  useEffect(() => {
    if (auth.getBusiness()) navigate('/', { replace: true })
  }, [navigate])

  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to see your business report.</p>
      <div className="mt-6 rounded-xl border border-dashed border-brand-500 bg-brand-50 p-4 text-sm text-brand-800">
        Login screen — being built by your teammate. Use the form below meanwhile:
      </div>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          void fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone_number: fd.get('phone_number'),
              password: fd.get('password'),
            }),
          })
            .then((r) => r.json())
            .then((b) => {
              if (b.id) {
                auth.setBusiness(b)
                navigate('/')
              }
            })
        }}
      >
        <input
          name="phone_number"
          placeholder="Phone number (e.g. 08010000000)"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button className="w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}