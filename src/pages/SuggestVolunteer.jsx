import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { PageHeading } from '../components/ui'
import { volunteerSubmissionsApi } from '../services/api'
import { todayISO } from '../lib/format'

export default function SuggestVolunteer() {
  const [values, setValues] = useState({
    submitter_name: '',
    submitter_email: '',
    submitter_phone: '',
    title: '',
    description: '',
    event_date: todayISO(),
    event_time: '',
    number_needed: '1'
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (key, value) => setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const { error } = await volunteerSubmissionsApi.submit({
        submitter_name: values.submitter_name,
        submitter_email: values.submitter_email || null,
        submitter_phone: values.submitter_phone || null,
        title: values.title,
        description: values.description || null,
        event_date: values.event_date,
        event_time: values.event_time || null,
        number_needed: Number(values.number_needed) || 1
      })
      if (error) throw error
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err?.message || 'Could not submit. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <Layout title="Suggest Volunteer Need" showBack>
        <div className="card mt-8 flex flex-col items-center gap-3 py-12 text-center rise-in">
          <div className="text-4xl" aria-hidden="true">🤝</div>
          <h2 className="text-xl">Thank you for suggesting this need!</h2>
          <p className="max-w-xs text-sm text-ink/65">
            A ward leader will review it before posting it as a volunteer opportunity.
          </p>
          <Link to="/volunteer" className="btn-secondary mt-2">
            View Volunteer Opportunities
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Suggest Volunteer Need" showBack>
      <PageHeading
        title="Suggest a Volunteer Need"
        subtitle="Know a service opportunity? Share it with ward leaders."
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-sage-light/40 bg-sage-mist px-4 py-3.5">
        <span className="text-xl" aria-hidden="true">📋</span>
        <p className="text-sm text-sage-dark">
          Moving help, ward activities, service projects, and other needs can be submitted here.
          Leaders will review before it goes live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 rise-in">
        <div>
          <label htmlFor="submitter_name" className="label">
            Your Name <span className="text-gold-dark">*</span>
          </label>
          <input
            id="submitter_name"
            className="input"
            required
            value={values.submitter_name}
            onChange={(e) => update('submitter_name', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="submitter_email" className="label">Email</label>
          <input
            id="submitter_email"
            type="email"
            className="input"
            value={values.submitter_email}
            onChange={(e) => update('submitter_email', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="submitter_phone" className="label">Phone</label>
          <input
            id="submitter_phone"
            type="tel"
            className="input"
            value={values.submitter_phone}
            onChange={(e) => update('submitter_phone', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="title" className="label">
            Opportunity Title <span className="text-gold-dark">*</span>
          </label>
          <input
            id="title"
            className="input"
            required
            placeholder="e.g. Help moving the Johnson family"
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            className="input min-h-[110px]"
            placeholder="What help is needed? When and where?"
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="event_date" className="label">
              Date <span className="text-gold-dark">*</span>
            </label>
            <input
              id="event_date"
              type="date"
              className="input"
              required
              value={values.event_date}
              onChange={(e) => update('event_date', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="event_time" className="label">Time</label>
            <input
              id="event_time"
              type="time"
              className="input"
              value={values.event_time}
              onChange={(e) => update('event_time', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="number_needed" className="label">
            Volunteers Needed <span className="text-gold-dark">*</span>
          </label>
          <input
            id="number_needed"
            type="number"
            min="1"
            className="input"
            required
            value={values.number_needed}
            onChange={(e) => update('number_needed', e.target.value)}
          />
        </div>

        {status === 'error' && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting…' : 'Submit for Review'}
        </button>
      </form>
    </Layout>
  )
}