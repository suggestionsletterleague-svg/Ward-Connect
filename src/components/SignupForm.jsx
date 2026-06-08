import { useState } from 'react'

// fields: array of { name, label, type, required, placeholder }
export default function SignupForm({ fields, onSubmit, submitLabel = 'Sign Up', onSuccess }) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.name, '']))
  )
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const update = (name, v) => setValues((prev) => ({ ...prev, [name]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const { error } = await onSubmit(values)
      if (error) throw error
      setStatus('success')
      onSuccess?.()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err?.message || 'Could not submit. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="text-4xl" aria-hidden="true">✅</div>
        <h3 className="text-lg">Thank you!</h3>
        <p className="text-sm text-ink/60">
          Your signup has been received. A ward leader will be in touch if needed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="label">
            {field.label}
            {field.required && <span className="text-gold-dark"> *</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              className="input min-h-[90px]"
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(e) => update(field.name, e.target.value)}
            />
          ) : (
            <input
              id={field.name}
              type={field.type || 'text'}
              inputMode={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
              className="input"
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(e) => update(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting…' : submitLabel}
      </button>
    </form>
  )
}
