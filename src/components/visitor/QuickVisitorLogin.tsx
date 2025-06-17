import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useQuickVisitorAccess } from '@/hooks/useQuickVisitorAccess';
import { toast } from 'sonner';

interface QuickVisitorLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (visitorData: any) => void;
}

export default function QuickVisitorLogin({ 
  isOpen, 
  onClose, 
  onSuccess
}: QuickVisitorLoginProps) {
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useQuickVisitorAccess();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const isEmail = contact.includes('@');
      const contactInfo = isEmail 
        ? { email: contact.trim() } 
        : { phone: contact.trim() };
      
      console.log('🔑 Attempting quick login with:', contactInfo);
      
      const result = await login(contactInfo);
      
      if (result) {
        console.log('✅ Quick login successful:', result);
        toast.success('Connexion réussie !');
        
        // Small delay to ensure state propagation
        setTimeout(() => {
          onSuccess?.(result);
          onClose();
          setContact(''); // Reset form
        }, 100);
      } else {
        console.error('❌ Quick login failed');
        toast.error('Erreur lors de la connexion');
      }
    } catch (error) {
      console.error('❌ Quick login error:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Accès rapide</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Entrez votre email ou téléphone pour accéder rapidement aux détails.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Email ou téléphone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full"
            required
          />
          
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !contact.trim()}
            >
              {isSubmitting ? 'Connexion...' : 'Accéder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 