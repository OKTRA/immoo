
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, X, UserPlus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TenantFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const TenantFormActions = ({ onCancel, isSubmitting }: TenantFormActionsProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={onCancel} type="button">
        <X className="mr-2 h-4 w-4" /> {t('agencyDashboard.pages.tenants.cancel')}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        {t('agencyDashboard.pages.tenants.addTenant')}
      </Button>
    </div>
  );
};

export default TenantFormActions;
