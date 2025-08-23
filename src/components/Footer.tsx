import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4 border-t border-gray-200/50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © {currentYear}{' '}
            <a 
              href="https://oktra.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200 underline decoration-gray-300 hover:decoration-gray-500"
            >
              OKTRA
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
