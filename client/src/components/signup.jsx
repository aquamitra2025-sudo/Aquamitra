import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Signup() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            let url = "";
            let successMessage = "";

            if (role === 'user') {
                url = "https://aquamitra-1.onrender.com/api/users/signup";
                successMessage = "Signup successful! Redirecting to login...";
            } else if (role === 'employee') {
                url = "https://aquamitra-1.onrender.com/api/employees/signup";
                successMessage = "Account setup complete! Redirecting to login...";
            }
            
            await axios.post(url, { userid, password });
            
            setLoading(false);
            setSuccess(successMessage);
            setTimeout(() => navigate("/"), 2500);

        } catch (err) {
            setLoading(false);
            if (err.response) {
                setError(err.response.data.message || "An error occurred.");
            } else {
                setError("Network error. Please check your connection.");
            }
        }
    };

    const buttonText = loading ? "Processing..." : (role === 'user' ? 'Signup' : 'Complete Registration');
    const headingText = role === 'user' ? 'Create Your Account' : 'Set Up Employee Account';

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-300 to-indigo-200 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{headingText}</h2>
                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label htmlFor="userid" className="block text-sm font-medium text-gray-700">{role === 'user' ? 'User ID' : 'Employee ID'}</label>
                        <input id="userid" type="text" required value={userid} onChange={(e) => setUserid(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Register as</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full pl-4 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-green-500 rounded-md">
                            <option value="user">User</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center font-semibold">{error}</p>}
                    {success && <p className="text-sm text-green-600 text-center font-semibold">{success}</p>}
                    <div>
                        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 rounded-md shadow-md text-lg font-bold text-white transition ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:outline-none"}`}>
                            {buttonText}
                        </button>
                    </div>
                </form>
                <p className="mt-8 text-center text-base text-gray-600">
                    Already have an account?{" "}
                    <Link to="/" className="font-semibold text-green-600 hover:text-green-800 hover:underline">
                        Login here!
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;