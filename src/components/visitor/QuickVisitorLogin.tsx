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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('auth.quickVisitor.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.quickVisitor.description')}
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('auth.quickVisitor.placeholder')}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base"
              required
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              type="button"
              variant="ghost" 
              className="flex-1 h-12 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('auth.quickVisitor.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !contact.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('auth.quickVisitor.connecting')}
                </div>
              ) : (
                t('auth.quickVisitor.access')
              )}
            </Button>
          </div>
        </form>
        
        {/* Close Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}