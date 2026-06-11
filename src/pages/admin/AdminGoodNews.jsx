import { useState } from 'react'
import AnnouncementImage from '../../components/AnnouncementImage'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { TextField, TextArea, SelectField } from '../../components/admin/Fields'
import Modal from '../../components/Modal'
import { useQuery } from '../../hooks/useQuery'
import { goodNewsApi } from '../../services/api'
import { ANNOUNCEMENT_CATEGORIES } from '../../lib/constants'
import { formatDateTime, todayISO } from '../../lib/format'

export default function AdminGoodNews() {
  const { data, loading, error, refetch } = useQuery(() => goodNewsApi.listAll(), [])
  const [filter, setFilter] = useState('pending')
  const [approving, setApproving] = useState(null)
  const [publishForm, setPublishForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = data?.filter((item) => (filter === 'all' ? true : item.status === filter))

  const openApprove = (item) => {
    setApproving(item)
    setPublishForm({
      title: item.title,
      body: item.body,
      category: 'Good News',
      publish_date: todayISO(),
      expiration_date: '',
      link_url: '',
      image_url: item.image_url || ''
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
    const { error: approveError } = await goodNewsApi.approve(approving.id, {
      title: publishForm.title,
      body: publishForm.body,
      category: publishForm.category,
      publish_date: publishForm.publish_date,
      expiration_date: publishForm.expiration_date || null,
      link_url: publishForm.link_url || null,
      image_url: publishForm.image_url || null
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
    if (!window.confirm('Decline this submission? It will not be posted.')) return
    const { error: rejectError } = await goodNewsApi.reject(item.id)
    if (rejectError) alert(rejectError.message)
    else refetch()
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Permanently delete this submission?')) return
    const { error: deleteError } = await goodNewsApi.remove(item.id, item.image_url)
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
        <h1 className="text-2xl">Good News Submissions</h1>
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
        Review member-submitted good news. Approved items are posted to Announcements.
      </p>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && filtered?.length === 0 && (
        <EmptyState
          icon="✨"
          title="No submissions"
          message={
            filter === 'pending'
              ? 'No good news waiting for review.'
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
              </div>
              <span className="shrink-0 text-xs text-ink/40">{formatDateTime(item.created_at)}</span>
            </div>

            {item.image_url && (
              <AnnouncementImage
                src={item.image_url}
                alt={item.title}
                className="mt-3 max-h-72"
              />
            )}

            <p className="mt-2 whitespace-pre-line rounded-xl bg-cream px-3 py-2 text-ink/80">
              {item.body}
            </p>

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
              Edit the announcement before posting. Submitted by {approving?.submitter_name}.
            </p>
            <TextField
              label="Title"
              required
              value={publishForm.title}
              onChange={(v) => setField('title', v)}
            />
            <TextArea
              label="Body"
              rows={5}
              value={publishForm.body}
              onChange={(v) => setField('body', v)}
            />
            {publishForm.image_url && (
              <div>
                <p className="label">Photo</p>
                <AnnouncementImage
                  src={publishForm.image_url}
                  alt={publishForm.title}
                  className="max-h-64"
                />
              </div>
            )}
            <SelectField
              label="Category"
              value={publishForm.category}
              onChange={(v) => setField('category', v)}
              options={ANNOUNCEMENT_CATEGORIES}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Publish Date"
                type="date"
                required
                value={publishForm.publish_date}
                onChange={(v) => setField('publish_date', v)}
              />
              <TextField
                label="Expiration Date"
                type="date"
                value={publishForm.expiration_date}
                onChange={(v) => setField('expiration_date', v)}
              />
            </div>
            <TextField
              label="Link (optional)"
              type="url"
              placeholder="https://…"
              value={publishForm.link_url}
              onChange={(v) => setField('link_url', v)}
            />
            <div className="flex gap-2 pt-2">
              <button onClick={handleApprove} className="btn-gold flex-1" disabled={saving}>
                {saving ? 'Posting…' : 'Post to Announcements'}
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