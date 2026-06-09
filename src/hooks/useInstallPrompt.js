import { useEffect, useState, useCallback } from 'react'

const DISMISS_KEY = 'ward-connect-install-dismissed'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function detectPlatform() {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

// Captures the browser install prompt and tracks first-visit install UI.
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  )
  const [showPrompt, setShowPrompt] = useState(false)
  const platform = detectPlatform()
  const isMobile = platform === 'ios' || platform === 'android'

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
      setShowPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    if (installed || dismissed || !isMobile) return

    // Brief delay so the home screen renders before the prompt appears.
    const timer = window.setTimeout(() => setShowPrompt(true), 600)
    return () => window.clearTimeout(timer)
  }, [installed, dismissed, isMobile])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
    return outcome === 'accepted'
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
    setShowPrompt(false)
  }, [])

  return {
    platform,
    isMobile,
    canInstall: Boolean(deferredPrompt) && !installed,
    installed,
    showPrompt,
    promptInstall,
    dismiss
  }
}