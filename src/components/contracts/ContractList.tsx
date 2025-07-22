import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { updateContract } from "../../services/contracts/contractService";
import { deleteContract } from "../../services/contracts/contractService";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchContracts() {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("contracts")
        .select("id, type, title, jurisdiction, status, content")
        .order("created_at", { ascending: false });
      if (error) setError("Erreur lors du chargement des contrats");
      else setContracts(data || []);
      setLoading(false);
    }
    fetchContracts();
  }, []);

  const handleValidate = async (id) => {
    setSaving(true);
    try {
      await updateContract({ id, status: "validated" });
      setContracts((prev) => prev.map(c => c.id === id ? { ...c, status: "validated" } : c));
    } catch {
      alert("Erreur lors de la validation");
    }
    setSaving(false);
  };

  const handleEdit = (id, content) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      await updateContract({ id, content: editContent });
      setContracts((prev) => prev.map(c => c.id === id ? { ...c, content: editContent } : c));
      setEditingId(null);
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce contrat ?")) return;
    setSaving(true);
    try {
      await deleteContract(id);
      setContracts((prev) => prev.filter(c => c.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
    setSaving(false);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h2>Liste des contrats</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Titre</th>
            <th>Législation</th>
            <th>Statut</th>
            <th>Extrait</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id}>
              <td>{c.type}</td>
              <td>{c.title}</td>
              <td>{c.jurisdiction}</td>
              <td>{c.status}</td>
              <td style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {editingId === c.id ? (
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    style={{ width: "100%", minHeight: 80 }}
                  />
                ) : (
                  c.content?.slice(0, 80) + "..."
                )}
              </td>
              <td>
                {editingId === c.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(c.id)} disabled={saving}>Sauvegarder</button>
                    <button onClick={() => setEditingId(null)} disabled={saving}>Annuler</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleValidate(c.id)} disabled={saving || c.status === "validated"}>Valider</button>
                    <button onClick={() => handleEdit(c.id, c.content)} disabled={saving}>Corriger</button>
                    <button onClick={() => handleDelete(c.id)} disabled={saving} style={{ color: "red" }}>Supprimer</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 