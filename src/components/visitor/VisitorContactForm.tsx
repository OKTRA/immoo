
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserCheck, Phone, Mail, Lock } from 'lucide-react';
import { VisitorContactForm as VisitorContactFormData } from '@/services/visitorContactService';

interface VisitorContactFormProps {
  agencyName: string;
  onSubmit: (data: Omit<VisitorContactFormData, 'agency_id'>) => Promise<any>;
  isLoading: boolean;
}

export default function VisitorContactForm({ agencyName, onSubmit, isLoading }: VisitorContactFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    purpose: 'contact_agency'
  });
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom est requis';
    }

    if (contactMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Le téléphone est requis';
      } else if (!/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
        newErrors.phone = 'Format de téléphone invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      purpose: formData.purpose,
      ...(contactMethod === 'email' 
        ? { email: formData.email, phone: undefined } 
        : { phone: formData.phone, email: undefined }
      )
    };

    const result = await onSubmit(submitData);
    
    if (!result.success && result.error) {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Accéder aux informations de contact</CardTitle>
          <CardDescription className="text-base">
            Pour contacter <span className="font-semibold text-blue-600">{agencyName}</span>, 
            veuillez nous fournir vos coordonnées. Cela nous aide à établir une relation de confiance 
            et à éviter les demandes non pertinentes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Méthode de contact */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                type="button"
                variant={contactMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setContactMethod('email')}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                type="button"
                variant={contactMethod === 'phone' ? 'default' : 'outline'}
                onClick={() => setContactMethod('phone')}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Téléphone
              </Button>
            </div>

            {/* Nom et prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={errors.first_name ? 'border-red-500' : ''}
                  placeholder="Votre prénom"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={errors.last_name ? 'border-red-500' : ''}
                  placeholder="Votre nom"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Contact method input */}
            {contactMethod === 'email' ? (
              <div>
                <Label htmlFor="email">Adresse email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="votre.email@exemple.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="phone">Numéro de téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? 'border-red-500' : ''}
                  placeholder="+33 1 23 45 67 89"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            )}

            {/* Submit error */}
            {errors.submit && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {errors.submit}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Vérification...' : 'Accéder aux informations'}
            </Button>
          </form>

          {/* Trust indicators */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Pas de spam</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Vos informations ne seront partagées qu'avec cette agence.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
