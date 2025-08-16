import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si l'utilisateur est sur un appareil mobile
 * basé sur la largeur de l'écran et les user agents
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Vérification basée sur la largeur de l'écran
      const isSmallScreen = window.innerWidth < breakpoint;
      
      // Vérification basée sur le user agent (optionnel)
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Combinaison des deux critères (priorité à la largeur d'écran)
      setIsMobile(isSmallScreen || isMobileUserAgent);
    };

    // Vérification initiale
    checkIsMobile();

    // Écouter les changements de taille d'écran
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);

    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook pour obtenir des informations détaillées sur l'appareil
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    userAgent: '',
    platform: ''
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        userAgent,
        platform
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}