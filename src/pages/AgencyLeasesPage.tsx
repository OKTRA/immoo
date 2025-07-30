
import { useParams } from "react-router-dom";
import AgencyLeasesDisplay from "@/components/leases/AgencyLeasesDisplay";
import { useTranslation } from "@/hooks/useTranslation";

export default function AgencyLeasesPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  const { t } = useTranslation();

  if (!agencyId) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('agencyDashboard.pages.leases.error')}</h1>
          <p>{t('agencyDashboard.pages.leases.missingAgencyId')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('agencyDashboard.pages.leases.leaseManagement')}</h1>
      <AgencyLeasesDisplay agencyId={agencyId} />
    </div>
  );
}
