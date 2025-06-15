

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';

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

