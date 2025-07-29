import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Building2 } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('auth.agency.title')}</h2>
        <p className="text-gray-600">{t('auth.agency.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-start space-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="agency-email">{t('auth.agency.email')}</Label>
          <Input
            id="agency-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.agency.emailPlaceholder')}
            autoComplete="email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agency-password">{t('auth.agency.password')}</Label>
          <Input
            id="agency-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.agency.passwordPlaceholder')}
            autoComplete="current-password"
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.agency.connecting')}
            </>
          ) : t('auth.agency.login')}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          {t('auth.agency.noAgencyYet')}{' '}
          <button 
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={onSwitchToSignup}
          >
            {t('auth.agency.createAgency')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AgencyLoginForm;
