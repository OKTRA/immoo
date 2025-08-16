import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInWithEmail } from '@/services/authService';
import { toast } from 'sonner';
import GoogleAuthButton from './GoogleAuthButton';

interface AgencyLoginFormProps {
  onSuccess: () => void;
  onSwitchMode: () => void;
}

const AgencyLoginForm: React.FC<AgencyLoginFormProps> = ({
  onSuccess,
  onSwitchMode,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signInWithEmail(email, password);
      
      if (result.error) {
        toast.error('Erreur de connexion', {
          description: result.error,
        });
        return;
      }

      if (result.user) {
        toast.success('Connexion réussie !');
        onSuccess();
      }
    } catch (error: any) {
      toast.error('Erreur de connexion', {
        description: error.message || 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    // L'utilisateur sera redirigé vers Google, puis vers le callback
    toast.success('Redirection vers Google...');
  };

  const handleGoogleError = (error: string) => {
    console.error('Google auth error:', error);
  };

  return (
    <div className="space-y-6">
      {/* Bouton Google Auth */}
      <div className="space-y-4">
        <GoogleAuthButton
          variant="default"
          size="lg"
          className="w-full"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>
      </div>

      {/* Formulaire Email/Password */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Pas encore d'agence ? Créer un compte
        </button>
      </div>
    </div>
  );
};

export default AgencyLoginForm;
