import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import useAuth from "../hooks/useauth"; // Assuming this path is correct

function LoginPage() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // 'user' maps to 'Household/Public', 'employee' maps to 'Government'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth(); // Assuming login stores auth token/user details

    // Role mapping for user display
    const roleMap = { user: 'Household', employee: 'Government' };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const url = `https://aquamitra-1.onrender.com/api/${role}s/login`;
            // NOTE: The API call is to users/login or employees/login based on the 'role' state
            await axios.post(url, { userid, password }); 
            
            login(userid, role);
            
            // Navigate to the dashboard path matching the new UI (user -> public, employee -> government)
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-8">
                        <Droplets className="h-10 w-10 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">Aquamitra</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                    <p className="text-gray-600">Please sign in to your account</p>
                </div>

                <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Role Selector (Account Type) */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Account type</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white"
                            >
                                <option value="user">Household / Public</option>
                                <option value="employee">Government / Municipal</option>
                            </select>
                        </div>

                        {/* Email/User ID Input */}
                        <div>
                            <label htmlFor="userid" className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder={`Enter your ${roleMap[role]} ID or Email`}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {isPasswordVisible ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                        )}

                        {/* Sign in Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </div>

                        {/* Link to Signup */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </form>
                    
                    {/* Demo Credentials Box */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
                        <div className="space-y-1 text-xs text-gray-500">
                            <p><strong>Household:</strong> john@example.com / password</p>
                            <p><strong>Government:</strong> admin@gov.com / admin123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;