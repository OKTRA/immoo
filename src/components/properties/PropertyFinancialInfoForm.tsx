
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/assets/types";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface PropertyFinancialInfoFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function PropertyFinancialInfoForm({ initialData, onChange, onNext, onBack }: PropertyFinancialInfoFormProps) {
  const { t } = useTranslation();
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

  const getPaymentFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      daily: t('agencyDashboard.pages.createProperty.daily'),
      weekly: t('agencyDashboard.pages.createProperty.weekly'),
      monthly: t('agencyDashboard.pages.createProperty.monthly'),
      quarterly: t('agencyDashboard.pages.createProperty.quarterly'),
      biannual: t('agencyDashboard.pages.createProperty.biannual'),
      annual: t('agencyDashboard.pages.createProperty.annual')
    };
    return labels[frequency] || t('agencyDashboard.pages.createProperty.monthly');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t('agencyDashboard.pages.createProperty.price')}</Label>
          <div className="relative">
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              placeholder={t('agencyDashboard.pages.createProperty.price')}
              className="pl-14"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentFrequency">{t('agencyDashboard.pages.createProperty.paymentFrequency')}</Label>
          <Select name="paymentFrequency" value={formData.paymentFrequency} onValueChange={(value) => handleSelectChange("paymentFrequency", value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('agencyDashboard.pages.createProperty.frequency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{t('agencyDashboard.pages.createProperty.daily')}</SelectItem>
              <SelectItem value="weekly">{t('agencyDashboard.pages.createProperty.weekly')}</SelectItem>
              <SelectItem value="monthly">{t('agencyDashboard.pages.createProperty.monthly')}</SelectItem>
              <SelectItem value="quarterly">{t('agencyDashboard.pages.createProperty.quarterly')}</SelectItem>
              <SelectItem value="biannual">{t('agencyDashboard.pages.createProperty.biannual')}</SelectItem>
              <SelectItem value="annual">{t('agencyDashboard.pages.createProperty.annual')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="securityDeposit">{t('agencyDashboard.pages.createProperty.securityDeposit')}</Label>
        <div className="relative">
          <Input
            id="securityDeposit"
            name="securityDeposit"
            type="number"
            min="0"
            placeholder={t('agencyDashboard.pages.createProperty.securityDepositAmount')}
            className="pl-14"
            value={formData.securityDeposit}
            onChange={handleChange}
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t('agencyDashboard.pages.createProperty.securityDepositDescription')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agencyFees">{t('agencyDashboard.pages.createProperty.agencyFees')}</Label>
          <div className="relative">
            <Input
              id="agencyFees"
              name="agencyFees"
              type="number"
              min="0"
              placeholder={t('agencyDashboard.pages.createProperty.agencyFees')}
              className="pl-14"
              value={formData.agencyFees}
              onChange={handleChange}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commissionRate">{t('agencyDashboard.pages.createProperty.commissionRate')} (%)</Label>
          <div className="relative">
            <Input
              id="commissionRate"
              name="commissionRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder={t('agencyDashboard.pages.createProperty.commissionRate')}
              className="pr-8"
              value={formData.commissionRate}
              onChange={handleChange}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm font-medium mb-2">{t('agencyDashboard.pages.createProperty.financialSummary')}</p>
        <div className="bg-muted p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">{t('agencyDashboard.pages.createProperty.price')}</span>
            <span className="font-medium">{parseFloat(formData.price) || 0} FCFA ({getPaymentFrequencyLabel(formData.paymentFrequency)})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">{t('agencyDashboard.pages.createProperty.securityDeposit')}</span>
            <span className="font-medium">{parseFloat(formData.securityDeposit) || 0} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">{t('agencyDashboard.pages.createProperty.agencyFees')}</span>
            <span className="font-medium">{parseFloat(formData.agencyFees) || 0} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">{t('agencyDashboard.pages.createProperty.commission')}</span>
            <span className="font-medium">{parseFloat(formData.commissionRate) || 0} %</span>
          </div>
        </div>
      </div>

      {(onNext || onBack) && (
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              {t('agencyDashboard.pages.createProperty.back')}
            </Button>
          )}
          {onNext && (
            <Button type="button" onClick={onNext} className="ml-auto">
              {t('agencyDashboard.pages.createProperty.next')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
