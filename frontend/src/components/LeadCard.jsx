export default function LeadCard({ lead }) {
  return (
    <div className="lead-card">
      <h3>{lead.name}</h3>
      <p>{lead.service_type || 'General inquiry'}</p>
      <span className={`status ${lead.status}`}>{lead.status}</span>
    </div>
  )
}
