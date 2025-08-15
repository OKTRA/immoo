import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import ImmooSplashScreen from '@/components/ui/ImmooSplashScreen';

export default function SplashScreenDemo() {
  const [showSplash, setShowSplash] = useState(false);
  const [splashVariant, setSplashVariant] = useState<'light' | 'dark'>('dark');
  const [duration, setDuration] = useState(3000);

  const handleStartDemo = () => {
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleReset = () => {
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-immoo-pearl">
      {/* Splash Screen Overlay */}
      {showSplash && (
        <ImmooSplashScreen 
          variant={splashVariant}
          duration={duration}
          onComplete={handleSplashComplete}
          autoHide={true}
        />
      )}

      {/* Demo Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-immoo-navy mb-4">
            IMMOO Splash Screen Demo
          </h1>
          <p className="text-xl text-immoo-gray max-w-2xl mx-auto">
            Testez l'écran de démarrage IMMOO avec différentes configurations et animations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Contrôles de Démonstration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variant Selection */}
              <div>
                <label className="block text-sm font-medium text-immoo-navy mb-2">
                  Thème
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={splashVariant === 'dark' ? 'default' : 'outline'}
                    onClick={() => setSplashVariant('dark')}
                    className={splashVariant === 'dark' ? 'bg-immoo-navy' : ''}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Sombre
                  </Button>
                  <Button
                    variant={splashVariant === 'light' ? 'default' : 'outline'}
                    onClick={() => setSplashVariant('light')}
                    className={splashVariant === 'light' ? 'bg-immoo-navy' : ''}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Clair
                  </Button>
                </div>
              </div>

              {/* Duration Control */}
              <div>
                <label className="block text-sm font-medium text-immoo-navy mb-2">
                  Durée: {duration}ms
                </label>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-immoo-gray/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-immoo-gray mt-1">
                  <span>1s</span>
                  <span>8s</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleStartDemo}
                  disabled={showSplash}
                  className="flex-1 bg-immoo-gold text-white hover:bg-immoo-gold/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {showSplash ? 'En cours...' : 'Démarrer la démo'}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={!showSplash}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview and Info */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu et Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Configuration Preview */}
              <div className="bg-immoo-pearl p-4 rounded-lg">
                <h4 className="font-semibold text-immoo-navy mb-3">Configuration Actuelle</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-immoo-gray">Thème:</span>
                    <span className="ml-2 font-medium text-immoo-navy">
                      {splashVariant === 'dark' ? 'Sombre' : 'Clair'}
                    </span>
                  </div>
                  <div>
                    <span className="text-immoo-gray">Durée:</span>
                    <span className="ml-2 font-medium text-immoo-navy">
                      {duration / 1000}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold text-immoo-navy">Aperçu Miniature</h4>
                <div className="flex justify-center">
                  <div className="w-32 h-48 relative border-2 border-immoo-gray/30 rounded-lg overflow-hidden">
                    <div className={`absolute inset-0 flex flex-col items-center justify-center ${
                      splashVariant === 'dark' 
                        ? 'bg-gradient-to-br from-immoo-navy via-immoo-navy/95 to-immoo-navy/90' 
                        : 'bg-gradient-to-br from-immoo-pearl via-white to-immoo-pearl/80'
                    }`}>
                      <div className="text-xs font-bold mb-2" style={{
                        color: splashVariant === 'dark' ? '#fbbf24' : '#111827'
                      }}>
                        IMMOO
                      </div>
                      <div className={`w-16 h-0.5 rounded-full overflow-hidden ${
                        splashVariant === 'dark' ? 'bg-immoo-pearl/20' : 'bg-immoo-navy/20'
                      }`}>
                        <div className={`h-full w-1/2 rounded-full animate-pulse ${
                          splashVariant === 'dark' ? 'bg-immoo-gold' : 'bg-immoo-navy'
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-immoo-navy">Fonctionnalités</h4>
                <ul className="space-y-1 text-sm text-immoo-gray">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-immoo-gold rounded-full" />
                    Logo animé avec yeux interactifs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-immoo-gold rounded-full" />
                    Barre de progression temps réel
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-immoo-gold rounded-full" />
                    Particules flottantes animées
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-immoo-gold rounded-full" />
                    Transitions fluides d'entrée/sortie
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-immoo-gold rounded-full" />
                    Responsive et personnalisable
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Guide d'Implémentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-immoo-navy">Installation</h4>
                <div className="bg-immoo-navy p-4 rounded-lg text-immoo-pearl text-sm font-mono">
                  <div>import ImmooSplashScreen from</div>
                  <div className="ml-4">'@/components/ui/ImmooSplashScreen';</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-immoo-navy">Utilisation Basique</h4>
                <div className="bg-immoo-navy p-4 rounded-lg text-immoo-pearl text-sm font-mono">
                  <div>&lt;ImmooSplashScreen</div>
                  <div className="ml-4">variant="dark"</div>
                  <div className="ml-4">duration={"{3000}"}</div>
                  <div className="ml-4">onComplete={"{() => navigate('/')}"}</div>
                  <div>/&gt;</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-immoo-pearl rounded-lg">
              <h4 className="font-semibold text-immoo-navy mb-2">Propriétés Disponibles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">variant:</span> 'light' | 'dark'
                </div>
                <div>
                  <span className="font-medium">duration:</span> number (ms)
                </div>
                <div>
                  <span className="font-medium">onComplete:</span> () => void
                </div>
                <div>
                  <span className="font-medium">autoHide:</span> boolean
                </div>
                <div>
                  <span className="font-medium">showProgress:</span> boolean
                </div>
                <div>
                  <span className="font-medium">className:</span> string
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #111827;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #111827;
        }
      `}</style>
    </div>
  );
}
