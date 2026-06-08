import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { WARD_NAME } from '../../lib/constants'

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | sent
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset`
    })
    if (error) {
      setError(error.message)
      setStatus('idle')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/icon-192.png" alt="" className="mx-auto h-16 w-16 rounded-2xl shadow-card" />
          <h1 className="mt-4 text-2xl text-white">Reset Password</h1>
          <p className="mt-1 text-sm text-white/70">{WARD_NAME}</p>
        </div>

        {status === 'sent' ? (
          <div className="card text-center">
            <div className="text-4xl" aria-hidden="true">📬</div>
            <h2 className="mt-2 text-lg">Check your email</h2>
            <p className="mt-1 text-sm text-ink/65">
              If an account exists for <span className="font-semibold">{email}</span>, a password
              reset link is on its way. The link opens a page where you can choose a new password.
            </p>
            <Link to="/admin/login" className="btn-primary mt-5 w-full">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4">
            <p className="text-sm text-ink/65">
              Enter the email on your leader account and we'll send a reset link.
            </p>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center">
          <Link to="/admin/login" className="text-sm text-white/60 underline-offset-4 hover:underline">
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
