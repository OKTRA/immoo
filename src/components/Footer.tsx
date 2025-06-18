import { useNavigate } from "react-router-dom";
import { ButtonEffects } from "./ui/ButtonEffects";

import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Mail
} from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const handleNavigation = (path: string) => {
    // Si c'est un lien d'ancrage
    if (path.startsWith('#')) {
      // Toujours naviguer d'abord vers la page d'accueil
      navigate('/');
      // Attendre que la navigation soit terminée avant de scroller
      setTimeout(() => {
        const element = document.querySelector(path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Pour les autres chemins, utiliser navigate
      navigate(path);
    }
  };
  
  const footerLinks = [
    {
      title: "Plateforme",
      links: [
        { name: "Accueil", href: "/" },
        { name: "Recherche", href: "/search" },
        { name: "Propriétés", href: "/#properties" },
        { name: "Agences", href: "/#agencies" },
        { name: "Tarifs", href: "/#pricing" }
      ]
    },
    {
      title: "Espaces",
      links: [
        { name: "Espace Agence", href: "/agence" },
        { name: "Espace Propriétaire", href: "/owner" },
        { name: "Admin", href: "/admin" }
      ]
    },
    {
      title: "Ressources",
      links: [
        { name: "Centre d'aide", href: "/#help" },
        { name: "Blog", href: "/#blog" },
        { name: "Documentation API", href: "/#api" },
        { name: "Logo Showcase", href: "/logo-showcase" },
        { name: "Partenaires", href: "/#partners" }
      ]
    },
    {
      title: "Légal",
      links: [
        { name: "Conditions d'utilisation", href: "/#terms" },
        { name: "Politique de confidentialité", href: "/#privacy" },
        { name: "Mentions légales", href: "/#legal" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" }
  ];

  return (
    <footer className="bg-immoo-navy text-immoo-pearl border-t border-immoo-navy-light">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div 
              className="text-3xl font-bold tracking-tight text-immoo-pearl inline-flex items-center mb-6 cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/")}
            >
              <span className="text-immoo-pearl font-extrabold">IMMOO</span>
              <span className="text-immoo-gold ml-1">•</span>
            </div>
            <p className="text-immoo-pearl/70 text-base mb-8 max-w-md leading-relaxed">
              La première plateforme immobilière premium intégrée pour les agences, 
              propriétaires et locataires. Excellence et innovation au service de l'immobilier.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <div
                  key={social.name}
                  className="w-12 h-12 rounded-full bg-immoo-navy-light border border-immoo-gold/20 flex items-center justify-center text-immoo-pearl hover:text-immoo-gold hover:bg-immoo-gold/10 transition-all duration-300 cursor-pointer group"
                  aria-label={social.name}
                  onClick={() => handleNavigation(social.href)}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </div>
              ))}
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-lg mb-6 text-immoo-gold">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <div
                      className="text-sm text-immoo-pearl/70 hover:text-immoo-gold transition-colors duration-200 cursor-pointer group flex items-center"
                      onClick={() => handleNavigation(link.href)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-immoo-navy-light/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-immoo-pearl/60">
                © {currentYear} IMMOO. Tous droits réservés. Made with ❤️ in Mali.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center">
              <div className="flex items-center space-x-6">
                <div 
                  className="text-sm text-immoo-pearl/70 hover:text-immoo-gold transition-colors duration-200 cursor-pointer"
                  onClick={() => handleNavigation("/#terms")}
                >
                  Conditions
                </div>
                <div 
                  className="text-sm text-immoo-pearl/70 hover:text-immoo-gold transition-colors duration-200 cursor-pointer"
                  onClick={() => handleNavigation("/#privacy")}
                >
                  Confidentialité
                </div>
                <div 
                  className="text-sm text-immoo-pearl/70 hover:text-immoo-gold transition-colors duration-200 cursor-pointer"
                  onClick={() => handleNavigation("/#cookies")}
                >
                  Cookies
                </div>
              </div>
              
              <div 
                className="group flex items-center text-sm text-immoo-gold hover:text-immoo-gold-light cursor-pointer px-4 py-2 rounded-full border border-immoo-gold/30 hover:border-immoo-gold hover:bg-immoo-gold/10 transition-all duration-300"
                onClick={() => handleNavigation("/#contact")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact IMMOO
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
