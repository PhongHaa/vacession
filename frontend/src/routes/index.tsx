import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Spinner from '@/components/common/Spinner';
import { RequireAdmin } from '@/components/common/ProtectedRoute';

import HomePage from '@/pages/Home/HomePage';
import ShopPage from '@/pages/Shop/ShopPage';
import ProductPage from '@/pages/Product/ProductPage';
import CheckoutPage from '@/pages/Checkout/CheckoutPage';
import OrderReceivedPage from '@/pages/OrderReceived/OrderReceivedPage';
import AccountGate from '@/pages/Account/AccountGate';
import DashboardPage from '@/pages/Account/DashboardPage';
import OrdersPage from '@/pages/Account/OrdersPage';
import OrderDetailPage from '@/pages/Account/OrderDetailPage';
import AccountDetailsPage from '@/pages/Account/AccountDetailsPage';
import RegisterPage from '@/pages/Account/RegisterPage';
import LostPasswordPage from '@/pages/Account/LostPasswordPage';
import ResetPasswordPage from '@/pages/Account/ResetPasswordPage';
import AboutPage from '@/pages/Static/AboutPage';
import ContactPage from '@/pages/Static/ContactPage';
import TermsPage from '@/pages/Static/TermsPage';
import ReturnsPage from '@/pages/Static/ReturnsPage';
import CampaignPage from '@/pages/Static/CampaignPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

// Trang admin tách bundle riêng -> khách mua hàng không phải tải
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/pages/Admin/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('@/pages/Admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/pages/Admin/AdminOrderDetailPage'));
const AdminProductsPage = lazy(() => import('@/pages/Admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('@/pages/Admin/AdminProductFormPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/Admin/AdminCategoriesPage'));
const AdminMessagesPage = lazy(() => import('@/pages/Admin/AdminMessagesPage'));
const AdminCustomersPage = lazy(() => import('@/pages/Admin/AdminCustomersPage'));

const lazyEl = (el: ReactNode) => <Suspense fallback={<Spinner />}>{el}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage mode="all" /> },
      { path: 'new-arrivals', element: <ShopPage mode="new" /> },
      { path: 'category/:slug', element: <ShopPage mode="category" /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-received/:code', element: <OrderReceivedPage /> },
      {
        path: 'my-account',
        children: [
          { path: 'register', element: <RegisterPage /> },
          { path: 'lost-password', element: <LostPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          {
            element: <AccountGate />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'orders/:code', element: <OrderDetailPage /> },
              { path: 'edit-account', element: <AccountDetailsPage /> },
            ],
          },
        ],
      },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'returns', element: <ReturnsPage /> },
      { path: 'campaign', element: <CampaignPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <RequireAdmin>{lazyEl(<AdminLayout />)}</RequireAdmin>,
    children: [
      { index: true, element: lazyEl(<AdminDashboardPage />) },
      { path: 'orders', element: lazyEl(<AdminOrdersPage />) },
      { path: 'orders/:id', element: lazyEl(<AdminOrderDetailPage />) },
      { path: 'products', element: lazyEl(<AdminProductsPage />) },
      { path: 'products/new', element: lazyEl(<AdminProductFormPage />) },
      { path: 'products/:id', element: lazyEl(<AdminProductFormPage />) },
      { path: 'categories', element: lazyEl(<AdminCategoriesPage />) },
      { path: 'customers', element: lazyEl(<AdminCustomersPage />) },
      { path: 'messages', element: lazyEl(<AdminMessagesPage />) },
    ],
  },
]);
