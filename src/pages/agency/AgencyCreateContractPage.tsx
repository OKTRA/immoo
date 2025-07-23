import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { generateContract } from "@/services/contracts/contractService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLeasesByAgencyId } from "@/services/tenant/lease/getLeases";
import { getTenantsByAgencyId } from "@/services/tenant/tenantPropertyQueries";
import { 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Edit3,
  Save,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import ContractWysiwygEditor from "@/components/contracts/ContractWysiwygEditor";
import { formatContractText } from "@/utils/contractFormatting";
import { 
  createContract, 
  getAvailableLeasesForAssignment,
  assignContractToLease
} from "@/services/contracts/contractWysiwygService";
import { supabase } from "@/lib/supabase";

const steps = [
  "Type de contrat",
  "Parties & Détails", 
  "Génération",
  "Édition & Finalisation"
];

export default function AgencyCreateContractPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [contractType, setContractType] = useState("bail");
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Côte d'Ivoire");
  const [contractDataMode, setContractDataMode] = useState("tenant"); // "tenant" ou "manual"
  const [manualParties, setManualParties] = useState("");
  const [manualDetails, setManualDetails] = useState("");
  // Champs individuels pour remplacer le JSON
  const [clientName, setClientName] = useState("");
  const [clientFirstName, setClientFirstName] = useState(""); 
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [contractAmount, setContractAmount] = useState("");
  const [contractDuration, setContractDuration] = useState("");
  const [contractObject, setContractObject] = useState("");
  const [generatedContract, setGeneratedContract] = useState(null);
  const [finalContract, setFinalContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parties, setParties] = useState({});
  const [details, setDetails] = useState<Record<string, any>>({ agencyId });
  const [availableLeases, setAvailableLeases] = useState([]);

  // Récupérer le leaseId depuis les paramètres URL
  const queryParams = new URLSearchParams(location.search);
  const leaseIdFromUrl = queryParams.get('leaseId');

  // Charger les données initiales
  useEffect(() => {
    if (agencyId) {
      getLeasesByAgencyId(agencyId).then(({ leases }) => {
        setLeases(leases || []);
        // Pré-sélectionner le bail si fourni dans l'URL
        if (leaseIdFromUrl) {
          setSelectedLeaseId(leaseIdFromUrl);
        }
      });
      getTenantsByAgencyId(agencyId).then(({ tenants }) => setTenants(tenants || []));
      getAvailableLeasesForAssignment(agencyId).then(setAvailableLeases);
    }
  }, [agencyId, leaseIdFromUrl]);

  // Pré-remplir parties/détails si un bail est sélectionné
  useEffect(() => {
    const loadLeaseDetails = async () => {
      if (contractType === "bail" && selectedLeaseId && leases.length > 0) {
        const lease = leases.find(l => l.id === selectedLeaseId);
        if (lease) {
          setType("bail");
          setTitle(`Contrat de location - ${lease.properties?.title || "Propriété"}`);
          
          // Récupérer les informations complètes de l'agence
          let agencyData = {};
          if (lease.properties?.agency_id) {
            const { data: agency, error: agencyError } = await supabase
              .from('agencies')
              .select('id, name, email, phone, website, location, description, logo_url')
              .eq('id', lease.properties.agency_id)
              .single();
            
            if (!agencyError && agency) {
              agencyData = {
                nom: agency.name,
                email: agency.email,
                telephone: agency.phone,
                site_web: agency.website,
                adresse: agency.location,
                description: agency.description
              };
            }
          }
          
          // Informations complètes du locataire
          const tenantData = lease.tenants ? {
            nom: lease.tenants.last_name,
            prenom: lease.tenants.first_name,
            email: lease.tenants.email,
            telephone: lease.tenants.phone,
            profession: lease.tenants.profession
          } : {};
          
          // Informations complètes de la propriété
          const propertyData = lease.properties ? {
            titre: lease.properties.title,
            adresse: lease.properties.location,
            type: lease.properties.type
          } : {};
          
          setParties({
            locataire: tenantData,
            agence: agencyData,
            proprietaire: agencyData // Dans ce système, l'agence agit comme propriétaire
          });
          
          setDetails({
            ...details,
            propriete: propertyData,
            loyer_mensuel: lease.monthly_rent,
            caution: lease.security_deposit,
            date_debut: lease.start_date,
            date_fin: lease.end_date,
            jour_paiement: lease.payment_day,
            frequence_paiement: lease.payment_frequency,
            conditions_speciales: lease.special_conditions
          });
        }
      }
    };
    
    loadLeaseDetails();
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      let contractParties = parties;
      let contractDetails = details;

      // Pour les contrats "autre" en mode manuel, utiliser les données saisies manuellement
      if (contractType === "autre" && contractDataMode === "manual") {
        // Récupérer les vraies informations de l'agence
        let agencyInfo = { 
          nom: "Mon Agence", 
          email: "agence@example.com",
          telephone: "",
          site_web: "",
          adresse: ""
        };
        try {
          const { data: agency, error: agencyError } = await supabase
            .from('agencies')
            .select('name, email, phone, website, location')
            .eq('id', agencyId)
            .single();
          
          if (!agencyError && agency) {
            agencyInfo = {
              nom: agency.name,
              email: agency.email,
              telephone: agency.phone,
              site_web: agency.website,
              adresse: agency.location
            };
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des infos agence:", err);
        }

        contractParties = {
          client: {
            nom: clientName,
            prenom: clientFirstName,
            email: clientEmail,
            telephone: clientPhone
          },
          agence: agencyInfo
        };
        contractDetails = {
          objet: contractObject,
          montant: contractAmount,
          duree: contractDuration,
          type_contrat: type
        };
      }

      const result = await generateContract({
        type,
        title,
        parties: contractParties,
        details: contractDetails,
        jurisdiction,
        agency_id: agencyId,
      });
      
      setGeneratedContract(result.contract);
      toast.success("Contrat généré avec succès !");
      setStep(3); // Passer à l'étape d'édition
    } catch (err) {
      console.error("Error generating contract:", err);
      setError("Erreur lors de la génération du contrat");
      toast.error("Erreur lors de la génération du contrat");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContract = async (content: string, metadata: any) => {
    try {
      const contractData = {
        title: metadata.title || title,
        type: metadata.type || type,
        jurisdiction: metadata.jurisdiction || jurisdiction,
        content,
        parties: metadata.parties || parties,
        details: metadata.details || details,
        status: metadata.status || 'draft',
        agency_id: agencyId
      };

      const savedContract = await createContract(contractData);
      setFinalContract(savedContract);
      toast.success('Contrat sauvegardé avec succès');
      
      // Rediriger vers la liste des contrats après un délai
      setTimeout(() => {
        navigate(`/agencies/${agencyId}/contracts`);
      }, 2000);
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAssignToLease = async (contractId: string, leaseId: string) => {
    try {
      const success = await assignContractToLease(contractId, leaseId);
      if (success) {
        // Rediriger vers la liste des contrats après attribution
        setTimeout(() => {
          navigate(`/agencies/${agencyId}/contracts`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error assigning contract to lease:', error);
      toast.error("Erreur lors de l'attribution du contrat");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate(`/agencies/${agencyId}/contracts`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux contrats
        </Button>
        
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          {contractType === "bail" ? "Nouveau contrat de location" : "Nouveau contrat personnalisé"}
        </h1>
        <p className="text-gray-600 mb-6">Créez un contrat professionnel en quelques étapes simples.</p>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {steps.map((stepName, i) => (
            <div key={stepName} className="flex items-center gap-2">
              <div className={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-white transition-colors ${
                i === step ? 'bg-blue-600' : 
                i < step ? 'bg-green-600' : 'bg-gray-400'
              }`}>
                {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${
                i === step ? 'text-blue-600' : 
                i < step ? 'text-green-600' : 'text-gray-500'
              }`}>
                {stepName}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-12 h-1 rounded transition-colors ${
                  i < step ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 0: Contract Type */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Choisissez le type de contrat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={contractType === "bail" ? "default" : "outline"}
                    onClick={() => setContractType("bail")}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    Contrat de location
                  </Button>
                  <Button
                    type="button"
                    variant={contractType === "autre" ? "default" : "outline"}
                    onClick={() => setContractType("autre")}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    Autre contrat
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!contractType}>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Parties & Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Informations du contrat</h3>
              
              {contractType === "bail" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sélectionner un bail</label>
                    <select 
                      value={selectedLeaseId} 
                      onChange={e => setSelectedLeaseId(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choisir un bail --</option>
                      {leases.map(lease => (
                        <option key={lease.id} value={lease.id}>
                          {lease.properties?.title || "Propriété"} - {lease.tenants?.first_name} {lease.tenants?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Titre du contrat</label>
                    <input 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Contrat de location - Appartement 2A"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Choix du mode de saisie pour les contrats "autre" */}
                  <div>
                    <h4 className="text-md font-semibold mb-3">Mode de saisie des informations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={contractDataMode === "tenant" ? "default" : "outline"}
                        onClick={() => setContractDataMode("tenant")}
                        className="h-16 flex flex-col items-center gap-2"
                      >
                        <FileText className="h-5 w-5" />
                        <span className="text-sm text-center">Sélectionner un locataire<br />comme client</span>
                      </Button>
                      <Button
                        type="button"
                        variant={contractDataMode === "manual" ? "default" : "outline"}
                        onClick={() => setContractDataMode("manual")}
                        className="h-16 flex flex-col items-center gap-2"
                      >
                        <Edit3 className="h-5 w-5" />
                        <span className="text-sm text-center">Saisie manuelle<br />des détails</span>
                      </Button>
                    </div>
                  </div>

                  {contractDataMode === "tenant" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Sélectionner le locataire</label>
                        <select 
                          value={selectedTenantId} 
                          onChange={e => setSelectedTenantId(e.target.value)} 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Choisir un locataire --</option>
                          {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.firstName} {tenant.lastName} ({tenant.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Titre du contrat</label>
                        <input 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          required 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Contrat de prestation"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Type de contrat</label>
                        <input 
                          value={type} 
                          onChange={e => setType(e.target.value)} 
                          required 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="prestation, vente, etc."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Titre du contrat</label>
                        <input 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          required 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Contrat de prestation"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Type de contrat</label>
                        <input 
                          value={type} 
                          onChange={e => setType(e.target.value)} 
                          required 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="prestation, vente, etc."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nom du client</label>
                          <input 
                            value={clientName} 
                            onChange={e => setClientName(e.target.value)} 
                            required 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Dupont"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Prénom du client</label>
                          <input 
                            value={clientFirstName} 
                            onChange={e => setClientFirstName(e.target.value)} 
                            required 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Jean"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Email du client</label>
                          <input 
                            type="email"
                            value={clientEmail} 
                            onChange={e => setClientEmail(e.target.value)} 
                            required 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="jean.dupont@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Téléphone du client</label>
                          <input 
                            value={clientPhone} 
                            onChange={e => setClientPhone(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="07 00 00 00 00"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Objet du contrat</label>
                        <textarea 
                          value={contractObject} 
                          onChange={e => setContractObject(e.target.value)} 
                          required 
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Prestation de services immobiliers"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Montant (FCFA)</label>
                          <input 
                            type="number"
                            value={contractAmount} 
                            onChange={e => setContractAmount(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="100000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Durée</label>
                          <input 
                            value={contractDuration} 
                            onChange={e => setContractDuration(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="6 mois"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Pays/Législation applicable</label>
                <input 
                  value={jurisdiction} 
                  onChange={e => setJurisdiction(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Côte d'Ivoire, France, Sénégal..."
                />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={
                    contractType === "bail" 
                      ? !selectedLeaseId || !title || !jurisdiction 
                      : contractType === "autre" && contractDataMode === "tenant"
                        ? !selectedTenantId || !type || !title || !jurisdiction
                        : contractType === "autre" && contractDataMode === "manual"
                          ? !clientName || !clientFirstName || !clientEmail || !contractObject || !type || !title || !jurisdiction
                          : false
                  }
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Generation */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Génération du contrat</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Récapitulatif</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Type:</span> {contractType === "bail" ? "Contrat de location" : type}</div>
                  <div><span className="font-medium">Titre:</span> {title}</div>
                  <div><span className="font-medium">Juridiction:</span> {jurisdiction}</div>
                  {contractType === "bail" && selectedLeaseId && (
                    <div><span className="font-medium">Bail:</span> Sélectionné</div>
                  )}
                </div>
              </div>

              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Générer le contrat
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Editor */}
          {step === 3 && generatedContract && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Édition et finalisation</h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Contrat généré
                </Badge>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Vous pouvez maintenant modifier le contrat généré avec l'éditeur ci-dessous, puis le sauvegarder.
                </AlertDescription>
              </Alert>

              <ContractWysiwygEditor
                initialContent={generatedContract.content}
                onSave={handleSaveContract}
                onAssignToLease={handleAssignToLease}
                availableLeases={availableLeases}
                isReadOnly={false}
                showToolbar={true}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 