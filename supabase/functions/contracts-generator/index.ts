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
  const { data, error } = await supabase
    .from("contracts")
    .insert([{ type, parties, details, content: contractText, title, jurisdiction, agency_id: body.agency_id }])
    .select();

  if (error) {
    console.log("❌ Database error:", error);
    return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders });
  }
  
  console.log("✅ Contract saved successfully:", data[0]);
  return new Response(JSON.stringify({ contract: data[0] }), { status: 200, headers: corsHeaders });
}); 