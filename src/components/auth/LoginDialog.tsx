
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetPasswordForm from './ResetPasswordForm';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'register' | 'reset';
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  open, 
  onOpenChange, 
  defaultMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(defaultMode);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Connexion';
      case 'register':
        return 'Inscription';
      case 'reset':
        return 'Réinitialiser mot de passe';
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm 
            onSuccess={handleSuccess} 
            onSwitchMode={setMode}
          />
        );
      case 'register':
        return (
          <RegisterForm 
            onSuccess={handleSuccess} 
            onSwitchMode={setMode}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm 
            onSuccess={handleSuccess} 
            onSwitchMode={setMode}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
