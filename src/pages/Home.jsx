import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SundaySnapshot from '../components/SundaySnapshot'
import { WARD_NAME, WARD_TAGLINE } from '../lib/constants'
import { formatDate } from '../lib/format'

const actions = [
  { to: '/program', title: "Today's Program", desc: 'Sacrament meeting', icon: '📖', tone: 'navy' },
  { to: '/announcements', title: 'Announcements', desc: 'Ward news', icon: '📣', tone: 'gold' },
  { to: '/good-news', title: 'Share Good News', desc: 'Submit for review', icon: '✨', tone: 'gold' },
  { to: '/calendar', title: 'Calendar', desc: 'Upcoming events', icon: '📅', tone: 'sage' },
  { to: '/volunteer', title: 'Volunteer', desc: 'Service needs', icon: '🤝', tone: 'sage' },
  { to: '/missionaries', title: 'Feed Missionaries', desc: 'Dinner signups', icon: '🍽️', tone: 'gold' },
  { to: '/cleaning', title: 'Building Cleaning', desc: 'Assignments', icon: '🧹', tone: 'navy' },
  { to: '/lessons', title: 'Lesson Schedule', desc: "This Sunday's lessons", icon: '✝️', tone: 'sage' },
  { to: '/help', title: 'Help Request', desc: 'Private & confidential', icon: '💛', tone: 'gold' }
]

const toneClasses = {
  navy: 'bg-navy/5 text-navy',
  sage: 'bg-sage-mist text-sage-dark',
  gold: 'bg-gold-mist text-gold-dark'
}

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="rise-in rounded-3xl bg-gradient-to-br from-navy to-navy-light px-6 py-7 text-white shadow-card">
        <p className="text-sm font-medium uppercase tracking-wide text-gold-light">
          {formatDate(new Date())}
        </p>
        <h1 className="mt-1 text-3xl text-white">{WARD_NAME}</h1>
        <p className="mt-2 text-white/80">{WARD_TAGLINE}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Welcome! Whether you're a longtime member or visiting for the first time, we're glad
          you're here.
        </p>
      </section>

      <SundaySnapshot />

      {/* Quick actions */}
      <h2 className="mb-3 mt-6 text-lg text-navy">Quick actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a, i) => (
          <Link
            key={a.to}
            to={a.to}
            className="card rise-in flex flex-col gap-2 transition hover:shadow-card-hover active:scale-[0.98]"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${toneClasses[a.tone]}`}
              aria-hidden="true"
            >
              {a.icon}
            </span>
            <span className="font-semibold leading-tight text-navy">{a.title}</span>
            <span className="text-xs text-ink/55">{a.desc}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/admin/login" className="text-sm text-ink/40 underline-offset-4 hover:underline">
          Ward leader sign in
        </Link>
      </div>
    </Layout>
  )
}
