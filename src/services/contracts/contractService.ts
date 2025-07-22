export async function generateContract({ type, parties, details, title, jurisdiction, agency_id }) {
  const url =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "https://hzbogwleoszwtneveuvx.supabase.co/functions/v1/contracts-generator"
      : "/functions/v1/contracts-generator";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ type, parties, details, title, jurisdiction, agency_id }),
  });
  if (!res.ok) throw new Error("Erreur génération contrat");
  return res.json();
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