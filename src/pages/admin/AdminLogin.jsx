import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../lib/supabase'
import { WARD_NAME } from '../../lib/constants'

export default function AdminLogin() {
  const { signIn, user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && user && isAdmin) navigate(from, { replace: true })
  }, [loading, user, isAdmin, from, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setSubmitting(false)
    }
    // On success, the effect above redirects once the profile/role loads.
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/icon-192.png" alt="" className="mx-auto h-16 w-16 rounded-2xl shadow-card" />
          <h1 className="mt-4 text-2xl text-white">Ward Leader Sign In</h1>
          <p className="mt-1 text-sm text-white/70">{WARD_NAME}</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {!isSupabaseConfigured && (
            <p className="rounded-lg bg-gold-mist px-3 py-2 text-sm text-gold-dark">
              Supabase isn't configured yet. Add your credentials to a <code>.env</code> file.
            </p>
          )}
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-center">
            <Link to="/admin/forgot" className="text-sm text-navy-light underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-white/60 underline-offset-4 hover:underline">
            ← Back to Ward Connect
          </Link>
        </p>
      </div>
    </div>
  )
}
