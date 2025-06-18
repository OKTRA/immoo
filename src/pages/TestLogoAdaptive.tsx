import { useState, useEffect } from 'react';
import ImmooLogoAdaptive from '@/components/ui/ImmooLogoAdaptive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Monitor, Tablet, Eye, MousePointer } from 'lucide-react';

export default function TestLogoAdaptive() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    hasTouch: false,
    userAgent: '',
    screenWidth: 0,
    screenHeight: 0
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 || 
                           (navigator as any).msMaxTouchPoints > 0;
      
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTabletUserAgent = /iPad|Android/i.test(navigator.userAgent) && screenWidth >= 768;
      
      const isMobile = isTouchDevice && screenWidth <= 768;
      const isTablet = isTouchDevice && screenWidth > 768 && screenWidth <= 1024;
      const isDesktop = !isTouchDevice || screenWidth > 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        hasTouch: isTouchDevice,
        userAgent: navigator.userAgent,
        screenWidth,
        screenHeight
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="w-6 h-6 text-immoo-gold" />;
    if (deviceInfo.isTablet) return <Tablet className="w-6 h-6 text-immoo-gold" />;
    return <Monitor className="w-6 h-6 text-immoo-gold" />;
  };

  const getAnimationMode = () => {
    if (deviceInfo.isMobile || deviceInfo.isTablet) {
      return "Animation automatique (aléatoire)";
    }
    return "Suivi de la souris";
  };

  return (
    <div className="min-h-screen bg-immoo-pearl p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-immoo-navy mb-4">
            Test Logo Adaptatif IMMOO
          </h1>
          <p className="text-lg text-immoo-navy/70">
            Testez le comportement du logo sur différents appareils
          </p>
        </div>

        {/* Logo principal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Logo Adaptatif en Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              {/* Different sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium text-immoo-navy">Small</span>
                  <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <ImmooLogoAdaptive size="small" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium text-immoo-navy">Medium</span>
                  <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <ImmooLogoAdaptive size="medium" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium text-immoo-navy">Large</span>
                  <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <ImmooLogoAdaptive size="large" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium text-immoo-navy">XLarge</span>
                  <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <ImmooLogoAdaptive size="xlarge" />
                  </div>
                </div>
              </div>

              {/* Dark variant */}
              <div className="w-full">
                <h3 className="text-lg font-semibold text-immoo-navy mb-4 text-center">
                  Variante Sombre
                </h3>
                <div className="flex justify-center">
                  <ImmooLogoAdaptive size="large" variant="dark" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getDeviceIcon()}
                Informations de l'appareil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Type d'appareil:</span>
                  <span className="text-sm font-medium text-immoo-navy">
                    {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablette' : 'Desktop'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Écran tactile:</span>
                  <span className="text-sm font-medium text-immoo-navy">
                    {deviceInfo.hasTouch ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Résolution:</span>
                  <span className="text-sm font-medium text-immoo-navy">
                    {deviceInfo.screenWidth} x {deviceInfo.screenHeight}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {deviceInfo.hasTouch ? <Eye className="w-5 h-5" /> : <MousePointer className="w-5 h-5" />}
                Mode d'animation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-immoo-navy/70">Mode actuel:</span>
                  <span className="text-sm font-medium text-immoo-navy">
                    {getAnimationMode()}
                  </span>
                </div>
                <div className="text-xs text-immoo-navy/60 mt-3">
                  {deviceInfo.hasTouch ? (
                    "Les pupilles bougent automatiquement de manière aléatoire toutes les 0.8 à 2.5 secondes"
                  ) : (
                    "Les pupilles suivent le mouvement de votre souris en temps réel"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceInfo.hasTouch ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📱 Mode Appareil Tactile</h4>
                  <p className="text-sm text-blue-800">
                    Vous êtes sur un appareil tactile. Les pupilles du logo bougent automatiquement 
                    de manière aléatoire et synchrone. Observez les mouvements spontanés !
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🖱️ Mode Desktop</h4>
                  <p className="text-sm text-green-800">
                    Vous êtes sur un appareil desktop. Bougez votre souris autour des logos 
                    pour voir les pupilles vous suivre du regard !
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔄 Test de Redimensionnement</h4>
                <p className="text-sm text-gray-800">
                  Redimensionnez votre fenêtre de navigateur pour voir le logo s'adapter automatiquement 
                  au changement de taille d'écran.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Agent Info (for debugging) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Informations techniques (debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600 break-all">
              <strong>User Agent:</strong> {deviceInfo.userAgent}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}