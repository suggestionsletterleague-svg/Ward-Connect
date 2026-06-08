import { NavLink } from 'react-router-dom'

// Inline SVG icons keep the bundle small and avoid an icon dependency.
const icons = {
  home: (
    <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  ),
  program: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  signups: (
    <>
      <path d="M16 11a4 4 0 1 0-8 0" />
      <circle cx="12" cy="7" r="3" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  announcements: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1Z" />
      <path d="M16 9a3 3 0 0 1 0 6" />
    </>
  )
}

const tabs = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/program', label: 'Program', icon: 'program' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/signups', label: 'Sign Ups', icon: 'signups' },
  { to: '/announcements', label: 'News', icon: 'announcements' }
]

export default function BottomNav() {
  return (
    <nav
      className="no-print fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-sage-light/30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition ${
                  isActive ? 'text-navy' : 'text-ink/45'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {icons[tab.icon]}
                  </svg>
                  <span>{tab.label}</span>
                  <span
                    className={`h-0.5 w-6 rounded-full transition ${
                      isActive ? 'bg-gold' : 'bg-transparent'
                    }`}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
