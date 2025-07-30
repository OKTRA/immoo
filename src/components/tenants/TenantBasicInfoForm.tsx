import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Briefcase, GraduationCap, Building, Home, Car, ShoppingBag } from "lucide-react";

interface TenantBasicInfoFormProps {
  initialData: any;
  onChange: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const EMPLOYMENT_STATUSES = [
  { value: "employed", label: "Salarié", icon: Building, color: "bg-blue-500" },
  { value: "self-employed", label: "Indépendant", icon: Briefcase, color: "bg-green-500" },
  { value: "student", label: "Étudiant", icon: GraduationCap, color: "bg-purple-500" },
  { value: "retired", label: "Retraité", icon: Home, color: "bg-orange-500" },
  { value: "unemployed", label: "Sans emploi", icon: User, color: "bg-gray-500" },
  { value: "other", label: "Autre", icon: User, color: "bg-yellow-500" },
];

const PROFESSIONS = [
  "Ingénieur", "Médecin", "Avocat", "Enseignant", "Comptable", "Architecte",
  "Infirmier", "Pharmacien", "Vétérinaire", "Dentiste", "Psychologue",
  "Designer", "Développeur", "Chef de projet", "Commercial", "Vendeur",
  "Chauffeur", "Cuisinier", "Électricien", "Plombier", "Mécanicien",
  "Agriculteur", "Éleveur", "Pêcheur", "Mineur", "Ouvrier", "Étudiant",
  "Retraité", "Sans profession", "Autre"
];

export default function TenantBasicInfoForm({ initialData, onChange, onNext, onBack }: TenantBasicInfoFormProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    profession: initialData.profession || "",
    employmentStatus: initialData.employmentStatus || "",
  });

  const isMounted = useRef(false);
  const lastUpdateRef = useRef<any>({});

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const hasChanged = Object.keys(formData).some(
      key => formData[key as keyof typeof formData] !== lastUpdateRef.current[key]
    );

    if (hasChanged) {
      lastUpdateRef.current = formData;
      onChange(formData);
    }
  }, [formData, onChange]);

  useEffect(() => {
    if (isMounted.current && initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        firstName: initialData.firstName || prev.firstName,
        lastName: initialData.lastName || prev.lastName,
        profession: initialData.profession || prev.profession,
        employmentStatus: initialData.employmentStatus || prev.employmentStatus,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Informations personnelles
            </h3>
            <p className="text-sm text-muted-foreground">
              Renseignez les informations de base du locataire
            </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-sm font-medium">
                Prénom *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Ex: Jean"
                value={formData.firstName}
                onChange={handleChange}
                className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Nom de famille *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Ex: Dupont"
                value={formData.lastName}
                onChange={handleChange}
                className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Status */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Statut professionnel</h3>
            <p className="text-sm text-muted-foreground">
              Sélectionnez le statut professionnel du locataire
            </p>
          </div>

          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {EMPLOYMENT_STATUSES.map((status) => {
              const Icon = status.icon;
              return (
                <div
                  key={status.value}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:scale-105 ${
                    formData.employmentStatus === status.value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-muted bg-background/50 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => handleSelectChange("employmentStatus", status.value)}
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className={`w-12 h-12 rounded-full ${status.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  {formData.employmentStatus === status.value && (
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

      {/* Profession */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" />
              Profession
            </h3>
            <p className="text-sm text-muted-foreground">
              Indiquez la profession du locataire (optionnel)
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="profession" className="text-sm font-medium">
              Profession
            </Label>
            <Select 
              value={formData.profession} 
              onValueChange={(value) => handleSelectChange("profession", value)}
            >
              <SelectTrigger className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20">
                <SelectValue placeholder="Sélectionnez une profession" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Cette information aide à évaluer la solvabilité du locataire
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {(formData.firstName || formData.lastName) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary flex items-center">
                <User className="mr-2 h-4 w-4" />
                Résumé des informations
              </h4>
              <div className="grid gap-3 text-sm">
                {(formData.firstName || formData.lastName) && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nom complet :</span>
                    <span className="font-medium">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                )}
                {formData.employmentStatus && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Statut professionnel :</span>
                    <span className="font-medium">
                      {EMPLOYMENT_STATUSES.find(s => s.value === formData.employmentStatus)?.label}
                    </span>
                  </div>
                )}
                {formData.profession && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Profession :</span>
                    <span className="font-medium">{formData.profession}</span>
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
