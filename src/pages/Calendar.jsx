import Layout from '../components/Layout'
import { LoadingState, EmptyState, ErrorState, CategoryChip, PageHeading } from '../components/ui'
import { useQuery } from '../hooks/useQuery'
import { eventsApi } from '../services/api'
import { formatDate, formatTime } from '../lib/format'

export default function Calendar() {
  const { data, loading, error, refetch } = useQuery(() => eventsApi.listUpcoming(), [])

  return (
    <Layout title="Calendar">
      <PageHeading title="Upcoming Events" subtitle="What's happening in the ward" />

      {loading && <LoadingState label="Loading events…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="📅" title="No upcoming events" message="Check back soon for new activities." />
      )}

      <div className="space-y-3">
        {data?.map((ev, i) => (
          <article
            key={ev.id}
            className="card rise-in flex gap-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-navy/5 py-2 text-navy">
              <span className="text-xs font-semibold uppercase">
                {new Date(ev.event_date).toLocaleDateString(undefined, { month: 'short' })}
              </span>
              <span className="text-2xl font-display leading-none">
                {new Date(ev.event_date).getDate()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg leading-tight">{ev.title}</h2>
                <CategoryChip category={ev.category} />
              </div>
              <p className="mt-0.5 text-sm text-ink/55">
                {formatDate(ev.event_date, { weekday: 'long' })}
                {ev.event_time && ` · ${formatTime(ev.event_time)}`}
              </p>
              {ev.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-sage-dark">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {ev.location}
                </p>
              )}
              {ev.description && <p className="mt-2 text-sm text-ink/70">{ev.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </Layout>
  )
}
