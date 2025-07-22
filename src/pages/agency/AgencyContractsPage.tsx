import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function AgencyContractsPage() {
  const { agencyId } = useParams();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchContracts() {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("contracts")
        .select("id, type, title, jurisdiction, status, content, details, parties")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false });
      if (error) setError("Erreur lors du chargement des contrats");
      else setContracts(data || []);
      setLoading(false);
    }
    if (agencyId) fetchContracts();
  }, [agencyId]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-immoo-gold" /> Contrats de l'agence
      </h1>
      <Button asChild className="mb-6">
        <a href={`/agencies/${agencyId}/contracts/create`}>Nouveau contrat</a>
      </Button>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : contracts.length === 0 ? (
        <div>Aucun contrat trouvé pour cette agence.</div>
      ) : (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-immoo-pearl/40">
              <th className="p-2">Type</th>
              <th className="p-2">Titre</th>
              <th className="p-2">Législation</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Extrait</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b hover:bg-immoo-pearl/20">
                <td className="p-2">{c.type}</td>
                <td className="p-2">{c.title}</td>
                <td className="p-2">{c.jurisdiction}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2 max-w-xs truncate">{c.content?.slice(0, 80)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 