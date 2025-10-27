// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import useAuth from '../hooks/useauth';
import logoPath from '../assets/logo.png'; // <--- ADDED IMPORT

// --- Custom Logo Component (Navbar Size) ---
const CustomLogo = () => (
    // Use the imported path
    <img src={logoPath} alt="Aquamitra Logo" className="h-6 w-6 drop-shadow-lg object-contain" />
);
// --- End Custom Logo Component ---

const Navbar = () => {
    const { isAuthenticated, user, role, logout } = useAuth();
    const location = useLocation();

    const dashboardPath = role === 'user' ? '/userdashboard' : '/employeedashboard';
    const displayName = user?.split('@')[0] || 'Guest';

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    const handleLogout = () => {
        logout(); 
    }

    return (
        // THEME: Dark navbar, sharp indigo border
        <nav className="bg-gray-900 shadow-xl border-b-2 border-indigo-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Home Link */}
                    <Link to="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity">
                        {/* Custom Logo Render */}
                        <CustomLogo />
                        <span className="text-xl font-bold text-white">Aquamitra</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            // Logged-in Navigation
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-400 hidden sm:inline">
                                    Welcome, <span className="font-semibold text-cyan-400">{displayName}</span>
                                </span>
                                
                                {/* Dashboard Link */}
                                <Link 
                                    to={dashboardPath}
                                    // THEME: Link color to cyan/electric blue
                                    className="text-cyan-400 hover:text-cyan-300 font-medium p-2 rounded-md transition-colors flex items-center space-x-1 hover:bg-gray-800"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>

                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout} 
                                    className="flex items-center space-x-1 text-gray-500 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-gray-800"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            // Logged-out Call to Action
                            !isAuthPage && (
                                <Link
                                    to="/login"
                                    // THEME: Button to electric cyan
                                    className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                >
                                    Login / Signup
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;