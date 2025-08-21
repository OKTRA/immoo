import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Configuration Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🔧 contracts-generator function called");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
    console.log("📝 Request body received:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.log("❌ Invalid JSON body:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
  }

  const { type, parties, details, title, jurisdiction } = body;
  console.log("📋 Contract parameters:", { type, title, jurisdiction });

  const prompt = `Génère un contrat de type "${type}" entre les parties suivantes : ${JSON.stringify(parties)}. Détails : ${JSON.stringify(details)}. Le contrat doit être conforme à la législation du pays suivant : ${jurisdiction}.`;
  console.log("🤖 Prompt sent to Groq:", prompt);

  console.log("🚀 Calling Groq API...");
  const groqRes = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }]
    })
  });
  
  console.log("📡 Groq API response status:", groqRes.status);
  const groqData = await groqRes.json();
  console.log("📄 Groq API response:", JSON.stringify(groqData, null, 2));
  
  const contractText = groqData.choices?.[0]?.message?.content || "";
  console.log("📝 Generated contract text length:", contractText.length);

  console.log("💾 Saving contract to database...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Prefer explicit ids from body, fallback to nested details/parties
  const resolvedPropertyId = body.property_id || details?.property_id || details?.propriete?.id || null;
  const resolvedClientId = body.client_id || parties?.tenant_id || parties?.client_id || null;

  // Normalize dates and numeric value
  const today = new Date().toISOString().split("T")[0];
  const startDate = body.start_date || details?.start_date || details?.date_debut || today;
  const endDate = body.end_date || details?.end_date || details?.date_fin || null; // Allow null for end_date
  const value = Number(details?.monthly_rent || details?.loyer_mensuel || details?.amount || 0) || 0;

  // Map the data to match the actual database schema
  // Build a human-friendly summary without markdown asterisks or raw IDs
  const get = (v: any) => (v === undefined || v === null || v === '' ? 'Non spécifié' : String(v));
  const locNom = parties?.locataire?.nom || parties?.client?.nom;
  const locPrenom = parties?.locataire?.prenom || parties?.client?.prenom;
  const locEmail = parties?.locataire?.email || parties?.client?.email;
  const locTel = parties?.locataire?.telephone || parties?.client?.telephone;
  const locProf = parties?.locataire?.profession || parties?.client?.profession;

  const agenceNom = parties?.agence?.nom;
  const agenceEmail = parties?.agence?.email;
  const agenceTel = parties?.agence?.telephone;
  const agenceSite = parties?.agence?.site_web;
  const agenceAdresse = parties?.agence?.adresse;
  const agenceDesc = parties?.agence?.description;

  const propTitre = details?.propriete?.titre || details?.property_title;
  const loyer = details?.loyer_mensuel || details?.monthly_rent || value;
  const caution = details?.caution;
  const jourPaiement = details?.jour_paiement;
  const freqPaiement = details?.frequence_paiement;
  const conditions = details?.conditions_speciales;

  const summaryHtml = `
<h3 style="margin:12px 0">Locataire</h3>
<p><strong>Nom</strong>: ${get(locNom)} <strong>Prénom</strong>: ${get(locPrenom)} <strong>Adresse e-mail</strong>: ${get(locEmail)} <strong>Téléphone</strong>: ${get(locTel)} <strong>Profession</strong>: ${get(locProf)}</p>

<h3 style="margin:12px 0">Agence</h3>
<p><strong>Nom</strong>: ${get(agenceNom)} <strong>Adresse e-mail</strong>: ${get(agenceEmail)} <strong>Téléphone</strong>: ${get(agenceTel)} <strong>Site web</strong>: ${get(agenceSite)} <strong>Adresse</strong>: ${get(agenceAdresse)} <strong>Description</strong>: ${get(agenceDesc)}</p>

<h3 style="margin:12px 0">Propriétaire</h3>
<p><strong>Nom</strong>: ${get(agenceNom)} <strong>Adresse e-mail</strong>: ${get(agenceEmail)} <strong>Téléphone</strong>: ${get(agenceTel)} <strong>Site web</strong>: ${get(agenceSite)} <strong>Adresse</strong>: ${get(agenceAdresse)} <strong>Description</strong>: ${get(agenceDesc)}</p>

<h3 style="margin:12px 0">Détails du contrat</h3>
<p><strong>Titre de la propriété</strong>: ${get(propTitre)} <strong>Loyer mensuel</strong>: ${get(loyer)} FCFA <strong>Caution</strong>: ${get(caution)} FCFA <strong>Date de début</strong>: ${get(startDate)} <strong>Date de fin</strong>: ${get(endDate)} <strong>Jour de paiement</strong>: ${get(jourPaiement)} <strong>Fréquence</strong>: ${get(freqPaiement)} <strong>Conditions spéciales</strong>: ${get(conditions)}</p>

<hr style="margin:16px 0"/>`;

  const termsWithSummary = `${summaryHtml}\n${contractText}`;

  const contractData = {
    contract_type: type || 'bail',
    client_id: resolvedClientId,
    property_id: resolvedPropertyId,
    start_date: startDate,
    end_date: endDate,
    value,
    status: 'draft',
    terms: termsWithSummary,
    documents: [],
    agency_id: body.agency_id || null,
    created_at: new Date().toISOString(),
  } as any;
  
  const { data, error } = await supabase
    .from("contracts")
    .insert([contractData])
    .select();

  if (error) {
    console.log("❌ Database error:", error);
    return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders });
  }
  
  console.log("✅ Contract saved successfully:", data[0]);
  return new Response(JSON.stringify({ contract: data[0] }), { status: 200, headers: corsHeaders });
});
