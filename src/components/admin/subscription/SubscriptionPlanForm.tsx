import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, Infinity } from 'lucide-react';

interface PlanFormData {
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  maxProperties: number;
  maxAgencies: number;
  maxLeases: number;
  maxUsers: number;
  hasApiAccess: boolean;
  isActive: boolean;
}

interface SubscriptionPlanFormProps {
  formData: PlanFormData;
  setFormData: (data: PlanFormData) => void;
  isEdit?: boolean;
}

export default function SubscriptionPlanForm({ 
  formData, 
  setFormData, 
  isEdit = false 
}: SubscriptionPlanFormProps) {
  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures.length > 0 ? updatedFeatures : ['']
    });
  };

  const handleUnlimitedChange = (field: 'maxProperties' | 'maxAgencies' | 'maxLeases' | 'maxUsers', unlimited: boolean) => {
    setFormData({
      ...formData,
      [field]: unlimited ? -1 : 1
    });
  };

  const isUnlimited = (value: number) => value === -1;

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="plan-name">Nom du plan</Label>
          <Input 
            id="plan-name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Premium" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plan-price">Prix (FCFA)</Label>
          <Input 
            id="plan-price" 
            type="number" 
            value={formData.price || ''}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            min="0" 
            step="1000" 
            placeholder="15000" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="billing-cycle">Cycle de facturation</Label>
          <select 
            id="billing-cycle"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.billingCycle}
            onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
          >
            <option value="monthly">Mensuel</option>
            <option value="quarterly">Trimestriel</option>
            <option value="semestriel">Semestriel (6 mois)</option>
            <option value="yearly">Annuel</option>
            <option value="lifetime">Lifetime (À vie)</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max-properties">Propriétés max</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="unlimited-properties"
                checked={isUnlimited(formData.maxProperties)}
                onCheckedChange={(checked) => handleUnlimitedChange('maxProperties', checked as boolean)}
              />
              <Label htmlFor="unlimited-properties" className="text-sm flex items-center gap-1">
                <Infinity className="h-4 w-4" />
                Illimité
              </Label>
            </div>
            {!isUnlimited(formData.maxProperties) && (
              <Input 
                id="max-properties" 
                type="number" 
                value={formData.maxProperties || ''}
                onChange={(e) => setFormData({...formData, maxProperties: parseInt(e.target.value) || 1})}
                min="1" 
                placeholder="10" 
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="max-agencies">Agences max</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="unlimited-agencies"
                checked={isUnlimited(formData.maxAgencies)}
                onCheckedChange={(checked) => handleUnlimitedChange('maxAgencies', checked as boolean)}
              />
              <Label htmlFor="unlimited-agencies" className="text-sm flex items-center gap-1">
                <Infinity className="h-4 w-4" />
                Illimité
              </Label>
            </div>
            {!isUnlimited(formData.maxAgencies) && (
              <Input 
                id="max-agencies" 
                type="number" 
                value={formData.maxAgencies || ''}
                onChange={(e) => setFormData({...formData, maxAgencies: parseInt(e.target.value) || 1})}
                min="1" 
                placeholder="5" 
              />
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max-leases">Baux max</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="unlimited-leases"
                checked={isUnlimited(formData.maxLeases)}
                onCheckedChange={(checked) => handleUnlimitedChange('maxLeases', checked as boolean)}
              />
              <Label htmlFor="unlimited-leases" className="text-sm flex items-center gap-1">
                <Infinity className="h-4 w-4" />
                Illimité
              </Label>
            </div>
            {!isUnlimited(formData.maxLeases) && (
              <Input 
                id="max-leases" 
                type="number" 
                value={formData.maxLeases || ''}
                onChange={(e) => setFormData({...formData, maxLeases: parseInt(e.target.value) || 1})}
                min="1" 
                placeholder="20" 
              />
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max-users">Utilisateurs max</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="unlimited-users"
                checked={isUnlimited(formData.maxUsers)}
                onCheckedChange={(checked) => handleUnlimitedChange('maxUsers', checked as boolean)}
              />
              <Label htmlFor="unlimited-users" className="text-sm flex items-center gap-1">
                <Infinity className="h-4 w-4" />
                Illimité
              </Label>
            </div>
            {!isUnlimited(formData.maxUsers) && (
              <Input 
                id="max-users" 
                type="number" 
                value={formData.maxUsers || ''}
                onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value) || 1})}
                min="1" 
                placeholder="5" 
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={formData.hasApiAccess}
          onCheckedChange={(checked) => setFormData({...formData, hasApiAccess: checked})}
        />
        <Label htmlFor="api-access">Accès API</Label>
      </div>

      <div className="grid gap-2">
        <Label>Fonctionnalités</Label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input 
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              placeholder="Fonctionnalité..." 
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeFeature(index)}
              disabled={formData.features.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button 
          variant="outline" 
          onClick={handleAddFeature}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une fonctionnalité
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
        />
        <Label>Plan actif</Label>
      </div>
    </div>
  );
}
