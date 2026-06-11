import { Link } from 'react-router-dom'
import { useQuery } from '../hooks/useQuery'
import { programsApi, lessonsApi, announcementsApi } from '../services/api'
import { formatDate, getUpcomingSundayISO } from '../lib/format'
import { CategoryChip } from './ui'

function SnapshotBlock({ icon, title, to, children }) {
  return (
    <div className="rounded-2xl bg-cream/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">{icon}</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-navy">{title}</h3>
        </div>
        <Link to={to} className="text-xs font-semibold text-sage-dark hover:underline">
          View all
        </Link>
      </div>
      {children}
    </div>
  )
}

function LessonLine({ label, value }) {
  if (!value) return null
  return (
    <p className="text-sm text-ink/75">
      <span className="font-semibold text-navy">{label}:</span> {value}
    </p>
  )
}

function programSummary(program) {
  const speakers = Array.isArray(program.speakers) ? program.speakers : []
  const speakerNames = speakers
    .map((s) => (typeof s === 'string' ? s : s?.name))
    .filter(Boolean)

  const parts = []
  if (program.conducting) parts.push(`Conducting: ${program.conducting}`)
  if (speakerNames.length === 1) parts.push(`Speaker: ${speakerNames[0]}`)
  if (speakerNames.length > 1) parts.push(`${speakerNames.length} speakers`)

  return parts.join(' · ') || 'Program details available'
}

export default function SundaySnapshot() {
  const upcomingSunday = getUpcomingSundayISO()
  const program = useQuery(
    () => programsApi.getPublishedForDate(upcomingSunday),
    [upcomingSunday]
  )
  const lessons = useQuery(() => lessonsApi.listUpcoming(), [])
  const announcements = useQuery(() => announcementsApi.listActive(), [])

  const loading = program.loading || lessons.loading || announcements.loading
  const nextLesson = lessons.data?.find((lesson) => lesson.lesson_date === upcomingSunday) || lessons.data?.[0]
  const latestNews = announcements.data?.slice(0, 2) ?? []

  if (loading) {
    return (
      <section className="card rise-in mt-5 animate-pulse space-y-4 p-5">
        <div className="h-5 w-32 rounded bg-sage-mist" />
        <div className="h-16 rounded-2xl bg-sage-mist/70" />
        <div className="h-16 rounded-2xl bg-sage-mist/70" />
        <div className="h-16 rounded-2xl bg-sage-mist/70" />
      </section>
    )
  }

  return (
    <section className="card rise-in mt-5 space-y-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg text-navy">This Sunday</h2>
        <span className="text-xs font-medium text-ink/50">
          {formatDate(upcomingSunday, { weekday: 'long' })}
        </span>
      </div>

      <SnapshotBlock icon="📖" title="Sacrament Program" to="/program">
        {program.data ? (
          <Link to="/program" className="block transition hover:opacity-80">
            <p className="text-sm font-semibold text-navy">Published for this Sunday</p>
            <p className="mt-1 text-sm text-ink/70">{programSummary(program.data)}</p>
          </Link>
        ) : (
          <p className="text-sm text-ink/55">Not published yet — check back soon.</p>
        )}
      </SnapshotBlock>

      <SnapshotBlock icon="✝️" title="Lessons" to="/lessons">
        {nextLesson ? (
          <Link to="/lessons" className="block space-y-1 transition hover:opacity-80">
            <p className="text-xs font-medium text-ink/50">
              {formatDate(nextLesson.lesson_date, { weekday: 'long' })}
            </p>
            <LessonLine label="Sunday School" value={nextLesson.sunday_school_topic} />
            <LessonLine label="Relief Society" value={nextLesson.relief_society_lesson} />
            <LessonLine label="Elders Quorum" value={nextLesson.elders_quorum_lesson} />
            {!nextLesson.sunday_school_topic &&
              !nextLesson.relief_society_lesson &&
              !nextLesson.elders_quorum_lesson && (
                <p className="text-sm text-ink/55">Lesson topics posted — tap to view.</p>
              )}
          </Link>
        ) : (
          <p className="text-sm text-ink/55">No lessons scheduled yet.</p>
        )}
      </SnapshotBlock>

      <SnapshotBlock icon="📣" title="Latest News" to="/announcements">
        {latestNews.length > 0 ? (
          <ul className="space-y-2">
            {latestNews.map((item) => (
              <li key={item.id}>
                <Link to="/announcements" className="block transition hover:opacity-80">
                  <div className="flex items-start gap-2">
                    <CategoryChip category={item.category} />
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-snug text-navy">{item.title}</p>
                  {item.body && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink/60">{item.body}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/55">No announcements right now.</p>
        )}
      </SnapshotBlock>
    </section>
  )
}