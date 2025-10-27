import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// CRITICAL: Import the AuthProvider
import { AuthProvider } from "./hooks/useauth"; 

// Routing wrappers - Ensure these are correctly imported
import ProtectedRoute from "./routes/protectedroutes";
import PublicRoute from "./routes/publicroutes"; 

// Components
import Navbar from "./components/Navbar"; 
import HomePage from "./components/HomePage";
import LoginPage from "./components/login"; 
import SignupPage from "./components/signup";
import UserDashboard from "./components/userdashboard";
import EmployeeDashboard from "./components/employeedashboard";

function App() {
  return (
    // ✅ FIX: The Router must be the outermost component to provide context (like useNavigate) 
    // to the AuthProvider.
    <Router>
      <AuthProvider> 
        {/* AuthProvider is now correctly nested inside the Router */}
        
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
      </AuthProvider>
    </Router>
  );
}

export default App;