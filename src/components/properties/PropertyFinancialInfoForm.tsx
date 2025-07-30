
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
import { DollarSign, Calendar, Shield, Building2, Percent } from "lucide-react";

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

export default function PropertyFinancialInfoForm({ initialData, onChange, onNext, onBack }: PropertyFinancialInfoFormProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    price: initialData.price?.toString() || "",
    paymentFrequency: initialData.paymentFrequency || "monthly",
    securityDeposit: initialData.securityDeposit?.toString() || "",
    agencyFees: initialData.agencyFees?.toString() || "",
    commissionRate: initialData.commissionRate?.toString() || "",
  });

  useEffect(() => {
    onChange({
      price: parseFloat(formData.price) || 0,
      paymentFrequency: formData.paymentFrequency as "daily" | "weekly" | "monthly" | "quarterly" | "biannual" | "annual",
      securityDeposit: formData.securityDeposit === "" ? undefined : parseFloat(formData.securityDeposit) || undefined,
      agencyFees: formData.agencyFees === "" ? undefined : parseFloat(formData.agencyFees) || undefined,
      commissionRate: formData.commissionRate === "" ? undefined : parseFloat(formData.commissionRate) || undefined,
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

  return (
    <div className="space-y-8">
      {/* Price and Payment Frequency */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              Prix et conditions de paiement
            </h3>
            <p className="text-sm text-muted-foreground">
              Définissez le prix de location et la fréquence de paiement
            </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-medium">
                Prix de location *
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  name="price"
                  type="text"
                  placeholder="Ex: 150 000"
                  className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pl-16"
                  value={formatCurrency(formData.price)}
                  onChange={(e) => {
                    const rawValue = parseCurrency(e.target.value);
                    setFormData(prev => ({ ...prev, price: rawValue }));
                  }}
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Prix par période de paiement
              </p>
            </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Security Deposit */}
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
                className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pl-16"
                value={formatCurrency(formData.securityDeposit)}
                onChange={(e) => {
                  const rawValue = parseCurrency(e.target.value);
                  setFormData(prev => ({ ...prev, securityDeposit: rawValue }));
                }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                <span className="text-sm font-medium text-muted-foreground">FCFA</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Montant remboursable à la fin du bail
            </p>
          </div>
        </CardContent>
      </Card>

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
                  className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pl-16"
                  value={formatCurrency(formData.agencyFees)}
                  onChange={(e) => {
                    const rawValue = parseCurrency(e.target.value);
                    setFormData(prev => ({ ...prev, agencyFees: rawValue }));
                  }}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Frais fixes de l'agence
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="commissionRate" className="text-sm font-medium">
                Taux de commission (%)
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
                  className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 pr-12"
                  value={formData.commissionRate}
                  onChange={handleChange}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Pourcentage de commission sur le loyer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    {formatCurrency(formData.price)} FCFA / {PAYMENT_FREQUENCIES.find(f => f.value === formData.paymentFrequency)?.label.toLowerCase()}
                  </span>
                </div>
                {formData.securityDeposit && (
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
            <Button type="button" onClick={onNext} className="ml-auto">
              Continuer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
