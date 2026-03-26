import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  // Not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Role‑based restriction – if allowedRoles is specified, check role
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // User is logged in but doesn't have the required role – redirect to their own dashboard
    if (role === 'victim') return <Navigate to="/victim-dashboard" />;
    if (role === 'ngo') return <Navigate to="/ngo-dashboard" />;
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;