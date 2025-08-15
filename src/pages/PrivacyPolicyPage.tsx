import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Database, Smartphone, CreditCard, Bell, Globe, Users, Building2, Home, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const lastUpdated = "15 Aout 2025";
  const effectiveDate = "15 Aout 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-immoo-gold" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Politique de Confidentialité
                </h1>
                <p className="text-sm text-muted-foreground">
                  Dernière mise à jour : {lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5 text-immoo-gold" />
                Introduction et Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                IMMOO ("nous", "notre", "nos") s'engage à protéger et respecter votre vie privée. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, 
                stockons et protégeons vos informations personnelles conformément aux lois applicables 
                et aux meilleures pratiques internationales.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Date d'effet :</strong> {effectiveDate}<br />
                  <strong>Applicable à :</strong> Tous les utilisateurs de la plateforme IMMOO
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="h-5 w-5 text-immoo-gold" />
                Informations Collectées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-immoo-gold" />
                  Informations Personnelles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Identité</h5>
                    <p className="text-xs text-muted-foreground">
                      Nom, prénom, email, téléphone
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Profil</h5>
                    <p className="text-xs text-muted-foreground">
                      Photo, adresse, préférences
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Professionnel</h5>
                    <p className="text-xs text-muted-foreground">
                      Rôle, agence, licences
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Financier</h5>
                    <p className="text-xs text-muted-foreground">
                      Méthodes de paiement, transactions
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Data */}
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-immoo-gold" />
                  Données Techniques
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Appareil</h5>
                    <p className="text-xs text-muted-foreground">
                      Type, navigateur, résolution
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Navigation</h5>
                    <p className="text-xs text-muted-foreground">
                      Pages visitées, temps passé
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Localisation</h5>
                    <p className="text-xs text-muted-foreground">
                      IP, fuseau horaire, géolocalisation
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm">Fingerprinting</h5>
                    <p className="text-xs text-muted-foreground">
                      Empreinte navigateur unique
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Globe className="h-5 w-5 text-immoo-gold" />
                Services Tiers et Intégrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Paiements Mobiles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Traitement des paiements par carte et mobile money
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-immoo-gold">Orange Money</h5>
                      <p className="text-xs text-muted-foreground">
                        Paiements mobiles et transferts d'argent
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notifications et Analytics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Notifications push et engagement utilisateur
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-immoo-gold">Google Analytics</h5>
                      <p className="text-xs text-muted-foreground">
                        Analyse du trafic et comportement utilisateur
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-immoo-gold" />
                Vos Droits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Conformité légale :</strong> Cette politique respecte les 
                  dispositions des lois sur la protection des données personnelles et 
                  les bonnes pratiques internationales.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Droits d'Accès et de Contrôle :</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">Droit</Badge>
                      <span>Accéder à vos données personnelles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">Droit</Badge>
                      <span>Corriger les informations inexactes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">Droit</Badge>
                      <span>Supprimer vos données (droit à l'oubli)</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Droits de Consentement :</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">Droit</Badge>
                      <span>Révoquer votre consentement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">Droit</Badge>
                      <span>Portabilité de vos données</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">Droit</Badge>
                      <span>Opposition au traitement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-immoo-gold" />
                Contact et Exercice de vos Droits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Délégué à la Protection des Données :</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email :</strong> oktra@oktra.dev</p>
                    <p><strong>Adresse :</strong> Bamako, Mali</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Support Client :</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email :</strong> contact@immoo.pro</p>
                    <p><strong>Chat :</strong> Disponible sur la plateforme</p>
                    <p><strong>Réponse :</strong> Sous 48h maximum</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">✅ Exercice de vos Droits</h4>
                <p className="text-sm text-green-700">
                  Pour exercer vos droits (accès, rectification, suppression, etc.), 
                  contactez-nous via l'email oktra@oktra.dev. Nous traiterons votre 
                  demande dans un délai de 7 jours maximum.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card className="bg-gradient-to-r from-immoo-gold to-immoo-gold/80 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">
                Questions sur la Confidentialité ?
              </h3>
              <p className="mb-4 opacity-90">
                Notre équipe est là pour vous aider et répondre à toutes vos questions
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-immoo-gold"
                  onClick={() => window.location.href = 'mailto:privacy@immoo.ml'}
                >
                  Contactez-nous
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-immoo-gold"
                  onClick={() => navigate('/')}
                >
                  Retour à l'Accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
