import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import SignupForm from '../components/SignupForm'
import { LoadingState, EmptyState, ErrorState, PageHeading } from '../components/ui'
import { useQuery } from '../hooks/useQuery'
import { volunteerApi } from '../services/api'
import { formatDate, formatTime } from '../lib/format'

const fields = [
  { name: 'name', label: 'Your Name', required: true },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'notes', label: 'Notes (optional)', type: 'textarea' }
]

function spotsInfo(op) {
  const current = op.current_signups ?? 0
  const remaining = Math.max(0, (op.number_needed || 0) - current)
  return { current, remaining }
}

export default function Volunteer() {
  const { data, loading, error, refetch } = useQuery(() => volunteerApi.listOpen(), [])
  const [active, setActive] = useState(null)

  return (
    <Layout title="Volunteer" showBack>
      <PageHeading title="Volunteer Opportunities" subtitle="Sign up to serve — no account needed" />

      <Link
        to="/suggest-volunteer"
        className="card mb-4 flex items-center gap-3 transition hover:shadow-card-hover rise-in"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-mist text-xl" aria-hidden="true">
          📋
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-navy">Suggest a Volunteer Need</p>
          <p className="text-xs text-ink/55">Share a service opportunity for leader review</p>
        </div>
      </Link>

      {loading && <LoadingState label="Loading opportunities…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="🤝" title="No open opportunities" message="There are no volunteer needs right now. Thank you for your willingness to serve!" />
      )}

      <div className="space-y-3">
        {data?.map((op, i) => {
          const { current, remaining } = spotsInfo(op)
          const full = remaining === 0
          return (
            <article key={op.id} className="card rise-in" style={{ animationDelay: `${i * 40}ms` }}>
              <h2 className="text-lg leading-tight">{op.title}</h2>
              <p className="mt-0.5 text-sm text-ink/55">
                {formatDate(op.event_date, { weekday: 'long' })}
                {op.event_time && ` · ${formatTime(op.event_time)}`}
              </p>
              {op.description && <p className="mt-2 text-sm text-ink/70">{op.description}</p>}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-sage-dark">
                  {current} of {op.number_needed} filled · {remaining} spot{remaining === 1 ? '' : 's'} left
                </span>
                <button
                  className={full ? 'btn-secondary opacity-60' : 'btn-primary'}
                  disabled={full}
                  onClick={() => setActive(op)}
                >
                  {full ? 'Full' : 'Sign Up'}
                </button>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sage-mist">
                <div
                  className="h-full rounded-full bg-sage"
                  style={{ width: `${Math.min(100, (current / (op.number_needed || 1)) * 100)}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title || 'Sign Up'}>
        {active && (
          <SignupForm
            fields={fields}
            onSuccess={refetch}
            onSubmit={(values) =>
              volunteerApi.signup({
                opportunity_id: active.id,
                name: values.name,
                phone: values.phone || null,
                email: values.email || null,
                notes: values.notes || null
              })
            }
          />
        )}
      </Modal>
    </Layout>
  )
}
