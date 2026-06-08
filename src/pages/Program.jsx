import Layout from '../components/Layout'
import { LoadingState, EmptyState, ErrorState } from '../components/ui'
import { useQuery } from '../hooks/useQuery'
import { programsApi } from '../services/api'
import { formatDate, formatDateTime } from '../lib/format'

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5 border-b border-sage-light/25 py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-44 shrink-0 text-sm font-semibold uppercase tracking-wide text-sage-dark">
        {label}
      </dt>
      <dd className="text-lg text-ink">{value}</dd>
    </div>
  )
}

export default function Program() {
  const { data, loading, error, refetch } = useQuery(() => programsApi.getLatestPublished(), [])

  const handleShare = async () => {
    const text = `Sacrament Meeting Program — ${formatDate(data.meeting_date)}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Sacrament Meeting Program', text, url: window.location.href })
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`)
      alert('Link copied to clipboard')
    }
  }

  return (
    <Layout title="Sacrament Meeting">
      {loading && <LoadingState label="Loading the program…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && !data && (
        <EmptyState
          icon="📖"
          title="No program published yet"
          message="The sacrament meeting program will appear here once a ward leader publishes it."
        />
      )}

      {data && (
        <article className="rise-in">
          <div className="no-print mb-4 flex gap-2">
            <button onClick={handleShare} className="btn-secondary flex-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              Share
            </button>
            <button onClick={() => window.print()} className="btn-secondary flex-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="7" rx="1" />
              </svg>
              Print
            </button>
          </div>

          <div className="card">
            <header className="mb-4 border-b border-sage-light/30 pb-4 text-center">
              <p className="text-sm uppercase tracking-wide text-gold-dark">Sacrament Meeting</p>
              <h1 className="mt-1 text-2xl">{formatDate(data.meeting_date)}</h1>
            </header>

            <dl>
              <Row label="Presiding" value={data.presiding} />
              <Row label="Conducting" value={data.conducting} />
              <Row label="Opening Hymn" value={data.opening_hymn} />
              <Row label="Opening Prayer" value={data.opening_prayer} />
              <Row label="Ward Business" value={data.ward_business} />
              <Row label="Sacrament Hymn" value={data.sacrament_hymn} />
              {Array.isArray(data.speakers) && data.speakers.length > 0 && (
                <div className="border-b border-sage-light/25 py-3">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-sage-dark">
                    Speakers
                  </p>
                  <ul className="space-y-1">
                    {data.speakers.map((s, i) => (
                      <li key={i} className="text-lg text-ink">
                        {typeof s === 'string' ? s : `${s.name}${s.topic ? ` — ${s.topic}` : ''}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Row label="Intermediate Hymn" value={data.intermediate_hymn} />
              <Row label="Closing Hymn" value={data.closing_hymn} />
              <Row label="Closing Prayer" value={data.closing_prayer} />
            </dl>

            {data.updated_at && (
              <p className="mt-4 text-center text-xs text-ink/40">
                Last updated {formatDateTime(data.updated_at)}
              </p>
            )}
          </div>
        </article>
      )}
    </Layout>
  )
}
