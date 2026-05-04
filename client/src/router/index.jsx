import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DevicesPage from '../pages/DevicesPage';
import DeviceDetailPage from '../pages/DeviceDetailPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/devices" replace /> },
      { path: 'devices', element: <DevicesPage /> },
      { path: 'devices/:id', element: <DeviceDetailPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}