import React, { useState } from "react";
import { generateContract } from "../../services/contracts/contractService";

export default function ContractForm() {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [parties, setParties] = useState("{}");
  const [details, setDetails] = useState("{}");
  const [jurisdiction, setJurisdiction] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await generateContract({
        type,
        title,
        parties: JSON.parse(parties),
        details: JSON.parse(details),
        jurisdiction,
      });
      setContract(result.contract);
    } catch (err) {
      setError("Erreur lors de la génération du contrat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Créer un contrat</h2>
      <label>Type de contrat
        <input value={type} onChange={e => setType(e.target.value)} required placeholder="bail, cloture, autre..." />
      </label>
      <label>Titre
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </label>
      <label>Parties (JSON)
        <textarea value={parties} onChange={e => setParties(e.target.value)} required placeholder='{"locataire": {...}, "agence": {...}}' />
      </label>
      <label>Détails (JSON)
        <textarea value={details} onChange={e => setDetails(e.target.value)} required placeholder='{"montant": 100000, "durée": "12 mois"}' />
      </label>
      <label>Pays/Législation applicable
        <input value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} required placeholder="Côte d'Ivoire, France, Sénégal..." />
      </label>
      <button type="submit" disabled={loading}>{loading ? "Génération..." : "Générer le contrat"}</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {contract && (
        <div style={{ marginTop: 20 }}>
          <h3>Contrat généré</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 10 }}>{contract.content}</pre>
        </div>
      )}
    </form>
  );
} 