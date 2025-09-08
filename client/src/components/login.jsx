import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axios from 'axios';

function Login() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

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
                setError(err.response.data.message || "Login failed.");
            } else {
                setError("Network error. Please check your connection.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-300 to-green-200 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-4">💧 AquaMitra</h2>
                <form onSubmit={handleLogin} className="space-y-6 mt-8">
                    <div>
                        <label htmlFor="userid" className="block text-sm font-medium text-gray-700">User ID / Employee ID</label>
                        <input id="userid" type="text" required value={userid} onChange={(e) => setUserid(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Login as</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full pl-4 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 rounded-md">
                            <option value="user">User</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center font-semibold">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 rounded-md shadow-md text-lg font-bold text-white transition ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none"}`}>
                            {loading ? "Accessing..." : "Login"}
                        </button>
                    </div>
                </form>
                <p className="mt-8 text-center text-base text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        Sign up now!
                    </Link>
                </p>
            </div>
        </div>
    );
}
export default Login;