import { Navigate, useLocation } from 'react-router-dom';

/**
 * Checks localStorage for a token.
 * If present, renders children; otherwise redirects to /login.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Redirect to /login, preserving where they wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;