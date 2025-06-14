
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2, Building2 } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Devenir Agence</h2>
        <p className="text-gray-600">Rejoignez notre réseau d'agences immobilières</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-start space-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Informations personnelles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Votre prénom"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Minimum 6 caractères"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+33 X XX XX XX XX"
            />
          </div>
        </div>

        {/* Informations agence */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations agence</h3>
          
          <div className="space-y-2">
            <Label htmlFor="agencyName">Nom de l'agence</Label>
            <Input
              id="agencyName"
              type="text"
              value={formData.agencyName}
              onChange={(e) => handleInputChange('agencyName', e.target.value)}
              placeholder="Nom de votre agence"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description de l'agence</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Décrivez votre agence, vos services, votre expérience..."
              rows={4}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : 'Soumettre ma demande'}
        </Button>
      </form>

      {onSwitchToLogin && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Déjà une agence?{' '}
            <button 
              type="button"
              className="text-primary hover:underline font-medium"
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
