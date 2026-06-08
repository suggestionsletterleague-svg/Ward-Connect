import Layout from '../components/Layout'
import { LoadingState, EmptyState, ErrorState, PageHeading } from '../components/ui'
import { useQuery } from '../hooks/useQuery'
import { lessonsApi } from '../services/api'
import { formatDate } from '../lib/format'

function LessonRow({ label, value, link, icon }) {
  if (!value && !link) return null
  return (
    <div className="flex gap-3 border-b border-sage-light/25 py-3 last:border-0">
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-sage-dark">{label}</p>
        {value && <p className="text-ink">{value}</p>}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-navy-light hover:underline">
            Open resource ↗
          </a>
        )}
      </div>
    </div>
  )
}

export default function Lessons() {
  const { data, loading, error, refetch } = useQuery(() => lessonsApi.listUpcoming(), [])

  return (
    <Layout title="Lesson Schedule" showBack>
      <PageHeading title="Lesson Schedule" subtitle="What's being taught on Sunday" />

      {loading && <LoadingState label="Loading lessons…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="✝️" title="No lessons scheduled" message="Upcoming lesson topics will appear here." />
      )}

      <div className="space-y-4">
        {data?.map((lesson, i) => (
          <article key={lesson.id} className="card rise-in" style={{ animationDelay: `${i * 50}ms` }}>
            <h2 className="mb-2 text-lg">{formatDate(lesson.lesson_date, { weekday: 'long' })}</h2>
            <LessonRow icon="📘" label="Sunday School" value={lesson.sunday_school_topic} />
            <LessonRow icon="💗" label="Relief Society" value={lesson.relief_society_lesson} />
            <LessonRow icon="🤝" label="Elders Quorum" value={lesson.elders_quorum_lesson} />
            <LessonRow icon="🧑‍🤝‍🧑" label="Youth" value={lesson.youth_lesson} />
            <LessonRow icon="🧒" label="Primary" value={lesson.primary_notes} />
            {lesson.link_url && <LessonRow icon="🔗" label="Resource" link={lesson.link_url} />}
          </article>
        ))}
      </div>
    </Layout>
  )
}
