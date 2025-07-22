import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-immoo-navy text-immoo-pearl border-t border-immoo-navy-light">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-sm text-immoo-pearl/70 flex items-center justify-center gap-2">
            © {currentYear} Made with 
            <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" /> 
            by 
            <a 
              href="https://www.oktra.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-immoo-gold font-semibold hover:text-immoo-gold-light transition-colors duration-300"
            >
              OKTRA
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
