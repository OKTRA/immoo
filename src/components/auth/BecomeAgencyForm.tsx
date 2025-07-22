
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2, Building2, User, Mail, Lock, Phone, FileText } from 'lucide-react';
import { signUp } from '@/services/authService';
import { toast } from 'sonner';

interface BecomeAgencyFormProps {
  onSuccess: () => void;
  onSwitchToLogin?: () => void;
}

const BecomeAgencyForm: React.FC<BecomeAgencyFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    agencyName: '',
    description: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    setError(null);
    
    if (!formData.email) {
      setError("L'email est requis");
      return false;
    }
    
    if (!formData.password) {
      setError("Le mot de passe est requis");
      return false;
    }
    
    if (!formData.firstName || !formData.lastName) {
      setError("Le prénom et le nom sont requis");
      return false;
    }

    if (!formData.agencyName) {
      setError("Le nom de l'agence est requis");
      return false;
    }
    
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
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
      const { error: signUpError } = await signUp(formData.email, formData.password, { 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        role: 'agency',
        agencyName: formData.agencyName,
        description: formData.description,
        phone: formData.phone
      });
      
      if (signUpError) {
        setError(signUpError);
        toast.error("Échec de l'inscription", { 
          description: signUpError 
        });
        setIsLoading(false);
        return;
      }
      
      toast.success('Demande envoyée', { 
        description: 'Votre demande pour devenir agence a été envoyée avec succès' 
      });
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Une erreur s\'est produite');
      toast.error("Erreur", { 
        description: error.message || 'Une erreur s\'est produite' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Modern Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-immoo-gold to-immoo-gold-light rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="w-8 h-8 text-immoo-navy" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-immoo-navy to-immoo-navy-light bg-clip-text text-transparent">
            Devenir Agence
          </h2>
          <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-md mx-auto">
            Rejoignez notre réseau d'agences immobilières
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start space-x-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Informations personnelles */}
        <div className="bg-white/50 dark:bg-immoo-navy-light/30 backdrop-blur-sm rounded-2xl p-6 border border-immoo-gold/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-immoo-gold/20 to-immoo-gold-light/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-immoo-gold" />
            </div>
            <h3 className="text-xl font-bold text-immoo-navy dark:text-immoo-pearl">
              Informations personnelles
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-immoo-navy/80 dark:text-immoo-pearl/80">
                Prénom
              </Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Votre prénom"
                  className="h-12 px-4 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 focus:border-immoo-gold focus:ring-immoo-gold/20 rounded-xl transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-immoo-navy/80 dark:text-immoo-pearl/80">
                Nom
              </Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Votre nom"
                  className="h-12 px-4 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 focus:border-immoo-gold focus:ring-immoo-gold/20 rounded-xl transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="email" className="text-sm font-medium text-immoo-navy/80 dark:text-immoo-pearl/80">
              Email professionnel
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-immoo-navy/40 dark:text-immoo-pearl/40" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="votre@email.com"
                autoComplete="email"
                className="h-12 pl-10 pr-4 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 focus:border-immoo-gold focus:ring-immoo-gold/20 rounded-xl transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <Label htmlFor="password" className="text-sm font-medium text-immoo-navy/80 dark:text-immoo-pearl/80">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-immoo-navy/40 dark:text-immoo-pearl/40" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
                className="h-12 pl-10 pr-4 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 focus:border-immoo-gold focus:ring-immoo-gold/20 rounded-xl transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-immoo-navy/80 dark:text-immoo-pearl/80">
              Téléphone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-immoo-navy/40 dark:text-immoo-pearl/40" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+223 X XX XX XX XX"
                className="h-12 pl-10 pr-4 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 focus:border-immoo-gold focus:ring-immoo-gold/20 rounded-xl transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Informations agence */}
        <div className="bg-white/50 dark:bg-immoo-navy-light/30 backdrop-blur-sm rounded-2xl p-6 border border-immoo-gold/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-immoo-navy/20 to-immoo-navy-light/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-immoo-navy dark:text-immoo-pearl" />
            </div>
            <h3 className="text-xl font-bold text-immoo-navy dark:text-immoo-pearl">
              Informations agence
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName" className="text-sm font-medium text-immoo-navy/80 dark:text-immoo-pearl/80">
                Nom de l'agence
              </Label>
              <Input
                id="agencyName"
                type="text"
                value={formData.agencyName}
                onChange={(e) => handleInputChange('agencyName', e.target.value)}
                placeholder="Nom de votre agence"
                className="h-12 px-4 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 focus:border-immoo-gold focus:ring-immoo-gold/20 rounded-xl transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-immoo-navy/80 dark:text-immoo-pearl/80">
                Description de l'agence
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-immoo-navy/40 dark:text-immoo-pearl/40" />
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre agence, vos services, votre expérience..."
                  rows={4}
                  className="pl-10 pr-4 bg-white/80 dark:bg-immoo-navy-light/80 border-immoo-gold/20 focus:border-immoo-gold focus:ring-immoo-gold/20 rounded-xl transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-14 bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Building2 className="mr-3 h-5 w-5" />
              Soumettre ma demande
            </>
          )}
        </Button>
      </form>

      {onSwitchToLogin && (
        <div className="text-center space-y-2 mt-8">
          <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
            Déjà une agence?{' '}
            <button 
              type="button"
              className="text-immoo-gold hover:text-immoo-gold-light font-semibold transition-colors duration-200"
              onClick={onSwitchToLogin}
            >
              Se connecter
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default BecomeAgencyForm;
