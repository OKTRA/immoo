import { useState } from 'react';
import { Download, Eye, Palette, Smartphone, Monitor, FileImage, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImmooLogo from '@/components/ui/ImmooLogo';
import ImmooLogoAnimated from '@/components/ui/ImmooLogoAnimated';
import { generateAllFavicons, generateWebManifest, downloadFavicon } from '@/utils/generateFavicons';
import { getCssVarHslColor, getCssVarHexColor } from '@/utils/brandColors';
import { downloadOgImage } from '@/utils/generateOgImage';
// @ts-ignore
import GIF from 'gif.js';
import html2canvas from 'html2canvas';

interface LogoVariant {
  id: string;
  name: string;
  description: string;
  sizes: number[];
  formats: string[];
  backgroundColor: string;
  textColor: string;
  preview: React.ReactNode;
}

export default function LogoShowcasePage() {
  const [selectedVariant, setSelectedVariant] = useState<string>('primary');

  const logoVariants: LogoVariant[] = [
    {
      id: 'primary',
      name: 'Logo Principal',
      description: 'Version principale avec yeux interactifs',
      sizes: [32, 64, 128, 256, 512],
      formats: ['PNG', 'SVG', 'ICO'],
      backgroundColor: 'bg-white',
      textColor: 'text-immoo-navy',
      preview: <ImmooLogo size="large" />
    },
    {
      id: 'dark',
      name: 'Version Sombre',
      description: 'Pour les fonds sombres',
      sizes: [32, 64, 128, 256, 512],
      formats: ['PNG', 'SVG'],
      backgroundColor: 'bg-immoo-navy',
      textColor: 'text-white',
      preview: <div className="bg-immoo-navy p-4 rounded-lg"><ImmooLogo size="large" /></div>
    },
    {
      id: 'animated',
      name: 'Version Animée',
      description: 'Pupilles avec mouvements aléatoires synchrones',
      sizes: [32, 64, 128, 256, 512],
      formats: ['PNG', 'GIF'],
      backgroundColor: 'bg-white',
      textColor: 'text-immoo-navy',
      preview: <ImmooLogoAnimated size="large" variant="light" />
    },
    {
      id: 'animated-dark',
      name: 'Version Animée Sombre',
      description: 'Animation sur fond sombre',
      sizes: [32, 64, 128, 256, 512],
      formats: ['PNG', 'GIF'],
      backgroundColor: 'bg-immoo-navy',
      textColor: 'text-white',
      preview: <ImmooLogoAnimated size="large" variant="dark" />
    },
    {
      id: 'minimal',
      name: 'Version Minimaliste',
      description: 'Yeux simples sans bordure',
      sizes: [16, 24, 32, 48, 64],
      formats: ['PNG', 'SVG', 'ICO'],
      backgroundColor: 'bg-immoo-pearl',
      textColor: 'text-immoo-navy',
      preview: <ImmooLogo size="large" />
    },
    {
      id: 'favicon',
      name: 'Favicon',
      description: 'Optimisé pour les petites tailles',
      sizes: [16, 32, 48, 64],
      formats: ['ICO', 'PNG'],
      backgroundColor: 'bg-white',
      textColor: 'text-immoo-gold',
      preview: <ImmooLogo size="medium" />
    }
  ];

  const useCases = [
    {
      icon: Monitor,
      title: 'Site Web',
      description: 'Logo principal pour header et footer',
      recommendedSizes: '128px, 256px',
      format: 'SVG, PNG'
    },
    {
      icon: Smartphone,
      title: 'Applications Mobile',
      description: 'Icônes d\'application et splash screens',
      recommendedSizes: '512px, 1024px',
      format: 'PNG'
    },
    {
      icon: FileImage,
      title: 'Documents',
      description: 'Présentations et documents officiels',
      recommendedSizes: '256px, 512px',
      format: 'PNG, SVG'
    },
    {
      icon: Eye,
      title: 'Favicon',
      description: 'Icône du navigateur',
      recommendedSizes: '16px, 32px, 48px',
      format: 'ICO, PNG'
    }
  ];

  const generateLogoSVG = (variant: LogoVariant, size: number) => {
    const brandHsl = getCssVarHslColor('--immoo-gold', '#3F8EFC');
    const svgContent = `
      <svg width="${size * 1.1}" height="${size * 0.4}" viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .logo-text { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 24px; }
            .eye-outer { fill: white; stroke: black; stroke-width: 2; }
            .pupil { fill: ${brandHsl}; }
          </style>
        </defs>
        
        <!-- IMM Text -->
        <text x="10" y="50" class="logo-text" fill="${brandHsl}">IMM</text>
        
        <!-- Left Eye -->
        <circle cx="130" cy="40" r="16" class="eye-outer"/>
        <circle cx="130" cy="40" r="6" class="pupil"/>
        
        <!-- Right Eye -->
        <circle cx="180" cy="40" r="16" class="eye-outer"/>
        <circle cx="180" cy="40" r="6" class="pupil"/>
      </svg>
    `;
    return svgContent.trim();
  };

  // Fonction pour dessiner le logo avec bordures parfaites
  const drawLogoWithBorders = (variant: LogoVariant, size: number, format: string) => {
    const canvas = document.createElement('canvas');
    const padding = size * 0.15;
    
    // Calculer la largeur nécessaire basée sur les vraies proportions
    const fontSize = size * 0.3;
    const eyeDiameter = fontSize * 1.3;
    const eyeSpacing = fontSize * 0.2;
    
    // Largeur approximative du texte "IMM" (environ 2.5x la taille de police)
    const textWidth = fontSize * 2.5;
    const totalWidth = textWidth + (eyeSpacing * 3) + (eyeDiameter * 2) + (padding * 2);
    
    canvas.width = totalWidth;
    canvas.height = fontSize * 1.5 + padding * 2;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Fond
    ctx.fillStyle = variant.backgroundColor.includes('navy') ? '#111827' : '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Utiliser les variables déjà calculées
    const eyeRadius = eyeDiameter / 2;
    
    // Texte IMM avec les bonnes proportions
    ctx.fillStyle = getCssVarHslColor('--immoo-gold', '#3F8EFC');
    ctx.font = `800 ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    
    const textY = canvas.height / 2;
    const textX = padding;
    ctx.fillText('IMM', textX, textY);
    
    // Mesurer la largeur réelle du texte pour positionner les yeux
    const actualTextWidth = ctx.measureText('IMM').width;
    
    // Paramètres des yeux avec les vraies proportions
    const eyeY = textY;
    const leftEyeX = textX + actualTextWidth + eyeSpacing + eyeRadius;
    const rightEyeX = leftEyeX + eyeDiameter + eyeSpacing;
    
    // Fonction pour dessiner un oeil avec bordure
    const drawEye = (centerX: number, centerY: number) => {
      // Ombre externe
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      
      // Fond blanc de l'oeil
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, eyeRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Réinitialiser l'ombre
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Bordure noire épaisse proportionnelle
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, fontSize * 0.05);
      ctx.beginPath();
      ctx.arc(centerX, centerY, eyeRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Bordure interne pour l'effet brillant
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = Math.max(1, fontSize * 0.02);
      ctx.beginPath();
      ctx.arc(centerX, centerY, eyeRadius - Math.max(1, fontSize * 0.02), 0, 2 * Math.PI);
      ctx.stroke();
      
      // Pupille avec ombre (proportionnelle comme dans le vrai composant)
      const pupilRadius = eyeRadius * 0.5; // Plus proche des vraies proportions
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      
      ctx.fillStyle = getCssVarHslColor('--immoo-gold', '#3F8EFC');
      ctx.beginPath();
      ctx.arc(centerX, centerY, pupilRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Réinitialiser l'ombre
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };
    
    // Dessiner les deux yeux
    drawEye(leftEyeX, eyeY);
    drawEye(rightEyeX, eyeY);
    
    // Télécharger
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `immoo-logo-${variant.id}-${size}.${format.toLowerCase()}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, `image/${format.toLowerCase()}`);
  };



  const downloadLogo = (variant: LogoVariant, size: number, format: string) => {
    if (variant.id.includes('animated') && format === 'GIF') {
      downloadAnimatedGif(variant, size);
    } else if (format === 'SVG') {
      // Pour SVG, utiliser la génération vectorielle
      const svgContent = generateLogoSVG(variant, size);
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `immoo-logo-${variant.id}-${size}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Pour PNG et autres formats, utiliser le dessin direct
      drawLogoWithBorders(variant, size, format);
    }
  };

  const downloadAnimatedGif = (variant: LogoVariant, size: number) => {
    const padding = size * 0.15;
    
    // Calculer la largeur nécessaire basée sur les vraies proportions
    const fontSize = size * 0.3;
    const eyeDiameter = fontSize * 1.3;
    const eyeSpacing = fontSize * 0.2;
    
    // Largeur approximative du texte "IMM" (environ 2.5x la taille de police)
    const textWidth = fontSize * 2.5;
    const totalWidth = textWidth + (eyeSpacing * 3) + (eyeDiameter * 2) + (padding * 2);
    
    const canvasWidth = totalWidth;
    const canvasHeight = fontSize * 1.5 + padding * 2;
    
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvasWidth,
      height: canvasHeight,
      workerScript: '/gif.worker.js'
    });

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Paramètres de l'animation
    const frameCount = 30; // 30 frames pour l'animation plus fluide
    const frameDuration = 150; // 150ms par frame pour une animation plus naturelle
    
    // Générer les frames d'animation
    const brandHsl = getCssVarHslColor('--immoo-gold', '#3F8EFC');
    for (let frame = 0; frame < frameCount; frame++) {
      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fond
      ctx.fillStyle = variant.backgroundColor.includes('navy') ? '#111827' : '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Utiliser les variables déjà calculées
      const eyeRadius = eyeDiameter / 2;
      
      // Texte IMM avec les bonnes proportions
      ctx.fillStyle = brandHsl as unknown as string;
      ctx.font = `800 ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      
      const textY = canvas.height / 2;
      const textX = padding;
      ctx.fillText('IMM', textX, textY);
      
      // Mesurer la largeur réelle du texte pour positionner les yeux
      const actualTextWidth = ctx.measureText('IMM').width;
      
      // Paramètres des yeux avec les vraies proportions
      const eyeY = textY;
      const leftEyeX = textX + actualTextWidth + eyeSpacing + eyeRadius;
      const rightEyeX = leftEyeX + eyeDiameter + eyeSpacing;
      
      // Animation plus naturelle avec plusieurs mouvements
      const time = frame / frameCount;
      const angle1 = time * Math.PI * 2;
      const angle2 = time * Math.PI * 4 + Math.PI / 3;
      const angle3 = time * Math.PI * 6 + Math.PI / 6;
      
      // Combiner plusieurs mouvements pour un effet plus naturel
      const pupilOffsetX = (Math.cos(angle1) * 2 + Math.cos(angle2) * 1.5 + Math.cos(angle3) * 0.5) * 0.8;
      const pupilOffsetY = (Math.sin(angle1) * 2 + Math.sin(angle2) * 1.5 + Math.sin(angle3) * 0.5) * 0.8;
      
      // Fonction pour dessiner un oeil animé avec bordure épaisse
      const drawAnimatedEye = (centerX: number, centerY: number) => {
        // Ombre externe
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;
        
        // Fond blanc de l'oeil
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Réinitialiser l'ombre
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Bordure noire épaisse proportionnelle
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, fontSize * 0.05);
        ctx.beginPath();
        ctx.arc(centerX, centerY, eyeRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Pupille animée avec ombre (proportionnelle)
        const pupilRadius = eyeRadius * 0.5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = brandHsl as unknown as string;
        ctx.beginPath();
        ctx.arc(centerX + pupilOffsetX, centerY + pupilOffsetY, pupilRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Réinitialiser l'ombre
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      };
      
      // Dessiner les deux yeux animés
      drawAnimatedEye(leftEyeX, eyeY);
      drawAnimatedEye(rightEyeX, eyeY);
      
      // Ajouter cette frame au GIF
      gif.addFrame(canvas, { delay: frameDuration });
    }
    
    // Finaliser et télécharger le GIF
    gif.on('finished', function(blob: Blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `immoo-logo-${variant.id}-${size}.gif`;
      a.click();
      URL.revokeObjectURL(url);
    });
    
    gif.render();
  };

  const selectedVariantData = logoVariants.find(v => v.id === selectedVariant);

  return (
    <div className="min-h-screen bg-immoo-pearl">
      {/* Header */}
      <div className="bg-immoo-navy text-immoo-pearl py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <ImmooLogo size="xlarge" />
          </div>
          <h1 className="text-4xl font-bold mb-4">IMMOO Logo Showcase</h1>
          <p className="text-xl text-immoo-pearl/80 max-w-2xl mx-auto">
            Téléchargez le logo IMMOO dans différents formats et tailles pour tous vos besoins.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sélecteur de variantes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Variantes du Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logoVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedVariant === variant.id
                        ? 'border-immoo-gold bg-immoo-gold/10'
                        : 'border-immoo-gray hover:border-immoo-gold/50'
                    }`}
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    <div className="flex items-center justify-center mb-3 h-16">
                      {variant.preview}
                    </div>
                    <h3 className="font-semibold text-immoo-navy">{variant.name}</h3>
                    <p className="text-sm text-immoo-gray">{variant.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Zone de téléchargement */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Télécharger - {selectedVariantData?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedVariantData?.sizes.map((size) => (
                    <div key={size} className="border border-immoo-gray rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-immoo-navy">{size}x{Math.round(size * 0.4)}px</h4>
                        <span className="text-sm text-immoo-gray">{size <= 64 ? 'Petit' : size <= 256 ? 'Moyen' : 'Grand'}</span>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {selectedVariantData.formats.map((format) => (
                          <Button
                            key={format}
                            variant="outline"
                            size="sm"
                            onClick={() => downloadLogo(selectedVariantData, size, format)}
                            className="border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-white"
                          >
                            {format}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section Animations */}
            {selectedVariantData?.id.includes('animated') && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Animations Spéciales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-immoo-pearl p-6 rounded-lg">
                    <h4 className="font-semibold text-immoo-navy mb-4">Aperçu Live de l'Animation</h4>
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-8 rounded-lg shadow-md">
                        {selectedVariantData.id === 'animated' ? (
                          <ImmooLogoAnimated size="xlarge" variant="light" />
                        ) : (
                          <ImmooLogoAnimated size="xlarge" variant="dark" />
                        )}
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-immoo-gray">
                        ✨ Les pupilles bougent de manière synchrone et aléatoire
                      </p>
                      <p className="text-sm text-immoo-gray">
                        ⏱️ Nouvelle position toutes les 0.8 à 2.5 secondes
                      </p>
                      <p className="text-sm text-immoo-gray">
                        🎯 Mouvement fluide avec transition de 300ms
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guide d'utilisation */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Guide d'Utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {useCases.map((useCase, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-immoo-gold/10">
                          <useCase.icon className="w-6 h-6 text-immoo-gold" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-immoo-navy mb-1">{useCase.title}</h4>
                        <p className="text-sm text-immoo-gray mb-2">{useCase.description}</p>
                        <div className="text-xs text-immoo-navy">
                          <div><strong>Tailles:</strong> {useCase.recommendedSizes}</div>
                          <div><strong>Format:</strong> {useCase.format}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section Favicons */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Favicons & PWA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-immoo-navy">Favicons Individuels</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[16, 32, 48, 64].map((size) => (
                          <Button
                          key={size}
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFavicon(size, 'png')}
                            className="border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-white"
                        >
                          {size}×{size} PNG
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[180, 192, 512].map((size) => (
                          <Button
                          key={size}
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFavicon(size, 'png')}
                            className="border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-white"
                        >
                          {size}×{size} PNG
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-immoo-navy">Pack Complet</h4>
                    <div className="space-y-3">
                      <Button
                        onClick={generateAllFavicons}
                        className="w-full bg-immoo-gold text-white hover:bg-immoo-gold/90 transition-opacity"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger Tous les Favicons
                      </Button>
                      <Button
                        onClick={generateWebManifest}
                        variant="outline"
                        className="w-full border-immoo-navy text-immoo-navy hover:bg-immoo-navy hover:text-white"
                      >
                        <FileImage className="w-4 h-4 mr-2" />
                        Générer manifest.json
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-4 bg-immoo-pearl rounded-lg">
                      <h5 className="font-medium text-immoo-navy mb-2">Aperçu Favicon</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-immoo-gray rounded flex items-center justify-center">
                          <div className="text-xs font-extrabold flex items-center text-immoo-gold">
                            <span className="w-1.5 h-1.5 rounded-full border border-black bg-white flex items-center justify-center mr-0.5">
                              <span className="w-0.5 h-0.5 rounded-full bg-immoo-gold"></span>
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full border border-black bg-white flex items-center justify-center">
                              <span className="w-0.5 h-0.5 rounded-full bg-immoo-gold"></span>
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-immoo-gray">Favicon 32×32</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section OG Image */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="w-5 h-5" />
                  Image Open Graph (OG)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Image de votre page d'accueil optimisée pour les réseaux sociaux et le partage de liens
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-immoo-navy">Génération OG Image</h4>
                      <Button
                        onClick={downloadOgImage}
                        className="w-full bg-immoo-gold text-white hover:bg-immoo-gold/90 transition-opacity"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger OG Image (1200×630)
                      </Button>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Format: PNG 1200×630px</p>
                        <p>• Optimisé pour Facebook, Twitter, LinkedIn</p>
                        <p>• Page d'accueil IMMOO avec interface de recherche</p>
                        <p>• Design moderne et professionnel</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-immoo-navy">Aperçu OG Image</h4>
                      <div className="p-4 bg-immoo-pearl rounded-lg">
                        <div className="aspect-[1200/630] bg-gradient-to-b from-blue-50 to-white rounded-lg relative overflow-hidden border border-gray-200">
                          {/* Header */}
                          <div className="absolute top-0 left-0 right-0 h-6 bg-white border-b border-gray-200 flex items-center px-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-immoo-navy">IMM</span>
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-immoo-navy rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-white border border-immoo-navy rounded-full"></div>
                              </div>
                            </div>
                            <div className="ml-auto flex space-x-1">
                              <div className="w-8 h-3 bg-gray-100 rounded text-[6px] text-gray-500 flex items-center justify-center">Espace</div>
                              <div className="w-8 h-3 bg-immoo-navy rounded text-[6px] text-white flex items-center justify-center">Agency</div>
                              <div className="w-4 h-3 bg-gray-100 rounded text-[6px] text-gray-500 flex items-center justify-center">EN</div>
                            </div>
                          </div>
                          
                          {/* Titre principal */}
                          <div className="absolute top-8 left-0 right-0 text-center">
                            <div className="text-[8px] font-bold text-immoo-navy">Trouve ton futur chez toi</div>
                          </div>
                          
                          {/* Carte de recherche */}
                          <div className="absolute top-16 left-2 right-2 bottom-2 bg-white rounded border border-gray-200">
                            {/* Onglets */}
                            <div className="flex space-x-1 p-1">
                              <div className="w-8 h-2 bg-immoo-navy rounded text-[4px] text-white flex items-center justify-center">Prop</div>
                              <div className="w-8 h-2 bg-gray-100 rounded text-[4px] text-gray-500 flex items-center justify-center">Agences</div>
                            </div>
                            
                            {/* Barre de recherche */}
                            <div className="mx-1 mt-1 h-3 bg-white border border-gray-300 rounded flex items-center px-1">
                              <div className="w-1 h-1 border border-gray-400 rounded-full"></div>
                              <div className="ml-1 text-[4px] text-gray-400">Rechercher...</div>
                              <div className="ml-auto w-4 h-2 bg-immoo-navy rounded text-[4px] text-white flex items-center justify-center">Rechercher</div>
                            </div>
                            
                            {/* Filtres */}
                            <div className="flex space-x-1 mx-1 mt-1">
                              <div className="flex-1 h-2 bg-white border border-gray-300 rounded flex items-center px-1">
                                <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                                <span className="ml-1 text-[4px] text-gray-500">Localisation</span>
                              </div>
                              <div className="flex-1 h-2 bg-white border border-gray-300 rounded flex items-center px-1">
                                <div className="w-1 h-1 bg-gray-500"></div>
                                <span className="ml-1 text-[4px] text-gray-500">Type</span>
                              </div>
                              <div className="flex-1 h-2 bg-white border border-gray-300 rounded flex items-center px-1">
                                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                <span className="ml-1 text-[4px] text-gray-500">Budget</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-immoo-gray mt-2 text-center">Aperçu de la page d'accueil IMMOO</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 