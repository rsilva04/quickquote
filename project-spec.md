# Demo #1: Automated Lead Response System

## "QuickQuote" — AI-Powered Lead Response for Home Services

---

## What This Is

A system that catches incoming leads from a home services company's website (HVAC, plumbing, electrical) and responds with a personalized, intelligent email within 2 minutes — 24/7, including nights and weekends when competitors are sleeping.

**The pitch to business owners:** "You're losing $200-500 every time a lead fills out your form at 9pm and doesn't hear back until the next morning. By then they've called your competitor. This system responds in under 2 minutes with a personalized message that sounds like you wrote it."

---

## Architecture Overview

```
┌─────────────────────┐
│   Contact Form      │  (React frontend - embedded on client's site)
│   homeserviceco.com  │
└─────────┬───────────┘
          │ POST /api/leads
          ▼
┌─────────────────────┐
│   Node.js Backend   │  (Express API on Vercel serverless functions)
│                     │
│  1. Validate input  │
│  2. Store lead      │
│  3. Call Claude API │
│  4. Send email      │
│  5. Log to dashboard│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Owner Dashboard   │  (React app - see all leads + AI responses)
│   - Lead list       │
│   - Response status │
│   - Response preview│
│   - Analytics       │
└─────────────────────┘
```

---

## Part A: Self-Contained App (Portfolio Piece)

### Tech Stack

- **Frontend:** React + Tailwind CSS (or hand-styled — make it look premium)
- **Backend:** Node.js / Express (Vercel serverless functions)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Email:** Resend (free tier: 100 emails/day — perfect for demos)
- **Database:** Supabase (free tier) or a simple JSON file for the demo
- **Hosting:** Vercel (free tier)

### Project Structure

```
quickquote/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactForm.jsx       # The embeddable lead capture form
│   │   │   ├── Dashboard.jsx         # Owner dashboard - lead list + analytics
│   │   │   ├── LeadCard.jsx          # Individual lead display
│   │   │   ├── ResponsePreview.jsx   # Shows AI-generated response
│   │   │   └── DemoLanding.jsx       # Portfolio landing page for this demo
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── api/
│   ├── leads.js                      # POST - receive new lead
│   ├── leads-list.js                 # GET - fetch all leads for dashboard
│   └── webhook.js                    # For Make.com integration (Part B)
├── lib/
│   ├── claude.js                     # Claude API integration
│   ├── email.js                      # Resend email integration
│   └── db.js                         # Supabase client (or JSON store)
├── prompts/
│   └── lead-response.md              # The Claude prompt template
├── vercel.json
├── package.json
└── README.md
```

### The Claude Prompt (This Is the Secret Sauce)

Save this as `prompts/lead-response.md` — this is what makes the responses feel human and not robotic:

```markdown
You are a friendly, knowledgeable customer service representative for {{company_name}},
a {{company_type}} company in {{company_location}}.

A potential customer just submitted a contact form on the website. Here is their information:

- Name: {{lead_name}}
- Email: {{lead_email}}
- Phone: {{lead_phone}}
- Service needed: {{service_type}}
- Description of issue: {{lead_message}}
- Urgency: {{urgency}}
- Time submitted: {{submission_time}}

Write a personalized email response that:

1. Addresses them by first name
2. Acknowledges their specific issue (reference details they mentioned)
3. Provides a brief, helpful insight about their issue (e.g., "A running toilet often
   means the flapper valve needs replacement — this is usually a straightforward fix")
4. Gives a rough estimate range if possible based on the service type
5. Proposes 2-3 available time slots for a visit (use the next 2-3 business days)
6. Includes the company phone number for urgent issues
7. Signs off warmly with the owner's name

Tone: Warm, professional, knowledgeable but not condescending. Like a trusted neighbor
who happens to be a great plumber. NOT corporate or salesy.

Keep it under 200 words. No subject line — just the body.

IMPORTANT: If the issue sounds like an emergency (gas leak, flooding, no heat in winter,
no AC in summer), start with: "This sounds urgent — if you need immediate help,
please call us right now at {{company_phone}}. We have emergency service available."
```

### Key Backend Logic (api/leads.js)

