import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Components
import Navbar from "./components/Navbar"; // <-- Import the Navbar
import HomePage from "./components/HomePage";
import LoginPage from "./components/login"; 
import SignupPage from "./components/signup";
import UserDashboard from "./components/userdashboard";
import EmployeeDashboard from "./components/employeedashboard";

// Routing wrappers (assuming paths remain the same)
import ProtectedRoute from "./routes/protectedroutes";
import PublicRoute from "./routes/publicroutes";

function App() {
  return (
    <Router>
      {/* The Navbar component renders here, outside of the Routes */}
      <Navbar /> 
      
      <Routes>
        
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} /> 
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Protected Dashboard Routes - Household/Public */}
        <Route
          path="/userdashboard"
          element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>}
        />
        
        {/* Protected Dashboard Routes - Government/Employee */}
        <Route
          path="/employeedashboard"
          element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>}
        />
        
        {/* Fallback Route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;