
import React from 'react';
import { Shield, Headphones, Zap } from 'lucide-react';

export default function PricingFooter() {
  return (
    <div className="text-center mt-16 space-y-8">
      {/* Features grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="flex flex-col items-center space-y-3 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-700/30">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Sécurisé</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Données protégées et chiffrées
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-700/30">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Headphones className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Support 24/7</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Assistance technique disponible
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-700/30">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Mises à jour</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Nouvelles fonctionnalités incluses
          </p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          Tous les plans incluent notre support technique et les mises à jour automatiques
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Méthodes de paiement acceptées:</span> Mobile Money, Virement bancaire, Paiement manuel
        </p>
      </div>
    </div>
  );
}
