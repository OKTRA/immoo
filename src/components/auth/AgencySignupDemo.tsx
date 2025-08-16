import React from 'react';
import AgencySignupForm from './AgencySignupForm';

const AgencySignupDemo: React.FC = () => {
  const handleSuccess = () => {
    console.log('Agence créée avec succès !');
  };

  const handleSwitchMode = () => {
    console.log('Basculer vers la connexion');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏢 Création d'Agence IMMOO
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez votre méthode de création préférée
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AgencySignupForm
            onSuccess={handleSuccess}
            onSwitchMode={handleSwitchMode}
          />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Formulaire de démonstration - Google Auth intégré</p>
        </div>
      </div>
    </div>
  );
};

export default AgencySignupDemo;

