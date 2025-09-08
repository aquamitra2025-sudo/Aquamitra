import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import UserDashboard from "./components/userdashboard";
import EmployeeDashboard from "./components/employeedashboard";
import ProtectedRoute from "./routes/protectedroutes";
import PublicRoute from "./routes/publicroutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        <Route
          path="/userdashboard"
          element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>}
        />
        <Route
          path="/employeedashboard"
          element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>}
        />
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}
export default App;