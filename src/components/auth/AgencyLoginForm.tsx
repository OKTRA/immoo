import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Building2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface AgencyLoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

const AgencyLoginForm: React.FC<AgencyLoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const validateForm = () => {
    setError(null);
    
    if (!email) {
      setError(t('auth.agency.emailRequired'));
      return false;
    }
    
    if (!password) {
      setError(t('auth.agency.passwordRequired'));
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
      console.log('Attempting agency login with:', email);
      const result = await signIn(email, password);
      
      if (!result.success) {
        const errorMessage = result.error === "Invalid login credentials" 
          ? t('auth.agency.invalidCredentials')
          : result.error || t('auth.agency.unknownError');
        
        console.error('Error signing in:', errorMessage);
        setError(errorMessage);
        toast.error(t('auth.agency.loginFailed'), { 
          description: errorMessage
        });
        setIsLoading(false);
        return;
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error during agency login:', error.message);
      const errorMessage = error.message || t('auth.agency.unknownError');
      setError(errorMessage);
      toast.error(t('auth.agency.loginFailed'), { 
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header avec icône et titre */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.agency.loginTitle') || 'Connexion Agence'}
        </h2>
        <p className="text-gray-600 text-sm">
          {t('auth.agency.loginSubtitle') || 'Connectez-vous à votre espace agence'}
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start space-x-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="agency-email" className="text-sm font-medium text-gray-700">
            {t('auth.agency.email') || 'Email'}
          </Label>
          <Input
            id="agency-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.agency.emailPlaceholder') || 'votre@email.com'}
            autoComplete="email"
            required
            className="h-12 px-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agency-password" className="text-sm font-medium text-gray-700">
            {t('auth.agency.password') || 'Mot de passe'}
          </Label>
          <Input
            id="agency-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.agency.passwordPlaceholder') || '••••••••'}
            autoComplete="current-password"
            required
            className="h-12 px-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.agency.connecting') || 'Connexion...'}
            </>
          ) : (
            t('auth.agency.login') || 'Se connecter'
          )}
        </Button>
      </form>

      {/* Lien vers inscription */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('auth.agency.noAccount') || "Pas encore d'agence ? "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
          >
            {t('auth.agency.createAccount') || 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AgencyLoginForm;
