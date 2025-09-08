// src/routes/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useauth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can return a loading spinner here
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after a
    // successful login.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // If the user is authenticated but has the wrong role, redirect them
    // to their own dashboard or a 'not authorized' page.
    const redirectTo = role === 'user' ? '/userdashboard' : '/employeedashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;