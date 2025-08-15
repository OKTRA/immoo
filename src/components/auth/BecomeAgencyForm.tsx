
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2, Building2, User, Mail, Lock, Phone, FileText } from 'lucide-react';
import { signUp } from '@/services/authService';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface BecomeAgencyFormProps {
  onSuccess: () => void;
  onSwitchToLogin?: () => void;
}

const BecomeAgencyForm: React.FC<BecomeAgencyFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agencyName: '',
    description: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = () => {
    setError(null);
    
    if (!formData.email) {
      setError(t('auth.emailRequired'));
      return false;
    }
    
    if (!formData.password) {
      setError(t('auth.passwordRequired'));
      return false;
    }
    
    if (!formData.firstName || !formData.lastName) {
      setError(t('auth.firstNameLastNameRequired'));
      return false;
    }

    if (!formData.agencyName) {
      setError(t('auth.agencyNameRequired'));
      return false;
    }
    
    if (formData.password.length < 6) {
      setError(t('auth.weakPassword'));
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setPasswordError(t('auth.passwordMismatch'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp(formData.email, formData.password, { 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        role: 'agency',
        agencyName: formData.agencyName,
        description: formData.description,
        phone: formData.phone
      });
      
      // Si on arrive ici, l'inscription a réussi
      toast.success(t('auth.agencyCreatedSuccess'), { 
        description: t('auth.agencyCreatedDescription') 
      });
      onSuccess();
    } catch (error: any) {
      setError(error.message || t('auth.errorOccurred'));
      toast.error(t('common.error'), { 
        description: error.message || t('auth.errorOccurred') 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel pour les mots de passe
    if (field === 'password' || field === 'confirmPassword') {
      // Réinitialiser l'erreur de mot de passe
      setPasswordError(null);
      
      // Vérifier la correspondance si les deux champs sont remplis
      const newFormData = { ...formData, [field]: value };
      if (newFormData.password && newFormData.confirmPassword) {
        if (newFormData.password !== newFormData.confirmPassword) {
          setPasswordError(t('auth.passwordMismatch'));
        }
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg flex items-start space-x-2 text-sm text-red-700 animate-in slide-in-from-left-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Informations personnelles */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            {t('auth.personalInfo')}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs font-semibold text-gray-700">
                {t('auth.firstName')}
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={t('auth.firstName')}
                className="h-10 px-3 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs font-semibold text-gray-700">
                {t('auth.lastName')}
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={t('auth.lastName')}
                className="h-10 px-3 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-1 col-span-2">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
              {t('auth.professionalEmail')}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                className="h-10 pl-10 pr-3 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
              {t('common.password')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="new-password"
                className="h-10 pl-10 pr-3 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
              {t('auth.confirmPassword')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                autoComplete="new-password"
                className={`h-10 pl-10 pr-3 text-sm rounded-lg transition-all duration-200 ${
                  passwordError 
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
                required
              />
            </div>
            {passwordError && (
              <p className="text-xs text-red-600 mt-1 flex items-center animate-in slide-in-from-left-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                {passwordError}
              </p>
            )}
          </div>

          <div className="space-y-1 col-span-2">
            <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">
              {t('auth.phoneOptional')}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
                className="h-10 pl-10 pr-3 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Informations agence */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-4">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
              <Building2 className="w-3 h-3 text-orange-600" />
            </div>
            {t('auth.agencyInfo')}
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="agencyName" className="text-xs font-semibold text-gray-700">
                {t('auth.agencyName')}
              </Label>
              <Input
                id="agencyName"
                type="text"
                value={formData.agencyName}
                onChange={(e) => handleInputChange('agencyName', e.target.value)}
                placeholder={t('auth.agencyNamePlaceholder')}
                className="h-10 px-3 text-sm border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-semibold text-gray-700">
                {t('auth.descriptionOptional')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('auth.descriptionPlaceholder')}
                rows={2}
                className="px-3 py-2 text-sm resize-none border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg transition-all duration-200"
              />
            </div>
          </div>
        </div>
        
        {/* Politique de Confidentialité */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            En soumettant ce formulaire, vous acceptez notre{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
              onClick={() => window.open('/privacy', '_blank')}
            >
              Politique de Confidentialité
            </button>
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.creatingAgency')}
            </>
          ) : (
            <>
              <Building2 className="mr-2 h-4 w-4" />
              {t('auth.createMyAgency')}
            </>
          )}
        </Button>
      </form>

      {onSwitchToLogin && (
        <div className="text-center mt-6">
          <p className="text-xs text-gray-600">
            {t('auth.agency.alreadyAgency')}{' '}
            <button 
              type="button"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
              onClick={onSwitchToLogin}
            >
              {t('auth.agency.loginHere')}
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default BecomeAgencyForm;
