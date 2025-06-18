import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    screenWidth: 0,
    screenHeight: 0
  });

  useEffect(() => {
    const detectDevice = () => {
      // Détecter les capacités tactiles
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 || 
                           (navigator as any).msMaxTouchPoints > 0;
      
      // Obtenir les dimensions de l'écran
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Analyser le user agent
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Classifier l'appareil basé sur la taille d'écran et les capacités tactiles
      const isMobile = isTouchDevice && screenWidth <= 768;
      const isTablet = isTouchDevice && screenWidth > 768 && screenWidth <= 1024;
      const isDesktop = !isTouchDevice || (!isMobile && !isTablet);

      // Cas spéciaux pour certains appareils
      const isIpad = /iPad/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Ajuster pour iPad qui peut être détecté comme desktop
      let finalIsMobile = isMobile;
      let finalIsTablet = isTablet || isIpad;
      let finalIsDesktop = isDesktop && !isIpad;

      // Si c'est un appareil tactile mais avec un grand écran, c'est probablement une tablette
      if (isTouchDevice && screenWidth > 1024) {
        finalIsTablet = true;
        finalIsDesktop = false;
      }

      setDeviceInfo({
        isMobile: finalIsMobile,
        isTablet: finalIsTablet,
        isDesktop: finalIsDesktop,
        hasTouch: isTouchDevice,
        screenWidth,
        screenHeight
      });
    };

    // Détecter au chargement
    detectDevice();

    // Réévaluer lors du redimensionnement
    const handleResize = () => {
      detectDevice();
    };

    // Réévaluer lors du changement d'orientation (mobile/tablette)
    const handleOrientationChange = () => {
      // Attendre un peu pour que les dimensions soient mises à jour
      setTimeout(detectDevice, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
} 