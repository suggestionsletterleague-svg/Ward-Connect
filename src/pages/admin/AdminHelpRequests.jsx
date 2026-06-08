import { useState } from 'react'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui'
import { useQuery } from '../../hooks/useQuery'
import { helpApi } from '../../services/api'
import { formatDateTime } from '../../lib/format'

export default function AdminHelpRequests() {
  const { data, loading, error, refetch } = useQuery(() => helpApi.listAll(), [])
  const [filter, setFilter] = useState('open') // open | all

  const filtered = data?.filter((h) => (filter === 'open' ? !h.handled : true))

  const toggleHandled = async (h) => {
    const { error } = await helpApi.markHandled(h.id, !h.handled)
    if (error) alert(error.message); else refetch()
  }
  const remove = async (h) => {
    if (!window.confirm('Permanently delete this request?')) return
    const { error } = await helpApi.remove(h.id)
    if (error) alert(error.message); else refetch()
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl">Help Requests</h1>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-soft">
          {['open', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${filter === f ? 'bg-navy text-white' : 'text-ink/55'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-sage-light/40 bg-sage-mist px-4 py-3 text-sm text-sage-dark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        These requests are confidential and visible only to authorized administrators. Handle them with care.
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && filtered?.length === 0 && (
        <EmptyState icon="💛" title="No requests" message={filter === 'open' ? 'There are no open help requests.' : 'No help requests yet.'} />
      )}

      <div className="space-y-3">
        {filtered?.map((h) => (
          <div key={h.id} className={`card ${h.handled ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-gold-mist text-gold-dark">{h.request_type}</span>
                  {h.handled && <span className="chip bg-sage-mist text-sage-dark">Handled</span>}
                  {h.permission_to_contact && <span className="chip bg-navy/10 text-navy">OK to contact</span>}
                </div>
                <h2 className="mt-2 text-lg leading-tight">{h.name}</h2>
                <p className="text-sm text-ink/60">{[h.phone, h.email].filter(Boolean).join(' · ') || 'No contact info provided'}</p>
              </div>
              <span className="shrink-0 text-xs text-ink/40">{formatDateTime(h.created_at)}</span>
            </div>
            {h.message && <p className="mt-2 whitespace-pre-line rounded-xl bg-cream px-3 py-2 text-ink/80">{h.message}</p>}
            <div className="mt-3 flex gap-2">
              <button onClick={() => toggleHandled(h)} className="btn-secondary flex-1 py-2 text-sm">
                {h.handled ? 'Mark as open' : 'Mark as handled'}
              </button>
              <button onClick={() => remove(h)} className="btn-ghost px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
