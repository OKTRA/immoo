import React from 'react';
import GoogleAuthButton from './GoogleAuthButton';

const GoogleAuthTest: React.FC = () => {
  const handleSuccess = () => {
    console.log('Google Auth success!');
  };

  const handleError = (error: string) => {
    console.error('Google Auth error:', error);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Test Google Auth</h2>
      
      <div className="space-y-4">
        <GoogleAuthButton
          variant="default"
          size="lg"
          className="w-full"
          onSuccess={handleSuccess}
          onError={handleError}
        />
        
        <GoogleAuthButton
          variant="outline"
          size="md"
          className="w-full"
          onSuccess={handleSuccess}
          onError={handleError}
        />
        
        <GoogleAuthButton
          variant="default"
          size="sm"
          className="w-full"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Cliquez sur un bouton pour tester Google Auth</p>
        <p>Vérifiez la console pour les logs</p>
      </div>
    </div>
  );
};

export default GoogleAuthTest;

