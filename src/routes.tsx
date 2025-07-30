import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import AgencyLayout from "@/components/agency/AgencyLayout";

// Lazy-loaded components that exist
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const BrowseAgenciesPage = lazy(() => import('@/pages/BrowseAgenciesPage'));
const MyAgenciesPage = lazy(() => import('@/pages/MyAgenciesPage'));
const CreateAgencyPage = lazy(() => import('@/pages/CreateAgencyPage'));
const EditAgencyPage = lazy(() => import('@/pages/EditAgencyPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminPage'));
const SubscriptionPlansManagement = lazy(() => import('@/components/admin/SubscriptionPlansManagement'));
const PublicAgencyPage = lazy(() => import('@/pages/PublicAgencyPage'));
const LogoShowcasePage = lazy(() => import('@/pages/LogoShowcasePage'));
const TestLogoAdaptive = lazy(() => import('@/pages/TestLogoAdaptive'));
const TestMobileNavigation = lazy(() => import('@/pages/TestMobileNavigation'));
const ImmoAgencyPage = lazy(() => import('@/pages/ImmoAgencyPage'));
import PricingPage from '@/pages/PricingPage';
import ContractsPage from "./pages/ContractsPage";
import AgencyContractsPage from "./pages/agency/AgencyContractsPage";
import AgencyCreateContractPage from "./pages/agency/AgencyCreateContractPage";
import CreateTenantPage from "./pages/tenant/CreateTenantPage";

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Spinner />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<Spinner />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: '/agencies',
        element: (
          <Suspense fallback={<Spinner />}>
            <BrowseAgenciesPage />
          </Suspense>
        ),
      },
      {
        path: '/my-agencies',
        element: (
          <Suspense fallback={<Spinner />}>
            <MyAgenciesPage />
          </Suspense>
        ),
      },
      {
        path: '/agencies/:agencyId',
        element: <AgencyLayout />,
        children: [
          // Ajoute ici les autres sous-pages agence si besoin, ex :
          // { path: '', element: <AgencyOverviewPage /> },
          { path: 'contracts', element: <AgencyContractsPage /> },
          { path: 'contracts/create', element: <AgencyCreateContractPage /> },
          // ... autres sous-pages (properties, tenants, etc.)
        ]
      },
      {
        path: '/agencies/:agencyId/tenants/create',
        element: <CreateTenantPage />,
      },
      {
        path: '/public-agency/:agencyId',
        element: (
          <Suspense fallback={<Spinner />}>
            <PublicAgencyPage />
          </Suspense>
        ),
      },
      {
        path: '/create-agency',
        element: (
          <Suspense fallback={<Spinner />}>
            <CreateAgencyPage />
          </Suspense>
        ),
      },
      {
        path: '/edit-agency/:id',
        element: (
          <Suspense fallback={<Spinner />}>
            <EditAgencyPage />
          </Suspense>
        ),
      },
      {
        path: "/admin",
        element: (
          <Suspense fallback={<Spinner />}>
            <AdminDashboardPage />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="subscription-plans" replace />,
          },
          {
            path: "subscription-plans",
            element: (
              <Suspense fallback={<Spinner />}>
                <SubscriptionPlansManagement />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/pricing",
        element: <PricingPage />
      },
      {
        path: "/immo-agency",
        element: (
          <Suspense fallback={<Spinner />}>
            <ImmoAgencyPage />
          </Suspense>
        ),
      },
      {
        path: "/logo-showcase",
        element: (
          <Suspense fallback={<Spinner />}>
            <LogoShowcasePage />
          </Suspense>
        ),
      },
      {
        path: "/test-logo-adaptive",
        element: (
          <Suspense fallback={<Spinner />}>
            <TestLogoAdaptive />
          </Suspense>
        ),
      },
      {
        path: "/test-mobile-navigation",
        element: (
          <Suspense fallback={<Spinner />}>
            <TestMobileNavigation />
          </Suspense>
        ),
      },
      {
        path: "/contracts",
        element: <ContractsPage />,
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<Spinner />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
]);

