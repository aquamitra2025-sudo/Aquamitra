import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Droplets, Eye, EyeOff, CheckCircle } from 'lucide-react';

function SignupPage() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // Removed: const [name, setName] = useState(""); 
    
    // 'user' maps to Household/Public, 'employee' maps to Government/Municipal
    const [role, setRole] = useState("user"); 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const navigate = useNavigate();
    
    const roleMap = { user: 'Household / Public', employee: 'Government / Municipal' };
    const roleApiEndpoint = { user: 'users', employee: 'employees' };
    // NOTE: Use your Render URL
    const API_BASE_URL = "https://aquamitra-1.onrender.com"; 

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
            
            // Send only userid and password
            await axios.post(url, { userid, password }); 
            
            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2500); // Navigate to /login

        } catch (err) {
            setLoading(false);
            if (err.response) {
                // Use a more generic message as the backend determines if the ID is valid/pre-registered
                setError(err.response.data.message || "Registration failed. Check if your ID is valid.");
            } else {
                setError("Network error. Please check your connection.");
            }
        }
    };

    const buttonText = loading ? "Processing..." : "Create account";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-8">
                        <Droplets className="h-10 w-10 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">Aquamitra</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                    <p className="text-gray-600">Join the water management revolution</p>
                </div>

                <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
                    <form onSubmit={handleSignup} className="space-y-6">
                        {/* Removed: Full Name Input */}

                        {/* User ID Input */}
                        <div>
                            <label htmlFor="userid" className="block text-sm font-medium text-gray-700 mb-2">User ID / Email Address</label>
                            <input
                                id="userid"
                                name="userid"
                                type="text" 
                                required
                                value={userid}
                                onChange={(e) => setUserid(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder={role === 'user' ? "Enter your pre-registered User ID" : "Enter your Employee ID"}
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
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                    placeholder="Create a password"
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
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
                        </div>
                        
                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Confirm your password"
                            />
                        </div>


                        {/* Role Selector */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Account type</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white"
                            >
                                <option value="user">{roleMap['user']}</option>
                                <option value="employee">{roleMap['employee']}</option>
                            </select>
                            <div className="mt-2 text-xs text-gray-500">
                                <div className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                    <span>{role === 'user' ? 'Track your household water usage and submit complaints' : 'Gain access to regional water management data'}</span>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
                        {success && <p className="text-sm text-green-600 text-center font-medium">{success}</p>}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {buttonText}
                            </button>
                        </div>

                        {/* Link to Login */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Sign in here
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