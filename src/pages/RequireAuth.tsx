import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  children: JSX.Element;
}

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const expiry = localStorage.getItem('access_token_expiry');
  const isValid = token && expiry && Date.now() < parseInt(expiry);

  if (!isValid) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expiry');
    // Pass the intended destination so login page can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
