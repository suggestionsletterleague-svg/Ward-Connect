import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { PageHeading } from '../components/ui'
import { goodNewsApi } from '../services/api'

export default function ShareGoodNews() {
  const [values, setValues] = useState({
    submitter_name: '',
    submitter_email: '',
    submitter_phone: '',
    title: '',
    body: ''
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (key, value) => setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const { error } = await goodNewsApi.submit({
        submitter_name: values.submitter_name,
        submitter_email: values.submitter_email || null,
        submitter_phone: values.submitter_phone || null,
        title: values.title,
        body: values.body
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
      <Layout title="Share Good News" showBack>
        <div className="card mt-8 flex flex-col items-center gap-3 py-12 text-center rise-in">
          <div className="text-4xl" aria-hidden="true">✨</div>
          <h2 className="text-xl">Thank you for sharing!</h2>
          <p className="max-w-xs text-sm text-ink/65">
            A ward leader will review your good news before it appears in Announcements.
          </p>
          <Link to="/announcements" className="btn-secondary mt-2">
            View Announcements
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Share Good News" showBack>
      <PageHeading title="Share Good News" subtitle="Celebrate blessings with the ward" />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold-mist px-4 py-3.5">
        <span className="text-xl" aria-hidden="true">📣</span>
        <p className="text-sm text-navy-dark">
          Share baptisms, missions, graduations, new babies, service milestones, and other
          uplifting news. A ward leader will review it before posting.
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
            Headline <span className="text-gold-dark">*</span>
          </label>
          <input
            id="title"
            className="input"
            required
            placeholder="e.g. Sister Johnson's son baptized"
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="body" className="label">
            Story <span className="text-gold-dark">*</span>
          </label>
          <textarea
            id="body"
            className="input min-h-[140px]"
            required
            placeholder="Share the good news you'd like the ward to celebrate…"
            value={values.body}
            onChange={(e) => update('body', e.target.value)}
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