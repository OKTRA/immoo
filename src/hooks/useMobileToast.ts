import { toast } from 'sonner';
import { useIsMobile } from './useIsMobile';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: any;
}

/**
 * Hook pour gérer les toasts avec logique mobile
 * Désactive certains toasts non essentiels sur mobile pour améliorer l'UX
 */
export const useMobileToast = () => {
  const isMobile = useIsMobile();

  const showToast = (
    type: ToastType,
    message: string,
    options?: ToastOptions,
    isEssential = false
  ) => {
    // Sur mobile, ne montrer que les toasts essentiels (erreurs et actions importantes)
    if (isMobile && !isEssential) {
      // Messages non essentiels ignorés sur mobile :
      // - Changements de langue
      // - Confirmations de sauvegarde simples
      // - Messages de succès pour actions mineures
      const nonEssentialPatterns = [
        /langue/i,
        /language/i,
        /sauvegardé/i,
        /saved/i,
        /mis à jour/i,
        /updated/i,
        /téléchargé/i,
        /uploaded/i
      ];

      const isNonEssential = nonEssentialPatterns.some(pattern => 
        pattern.test(message) || 
        (options?.description && pattern.test(options.description))
      );

      if (isNonEssential && type === 'success') {
        return; // Ignorer ce toast sur mobile
      }
    }

    // Afficher le toast
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
    }
  };

  return {
    success: (message: string, options?: ToastOptions, isEssential = false) => 
      showToast('success', message, options, isEssential),
    error: (message: string, options?: ToastOptions) => 
      showToast('error', message, options, true), // Erreurs toujours essentielles
    info: (message: string, options?: ToastOptions, isEssential = false) => 
      showToast('info', message, options, isEssential),
    warning: (message: string, options?: ToastOptions, isEssential = true) => 
      showToast('warning', message, options, isEssential),
  };
};