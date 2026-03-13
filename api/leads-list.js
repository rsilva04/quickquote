// api/leads-list.js — Vercel serverless function
import { getLeads } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const leads = await getLeads();

  return res.status(200).json({
    success: true,
    leads,
  });
}
