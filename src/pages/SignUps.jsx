import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { PageHeading } from '../components/ui'

const cards = [
  {
    to: '/volunteer',
    title: 'Volunteer Opportunities',
    desc: 'Lend a hand with service projects and ward needs.',
    icon: '🤝',
    tone: 'bg-sage-mist'
  },
  {
    to: '/missionaries',
    title: 'Feed the Missionaries',
    desc: 'Sign up to host the full-time missionaries for dinner.',
    icon: '🍽️',
    tone: 'bg-gold-mist'
  },
  {
    to: '/cleaning',
    title: 'Building Cleaning',
    desc: 'Help keep our meetinghouse clean and welcoming.',
    icon: '🧹',
    tone: 'bg-navy/5'
  },
  {
    to: '/help',
    title: 'Request Help',
    desc: 'Need assistance? Submit a private, confidential request.',
    icon: '💛',
    tone: 'bg-gold-mist'
  }
]

export default function SignUps() {
  return (
    <Layout title="Sign Ups">
      <PageHeading title="Sign Ups & Service" subtitle="No account needed — just fill in your details" />

      <div className="space-y-3">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className="card rise-in flex items-center gap-4 transition hover:shadow-card-hover active:scale-[0.99]"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${c.tone}`} aria-hidden="true">
              {c.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold text-navy">{c.title}</span>
              <span className="mt-0.5 block text-sm text-ink/60">{c.desc}</span>
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sage">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
