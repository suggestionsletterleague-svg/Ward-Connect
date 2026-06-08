import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallBanner() {
  const { canInstall, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="no-print mx-auto max-w-lg px-4 pt-3">
      <div className="flex items-center gap-3 rounded-xl bg-gold-mist px-4 py-3 text-navy-dark shadow-soft">
        <img src="/icon-192.png" alt="" className="h-9 w-9 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install Ward Connect</p>
          <p className="text-xs text-navy/70">Add it to your home screen for quick access.</p>
        </div>
        <button onClick={promptInstall} className="btn-gold px-3 py-1.5 text-sm">
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1 text-navy/50 hover:bg-white/40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
