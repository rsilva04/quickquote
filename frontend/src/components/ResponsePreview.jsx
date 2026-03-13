export default function ResponsePreview({ response }) {
  if (!response) return null

  return (
    <div className="response-preview">
      <h3>AI Response Preview</h3>
      <pre>{response}</pre>
    </div>
  )
}
