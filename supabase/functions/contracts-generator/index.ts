import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
  }

  const { type, parties, details, title, jurisdiction } = body;

  const prompt = `Génère un contrat de type "${type}" entre les parties suivantes : ${JSON.stringify(parties)}. Détails : ${JSON.stringify(details)}. Le contrat doit être conforme à la législation du pays suivant : ${jurisdiction}.`;

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
  const groqData = await groqRes.json();
  const contractText = groqData.choices?.[0]?.message?.content || "";

  const supabase = createClient();
  const { data, error } = await supabase
    .from("contracts")
    .insert([{ type, parties, details, content: contractText, title, jurisdiction }])
    .select();

  if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders });
  return new Response(JSON.stringify({ contract: data[0] }), { status: 200, headers: corsHeaders });
}); 