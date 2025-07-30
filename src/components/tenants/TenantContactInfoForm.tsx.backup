import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Mail, Phone, User, Heart, Shield, AlertTriangle } from "lucide-react";

interface TenantContactInfoFormProps {
  initialData: any;
  onChange: (data: any) => void;
  onNestedChange: (parentField: string, field: string, value: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const RELATIONSHIPS = [
  "Conjoint(e)", "Parent", "Enfant", "Frère/Sœur", "Ami(e)", "Collègue", "Autre"
];

export default function TenantContactInfoForm({ 
  initialData, 
  onChange, 
  onNestedChange,
  onNext, 
  onBack 
}: TenantContactInfoFormProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    email: initialData.email || "",
    phone: initialData.phone || "",
    emergencyContact: {
      name: initialData.emergencyContact?.name || "",
      phone: initialData.emergencyContact?.phone || "",
      relationship: initialData.emergencyContact?.relationship || "",
    },
  });

  const isMounted = useRef(false);
  const lastUpdateRef = useRef<any>({});

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const hasChanged = Object.keys(formData).some(
      key => {
        if (key === 'emergencyContact') {
          return JSON.stringify(formData[key]) !== JSON.stringify(lastUpdateRef.current[key]);
        }
        return formData[key as keyof typeof formData] !== lastUpdateRef.current[key];
      }
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
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone,
        emergencyContact: {
          name: initialData.emergencyContact?.name || prev.emergencyContact.name,
          phone: initialData.emergencyContact?.phone || prev.emergencyContact.phone,
          relationship: initialData.emergencyContact?.relationship || prev.emergencyContact.relationship,
        },
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
    onNestedChange('emergencyContact', field, value);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  };

  const isEmailValid = formData.email ? validateEmail(formData.email) : true;
  const isPhoneValid = formData.phone ? validatePhone(formData.phone) : true;

  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Mail className="mr-2 h-5 w-5 text-primary" />
              Coordonnées principales
            </h3>
            <p className="text-sm text-muted-foreground">
              Renseignez les coordonnées principales du locataire
            </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ex: jean.dupont@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 ${
                    formData.email && !isEmailValid ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  required
                />
                {formData.email && !isEmailValid && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {formData.email && !isEmailValid && (
                <p className="text-xs text-red-500">
                  Veuillez entrer une adresse email valide
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-medium">
                Numéro de téléphone *
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Ex: +223 12345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20 ${
                    formData.phone && !isPhoneValid ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  required
                />
                {formData.phone && !isPhoneValid && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {formData.phone && !isPhoneValid && (
                <p className="text-xs text-red-500">
                  Veuillez entrer un numéro de téléphone valide
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Heart className="mr-2 h-5 w-5 text-primary" />
              Contact d'urgence
            </h3>
            <p className="text-sm text-muted-foreground">
              Personne à contacter en cas d'urgence (optionnel)
            </p>
          </div>

          <div className="space-y-6">
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="space-y-3">
                <Label htmlFor="emergencyName" className="text-sm font-medium">
                  Nom du contact d'urgence
                </Label>
                <Input
                  id="emergencyName"
                  name="emergencyName"
                  placeholder="Ex: Marie Dupont"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleEmergencyContactChange("name", e.target.value)}
                  className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="emergencyPhone" className="text-sm font-medium">
                  Téléphone du contact d'urgence
                </Label>
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  placeholder="Ex: +223 87654321"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleEmergencyContactChange("phone", e.target.value)}
                  className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="emergencyRelationship" className="text-sm font-medium">
                Relation avec le locataire
              </Label>
              <Select 
                value={formData.emergencyContact.relationship} 
                onValueChange={(value) => handleEmergencyContactChange("relationship", value)}
              >
                <SelectTrigger className="h-12 text-base border-muted bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary/20">
                  <SelectValue placeholder="Sélectionnez la relation" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((relationship) => (
                    <SelectItem key={relationship} value={relationship}>
                      {relationship}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Summary */}
      {(formData.email || formData.phone || formData.emergencyContact.name) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Résumé des contacts
              </h4>
              <div className="grid gap-3 text-sm">
                {formData.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email :</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Téléphone :</span>
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                )}
                {formData.emergencyContact.name && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Contact d'urgence :</span>
                    <span className="font-medium">
                      {formData.emergencyContact.name}
                      {formData.emergencyContact.relationship && ` (${formData.emergencyContact.relationship})`}
                    </span>
                  </div>
                )}
                {formData.emergencyContact.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tél. d'urgence :</span>
                    <span className="font-medium">{formData.emergencyContact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <Shield className="mr-2 h-4 w-4 text-primary" />
              Validation des informations
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {isEmailValid ? (
                  <Badge variant="default" className="bg-green-500">✓</Badge>
                ) : (
                  <Badge variant="destructive">✗</Badge>
                )}
                <span className="text-sm">Email valide</span>
              </div>
              <div className="flex items-center space-x-2">
                {isPhoneValid ? (
                  <Badge variant="default" className="bg-green-500">✓</Badge>
                ) : (
                  <Badge variant="destructive">✗</Badge>
                )}
                <span className="text-sm">Téléphone valide</span>
              </div>
            </div>
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