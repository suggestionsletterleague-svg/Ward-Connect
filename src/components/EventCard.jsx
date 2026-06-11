import { useState } from 'react'
import Modal from './Modal'
import SignupForm from './SignupForm'
import { CategoryChip } from './ui'
import { eventsApi } from '../services/api'
import { formatDate, formatTime } from '../lib/format'

const rsvpFields = [
  { name: 'name', label: 'Your Name', required: true },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'party_size', label: 'How many people are coming?', type: 'number', required: true, placeholder: '1' },
  { name: 'notes', label: 'Notes (optional)', type: 'textarea', placeholder: 'Any details we should know?' }
]

function rsvpInfo(event) {
  const attending = event.current_rsvps ?? 0
  const capacity = event.rsvp_capacity
  const remaining = capacity == null ? null : Math.max(0, capacity - attending)
  const full = capacity != null && remaining === 0
  return { attending, capacity, remaining, full }
}

export default function EventCard({ event, onRsvpSuccess }) {
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const { attending, capacity, remaining, full } = rsvpInfo(event)

  return (
    <article className="card rise-in">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg leading-tight">{event.title}</h2>
        <CategoryChip category={event.category} />
      </div>
      <p className="mt-0.5 text-sm text-ink/55">
        {formatDate(event.event_date, { weekday: 'long' })}
        {event.event_time && ` · ${formatTime(event.event_time)}`}
      </p>
      {event.location && (
        <p className="mt-1 flex items-center gap-1 text-sm text-sage-dark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {event.location}
        </p>
      )}
      {event.description && <p className="mt-2 text-sm text-ink/70">{event.description}</p>}

      {event.rsvp_enabled && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-sage-light/25 pt-3">
          <p className="text-sm font-semibold text-sage-dark">
            {capacity == null
              ? `${attending} attending`
              : `${attending} of ${capacity} attending · ${remaining} spot${remaining === 1 ? '' : 's'} left`}
          </p>
          <button
            type="button"
            className={full ? 'btn-secondary opacity-60' : 'btn-primary'}
            disabled={full}
            onClick={() => setRsvpOpen(true)}
          >
            {full ? 'Full' : "I'm Coming"}
          </button>
        </div>
      )}

      <Modal open={rsvpOpen} onClose={() => setRsvpOpen(false)} title={`RSVP — ${event.title}`}>
        <SignupForm
          submitLabel="RSVP"
          fields={rsvpFields}
          onSuccess={() => {
            setRsvpOpen(false)
            onRsvpSuccess?.()
          }}
          onSubmit={(values) =>
            eventsApi.rsvp({
              event_id: event.id,
              name: values.name,
              phone: values.phone || null,
              email: values.email || null,
              party_size: Math.max(1, Number(values.party_size) || 1),
              notes: values.notes || null
            })
          }
        />
      </Modal>
    </article>
  )
}