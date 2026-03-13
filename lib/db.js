import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// --- Supabase client (only initialized if env vars are present) ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// --- In-memory fallback ---
const memoryStore = [];

// --- Exported functions ---

export async function saveLead(leadData) {
  const lead = {
    id: randomUUID(),
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone || null,
    service_type: leadData.serviceType || null,
    message: leadData.message,
    urgency: leadData.urgency || "normal",
    ai_response: leadData.aiResponse,
    status: leadData.status || "responded",
    response_time_ms: leadData.responseTimeMs ?? null,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("leads")
      .insert(lead)
      .select()
      .single();
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return data;
  }

  memoryStore.push(lead);
  return lead;
}

export async function getLeads() {
  if (supabase) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    return data;
  }

  return [...memoryStore].reverse();
}

export async function getLeadById(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    return data;
  }

  return memoryStore.find((lead) => lead.id === id) || null;
}
