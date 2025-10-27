// src/components/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, CheckCircle } from 'lucide-react'; 
import logoPath from '../assets/logo.png'; // <--- ADDED IMPORT

// --- Custom Logo Component (Signup Size) ---
const CustomLogo = ({ className }) => (
    // Use the imported path
    <img src={logoPath} alt="Aquamitra Logo" className={`h-12 w-12 ${className} drop-shadow-lg object-contain`} />
);
// --- End Custom Logo Component ---

function SignupPage() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [role, setRole] = useState("user"); 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const navigate = useNavigate();
    
    const roleMap = { user: 'Household / Public', employee: 'Government / Municipal' };
    const roleApiEndpoint = { user: 'users', employee: 'employees' };
    const API_BASE_URL = "http://localhost:5000"; 

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const endpoint = roleApiEndpoint[role];
            const url = `${API_BASE_URL}/api/${endpoint}/signup`;
            
            await axios.post(url, { userid, password }); 
            
            setSuccess("Hydro-Profile successfully created! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2500);

        } catch (err) {
            setLoading(false);
            if (err.response) {
                setError(err.response.data.message || "Registration failed. Please verify your ID and try again.");
            } else {
                setError("Network error. Please check your connection.");
            }
        }
    };

    const buttonText = loading ? "Initializing..." : "Create Hydro-Profile";

    return (
        // THEME: Deep space/water background gradient for depth and contrast
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-3 mb-8">
                        {/* Rendered Custom Logo */}
                        <CustomLogo />
                        <span className="text-3xl font-extrabold text-white">Aquamitra</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">Secure Your Hydro-Profile</h2>
                    <p className="text-indigo-300">Join the movement for smarter water management.</p>
                </div>

                {/* THEME: Form container uses dark, transparent glass effect */}
                <div className="bg-gray-800/70 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-cyan-800">
                    <form onSubmit={handleSignup} className="space-y-6">
                        
                        {/* User ID Input */}
                        <div>
                            <label htmlFor="userid" className="block text-sm font-bold text-gray-300 mb-2">User ID / Email Address</label>
                            <input
                                id="userid"
                                name="userid"
                                type="text" 
                                required
                                value={userid}
                                onChange={(e) => setUserid(e.target.value)}
                                // THEME: Focus ring to Cyan
                                className="appearance-none relative block w-full px-4 py-3 border border-indigo-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm transition-colors shadow-inner"
                                placeholder={role === 'user' ? "Enter your pre-registered User ID" : "Enter your Employee ID"}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    // THEME: Focus ring to Cyan
                                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-indigo-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm transition-colors shadow-inner"
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {isPasswordVisible ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Password must be at least 6 characters long.</p>
                        </div>
                        
                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-300 mb-2">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                // THEME: Focus ring to Cyan
                                className="appearance-none relative block w-full px-4 py-3 border border-indigo-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm transition-colors shadow-inner"
                                placeholder="Confirm your password"
                            />
                        </div>


                        {/* Role Selector */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-bold text-gray-300 mb-2">Account Type</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                // THEME: Focus ring to Cyan
                                className="appearance-none relative block w-full px-4 py-3 border border-indigo-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors shadow-inner"
                            >
                                <option value="user">Household / Public (Surface)</option>
                                <option value="employee">Government / Municipal (Deep)</option>
                            </select>
                            <div className="mt-2 text-xs text-gray-400">
                                <div className="flex items-start space-x-2">
                                    {/* THEME: Check icon color to Cyan */}
                                    <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5" />
                                    <span>{role === 'user' ? 'Track your household consumption and submit complaints.' : 'Gain network oversight and policy analysis tools.'}</span>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-400 text-center font-bold">{error}</p>}
                        {success && <p className="text-sm text-green-400 text-center font-bold">{success}</p>}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                // THEME: Primary button: Electric Cyan for action
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-extrabold rounded-lg text-gray-900 bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/30"
                            >
                                {buttonText}
                            </button>
                        </div>

                        {/* Link to Login */}
                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-400">
                                Already registered?{' '}
                                {/* THEME: Link color to bright cyan */}
                                <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Sign In to your account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;