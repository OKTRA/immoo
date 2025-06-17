import { useState, useEffect, useRef } from 'react';

interface ImmooLogoProps {
  className?: string;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export default function ImmooLogo({ className = "", onClick, size = 'medium' }: ImmooLogoProps) {
  const [eyePositions, setEyePositions] = useState({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } });
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

      setEyePositions({
        left: calculatePupilPosition(leftEyeCenterX, eyeCenterY),
        right: calculatePupilPosition(rightEyeCenterX, eyeCenterY)
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      className={`inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      {/* IMM en texte normal */}
      <span className={`font-extrabold tracking-tight flex items-center ${config.textSize}`} style={{ color: '#D97706' }}>
        IMM
      </span>
      
      {/* Premier oeil (O) */}
      <div className={`relative ${config.spacing} flex items-center justify-center`}>
        <div className={`${config.eyeSize} rounded-full ${config.borderWidth} border-black shadow-lg bg-white flex items-center justify-center ring-1 ring-black/20`}>
          {/* Pupille gauche */}
          <div 
            className={`${config.pupilSize} rounded-full transition-transform duration-100 ease-out shadow-sm`}
            style={{
              backgroundColor: '#D97706',
              transform: `translate(${eyePositions.left.x}px, ${eyePositions.left.y}px)`
            }}
          />
        </div>
      </div>
      
      {/* Deuxième oeil (O) */}
      <div className={`relative ${config.spacing} flex items-center justify-center`}>
        <div className={`${config.eyeSize} rounded-full ${config.borderWidth} border-black shadow-lg bg-white flex items-center justify-center ring-1 ring-black/20`}>
          {/* Pupille droite */}
          <div 
            className={`${config.pupilSize} rounded-full transition-transform duration-100 ease-out shadow-sm`}
            style={{
              backgroundColor: '#D97706',
              transform: `translate(${eyePositions.right.x}px, ${eyePositions.right.y}px)`
            }}
          />
        </div>
      </div>
    </div>
  );
} 