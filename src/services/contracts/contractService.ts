export async function generateContract({ type, parties, details, title, jurisdiction, agency_id }) {
  console.log("📞 generateContract called with:", { type, parties, details, title, jurisdiction, agency_id });
  
  const url =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "https://hzbogwleoszwtneveuvx.supabase.co/functions/v1/contracts-generator"
      : "/functions/v1/contracts-generator";
  
  console.log("🌐 Calling URL:", url);
  
  const requestBody = { type, parties, details, title, jurisdiction, agency_id };
  console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });
  
  console.log("📡 Response status:", res.status);
  console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()));
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Response error:", errorText);
    throw new Error(`Erreur génération contrat: ${res.status} - ${errorText}`);
  }
  
  const result = await res.json();
  console.log("✅ Response data:", result);
  return result;
}

export async function updateContract({ id, content, status }: { id: any, content?: any, status?: any }) {
  const res = await fetch("/functions/v1/contracts-update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, content, status }),
  });
  if (!res.ok) throw new Error("Erreur mise à jour contrat");
  return res.json();
}

export async function deleteContract(id: string) {
  const res = await fetch("/functions/v1/contracts-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Erreur suppression contrat");
  return res.json();
} 