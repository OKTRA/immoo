import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Property } from "@/assets/types";
import { Home, MapPin, Building, Bath, Coffee, ShoppingBag, Sofa, Square, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface PropertyBasicInfoFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Appartement', icon: Building, color: 'bg-blue-500' },
  { id: 'house', label: 'Maison', icon: Home, color: 'bg-green-500' },
  { id: 'villa', label: 'Villa', icon: Home, color: 'bg-purple-500' },
  { id: 'office', label: 'Bureau', icon: Building, color: 'bg-orange-500' },
  { id: 'commercial', label: 'Commercial', icon: ShoppingBag, color: 'bg-red-500' },
  { id: 'land', label: 'Terrain', icon: Square, color: 'bg-yellow-500' },
];

export default function PropertyBasicInfoForm({ initialData, onChange, onNext, onBack }: PropertyBasicInfoFormProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
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
    if (!initialData) return;
    setFormData(prev => ({
      ...prev,
      title: initialData.title || "",
      location: initialData.location || "",
      description: initialData.description || "",
      type: initialData.type || "",
      propertyCategory: initialData.propertyCategory || "residence",
      bedrooms: initialData.bedrooms?.toString() || prev.bedrooms,
      bathrooms: initialData.bathrooms?.toString() || prev.bathrooms,
      kitchens: initialData.kitchens?.toString() || prev.kitchens,
      shops: initialData.shops?.toString() || prev.shops,
      livingRooms: initialData.livingRooms?.toString() || prev.livingRooms,
      area: initialData.area?.toString() || prev.area,
    }));
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

  const CounterButton = ({ 
    name, 
    label, 
    icon: Icon, 
    value, 
    onChange 
  }: { 
    name: string; 
    label: string; 
    icon: any; 
    value: string; 
    onChange: (name: string, value: number) => void; 
  }) => (
    <div className="space-y-3">
      <Label className="flex items-center text-sm font-medium text-muted-foreground">
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Label>
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => {
            const currentValue = parseInt(value) || 0;
            if (currentValue > 0) {
              onChange(name, currentValue - 1);
            }
          }}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="text-xl font-bold min-w-[2rem] text-center">{value}</span>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => {
            const currentValue = parseInt(value) || 0;
            onChange(name, currentValue + 1);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Home className="mr-2 h-5 w-5 text-primary" />
              Informations générales
            </h3>
            <p className="text-sm text-muted-foreground">
              Renseignez les informations de base de votre propriété
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Titre de la propriété *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Appartement moderne au centre-ville"
                value={formData.title}
                onChange={handleChange}
                className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Adresse complète *
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="Ex: 123 Rue de la Paix, Bamako, Mali"
                value={formData.location}
                onChange={handleChange}
                className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Type Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Type de propriété</h3>
            <p className="text-sm text-muted-foreground">
              Sélectionnez le type de propriété qui correspond le mieux
            </p>
          </div>

          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {PROPERTY_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:scale-105 ${
                    formData.type === type.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-muted bg-background/50 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => handleSelectChange("type", type.id)}
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  {formData.type === type.id && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                      ✓
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Characteristics Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Caractéristiques</h3>
            <p className="text-sm text-muted-foreground">
              Définissez les caractéristiques principales de votre propriété
            </p>
          </div>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-5'}`}>
            <CounterButton
              name="bedrooms"
              label="Chambres"
              icon={Home}
              value={formData.bedrooms}
              onChange={handleNumericInputChange}
            />
            <CounterButton
              name="livingRooms"
              label="Salons"
              icon={Sofa}
              value={formData.livingRooms}
              onChange={handleNumericInputChange}
            />
            <CounterButton
              name="bathrooms"
              label="Salles de bain"
              icon={Bath}
              value={formData.bathrooms}
              onChange={handleNumericInputChange}
            />
            <CounterButton
              name="kitchens"
              label="Cuisines"
              icon={Coffee}
              value={formData.kitchens}
              onChange={handleNumericInputChange}
            />
            <CounterButton
              name="shops"
              label="Magasins"
              icon={ShoppingBag}
              value={formData.shops}
              onChange={handleNumericInputChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Surface Area */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium flex items-center">
              <Square className="mr-2 h-4 w-4 text-muted-foreground" />
              Surface (m²)
            </Label>
            <Input
              id="area"
              name="area"
              type="number"
              min="0"
              placeholder="Ex: 120"
              value={formData.area === "0" ? "" : formData.area}
              onChange={handleChange}
              className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Description Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description détaillée
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez votre propriété en détail : équipements, avantages, environnement, etc."
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="min-h-[120px] text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Une description détaillée aide les locataires à mieux comprendre votre propriété
            </p>
          </div>
        </CardContent>
      </Card>

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
