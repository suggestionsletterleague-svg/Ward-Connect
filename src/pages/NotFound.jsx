import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <div className="text-5xl" aria-hidden="true">🕊️</div>
      <h1 className="mt-4 text-3xl">Page not found</h1>
      <p className="mt-2 max-w-xs text-ink/60">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn-primary mt-6">Return Home</Link>
    </div>
  )
}
