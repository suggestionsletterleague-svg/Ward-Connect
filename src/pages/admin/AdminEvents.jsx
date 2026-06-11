import { useState } from 'react'
import Modal from '../../components/Modal'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { TextField, TextArea, SelectField, CheckboxField, NumberField } from '../../components/admin/Fields'
import { CategoryChip } from '../../components/ui'
import { useQuery } from '../../hooks/useQuery'
import { eventsApi } from '../../services/api'
import { EVENT_CATEGORIES } from '../../lib/constants'
import { formatDate, formatTime, todayISO } from '../../lib/format'
import { SignupViewer } from './AdminVolunteer'

const empty = {
  title: '',
  description: '',
  event_date: todayISO(),
  event_time: '',
  location: '',
  category: EVENT_CATEGORIES[0],
  rsvp_enabled: false,
  rsvp_capacity: ''
}

export default function AdminEvents() {
  const { data, loading, error, refetch } = useQuery(() => eventsApi.listAll(), [])
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [viewing, setViewing] = useState(null)

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }))
  const openNew = () => { setValues(empty); setEditing('new'); setFormError('') }
  const openEdit = (event) => {
    setValues({
      ...empty,
      ...event,
      rsvp_capacity: event.rsvp_capacity ?? ''
    })
    setEditing(event)
    setFormError('')
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        event_date: values.event_date,
        event_time: values.event_time || null,
        location: values.location || null,
        category: values.category,
        rsvp_enabled: Boolean(values.rsvp_enabled),
        rsvp_capacity: values.rsvp_enabled && values.rsvp_capacity
          ? Number(values.rsvp_capacity)
          : null
      }
      const { error: saveError } = editing === 'new'
        ? await eventsApi.create(payload)
        : await eventsApi.update(editing.id, payload)
      if (saveError) throw saveError
      setEditing(null)
      refetch()
    } catch (err) {
      setFormError(err?.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (event) => {
    if (!window.confirm('Delete this event and all RSVPs?')) return
    const { error: deleteError } = await eventsApi.remove(event.id)
    if (deleteError) alert(deleteError.message)
    else refetch()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">Calendar Events</h1>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">+ New Event</button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="📅" title="No events" message="Create a calendar event to get started." />
      )}

      <div className="space-y-3">
        {data?.map((event) => (
          <div key={event.id} className="card flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <CategoryChip category={event.category} />
                {event.rsvp_enabled && (
                  <span className="chip bg-sage-mist text-sage-dark">RSVP open</span>
                )}
              </div>
              <h2 className="text-lg leading-tight">{event.title}</h2>
              <p className="mt-0.5 text-sm text-ink/55">
                {formatDate(event.event_date, { weekday: 'short' })}
                {event.event_time && ` · ${formatTime(event.event_time)}`}
              </p>
              {event.location && <p className="mt-0.5 text-sm text-sage-dark">{event.location}</p>}
              {event.rsvp_enabled && (
                <button
                  type="button"
                  onClick={() => setViewing(event)}
                  className="mt-1 text-sm font-semibold text-navy-light hover:underline"
                >
                  {event.current_rsvps ?? 0}
                  {event.rsvp_capacity ? ` / ${event.rsvp_capacity}` : ''} attending — view RSVPs
                </button>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => openEdit(event)} className="rounded-lg p-2 text-navy hover:bg-sage-mist" aria-label="Edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button onClick={() => handleDelete(event)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New Event' : 'Edit Event'}>
        <form onSubmit={save} className="space-y-4">
          <TextField label="Title" required value={values.title} onChange={(v) => setField('title', v)} />
          <TextArea label="Description" value={values.description} onChange={(v) => setField('description', v)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date" type="date" required value={values.event_date} onChange={(v) => setField('event_date', v)} />
            <TextField label="Time" type="time" value={values.event_time} onChange={(v) => setField('event_time', v)} />
          </div>
          <TextField label="Location" value={values.location} onChange={(v) => setField('location', v)} />
          <SelectField label="Category" value={values.category} onChange={(v) => setField('category', v)} options={EVENT_CATEGORIES} />
          <CheckboxField
            label="Enable RSVPs"
            description="Let members RSVP and track a headcount for this event."
            checked={values.rsvp_enabled}
            onChange={(v) => setField('rsvp_enabled', v)}
          />
          {values.rsvp_enabled && (
            <NumberField
              label="Capacity (optional)"
              min={1}
              value={values.rsvp_capacity}
              onChange={(v) => setField('rsvp_capacity', v)}
            />
          )}
          {values.rsvp_enabled && (
            <p className="text-xs text-ink/55">Leave capacity blank for unlimited attendance.</p>
          )}
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <SignupViewer
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title}
        fetchSignups={() => eventsApi.rsvpsFor(viewing.id)}
        onRemove={(id) => eventsApi.removeRsvp(id)}
        viewingId={viewing?.id}
        renderExtra={(rsvp) => rsvp.party_size > 1 ? `${rsvp.party_size} people` : null}
      />
    </div>
  )
}