import { useState, useEffect, useRef } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface ImmooLogoAdaptiveProps {
  className?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export default function ImmooLogoAdaptive({ 
  className = "", 
  onClick, 
  variant = 'light',
  size = 'medium'
}: ImmooLogoAdaptiveProps) {
  const [eyePositions, setEyePositions] = useState({ x: 0, y: 0 });
  const deviceInfo = useDeviceDetection();
  const logoRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout>();

  // Déterminer si on utilise l'animation automatique
  const useAutoAnimation = deviceInfo.isMobile || deviceInfo.isTablet;

  // Animation automatique pour appareils mobiles/tactiles
  useEffect(() => {
    if (!useAutoAnimation) return;

    const animateEyes = () => {
      // Générer des mouvements aléatoires synchrones pour les deux yeux
      const maxDistance = 4; // Distance maximale de mouvement
      const angle = Math.random() * Math.PI * 2; // Angle aléatoire
      const distance = Math.random() * maxDistance; // Distance aléatoire
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      setEyePositions({ x, y });
      
      // Programmer la prochaine animation entre 800ms et 2500ms
      const nextDelay = 800 + Math.random() * 1700;
      animationRef.current = setTimeout(animateEyes, nextDelay);
    };

    // Démarrer l'animation après un délai initial
    const initialDelay = 500 + Math.random() * 1000;
    animationRef.current = setTimeout(animateEyes, initialDelay);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [useAutoAnimation]);

  // Suivi de souris pour appareils desktop
  useEffect(() => {
    if (useAutoAnimation) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return;

      const logoRect = logoRef.current.getBoundingClientRect();
      const logoCenterX = logoRect.left + logoRect.width / 2;
      const logoCenterY = logoRect.top + logoRect.height / 2;

      // Positions des yeux (gauche et droite)
      const leftEyeCenterX = logoCenterX - 15; // Ajuster selon la taille
      const rightEyeCenterX = logoCenterX + 15;
      const eyeCenterY = logoCenterY;

      // Calculer la direction pour chaque oeil
      const calculatePupilPosition = (eyeCenterX: number, eyeCenterY: number) => {
        const deltaX = e.clientX - eyeCenterX;
        const deltaY = e.clientY - eyeCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Limiter le mouvement de la pupille dans l'oeil
        const maxDistance = 6; // Rayon maximum de mouvement
        const factor = Math.min(distance, maxDistance) / distance;
        
        return {
          x: deltaX * factor * 0.3, // Réduire la sensibilité
          y: deltaY * factor * 0.3
        };
      };

      const leftPos = calculatePupilPosition(leftEyeCenterX, eyeCenterY);
      const rightPos = calculatePupilPosition(rightEyeCenterX, eyeCenterY);

      // Pour desktop, on utilise la même position pour les deux yeux pour simplifier
      // Ou on peut utiliser des positions différentes comme dans l'original
      setEyePositions({ x: leftPos.x, y: leftPos.y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [useAutoAnimation]);

  const isDark = variant === 'dark';

  // Définir les tailles selon le prop size
  const sizeConfig = {
    small: {
      textSize: 'text-lg',
      eyeSize: 'w-6 h-6',
      pupilSize: 'w-2 h-2',
      spacing: 'mx-0.5',
      borderWidth: 'border-2'
    },
    medium: {
      textSize: 'text-2xl',
      eyeSize: 'w-8 h-8',
      pupilSize: 'w-3 h-3',
      spacing: 'mx-0.5',
      borderWidth: 'border-2'
    },
    large: {
      textSize: 'text-4xl',
      eyeSize: 'w-12 h-12',
      pupilSize: 'w-4 h-4',
      spacing: 'mx-1',
      borderWidth: 'border-3'
    },
    xlarge: {
      textSize: 'text-6xl',
      eyeSize: 'w-16 h-16',
      pupilSize: 'w-6 h-6',
      spacing: 'mx-1',
      borderWidth: 'border-4'
    }
  };

  const config = sizeConfig[size];

  return (
    <div 
      ref={logoRef}
      className={`inline-flex items-center justify-center cursor-pointer select-none ${className} ${
        isDark ? 'bg-immoo-navy p-4 rounded-lg' : ''
      }`}
      onClick={onClick}
      title={useAutoAnimation ? "Animation automatique" : "Suit le mouvement de la souris"}
    >
      {/* IMM en texte normal */}
      <span className={`font-extrabold tracking-tight flex items-center ${config.textSize}`} style={{ color: '#D97706' }}>
        IMM
      </span>
      
      {/* Premier oeil (O) */}
      <div className={`relative ${config.spacing} flex items-center justify-center`}>
        <div className={`${config.eyeSize} rounded-full ${config.borderWidth} border-black shadow-lg bg-white flex items-center justify-center ring-1 ring-black/20`}>
          {/* Pupille gauche animée */}
          <div 
            className={`${config.pupilSize} rounded-full transition-transform ${useAutoAnimation ? 'duration-300' : 'duration-100'} ease-out shadow-sm`}
            style={{
              backgroundColor: '#D97706',
              transform: `translate(${eyePositions.x}px, ${eyePositions.y}px)`
            }}
          />
        </div>
      </div>
      
      {/* Deuxième oeil (O) */}
      <div className={`relative ${config.spacing} flex items-center justify-center`}>
        <div className={`${config.eyeSize} rounded-full ${config.borderWidth} border-black shadow-lg bg-white flex items-center justify-center ring-1 ring-black/20`}>
          {/* Pupille droite animée (même position pour synchronisation) */}
          <div 
            className={`${config.pupilSize} rounded-full transition-transform ${useAutoAnimation ? 'duration-300' : 'duration-100'} ease-out shadow-sm`}
            style={{
              backgroundColor: '#D97706',
              transform: `translate(${eyePositions.x}px, ${eyePositions.y}px)`
            }}
          />
        </div>
      </div>


    </div>
  );
}
