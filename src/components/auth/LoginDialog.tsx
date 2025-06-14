
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import BecomeAgencyForm from './BecomeAgencyForm';
import AdminLoginForm from './AdminLoginForm';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType?: 'agency' | 'admin';
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  open, 
  onOpenChange, 
  userType = 'agency'
}) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const renderForm = () => {
    if (userType === 'admin') {
      return <AdminLoginForm onSuccess={handleSuccess} />;
    }
    
    return <BecomeAgencyForm onSuccess={handleSuccess} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
