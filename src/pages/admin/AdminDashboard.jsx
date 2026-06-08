import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useQuery } from '../../hooks/useQuery'
import { helpApi, announcementsApi, eventsApi } from '../../services/api'

const tiles = [
  { to: '/admin/programs', label: 'Sacrament Program', icon: '📖', desc: 'Draft & publish' },
  { to: '/admin/announcements', label: 'Announcements', icon: '📣', desc: 'Post ward news' },
  { to: '/admin/events', label: 'Calendar Events', icon: '📅', desc: 'Manage events' },
  { to: '/admin/volunteer', label: 'Volunteer', icon: '🤝', desc: 'Opportunities & signups' },
  { to: '/admin/meals', label: 'Missionary Meals', icon: '🍽️', desc: 'Dinner slots' },
  { to: '/admin/cleaning', label: 'Building Cleaning', icon: '🧹', desc: 'Assignments' },
  { to: '/admin/lessons', label: 'Lessons', icon: '✝️', desc: 'Weekly schedule' },
  { to: '/admin/help-requests', label: 'Help Requests', icon: '💛', desc: 'Private & confidential' }
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const help = useQuery(() => helpApi.listAll(), [])
  const announcements = useQuery(() => announcementsApi.listAll(), [])
  const events = useQuery(() => eventsApi.listUpcoming(), [])

  const openHelp = help.data?.filter((h) => !h.handled).length

  return (
    <div>
      <h1 className="text-3xl">Welcome, {profile?.full_name?.split(' ')[0] || 'Leader'}</h1>
      <p className="mt-1 text-ink/60">Manage your ward's content from here.</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-3xl font-display text-navy">{openHelp ?? '—'}</p>
          <p className="text-xs text-ink/55">Open help requests</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display text-navy">{announcements.data?.length ?? '—'}</p>
          <p className="text-xs text-ink/55">Announcements</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display text-navy">{events.data?.length ?? '—'}</p>
          <p className="text-xs text-ink/55">Upcoming events</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="card flex flex-col gap-1 transition hover:shadow-card-hover">
            <span className="text-2xl" aria-hidden="true">{t.icon}</span>
            <span className="font-semibold text-navy">{t.label}</span>
            <span className="text-xs text-ink/55">{t.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