```javascript
// api/leads.js — Vercel serverless function
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// Company config — in production this comes from a database per client
const COMPANY = {
  name: "Twin Cities Plumbing & HVAC",
  type: "plumbing and HVAC",
  location: "Minneapolis, MN",
  phone: "(612) 555-0142",
  ownerName: "Mike",
  email: "mike@tcplumbing-demo.com",
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { name, email, phone, serviceType, message, urgency } = req.body;

  // 1. Validate
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required" });
  }

  // 2. Generate personalized response with Claude
  const prompt = buildPrompt({
    name,
    email,
    phone,
    serviceType,
    message,
    urgency,
  });

  const aiResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = aiResponse.content[0].text;

  // 3. Send email to the lead
  await resend.emails.send({
    from: `${COMPANY.name} <noreply@yourdomain.com>`,
    to: email,
    subject: `Re: Your ${serviceType || "service"} inquiry — ${COMPANY.name}`,
    text: responseText,
  });

  // 4. Notify the business owner
  await resend.emails.send({
    from: `QuickQuote Alert <noreply@yourdomain.com>`,
    to: COMPANY.email,
    subject: `🔔 New lead: ${name} — ${serviceType}`,
    text: `New lead received!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${serviceType}\nMessage: ${message}\nUrgency: ${urgency}\n\n--- AI Response Sent ---\n\n${responseText}`,
  });

  // 5. Store the lead (Supabase or your DB of choice)
  const lead = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    serviceType,
    message,
    urgency,
    aiResponse: responseText,
    status: "responded",
    createdAt: new Date().toISOString(),
    responseTime: "< 2 min",
  };

  // await supabase.from('leads').insert(lead);  // uncomment when DB is set up

  return res.status(200).json({
    success: true,
    message: "Thank you! We'll get back to you shortly.",
    leadId: lead.id,
  });
}

function buildPrompt({ name, email, phone, serviceType, message, urgency }) {
  // Load and fill the prompt template
  return `You are a friendly, knowledgeable customer service representative for ${COMPANY.name}, a ${COMPANY.type} company in ${COMPANY.location}.

A potential customer just submitted a contact form on the website:

- Name: ${name}
- Email: ${email}
- Phone: ${phone || "not provided"}
- Service needed: ${serviceType || "general inquiry"}
- Description of issue: ${message}
- Urgency: ${urgency || "normal"}
- Time submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}

Write a personalized email response that:
1. Addresses them by first name
2. Acknowledges their specific issue (reference details they mentioned)
3. Provides a brief, helpful insight about their issue
4. Gives a rough estimate range if possible
5. Proposes 2-3 available time slots (next 2-3 business days)
6. Includes the company phone number ${COMPANY.phone} for urgent issues
7. Signs off warmly as ${COMPANY.ownerName}

Tone: Warm, professional, knowledgeable. Like a trusted neighbor who happens to be a great plumber. NOT corporate or salesy. Keep it under 200 words. No subject line.

IMPORTANT: If this sounds like an emergency (gas leak, flooding, no heat in winter, no AC in summer), start with: "This sounds urgent — if you need immediate help, please call us right now at ${COMPANY.phone}. We have emergency service available."`;
}
```

### Dashboard Features to Build

The dashboard is what sells this to business owners. It should show:

1. **Lead feed** — Real-time list of incoming leads with status indicators
2. **AI response preview** — Click any lead to see exactly what was sent
3. **Response time metric** — Show the average response time (always under 2 min)
4. **Simple stats** — Leads today, this week, this month
5. **Edit & resend** — Owner can tweak the AI response and resend (for v2)

### Design Direction for the Portfolio Piece

This needs to look GOOD — not like a generic Bootstrap template. Suggestions:

- Dark sidebar with a light main content area
- Real-time feel — use subtle animations when new leads appear
- Show a split view: left side = lead info, right side = AI response
- Use a monospace font for the AI response to distinguish it from UI text
- Add a "response time" badge that shows "Responded in 47 seconds" in green
- Mobile-responsive — business owners check this on their phones

---

## Part B: Make.com Template (Quick Client Deploys)

This is the version you'll actually deploy for clients. It's faster to set up,
easier to customize, and clients can see the workflow visually.

