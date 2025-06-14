
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserCheck, Phone, Mail, Lock, X } from 'lucide-react';
import { VisitorContactForm as VisitorContactFormData } from '@/services/visitorContactService';

interface VisitorContactFormProps {
  agencyName: string;
  onSubmit: (data: Omit<VisitorContactFormData, 'agency_id'>) => Promise<any>;
  isLoading: boolean;
  onClose?: () => void;
}

export default function VisitorContactForm({
  agencyName,
  onSubmit,
  isLoading,
  onClose
}: VisitorContactFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    purpose: 'contact_agency'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Au moins un contact (email ou téléphone) est requis
    const hasEmail = formData.email.trim();
    const hasPhone = formData.phone.trim();
    if (!hasEmail && !hasPhone) {
      newErrors.contact = 'Veuillez fournir au moins un moyen de contact (email ou téléphone)';
    }

    // Validation de l'email si fourni
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du téléphone si fourni
    if (hasPhone && !/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      first_name: 'Visiteur', // Valeur par défaut
      last_name: 'Anonyme', // Valeur par défaut
      purpose: formData.purpose,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined
    };

    const result = await onSubmit(submitData);
    if (!result.success && result.error) {
      setErrors({
        submit: result.error
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <Card className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header avec close button */}
          <CardHeader className="text-center bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-white/20 relative px-4 py-5">
            {onClose && (
              <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
              Accéder aux informations
            </CardTitle>
            
            <CardDescription className="text-sm leading-relaxed mt-2">
              Pour contacter <span className="font-semibold text-blue-600 dark:text-blue-400">{agencyName}</span>, 
              veuillez nous fournir au moins un moyen de contact.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Message d'information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Veuillez fournir au moins un moyen de contact</span>
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} 
                  className={`h-10 rounded-lg border-2 transition-all duration-200 ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                  }`} 
                  placeholder="votre.email@exemple.com" 
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.email}</p>}
              </div>

              {/* Téléphone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 mr-2" />
                  Téléphone
                </Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({
                    ...formData,
                    phone: e.target.value
                  })} 
                  className={`h-10 rounded-lg border-2 transition-all duration-200 ${
                    errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                  }`} 
                  placeholder="+33 1 23 45 67 89" 
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.phone}</p>}
              </div>

              {/* Messages d'erreur */}
              {errors.contact && (
                <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800 animate-fade-in">
                  {errors.contact}
                </div>
              )}

              {errors.submit && (
                <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800 animate-fade-in">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Vérification...
                  </div>
                ) : (
                  'Accéder aux informations'
                )}
              </Button>
            </form>

            {/* Trust indicators */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Sécurisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span>Confidentiel</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
