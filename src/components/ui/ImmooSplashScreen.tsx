import { useState, useEffect } from 'react';
import ImmooLogoAnimated from './ImmooLogoAnimated';

interface ImmooSplashScreenProps {
  onComplete?: () => void;
  duration?: number; // Duration in milliseconds
  className?: string;
  variant?: 'light' | 'dark';
  showProgress?: boolean;
  autoHide?: boolean;
}

export default function ImmooSplashScreen({ 
  onComplete,
  duration = 3000,
  className = "",
  variant = 'dark',
  showProgress = true,
  autoHide = true
}: ImmooSplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [animationStage, setAnimationStage] = useState<'loading' | 'complete' | 'fadeOut'>('loading');

  useEffect(() => {
    if (!autoHide) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 50));
        if (newProgress >= 100) {
          clearInterval(interval);
          setAnimationStage('complete');
          
          // Wait a bit before starting fade out
          setTimeout(() => {
            setAnimationStage('fadeOut');
            
            // Complete fade out and call onComplete
            setTimeout(() => {
              setIsVisible(false);
              onComplete?.();
            }, 500);
          }, 300);
          
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete, autoHide]);

  if (!isVisible) return null;

  const isDark = variant === 'dark';

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${
        animationStage === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      } ${
        isDark 
          ? 'bg-gradient-to-br from-immoo-navy via-immoo-navy/95 to-immoo-navy/90' 
          : 'bg-gradient-to-br from-immoo-pearl via-white to-immoo-pearl/80'
      } ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: isDark 
            ? `radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), 
               radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)`
            : `radial-gradient(circle at 25% 25%, rgba(17, 24, 39, 0.1) 0%, transparent 50%), 
               radial-gradient(circle at 75% 75%, rgba(17, 24, 39, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with entrance animation */}
        <div 
          className={`transform transition-all duration-1000 ${
            animationStage === 'loading' 
              ? 'scale-110 translate-y-0' 
              : animationStage === 'complete'
              ? 'scale-100 translate-y-0'
              : 'scale-95 translate-y-1'
          }`}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className={`absolute inset-0 blur-xl transition-opacity duration-1000 ${
              animationStage === 'complete' ? 'opacity-30' : 'opacity-0'
            } ${
              isDark ? 'bg-immoo-gold/20' : 'bg-immoo-navy/20'
            } rounded-full scale-150`} />
            
            {/* Logo */}
            <div className="relative">
              <ImmooLogoAnimated 
                size="xlarge" 
                variant={variant}
                className="drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div 
          className={`text-center space-y-2 transform transition-all duration-1000 delay-300 ${
            animationStage === 'loading' 
              ? 'opacity-0 translate-y-4' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <h1 className={`text-2xl font-bold tracking-wider ${
            isDark ? 'text-immoo-pearl' : 'text-immoo-navy'
          }`}>
            IMMOO
          </h1>
          <p className={`text-sm font-medium ${
            isDark ? 'text-immoo-pearl/70' : 'text-immoo-navy/70'
          }`}>
            Trouve ton futur chez toi
          </p>
        </div>

        {/* Loading Progress */}
        {showProgress && (
          <div 
            className={`w-64 space-y-3 transform transition-all duration-1000 delay-500 ${
              animationStage === 'loading' 
                ? 'opacity-0 translate-y-4' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Progress Bar */}
            <div className={`h-1 rounded-full overflow-hidden ${
              isDark ? 'bg-immoo-pearl/20' : 'bg-immoo-navy/20'
            }`}>
              <div 
                className={`h-full transition-all duration-100 ease-out ${
                  isDark 
                    ? 'bg-gradient-to-r from-immoo-gold to-immoo-pearl' 
                    : 'bg-gradient-to-r from-immoo-navy to-immoo-gold'
                } rounded-full`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Loading Text */}
            <div className="flex items-center justify-between text-xs">
              <span className={`${
                isDark ? 'text-immoo-pearl/60' : 'text-immoo-navy/60'
              }`}>
                Chargement...
              </span>
              <span className={`font-mono ${
                isDark ? 'text-immoo-pearl/60' : 'text-immoo-navy/60'
              }`}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {animationStage === 'complete' && (
          <div 
            className={`text-center transform transition-all duration-500 ${
              animationStage === 'complete' 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
          >
            <p className={`text-sm font-medium ${
              isDark ? 'text-immoo-gold' : 'text-immoo-navy'
            }`}>
              ✨ Prêt à explorer !
            </p>
          </div>
        )}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-float ${
              isDark ? 'bg-immoo-gold/20' : 'bg-immoo-navy/20'
            }`}
            style={{
              left: `${15 + (i * 15)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i * 0.5)}s`,
            }}
          />
        ))}
      </div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(90vh) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(-10vh) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-20vh) scale(0);
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
