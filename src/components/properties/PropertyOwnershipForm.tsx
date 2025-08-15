import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property, PropertyOwner } from "@/assets/types";
import { getPropertyOwners } from "@/services/property/propertyOwners";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PropertyOwnershipFormProps {
  initialData: any;
  onChange: (data: any) => void;
  onNestedChange: (parentField: string, field: string, value: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function PropertyOwnershipForm({ initialData, onChange, onNestedChange, onNext, onBack }: PropertyOwnershipFormProps) {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownershipType, setOwnershipType] = useState<'agency' | 'owner'>(
    initialData.ownerId ? 'owner' : 'agency'
  );

  // Sync ownership type when initialData changes (e.g., after edit data loads)
  useEffect(() => {
    setOwnershipType(initialData.ownerId ? 'owner' : 'agency');
  }, [initialData.ownerId]);

  // Load property owners
  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      const { owners, error } = await getPropertyOwners();
      if (error) {
        toast.error(`Erreur lors du chargement des propriétaires: ${error}`);
        console.error("Error loading property owners:", error);
      } else {
        setOwners(owners || []);
      }
      setLoading(false);
    };

    fetchOwners();
  }, []);

  // Handle ownership type change
  const handleOwnershipTypeChange = (value: 'agency' | 'owner') => {
    setOwnershipType(value);
    
    // Update the parent form with new ownership details
    if (value === 'agency') {
      onChange({ ownerId: undefined });
    } else {
      // For owner type, we don't set anything yet - will be set when specific owner is selected
    }
  };

  // Handle owner selection
  const handleOwnerSelect = (ownerId: string) => {
    onChange({ ownerId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Détails de propriété</h3>
        <p className="text-sm text-muted-foreground">
          Définissez la propriété et la gestion de ce bien immobilier.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Type de gestion</Label>
          <RadioGroup 
            value={ownershipType} 
            onValueChange={(v) => handleOwnershipTypeChange(v as 'agency' | 'owner')}
            className="flex flex-col space-y-1 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="agency" id="agency" />
              <Label htmlFor="agency" className="font-normal cursor-pointer">
                Géré par l'agence
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="owner" id="owner" />
              <Label htmlFor="owner" className="font-normal cursor-pointer">
                Propriétaire externe
              </Label>
            </div>
          </RadioGroup>
        </div>

        {ownershipType === 'owner' && (
          <div className="space-y-2">
            <Label htmlFor="owner">Propriétaire</Label>
            <Select 
              value={initialData.ownerId || ""} 
              onValueChange={handleOwnerSelect}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le propriétaire" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name} {owner.companyName ? `(${owner.companyName})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loading && <p className="text-sm text-muted-foreground">Chargement des propriétaires...</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="commission">{(initialData.listingType || ((initialData.features || []).includes('for_sale') ? 'sale' : 'rent')) === 'sale' ? 'Taux de commission vente (%)' : 'Taux de commission (%)'}</Label>
          <Input
            id="commission"
            type="number"
            value={initialData.commissionRate || ""}
            onChange={(e) => onChange({ commissionRate: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 5.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agencyFees">Frais d'agence (€)</Label>
          <Input
            id="agencyFees"
            type="number"
            value={initialData.agencyFees || ""}
            onChange={(e) => onChange({ agencyFees: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 1000"
          />
        </div>

        {/* Masquer les champs propres à la location quand c'est une vente */}
        {((initialData.listingType || ((initialData.features || []).includes('for_sale') ? 'sale' : 'rent')) !== 'sale') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Fréquence de paiement</Label>
              <Select 
                value={initialData.paymentFrequency || ""} 
                onValueChange={(value) => onChange({ paymentFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="biannual">Semestriel</SelectItem>
                  <SelectItem value="annual">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Dépôt de garantie (€)</Label>
              <Input
                id="securityDeposit"
                type="number"
                value={initialData.securityDeposit || ""}
                onChange={(e) => onChange({ securityDeposit: parseFloat(e.target.value) || 0 })}
                placeholder="ex: 1000"
              />
            </div>
          </>
        )}

        {/* Conditions de vente si mode Vente */}
        {((initialData.listingType || ((initialData.features || []).includes('for_sale') ? 'sale' : 'rent')) === 'sale') && (
          <div className="space-y-2">
            <Label htmlFor="saleTerms">Conditions de vente (optionnel)</Label>
            <Input
              id="saleTerms"
              type="text"
              value={initialData.saleTerms || ''}
              onChange={(e) => onChange({ saleTerms: e.target.value })}
              placeholder="Délai de signature, conditions suspensives, frais à charge, etc."
            />
          </div>
        )}
      </div>

      {(onNext || onBack) && (
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Retour
            </Button>
          )}
          {onNext && (
            <Button type="button" onClick={onNext} className="ml-auto">
              Suivant
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
