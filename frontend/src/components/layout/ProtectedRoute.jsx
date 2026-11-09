import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards a group of routes.
 *  - Not logged in -> /login (remembers where the user wanted to go)
 *  - role given but different -> redirected to their own home
 * This only improves UX. The backend still rejects unauthorized API calls with 401/403.
 */
export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

export const homeFor = (user) => (user?.role === 'ADMIN' ? '/admin' : '/dashboard');
