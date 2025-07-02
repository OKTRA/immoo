import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AgencyLoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

const AgencyLoginForm: React.FC<AgencyLoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const validateForm = () => {
    setError(null);
    
    if (!email) {
      setError("L'email est requis");
      return false;
    }
    
    if (!password) {
      setError("Le mot de passe est requis");
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
          ? "Email ou mot de passe incorrect" 
          : result.error || 'Erreur inconnue';
        
        console.error('Error signing in:', errorMessage);
        setError(errorMessage);
        toast.error("Échec de connexion", { 
          description: errorMessage
        });
        setIsLoading(false);
        return;
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error during agency login:', error.message);
      const errorMessage = error.message || 'Une erreur s\'est produite';
      setError(errorMessage);
      toast.error("Erreur", { 
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
        <h2 className="text-2xl font-bold text-gray-900">Connexion Agence</h2>
        <p className="text-gray-600">Connectez-vous à votre espace agence</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-start space-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="agency-email">Email</Label>
          <Input
            id="agency-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            autoComplete="email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agency-password">Mot de passe</Label>
          <Input
            id="agency-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : 'Se connecter'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Pas encore d'agence?{' '}
          <button 
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={onSwitchToSignup}
          >
            Créer une agence
          </button>
        </p>
      </div>
    </div>
  );
};

export default AgencyLoginForm;
