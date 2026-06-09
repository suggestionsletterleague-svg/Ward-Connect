import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const sections = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/programs', label: 'Programs' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/volunteer', label: 'Volunteer' },
  { to: '/admin/meals', label: 'Missionary Meals' },
  { to: '/admin/cleaning', label: 'Cleaning' },
  { to: '/admin/lessons', label: 'Lessons' },
  { to: '/admin/help-requests', label: 'Help Requests' },
  { to: '/admin/good-news', label: 'Good News' }
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-navy text-white shadow-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-semibold">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/70 sm:inline">
              {profile?.full_name || profile?.email}
            </span>
            <Link to="/" className="text-sm text-white/70 hover:text-white">View App</Link>
            <button onClick={handleSignOut} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">
              Sign Out
            </button>
          </div>
        </div>
        <nav className="border-t border-white/10">
          <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-2 py-2">
            {sections.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                end={s.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    isActive ? 'bg-white text-navy' : 'text-white/75 hover:bg-white/10'
                  }`
                }
              >
                {s.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
