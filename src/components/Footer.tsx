import { Heart, Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
  return (
    <footer className="bg-immoo-navy text-immoo-pearl border-t border-immoo-navy-light">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-immoo-gold mb-3">IMMOO</h3>
            <p className="text-sm text-immoo-pearl/70">
              Votre plateforme immobilière de confiance au Mali
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-md font-medium text-immoo-gold mb-3">Liens Rapides</h4>
            <div className="space-y-2">
              <Link 
                to="/pricing" 
                className="block text-sm text-immoo-pearl/70 hover:text-immoo-gold transition-colors duration-300"
              >
                Tarifs
              </Link>
              <Link 
                to="/immo-agency" 
                className="block text-sm text-immoo-pearl/70 hover:text-immoo-gold transition-colors duration-300"
              >
                IMMOO Agency
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-immoo-pearl/70 flex items-center justify-center md:justify-end gap-2">
              © {currentYear} {t('footer.madeWith')} 
              <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" /> 
              {t('footer.by')} 
              <a 
                href="https://www.oktra.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-immoo-gold font-semibold hover:text-immoo-gold-light transition-colors duration-300"
              >
                OKTRA
              </a>
            </p>
            <p className="text-xs text-immoo-pearl/50 mt-2">
              {t('footer.in')} {t('footer.mali')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
