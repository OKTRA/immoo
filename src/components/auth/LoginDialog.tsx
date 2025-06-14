
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import BecomeAgencyForm from './BecomeAgencyForm';
import AgencyLoginForm from './AgencyLoginForm';
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
  const [agencyMode, setAgencyMode] = useState<'login' | 'signup'>('login');

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const renderForm = () => {
    if (userType === 'admin') {
      return <AdminLoginForm onSuccess={handleSuccess} />;
    }
    
    if (agencyMode === 'login') {
      return (
        <AgencyLoginForm 
          onSuccess={handleSuccess}
          onSwitchToSignup={() => setAgencyMode('signup')}
        />
      );
    }
    
    return (
      <BecomeAgencyForm 
        onSuccess={handleSuccess}
        onSwitchToLogin={() => setAgencyMode('login')}
      />
    );
  };

  // Reset to login mode when dialog opens for agency
  React.useEffect(() => {
    if (open && userType === 'agency') {
      setAgencyMode('login');
    }
  }, [open, userType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
