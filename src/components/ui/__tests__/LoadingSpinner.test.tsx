import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('devrait afficher un spinner avec la taille par défaut', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8', 'h-8'); // Taille md par défaut
  });

  it('devrait afficher un spinner avec la taille spécifiée', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-12', 'h-12'); // Taille lg
  });

  it('devrait afficher le texte fourni', () => {
    const testText = 'Chargement en cours...';
    render(<LoadingSpinner text={testText} />);
    
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('devrait appliquer les classes CSS personnalisées', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner className={customClass} />);
    
    const container = screen.getByRole('generic').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('devrait avoir la bonne structure HTML', () => {
    render(<LoadingSpinner text="Test" />);
    
    const container = screen.getByRole('generic').parentElement;
    const spinner = screen.getByRole('generic');
    const text = screen.getByText('Test');
    
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2');
    expect(text).toHaveClass('mt-4', 'text-sm');
  });

  it('devrait utiliser les bonnes couleurs pour le thème IMMOO', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('border-immoo-gold/20', 'border-t-immoo-gold');
  });
});
