
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Loading } from '@/components/ui/spinner';

// Lazy-loaded components that exist
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const BrowseAgenciesPage = lazy(() => import('@/pages/BrowseAgenciesPage'));
const CreateAgencyPage = lazy(() => import('@/pages/CreateAgencyPage'));
const EditAgencyPage = lazy(() => import('@/pages/EditAgencyPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminPage'));
const SubscriptionPlansManagement = lazy(() => import('@/components/admin/SubscriptionPlansManagement'));
import PricingPage from '@/pages/PricingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<Loading />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: '/agencies',
        element: (
          <Suspense fallback={<Loading />}>
            <BrowseAgenciesPage />
          </Suspense>
        ),
      },
      {
        path: '/create-agency',
        element: (
          <Suspense fallback={<Loading />}>
            <CreateAgencyPage />
          </Suspense>
        ),
      },
      {
        path: '/edit-agency/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <EditAgencyPage />
          </Suspense>
        ),
      },
      {
        path: "/admin",
        element: (
          <Suspense fallback={<Loading />}>
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
              <Suspense fallback={<Loading />}>
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
        path: '/login',
        element: (
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
]);
