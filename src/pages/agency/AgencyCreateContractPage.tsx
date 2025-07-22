import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateContract } from "@/services/contracts/contractService";
import { Button } from "@/components/ui/button";
import { getLeasesByAgencyId } from "@/services/tenant/lease/getLeases";
import { getTenantsByAgencyId } from "@/services/tenant/tenantPropertyQueries";

const steps = [
  "Type de contrat",
  "Parties & Détails",
  "Aperçu & Génération"
];

export default function AgencyCreateContractPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [contractType, setContractType] = useState("bail");
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parties, setParties] = useState({});
  const [details, setDetails] = useState({ agencyId });

  // Charger les baux et locataires de l'agence si besoin
  useEffect(() => {
    if (agencyId) {
      getLeasesByAgencyId(agencyId).then(({ leases }) => setLeases(leases || []));
      getTenantsByAgencyId(agencyId).then(({ tenants }) => setTenants(tenants || []));
    }
  }, [agencyId]);

  // Pré-remplir parties/détails si un bail est sélectionné
  useEffect(() => {
    if (contractType === "bail" && selectedLeaseId && leases.length > 0) {
      const lease = leases.find(l => l.id === selectedLeaseId);
      if (lease) {
        setType("bail");
        setTitle(`Contrat de location - ${lease.properties?.title || "Propriété"}`);
        setParties({
          locataire: lease.tenants,
          agence: lease.properties?.agency_id,
        });
        setDetails({
          agencyId,
          leaseId: lease.id,
          propertyId: lease.property_id,
        });
      }
    }
  }, [selectedLeaseId, leases, contractType, agencyId]);

  // Pré-remplir parties si "autre" et locataire choisi
  useEffect(() => {
    if (contractType === "autre" && selectedTenantId && tenants.length > 0) {
      const tenant = tenants.find(t => t.id === selectedTenantId);
      if (tenant) {
        setParties({
          locataire: tenant,
          agence: agencyId,
        });
      }
    }
  }, [selectedTenantId, tenants, contractType, agencyId]);

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await generateContract({
        type,
        title,
        parties,
        details,
        jurisdiction,
        agency_id: agencyId,
      });
      setContract(result.contract);
      setStep(2);
    } catch (err) {
      setError("Erreur lors de la génération du contrat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {contractType === "bail" ? "Nouveau contrat de location" : "Nouveau contrat personnalisé"}
        </h1>
        <p className="text-immoo-gray mb-4">Crée un contrat en quelques étapes simples.</p>
        <div className="flex items-center gap-4 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${i === step ? 'bg-immoo-gold' : 'bg-immoo-gray/40'}`}>{i + 1}</div>
              <span className={`text-sm ${i === step ? 'font-bold text-immoo-navy' : 'text-immoo-gray'}`}>{s}</span>
              {i < steps.length - 1 && <span className="w-8 h-1 bg-immoo-pearl rounded" />}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block font-medium">Type de contrat</label>
            <div className="flex gap-4">
              <Button type="button" variant={contractType === "bail" ? "default" : "outline"} onClick={() => setContractType("bail")}>Contrat de location</Button>
              <Button type="button" variant={contractType === "autre" ? "default" : "outline"} onClick={() => setContractType("autre")}>Autre contrat</Button>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="button" onClick={handleNext} disabled={!contractType}>Suivant</Button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            {contractType === "bail" ? (
              <>
                <label className="block font-medium">Sélectionner un bail</label>
                <select value={selectedLeaseId} onChange={e => setSelectedLeaseId(e.target.value)} className="input w-full">
                  <option value="">-- Choisir un bail --</option>
                  {leases.map(lease => (
                    <option key={lease.id} value={lease.id}>
                      {lease.properties?.title || "Propriété"} - {lease.tenants?.first_name} {lease.tenants?.last_name}
                    </option>
                  ))}
                </select>
                <div className="mt-4">
                  <label className="block font-medium">Titre du contrat</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="input w-full" />
                </div>
              </>
            ) : (
              <>
                <label className="block font-medium">Sélectionner le locataire</label>
                <select value={selectedTenantId} onChange={e => setSelectedTenantId(e.target.value)} className="input w-full">
                  <option value="">-- Choisir un locataire --</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName} ({tenant.email})
                    </option>
                  ))}
                </select>
                <div className="mt-4">
                  <label className="block font-medium">Titre du contrat</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="input w-full" />
                </div>
                <div className="mt-4">
                  <label className="block font-medium">Type de contrat</label>
                  <input value={type} onChange={e => setType(e.target.value)} required className="input w-full" placeholder="bail, prestation, etc." />
                </div>
              </>
            )}
            <div className="mt-4">
              <label className="block font-medium">Pays/Législation applicable</label>
              <input value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} required className="input w-full" placeholder="Côte d'Ivoire, France, Sénégal..." />
            </div>
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack}>Précédent</Button>
              <Button type="button" onClick={handleNext} disabled={contractType === "bail" ? !selectedLeaseId : !selectedTenantId || !type || !title || !jurisdiction}>Suivant</Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold mb-2">Aperçu du contrat généré</h3>
              {loading ? (
                <div>Génération du contrat...</div>
              ) : contract ? (
                <pre className="bg-gray-100 p-4 rounded text-xs whitespace-pre-wrap max-h-96 overflow-auto">{contract.content}</pre>
              ) : (
                <div className="text-immoo-gray">Clique sur "Générer le contrat" pour voir l'aperçu.</div>
              )}
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack}>Précédent</Button>
              <Button type="submit" disabled={loading || contract}>Générer le contrat</Button>
            </div>
            {contract && (
              <div className="flex justify-end mt-4">
                <Button type="button" onClick={() => navigate(`/agencies/${agencyId}/contracts`)}>Terminer</Button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
} 