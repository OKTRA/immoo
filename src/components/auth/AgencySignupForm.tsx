import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, User, Building2, Mail, Lock, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { signUpWithEmail } from '@/services/authService';
import { createAgencyProfileForGoogleUser, checkAgencyExists } from '@/services/agencyProfileService';
import { toast } from 'sonner';
import GoogleAuthButton from './GoogleAuthButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

interface AgencySignupFormProps {
  onSuccess: () => void;
  onSwitchMode: () => void;
}

interface GoogleAuthUserData {
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

const AgencySignupForm: React.FC<AgencySignupFormProps> = ({
  onSuccess,
  onSwitchMode,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    agency_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Vérifier si l'utilisateur vient de Google Auth
  useEffect(() => {
    if (location.state?.fromGoogleAuth && location.state?.userData) {
      const userData: GoogleAuthUserData = location.state.userData;
      setFormData(prev => ({
        ...prev,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      }));
      setIsGoogleUser(true);
      
      // Vérifier si une agence existe déjà avec cet email
      checkExistingAgency(userData.email);
    }
  }, [location.state]);

  const checkExistingAgency = async (email: string) => {
    try {
      const exists = await checkAgencyExists(email);
      if (exists) {
        toast.error('Une agence existe déjà avec cet email', {
          description: 'Veuillez utiliser un autre email ou vous connecter à l\'agence existante',
        });
        // Rediriger vers la connexion
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking existing agency:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.agency_name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (!isGoogleUser && (!formData.password || !formData.confirm_password)) {
      toast.error('Veuillez saisir et confirmer votre mot de passe');
      return false;
    }

    if (!isGoogleUser && formData.password !== formData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }

    if (!isGoogleUser && formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
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
    
    try {
      let result;
      
      if (isGoogleUser) {
        // Pour les utilisateurs Google, on crée juste le profil et l'agence
        setIsCreatingProfile(true);
        result = await createAgencyProfile();
      } else {
        // Pour les utilisateurs classiques, on crée le compte + profil + agence
        result = await signUpWithEmail(
          formData.email,
          formData.password,
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            role: 'agency',
          }
        );
      }
      
      if (result.error) {
        toast.error('Erreur lors de la création', {
          description: result.error,
        });
        return;
      }

      toast.success('Agence créée avec succès !');
      onSuccess();
    } catch (error: any) {
      toast.error('Erreur lors de la création', {
        description: error.message || 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setIsLoading(false);
      setIsCreatingProfile(false);
    }
  };

  const createAgencyProfile = async () => {
    try {
      const result = await createAgencyProfileForGoogleUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        agency_name: formData.agency_name,
      });

      if (!result.success) {
        toast.error('Erreur lors de la création', {
          description: result.error,
        });
        return { success: false, error: result.error };
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleGoogleSuccess = () => {
    toast.success('Redirection vers Google...');
  };

  const handleGoogleError = (error: string) => {
    console.error('Google auth error:', error);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec choix de méthode */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Créer mon agence
        </h2>
        <p className="text-gray-600">
          Choisissez votre méthode de création
        </p>
      </div>

      {/* Bouton Google Auth (seulement si pas déjà connecté via Google) */}
      {!isGoogleUser && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FcGoogle className="w-6 h-6" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Créer rapidement avec Google
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Utilisez votre compte Google pour créer votre agence en quelques clics
              </p>
            </div>

            <GoogleAuthButton
              variant="default"
              size="lg"
              className="w-full shadow-sm hover:shadow-md transition-shadow"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </div>
      )}

      {/* Message pour utilisateurs Google */}
      {isGoogleUser && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
          <div className="flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-center">
              <p className="text-sm font-medium text-green-800">
                ✅ Connecté via Google
              </p>
              <p className="text-sm text-green-700">
                Complétez les informations de votre agence pour finaliser l'inscription
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Séparateur */}
      {!isGoogleUser && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">
              ou créer avec email et mot de passe
            </span>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Votre nom"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email professionnel *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={isGoogleUser}
                />
                {isGoogleUser && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone (optionnel)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+223 XX XX XX XX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Champs mot de passe (seulement si pas Google) */}
          {!isGoogleUser && (
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informations de l'agence */}
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informations de l'agence</h3>
          </div>
          
          <div>
            <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'agence *
            </label>
            <input
              id="agency_name"
              name="agency_name"
              type="text"
              value={formData.agency_name}
              onChange={handleInputChange}
              placeholder="Nom de votre agence immobilière"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading || isCreatingProfile}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isLoading || isCreatingProfile ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              {isCreatingProfile ? 'Création du profil...' : 'Création en cours...'}
            </>
          ) : (
            <>
              Créer mon agence
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>

      {/* Lien de connexion */}
      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Déjà une agence ? Se connecter
        </button>
      </div>
    </div>
  );
};

export default AgencySignupForm;
