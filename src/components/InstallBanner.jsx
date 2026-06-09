import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { WARD_NAME } from '../lib/constants'
import Modal from './Modal'

export default function InstallBanner() {
  const { platform, canInstall, showPrompt, promptInstall, dismiss } = useInstallPrompt()

  if (!showPrompt) return null

  return (
    <Modal
      open={showPrompt}
      onClose={dismiss}
      title="Add to Home Screen"
      maxWidth="max-w-sm"
    >
      <div className="text-center">
        <img
          src="/icon-192.png"
          alt=""
          className="mx-auto h-20 w-20 rounded-2xl shadow-soft"
        />
        <p className="mt-4 text-base font-semibold text-navy">{WARD_NAME}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Install the ward app on your home screen for quick access — just like a regular app.
        </p>
      </div>

      {platform === 'ios' && (
        <ol className="mt-5 space-y-3 text-sm text-ink/80">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              1
            </span>
            <span>
              Tap the <strong>Share</strong> button at the bottom of Safari
              <span className="inline-block px-1" aria-hidden="true">⬆️</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              2
            </span>
            <span>
              Scroll down and tap <strong>Add to Home Screen</strong>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              3
            </span>
            <span>
              Tap <strong>Add</strong> — you&apos;ll see the ward icon on your home screen
            </span>
          </li>
        </ol>
      )}

      {platform === 'android' && !canInstall && (
        <ol className="mt-5 space-y-3 text-sm text-ink/80">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              1
            </span>
            <span>
              Tap the <strong>menu</strong> button (three dots) in Chrome
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              2
            </span>
            <span>
              Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>
            </span>
          </li>
        </ol>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {platform === 'android' && canInstall && (
          <button onClick={promptInstall} className="btn-gold w-full">
            Install now
          </button>
        )}
        <button onClick={dismiss} className="btn-ghost w-full text-sm">
          Maybe later
        </button>
      </div>
    </Modal>
  )
}