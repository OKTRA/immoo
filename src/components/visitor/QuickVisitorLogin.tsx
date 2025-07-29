import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useQuickVisitorAccess, refreshVisitorState } from '@/hooks/useQuickVisitorAccess';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
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
        toast.success(t('auth.quickVisitor.success'));
        
        // Force refresh of visitor state across all components
        refreshVisitorState();
        
        // Call success callback immediately - state is now synchronized
        onSuccess?.(result);
        onClose();
        setContact(''); // Reset form
      } else {
        console.error('❌ Quick login failed');
        toast.error(t('auth.quickVisitor.error'));
      }
    } catch (error) {
      console.error('❌ Quick login error:', error);
      toast.error(t('auth.quickVisitor.unknownError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{t('auth.quickVisitor.title')}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {t('auth.quickVisitor.description')}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder={t('auth.quickVisitor.placeholder')}
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
              {t('auth.quickVisitor.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !contact.trim()}
            >
              {isSubmitting ? t('auth.quickVisitor.connecting') : t('auth.quickVisitor.access')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 