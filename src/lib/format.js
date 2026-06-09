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

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Parse YYYY-MM-DD as a local date (avoids UTC timezone shifts).
export function parseISODate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function getMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  })
}

// Sunday-start month grid cells for a calendar view.
export function getMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)
  const today = todayISO()

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const iso = toISODate(date)
    return {
      iso,
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: iso === today
    }
  })
}

// Is the given date today or in the future (date-only comparison)?
export function isUpcoming(dateValue) {
  if (!dateValue) return false
  const d = new Date(dateValue)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}
