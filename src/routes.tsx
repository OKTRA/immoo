import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layout/MainLayout';
import { AuthLayout } from '@/layout/AuthLayout';
import Loading from '@/components/ui/Loading';

// Lazy-loaded components
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const BrowseAgenciesPage = lazy(() => import('@/pages/BrowseAgenciesPage'));
const AgencyDetailsPage = lazy(() => import('@/pages/AgencyDetailsPage'));
const CreateAgencyPage = lazy(() => import('@/pages/CreateAgencyPage'));
const EditAgencyPage = lazy(() => import('@/pages/EditAgencyPage'));
const BrowsePropertiesPage = lazy(() => import('@/pages/BrowsePropertiesPage'));
const PropertyDetailsPage = lazy(() => import('@/pages/PropertyDetailsPage'));
const CreatePropertyPage = lazy(() => import('@/pages/CreatePropertyPage'));
const EditPropertyPage = lazy(() => import('@/pages/EditPropertyPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const SubscriptionPlansManagement = lazy(() => import('@/components/admin/SubscriptionPlansManagement'));
import PricingPage from '@/pages/PricingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
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
        path: '/about',
        element: (
          <Suspense fallback={<Loading />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: '/contact',
        element: (
          <Suspense fallback={<Loading />}>
            <ContactPage />
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
        path: '/agencies/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <AgencyDetailsPage />
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
        path: '/properties',
        element: (
          <Suspense fallback={<Loading />}>
            <BrowsePropertiesPage />
          </Suspense>
        ),
      },
      {
        path: '/properties/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <PropertyDetailsPage />
          </Suspense>
        ),
      },
      {
        path: '/create-property',
        element: (
          <Suspense fallback={<Loading />}>
            <CreatePropertyPage />
          </Suspense>
        ),
      },
      {
        path: '/edit-property/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <EditPropertyPage />
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
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<Loading />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
]);
