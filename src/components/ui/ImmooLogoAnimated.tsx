import { useState, useEffect, useRef } from 'react';

interface ImmooLogoAnimatedProps {
  className?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export default function ImmooLogoAnimated({ 
  className = "", 
  onClick, 
  variant = 'light',
  size = 'medium'
}: ImmooLogoAnimatedProps) {
  const [eyePositions, setEyePositions] = useState({ x: 0, y: 0 });
  const logoRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
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
  }, []);

  const isDark = variant === 'dark';

  // Définir les tailles selon le prop size (même config que ImmooLogo)
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
            className={`${config.pupilSize} rounded-full transition-transform duration-300 ease-out shadow-sm`}
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
          {/* Pupille droite animée (même position que la gauche pour synchronisation) */}
          <div 
            className={`${config.pupilSize} rounded-full transition-transform duration-300 ease-out shadow-sm`}
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