// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // For programmatic navigation in logout

    useEffect(() => {
        const checkAuth = () => {
            try {
                const authData = JSON.parse(localStorage.getItem('auth'));
                if (authData && authData.userid && authData.expiry > new Date().getTime()) {
                    setIsAuthenticated(true);
                    setUser(authData.userid);
                    setRole(authData.role);
                } else {
                    localStorage.removeItem('auth'); // Clear expired or invalid auth data
                    setIsAuthenticated(false);
                    setUser(null);
                    setRole(null);
                }
            } catch (error) {
                console.error("Failed to parse auth data from localStorage:", error);
                setIsAuthenticated(false);
                setUser(null);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
        
        // Listen for changes in other tabs
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const login = (userid, userRole) => {
        const expiry = new Date().getTime() + 60 * 60 * 1000; // 1 hour expiry
        localStorage.setItem('auth', JSON.stringify({ userid, role: userRole, expiry }));
        setIsAuthenticated(true);
        setUser(userid);
        setRole(userRole);
        // Navigate after login is handled in the component
    };

    const logout = () => {
        localStorage.removeItem('auth');
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        navigate('/'); // Redirect to login page on logout
    };

    return { isAuthenticated, user, role, loading, login, logout };
};

export default useAuth;