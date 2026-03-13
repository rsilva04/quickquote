// api/leads.js — Vercel serverless function
import Anthropic from "@anthropic-ai/sdk";
import { saveLead } from "../lib/db.js";
import { sendLeadResponse, sendOwnerNotification } from "../lib/email.js";

const COMPANY = {
  name: "Twin Cities Plumbing & HVAC",
  type: "plumbing and HVAC",
  location: "Minneapolis, MN",
  phone: "(612) 555-0142",
  ownerName: "Mike",
  email: "mike@tcplumbing-demo.com",
};

function buildPrompt({ name, email, phone, serviceType, message, urgency }) {
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

const MOCK_RESPONSE = `Hi Sarah,

Thanks for reaching out! A dripping kitchen faucet that's getting worse usually points to a worn-out cartridge or valve seat — the good news is this is a straightforward repair that we handle all the time.

Based on what you're describing, you're likely looking at $120–$200 for the repair, depending on your faucet model and the parts needed.

I'd love to get this taken care of for you before it drives up your water bill. Here are a few times I could swing by:

- Tuesday, March 17th between 9–11 AM
- Wednesday, March 18th between 1–3 PM
- Thursday, March 19th between 10 AM–12 PM

Just reply to this email or give us a call at (612) 555-0142 and we'll get you on the schedule.

Looking forward to helping you out!

— Mike
Twin Cities Plumbing & HVAC`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, serviceType, message, urgency } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required" });
  }

  let aiResponse;
  const startTime = Date.now();

  if (!process.env.ANTHROPIC_API_KEY) {
    aiResponse = MOCK_RESPONSE;
  } else {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = buildPrompt({ name, email, phone, serviceType, message, urgency });

    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    aiResponse = result.content[0].text;
  }

  const responseTimeMs = Date.now() - startTime;

  // Send emails (don't let failures block the response)
  let emailStatus = "responded";
  try {
    await Promise.all([
      sendLeadResponse({ email, serviceType }, aiResponse),
      sendOwnerNotification({ name, email, phone, serviceType, message, urgency }, aiResponse),
    ]);
  } catch (err) {
    console.error("[email] Failed to send:", err.message);
    emailStatus = "responded_email_failed";
  }

  const lead = await saveLead({
    name,
    email,
    phone,
    serviceType,
    message,
    urgency,
    aiResponse,
    status: emailStatus,
    responseTimeMs,
  });

  console.log(`[leads] ${lead.id} — ${name} (${serviceType || "general"}) — ${responseTimeMs}ms — ${emailStatus}`);

  return res.status(200).json({
    success: true,
    aiResponse,
    leadId: lead.id,
    responseTimeMs,
    emailStatus,
  });
}
