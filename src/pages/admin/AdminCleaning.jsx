import { useState } from 'react'
import Modal from '../../components/Modal'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { TextField, TextArea, NumberField } from '../../components/admin/Fields'
import { SignupViewer } from './AdminVolunteer'
import { useQuery } from '../../hooks/useQuery'
import { cleaningApi } from '../../services/api'
import { formatDate, formatTime, todayISO } from '../../lib/format'

const empty = {
  cleaning_date: todayISO(),
  cleaning_time: '',
  number_needed: 4,
  notes: ''
}

export default function AdminCleaning() {
  const { data, loading, error, refetch } = useQuery(() => cleaningApi.listAll(), [])
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [viewing, setViewing] = useState(null)

  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }))
  const openNew = () => { setValues(empty); setEditing('new'); setFormError('') }
  const openEdit = (s) => { setValues({ ...empty, ...s }); setEditing(s); setFormError('') }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setFormError('')
    try {
      const payload = {
        cleaning_date: values.cleaning_date,
        cleaning_time: values.cleaning_time || null,
        number_needed: Number(values.number_needed) || 1,
        notes: values.notes || null
      }
      const { error } = editing === 'new'
        ? await cleaningApi.createSlot(payload)
        : await cleaningApi.updateSlot(editing.id, payload)
      if (error) throw error
      setEditing(null); refetch()
    } catch (err) {
      setFormError(err?.message || 'Could not save.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (s) => {
    if (!window.confirm('Delete this cleaning slot and its signups?')) return
    const { error } = await cleaningApi.removeSlot(s.id)
    if (error) alert(error.message); else refetch()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">Building Cleaning</h1>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">+ New Cleaning Slot</button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="🧹" title="No cleaning slots" message="Schedule cleaning assignments for the ward." />
      )}

      <div className="space-y-3">
        {data?.map((s) => {
          const current = s.current_signups ?? 0
          return (
            <div key={s.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-tight">{formatDate(s.cleaning_date, { weekday: 'short' })}</h2>
                <p className="mt-0.5 text-sm text-ink/55">{s.cleaning_time ? formatTime(s.cleaning_time) : 'Time TBD'}</p>
                <button onClick={() => setViewing(s)} className="mt-1 text-sm font-semibold text-navy-light hover:underline">
                  {current} / {s.number_needed} signed up — view
                </button>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-navy hover:bg-sage-mist" aria-label="Edit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button onClick={() => handleDelete(s)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New Cleaning Slot' : 'Edit Cleaning Slot'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date" type="date" required value={values.cleaning_date} onChange={(v) => setField('cleaning_date', v)} />
            <TextField label="Time" type="time" value={values.cleaning_time} onChange={(v) => setField('cleaning_time', v)} />
          </div>
          <NumberField label="Number Needed" min={1} required value={values.number_needed} onChange={(v) => setField('number_needed', v)} />
          <TextArea label="Notes" value={values.notes} onChange={(v) => setField('notes', v)} />
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
        title={viewing ? formatDate(viewing.cleaning_date, { weekday: 'long' }) : ''}
        fetchSignups={() => cleaningApi.signupsFor(viewing.id)}
        onRemove={(id) => cleaningApi.removeSignup(id)}
        viewingId={viewing?.id}
      />
    </div>
  )
}
