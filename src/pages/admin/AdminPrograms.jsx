import { useState } from 'react'
import Modal from '../../components/Modal'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { TextField, TextArea } from '../../components/admin/Fields'
import { useQuery } from '../../hooks/useQuery'
import { programsApi } from '../../services/api'
import { formatDate, todayISO } from '../../lib/format'

const empty = {
  meeting_date: todayISO(),
  presiding: '',
  conducting: '',
  opening_hymn: '',
  opening_prayer: '',
  ward_business: '',
  sacrament_hymn: '',
  speakers: [],
  intermediate_hymn: '',
  closing_hymn: '',
  closing_prayer: '',
  status: 'draft'
}

function statusChip(status) {
  return status === 'published'
    ? 'bg-sage-mist text-sage-dark'
    : 'bg-gold-mist text-gold-dark'
}

export default function AdminPrograms() {
  const { data, loading, error, refetch } = useQuery(() => programsApi.listAll(), [])
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(empty)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }))

  const openNew = () => { setValues(empty); setEditing('new'); setFormError('') }
  const openEdit = (p) => {
    setValues({ ...empty, ...p, speakers: Array.isArray(p.speakers) ? p.speakers : [] })
    setEditing(p)
    setFormError('')
  }

  // Speakers helpers
  const addSpeaker = () => setField('speakers', [...(values.speakers || []), { name: '', topic: '' }])
  const updateSpeaker = (i, key, val) =>
    setField('speakers', values.speakers.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)))
  const removeSpeaker = (i) => setField('speakers', values.speakers.filter((_, idx) => idx !== i))

  const save = async (status) => {
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        ...values,
        status,
        speakers: (values.speakers || []).filter((s) => s.name?.trim())
      }
      delete payload.id
      delete payload.created_at
      const { error } =
        editing === 'new' ? await programsApi.create(payload) : await programsApi.update(editing.id, payload)
      if (error) throw error
      setEditing(null)
      refetch()
    } catch (err) {
      setFormError(err?.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!window.confirm('Delete this program?')) return
    const { error } = await programsApi.remove(p.id)
    if (error) alert(error.message)
    else refetch()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">Sacrament Programs</h1>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">+ New Program</button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="📖" title="No programs yet" message="Create your first sacrament meeting program." />
      )}

      <div className="space-y-3">
        {data?.map((p) => (
          <div key={p.id} className="card flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg">{formatDate(p.meeting_date)}</h2>
                <span className={`chip ${statusChip(p.status)}`}>{p.status}</span>
              </div>
              <p className="mt-0.5 text-sm text-ink/55">
                Conducting: {p.conducting || '—'} · {p.speakers?.length || 0} speaker(s)
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => setPreview(p)} className="rounded-lg p-2 text-navy hover:bg-sage-mist" aria-label="Preview">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-navy hover:bg-sage-mist" aria-label="Edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button onClick={() => handleDelete(p)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New Program' : 'Edit Program'} maxWidth="max-w-lg">
        <form onSubmit={(e) => { e.preventDefault(); save(values.status) }} className="space-y-4">
          <TextField label="Meeting Date" type="date" required value={values.meeting_date} onChange={(v) => setField('meeting_date', v)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Presiding" value={values.presiding} onChange={(v) => setField('presiding', v)} />
            <TextField label="Conducting" value={values.conducting} onChange={(v) => setField('conducting', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Opening Hymn" value={values.opening_hymn} onChange={(v) => setField('opening_hymn', v)} />
            <TextField label="Opening Prayer" value={values.opening_prayer} onChange={(v) => setField('opening_prayer', v)} />
          </div>
          <TextArea label="Ward Business" rows={2} value={values.ward_business} onChange={(v) => setField('ward_business', v)} />
          <TextField label="Sacrament Hymn" value={values.sacrament_hymn} onChange={(v) => setField('sacrament_hymn', v)} />

          {/* Speakers */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label mb-0">Speakers</span>
              <button type="button" onClick={addSpeaker} className="text-sm font-semibold text-navy-light">+ Add speaker</button>
            </div>
            <div className="space-y-2">
              {(values.speakers || []).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input flex-1" placeholder="Name" value={s.name} onChange={(e) => updateSpeaker(i, 'name', e.target.value)} />
                  <input className="input flex-1" placeholder="Topic (optional)" value={s.topic || ''} onChange={(e) => updateSpeaker(i, 'topic', e.target.value)} />
                  <button type="button" onClick={() => removeSpeaker(i)} className="rounded-lg px-2 text-red-600 hover:bg-red-50" aria-label="Remove speaker">✕</button>
                </div>
              ))}
              {(!values.speakers || values.speakers.length === 0) && (
                <p className="text-sm text-ink/40">No speakers added yet.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField label="Intermediate Hymn (optional)" value={values.intermediate_hymn} onChange={(v) => setField('intermediate_hymn', v)} />
            <TextField label="Closing Hymn" value={values.closing_hymn} onChange={(v) => setField('closing_hymn', v)} />
          </div>
          <TextField label="Closing Prayer" value={values.closing_prayer} onChange={(v) => setField('closing_prayer', v)} />

          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => setPreview(values)} className="btn-secondary flex-1">Preview</button>
            <button type="button" onClick={() => save('draft')} className="btn-gold flex-1" disabled={saving}>Save Draft</button>
            <button type="button" onClick={() => save('published')} className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Program Preview" maxWidth="max-w-lg">
        {preview && <ProgramPreview p={preview} />}
      </Modal>
    </div>
  )
}

function PreviewRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-4 border-b border-sage-light/25 py-2 last:border-0">
      <span className="w-40 shrink-0 text-sm font-semibold uppercase text-sage-dark">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function ProgramPreview({ p }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <header className="mb-3 text-center">
        <p className="text-sm uppercase tracking-wide text-gold-dark">Sacrament Meeting</p>
        <h3 className="text-xl">{formatDate(p.meeting_date)}</h3>
      </header>
      <PreviewRow label="Presiding" value={p.presiding} />
      <PreviewRow label="Conducting" value={p.conducting} />
      <PreviewRow label="Opening Hymn" value={p.opening_hymn} />
      <PreviewRow label="Opening Prayer" value={p.opening_prayer} />
      <PreviewRow label="Ward Business" value={p.ward_business} />
      <PreviewRow label="Sacrament Hymn" value={p.sacrament_hymn} />
      {p.speakers?.length > 0 && (
        <div className="border-b border-sage-light/25 py-2">
          <p className="text-sm font-semibold uppercase text-sage-dark">Speakers</p>
          <ul className="mt-1">
            {p.speakers.map((s, i) => (
              <li key={i}>{s.name}{s.topic ? ` — ${s.topic}` : ''}</li>
            ))}
          </ul>
        </div>
      )}
      <PreviewRow label="Intermediate Hymn" value={p.intermediate_hymn} />
      <PreviewRow label="Closing Hymn" value={p.closing_hymn} />
      <PreviewRow label="Closing Prayer" value={p.closing_prayer} />
    </div>
  )
}
