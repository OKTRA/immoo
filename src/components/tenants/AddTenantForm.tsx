
import React from 'react';
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TenantFormFields from './TenantFormFields';
import TenantFormActions from './TenantFormActions';
import { useTenantForm } from './hooks/useTenantForm';
import { useTranslation } from "@/hooks/useTranslation";

interface AddTenantFormProps {
  onCancel: () => void;
  onSuccess: (tenant: any) => void;
  agencyId?: string;
}

export default function AddTenantForm({ onCancel, onSuccess, agencyId }: AddTenantFormProps) {
  const { form, isSubmitting, onSubmit } = useTenantForm({ agencyId, onSuccess });
  const { t } = useTranslation();

  return (
    <Card className="shadow-md mb-8">
      <CardHeader>
        <CardTitle>{t('agencyDashboard.pages.tenants.addNewTenant')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <TenantFormFields />
            <TenantFormActions onCancel={onCancel} isSubmitting={isSubmitting} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
