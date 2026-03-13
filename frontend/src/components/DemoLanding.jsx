import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './DemoLanding.css'

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('dl-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function RevealSection({ className, children }) {
  const ref = useReveal()
  return <div ref={ref} className={`dl-reveal ${className || ''}`}>{children}</div>
}

export default function DemoLanding() {
  return (
    <div className="dl">
      {/* Nav */}
      <nav className="dl-nav">
        <div className="dl-nav-brand">
          <div className="dl-nav-icon">Q</div>
          QuickQuote
        </div>
        <div className="dl-nav-links">
          <Link to="/">Try Demo</Link>
          <Link to="/dashboard" className="dl-nav-cta">Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="dl-hero">
        <div className="dl-hero-glow" />
        <div className="dl-hero-content">
          <div className="dl-pill">AI-Powered Lead Response</div>
          <h1>Never Lose Another Lead<br />to a Slow Response</h1>
          <p className="dl-hero-sub">
            AI-powered instant responses for home services companies.
            Your customers hear back in under 2 minutes — even at 2 AM.
          </p>
          <div className="dl-hero-ctas">
            <Link to="/" className="dl-btn dl-btn-primary">
              Try the Demo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/dashboard" className="dl-btn dl-btn-secondary">
              See the Dashboard
            </Link>
          </div>
        </div>
        <div className="dl-hero-visual">
          <div className="dl-mockup">
            <div className="dl-mockup-bar">
              <span className="dl-dot dl-dot-red" />
              <span className="dl-dot dl-dot-yellow" />
              <span className="dl-dot dl-dot-green" />
            </div>
            <div className="dl-mockup-body">
              <div className="dl-mock-row dl-mock-in">
                <div className="dl-mock-avatar">SJ</div>
                <div className="dl-mock-bubble dl-mock-bubble-in">
                  <strong>Sarah Johnson</strong>
                  <p>Kitchen faucet has been dripping for a week and it's getting worse. I think it might be the cartridge...</p>
                  <span className="dl-mock-time">Just now</span>
                </div>
              </div>
              <div className="dl-mock-row dl-mock-out">
                <div className="dl-mock-bubble dl-mock-bubble-out">
                  <strong>AI Response</strong>
                  <p>Hi Sarah! A dripping faucet that's worsening usually points to a worn-out cartridge — the good news is this is a straightforward fix. Looking at $120–$200 depending on model...</p>
                  <span className="dl-mock-time dl-mock-fast">⚡ Sent in 1.2 seconds</span>
                </div>
                <div className="dl-mock-avatar dl-mock-avatar-ai">AI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="dl-section dl-how">
        <RevealSection className="dl-section-header">
          <h2>How It Works</h2>
          <p>Three steps. Zero effort. Instant results.</p>
        </RevealSection>
        <div className="dl-steps">
          <RevealSection className="dl-step">
            <div className="dl-step-num">1</div>
            <div className="dl-step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3>Customer Submits a Form</h3>
            <p>A potential customer fills out your website's contact form — describing their plumbing issue, HVAC problem, or service request.</p>
          </RevealSection>
          <RevealSection className="dl-step">
            <div className="dl-step-num">2</div>
            <div className="dl-step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="12" cy="15" r="2"/></svg>
            </div>
            <h3>AI Crafts a Personal Response</h3>
            <p>Claude AI analyzes the request and writes a warm, knowledgeable response — with pricing estimates, scheduling options, and expert insight.</p>
          </RevealSection>
          <RevealSection className="dl-step">
            <div className="dl-step-num">3</div>
            <div className="dl-step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
            <h3>Everyone Gets Notified</h3>
            <p>The customer receives a professional email. You get an alert with their details. The lead is logged to your dashboard — all in under 2 minutes.</p>
          </RevealSection>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="dl-section dl-why">
        <RevealSection className="dl-section-header">
          <h2>Why This Matters</h2>
          <p>Speed wins in home services. Here's the data.</p>
        </RevealSection>
        <div className="dl-stats-grid">
          <RevealSection className="dl-stat-block">
            <span className="dl-stat-num">78%</span>
            <span className="dl-stat-desc">of customers buy from the company that responds first</span>
          </RevealSection>
          <RevealSection className="dl-stat-block dl-stat-bad">
            <span className="dl-stat-num">47 hrs</span>
            <span className="dl-stat-desc">average response time for small businesses</span>
          </RevealSection>
          <RevealSection className="dl-stat-block dl-stat-good">
            <span className="dl-stat-num">&lt; 2 min</span>
            <span className="dl-stat-desc">QuickQuote response time — 24/7, including nights and weekends</span>
          </RevealSection>
        </div>
      </section>

      {/* CTA */}
      <section className="dl-section dl-cta-section">
        <RevealSection className="dl-cta-box">
          <h2>See It in Action</h2>
          <p>Submit a test lead through the demo form and watch the AI respond in real-time on the dashboard.</p>
          <div className="dl-hero-ctas">
            <Link to="/" className="dl-btn dl-btn-primary">
              Try the Demo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/dashboard" className="dl-btn dl-btn-secondary">
              See the Dashboard
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="dl-footer">
        <p>
          Built by <strong>Rafael</strong> — AI Automation for Small Businesses
        </p>
        <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Connect on LinkedIn
        </a>
      </footer>
    </div>
  )
}
