import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import CreateTenantForm from "./CreateTenantForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CreateTenantPage() {
  const { agencyId, tenantId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const handleNavigateBack = () => {
    navigate(`/agencies/${agencyId}/tenants`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNavigateBack}
            className="mb-4 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isMobile ? 'Retour' : 'Retour aux locataires'}
          </Button>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {tenantId ? 'Modifier le locataire' : 'Nouveau locataire'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {tenantId 
                ? 'Mettez à jour les informations du locataire'
                : 'Ajoutez un nouveau locataire à votre agence'}
            </p>
          </div>
        </div>
        
        <CreateTenantForm 
          tenantId={tenantId}
          agencyId={agencyId}
          onSuccess={handleNavigateBack}
        />
      </div>
    </div>
  );
} 