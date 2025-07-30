import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AdminLoginFormProps {
  onSuccess: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
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
      console.log('Attempting admin login with:', email);
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
      
      toast.success('Connexion administrative réussie');
      onSuccess();
      navigate('/admin');
    } catch (error: any) {
      console.error('Error during admin login:', error.message);
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
    <div className="w-full max-w-md mx-auto">
      {/* Header avec icône et titre */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Administration
        </h2>
        <p className="text-gray-600 text-sm">
          Accès réservé aux administrateurs
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
          <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
            Email administrateur
          </Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            required
            className="h-12 px-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-base"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
            Mot de passe
          </Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="h-12 px-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-base"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            'Accéder à l\'administration'
          )}
        </Button>
      </form>

      {/* Message de sécurité */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Accès strictement réservé aux administrateurs autorisés
        </p>
      </div>
    </div>
  );
};

export default AdminLoginForm;
