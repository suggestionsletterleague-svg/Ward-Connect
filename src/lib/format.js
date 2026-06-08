// Small date/time helpers used across the app.

export function formatDate(value, opts = {}) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    weekday: opts.weekday || 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatShortDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatTime(value) {
  if (!value) return ''
  // Accepts "HH:MM" time strings or ISO datetimes.
  if (/^\d{2}:\d{2}/.test(value)) {
    const [h, m] = value.split(':')
    const d = new Date()
    d.setHours(Number(h), Number(m), 0, 0)
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Is the given date today or in the future (date-only comparison)?
export function isUpcoming(dateValue) {
  if (!dateValue) return false
  const d = new Date(dateValue)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}
