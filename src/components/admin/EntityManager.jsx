import { useState } from 'react'
import Modal from '../Modal'
import { LoadingState, EmptyState, ErrorState } from '../ui'
import { useQuery } from '../../hooks/useQuery'

/**
 * Config-driven admin manager.
 *
 * props:
 * - title, addLabel
 * - api: { listAll(), create(payload), update(id, payload), remove(id) }
 * - emptyFields: object of default field values for a new record
 * - renderItem: (item) => JSX summary in the list
 * - renderForm: ({ values, setField }) => JSX form fields
 * - toPayload: (values) => object to send to the API (optional cleanup)
 */
export default function EntityManager({
  title,
  addLabel = 'Add New',
  api,
  emptyFields,
  renderItem,
  renderForm,
  toPayload = (v) => v,
  emptyIcon = '📋',
  emptyMessage = 'Nothing here yet. Tap “Add New” to create the first one.'
}) {
  const { data, loading, error, refetch } = useQuery(() => api.listAll(), [])
  const [editing, setEditing] = useState(null) // record being edited, or 'new'
  const [values, setValues] = useState(emptyFields)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const openNew = () => {
    setValues(emptyFields)
    setEditing('new')
    setFormError('')
  }
  const openEdit = (item) => {
    setValues({ ...emptyFields, ...item })
    setEditing(item)
    setFormError('')
  }
  const close = () => setEditing(null)
  const setField = (key, val) => setValues((p) => ({ ...p, [key]: val }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = toPayload(values)
      const { error } =
        editing === 'new' ? await api.create(payload) : await api.update(editing.id, payload)
      if (error) throw error
      close()
      refetch()
    } catch (err) {
      setFormError(err?.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    const { error } = await api.remove(item.id)
    if (error) alert(error.message)
    else refetch()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">{title}</h1>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">
          + {addLabel}
        </button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon={emptyIcon} title="No records" message={emptyMessage} />
      )}

      <div className="space-y-3">
        {data?.map((item) => (
          <div key={item.id} className="card flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">{renderItem(item)}</div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => openEdit(item)}
                aria-label="Edit"
                className="rounded-lg p-2 text-navy hover:bg-sage-mist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(item)}
                aria-label="Delete"
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={close} title={editing === 'new' ? addLabel : 'Edit'}>
        <form onSubmit={handleSave} className="space-y-4">
          {renderForm({ values, setField })}
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
