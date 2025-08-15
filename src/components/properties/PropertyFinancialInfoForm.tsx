
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/assets/types";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { DollarSign, Calendar, Shield, Building2, Percent, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PropertyFinancialInfoFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const PAYMENT_FREQUENCIES = [
  { value: "daily", label: "Quotidien", icon: "📅" },
  { value: "weekly", label: "Hebdomadaire", icon: "📆" },
  { value: "monthly", label: "Mensuel", icon: "📅" },
  { value: "quarterly", label: "Trimestriel", icon: "📊" },
  { value: "biannual", label: "Semestriel", icon: "📈" },
  { value: "annual", label: "Annuel", icon: "📅" },
];

interface FormErrors {
  price?: string;
  securityDeposit?: string;
  agencyFees?: string;
  commissionRate?: string;
}

export default function PropertyFinancialInfoForm({ initialData, onChange, onNext, onBack }: PropertyFinancialInfoFormProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    price: initialData.price?.toString() || "",
    paymentFrequency: initialData.paymentFrequency || "monthly",
    securityDeposit: initialData.securityDeposit?.toString() || "",
    agencyFees: initialData.agencyFees?.toString() || "",
    commissionRate: initialData.commissionRate?.toString() || "",
    listingType: (initialData as any).listingType || ((initialData.features || []).includes('for_sale') ? 'sale' : 'rent')
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Sync when initialData updates (e.g., after loading in edit mode)
  useEffect(() => {
    setFormData({
      price: initialData.price?.toString() || "",
      paymentFrequency: initialData.paymentFrequency || "monthly",
      securityDeposit: initialData.securityDeposit?.toString() || "",
      agencyFees: initialData.agencyFees?.toString() || "",
      commissionRate: initialData.commissionRate?.toString() || "",
      listingType: (initialData as any).listingType || ((initialData.features || []).includes('for_sale') ? 'sale' : 'rent')
    });
  }, [initialData.price, initialData.paymentFrequency, initialData.securityDeposit, initialData.agencyFees, initialData.commissionRate, (initialData as any).listingType]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate price
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Le prix de location est requis et doit être supérieur à 0";
    }

    // Validate security deposit (optional but must be positive if provided)
    if (formData.securityDeposit && parseFloat(formData.securityDeposit) < 0) {
      newErrors.securityDeposit = "Le dépôt de garantie doit être positif";
    }

    // Validate agency fees (optional but must be positive if provided)
    if (formData.agencyFees && parseFloat(formData.agencyFees) < 0) {
      newErrors.agencyFees = "Les frais d'agence doivent être positifs";
    }

    // Validate commission rate (optional but must be between 0 and 100 if provided)
    if (formData.commissionRate) {
      const rate = parseFloat(formData.commissionRate);
      if (rate < 0 || rate > 100) {
        newErrors.commissionRate = "Le taux de commission doit être entre 0 et 100%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Clear errors when form data changes
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }

    onChange({
      price: parseFloat(formData.price) || 0,
      paymentFrequency: formData.paymentFrequency as "daily" | "weekly" | "monthly" | "quarterly" | "biannual" | "annual",
      securityDeposit: formData.securityDeposit === "" ? undefined : parseFloat(formData.securityDeposit) || undefined,
      agencyFees: formData.agencyFees === "" ? undefined : parseFloat(formData.agencyFees) || undefined,
      commissionRate: formData.commissionRate === "" ? undefined : parseFloat(formData.commissionRate) || undefined,
      listingType: (formData as any).listingType
    });
  }, [formData, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('fr-FR');
  };

  const parseCurrency = (value: string) => {
    return value.replace(/\s/g, '').replace(/[^\d.-]/g, '');
  };

  const handleNext = () => {
    if (validateForm() && onNext) {
      onNext();
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-8">
      {/* Listing Type Toggle */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              Type d'annonce
            </h3>
            <p className="text-sm text-muted-foreground">
              Choisissez si ce bien est proposé à la location ou à la vente
            </p>
          </div>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Button
              type="button"
              variant={formData.listingType === 'rent' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, listingType: 'rent' }))}
            >
              Location
            </Button>
            <Button
              type="button"
              variant={formData.listingType === 'sale' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, listingType: 'sale' }))}
            >
              Vente
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Price and Payment Frequency */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              Prix et conditions de paiement
            </h3>
              <p className="text-sm text-muted-foreground">
                {formData.listingType === 'sale' ? 'Définissez le prix de vente' : 'Définissez le prix de location et la fréquence de paiement'}
              </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-medium">
                {formData.listingType === 'sale' ? 'Prix de vente *' : 'Prix de location *'}
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  name="price"
                  type="text"
                  placeholder="Ex: 150 000"
                  className={`h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pl-16 ${
                    errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  value={formatCurrency(formData.price)}
                  onChange={(e) => {
                    const rawValue = parseCurrency(e.target.value);
                    setFormData(prev => ({ ...prev, price: rawValue }));
                  }}
                  required
                  aria-describedby={errors.price ? "price-error" : undefined}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                </div>
              </div>
              {errors.price && (
                <div id="price-error" className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.price}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Prix par période de paiement
              </p>
            </div>

            {formData.listingType !== 'sale' && (
            <div className="space-y-3">
              <Label htmlFor="paymentFrequency" className="text-sm font-medium">
                Fréquence de paiement *
              </Label>
              <Select 
                name="paymentFrequency" 
                value={formData.paymentFrequency} 
                onValueChange={(value) => handleSelectChange("paymentFrequency", value)}
              >
                <SelectTrigger className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20">
                  <SelectValue placeholder="Sélectionnez la fréquence" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_FREQUENCIES.map((frequency) => (
                    <SelectItem key={frequency.value} value={frequency.value}>
                      <div className="flex items-center space-x-2">
                        <span>{frequency.icon}</span>
                        <span>{frequency.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Fréquence à laquelle le loyer doit être payé
              </p>
            </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Deposit - hidden for sale listing */}
      {formData.listingType !== 'sale' && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Dépôt de garantie
              </h3>
              <p className="text-sm text-muted-foreground">
                Montant du dépôt de garantie (optionnel)
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="securityDeposit" className="text-sm font-medium">
                Dépôt de garantie
              </Label>
              <div className="relative">
                <Input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="text"
                  placeholder="Ex: 100 000"
                  className={`h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pl-16 ${
                    errors.securityDeposit ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  value={formatCurrency(formData.securityDeposit)}
                  onChange={(e) => {
                    const rawValue = parseCurrency(e.target.value);
                    setFormData(prev => ({ ...prev, securityDeposit: rawValue }));
                  }}
                  aria-describedby={errors.securityDeposit ? "securityDeposit-error" : undefined}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                </div>
              </div>
              {errors.securityDeposit && (
                <div id="securityDeposit-error" className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.securityDeposit}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Montant remboursable à la fin du bail
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agency Fees and Commission */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary" />
              Frais d'agence
            </h3>
            <p className="text-sm text-muted-foreground">
              Frais et commission de l'agence (optionnel)
            </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-3">
              <Label htmlFor="agencyFees" className="text-sm font-medium">
                Frais d'agence
              </Label>
              <div className="relative">
                <Input
                  id="agencyFees"
                  name="agencyFees"
                  type="text"
                  placeholder="Ex: 50 000"
                  className={`h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pl-16 ${
                    errors.agencyFees ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  value={formatCurrency(formData.agencyFees)}
                  onChange={(e) => {
                    const rawValue = parseCurrency(e.target.value);
                    setFormData(prev => ({ ...prev, agencyFees: rawValue }));
                  }}
                  aria-describedby={errors.agencyFees ? "agencyFees-error" : undefined}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                </div>
              </div>
              {errors.agencyFees && (
                <div id="agencyFees-error" className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.agencyFees}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Frais fixes de l'agence
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="commissionRate" className="text-sm font-medium">
                {formData.listingType === 'sale' ? 'Taux de commission vente (%)' : 'Taux de commission (%)'}
              </Label>
              <div className="relative">
                <Input
                  id="commissionRate"
                  name="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Ex: 10"
                  className={`h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pr-12 ${
                    errors.commissionRate ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  value={formData.commissionRate}
                  onChange={handleChange}
                  aria-describedby={errors.commissionRate ? "commissionRate-error" : undefined}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              {errors.commissionRate && (
                <div id="commissionRate-error" className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.commissionRate}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.listingType === 'sale' ? 'Pourcentage de commission sur le prix de vente' : 'Pourcentage de commission sur le loyer'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Summary */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez corriger les erreurs ci-dessus avant de continuer.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      {formData.price && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Résumé financier
              </h4>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prix de location :</span>
                  <span className="font-medium">
                    {formatCurrency(formData.price)} FCFA {formData.listingType === 'sale' ? '' : `/ ${PAYMENT_FREQUENCIES.find(f => f.value === formData.paymentFrequency)?.label.toLowerCase()}`}
                  </span>
                </div>
                {formData.listingType !== 'sale' && formData.securityDeposit && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dépôt de garantie :</span>
                    <span className="font-medium">{formatCurrency(formData.securityDeposit)} FCFA</span>
                  </div>
                )}
                {formData.agencyFees && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Frais d'agence :</span>
                    <span className="font-medium">{formatCurrency(formData.agencyFees)} FCFA</span>
                  </div>
                )}
                {formData.commissionRate && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Commission :</span>
                    <span className="font-medium">{formData.commissionRate}%</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      {(onNext || onBack) && (
        <div className="flex justify-between items-center pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Précédent
            </Button>
          )}
          {onNext && (
            <Button 
              type="button" 
              onClick={handleNext} 
              className="ml-auto"
              disabled={hasErrors}
            >
              Continuer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
