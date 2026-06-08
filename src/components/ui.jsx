import { categoryClass } from '../lib/constants'

export function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sage-dark">
      <Spinner className="text-sage" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({ icon = '🕊️', title, message }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-12 text-center">
      <div className="text-4xl" aria-hidden="true">{icon}</div>
      <h3 className="text-lg">{title}</h3>
      {message && <p className="max-w-xs text-sm text-ink/60">{message}</p>}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  const message =
    typeof error === 'string' ? error : error?.message || 'Something went wrong.'
  return (
    <div className="card border border-red-100 bg-red-50/50 text-center">
      <p className="font-semibold text-red-800">We couldn't load this content.</p>
      <p className="mt-1 text-sm text-red-700/80">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  )
}

export function CategoryChip({ category }) {
  if (!category) return null
  return <span className={`chip ${categoryClass(category)}`}>{category}</span>
}

export function PageHeading({ title, subtitle }) {
  return (
    <div className="mb-4 rise-in">
      <h1 className="text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-ink/60">{subtitle}</p>}
    </div>
  )
}
