import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, LogOut } from 'lucide-react';
import useAuth from '../hooks/useauth'; // Import your authentication hook

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const location = useLocation();

  // Determine the dashboard link based on the user's role
  const dashboardPath = role === 'user' ? '/userdashboard' : '/employeedashboard';
  
  // Display name or ID (adjust based on what your `user` object holds after login)
  const displayName = user || 'Guest';

  // Check if the current path is the login/signup page to potentially hide the main nav button
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <nav className="bg-white shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Link */}
          <Link to="/" className="flex items-center space-x-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Aquamitra</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Logged-in Navigation
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-semibold">{displayName}</span>
                </span>
                
                {/* Dashboard Link (always visible when logged in) */}
                <Link 
                  to={dashboardPath} 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Dashboard
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={logout} 
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              // Logged-out Call to Action (Only show if not already on login/signup page)
              !isAuthPage && (
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
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