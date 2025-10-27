// src/components/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react'; 
import useAuth from "../hooks/useauth"; 
import logoPath from '../assets/logo.png'; // <--- ADDED IMPORT

// --- Custom Logo Component (Login Size) ---
const CustomLogo = ({ className }) => (
    // Use the imported path
    <img src={logoPath} alt="Aquamitra Logo" className={`h-10 w-10 ${className} drop-shadow-lg object-contain`} />
);
// --- End Custom Logo Component ---

function LoginPage() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const roleMap = { user: 'Household', employee: 'Government' };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const url = `http://localhost:5000/api/${role}s/login`;
            await axios.post(url, { userid, password }); 
            
            login(userid, role);
            
            navigate(role === "user" ? "/userdashboard" : "/employeedashboard");

        } catch (err) {
            setLoading(false);
            if (err.response) {
                setError(err.response.data.message || "Login failed. Check credentials and account type.");
            } else {
                setError("Network error. Please check your connection.");
            }
        }
    };

    return (
        // THEME: Deep space/water gradient
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-8">
                        {/* Rendered Custom Logo */}
                        <CustomLogo className="h-10 w-10" />
                        <span className="text-2xl font-bold text-white">Aquamitra</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">Access the Flow</h2>
                    <p className="text-gray-400">Please sign in to your account</p>
                </div>

                {/* THEME: Dark, slightly transparent card with electric border */}
                <div className="bg-gray-800/70 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-indigo-700">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Role Selector (Account Type) */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Account type</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                // THEME: Dark input field, cyan focus ring
                                className="appearance-none relative block w-full px-4 py-3 border border-indigo-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors"
                            >
                                <option value="user">Household / Public</option>
                                <option value="employee">Government / Municipal</option>
                            </select>
                        </div>

                        {/* Email/User ID Input */}
                        <div>
                            <label htmlFor="userid" className="block text-sm font-medium text-gray-300 mb-2">
                                {roleMap[role]} ID / Email address
                            </label>
                            <input
                                id="userid"
                                name="userid"
                                type="text"
                                autoComplete="username"
                                required
                                value={userid}
                                onChange={(e) => setUserid(e.target.value)}
                                // THEME: Dark input field, cyan focus ring
                                className="appearance-none relative block w-full px-4 py-3 border border-indigo-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder={`Enter your ${roleMap[role]} ID or Email`}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    // THEME: Dark input field, cyan focus ring
                                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-indigo-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm transition-colors"
                                    placeholder="Enter your password"
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
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 text-center font-medium">{error}</p>
                        )}

                        {/* Sign in Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                // THEME: Sign in button to electric cyan
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/30"
                            >
                                {loading ? "Diving in..." : "Sign in"}
                            </button>
                        </div>

                        {/* Link to Signup */}
                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                Don't have an account?{' '}
                                {/* THEME: Link color to bright cyan */}
                                <Link to="/signup" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </form>
                    
                    {/* Demo Credentials Box */}
                    {/* THEME: Dark demo box with indigo text */}
                    <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-indigo-700">
                        <p className="text-sm text-gray-300 font-semibold mb-2 flex items-center">
                            Demo Access:
                        </p>
                        <div className="space-y-1 text-xs text-indigo-400">
                            <p><strong>Household:</strong> <span className="font-mono bg-indigo-900 px-1 rounded">john@example.com</span> / password</p>
                            <p><strong>Government:</strong> <span className="font-mono bg-indigo-900 px-1 rounded">admin@gov.com</span> / admin123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;