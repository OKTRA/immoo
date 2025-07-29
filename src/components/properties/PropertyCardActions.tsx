
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, Phone } from 'lucide-react';
import { Property } from '@/assets/types';
import AuthRequired from '@/components/AuthRequired';
import { useTranslation } from '@/hooks/useTranslation';

interface PropertyCardActionsProps {
  showActions: boolean;
  isPublicView: boolean;
  property: Property;
  agencyContactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hasContactAccess?: boolean;
}

export default function PropertyCardActions({ 
  showActions, 
  isPublicView, 
  property, 
  agencyContactInfo, 
  hasContactAccess 
}: PropertyCardActionsProps) {
  const { t } = useTranslation();

  if (!showActions) return null;

  return (
    <CardFooter className="pt-0">
      {isPublicView ? (
        <PublicPropertyActions 
          agencyContactInfo={agencyContactInfo}
          hasContactAccess={hasContactAccess}
        />
      ) : (
        <PrivatePropertyActions property={property} />
      )}
    </CardFooter>
  );
}

const PublicPropertyActions = ({ 
  agencyContactInfo, 
  hasContactAccess 
}: { 
  agencyContactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hasContactAccess?: boolean;
}) => {
  const { t } = useTranslation();

  if (!hasContactAccess || !agencyContactInfo) {
    return (
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1" disabled>
          <span className="mr-1">{t('propertyCard.contact')}</span>
          <Phone className="h-3.5 w-3.5" />
        </Button>
        <div className="text-xs text-muted-foreground flex-1 text-center py-2">
          {t('propertyCard.fillFormToContact')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {agencyContactInfo.phone && (
        <a 
          href={`tel:${agencyContactInfo.phone}`}
          className="flex items-center justify-center w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button size="sm" variant="outline" className="w-full">
            <Phone className="h-3.5 w-3.5 mr-2" />
            {agencyContactInfo.phone}
          </Button>
        </a>
      )}
      {agencyContactInfo.email && (
        <a 
          href={`mailto:${agencyContactInfo.email}`}
          className="flex items-center justify-center w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button size="sm" variant="outline" className="w-full">
            <Mail className="h-3.5 w-3.5 mr-2" />
            {agencyContactInfo.email}
          </Button>
        </a>
      )}
    </div>
  );
};

const PrivatePropertyActions = ({ property }: { property: Property }) => {
  const { t } = useTranslation();

  return (
    <AuthRequired redirectTo="/auth">
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1">
          <span className="mr-1">{t('propertyCard.contact')}</span>
          <Mail className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <span className="mr-1">{t('propertyCard.book')}</span>
          <Calendar className="h-3.5 w-3.5" />
        </Button>
      </div>
    </AuthRequired>
  );
};
