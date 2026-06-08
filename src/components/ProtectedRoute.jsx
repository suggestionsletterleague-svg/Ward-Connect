import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingState } from './ui'

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <LoadingState label="Checking your access…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl">Access restricted</h1>
        <p className="mt-2 text-ink/60">
          Your account is signed in, but it doesn't have administrator access. Please contact
          your ward's clerk or technology specialist.
        </p>
      </div>
    )
  }

  return children
}
