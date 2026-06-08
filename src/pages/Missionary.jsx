import { useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import SignupForm from '../components/SignupForm'
import { LoadingState, EmptyState, ErrorState, PageHeading } from '../components/ui'
import { useQuery } from '../hooks/useQuery'
import { mealsApi } from '../services/api'
import { formatDate, formatTime } from '../lib/format'

const fields = [
  { name: 'name', label: 'Your Name / Family', required: true },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address', placeholder: 'Where will dinner be?' },
  { name: 'notes', label: 'Notes (optional)', type: 'textarea', placeholder: 'Time preferences, allergies to note, etc.' }
]

export default function Missionary() {
  const { data, loading, error, refetch } = useQuery(() => mealsApi.listOpen(), [])
  const [active, setActive] = useState(null)

  return (
    <Layout title="Feed the Missionaries" showBack>
      <PageHeading title="Feed the Missionaries" subtitle="Sign up to host dinner — thank you!" />

      {loading && <LoadingState label="Loading dinner dates…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState icon="🍽️" title="No open dates" message="All dinner dates are currently filled. Check back soon!" />
      )}

      <div className="space-y-3">
        {data?.map((meal, i) => {
          const taken = meal.status === 'filled'
          const family = meal.assigned_family
          return (
            <article key={meal.id} className="card rise-in flex items-center gap-4" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gold-mist py-2 text-gold-dark">
                <span className="text-xs font-semibold uppercase">
                  {new Date(meal.meal_date).toLocaleDateString(undefined, { month: 'short' })}
                </span>
                <span className="text-2xl font-display leading-none">{new Date(meal.meal_date).getDate()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{formatDate(meal.meal_date, { weekday: 'long' })}</p>
                <p className="text-sm text-ink/55">{meal.meal_time ? formatTime(meal.meal_time) : 'Time flexible'}</p>
                {taken ? (
                  <p className="mt-1 text-sm text-sage-dark">Hosted by {family || 'a ward family'} 💛</p>
                ) : (
                  meal.notes && <p className="mt-1 text-sm text-ink/60">{meal.notes}</p>
                )}
              </div>
              <button
                className={taken ? 'btn-secondary opacity-60' : 'btn-gold'}
                disabled={taken}
                onClick={() => setActive(meal)}
              >
                {taken ? 'Filled' : 'Sign Up'}
              </button>
            </article>
          )
        })}
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `Dinner on ${formatDate(active.meal_date, { weekday: 'long' })}` : ''}
      >
        {active && (
          <SignupForm
            submitLabel="Sign Up to Host"
            fields={fields}
            onSuccess={refetch}
            onSubmit={(values) =>
              mealsApi.signup({
                meal_id: active.id,
                name: values.name,
                phone: values.phone || null,
                email: values.email || null,
                address: values.address || null,
                notes: values.notes || null
              })
            }
          />
        )}
      </Modal>
    </Layout>
  )
}
