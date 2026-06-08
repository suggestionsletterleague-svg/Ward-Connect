import { useState } from 'react'
import Modal from '../../components/Modal'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { TextField, TextArea } from '../../components/admin/Fields'
import { useQuery } from '../../hooks/useQuery'
import { mealsApi } from '../../services/api'
import { formatDate, formatTime, formatDateTime, todayISO } from '../../lib/format'

const empty = {
  meal_date: todayISO(),
  meal_time: '',
  status: 'open',
  assigned_family: '',
  notes: ''
}

export default function AdminMeals() {
  const { data, loading, error, refetch } = useQuery(() => mealsApi.listAll(), [])
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [viewing, setViewing] = useState(null)

  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }))
  const openNew = () => { setValues(empty); setEditing('new'); setFormError('') }
  const openEdit = (m) => { setValues({ ...empty, ...m }); setEditing(m); setFormError('') }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setFormError('')
    try {
      const payload = {
        meal_date: values.meal_date,
        meal_time: values.meal_time || null,
        status: values.status || 'open',
        assigned_family: values.assigned_family || null,
        notes: values.notes || null
      }
      const { error } = editing === 'new'
        ? await mealsApi.createSlot(payload)
        : await mealsApi.updateSlot(editing.id, payload)
      if (error) throw error
      setEditing(null); refetch()
    } catch (err) {
      setFormError(err?.message || 'Could not save.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (m) => {
    if (!window.confirm('Delete this dinner slot and its signup?')) return
    const { error } = await mealsApi.removeSlot(m.id)
    if (error) alert(error.message); else refetch()
  }

  const removeSignup = async (id) => {
    if (!window.confirm('Remove this signup?')) return
    const { error } = await mealsApi.removeSignup(id)
    if (error) alert(error.message); else refetch()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">Missionary Meals</h1>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">+ New Dinner Slot</button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="🍽️" title="No dinner slots" message="Add open dinner dates for ward families to claim." />
      )}

      <div className="space-y-3">
        {data?.map((m) => {
          const signup = m.missionary_meal_signups?.[0]
          const taken = !!signup || m.status === 'filled'
          return (
            <div key={m.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg leading-tight">{formatDate(m.meal_date, { weekday: 'short' })}</h2>
                  <span className={`chip ${taken ? 'bg-sage-mist text-sage-dark' : 'bg-gold-mist text-gold-dark'}`}>
                    {taken ? 'Filled' : 'Open'}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-ink/55">{m.meal_time ? formatTime(m.meal_time) : 'Time flexible'}</p>
                {signup && (
                  <button onClick={() => setViewing(m)} className="mt-1 text-sm font-semibold text-navy-light hover:underline">
                    Hosted by {signup.name} — view details
                  </button>
                )}
                {!signup && m.assigned_family && (
                  <p className="mt-1 text-sm text-sage-dark">Assigned: {m.assigned_family}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(m)} className="rounded-lg p-2 text-navy hover:bg-sage-mist" aria-label="Edit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button onClick={() => handleDelete(m)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New Dinner Slot' : 'Edit Dinner Slot'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date" type="date" required value={values.meal_date} onChange={(v) => setField('meal_date', v)} />
            <TextField label="Time" type="time" value={values.meal_time} onChange={(v) => setField('meal_time', v)} />
          </div>
          <TextField label="Assigned Family (optional)" value={values.assigned_family} onChange={(v) => setField('assigned_family', v)} placeholder="If pre-assigned offline" />
          <TextArea label="Notes" value={values.notes} onChange={(v) => setField('notes', v)} placeholder="Dietary info, address, time preferences…" />
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Dinner — ${formatDate(viewing.meal_date, { weekday: 'long' })}` : ''}>
        {viewing?.missionary_meal_signups?.length ? (
          <ul className="space-y-2">
            {viewing.missionary_meal_signups.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 rounded-xl bg-cream px-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{s.name}</p>
                  <p className="text-sm text-ink/60">{[s.phone, s.email].filter(Boolean).join(' · ')}</p>
                  {s.address && <p className="text-sm text-ink/70">{s.address}</p>}
                  {s.notes && <p className="mt-0.5 text-sm text-ink/70">{s.notes}</p>}
                  <p className="mt-0.5 text-xs text-ink/40">{formatDateTime(s.created_at)}</p>
                </div>
                <button onClick={() => { removeSignup(s.id); setViewing(null) }} className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-ink/50">No signup yet.</p>
        )}
      </Modal>
    </div>
  )
}
