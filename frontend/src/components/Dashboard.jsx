import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function timeAgo(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days === 1) {
    return `Yesterday at ${new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function urgencyBadge(urgency) {
  const map = {
    'emergency': { label: 'Urgent', className: 'db-badge-red' },
    'soon': { label: 'Soon', className: 'db-badge-yellow' },
    'not-urgent': { label: 'Low', className: 'db-badge-green' },
    'normal': { label: 'Normal', className: 'db-badge-green' },
  }
  const info = map[urgency] || map['normal']
  return <span className={`db-badge ${info.className}`}>{info.label}</span>
}

function statusBadge(status) {
  if (status === 'responded') {
    return <span className="db-badge db-badge-green">Responded ✓</span>
  }
  if (status === 'responded_email_failed') {
    return <span className="db-badge db-badge-yellow">Responded (email failed)</span>
  }
  if (status === 'failed') {
    return <span className="db-badge db-badge-red">Failed</span>
  }
  return <span className="db-badge">Pending</span>
}

function StatSkeleton() {
  return (
    <div className="db-stat-card">
      <div className="db-skeleton db-skeleton-value" />
      <div className="db-skeleton db-skeleton-label" />
    </div>
  )
}

function LeadSkeleton() {
  return (
    <div className="db-lead-card">
      <div className="db-lead-summary" style={{ cursor: 'default' }}>
        <div className="db-lead-info">
          <div className="db-skeleton db-skeleton-name" />
          <div className="db-skeleton db-skeleton-meta" />
        </div>
        <div className="db-lead-badges">
          <div className="db-skeleton db-skeleton-badge" />
          <div className="db-skeleton db-skeleton-badge" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads-list')
      const data = await res.json()
      if (data.success) setLeads(data.leads)
    } catch {
      // silently retry on next interval
    } finally {
      setLoading(false)
      setLastRefresh(Date.now())
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 30000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  // Stats
  const today = new Date().toDateString()
  const leadsToday = leads.filter(l => new Date(l.created_at).toDateString() === today).length
  const responded = leads.filter(l => l.status === 'responded' || l.status === 'responded_email_failed')
  const responseRate = leads.length > 0 ? Math.round((responded.length / leads.length) * 100) : 0
  const avgResponseMs = responded.length > 0
    ? responded.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / responded.length
    : 0
  const avgResponseDisplay = avgResponseMs < 1000
    ? '< 1s'
    : `${(avgResponseMs / 1000).toFixed(1)}s`

  return (
    <div className="db-layout">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <div className="db-brand-icon">Q</div>
          <span>QuickQuote</span>
        </div>
        <nav className="db-nav">
          <Link to="/dashboard" className="db-nav-item db-nav-active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </Link>
          <Link to="/" className="db-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Contact Form
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="db-main">
        {/* Header */}
        <header className="db-header">
          <div>
            <h1>Lead Dashboard</h1>
            <p className="db-header-sub">
              Auto-refreshes every 30s · Last updated {timeAgo(new Date(lastRefresh).toISOString())}
            </p>
          </div>
          <button className="db-refresh-btn" onClick={fetchLeads}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </header>

        {/* Stats bar */}
        <div className="db-stats">
          {loading ? (
            <>
              <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
            </>
          ) : (
            <>
              <div className="db-stat-card">
                <span className="db-stat-value">{leads.length}</span>
                <span className="db-stat-label">Total Leads</span>
              </div>
              <div className="db-stat-card">
                <span className="db-stat-value">{leadsToday}</span>
                <span className="db-stat-label">Today</span>
              </div>
              <div className="db-stat-card">
                <span className="db-stat-value">{avgResponseDisplay}</span>
                <span className="db-stat-label">Avg Response</span>
              </div>
              <div className="db-stat-card">
                <span className="db-stat-value">{responseRate}%</span>
                <span className="db-stat-label">Response Rate</span>
              </div>
            </>
          )}
        </div>

        {/* Lead list */}
        <div className="db-leads">
          <h2>Recent Leads</h2>

          {loading && (
            <>
              <LeadSkeleton /><LeadSkeleton /><LeadSkeleton />
            </>
          )}
          {!loading && leads.length === 0 && (
            <p className="db-empty">No leads yet. Submit one through the <Link to="/">contact form</Link>.</p>
          )}

          {!loading && leads.map(lead => (
            <div key={lead.id} className="db-lead-card">
              <div
                className="db-lead-summary"
                onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
              >
                <div className="db-lead-info">
                  <div className="db-lead-name">
                    {lead.name}
                    <span className="db-lead-service">{lead.service_type || 'General'}</span>
                  </div>
                  <div className="db-lead-meta">
                    {timeAgo(lead.created_at)}
                    {lead.response_time_ms != null && (
                      <span className="db-lead-speed"> · Responded in {lead.response_time_ms < 1000 ? '< 1s' : `${(lead.response_time_ms / 1000).toFixed(1)}s`}</span>
                    )}
                  </div>
                </div>
                <div className="db-lead-badges">
                  {urgencyBadge(lead.urgency)}
                  {statusBadge(lead.status)}
                  <span className={`db-chevron ${expanded === lead.id ? 'db-chevron-open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
              </div>

              {expanded === lead.id && (
                <div className="db-lead-detail">
                  <div className="db-detail-grid">
                    <div className="db-detail-item">
                      <span className="db-detail-label">Email</span>
                      <span>{lead.email}</span>
                    </div>
                    <div className="db-detail-item">
                      <span className="db-detail-label">Phone</span>
                      <span>{lead.phone || 'Not provided'}</span>
                    </div>
                    <div className="db-detail-item">
                      <span className="db-detail-label">Urgency</span>
                      <span>{lead.urgency}</span>
                    </div>
                    <div className="db-detail-item">
                      <span className="db-detail-label">Submitted</span>
                      <span>{new Date(lead.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="db-detail-message">
                    <span className="db-detail-label">Customer Message</span>
                    <p>{lead.message}</p>
                  </div>
                  {lead.ai_response && (
                    <div className="db-detail-response">
                      <span className="db-detail-label">AI Response Sent</span>
                      <pre>{lead.ai_response}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
