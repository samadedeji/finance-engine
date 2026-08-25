import { useState } from 'react'
import { api, auth } from '../api/client'

export default function Settings() {
  const business = auth.getBusiness()!
  const [name, setName] = useState(business.name)
  const [businessType, setBusinessType] = useState(business.business_type ?? '')
  const [phoneNumber, setPhoneNumber] = useState(business.phone_number)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)
    setProfileSaving(true)
    try {
      const updated = await api.updateProfile({ name, business_type: businessType || undefined, phone_number: phoneNumber })
      auth.setBusiness(updated)
      setProfileSuccess(true)
    } catch (err) { setProfileError(err instanceof Error ? err.message : 'Update failed') }
    finally { setProfileSaving(false) }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }
    if (newPassword.length < 6) { setPasswordError('Must be at least 6 characters'); return }
    setPasswordSaving(true)
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) { setPasswordError(err instanceof Error ? err.message : 'Password change failed') }
    finally { setPasswordSaving(false) }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Settings</h1>
        <p className="mt-1 text-sm text-brand-500">Manage your business profile and account.</p>
      </div>

      <div className="rounded-lg border border-brand-100 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-900">Business profile</h2>
        {profileSuccess && <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Profile updated.</div>}
        {profileError && <div className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{profileError}</div>}
        <form className="mt-4 space-y-4" onSubmit={handleProfileSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">Business name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">Business type</label>
            <input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. retail" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">Phone number</label>
            <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <button type="submit" disabled={profileSaving} className="w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-50">
            {profileSaving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-brand-100 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-900">Change password</h2>
        {passwordSuccess && <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Password updated.</div>}
        {passwordError && <div className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{passwordError}</div>}
        <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">Current password</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">New password</label>
            <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">Confirm new password</label>
            <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <button type="submit" disabled={passwordSaving} className="w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-50">
            {passwordSaving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-brand-100 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-900">Account</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-500">Phone number</span>
            <span className="font-medium text-brand-900">{business.phone_number}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-500">Business type</span>
            <span className="font-medium text-brand-900 capitalize">{business.business_type || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-500">Member since</span>
            <span className="font-medium text-brand-900">
              {business.created_at ? new Date(business.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