### Make.com Scenario Flow

```
Trigger: Webhook (receives form data)
    │
    ├─→ Module 1: Claude API (HTTP module)
    │   - POST to https://api.anthropic.com/v1/messages
    │   - Send the prompt with lead data
    │   - Parse the response
    │
    ├─→ Module 2: Send Email to Lead (Gmail or SMTP)
    │   - From: client's business email
    │   - To: lead's email
    │   - Body: Claude's response
    │
    ├─→ Module 3: Send Notification to Owner (Gmail or SMS via Twilio)
    │   - Alert with lead details + AI response sent
    │
    └─→ Module 4: Log to Google Sheet
        - Timestamp, lead info, AI response, status
        - This becomes the client's "dashboard" initially
```

### Make.com Setup Steps (Do This After the Self-Contained Build)

1. Create a new Scenario
2. Add Webhook trigger → copy the webhook URL
3. Add HTTP module → configure Claude API call:
   - URL: https://api.anthropic.com/v1/messages
   - Method: POST
   - Headers: x-api-key, anthropic-version, content-type
   - Body: JSON with the prompt template (same as above)
4. Add Gmail module → send response to lead
5. Add Gmail module → notify owner
6. Add Google Sheets module → log the lead
7. Test with sample data
8. Turn on scheduling (instant webhook processing)

### Client Deployment Checklist

When you sign a client, here's what you customize:

- [ ] Company name, location, phone, owner name in the prompt
- [ ] Service types specific to their business
- [ ] Email sending address (their domain)
- [ ] Google Sheet for their lead log
- [ ] Webhook URL embedded in their existing website form
- [ ] Test with 3-5 sample leads before going live

---

## Demo Script (For Showing Business Owners)

When you sit down with a prospect, walk through this:

1. **Open the contact form** on your demo site
2. **Fill it out as a fake customer:** "Hi, my kitchen faucet has been dripping
   for a week and it's getting worse. I think it might be the cartridge.
   Not an emergency but I'd like to get it fixed soon."
3. **Submit and wait** — within 60-90 seconds, show them:
   - The email that the "customer" received (personalized, mentions the cartridge)
   - The notification the "owner" received
   - The dashboard entry with full details
4. **Then show the emergency scenario:** Submit another with "I smell gas in my
   basement" — show how the response prioritizes urgency and leads with
   "call us immediately"
5. **Close with the math:** "How many leads do you get per week? How many come in
   after hours? If this catches even 2-3 leads per month that would've gone to
   a competitor, that's $X,000 in revenue."

---

## Claude Code Instructions

When you open Claude Code, give it this prompt to kick things off:

```
I'm building a full-stack lead response automation system called "QuickQuote"
for home services companies (HVAC, plumbing).

Tech stack: React frontend, Node.js/Express backend (Vercel serverless),
Claude API for AI responses, Resend for email, Supabase for data storage.

The app has two parts:
1. An embeddable contact form that captures leads
2. An owner dashboard that shows all leads and AI-generated responses

Start by scaffolding the project structure, then build the backend API
endpoint that receives a lead, calls Claude to generate a personalized
response, sends the email, and stores the lead.

I have the full spec in this file: [paste the spec or point to this file]
```

---

## Revenue Projection for This Demo

| Scenario                   | Price    | Your Time   | Effective Rate      |
| -------------------------- | -------- | ----------- | ------------------- |
| Pilot project (discounted) | $800     | ~6-8 hours  | $100-133/hr         |
| Standard deployment        | $1,500   | ~6-8 hours  | $187-250/hr         |
| With monthly maintenance   | +$300/mo | ~2-3 hrs/mo | $100-150/hr ongoing |
| Scaled (template deploy)   | $1,200   | ~3-4 hours  | $300-400/hr         |

Once you've deployed this 3-4 times and templatized it, you're effectively
making $300-400/hr on each new client because you've already built the system.

---

## Next Steps After This Demo

1. Build Demo #2 (Client Follow-Up Automator) using the same architecture
2. Build Demo #3 (Review Monitor + Auto-Responder)
3. Each demo reinforces the same skill set and shares components
4. All three together form your "Small Business AI Automation Suite"
