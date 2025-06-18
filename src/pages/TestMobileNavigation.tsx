import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Monitor, Menu, Eye, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function TestMobileNavigation() {
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: Eye,
      title: "Logo Centré",
      description: "Le logo IMMOO avec pupilles animées est parfaitement centré sur mobile",
      status: "✅ Implémenté"
    },
    {
      icon: Menu,
      title: "Menu Hamburger Moderne",
      description: "Animation fluide du bouton hamburger avec transformation en X",
      status: "✅ Implémenté"
    },
    {
      icon: Smartphone,
      title: "Overlay Moderne",
      description: "Menu slide-in depuis la droite avec backdrop blur et animations",
      status: "✅ Implémenté"
    },
    {
      icon: CheckCircle,
      title: "Design Minimaliste",
      description: "Interface épurée avec icônes, descriptions et interactions fluides",
      status: "✅ Implémenté"
    }
  ];

  const improvements = [
    {
      before: "Logo non centré sur mobile",
      after: "Logo parfaitement centré avec animation adaptative"
    },
    {
      before: "Menu hamburger basique avec icônes Lucide",
      after: "Animation hamburger → X avec transitions fluides"
    },
    {
      before: "Overlay simple avec fond transparent",
      after: "Menu slide-in moderne avec backdrop blur"
    },
    {
      before: "Liste simple des liens",
      after: "Cards avec icônes, descriptions et micro-interactions"
    },
    {
      before: "Design générique",
      after: "Identité visuelle IMMOO avec couleurs et branding"
    }
  ];

  return (
    <div className="min-h-screen bg-immoo-pearl">
      {/* Navbar de démonstration */}
      {showDemo && <Navbar />}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-immoo-navy mb-4">
            Navigation Mobile Redesignée
          </h1>
          <p className="text-lg text-immoo-navy/70 mb-6">
            Design moderne, minimaliste et attractif pour mobile et tablette
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                showDemo 
                  ? 'bg-immoo-gold text-white shadow-lg' 
                  : 'bg-white text-immoo-navy border border-immoo-gray/20 hover:bg-immoo-pearl'
              }`}
            >
              {showDemo ? 'Masquer la démo' : 'Voir la démo live'}
            </button>
          </div>

          {showDemo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                📱 <strong>Navigation active !</strong> Cliquez sur le menu hamburger en haut à droite pour tester le nouveau design mobile.
              </p>
            </div>
          )}
        </div>

        {/* Fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-immoo-gold/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-immoo-gold" />
                  </div>
                  <div>
                    <div className="text-immoo-navy">{feature.title}</div>
                    <div className="text-sm text-green-600 font-medium">{feature.status}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-immoo-navy/70">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Améliorations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Améliorations Apportées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-immoo-pearl rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-500 text-sm">❌ Avant :</span>
                    </div>
                    <p className="text-sm text-immoo-navy/70">{improvement.before}</p>
                  </div>
                  <div className="hidden md:block w-8 text-center">
                    <span className="text-immoo-gold text-xl">→</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-500 text-sm">✅ Après :</span>
                    </div>
                    <p className="text-sm text-immoo-navy font-medium">{improvement.after}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spécifications techniques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Design Mobile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Logo :</span>
                  <span className="text-sm font-medium text-immoo-navy">Centré avec animation adaptative</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Menu :</span>
                  <span className="text-sm font-medium text-immoo-navy">Slide-in depuis la droite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Largeur :</span>
                  <span className="text-sm font-medium text-immoo-navy">320px (85vw max)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Animation :</span>
                  <span className="text-sm font-medium text-immoo-navy">300ms ease-out</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Backdrop :</span>
                  <span className="text-sm font-medium text-immoo-navy">Blur + overlay sombre</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Hamburger :</span>
                  <span className="text-sm font-medium text-immoo-navy">Animation → X fluide</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Hover :</span>
                  <span className="text-sm font-medium text-immoo-navy">Micro-animations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Icônes :</span>
                  <span className="text-sm font-medium text-immoo-navy">Couleurs contextuelles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Navigation :</span>
                  <span className="text-sm font-medium text-immoo-navy">Fermeture automatique</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Accessibilité :</span>
                  <span className="text-sm font-medium text-immoo-navy">ARIA labels + focus</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Comment tester</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📱 Sur Mobile/Tablette</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Activez la démo ci-dessus</li>
                  <li>Cliquez sur le bouton hamburger (3 barres)</li>
                  <li>Observez l'animation slide-in et le backdrop</li>
                  <li>Testez les interactions et micro-animations</li>
                  <li>Fermez en cliquant sur le backdrop ou le X</li>
                </ol>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🖥️ Sur Desktop</h4>
                <p className="text-sm text-green-800">
                  Redimensionnez votre navigateur en mode mobile (F12 → mode responsive) 
                  pour tester le comportement adaptatif du logo et du menu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}