# QuickQuote

AI-powered lead response system for home services companies (HVAC, plumbing, electrical). When a potential customer submits a contact form, QuickQuote uses Claude AI to generate a personalized, knowledgeable email response in under 2 minutes — 24/7, including nights and weekends. The business owner gets a real-time dashboard with every lead and AI response logged.

![QuickQuote Dashboard](screenshot-placeholder.png)

## Tech Stack

- **Frontend:** React, React Router, Vite
- **Backend:** Node.js, Express (Vercel Serverless Functions)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Email:** Resend
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel

## Setup

```bash
# Clone the repo
git clone https://github.com/your-username/quickquote.git
cd quickquote

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Add environment variables
cp .env.example .env
# Edit .env with your keys:
#   ANTHROPIC_API_KEY - from console.anthropic.com
#   RESEND_API_KEY    - from resend.com
#   SUPABASE_URL      - from your Supabase project settings
#   SUPABASE_ANON_KEY - from your Supabase project settings

# Create the database table (run in Supabase SQL Editor)
# See supabase-schema.sql

# Start development servers
npm run dev            # API server on port 3001
npm run dev:frontend   # Vite dev server on port 5173
```

Then visit:
- `http://localhost:5173/demo` — Landing page
- `http://localhost:5173/` — Contact form
- `http://localhost:5173/dashboard` — Owner dashboard

The app works without any API keys — it falls back to mock AI responses, console-logged emails, and in-memory storage.

## Deploy to Vercel

1. Push your repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add your environment variables in the Vercel dashboard (Settings → Environment Variables)
4. Deploy — Vercel will build the frontend and deploy the API functions automatically

## License

MIT
