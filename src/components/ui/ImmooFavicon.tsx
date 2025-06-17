import React, { useState, useEffect, useRef } from 'react';

interface ImmooFaviconProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const ImmooFavicon: React.FC<ImmooFaviconProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Configuration des tailles améliorées
  const sizeConfig = {
    small: {
      eyeSize: 18,
      pupilSize: 7,
      spacing: 6,
      borderWidth: 2,
    },
    medium: {
      eyeSize: 28,
      pupilSize: 11,
      spacing: 8,
      borderWidth: 3,
    },
    large: {
      eyeSize: 36,
      pupilSize: 14,
      spacing: 10,
      borderWidth: 3,
    },
    xlarge: {
      eyeSize: 48,
      pupilSize: 18,
      spacing: 12,
      borderWidth: 4,
    }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: e.clientX - centerX,
          y: e.clientY - centerY
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = (eyeIndex: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const maxDistance = (config.eyeSize - config.pupilSize) / 4;
    const distance = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2);
    const angle = Math.atan2(mousePosition.y, mousePosition.x);
    
    const constrainedDistance = Math.min(distance / 10, maxDistance);
    
    return {
      x: Math.cos(angle) * constrainedDistance,
      y: Math.sin(angle) * constrainedDistance
    };
  };

  const leftPupilPos = calculatePupilPosition(0);
  const rightPupilPos = calculatePupilPosition(1);

  const totalWidth = (config.eyeSize * 2) + config.spacing;

  return (
    <div 
      ref={containerRef}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: totalWidth, height: config.eyeSize }}
    >
      {/* Œil gauche */}
      <div 
        className="relative bg-white rounded-full shadow-xl ring-2 ring-black/30"
        style={{ 
          width: config.eyeSize, 
          height: config.eyeSize,
          border: `${config.borderWidth}px solid #000`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        <div 
          className="absolute rounded-full transition-all duration-300 ease-out"
          style={{ 
            width: config.pupilSize,
            height: config.pupilSize,
            backgroundColor: '#D97706', // Couleur or IMMOO
            left: `calc(50% + ${leftPupilPos.x}px - ${config.pupilSize/2}px)`,
            top: `calc(50% + ${leftPupilPos.y}px - ${config.pupilSize/2}px)`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
          }}
        />
      </div>

      {/* Espacement */}
      <div style={{ width: config.spacing }} />

      {/* Œil droit */}
      <div 
        className="relative bg-white rounded-full shadow-xl ring-2 ring-black/30"
        style={{ 
          width: config.eyeSize, 
          height: config.eyeSize,
          border: `${config.borderWidth}px solid #000`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        <div 
          className="absolute rounded-full transition-all duration-300 ease-out"
          style={{ 
            width: config.pupilSize,
            height: config.pupilSize,
            backgroundColor: '#D97706', // Couleur or IMMOO
            left: `calc(50% + ${rightPupilPos.x}px - ${config.pupilSize/2}px)`,
            top: `calc(50% + ${rightPupilPos.y}px - ${config.pupilSize/2}px)`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
          }}
        />
      </div>
    </div>
  );
};

export default ImmooFavicon; 