import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const COMPANY = {
  name: "Twin Cities Plumbing & HVAC",
  ownerEmail: "mike@tcplumbing-demo.com",
};

export async function sendLeadResponse(lead, aiResponse) {
  const from = `${COMPANY.name} <onboarding@resend.dev>`;
  const to = lead.email;
  const subject = `Re: Your ${lead.serviceType || "service"} inquiry — ${COMPANY.name}`;

  if (!resend) {
    console.log(`[email] (mock) → ${to}: ${subject}`);
    return;
  }

  await resend.emails.send({ from, to, subject, text: aiResponse });
}

export async function sendOwnerNotification(lead, aiResponse) {
  const from = "QuickQuote Alert <onboarding@resend.dev>";
  const to = COMPANY.ownerEmail;
  const subject = `🔔 New lead: ${lead.name} — ${lead.serviceType || "general"}`;
  const text = `New lead received!

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || "not provided"}
Service: ${lead.serviceType || "general inquiry"}
Message: ${lead.message}
Urgency: ${lead.urgency || "normal"}

--- AI Response Sent ---

${aiResponse}`;

  if (!resend) {
    console.log(`[email] (mock) → ${to}: ${subject}`);
    return;
  }

  await resend.emails.send({ from, to, subject, text });
}
