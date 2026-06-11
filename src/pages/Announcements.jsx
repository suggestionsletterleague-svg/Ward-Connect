import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import AnnouncementImage from '../components/AnnouncementImage'
import { LoadingState, EmptyState, ErrorState, CategoryChip, PageHeading } from '../components/ui'
import { useQuery } from '../hooks/useQuery'
import { announcementsApi } from '../services/api'
import { ANNOUNCEMENT_CATEGORIES } from '../lib/constants'
import { formatDate } from '../lib/format'

export default function Announcements() {
  const { data, loading, error, refetch } = useQuery(() => announcementsApi.listActive(), [])
  const [filter, setFilter] = useState('All')

  const filtered = data?.filter((a) => filter === 'All' || a.category === filter)

  return (
    <Layout title="Announcements">
      <PageHeading title="Announcements" subtitle="Stay up to date with ward news" />

      <Link
        to="/good-news"
        className="card mb-4 flex items-center gap-3 transition hover:shadow-card-hover rise-in"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-mist text-xl" aria-hidden="true">
          ✨
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-navy">Share Good News</p>
          <p className="text-xs text-ink/55">Submit uplifting news and photos for leader review</p>
        </div>
      </Link>

      {/* Category filter */}
      <div className="no-print mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {['All', ...ANNOUNCEMENT_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`chip whitespace-nowrap transition ${
              filter === cat ? 'bg-navy text-white' : 'bg-white text-ink/60 shadow-soft'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <LoadingState label="Loading announcements…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && filtered?.length === 0 && (
        <EmptyState icon="📣" title="Nothing here yet" message="There are no announcements in this category right now." />
      )}

      <div className="space-y-3">
        {filtered?.map((a, i) => (
          <article key={a.id} className="card rise-in" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <CategoryChip category={a.category} />
              <time className="text-xs text-ink/45">{formatDate(a.publish_date, { weekday: 'short' })}</time>
            </div>
            <h2 className="text-lg leading-snug">{a.title}</h2>
            {a.image_url && (
              <AnnouncementImage src={a.image_url} alt={a.title} className="mt-3 max-h-80" />
            )}
            {a.body && <p className="mt-1.5 whitespace-pre-line text-ink/75">{a.body}</p>}
            {a.link_url && (
              <a
                href={a.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sage-dark hover:underline"
              >
                Learn more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            )}
          </article>
        ))}
      </div>
    </Layout>
  )
}
