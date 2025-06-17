import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useVisitorSession } from '@/hooks/useVisitorSession';

interface VisitorMiniLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  agencyName?: string;
}

export default function VisitorMiniLogin({ 
  isOpen, 
  onClose, 
  onSuccess,
  agencyName = "cette agence"
}: VisitorMiniLoginProps) {
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useVisitorSession();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    
    setIsLoading(true);
    
    try {
      const isEmail = contact.includes('@');
      const contactInfo = isEmail 
        ? { email: contact.trim() }
        : { phone: contact.trim() };
      
      const session = await login(contactInfo);
      
      if (session) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Accès rapide</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Email ou téléphone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !contact.trim()}
          >
            {isLoading ? 'Connexion...' : 'Accéder'}
          </Button>
        </form>
      </div>
    </div>
  );
} 