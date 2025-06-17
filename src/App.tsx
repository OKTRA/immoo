import {
  BrowserRouter as Router,
  Routes,
  Route,
  useRoutes,
} from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import AgenciesPage from "@/pages/AgenciesPage";
import BrowseAgenciesPage from "@/pages/BrowseAgenciesPage";
import AgencyProfilePage from "@/pages/AgencyProfilePage";
import PublicAgencyPage from "@/pages/PublicAgencyPage";
import AgencyDetailPage from "@/pages/AgencyDetailPage";
import CreateAgencyPage from "@/pages/CreateAgencyPage";
import EditAgencyPage from "@/pages/EditAgencyPage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import CreatePropertyPage from "@/pages/property/CreatePropertyPage";
import CreateLeasePage from "@/pages/CreateLeasePage";
import LeaseDetailsPage from "@/pages/LeaseDetailsPage";
import ManageTenantsPage from "@/pages/ManageTenantsPage";
import PropertyLeasePaymentsPage from "@/pages/PropertyLeasePaymentsPage";
import AgencyPaymentsPage from "@/pages/AgencyPaymentsPage";
import AgencySettingsPage from "@/pages/AgencySettingsPage";
import PricingPage from "@/pages/PricingPage";
import LogoShowcasePage from "@/pages/LogoShowcasePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgencyLayout from "@/components/agency/AgencyLayout";
import Auth from "@/pages/Auth";
import AdminAuth from "@/pages/AdminAuth";
import SearchPage from "@/pages/SearchPage";
import ProfilePage from "@/pages/ProfilePage";
import OwnerPage from "@/pages/OwnerPage";
import AdminPage from "@/pages/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { VisitorTracker } from "./components/analytics/VisitorTracker";
import { useAutoVisitorSession } from "./hooks/useAutoVisitorSession";
import routes from "tempo-routes";

const queryClient = new QueryClient();

function App() {
  // Initialize visitor session system
  useAutoVisitorSession();

  // Removed bucket creation logic that was causing RLS policy violations
  // This prevents the storage errors on app initialization

  // Create a component to handle Tempo routes
  const TempoRoutes = () =>
    import.meta.env.VITE_TEMPO ? useRoutes(routes) : null;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            <TempoRoutes />
            <Routes>
              {/* Routes publiques - AUCUNE authentification requise */}
              <Route path="/" element={<HomePage />} />
              <Route path="/browse-agencies" element={<BrowseAgenciesPage />} />
              <Route path="/agency-profile/:agencyId" element={<AgencyProfilePage />} />
              <Route path="/public-agency/:agencyId" element={<PublicAgencyPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/logo-showcase" element={<LogoShowcasePage />} />
              
              {/* Routes d'authentification */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-auth" element={<AdminAuth />} />
              <Route path="/login" element={<Auth />} />
              
              {/* Routes protégées pour les utilisateurs connectés */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/owner" element={<OwnerPage />} />
              <Route path="/admin" element={<AdminPage />} />
              
              {/* Routes protégées pour les agences */}
              <Route path="/agencies" element={<AgenciesPage />} />
              <Route path="/agencies/create" element={<CreateAgencyPage />} />
              <Route path="/agencies/edit/:agencyId" element={<EditAgencyPage />} />

              <Route element={<AgencyLayout />}>
                <Route
                  path="/agencies/:agencyId"
                  element={<AgencyDetailPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties"
                  element={<AgencyDetailPage />}
                />
                <Route
                  path="/agencies/:agencyId/tenants"
                  element={<ManageTenantsPage />}
                />
                <Route
                  path="/agencies/:agencyId/leases"
                  element={<ManageTenantsPage leaseView={true} />}
                />
                <Route
                  path="/agencies/:agencyId/payments"
                  element={<AgencyPaymentsPage />}
                />
                <Route
                  path="/agencies/:agencyId/settings"
                  element={<AgencySettingsPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/create"
                  element={<CreatePropertyPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId"
                  element={<PropertyDetailPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/edit"
                  element={<CreatePropertyPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/lease"
                  element={<CreateLeasePage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/lease/create"
                  element={<CreateLeasePage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/leases/:leaseId"
                  element={<LeaseDetailsPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/tenants"
                  element={<ManageTenantsPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/leases/:leaseId/payments"
                  element={<PropertyLeasePaymentsPage />}
                />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
        <Toaster />
        <VisitorTracker />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
