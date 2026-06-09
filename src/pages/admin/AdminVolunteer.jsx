import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/Modal'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { TextField, TextArea, NumberField } from '../../components/admin/Fields'
import { useQuery } from '../../hooks/useQuery'
import { volunteerApi } from '../../services/api'
import { formatDate, formatTime, formatDateTime, todayISO } from '../../lib/format'

const empty = {
  title: '',
  description: '',
  event_date: todayISO(),
  event_time: '',
  number_needed: 1
}

export default function AdminVolunteer() {
  const { data, loading, error, refetch } = useQuery(() => volunteerApi.listAll(), [])
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [viewing, setViewing] = useState(null) // opportunity whose signups we're viewing

  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }))
  const openNew = () => { setValues(empty); setEditing('new'); setFormError('') }
  const openEdit = (op) => { setValues({ ...empty, ...op }); setEditing(op); setFormError('') }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setFormError('')
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        event_date: values.event_date,
        event_time: values.event_time || null,
        number_needed: Number(values.number_needed) || 1
      }
      const { error } = editing === 'new'
        ? await volunteerApi.createOpportunity(payload)
        : await volunteerApi.updateOpportunity(editing.id, payload)
      if (error) throw error
      setEditing(null); refetch()
    } catch (err) {
      setFormError(err?.message || 'Could not save.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (op) => {
    if (!window.confirm('Delete this opportunity and all its signups?')) return
    const { error } = await volunteerApi.removeOpportunity(op.id)
    if (error) alert(error.message); else refetch()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Volunteer Opportunities</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/volunteer-submissions" className="btn-secondary px-4 py-2 text-sm">
            Review Suggestions
          </Link>
          <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">+ New Opportunity</button>
        </div>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="🤝" title="No opportunities" message="Create a volunteer opportunity to get started." />
      )}

      <div className="space-y-3">
        {data?.map((op) => {
          const current = op.current_signups ?? 0
          return (
            <div key={op.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-tight">{op.title}</h2>
                <p className="mt-0.5 text-sm text-ink/55">
                  {formatDate(op.event_date, { weekday: 'short' })}
                  {op.event_time && ` · ${formatTime(op.event_time)}`}
                </p>
                <button onClick={() => setViewing(op)} className="mt-1 text-sm font-semibold text-navy-light hover:underline">
                  {current} / {op.number_needed} signed up — view
                </button>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(op)} className="rounded-lg p-2 text-navy hover:bg-sage-mist" aria-label="Edit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button onClick={() => handleDelete(op)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New Opportunity' : 'Edit Opportunity'}>
        <form onSubmit={save} className="space-y-4">
          <TextField label="Title" required value={values.title} onChange={(v) => setField('title', v)} />
          <TextArea label="Description" value={values.description} onChange={(v) => setField('description', v)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date" type="date" required value={values.event_date} onChange={(v) => setField('event_date', v)} />
            <TextField label="Time" type="time" value={values.event_time} onChange={(v) => setField('event_time', v)} />
          </div>
          <NumberField label="Number Needed" min={1} required value={values.number_needed} onChange={(v) => setField('number_needed', v)} />
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
        fetchSignups={() => volunteerApi.signupsFor(viewing.id)}
        onRemove={(id) => volunteerApi.removeSignup(id)}
        viewingId={viewing?.id}
      />
    </div>
  )
}

// Shared component to view/remove signups for a slot or opportunity.
export function SignupViewer({ open, onClose, title, fetchSignups, onRemove, viewingId }) {
  const { data, loading, error, refetch } = useQuery(
    () => (viewingId ? fetchSignups() : Promise.resolve({ data: [] })),
    [viewingId]
  )

  const remove = async (id) => {
    if (!window.confirm('Remove this signup?')) return
    const { error } = await onRemove(id)
    if (error) alert(error.message); else refetch()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Signups — ${title || ''}`}>
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && data?.length === 0 && <p className="py-6 text-center text-ink/50">No signups yet.</p>}
      <ul className="space-y-2">
        {data?.map((s) => (
          <li key={s.id} className="flex items-start justify-between gap-3 rounded-xl bg-cream px-3 py-2.5">
            <div className="min-w-0">
              <p className="font-semibold text-navy">{s.name}</p>
              <p className="text-sm text-ink/60">
                {[s.phone, s.email, s.address].filter(Boolean).join(' · ')}
              </p>
              {s.notes && <p className="mt-0.5 text-sm text-ink/70">{s.notes}</p>}
              <p className="mt-0.5 text-xs text-ink/40">{formatDateTime(s.created_at)}</p>
            </div>
            <button onClick={() => remove(s.id)} className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
