// src/routes/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        // If user is already logged in, redirect them to their dashboard
        const redirectTo = role === 'user' ? '/userdashboard' : '/employeedashboard';
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default PublicRoute;