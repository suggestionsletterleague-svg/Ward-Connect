import { Link } from 'react-router-dom'
import BottomNav from './BottomNav'
import InstallBanner from './InstallBanner'
import { WARD_NAME } from '../lib/constants'

export default function Layout({ children, title, showBack = false }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="no-print sticky top-0 z-30 bg-navy text-white shadow-soft">
        <div
          className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3"
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
        >
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              className="rounded-lg p-1.5 hover:bg-white/10"
              aria-label="Go back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2" aria-label="Ward Connect home">
              <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
            </Link>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight">
              {title || 'Ward Connect'}
            </p>
            {!title && <p className="truncate text-xs text-white/70">{WARD_NAME}</p>}
          </div>
        </div>
      </header>

      <InstallBanner />

      <main className="mx-auto max-w-lg px-4 pb-28 pt-4">{children}</main>

      <BottomNav />
    </div>
  )
}
