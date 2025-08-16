import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle } from '@/services/googleAuthService';
import { toast } from 'sonner';

interface GoogleAuthButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  onSuccess,
  onError,
  disabled = false,
}) => {
  const handleGoogleSignIn = async () => {
    if (disabled) return;
    
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        toast.error('Erreur de connexion Google', {
          description: result.error,
        });
        onError?.(result.error);
        return;
      }

      // Si pas d'erreur, l'utilisateur sera redirigé vers Google
      toast.success('Redirection vers Google...');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur de connexion Google', {
        description: errorMessage,
      });
      onError?.(errorMessage);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 shadow-sm',
    outline: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <FcGoogle className="w-5 h-5 mr-2" />
      Continuer avec Google
    </button>
  );
};

export default GoogleAuthButton;
