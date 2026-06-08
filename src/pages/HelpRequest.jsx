import { useState } from 'react'
import Layout from '../components/Layout'
import { PageHeading } from '../components/ui'
import { helpApi } from '../services/api'
import { HELP_REQUEST_TYPES } from '../lib/constants'

export default function HelpRequest() {
  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    request_type: HELP_REQUEST_TYPES[0],
    message: '',
    permission_to_contact: false
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (k, v) => setValues((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const { error } = await helpApi.submit({
        name: values.name,
        phone: values.phone || null,
        email: values.email || null,
        request_type: values.request_type,
        message: values.message || null,
        permission_to_contact: values.permission_to_contact
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
      <Layout title="Help Request" showBack>
        <div className="card mt-8 flex flex-col items-center gap-3 py-12 text-center rise-in">
          <div className="text-4xl" aria-hidden="true">💛</div>
          <h2 className="text-xl">Your request has been received</h2>
          <p className="max-w-xs text-sm text-ink/65">
            An authorized ward leader will review it privately and reach out if appropriate. You
            are loved and not alone.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Help Request" showBack>
      <PageHeading title="Request Help" subtitle="We're here to support you" />

      {/* Privacy notice */}
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-sage-light/40 bg-sage-mist px-4 py-3.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-sage-dark" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <p className="text-sm text-sage-dark">
          This request will only be visible to authorized ward leaders and administrators.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 rise-in">
        <div>
          <label htmlFor="name" className="label">Name <span className="text-gold-dark">*</span></label>
          <input id="name" className="input" required value={values.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone</label>
          <input id="phone" type="tel" className="input" value={values.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" value={values.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label htmlFor="request_type" className="label">Request Type</label>
          <select id="request_type" className="input" value={values.request_type} onChange={(e) => update('request_type', e.target.value)}>
            {HELP_REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className="label">Message</label>
          <textarea id="message" className="input min-h-[110px]" placeholder="Tell us how we can help…" value={values.message} onChange={(e) => update('message', e.target.value)} />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-cream px-3 py-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-sage-light text-navy focus:ring-sage"
            checked={values.permission_to_contact}
            onChange={(e) => update('permission_to_contact', e.target.checked)}
          />
          <span className="text-sm text-ink/75">
            I give permission for a ward leader to contact me about this request.
          </span>
        </label>

        {status === 'error' && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting…' : 'Submit Private Request'}
        </button>
      </form>
    </Layout>
  )
}
