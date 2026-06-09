import { useState } from 'react'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { TextField, TextArea, NumberField } from '../../components/admin/Fields'
import Modal from '../../components/Modal'
import { useQuery } from '../../hooks/useQuery'
import { volunteerSubmissionsApi } from '../../services/api'
import { formatDate, formatTime, formatDateTime, todayISO } from '../../lib/format'

export default function AdminVolunteerSubmissions() {
  const { data, loading, error, refetch } = useQuery(() => volunteerSubmissionsApi.listAll(), [])
  const [filter, setFilter] = useState('pending')
  const [approving, setApproving] = useState(null)
  const [publishForm, setPublishForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = data?.filter((item) => (filter === 'all' ? true : item.status === filter))

  const openApprove = (item) => {
    setApproving(item)
    setPublishForm({
      title: item.title,
      description: item.description || '',
      event_date: item.event_date,
      event_time: item.event_time || '',
      number_needed: item.number_needed || 1
    })
  }

  const closeApprove = () => {
    setApproving(null)
    setPublishForm(null)
  }

  const setField = (key, value) => setPublishForm((prev) => ({ ...prev, [key]: value }))

  const handleApprove = async () => {
    if (!approving || !publishForm) return
    setSaving(true)
    const { error: approveError } = await volunteerSubmissionsApi.approve(approving.id, {
      title: publishForm.title,
      description: publishForm.description || null,
      event_date: publishForm.event_date,
      event_time: publishForm.event_time || null,
      number_needed: Number(publishForm.number_needed) || 1
    })
    setSaving(false)
    if (approveError) {
      alert(approveError.message)
      return
    }
    closeApprove()
    refetch()
  }

  const handleReject = async (item) => {
    if (!window.confirm('Decline this volunteer opportunity suggestion?')) return
    const { error: rejectError } = await volunteerSubmissionsApi.reject(item.id)
    if (rejectError) alert(rejectError.message)
    else refetch()
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Permanently delete this submission?')) return
    const { error: deleteError } = await volunteerSubmissionsApi.remove(item.id)
    if (deleteError) alert(deleteError.message)
    else refetch()
  }

  const statusChip = (status) => {
    if (status === 'pending') return 'bg-gold-mist text-gold-dark'
    if (status === 'approved') return 'bg-sage-mist text-sage-dark'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h1 className="text-2xl">Volunteer Suggestions</h1>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-soft">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${
                filter === f ? 'bg-navy text-white' : 'text-ink/55'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-ink/60">
        Review member-submitted volunteer needs. Approved items are posted as opportunities.
      </p>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && filtered?.length === 0 && (
        <EmptyState
          icon="🤝"
          title="No submissions"
          message={
            filter === 'pending'
              ? 'No volunteer suggestions waiting for review.'
              : 'No submissions in this category.'
          }
        />
      )}

      <div className="space-y-3">
        {filtered?.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip capitalize ${statusChip(item.status)}`}>{item.status}</span>
                </div>
                <h2 className="mt-2 text-lg leading-tight">{item.title}</h2>
                <p className="text-sm text-ink/60">
                  From {item.submitter_name}
                  {item.submitter_email ? ` · ${item.submitter_email}` : ''}
                  {item.submitter_phone ? ` · ${item.submitter_phone}` : ''}
                </p>
                <p className="mt-1 text-sm text-ink/55">
                  {formatDate(item.event_date, { weekday: 'short' })}
                  {item.event_time && ` · ${formatTime(item.event_time)}`}
                  {` · ${item.number_needed} needed`}
                </p>
              </div>
              <span className="shrink-0 text-xs text-ink/40">{formatDateTime(item.created_at)}</span>
            </div>

            {item.description && (
              <p className="mt-2 whitespace-pre-line rounded-xl bg-cream px-3 py-2 text-ink/80">
                {item.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {item.status === 'pending' && (
                <>
                  <button onClick={() => openApprove(item)} className="btn-gold flex-1 py-2 text-sm">
                    Approve & Post
                  </button>
                  <button onClick={() => handleReject(item)} className="btn-secondary flex-1 py-2 text-sm">
                    Decline
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(item)}
                className="btn-ghost px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={Boolean(approving)} onClose={closeApprove} title="Approve & Post">
        {publishForm && (
          <div className="space-y-4">
            <p className="text-sm text-ink/65">
              Edit the opportunity before posting. Suggested by {approving?.submitter_name}.
            </p>
            <TextField
              label="Title"
              required
              value={publishForm.title}
              onChange={(v) => setField('title', v)}
            />
            <TextArea
              label="Description"
              rows={4}
              value={publishForm.description}
              onChange={(v) => setField('description', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Date"
                type="date"
                required
                value={publishForm.event_date}
                onChange={(v) => setField('event_date', v)}
              />
              <TextField
                label="Time"
                type="time"
                value={publishForm.event_time}
                onChange={(v) => setField('event_time', v)}
              />
            </div>
            <NumberField
              label="Volunteers Needed"
              min={1}
              required
              value={publishForm.number_needed}
              onChange={(v) => setField('number_needed', v)}
            />
            <div className="flex gap-2 pt-2">
              <button onClick={handleApprove} className="btn-gold flex-1" disabled={saving}>
                {saving ? 'Posting…' : 'Post Opportunity'}
              </button>
              <button onClick={closeApprove} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}