// Lightweight controlled form fields for admin editors.

export function Field({ label, children, required }) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-gold-dark"> *</span>}
      </label>
      {children}
    </div>
  )
}

export function TextField({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <Field label={label} required={required}>
      <input
        type={type}
        className="input"
        required={required}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

export function TextArea({ label, value, onChange, required, placeholder, rows = 3 }) {
  return (
    <Field label={label} required={required}>
      <textarea
        className="input"
        required={required}
        placeholder={placeholder}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

export function SelectField({ label, value, onChange, options, required }) {
  return (
    <Field label={label} required={required}>
      <select className="input" required={required} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </Field>
  )
}

export function NumberField({ label, value, onChange, required, min = 0 }) {
  return (
    <Field label={label} required={required}>
      <input
        type="number"
        min={min}
        className="input"
        required={required}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </Field>
  )
}
