
import CreateAgencyForm from "@/components/agencies/CreateAgencyForm";
import { useEffect } from "react";
import { useSubscriptionLimits } from '@/hooks/subscription/useSubscriptionLimits';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function CreateAgencyPage() {
  const navigate = useNavigate();
  const { limits, isLoading } = useSubscriptionLimits();
  const agencyLimit = limits?.agencies;
  const canCreateAgency = agencyLimit?.allowed === true;

  useEffect(() => {
    document.title = "Créer une agence | Immobilier";
  }, []);

  useEffect(() => {
    if (!isLoading && limits && !canCreateAgency) {
      toast.error("Limite de plan atteinte pour les agences", {
        description: "Veuillez mettre à niveau votre abonnement pour créer une autre agence.",
      });
    }
  }, [isLoading, limits, canCreateAgency, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div>Vérification de l'abonnement…</div>
      </div>
    );
  }

  // If no limits available (API error), or explicitly not allowed, block and show message
  if (!limits || !canCreateAgency) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Création d'agence indisponible</AlertTitle>
          <AlertDescription>
            Nous n'avons pas pu vérifier votre abonnement ou la limite d'agences est atteinte. Veuillez mettre à niveau votre plan.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/my-agencies')}>Retour à mes agences</Button>
          <Button onClick={() => navigate('/pricing')}>Voir les offres</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <CreateAgencyForm />
    </div>
  );
}
