import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ContactForm from './components/ContactForm'
import Dashboard from './components/Dashboard'
import DemoLanding from './components/DemoLanding'
import './App.css'

function ContactPage() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Twin Cities Plumbing & HVAC</h1>
        <p>Trusted service in Minneapolis since 2005 — available 24/7 for emergencies</p>
      </header>
      <main>
        <ContactForm />
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 Twin Cities Plumbing & HVAC &middot; (612) 555-0142 &middot; Minneapolis, MN</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<ContactPage />} />
        <Route path="/demo" element={<DemoLanding />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
