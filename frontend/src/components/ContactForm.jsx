import { useState } from 'react'
import './ContactForm.css'

const SERVICE_TYPES = [
  { value: '', label: 'Select a service...' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC / Heating & Cooling' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'water-heater', label: 'Water Heater' },
  { value: 'drain-cleaning', label: 'Drain Cleaning' },
  { value: 'other', label: 'Other' },
]

const URGENCY_OPTIONS = [
  { value: 'not-urgent', label: 'Not urgent — just want a quote' },
  { value: 'soon', label: 'Within the next few days' },
  { value: 'emergency', label: 'ASAP — this is urgent' },
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    message: '',
    urgency: 'not-urgent',
  })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResult(data)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  if (status === 'success' && result) {
    const seconds = result.responseTimeMs < 1000
      ? '< 1'
      : Math.round(result.responseTimeMs / 1000)

    return (
      <div className="cf-container">
        <div className="cf-success">
          <div className="cf-success-icon">✓</div>
          <h2>Thanks, {form.name.split(' ')[0]}!</h2>
          <p>
            Check your email — we've sent you a detailed response about your{' '}
            <strong>{form.serviceType || 'service'}</strong> issue.
          </p>
          <p className="cf-response-time">Response time: {seconds} seconds</p>
          <button
            className="cf-btn cf-btn-secondary"
            onClick={() => {
              setStatus('idle')
              setResult(null)
              setForm({ name: '', email: '', phone: '', serviceType: '', message: '', urgency: 'not-urgent' })
            }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cf-container">
      <div className="cf-header">
        <h2>Get Your Free Quote</h2>
        <p>Tell us about your issue and we'll get back to you with a personalized response — usually within 2 minutes.</p>
      </div>

      <form className="cf-form" onSubmit={handleSubmit}>
        <div className="cf-row">
          <div className="cf-field">
            <label htmlFor="cf-name">Name <span className="cf-required">*</span></label>
            <input
              id="cf-name"
              name="name"
              type="text"
              required
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="cf-field">
            <label htmlFor="cf-email">Email <span className="cf-required">*</span></label>
            <input
              id="cf-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="cf-row">
          <div className="cf-field">
            <label htmlFor="cf-phone">Phone <span className="cf-optional">(recommended)</span></label>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              placeholder="(612) 555-0000"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="cf-field">
            <label htmlFor="cf-service">Service Type</label>
            <select
              id="cf-service"
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
            >
              {SERVICE_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-message">Describe Your Issue <span className="cf-required">*</span></label>
          <textarea
            id="cf-message"
            name="message"
            required
            rows={4}
            placeholder="Tell us what's going on — the more detail, the better we can help"
            value={form.message}
            onChange={handleChange}
          />
        </div>

        <div className="cf-field">
          <label>How urgent is this?</label>
          <div className="cf-radios">
            {URGENCY_OPTIONS.map(opt => (
              <label key={opt.value} className="cf-radio-label">
                <input
                  type="radio"
                  name="urgency"
                  value={opt.value}
                  checked={form.urgency === opt.value}
                  onChange={handleChange}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {status === 'error' && (
          <div className="cf-error">
            <p><strong>Something went wrong:</strong> {errorMsg}</p>
            <p>Please try again or call us directly at <strong>(612) 555-0142</strong>.</p>
          </div>
        )}

        <button
          type="submit"
          className="cf-btn cf-btn-primary"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Generating your personalized response...' : 'Get My Free Quote'}
        </button>
      </form>
    </div>
  )
}
