import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { WARD_NAME } from '../../lib/constants'

export default function AdminResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [ready, setReady] = useState(false) // do we have a recovery session?
  const [checked, setChecked] = useState(false)
  const [status, setStatus] = useState('idle') // idle | submitting | done
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase parses the recovery token from the link and establishes a session.
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session)
      setChecked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true)
        setChecked(true)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Please use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setStatus('submitting')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setStatus('idle')
    } else {
      setStatus('done')
      setTimeout(() => navigate('/admin', { replace: true }), 1600)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/icon-192.png" alt="" className="mx-auto h-16 w-16 rounded-2xl shadow-card" />
          <h1 className="mt-4 text-2xl text-white">Choose a New Password</h1>
          <p className="mt-1 text-sm text-white/70">{WARD_NAME}</p>
        </div>

        {status === 'done' ? (
          <div className="card text-center">
            <div className="text-4xl" aria-hidden="true">✅</div>
            <h2 className="mt-2 text-lg">Password updated</h2>
            <p className="mt-1 text-sm text-ink/65">Taking you to the admin dashboard…</p>
          </div>
        ) : checked && !ready ? (
          <div className="card text-center">
            <div className="text-4xl" aria-hidden="true">⏳</div>
            <h2 className="mt-2 text-lg">Link expired or invalid</h2>
            <p className="mt-1 text-sm text-ink/65">
              This reset link is no longer valid. Please request a new one.
            </p>
            <Link to="/admin/forgot" className="btn-primary mt-5 w-full">Request New Link</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4">
            <div>
              <label htmlFor="password" className="label">New Password</label>
              <input id="password" type="password" autoComplete="new-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label htmlFor="confirm" className="label">Confirm New Password</label>
              <input id="confirm" type="password" autoComplete="new-password" required className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={status === 'submitting' || !ready}>
              {status === 'submitting' ? 'Updating…' : 'Update Password'}
            </button>
            {!ready && <p className="text-center text-xs text-ink/45">Verifying your reset link…</p>}
          </form>
        )}
      </div>
    </div>
  )
}
