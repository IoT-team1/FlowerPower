import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DevicesPage from '../pages/DevicesPage';
import DeviceDetailPage from '../pages/DeviceDetailPage';
import HistoryPage from '../pages/HistoryPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/devices" replace /> },
      { path: 'devices', element: <DevicesPage /> },
      { path: 'devices/:id', element: <DeviceDetailPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: '*', element: <Navigate to="/devices" replace /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}