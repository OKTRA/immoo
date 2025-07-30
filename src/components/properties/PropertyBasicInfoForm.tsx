import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Property } from "@/assets/types";
import { Home, MapPin, Building, Bath, Coffee, ShoppingBag, Sofa, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface PropertyBasicInfoFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function PropertyBasicInfoForm({ initialData, onChange, onNext, onBack }: PropertyBasicInfoFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    location: initialData.location || "",
    description: initialData.description || "",
    type: initialData.type || "",
    propertyCategory: initialData.propertyCategory || "residence",
    bedrooms: initialData.bedrooms?.toString() || "0",
    bathrooms: initialData.bathrooms?.toString() || "0",
    kitchens: initialData.kitchens?.toString() || "0",
    shops: initialData.shops?.toString() || "0",
    livingRooms: initialData.livingRooms?.toString() || "0",
    area: initialData.area?.toString() || "",
  });

  const isMounted = useRef(false);
  const lastUpdateRef = useRef<Partial<Property>>({});

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const updatedData = {
      title: formData.title,
      location: formData.location,
      description: formData.description,
      type: formData.type,
      propertyCategory: formData.propertyCategory as "residence" | "apartment" | "commercial" | "land" | "other",
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      kitchens: parseInt(formData.kitchens) || 0,
      shops: parseInt(formData.shops) || 0,
      livingRooms: parseInt(formData.livingRooms) || 0,
      area: formData.area ? parseFloat(formData.area) : 0,
    };

    const hasChanged = Object.keys(updatedData).some(
      key => updatedData[key as keyof typeof updatedData] !== lastUpdateRef.current[key as keyof typeof updatedData]
    );

    if (hasChanged) {
      lastUpdateRef.current = updatedData;
      onChange(updatedData);
    }
  }, [formData, onChange]);

  useEffect(() => {
    if (isMounted.current && initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        location: initialData.location || prev.location,
        description: initialData.description || prev.description,
        type: initialData.type || prev.type,
        propertyCategory: initialData.propertyCategory || prev.propertyCategory,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericInputChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value.toString() }));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
          <Label htmlFor="title" className="inline-flex items-center text-base font-medium">
            <Home className="mr-2 h-4 w-4 text-muted-foreground" />
            {t('agencyDashboard.pages.createProperty.propertyTitle')}
          </Label>
          <Input
            id="title"
            name="title"
            placeholder={t('agencyDashboard.pages.createProperty.enterPropertyTitle')}
            value={formData.title}
            onChange={handleChange}
            className="border-muted bg-background/50 text-lg shadow-sm transition-all focus:border-primary"
            required
          />
        </div>

        <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
          <Label htmlFor="location" className="inline-flex items-center text-base font-medium">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            {t('agencyDashboard.pages.createProperty.addressLocation')}
          </Label>
          <Input
            id="location"
            name="location"
            placeholder={t('agencyDashboard.pages.createProperty.completeAddress')}
            value={formData.location}
            onChange={handleChange}
            className="border-muted bg-background/50 text-lg shadow-sm transition-all focus:border-primary"
            required
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/50 p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-foreground">{t('agencyDashboard.pages.createProperty.propertyType')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'apartment' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "apartment")}
          >
            <Building className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>{t('agencyDashboard.pages.createProperty.apartment')}</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'house' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "house")}
          >
            <Home className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>{t('agencyDashboard.pages.createProperty.house')}</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'villa' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "villa")}
          >
            <Home className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>{t('agencyDashboard.pages.createProperty.villa')}</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'office' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "office")}
          >
            <Building className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>{t('agencyDashboard.pages.createProperty.office')}</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'commercial' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "commercial")}
          >
            <ShoppingBag className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>{t('agencyDashboard.pages.createProperty.commercial')}</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'land' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "land")}
          >
            <Square className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>{t('agencyDashboard.pages.createProperty.land')}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/50 p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-foreground">{t('agencyDashboard.pages.createProperty.characteristics')}</h3>
        
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="inline-flex items-center">
              <Home className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('agencyDashboard.pages.createProperty.bedrooms')}
            </Label>
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.bedrooms) || 0;
                  if (currentValue > 0) {
                    handleNumericInputChange("bedrooms", currentValue - 1);
                  }
                }}
              >
                <span className="text-xl font-bold">-</span>
              </button>
              
              <span className="text-xl font-semibold w-8 text-center">{formData.bedrooms}</span>
              
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.bedrooms) || 0;
                  handleNumericInputChange("bedrooms", currentValue + 1);
                }}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="livingRooms" className="inline-flex items-center">
              <Sofa className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('agencyDashboard.pages.createProperty.livingRooms')}
            </Label>
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.livingRooms) || 0;
                  if (currentValue > 0) {
                    handleNumericInputChange("livingRooms", currentValue - 1);
                  }
                }}
              >
                <span className="text-xl font-bold">-</span>
              </button>
              
              <span className="text-xl font-semibold w-8 text-center">{formData.livingRooms}</span>
              
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.livingRooms) || 0;
                  handleNumericInputChange("livingRooms", currentValue + 1);
                }}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="inline-flex items-center">
              <Bath className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('agencyDashboard.pages.createProperty.bathrooms')}
            </Label>
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.bathrooms) || 0;
                  if (currentValue > 0) {
                    handleNumericInputChange("bathrooms", currentValue - 1);
                  }
                }}
              >
                <span className="text-xl font-bold">-</span>
              </button>
              
              <span className="text-xl font-semibold w-8 text-center">{formData.bathrooms}</span>
              
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.bathrooms) || 0;
                  handleNumericInputChange("bathrooms", currentValue + 1);
                }}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kitchens" className="inline-flex items-center">
              <Coffee className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('agencyDashboard.pages.createProperty.kitchens')}
            </Label>
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.kitchens) || 0;
                  if (currentValue > 0) {
                    handleNumericInputChange("kitchens", currentValue - 1);
                  }
                }}
              >
                <span className="text-xl font-bold">-</span>
              </button>
              
              <span className="text-xl font-semibold w-8 text-center">{formData.kitchens}</span>
              
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.kitchens) || 0;
                  handleNumericInputChange("kitchens", currentValue + 1);
                }}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shops" className="inline-flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('agencyDashboard.pages.createProperty.shops')}
            </Label>
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.shops) || 0;
                  if (currentValue > 0) {
                    handleNumericInputChange("shops", currentValue - 1);
                  }
                }}
              >
                <span className="text-xl font-bold">-</span>
              </button>
              
              <span className="text-xl font-semibold w-8 text-center">{formData.shops}</span>
              
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                onClick={() => {
                  const currentValue = parseInt(formData.shops) || 0;
                  handleNumericInputChange("shops", currentValue + 1);
                }}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
        <Label htmlFor="area" className="inline-flex items-center text-base font-medium">
          <Square className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('agencyDashboard.pages.createProperty.surface')} (m²)
        </Label>
        <Input
          id="area"
          name="area"
          type="number"
          min="0"
          placeholder={t('agencyDashboard.pages.createProperty.surfaceInM2')}
          value={formData.area === "0" ? "" : formData.area}
          onChange={handleChange}
          className="border-muted bg-background/50 text-lg shadow-sm transition-all focus:border-primary"
        />
      </div>

      <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
        <Label htmlFor="description" className="text-base font-medium">{t('agencyDashboard.pages.createProperty.description')}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t('agencyDashboard.pages.createProperty.detailedPropertyDescription')}
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="min-h-[120px] border-muted bg-background/50 text-base shadow-sm transition-all focus:border-primary"
        />
      </div>

      {onNext && (
        <div className="flex justify-end pt-4">
          <Button type="button" onClick={onNext}>
            {t('agencyDashboard.pages.createProperty.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
