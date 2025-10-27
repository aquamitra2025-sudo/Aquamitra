import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create the Auth Context
const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    role: null,
    login: () => {},
    logout: () => {},
    isAuthReady: false, 
});

// Helper key for localStorage
const AUTH_KEY = 'aquamitra_auth';

// 2. Auth Provider Component (Manages State and Provides Context)
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const navigate = useNavigate();

    // Load initial state from localStorage on component mount
    useEffect(() => {
        try {
            const storedAuth = localStorage.getItem(AUTH_KEY);
            if (storedAuth) {
                const { user: storedUser, role: storedRole, expiry } = JSON.parse(storedAuth);
                
                // Simple check for expiry (good for persistence)
                if (expiry && Date.now() < expiry) {
                    setIsAuthenticated(true);
                    setUser(storedUser);
                    setRole(storedRole);
                } else {
                    localStorage.removeItem(AUTH_KEY);
                }
            }
        } catch (error) {
            console.error("Error loading auth from localStorage:", error);
        } finally {
            // CRITICAL: Set ready state once local storage check is complete
            setIsAuthReady(true);
        }
    }, []);

    // Login function: updates state and persists data
    const login = (userId, userRole) => {
        // 1. Update React State (This triggers Navbar re-render)
        setIsAuthenticated(true);
        setUser(userId);
        setRole(userRole);

        // 2. Persist to Storage (Set a 1-day expiry for simplicity)
        const expiry = Date.now() + 24 * 60 * 60 * 1000; 
        localStorage.setItem(AUTH_KEY, JSON.stringify({ user: userId, role: userRole, expiry }));
    };

    // Logout function: clears state and storage
    const logout = () => {
        // 1. Clear React State (This triggers Navbar re-render)
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);

        // 2. Clear Storage
        localStorage.removeItem(AUTH_KEY);
        
        // 3. Redirect to Login
        navigate('/login');
    };

    const value = {
        isAuthenticated,
        user,
        role,
        isAuthReady,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Conditional rendering while authentication state is loading */}
            {isAuthReady ? children : <div className="min-h-screen flex items-center justify-center text-lg text-blue-600">Initializing Authentication...</div>}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook to Consume Context
export default function useAuth() {
    return useContext(AuthContext);
}
