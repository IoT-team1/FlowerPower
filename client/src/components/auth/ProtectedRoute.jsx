import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      Načítání...
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
